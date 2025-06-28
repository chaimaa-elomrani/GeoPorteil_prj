const rateLimit = require('express-rate-limit');

// Rate limiting pour les tentatives de login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives par IP
    message: {
        success: false,
        message: "Trop de tentatives de connexion. Réessayez dans 15 minutes.",
        retryAfter: 15 * 60 // en secondes
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Personnaliser la clé pour inclure l'email
    keyGenerator: (req) => {
        return `${req.ip}-${req.body.email || 'unknown'}`;
    },
    // Skip les requêtes réussies
    skipSuccessfulRequests: true
});

module.exports = loginLimiter;