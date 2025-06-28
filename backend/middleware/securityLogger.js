const fs = require('fs').promises;
const path = require('path');

class SecurityLogger {
    constructor() {
        this.logFile = path.join(__dirname, '../logs/security.log');
        this.ensureLogDirectory();
    }

    async ensureLogDirectory() {
        const logDir = path.dirname(this.logFile);
        try {
            await fs.mkdir(logDir, { recursive: true });
        } catch (error) {
            console.error('Error creating log directory:', error);
        }
    }

    async log(event, details) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            event,
            ...details
        };

        const logLine = JSON.stringify(logEntry) + '\n';

        try {
            await fs.appendFile(this.logFile, logLine);
            console.log(`🔒 Security Log: ${event}`, details);
        } catch (error) {
            console.error('Error writing to security log:', error);
        }
    }

    // Méthodes spécifiques
    async logLoginAttempt(email, ip, userAgent, success, reason = null) {
        await this.log('LOGIN_ATTEMPT', {
            email,
            ip,
            userAgent,
            success,
            reason
        });
    }

    async logLoginSuccess(userId, email, ip, userAgent) {
        await this.log('LOGIN_SUCCESS', {
            userId,
            email,
            ip,
            userAgent
        });
    }

    async logLoginFailure(email, ip, userAgent, reason) {
        await this.log('LOGIN_FAILURE', {
            email,
            ip,
            userAgent,
            reason
        });
    }

    async logSuspiciousActivity(type, details) {
        await this.log('SUSPICIOUS_ACTIVITY', {
            type,
            ...details
        });
    }

    async logAdminAction(adminId, action, target, ip) {
        await this.log('ADMIN_ACTION', {
            adminId,
            action,
            target,
            ip
        });
    }
}

module.exports = new SecurityLogger();