const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const { Match, Admin } = require('./database');
const { Op } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret_key_vital',
    resave: false,
    saveUninitialized: true
}));

function createSlug(home, away) {
    return `${home.toLowerCase()}-vs-${away.toLowerCase()}-prediction-${Date.now()}`.replace(/[^a-z0-9]/g, '-');
}

// --- PUBLIC ROUTES ---

// 1. Homepage (Only show upcoming matches)
app.get('/', async (req, res) => {
    try {
        const matches = await Match.findAll({
            where: { status: 'upcoming' }, // Only show games not played yet
            order: [['match_date', 'ASC']]
        });
        res.render('index', { matches });
    } catch (err) {
        res.send("Error loading matches.");
    }
});

// 2. Results Page (NEW)
app.get('/results', async (req, res) => {
    try {
        const matches = await Match.findAll({
            where: { status: 'finished' }, // Only show finished games
            order: [['match_date', 'DESC']]
        });
        res.render('results', { matches });
    } catch (err) {
        res.send("Error loading results.");
    }
});

// 3. Match Detail
app.get('/prediction/:slug', async (req, res) => {
    try {
        const match = await Match.findOne({ where: { slug: req.params.slug } });
        if (!match) return res.send("Match not found");
        res.render('match-detail', { match });
    } catch (err) {
        res.send("Error loading page.");
    }
});

// --- ADMIN ROUTES ---

app.get('/admin/login', (req, res) => res.render('admin/login'));

app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        req.session.isLoggedIn = true;
        res.redirect('/admin/dashboard');
    } else {
        res.send("Wrong password. <a href='/admin/login'>Try again</a>");
    }
});

const requireLogin = (req, res, next) => {
    if (!req.session.isLoggedIn) return res.redirect('/admin/login');
    next();
};

// Admin Dashboard (Shows ALL matches to edit them)
app.get('/admin/dashboard', requireLogin, async (req, res) => {
    const matches = await Match.findAll({ order: [['match_date', 'DESC']] });
    res.render('admin/dashboard', { matches });
});

app.get('/admin/add', requireLogin, (req, res) => res.render('admin/add-match'));

app.post('/admin/add', requireLogin, async (req, res) => {
    try {
        const { league, match_date, home_team, away_team, home_form, away_form, analysis, prediction, confidence, affiliate_link } = req.body;
        
        await Match.create({
            league, home_team, away_team,
            match_date, home_form, away_form,
            analysis, prediction, confidence, affiliate_link,
            slug: createSlug(home_team, away_team),
            status: 'upcoming'
        });
        
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.log(err);
        res.send("Error saving match.");
    }
});

// Route to Save Result (NEW)
app.post('/admin/update-result', requireLogin, async (req, res) => {
    try {
        const { match_id, result_score, bet_status } = req.body;
        await Match.update(
            { result_score, bet_status, status: 'finished' },
            { where: { id: match_id } }
        );
        res.redirect('/admin/dashboard');
    } catch (err) {
        res.send("Error updating result.");
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
