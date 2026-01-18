const Sequelize = require('sequelize');
const path = require('path');

// Setup SQLite Database
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
});

const Match = sequelize.define('Match', {
    // Basic Info
    league: { type: Sequelize.STRING, allowNull: false },
    home_team: { type: Sequelize.STRING, allowNull: false },
    away_team: { type: Sequelize.STRING, allowNull: false },
    match_date: { type: Sequelize.DATE, allowNull: false },
    
    // Visuals (New)
    home_logo: { type: Sequelize.STRING },
    away_logo: { type: Sequelize.STRING },
    
    // Stats & Content
    home_form: { type: Sequelize.STRING }, 
    away_form: { type: Sequelize.STRING },
    analysis: { type: Sequelize.TEXT }, 
    prediction: { type: Sequelize.STRING, allowNull: false }, 
    confidence: { type: Sequelize.INTEGER }, 
    
    // System
    slug: { type: Sequelize.STRING, unique: true }, 
    affiliate_link: { type: Sequelize.STRING },
    
    // Results
    status: { type: Sequelize.STRING, defaultValue: 'upcoming' }, // upcoming, finished
    result_score: { type: Sequelize.STRING }, // e.g. "2-1"
    bet_status: { type: Sequelize.STRING } // won, lost, void
});

const Admin = sequelize.define('Admin', {
    username: { type: Sequelize.STRING, unique: true },
    password: { type: Sequelize.STRING }
});

// Update tables automatically
sequelize.sync({ alter: true }).then(() => {
    console.log("Database synced with Logos and Results support.");
});

module.exports = { sequelize, Match, Admin };
