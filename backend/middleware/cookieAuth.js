const jwt = require('jsonwebtoken');
const User = require('../models/User');

const cookieAuth = async (req, res, next) => {
    try {
        // Get token from cookie instead of Authorization header
        const token = req.cookies.authToken;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Account is not active.'
            });
        }

        // Add user to request object
        req.user = user;
        next();
        
    } catch (error) {
        console.error('Cookie auth error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};

module.exports = cookieAuth;
