const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const { requireLogin, redirectIfLoggedIn } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');
const { 
    validateLogin, 
    validateMatch, 
    validateResult, 
    validateBulkImport 
} = require('../middleware/validator');

// Authentication routes
router.get('/login', redirectIfLoggedIn, authController.getLogin);
router.post('/login', loginLimiter, validateLogin, authController.postLogin);
router.post('/logout', authController.postLogout);

// Dashboard
router.get('/dashboard', requireLogin, adminController.getDashboard);

// Match management
router.get('/add', requireLogin, adminController.getAddMatch);
router.post('/add', requireLogin, validateMatch, adminController.createMatch);

router.get('/edit/:id', requireLogin, adminController.getEditMatch);
router.post('/edit/:id', requireLogin, validateMatch, adminController.updateMatch);

router.post('/update-result', requireLogin, validateResult, adminController.updateResult);

router.post('/delete/:id', requireLogin, adminController.deleteMatch);

// Bulk import
router.get('/bulk', requireLogin, adminController.getBulkImport);
router.post('/bulk-import', requireLogin, validateBulkImport, adminController.processBulkImport);

module.exports = router;
