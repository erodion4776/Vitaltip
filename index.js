const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { sequelize, League, Team, Match } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', async (req, res) => {
    try {
        const matches = await Match.findAll({
            include: [
                { model: Team, as: 'HomeTeam' },
                { model: Team, as: 'AwayTeam' },
                { model: League }
            ],
            order: [['match_date', 'DESC']]
        });
        res.render('index', { matches, title: 'Expert Predictions' });
    } catch (err) {
        console.error("Home error:", err);
        res.status(500).send("Database Error: " + err.message);
    }
});

app.get('/admin/add', (req, res) => {
    res.render('admin/add-match');
});

app.post('/admin/add', async (req, res) => {
    try {
        const {
            league_name,
            match_date,
            home_team_name,
            away_team_name,
            home_form,
            away_form,
            analysis_content,
            prediction_main,
            prediction_confidence,
            affiliate_link,
            result_score
        } = req.body;

        const [league] = await League.findOrCreate({
            where: { name: league_name },
            defaults: { country: 'International', slug: league_name.toLowerCase().replace(/\s+/g, '-') }
        });

        const [homeTeam] = await Team.findOrCreate({ where: { name: home_team_name } });
        const [awayTeam] = await Team.findOrCreate({ where: { name: away_team_name } });

        const slug = `${home_team_name}-vs-${away_team_name}-${Date.now()}`.toLowerCase().replace(/\s+/g, '-');

        await Match.create({
            home_team_id: homeTeam.id,
            away_team_id: awayTeam.id,
            league_id: league.id,
            match_date,
            status: result_score ? 'finished' : 'upcoming',
            home_form,
            away_form,
            analysis_content,
            prediction_main,
            prediction_confidence: parseInt(prediction_confidence),
            affiliate_link,
            result_score,
            slug
        });

        res.redirect('/');
    } catch (err) {
        console.error("POST /admin/add error:", err);
        res.status(400).send("Error: " + err.message);
    }
});

app.get('/setup', async (req, res) => {
    try {
        await sequelize.sync({ force: true });
        res.send("Database Sync Complete. <a href='/admin/add'>Add Prediction</a>");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Start Server
sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log("SERVER STARTED SUCCESSFULLY");
    });
}).catch(err => {
    console.error("Failed to sync database:", err);
});
