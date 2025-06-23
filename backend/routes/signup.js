const express = require("express")
const { body, validationResult } = require("express-validator")
const SignupRequest = require("../models/SignupRequest")
const emailService = require("../services/emailService")
const rateLimit = require("express-rate-limit")

const router = express.Router()

// Rate limiting: 5 requests per 15 minutes per IP
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    error: "Trop de tentatives. Veuillez réessayer dans 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Validation middleware
const validateSignupRequest = [
  body("email")
    .isEmail()
    .withMessage("Veuillez entrer un email valide")
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage("L'email est trop long"),
]

// POST /api/signup/request
router.post("/request", signupLimiter, validateSignupRequest, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: errors.array(),
      })
    }

    const { email } = req.body
    const ipAddress = req.ip || req.connection.remoteAddress
    const userAgent = req.get("User-Agent")

    // Check if email already exists
    const existingRequest = await SignupRequest.findOne({ email })
    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: "Une demande avec cet email existe déjà",
      })
    }

    // Create new signup request
    const signupRequest = new SignupRequest({
      email,
      ipAddress,
      userAgent,
    })

    await signupRequest.save()

    // Send emails
    try {
      await Promise.all([
        emailService.sendUserConfirmationEmail(email),
        emailService.sendAdminNotificationEmail(email, signupRequest._id),
      ])
    } catch (emailError) {
      console.error("Email sending error:", emailError)
      // Don't fail the request if email fails, but log it
    }

    res.status(201).json({
      success: true,
      message: "Demande d'inscription envoyée avec succès",
      data: {
        id: signupRequest._id,
        email: signupRequest.email,
        status: signupRequest.status,
        requestDate: signupRequest.requestDate,
      },
    })
  } catch (error) {
    console.error("❌ Detailed signup request error:", error)
    console.error("Error message:", error.message)
    console.error("Error stack:", error.stack)
    
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
      // Add this for debugging (remove in production)
      debug: process.env.NODE_ENV === "development" ? error.message : undefined
    })
  }
})

// GET /api/signup/requests (for admin dashboard)
router.get("/requests", async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query
    const query = status ? { status } : {}

    const requests = await SignupRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-__v")

    const total = await SignupRequest.countDocuments(query)

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    })
  } catch (error) {
    console.error("Get requests error:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des demandes",
    })
  }
})

module.exports = router
