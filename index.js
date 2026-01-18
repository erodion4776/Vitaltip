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

// Helper: Convert text to SEO Slug
function createSlug(home, away) {
    return `${home.toLowerCase()}-vs-${away.toLowerCase()}-prediction-${Date.now()}`.replace(/ /g, '-');
}

// --- PUBLIC ROUTES ---

// 1. Homepage
app.get('/', async (req, res) => {
    try {
        const matches = await Match.findAll({
            order: [['match_date', 'ASC']]
        });
        res.render('index', { matches });
    } catch (err) {
        res.send("Error loading matches.");
    }
});

// 2. Match Detail (SEO Page)
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

// 3. Admin Login Page
app.get('/admin/login', (req, res) => res.render('admin/login'));

// 4. Admin Login Logic (Simple hardcoded for MVP)
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    // CHANGE THIS PASSWORD LATER
    if (username === 'admin' && password === 'admin123') {
        req.session.isLoggedIn = true;
        res.redirect('/admin/dashboard');
    } else {
        res.send("Wrong password. <a href='/admin/login'>Try again</a>");
    }
});

// Middleware to protect admin pages
const requireLogin = (req, res, next) => {
    if (!req.session.isLoggedIn) return res.redirect('/admin/login');
    next();
};

// 5. Admin Dashboard
app.get('/admin/dashboard', requireLogin, async (req, res) => {
    const matches = await Match.findAll({ order: [['createdAt', 'DESC']] });
    res.render('admin/dashboard', { matches });
});

// 6. Add Match Page
app.get('/admin/add', requireLogin, (req, res) => {
    res.render('admin/add-match');
});

// 7. Save New Match
app.post('/admin/add', requireLogin, async (req, res) => {
    try {
        const { league, match_date, home_team, away_team, home_form, away_form, analysis, prediction, confidence, affiliate_link } = req.body;
        
        await Match.create({
            league, home_team, away_team,
            match_date, home_form, away_form,
            analysis, prediction, confidence, affiliate_link,
            slug: createSlug(home_team, away_team)
        });
        
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.log(err);
        res.send("Error saving match.");
    }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
