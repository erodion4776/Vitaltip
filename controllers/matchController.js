const { Match } = require('../database');
const { Op } = require('sequelize');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const helpers = require('../utils/helpers');
const logger = require('../utils/logger');
const config = require('../config/config');

/**
 * Get homepage with upcoming matches
 */
const getHomepage = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = config.app.resultsPerPage;
    const offset = (page - 1) * limit;
    
    const { count, rows: matches } = await Match.findAndCountAll({
        where: { status: 'upcoming' },
        order: [['match_date', 'ASC']],
        limit,
        offset
    });
    
    const pagination = helpers.paginate(count, page, limit);
    
    // Get stats for display
    const stats = await getStats();
    
    res.render('pages/index', {
        title: `${config.app.name} - Premium Football Predictions`,
        description: config.app.description,
        matches,
        pagination,
        stats,
        helpers
    });
});

/**
 * Get results page
 */
const getResults = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = config.app.resultsPerPage;
    const offset = (page - 1) * limit;
    
    const { count, rows: matches } = await Match.findAndCountAll({
        where: { status: 'finished' },
        order: [['match_date', 'DESC']],
        limit,
        offset
    });
    
    const pagination = helpers.paginate(count, page, limit);
    const winRate = helpers.calculateWinRate(matches);
    
    res.render('pages/results', {
        title: 'Results - ' + config.app.name,
        description: 'View our prediction results and track record',
        matches,
        pagination,
        winRate,
        helpers
    });
});

/**
 * Get single match detail
 */
const getMatchDetail = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    
    const match = await Match.findOne({
        where: { slug }
    });
    
    if (!match) {
        throw new AppError('Match not found', 404);
    }
    
    // Get related matches (same league)
    const relatedMatches = await Match.findAll({
        where: {
            league: match.league,
            id: { [Op.ne]: match.id },
            status: 'upcoming'
        },
        limit: 4,
        order: [['match_date', 'ASC']]
    });
    
    // Increment view count (optional)
    await match.increment('views');
    
    res.render('pages/match-detail', {
        title: `${match.home_team} vs ${match.away_team} Prediction`,
        description: `Expert prediction and analysis for ${match.home_team} vs ${match.away_team} in ${match.league}`,
        match,
        relatedMatches,
        helpers,
        confidenceInfo: helpers.getConfidenceLabel(match.confidence)
    });
});

/**
 * Get statistics
 */
const getStats = async () => {
    const totalMatches = await Match.count({ where: { status: 'finished' } });
    const wonMatches = await Match.count({ 
        where: { status: 'finished', bet_status: 'won' } 
    });
    const upcomingMatches = await Match.count({ where: { status: 'upcoming' } });
    
    return {
        total: totalMatches,
        won: wonMatches,
        upcoming: upcomingMatches,
        winRate: totalMatches > 0 ? Math.round((wonMatches / totalMatches) * 100) : 0
    };
};

/**
 * Search matches
 */
const searchMatches = asyncHandler(async (req, res) => {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
        return res.json({ success: true, matches: [] });
    }
    
    const matches = await Match.findAll({
        where: {
            [Op.or]: [
                { home_team: { [Op.like]: `%${q}%` } },
                { away_team: { [Op.like]: `%${q}%` } },
                { league: { [Op.like]: `%${q}%` } }
            ]
        },
        limit: 10,
        order: [['match_date', 'DESC']]
    });
    
    res.json({ success: true, matches });
});

module.exports = {
    getHomepage,
    getResults,
    getMatchDetail,
    getStats,
    searchMatches
};
