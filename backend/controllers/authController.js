const { validationResult } = require('express-validator');
const User = require("../models/User");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const securityLogger = require('../middleware/securityLogger');

const authController = {
    async login(req, res) {
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');
        
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                await securityLogger.logLoginFailure(
                    req.body.email || 'unknown',
                    ip,
                    userAgent,
                    'VALIDATION_ERROR'
                );
                
                return res.status(400).json({
                    success: false,
                    message: "Invalid email or password",
                    errors: errors.array(),
                });
            }

            const { email, password } = req.body;

            // Find user
            const user = await User.findOne({ email: email });
            
            if (!user) {
                await securityLogger.logLoginFailure(email, ip, userAgent, 'USER_NOT_FOUND');
                
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email or password',
                });
            }

            // Check if user is active
            if (user.status !== 'active') {
                await securityLogger.logLoginFailure(email, ip, userAgent, 'USER_NOT_ACTIVE');

                return res.status(400).json({
                    success: false,
                    message: 'Account is not active. Please contact administrator.',
                });
            }

            // Compare password
            const validPassword = await user.comparePassword(password);

            if (!validPassword) {
                await securityLogger.logLoginFailure(email, ip, userAgent, 'INVALID_PASSWORD');

                return res.status(400).json({
                    success: false,
                    message: 'Invalid email or password',
                });
            }

            // Generate token
            const token = jwt.sign({userId: user._id, email: user.email, role: user.role},
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES || '2d' }
            );

            // Log successful login
            await securityLogger.logLoginSuccess(user._id, email, ip, userAgent);
            
            // Send success response
            res.status(200).json({
                success: true,
                message: 'User logged in successfully',
                data: {
                    token,
                    user: {
                        id: user._id,
                        email: user.email,
                        role: user.role,
                        username: user.name,
                        createdAt: user.createdAt,
                    }
                }
            });

        } catch (err) {
            await securityLogger.logLoginFailure(
                req.body.email || 'unknown',
                ip,
                userAgent,
                'SYSTEM_ERROR'
            );
            
            console.error("❌ Login error:", err);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    },

    async logout(req, res) {
        res.json({
            success: true,
            message: 'User logged out successfully',
        });
    },


    async getCurrentUser(req, res) {
        try {
            const user = await User.findById(req.user.userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            res.json({
                success: true,
                data: { user }
            });
        } catch (err) {
            console.error("error in the method getCurrentUser", err);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}

module.exports = authController;
