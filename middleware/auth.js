
const logger = require('../utils/logger');

/**
 * Require admin login
 */
const requireLogin = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        req.flash('error', 'Please login to access this page');
        logger.warn(`Unauthorized access attempt to ${req.originalUrl} from IP: ${req.ip}`);
        return res.redirect('/admin/login');
    }
    next();
};

/**
 * Redirect if already logged in
 */
const redirectIfLoggedIn = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/admin/dashboard');
    }
    next();
};

/**
 * Set user data in response locals
 */
const setUserLocals = (req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn || false;
    res.locals.adminUser = req.session.adminUser || null;
    next();
};

/**
 * API authentication (for future API routes)
 */
const requireApiAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or missing API key'
        });
    }
    next();
};

module.exports = {
    requireLogin,
    redirectIfLoggedIn,
    setUserLocals,
    requireApiAuth
};
