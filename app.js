require('dotenv').config();
require('express-async-errors');

const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const ejsMate = require('ejs-mate');

// Import modules
const config = require('./config/config');
const logger = require('./utils/logger');
const { syncDatabase } = require('./database');
const { setUserLocals } = require('./middleware/auth');
const { generalLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');
const helpers = require('./utils/helpers');

// Import routes
const publicRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');

// Initialize Express
const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// View engine setup
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
        }
    }
}));

// Compression
app.use(compression());

// Request logging
if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', { stream: logger.stream }));
}

// Static files
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: config.nodeEnv === 'production' ? '1d' : 0
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
    name: config.session.name,
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: config.session.cookie
}));

// Flash messages
app.use(flash());

// Rate limiting
app.use(generalLimiter);

// Set local variables
app.use(setUserLocals);
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.warning = req.flash('warning');
    res.locals.currentPath = req.path;
    res.locals.config = config.app;
    res.locals.helpers = helpers;
    next();
});

// Routes
app.use('/', publicRoutes);
app.use('/admin', adminRoutes);

// 404 Handler
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

// Start server
const startServer = async () => {
    try {
        // Sync database
        await syncDatabase();
        
        // Start listening
        app.listen(config.port, () => {
            logger.info(`🚀 ${config.app.name} is running on port ${config.port}`);
            logger.info(`📍 Environment: ${config.nodeEnv}`);
            logger.info(`🌐 URL: http://localhost:${config.port}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    logger.error('Unhandled Rejection:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

startServer();

module.exports = app;
