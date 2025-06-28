const path = require('path');
const securityLogger = require('./securityLogger');

const fileAccessControl = (req, res, next) => {
    const requestedPath = req.path;
    const ip = req.ip || req.connection.remoteAddress;
    
    // Chemins interdits
    const forbiddenPaths = [
        '/.env',
        '/config/',
        '/logs/',
        '/.git/',
        '/node_modules/',
        '/package.json',
        '/package-lock.json'
    ];

    // Extensions de fichiers sensibles
    const forbiddenExtensions = ['.env', '.log', '.key', '.pem', '.p12'];

    // Vérifier les chemins interdits
    const isForbiddenPath = forbiddenPaths.some(forbidden => 
        requestedPath.startsWith(forbidden)
    );

    // Vérifier les extensions interdites
    const fileExtension = path.extname(requestedPath);
    const isForbiddenExtension = forbiddenExtensions.includes(fileExtension);

    // Détecter les tentatives de directory traversal
    const hasDirectoryTraversal = requestedPath.includes('../') || 
                                 requestedPath.includes('..\\');

    if (isForbiddenPath || isForbiddenExtension || hasDirectoryTraversal) {
        // Logger l'activité suspecte
        securityLogger.logSuspiciousActivity('UNAUTHORIZED_FILE_ACCESS', {
            ip,
            requestedPath,
            userAgent: req.get('User-Agent'),
            referer: req.get('Referer')
        });

        return res.status(403).json({
            success: false,
            message: 'Accès interdit'
        });
    }

    next();
};

module.exports = fileAccessControl;