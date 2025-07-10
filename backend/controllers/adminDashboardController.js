const User = require("../models/User")
const SignupRequest = require("../models/SignupRequest")
const emailService = require("../services/emailService")
const { getApprovalEmailTemplate, getRejectionEmailTemplate } = require("../utils/emailTemplates")

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

  // GET /api/admin/signup-requests/all - Get all signup requests with pagination
  async getAllSignupRequests(req, res) {
    try {
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 10
      const status = req.query.status || "all"
      const skip = (page - 1) * limit

      let filter = {}
      if (status !== "all") {
        filter.status = status
      }

      const [requests, totalCount] = await Promise.all([
        SignupRequest.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select("-__v"),
        SignupRequest.countDocuments(filter),
      ])

      const totalPages = Math.ceil(totalCount / limit)

      res.json({
        success: true,
        message: "Signup requests fetched successfully",
        data: {
          requests,
          pagination: {
            current_page: page,
            total_pages: totalPages,
            total_count: totalCount,
            per_page: limit,
          },
        },
      })
    } catch (err) {
      console.error("Error fetching all signup requests:", err)
      res.status(500).json({
        success: false,
        message: "Internal server error",
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

      const totalRequests = pendingRequests + approvedRequests + rejectedRequests

      res.json({
        success: true,
        message: "Dashboard stats fetched successfully",
        data: {
          stats: {
            total_users: totalUsers,
            pending_requests: pendingRequests,
            approved_requests: approvedRequests,
            rejected_requests: rejectedRequests,
            total_requests: totalRequests,
          },
          recent_requests: recentRequests,
        },
      })
    } catch (err) {
      console.error("Error fetching dashboard stats:", err)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  },

  // GET /api/admin/users - Get all users with pagination
  async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 10
      const search = req.query.search || ""
      const role = req.query.role || "all"
      const status = req.query.status || "all"
      const skip = (page - 1) * limit

      let filter = {}

      if (search) {
        filter.$or = [
          { nom: { $regex: search, $options: "i" } },
          { prenom: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ]
      }

      if (role !== "all") {
        filter.role = role
      }

      if (status !== "all") {
        filter.status = status
      }

      const [users, totalCount] = await Promise.all([
        User.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select("-password -__v"),
        User.countDocuments(filter),
      ])

      const totalPages = Math.ceil(totalCount / limit)

      res.json({
        success: true,
        message: "Users fetched successfully",
        data: {
          users,
          pagination: {
            current_page: page,
            total_pages: totalPages,
            total_count: totalCount,
            per_page: limit,
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
        $or: [{ email: userData.email }, { nom: userData.nom, prenom: userData.prenom }],
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
        debug: process.env.NODE_ENV === "development" ? err.message : undefined,
      })
    }
  },

  // PUT /api/admin/users/:id - Update user
  async updateUser(req, res) {
    try {
      const { id } = req.params
      const updateData = req.body

      // Remove password from update data if it's empty
      if (updateData.password === "") {
        delete updateData.password
      }

      const updatedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).select("-password -__v")

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
        debug: process.env.NODE_ENV === "development" ? err.message : undefined,
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
        data: {
          user: {
            id: deletedUser._id,
            email: deletedUser.email,
          },
        },
      })
    } catch (err) {
      console.error("Error deleting user:", err)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        debug: process.env.NODE_ENV === "development" ? err.message : undefined,
      })
    }
  },

  // POST /api/admin/users/:id/unsuspend - Unsuspend user
  async unsupendUser(req, res) {
    try {
      const { id } = req.params

      console.log(`Unsuspending user with ID: ${id}`)

      const user = await User.findById(id)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      if (user.status !== "suspended") {
        return res.status(400).json({
          success: false,
          message: "User is not suspended",
        })
      }

      // Update user status back to active
      user.status = 'active'
      user.suspensionReason = undefined // Remove suspension reason
      user.suspendedAt = undefined // Remove suspension date

      await user.save()

      res.json({
        success: true,
        message: "User unsuspended successfully",
        data: {
          user: {
            id: user._id,
            status: user.status,
          }
        }
      })

    } catch (err) {
      console.error("Error unsuspending user:", err)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message
      })
    }
  },

  // Updated approve signup request method
  async approveSignupRequest(req, res) {
    try {
      const { id } = req.params
      const { password, additionalInfo } = req.body

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

      // Validate password
      if (!password || password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long",
        })
      }

      // Create new user
      const newUser = new User({
        nom: request.nom,
        prenom: request.prenom,
        email: request.email,
        password: password, // The password from the form
        role: "client",
        phone: request.phone || "",
        status: "active",
        signupRequestId: request._id,
      })

      console.log("Creating user with data:", {
        nom: newUser.nom,
        prenom: newUser.prenom,
        email: newUser.email,
        role: newUser.role,
      })

      await newUser.save()

      // Update request status
      request.status = "approved"
      request.approvedAt = new Date()
      request.approvedBy = req.user?.id // If you have user authentication
      await request.save()

      // Send approval email
      try {
        const emailTemplate = getApprovalEmailTemplate(request.email, password, additionalInfo)

        await emailService.transporter.sendMail({
          from: `"${process.env.APP_NAME || "Geoporteil"}" <${process.env.SMTP_USER}>`,
          to: request.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        })

        console.log("Approval email sent successfully")
      } catch (emailError) {
        console.error("Error sending approval email:", emailError)
        // Don't fail the request if email fails, but log it
      }

      console.log("Signup request approved successfully")

      res.json({
        success: true,
        message: "Signup request approved successfully and email sent",
        data: {
          user: {
            id: newUser._id,
            nom: newUser.nom,
            prenom: newUser.prenom,
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

  // Updated reject signup request method
  async rejectSignupRequest(req, res) {
    try {
      const { id } = req.params
      const { reason } = req.body

      console.log("reject signup request")

      if (!reason || reason.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: "Rejection reason must be at least 10 characters long",
        })
      }

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
      request.rejectionReason = reason.trim()
      request.rejectedBy = req.user?.id // If you have user authentication
      await request.save()

      // Send rejection email
      try {
        const emailTemplate = getRejectionEmailTemplate(request.email, reason.trim())

        await emailService.transporter.sendMail({
          from: `"${process.env.APP_NAME || "Geoporteil"}" <${process.env.SMTP_USER}>`,
          to: request.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        })

        console.log("Rejection email sent successfully")
      } catch (emailError) {
        console.error("Error sending rejection email:", emailError)
        // Don't fail the request if email fails, but log it
      }

      console.log("Signup request rejected successfully")

      res.json({
        success: true,
        message: "Signup request rejected successfully and email sent",
        data: {
          request: request,
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
}

module.exports = adminDashboardController
