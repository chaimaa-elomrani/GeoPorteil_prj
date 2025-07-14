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
            
            // Set HttpOnly cookie for token (most secure)
            res.cookie('authToken', token, {
                httpOnly: true, // Prevents JavaScript access
                secure: process.env.NODE_ENV === 'production', // HTTPS only in production
                sameSite: 'strict', // CSRF protection
                maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
            });

            // Send success response with user data
            // Include token for encrypted localStorage fallback if needed
            res.status(200).json({
                success: true,
                message: 'User logged in successfully',
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        role: user.role,
                        nom: user.nom,
                        prenom: user.prenom,
                        createdAt: user.createdAt,
                    },
                    // Provide token for encrypted storage fallback
                    // Note: HttpOnly cookie is preferred, this is for compatibility
                    token: process.env.PROVIDE_TOKEN_FALLBACK === 'true' ? token : undefined
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
        // Clear the HttpOnly cookie
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.json({
            success: true,
            message: 'User logged out successfully',
        });
    },


    async getCurrentUser(req, res) {
        try {
            // Get token from cookie
            const token = req.cookies.authToken;

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'No authentication token found'
                });
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from database
            const user = await User.findById(decoded.userId).select('-password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (user.status !== 'active') {
                return res.status(401).json({
                    success: false,
                    message: 'Account is not active'
                });
            }

            res.json({
                success: true,
                message: 'User authenticated',
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        role: user.role,
                        nom: user.nom,
                        prenom: user.prenom,
                        createdAt: user.createdAt,
                    }
                }
            });

        } catch (error) {
            console.error('Get current user error:', error);
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    },

    async verifyToken(req, res) {
        try {
            // Get token from Authorization header
            const authHeader = req.headers.authorization;
            const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'No token provided'
                });
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from database
            const user = await User.findById(decoded.userId).select('-password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (user.status !== 'active') {
                return res.status(401).json({
                    success: false,
                    message: 'Account is not active'
                });
            }

            res.json({
                success: true,
                message: 'Token verified',
                data: {
                    user: {
                        id: user._id,
                        email: user.email,
                        role: user.role,
                        nom: user.nom,
                        prenom: user.prenom,
                        createdAt: user.createdAt,
                    }
                }
            });

        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    }
}

module.exports = authController;
