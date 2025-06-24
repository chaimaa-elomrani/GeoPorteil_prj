const { validationResult } = require('express-validator');
const User = require("../models/User");
const jwt = require('jsonwebtoken');

const AuthController = {

    async login(req, res) {
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

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email or password',
                });
            }

            const validPassword = await user.comparePassword(password);
            if (!validPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email or password',
                });

            }

            const token = jwt.sign({
                userId: user_id,
                email: user.email,
                role: user.role
            },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_SECRET || '2d' }
            );

            console.log(`User logged in successfully: ${user.email}`);

            res.status(200).json({
                success: true,
                message: 'User logged in successfully',
                data: {
                    token,
                    user: {
                        id: user._id,
                        email: user.email,
                        role: user.role,
                        createdAt: user.createdAt,
                    }
                }
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    },

    async logout(req, res){
        res.json({
            success: true,
            message: 'User logged out successfully',
        });
    }


    



}