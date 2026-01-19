require('dotenv').config();

module.exports = {
    // Server
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Session
    session: {
        secret: process.env.SESSION_SECRET || 'fallback-secret-change-me',
        name: 'vital_tips_session',
        cookie: {
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            httpOnly: true,
            // Changed to false to prevent login loops on some hosting
            secure: false, 
            // Changed to lax for better compatibility
            sameSite: 'lax'
        }
    },
    
    // Admin
    admin: {
        username: process.env.ADMIN_USERNAME || 'admin',
        passwordHash: process.env.ADMIN_PASSWORD_HASH
    },
    
    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    },
    
    // App Settings
    app: {
        name: 'Vital Tips Pro',
        description: 'Premium Football Predictions & Analysis',
        resultsPerPage: 20,
        maxBulkImport: 50
    }
};
