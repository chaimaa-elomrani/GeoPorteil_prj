const express = require("express")
const router = express.Router()
const SignupRequest = require("../models/SignupRequest")
const { emailValidation, handleValidationErrors } = require("../middleware/validation")
const emailService = require("../services/emailService")

// POST /api/signup-request - Create a new signup request
router.post("/", emailValidation, handleValidationErrors, async (req, res) => {
  try {
    const { email } = req.body
    const ip = req.ip || req.connection.remoteAddress
    const userAgent = req.get("User-Agent")

    // Check if request already exists
    const existingRequest = await SignupRequest.findOne({ email })
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Une demande d'inscription existe déjà pour cette adresse email",
      })
    }

    // Create new signup request
    const signupRequest = new SignupRequest({
      email,
      ipAddress: ip,
      userAgent,
    })

    await signupRequest.save()

    // Send confirmation email to user
    try {
      await emailService.sendUserConfirmationEmail(email)
    } catch (emailError) {
      console.error("Error sending user confirmation email:", emailError)
      // Don't fail the request if email fails
    }

    // Send notification email to admin
    try {
      await emailService.sendAdminNotificationEmail(email, signupRequest._id)
    } catch (emailError) {
      console.error("Error sending admin notification email:", emailError)
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: "Demande d'inscription créée avec succès",
      data: {
        requestId: signupRequest._id,
        email: signupRequest.email,
        status: signupRequest.status,
      },
    })
  } catch (error) {
    console.error("Error creating signup request:", error)
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
    })
  }
})

module.exports = router
