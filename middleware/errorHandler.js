const logger = require('../utils/logger');
const config = require('../config/config');

/**
 * Custom error class
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
    logger.warn(`404 - Page not found: ${req.originalUrl}`);
    res.status(404).render('errors/404', {
        title: 'Page Not Found',
        message: 'The page you are looking for does not exist.',
        url: req.originalUrl
    });
};

/**
 * Global error handler
 */
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    
    // Log the error
    logger.error({
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
    });
    
    // Development: Show detailed error
    if (config.nodeEnv === 'development') {
        return res.status(err.statusCode).render('errors/500', {
            title: 'Error',
            message: err.message,
            stack: err.stack,
            error: err
        });
    }
    
    // Production: Show generic error
    if (err.isOperational) {
        return res.status(err.statusCode).render('errors/500', {
            title: 'Error',
            message: err.message,
            stack: null,
            error: null
        });
    }
    
    // Unknown error - don't leak details
    res.status(500).render('errors/500', {
        title: 'Server Error',
        message: 'Something went wrong. Please try again later.',
        stack: null,
        error: null
    });
};

/**
 * Async error wrapper
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    AppError,
    notFoundHandler,
    globalErrorHandler,
    asyncHandler
};
