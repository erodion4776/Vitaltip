const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { validateSlug, validatePagination } = require('../middleware/validator');

// Homepage - Upcoming predictions
router.get('/', validatePagination, matchController.getHomepage);

// Results page
router.get('/results', validatePagination, matchController.getResults);

// Match detail page
router.get('/prediction/:slug', validateSlug, matchController.getMatchDetail);

// Search API
router.get('/api/search', matchController.searchMatches);

// Static pages
router.get('/about', (req, res) => {
    res.render('pages/about', {
        title: 'About Us',
        description: 'Learn more about Vital Tips Pro and our prediction methodology'
    });
});

router.get('/contact', (req, res) => {
    res.render('pages/contact', {
        title: 'Contact Us',
        description: 'Get in touch with our team'
    });
});

router.get('/faq', (req, res) => {
    res.render('pages/faq', {
        title: 'FAQ',
        description: 'Frequently asked questions about our predictions'
    });
});

module.exports = router;
