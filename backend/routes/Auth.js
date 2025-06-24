const express = require('express');
const {body} = require('express-validator');
const rateLimit = require('express-rate-limit');
const authcontroller = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();


const loginLimiter = rareLimit({
    windowMs:15 * 60 * 1000,
    max:10, 
    message:{
        success: false, 
        message : 'Too many login attempts from this IP, please try again after 15 minutes'
    }, 
}); 


const validateLogin = [
    body("email").isEmail().withMessage("Invalid email address").normalizeEmail(),
    body("password").isLength({min:6}).withMessage("Password must be at least 6 characters long"),
];

router.post('/login', loginLimiter, validateLogin, authcontroller.login);
router.post('/logout', authcontroller.logout);
router.get('/current', authMiddleware, authcontroller.getCurrentUser);

module.exports = router;