const express = require('express'); 
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const adminDashboardController = require('../controllers/adminDashboardController');

console.log('admin dashboard route');
router.use(adminAuth);

// Ajoutez cette route manquante:
router.get('/dashboard-stats', adminDashboardController.getDashboardStats);

// Les autres routes (corrigez adminController -> adminDashboardController):
router.get('/signup-requests', adminDashboardController.getSigupRequests);
router.get('/signup-requests/all', adminDashboardController.getAllSignupRequests);
router.post('/signup-requests/:id/approve', adminDashboardController.approveSignupRequest);
router.post('/signup-requests/:id/reject', adminDashboardController.rejectSignupRequest);
router.get('/users', adminDashboardController.getAllUsers);

console.log('admin dashboard route');
module.exports = router;