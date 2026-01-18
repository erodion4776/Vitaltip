const Sequelize = require('sequelize');
const path = require('path');

// Setup SQLite Database
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
});

// The Match Model
const Match = sequelize.define('Match', {
    league: { type: Sequelize.STRING, allowNull: false },
    home_team: { type: Sequelize.STRING, allowNull: false },
    away_team: { type: Sequelize.STRING, allowNull: false },
    match_date: { type: Sequelize.DATE, allowNull: false },
    
    // Stats & Form
    home_form: { type: Sequelize.STRING }, 
    away_form: { type: Sequelize.STRING },
    
    // Prediction Content
    analysis: { type: Sequelize.TEXT }, 
    prediction: { type: Sequelize.STRING, allowNull: false }, 
    confidence: { type: Sequelize.INTEGER }, 
    
    // SEO & Money
    slug: { type: Sequelize.STRING, unique: true }, 
    affiliate_link: { type: Sequelize.STRING },
    
    // --- NEW COLUMNS FOR RESULTS ---
    status: { type: Sequelize.STRING, defaultValue: 'upcoming' }, // 'upcoming' or 'finished'
    result_score: { type: Sequelize.STRING }, // e.g., "2-1"
    bet_status: { type: Sequelize.STRING } // 'won', 'lost', or 'void'
});

// The Admin Model
const Admin = sequelize.define('Admin', {
    username: { type: Sequelize.STRING, unique: true },
    password: { type: Sequelize.STRING }
});

// Sync Database (alter: true updates the table if you added new columns)
sequelize.sync({ alter: true }).then(() => {
    console.log("Database & Tables updated successfully!");
});

module.exports = { sequelize, Match, Admin };
