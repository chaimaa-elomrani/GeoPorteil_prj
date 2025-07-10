const express = require("express")
const router = express.Router()
const SignupRequest = require("../models/SignupRequest")
const { emailValidation, handleValidationErrors } = require("../middleware/validation")
const emailService = require("../services/emailService")

// POST /api/signup-request - Create a new signup request
router.post("/", emailValidation, handleValidationErrors, async (req, res) => {
  try {
    console.log("📝 Received signup request:", req.body)
    
    const { email, nom, prenom, phone } = req.body
    const ip = req.ip || req.connection.remoteAddress
    const userAgent = req.get("User-Agent")

    // Validate required fields
    if (!email || !nom || !prenom) {
      return res.status(400).json({
        success: false,
        message: "Email, nom et prénom sont obligatoires",
        errors: [
          ...((!email) ? [{ field: 'email', message: 'Email est obligatoire' }] : []),
          ...((!nom) ? [{ field: 'nom', message: 'Nom est obligatoire' }] : []),
          ...((!prenom) ? [{ field: 'prenom', message: 'Prénom est obligatoire' }] : [])
        ]
      })
    }

    // Check if request already exists
    const existingRequest = await SignupRequest.findOne({ email })
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Une demande d'inscription existe déjà pour cette adresse email",
        errors: [{ field: 'email', message: 'Cette adresse email est déjà enregistrée' }]
      })
    }

    // Create new signup request
    const signupRequest = new SignupRequest({
      email: email.trim(),
      nom: nom.trim(),
      prenom: prenom.trim(),
      phone: phone ? phone.trim() : '',
      ipAddress: ip,
      userAgent,
    })

    await signupRequest.save()
    console.log("✅ Signup request saved:", signupRequest._id)

    // Send emails
    try {
      console.log("📧 Sending registration emails...")
      const emailResults = await emailService.sendRegistrationEmails(
        email.trim(),
        nom.trim(),
        prenom.trim(),
        phone ? phone.trim() : '',
        signupRequest._id
      )
      
      console.log("📧 Email results:", emailResults)
      
      if (emailResults.errors.length > 0) {
        console.warn("⚠️ Some emails failed to send:", emailResults.errors)
      }
    } catch (emailError) {
      console.error("❌ Error sending emails:", emailError)
      // Don't fail the request if email fails, but log it
    }

    res.status(201).json({
      success: true,
      message: "Demande d'inscription créée avec succès",
      data: {
        requestId: signupRequest._id,
        email: signupRequest.email,
        nom: signupRequest.nom,
        prenom: signupRequest.prenom,
        status: signupRequest.status,
      },
    })
  } catch (error) {
    console.error("❌ Error creating signup request:", error)
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

module.exports = router