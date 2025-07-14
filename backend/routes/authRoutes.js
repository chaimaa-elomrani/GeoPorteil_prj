const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const loginLimiter = require('../middleware/loginLimiter');
const { body } = require('express-validator');

// Validation middleware
const validateLogin = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
];

// Apply rate limiting to login
router.post('/login', loginLimiter, validateLogin, authController.login);
router.post('/logout', authController.logout);
router.get('/current-user', authController.getCurrentUser);
router.post('/verify-token', authController.verifyToken);

module.exports = router;