const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const { Match, Admin } = require('./database');
const { Op } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'vital_tips_secret',
    resave: false,
    saveUninitialized: true
}));

// SEO Slug Generator
function createSlug(home, away) {
    return `${home.toLowerCase()}-vs-${away.toLowerCase()}-prediction-${Date.now()}`.replace(/[^a-z0-9]/g, '-');
}

// --- PUBLIC ROUTES ---

app.get('/', async (req, res) => {
    try {
        const matches = await Match.findAll({
            where: { status: 'upcoming' },
            order: [['match_date', 'ASC']]
        });
        res.render('index', { matches });
    } catch (err) { res.send("Error loading home."); }
});

app.get('/results', async (req, res) => {
    try {
        const matches = await Match.findAll({
            where: { status: 'finished' },
            order: [['match_date', 'DESC']],
            limit: 50
        });
        res.render('results', { matches });
    } catch (err) { res.send("Error loading results."); }
});

app.get('/prediction/:slug', async (req, res) => {
    try {
        const match = await Match.findOne({ where: { slug: req.params.slug } });
        if (!match) return res.redirect('/');
        res.render('match-detail', { match });
    } catch (err) { res.redirect('/'); }
});

// --- ADMIN ROUTES ---

app.get('/admin/login', (req, res) => res.render('admin/login'));

app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        req.session.isLoggedIn = true;
        res.redirect('/admin/dashboard');
    } else {
        res.send("Wrong credentials.");
    }
});

const requireLogin = (req, res, next) => {
    if (!req.session.isLoggedIn) return res.redirect('/admin/login');
    next();
};

app.get('/admin/dashboard', requireLogin, async (req, res) => {
    const matches = await Match.findAll({ order: [['match_date', 'DESC']], limit: 100 });
    res.render('admin/dashboard', { matches });
});

app.get('/admin/add', requireLogin, (req, res) => res.render('admin/add-match'));

// Add Single Match
app.post('/admin/add', requireLogin, async (req, res) => {
    try {
        const { league, match_date, home_team, away_team, home_logo, away_logo, home_form, away_form, analysis, prediction, confidence, affiliate_link } = req.body;
        await Match.create({
            league, home_team, away_team, match_date, home_logo, away_logo,
            home_form, away_form, analysis, prediction, confidence, affiliate_link,
            slug: createSlug(home_team, away_team), status: 'upcoming'
        });
        res.redirect('/admin/dashboard');
    } catch (err) { res.send("Error saving."); }
});

// Update Result
app.post('/admin/update-result', requireLogin, async (req, res) => {
    try {
        const { match_id, result_score, bet_status } = req.body;
        await Match.update(
            { result_score, bet_status, status: 'finished' },
            { where: { id: match_id } }
        );
        res.redirect('/admin/dashboard');
    } catch (err) { res.send("Error updating."); }
});

// --- BULK IMPORT (AI Feature) ---
app.get('/admin/bulk', requireLogin, (req, res) => res.render('admin/bulk-import'));

app.post('/admin/bulk-import', requireLogin, async (req, res) => {
    try {
        const matches = JSON.parse(req.body.jsonData);
        for (const match of matches) {
            await Match.create({
                league: match.league,
                home_team: match.home_team,
                away_team: match.away_team,
                home_logo: match.home_logo || '',
                away_logo: match.away_logo || '',
                match_date: match.match_date || new Date(),
                home_form: match.home_form || '?',
                away_form: match.away_form || '?',
                analysis: match.analysis || 'Detailed analysis coming soon.',
                prediction: match.prediction,
                confidence: match.confidence || 70,
                slug: createSlug(match.home_team, match.away_team),
                status: 'upcoming'
            });
        }
        res.redirect('/admin/dashboard');
    } catch (err) { res.send("Import Error: " + err.message); }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
