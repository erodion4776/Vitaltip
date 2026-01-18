const sanitizeHtml = require('sanitize-html');
const moment = require('moment');

/**
 * Generate SEO-friendly slug
 */
function createSlug(homeTeam, awayTeam) {
    const timestamp = Date.now();
    const slug = `${homeTeam}-vs-${awayTeam}-prediction-${timestamp}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return slug;
}

/**
 * Sanitize user input to prevent XSS
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return sanitizeHtml(input, {
        allowedTags: [],
        allowedAttributes: {}
    }).trim();
}

/**
 * Format date for display
 */
function formatDate(date, format = 'MMM DD, YYYY') {
    return moment(date).format(format);
}

/**
 * Format date relative to now
 */
function timeFromNow(date) {
    return moment(date).fromNow();
}

/**
 * Check if match is live (within 2 hours of start time)
 */
function isMatchLive(matchDate) {
    const now = moment();
    const matchTime = moment(matchDate);
    const diffMinutes = now.diff(matchTime, 'minutes');
    return diffMinutes >= 0 && diffMinutes <= 120;
}

/**
 * Calculate win rate from results
 */
function calculateWinRate(matches) {
    if (!matches.length) return 0;
    const wins = matches.filter(m => m.bet_status === 'won').length;
    return Math.round((wins / matches.length) * 100);
}

/**
 * Generate pagination data
 */
function paginate(totalItems, currentPage, perPage) {
    const totalPages = Math.ceil(totalItems / perPage);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;
    
    return {
        totalItems,
        totalPages,
        currentPage,
        perPage,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? currentPage + 1 : null,
        prevPage: hasPrevPage ? currentPage - 1 : null
    };
}

/**
 * Get confidence level label
 */
function getConfidenceLabel(confidence) {
    if (confidence >= 85) return { label: 'Very High', class: 'success' };
    if (confidence >= 70) return { label: 'High', class: 'primary' };
    if (confidence >= 55) return { label: 'Medium', class: 'warning' };
    return { label: 'Low', class: 'danger' };
}

/**
 * Validate URL format
 */
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

module.exports = {
    createSlug,
    sanitizeInput,
    formatDate,
    timeFromNow,
    isMatchLive,
    calculateWinRate,
    paginate,
    getConfidenceLabel,
    isValidUrl
};
