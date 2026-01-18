const { Match } = require('../database');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const helpers = require('../utils/helpers');
const logger = require('../utils/logger');
const config = require('../config/config');

/**
 * Get admin dashboard
 */
const getDashboard = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const filter = req.query.filter || 'all';
    
    // Build where clause based on filter
    let whereClause = {};
    if (filter === 'upcoming') {
        whereClause.status = 'upcoming';
    } else if (filter === 'finished') {
        whereClause.status = 'finished';
    }
    
    const { count, rows: matches } = await Match.findAndCountAll({
        where: whereClause,
        order: [['match_date', 'DESC']],
        limit,
        offset
    });
    
    // Get statistics
    const stats = {
        total: await Match.count(),
        upcoming: await Match.count({ where: { status: 'upcoming' } }),
        finished: await Match.count({ where: { status: 'finished' } }),
        won: await Match.count({ where: { bet_status: 'won' } }),
        lost: await Match.count({ where: { bet_status: 'lost' } })
    };
    
    const pagination = helpers.paginate(count, page, limit);
    
    res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        matches,
        stats,
        pagination,
        filter,
        helpers
    });
});

/**
 * Get add match page
 */
const getAddMatch = (req, res) => {
    res.render('admin/add-match', {
        title: 'Add New Match',
        leagues: getLeaguesList()
    });
};

/**
 * Create new match
 */
const createMatch = asyncHandler(async (req, res) => {
    const {
        league,
        match_date,
        home_team,
        away_team,
        home_logo,
        away_logo,
        home_form,
        away_form,
        analysis,
        prediction,
        confidence,
        affiliate_link,
        odds
    } = req.body;
    
    // Sanitize inputs
    const sanitizedData = {
        league: helpers.sanitizeInput(league),
        home_team: helpers.sanitizeInput(home_team),
        away_team: helpers.sanitizeInput(away_team),
        match_date: new Date(match_date),
        home_logo: helpers.sanitizeInput(home_logo) || '',
        away_logo: helpers.sanitizeInput(away_logo) || '',
        home_form: helpers.sanitizeInput(home_form) || 'N/A',
        away_form: helpers.sanitizeInput(away_form) || 'N/A',
        analysis: helpers.sanitizeInput(analysis) || '',
        prediction: helpers.sanitizeInput(prediction),
        confidence: parseInt(confidence) || 70,
        affiliate_link: helpers.sanitizeInput(affiliate_link) || '',
        odds: helpers.sanitizeInput(odds) || '',
        slug: helpers.createSlug(home_team, away_team),
        status: 'upcoming',
        views: 0
    };
    
    const match = await Match.create(sanitizedData);
    
    logger.info(`Match created: ${match.home_team} vs ${match.away_team} (ID: ${match.id})`);
    
    req.flash('success', 'Match added successfully!');
    res.redirect('/admin/dashboard');
});

/**
 * Get edit match page
 */
const getEditMatch = asyncHandler(async (req, res) => {
    const match = await Match.findByPk(req.params.id);
    
    if (!match) {
        throw new AppError('Match not found', 404);
    }
    
    res.render('admin/edit-match', {
        title: 'Edit Match',
        match,
        leagues: getLeaguesList()
    });
});

/**
 * Update match
 */
const updateMatch = asyncHandler(async (req, res) => {
    const match = await Match.findByPk(req.params.id);
    
    if (!match) {
        throw new AppError('Match not found', 404);
    }
    
    const updateData = {
        league: helpers.sanitizeInput(req.body.league),
        home_team: helpers.sanitizeInput(req.body.home_team),
        away_team: helpers.sanitizeInput(req.body.away_team),
        match_date: new Date(req.body.match_date),
        home_logo: helpers.sanitizeInput(req.body.home_logo),
        away_logo: helpers.sanitizeInput(req.body.away_logo),
        home_form: helpers.sanitizeInput(req.body.home_form),
        away_form: helpers.sanitizeInput(req.body.away_form),
        analysis: helpers.sanitizeInput(req.body.analysis),
        prediction: helpers.sanitizeInput(req.body.prediction),
        confidence: parseInt(req.body.confidence),
        affiliate_link: helpers.sanitizeInput(req.body.affiliate_link),
        odds: helpers.sanitizeInput(req.body.odds)
    };
    
    await match.update(updateData);
    
    logger.info(`Match updated: ID ${match.id}`);
    
    req.flash('success', 'Match updated successfully!');
    res.redirect('/admin/dashboard');
});

