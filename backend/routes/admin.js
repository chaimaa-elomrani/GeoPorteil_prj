const express = require("express")
const router = express.Router()
const adminDashboardController = require("../controllers/adminDashboardController")
const adminAuth = require("../middleware/adminAuth")
const User = require("../models/User")

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
router.post('/users/:id/suspend', async (req, res) => {
    try {
      const { id } = req.params
      const { reason, duration } = req.body
    
      console.log("=== SUSPEND USER DEBUG ===")
      console.log("User ID:", id)
      console.log("Reason:", reason)
      console.log("Duration:", duration)
      console.log("Request body:", req.body)
    
      // Check if user exists - Fixed: Use User model instead of user variable
      const user = await User.findById(id)
      console.log("Found user:", user ? "YES" : "NO")
    
      if (!user) {
        console.log("User not found, returning 404")
        return res.status(404).json({
          success: false,
          message: "User not found"
        })
      }
    
      console.log("Current user status:", user.status)
    
      // Update user status to suspended
      user.status = 'suspended'
      user.suspensionReason = reason
      if (duration) {
        user.suspensionDuration = duration
      }
      
      await user.save()
      
      res.json({
        success: true,
        message: "User suspended successfully",
        user: {
          id: user._id,
          status: user.status,
          suspensionReason: user.suspensionReason
        }
      })
    
    } catch (err) {
      console.error("=== SUSPEND USER ERROR ===")
      console.error("Full error:", err)
      console.error("Error message:", err.message)
      console.error("Error stack:", err.stack)
      
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message
      })
    }
})
router.post('/users/:id/unsuspend', adminDashboardController.unsupendUser)


    
module.exports = router
