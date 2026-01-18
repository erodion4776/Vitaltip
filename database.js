const { Sequelize, DataTypes } = require('sequelize');
const logger = require('./utils/logger');

// Initialize Sequelize
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DATABASE_URL || './database.sqlite',
    logging: (msg) => logger.debug(msg),
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Match Model
const Match = sequelize.define('Match', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    league: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    home_team: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    away_team: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    home_logo: {
        type: DataTypes.STRING(500),
        defaultValue: ''
    },
    away_logo: {
        type: DataTypes.STRING(500),
        defaultValue: ''
    },
    match_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    home_form: {
        type: DataTypes.STRING(50),
        defaultValue: 'N/A'
    },
    away_form: {
        type: DataTypes.STRING(50),
        defaultValue: 'N/A'
    },
    analysis: {
        type: DataTypes.TEXT,
        defaultValue: ''
    },
    prediction: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    odds: {
        type: DataTypes.STRING(50),
        defaultValue: ''
    },
    confidence: {
        type: DataTypes.INTEGER,
        defaultValue: 70,
        validate: {
            min: 1,
            max: 100
        }
    },
    result_score: {
        type: DataTypes.STRING(20),
        defaultValue: null
    },
    bet_status: {
        type: DataTypes.ENUM('pending', 'won', 'lost', 'void', 'push'),
        defaultValue: 'pending'
    },
    status: {
        type: DataTypes.ENUM('upcoming', 'live', 'finished'),
        defaultValue: 'upcoming'
    },
    slug: {
        type: DataTypes.STRING(300),
        unique: true,
        allowNull: false
    },
    affiliate_link: {
        type: DataTypes.STRING(500),
        defaultValue: ''
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'matches',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['status'] },
        { fields: ['match_date'] },
        { fields: ['league'] },
        { fields: ['slug'], unique: true }
    ]
});

// Admin Model
const Admin = sequelize.define('Admin', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: true
    },
    last_login: {
        type: DataTypes.DATE,
        defaultValue: null
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'admins',
    timestamps: true
});

// Sync database
const syncDatabase = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Database connection established successfully.');
        
        await sequelize.sync({ alter: true });
        logger.info('Database synchronized.');
    } catch (error) {
        logger.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

module.exports = {
    sequelize,
    Match,
    Admin,
    syncDatabase
};