/**
 * Update match result
 */
const updateResult = asyncHandler(async (req, res) => {
    const { match_id, result_score, bet_status } = req.body;
    
    const match = await Match.findByPk(match_id);
    
    if (!match) {
        throw new AppError('Match not found', 404);
    }
    
    await match.update({
        result_score: helpers.sanitizeInput(result_score),
        bet_status,
        status: 'finished'
    });
    
    logger.info(`Result updated for match ID ${match_id}: ${result_score} - ${bet_status}`);
    
    req.flash('success', 'Result updated successfully!');
    res.redirect('/admin/dashboard');
});

/**
 * Delete match
 */
const deleteMatch = asyncHandler(async (req, res) => {
    const match = await Match.findByPk(req.params.id);
    
    if (!match) {
        throw new AppError('Match not found', 404);
    }
    
    await match.destroy();
    
    logger.info(`Match deleted: ID ${req.params.id}`);
    
    req.flash('success', 'Match deleted successfully!');
    res.redirect('/admin/dashboard');
});

/**
 * Get bulk import page
 */
const getBulkImport = (req, res) => {
    res.render('admin/bulk-import', {
        title: 'Bulk Import Matches',
        maxImport: config.app.maxBulkImport
    });
};

/**
 * Process bulk import
 */
const processBulkImport = asyncHandler(async (req, res) => {
    const matches = JSON.parse(req.body.jsonData);
    
    if (matches.length > config.app.maxBulkImport) {
        throw new AppError(`Maximum ${config.app.maxBulkImport} matches allowed per import`, 400);
    }
    
    let imported = 0;
    const errors = [];
    
    for (const matchData of matches) {
        try {
            await Match.create({
                league: helpers.sanitizeInput(matchData.league) || 'Unknown',
                home_team: helpers.sanitizeInput(matchData.home_team),
                away_team: helpers.sanitizeInput(matchData.away_team),
                home_logo: matchData.home_logo || '',
                away_logo: matchData.away_logo || '',
                match_date: new Date(matchData.match_date) || new Date(),
                home_form: matchData.home_form || 'N/A',
                away_form: matchData.away_form || 'N/A',
                analysis: helpers.sanitizeInput(matchData.analysis) || '',
                prediction: helpers.sanitizeInput(matchData.prediction),
                confidence: parseInt(matchData.confidence) || 70,
                odds: matchData.odds || '',
                slug: helpers.createSlug(matchData.home_team, matchData.away_team),
                status: 'upcoming',
                views: 0
            });
            imported++;
        } catch (err) {
            errors.push(`${matchData.home_team} vs ${matchData.away_team}: ${err.message}`);
        }
    }
    
    logger.info(`Bulk import completed: ${imported}/${matches.length} matches imported`);
    
    if (errors.length > 0) {
        req.flash('warning', `Imported ${imported} matches. Errors: ${errors.join('; ')}`);
    } else {
        req.flash('success', `Successfully imported ${imported} matches!`);
    }
    
    res.redirect('/admin/dashboard');
});

/**
 * Get list of popular leagues
 */
function getLeaguesList() {
    return [
        'Premier League',
        'La Liga',
        'Serie A',
        'Bundesliga',
        'Ligue 1',
        'Champions League',
        'Europa League',
        'MLS',
        'Eredivisie',
        'Primeira Liga',
        'Scottish Premiership',
        'Championship',
        'World Cup',
        'Euro Championship',
        'Copa America',
        'Africa Cup of Nations'
    ];
}

module.exports = {
    getDashboard,
    getAddMatch,
    createMatch,
    getEditMatch,
    updateMatch,
    updateResult,
    deleteMatch,
    getBulkImport,
    processBulkImport
};
