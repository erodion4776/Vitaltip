const Sequelize = require('sequelize');
const path = require('path');

// Setup SQLite Database
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
});

// 1. The Match Model (Stores your predictions)
const Match = sequelize.define('Match', {
    league: { type: Sequelize.STRING, allowNull: false },
    home_team: { type: Sequelize.STRING, allowNull: false },
    away_team: { type: Sequelize.STRING, allowNull: false },
    match_date: { type: Sequelize.DATE, allowNull: false },
    
    // Stats & Form
    home_form: { type: Sequelize.STRING }, // e.g., "W W D L W"
    away_form: { type: Sequelize.STRING },
    head_to_head: { type: Sequelize.TEXT }, // Manual notes
    
    // Prediction Content
    analysis: { type: Sequelize.TEXT }, // Long explanation
    prediction: { type: Sequelize.STRING, allowNull: false }, // e.g., "Over 2.5 Goals"
    confidence: { type: Sequelize.INTEGER }, // 1-100
    
    // SEO & Money
    slug: { type: Sequelize.STRING, unique: true }, // e.g. "arsenal-vs-chelsea-prediction"
    affiliate_link: { type: Sequelize.STRING },
    
    // Results
    status: { type: Sequelize.STRING, defaultValue: 'upcoming' }, // upcoming, finished
    result_score: { type: Sequelize.STRING } // e.g. "2-1"
});

// 2. The Admin Model (For security)
const Admin = sequelize.define('Admin', {
    username: { type: Sequelize.STRING, unique: true },
    password: { type: Sequelize.STRING }
});

// Sync Database
sequelize.sync().then(() => {
    console.log("Database & Tables created!");
});

module.exports = { sequelize, Match, Admin };
