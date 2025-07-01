const express = require("express")
const router = express.Router()
const adminDashboardController = require("../controllers/adminDashboardController")
const adminAuth = require("../middleware/adminAuth")

// Apply admin authentication to all routes
router.use(adminAuth)

// Dashboard stats
router.get("/stats", adminDashboardController.getDashboardStats)

// Signup requests
router.get("/signup-requests", adminDashboardController.getSigupRequests)
router.get("/signup-requests/all", adminDashboardController.getAllSignupRequests)
router.post("/signup-requests/:id/approve", adminDashboardController.approveSignupRequest)
router.post("/signup-requests/:id/reject", adminDashboardController.rejectSignupRequest)

// Users management
router.get("/users", adminDashboardController.getAllUsers)
router.post("/users", adminDashboardController.createUser)
router.put("/users/:id", adminDashboardController.updateUser)
router.delete("/users/:id", adminDashboardController.deleteUser)

// status management 
router.post('/users/:id/suspend', adminDashboardController.suspendUser)
router.post('/users/:id/unsuspend', adminDashboardController.unsupendUser)
router.post('/users/:id/block', adminDashboardController.blockUser)
router.post('/users/:id/unblock', adminDashboardController.unblockUser)


module.exports = router
