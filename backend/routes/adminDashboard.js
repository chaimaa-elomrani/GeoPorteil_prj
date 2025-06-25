const express = require('express'); 
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const adminDashboardController = require('../controllers/adminDashboardController');

console.log('admin dashboard route');

router.use(adminAuth);

// the dashboard routes 
router.get('/signup-requests', adminController.getSignupRequests);
router.get('/signup-requests/all', adminController.getAllSignupRequests);
router.post('/signup-requests/:id/approve', adminController.approveSignupRequest);
router.post('/signup-requests/:id/reject', adminController.rejectSignupRequest);
router.get('/users', adminDashboardController.getAllUsers);

console.log('admin dashboard route');

module.exports = router;