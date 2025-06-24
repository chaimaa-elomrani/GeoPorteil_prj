const { validationResult } = require('express-validator');
const User = require("../models/User");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Add this for password comparison

const authController = {
    async login(req, res) {
        console.log("🔍 Login method called");
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid email or password",
                    errors: errors.array(),
                });
            }

            const { email, password } = req.body;
            console.log("🔍 Login attempt for:", email);

            // Find user
            const user = await User.findOne({ email });
            console.log("user found", user);

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email or password',
                });
            }

        //  comparing the psswrd
            const validPassword = await bcrypt.compare(password, user.password);
            
            if (!validPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email or password',
                });
            }

            // Generate token
            const token = jwt.sign({
                userId: user._id,
                email: user.email,
                role: user.role
            },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES || '2d' }
            );

         
            
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
                        username: user.username,
                        createdAt: user.createdAt,
                    }
                }
            });

        } catch (err) {
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
