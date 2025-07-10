const User = require("../models/User")
const SignupRequest = require("../models/User")

const adminDashboardController = {
  // GET /api/admin/signup-requests - Get all pending signup requests
  async getSigupRequests(req, res) {
    try {
      console.log("fetching signup requests")
      const requests = await SignupRequest.find({ status: "pending" }).sort({ createdAt: -1 }).select("-__v")
      res.json({
        success: true,
        message: "Signup requests fetched successfully",
        data: {
          requests,
          count: requests.length,
        },
      })
    } catch (err) {
      console.error("error in fetching the signup requests", err)
      res.status(500).json({
        success: false,
        message: "internal server error",
      })
    }
  },

  // GET /api/admin/signup-requests/all - Get all signup requests (pending, approved, rejected)
  async getAllSignupRequests(req, res) {
    try {
      const { status, page = 1, limit = 10 } = req.query
      const filter = {}
      if (status && ["pending", "approved", "rejected"].includes(status)) {
        filter.status = status
      }

      const skip = (page - 1) * limit
      const requests = await SignupRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number.parseInt(limit))
        .select("-__v")

      const total = await SignupRequest.countDocuments(filter)

      res.json({
        success: true,
        message: "All signup requests fetched successfully",
        data: {
          requests,
          pagination: {
            current_page: Number.parseInt(page),
            total_pages: Math.ceil(total / limit),
            total_requests: total,
            per_page: Number.parseInt(limit),
          },
        },
      })
    } catch (err) {
      console.error("error in fetching the signup requests", err)
      res.status(500).json({
        success: false,
        message: "internal server error",
      })
    }
  },

  // POST /api/admin/signup-requests/:id/approve - Approve a signup request
  async approveSignupRequest(req, res) {
    try {
      const { id } = req.params
      console.log("approve signup request for ID:", id)

      const request = await SignupRequest.findById(id)
      console.log("Found request:", request)

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Signup request not found",
        })
      }

      if (request.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: `Request is already ${request.status}`,
        })
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: request.email })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        })
      }

      // Create new user
      const emailUsername = request.email.split("@")[0]

      const newUser = new User({
        name: emailUsername,
        email: request.email,
        password: "TempPassword123!", // Temporary password
        role: "client",
        firstName: emailUsername,
        lastName: "",
        phone: "",
        organization: "",
      })

      console.log("Creating user with data:", {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      })

      await newUser.save()

      // Update request status
      request.status = "approved"
      request.approvedAt = new Date()
      await request.save()

      console.log("Signup request approved successfully")

      res.json({
        success: true,
        message: "Signup request approved successfully",
        data: {
          user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
          },
          request: request,
        },
      })
    } catch (err) {
      console.error("Error in approving signup request:", err)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        debug: process.env.NODE_ENV === "development" ? err.message : undefined,
      })
    }
  },

  // POST /api/admin/signup-requests/:id/reject - Reject a signup request
  async rejectSignupRequest(req, res) {
    try {
      const { id } = req.params
      console.log("reject signup request")

      const request = await SignupRequest.findById(id)
      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Signup request not found",
        })
      }

      if (request.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: `Request is already ${request.status}`,
        })
      }

      request.status = "rejected"
      request.rejectedAt = new Date()
      await request.save()

      console.log("Signup request rejected successfully")

      res.json({
        success: true,
        message: "Signup request rejected successfully",
        data: {
          request: request, // Fixed: was returning SignupRequest model instead of request instance
        },
      })
    } catch (err) {
      console.error("error in rejecting the signup request", err)
      res.status(500).json({
        success: false,
        message: "internal server error",
      })
    }
  },

  // GET /api/admin/stats - Get dashboard stats
  async getDashboardStats(req, res) {
    try {
      console.log("fetching dashboard stats")
      const [totalUsers, pendingRequests, approvedRequests, rejectedRequests, recentRequests] = await Promise.all([
        User.countDocuments(),
        SignupRequest.countDocuments({ status: "pending" }),
        SignupRequest.countDocuments({ status: "approved" }),
        SignupRequest.countDocuments({ status: "rejected" }),
        SignupRequest.find().sort({ createdAt: -1 }).limit(5).select("email status createdAt"),
      ])

      res.json({
        success: true,
        message: "Dashboard stats retrieved successfully",
        data: {
          stats: {
            total_users: totalUsers,
            pending_requests: pendingRequests,
            approved_requests: approvedRequests,
            rejected_requests: rejectedRequests,
            total_requests: pendingRequests + approvedRequests + rejectedRequests,
          },
          recent_requests: recentRequests,
        },
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  },

  // GET /api/admin/users - Get all users
  async getAllUsers(req, res) {
    try {
      console.log("fetching users")
      const { role, page = 1, limit = 10 } = req.query
      const filter = {}

      if (
        role &&
        [
          "admin",
          "Directeur technique",
          "Directeur generale",
          "Directeur administratif",
          "Technicien",
          "chef de projet",
          "client",
        ].includes(role)
      ) {
        filter.role = role
      }

      const skip = (page - 1) * limit
      const users = await User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number.parseInt(limit))
        .select("-password -__v")

      const total = await User.countDocuments(filter)

      res.json({
        success: true,
        message: "Users fetched successfully",
        data: {
          users,
          pagination: {
            current_page: Number.parseInt(page),
            total_pages: Math.ceil(total / limit),
            total_users: total,
            per_page: Number.parseInt(limit),
          },
        },
      })
    } catch (err) {
      console.error("Error fetching users:", err)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  },

  // POST /api/admin/users - Create new user
  async createUser(req, res) {
    try {
      const userData = req.body

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { name: userData.name }],
      })

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email or name already exists",
        })
      }

      // Create new user
      const newUser = new User({
        ...userData,
        password: userData.password || "TempPassword123!", // Default password if not provided
      })

      await newUser.save()

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          user: newUser,
        },
      })
    } catch (err) {
      console.error("Error creating user:", err)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  },

  // PUT /api/admin/users/:id - Update user
  async updateUser(req, res) {
    try {
      const { id } = req.params
      const updateData = req.body

      // Remove password from update if it's empty
      if (!updateData.password) {
        delete updateData.password
      }

      const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select(
        "-password",
      )

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      res.json({
        success: true,
        message: "User updated successfully",
        data: {
          user: updatedUser,
        },
      })
    } catch (err) {
      console.error("Error updating user:", err)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  },

  // DELETE /api/admin/users/:id - Delete user
  async deleteUser(req, res) {
    try {
      const { id } = req.params

      const deletedUser = await User.findByIdAndDelete(id)

      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      res.json({
        success: true,
        message: "User deleted successfully",
      })
    } catch (err) {
      console.error("Error deleting user:", err)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  },

  // POST /api/admin/users/:id/suspend - Suspend a user
  async suspendUser(req, res) {
    try {
      const { id } = req.pamas
      const { reason } = req.body

      console.log(`Suspending user with ID : ${id}`)

      const user = await User.findById(id)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      if (user.status === "suspended") {
        return res.status(400).json({
          success: false,
          message: "User is already suspended",
        })
      }

      // update user status 
      const updatedUser = await User.findByIdAndUpdate(id, {
        status: "suspended",
        suspendedAt: new Date(),
        suspensionReason: reason,
      },
        { new: true, runValidators: true }
      ).select("-password -__v")

      console.log("user suspended successfully")
      res.json({
        success: true,
        message: "User suspended successfully",
        data: {
          user: updatedUser,
        }
      })
    } catch (err) {
      console.error("Error suspending user:", err)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  },

  // POST /api/admin/users/:id/unsuspend - Unsuspend a user
  async unsupendUser(req, res) {
    try {
      const { id } = req.params
    
      console.log("=== UNSUSPEND USER DEBUG ===")
      console.log("User ID:", id)
    
      // Find the user
      const user = await User.findById(id)
    
      if (!user) {
        console.log("User not found")
        return res.status(404).json({
          success: false,
          message: "User not found"
        })
      }
    
      console.log("Current user status:", user.status)
      console.log("User object:", JSON.stringify(user, null, 2))
    
      // Check if user is suspended (be flexible with the check)
      if (user.status !== 'suspended') {
        console.log("User is not suspended. Current status:", user.status)
        return res.status(400).json({
          success: false,
          message: `User is not suspended. Current status: ${user.status}`
        })
      }
    
      // Update user status back to active
      user.status = 'active'
      user.suspensionReason = undefined; // Remove suspension reason
      user.suspensionDuration = undefined; // Remove suspension duration
      user.unsuspendedAt = new Date()
    
      await user.save()
    
      console.log("User unsuspended successfully")
    
      res.json({
        success: true,
        message: "User unsuspended successfully",
        user: {
          id: user._id,
          status: user.status,
          unsuspendedAt: user.unsuspendedAt
        }
      })
    
    } catch (error) {
      console.error("Error unsuspending user:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      })
    }
  }, 

}

module.exports = adminDashboardController
