const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        req.flash('error', errorMessages.join(', '));
        return res.redirect('back');
    }
    next();
};

/**
 * Match creation validation rules
 */
const validateMatch = [
    body('league')
        .trim()
        .notEmpty().withMessage('League is required')
        .isLength({ max: 100 }).withMessage('League name too long'),
    
    body('home_team')
        .trim()
        .notEmpty().withMessage('Home team is required')
        .isLength({ max: 100 }).withMessage('Home team name too long'),
    
    body('away_team')
        .trim()
        .notEmpty().withMessage('Away team is required')
        .isLength({ max: 100 }).withMessage('Away team name too long'),
    
    body('match_date')
        .notEmpty().withMessage('Match date is required')
        .isISO8601().withMessage('Invalid date format'),
    
    body('prediction')
        .trim()
        .notEmpty().withMessage('Prediction is required')
        .isLength({ max: 200 }).withMessage('Prediction too long'),
    
    body('confidence')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Confidence must be between 1 and 100'),
    
    body('home_logo')
        .optional()
        .isURL().withMessage('Invalid home logo URL'),
    
    body('away_logo')
        .optional()
        .isURL().withMessage('Invalid away logo URL'),
    
    body('analysis')
        .optional()
        .isLength({ max: 5000 }).withMessage('Analysis too long'),
    
    handleValidationErrors
];

/**
 * Result update validation rules
 */
const validateResult = [
    body('match_id')
        .notEmpty().withMessage('Match ID is required')
        .isInt().withMessage('Invalid match ID'),
    
    body('result_score')
        .trim()
        .notEmpty().withMessage('Result score is required')
        .matches(/^\d+-\d+$/).withMessage('Score must be in format X-X'),
    
    body('bet_status')
        .notEmpty().withMessage('Bet status is required')
        .isIn(['won', 'lost', 'void', 'push']).withMessage('Invalid bet status'),
    
    handleValidationErrors
];

/**
 * Bulk import validation
 */
const validateBulkImport = [
    body('jsonData')
        .notEmpty().withMessage('JSON data is required')
        .custom((value) => {
            try {
                const parsed = JSON.parse(value);
                if (!Array.isArray(parsed)) {
                    throw new Error('Data must be an array');
                }
                if (parsed.length > 50) {
                    throw new Error('Maximum 50 matches per import');
                }
                return true;
            } catch (err) {
                throw new Error('Invalid JSON format: ' + err.message);
            }
        }),
    
    handleValidationErrors
];

/**
 * Login validation rules
 */
const validateLogin = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ max: 50 }).withMessage('Username too long'),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ max: 100 }).withMessage('Password too long'),
    
    handleValidationErrors
];

/**
 * Slug parameter validation
 */
const validateSlug = [
    param('slug')
        .trim()
        .notEmpty().withMessage('Slug is required')
        .matches(/^[a-z0-9-]+$/).withMessage('Invalid slug format'),
    
    handleValidationErrors
];

/**
 * Pagination validation
 */
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Invalid page number'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    
    handleValidationErrors
];

module.exports = {
    validateMatch,
    validateResult,
    validateBulkImport,
    validateLogin,
    validateSlug,
    validatePagination,
    handleValidationErrors
};
