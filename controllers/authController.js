const bcrypt = require('bcryptjs');
const config = require('../config/config');
const logger = require('../utils/logger');

/**
 * Get login page
 */
const getLogin = (req, res) => {
    res.render('admin/login', {
        title: 'Admin Login',
        error: req.flash('error'),
        success: req.flash('success')
    });
};

/**
 * Process login
 */
const postLogin = async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Validate credentials
        const isValidUsername = username === config.admin.username;
        
        // For development - use plain password comparison
        // For production - use bcrypt comparison
        let isValidPassword = false;
        
        if (config.nodeEnv === 'development') {
            // Development: simple comparison (change to your dev password)
            isValidPassword = password === 'admin123';
        } else {
            // Production: bcrypt comparison
            isValidPassword = await bcrypt.compare(password, config.admin.passwordHash);
        }
        
        if (isValidUsername && isValidPassword) {
            // Set session
            req.session.isLoggedIn = true;
            req.session.adminUser = {
                username,
                loginTime: new Date()
            };
            
            // Regenerate session ID for security
            req.session.regenerate((err) => {
                if (err) {
                    logger.error('Session regeneration error:', err);
                }
                
                req.session.isLoggedIn = true;
                req.session.adminUser = { username, loginTime: new Date() };
                
                logger.info(`Admin login successful: ${username} from IP: ${req.ip}`);
                
                req.flash('success', 'Welcome back, Admin!');
                res.redirect('/admin/dashboard');
            });
        } else {
            logger.warn(`Failed login attempt for username: ${username} from IP: ${req.ip}`);
            
            req.flash('error', 'Invalid username or password');
            res.redirect('/admin/login');
        }
    } catch (error) {
        logger.error('Login error:', error);
        req.flash('error', 'An error occurred during login');
        res.redirect('/admin/login');
    }
};

/**
 * Process logout
 */
const postLogout = (req, res) => {
    const username = req.session.adminUser?.username || 'Unknown';
    
    req.session.destroy((err) => {
        if (err) {
            logger.error('Logout error:', err);
        }
        
        logger.info(`Admin logout: ${username}`);
        res.redirect('/admin/login');
    });
};

/**
 * Generate password hash (utility)
 */
const generatePasswordHash = async (password) => {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
};

module.exports = {
    getLogin,
    postLogin,
    postLogout,
    generatePasswordHash
};
