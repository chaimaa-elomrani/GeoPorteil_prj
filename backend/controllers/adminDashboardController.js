const User = require("../models/User")
const SignupRequest = require("../models/SignupRequest")
const Project = require("../models/Project")
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
  async unsuspendUser(req, res) {
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

  // POST /api/admin/users/:id/block - Block user
  async blockUser(req, res) {
    try {
      const { id } = req.params
      const { reason } = req.body

      console.log(`Blocking user with ID: ${id}`)

      const user = await User.findById(id)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        })
      }

      // Update user status to blocked
      user.isBlocked = true
      user.blockReason = reason || "Blocked by administrator"
      user.blockedAt = new Date()
      user.status = 'blocked'

      await user.save()

      res.json({
        success: true,
        message: "User blocked successfully",
        data: {
          user: {
            id: user._id,
            status: user.status,
            isBlocked: user.isBlocked
          }
        }
      })

    } catch (err) {
      console.error("Error blocking user:", err)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message
      })
    }
  },

  // POST /api/admin/users/:id/unblock - Unblock user
  async unblockUser(req, res) {
    try {
      const { id } = req.params

      console.log(`Unblocking user with ID: ${id}`)

      const user = await User.findById(id)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        })
      }

      // Update user status to active and clear block fields
      user.isBlocked = false
      user.blockReason = null
      user.blockedAt = null
      user.status = 'active'

      await user.save()

      res.json({
        success: true,
        message: "User unblocked successfully",
        data: {
          user: {
            id: user._id,
            status: user.status,
            isBlocked: user.isBlocked
          }
        }
      })

    } catch (err) {
      console.error("Error unblocking user:", err)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message
      })
    }
  },

  // POST /api/admin/projects/:id/archive - Archive project
  async archiveProject(req, res) {
    try {
      const { id } = req.params

      console.log(`Archiving project with ID: ${id}`)

      const project = await Project.findById(id)
      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found"
        })
      }

      // Update project to archived
      project.archived = true
      await project.save()

      res.json({
        success: true,
        message: "Project archived successfully",
        data: {
          project: {
            id: project._id,
            archived: project.archived
          }
        }
      })

    } catch (err) {
      console.error("Error archiving project:", err)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message
      })
    }
  },

  // POST /api/admin/projects/:id/unarchive - Unarchive project
  async unarchiveProject(req, res) {
    try {
      const { id } = req.params

      console.log(`Unarchiving project with ID: ${id}`)

      const project = await Project.findById(id)
      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found"
        })
      }

      // Update project to unarchived
      project.archived = false
      await project.save()

      res.json({
        success: true,
        message: "Project unarchived successfully",
        data: {
          project: {
            id: project._id,
            archived: project.archived
          }
        }
      })

    } catch (err) {
      console.error("Error unarchiving project:", err)
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

  // Projects management
  async getAllProjects(req, res) {
    try {
      const { archived } = req.query

      // Build filter - by default exclude archived projects
      const filter = {}
      if (archived === 'true') {
        filter.archived = true
      } else if (archived === 'false') {
        filter.archived = false
      } else {
        // Default: exclude archived projects
        filter.archived = { $ne: true }
      }

      const projects = await Project.find(filter).sort({ createdAt: -1 })

      res.json({
        success: true,
        data: {
          projects: projects,
          pagination: {
            total: projects.length,
            total_pages: 1,
            current_page: 1,
            per_page: projects.length
          }
        }
      })
    } catch (error) {
      console.error('Error fetching projects:', error)
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération des projets' })
    }
  },

  async getProjectById(req, res) {
    try {
      const { id } = req.params
      const project = await Project.findById(id)

      if (!project) {
        return res.status(404).json({ success: false, message: 'Projet non trouvé' })
      }

      res.json({ success: true, data: project })
    } catch (error) {
      console.error('Error fetching project:', error)
      res.status(500).json({ success: false, message: 'Erreur lors de la récupération du projet' })
    }
  },

  async createProject(req, res) {
    try {
      const projectData = req.body

      // Check if project number already exists
      const existingProject = await Project.findOne({ projectNumber: projectData.projectNumber })
      if (existingProject) {
        return res.status(400).json({ success: false, message: 'Un projet avec ce numéro existe déjà' })
      }

      const project = new Project({
        ...projectData,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      await project.save()

      res.status(201).json({ success: true, data: project, message: 'Projet créé avec succès' })
    } catch (error) {
      console.error('Error creating project:', error)
      res.status(500).json({ success: false, message: 'Erreur lors de la création du projet' })
    }
  },

  async updateProject(req, res) {
    try {
      const { id } = req.params
      const updateData = req.body

      const project = await Project.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      )

      if (!project) {
        return res.status(404).json({ success: false, message: 'Projet non trouvé' })
      }

      res.json({ success: true, data: project, message: 'Projet mis à jour avec succès' })
    } catch (error) {
      console.error('Error updating project:', error)
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du projet' })
    }
  },

  async deleteProject(req, res) {
    try {
      const { id } = req.params

      const project = await Project.findByIdAndDelete(id)

      if (!project) {
        return res.status(404).json({ success: false, message: 'Projet non trouvé' })
      }

      res.json({ success: true, message: 'Projet supprimé avec succès' })
    } catch (error) {
      console.error('Error deleting project:', error)
      res.status(500).json({ success: false, message: 'Erreur lors de la suppression du projet' })
    }
  },

  async createProjectFromGeoJSON(req, res) {
    try {
      const { name, description, geoJsonData } = req.body

      // Generate unique project number
      const projectNumber = `GEO-${Date.now()}`

      // Calculate center coordinates from GeoJSON features
      let centerLat = 0, centerLng = 0, pointCount = 0

      if (geoJsonData && geoJsonData.features) {
        geoJsonData.features.forEach(feature => {
          if (feature.geometry.type === 'Point') {
            centerLng += feature.geometry.coordinates[0]
            centerLat += feature.geometry.coordinates[1]
            pointCount++
          }
        })

        if (pointCount > 0) {
          centerLng = centerLng / pointCount
          centerLat = centerLat / pointCount
        }
      }

      const projectData = {
        projectNumber,
        anneeProjet: new Date().getFullYear().toString(),
        region: "Marrakech-Safi",
        prefecture: "Marrakech",
        consistance: description || `Projet GeoJSON: ${name}`,
        projectStatus: "En cours",
        latitude: centerLat.toString(),
        longitude: centerLng.toString(),
        geoJsonData: geoJsonData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const project = new Project(projectData)
      await project.save()

      res.json({ success: true, data: project, message: 'Projet GeoJSON créé avec succès' })
    } catch (error) {
      console.error('Error creating GeoJSON project:', error)
      res.status(500).json({ success: false, message: 'Erreur lors de la création du projet GeoJSON' })
    }
  },
}

module.exports = adminDashboardController
