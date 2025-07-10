const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

// Test endpoint for user confirmation email
router.post('/test-user-email', async (req, res) => {
  try {
    const { email, nom, prenom, phone } = req.body;
    
    // Validate required fields
    if (!email || !nom || !prenom) {
      return res.status(400).json({
        success: false,
        message: 'Email, nom, and prenom are required'
      });
    }

    const result = await emailService.sendUserConfirmationEmail(email, nom, prenom, phone);
    
    res.json({
      success: true,
      message: 'User confirmation email sent successfully',
      messageId: result.messageId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send user confirmation email',
      error: error.message
    });
  }
});

// Test endpoint for admin notification email
router.post('/test-admin-email', async (req, res) => {
  try {
    const { email, nom, prenom, phone, requestId } = req.body;
    
    // Validate required fields
    if (!email || !nom || !prenom || !requestId) {
      return res.status(400).json({
        success: false,
        message: 'Email, nom, prenom, and requestId are required'
      });
    }

    const result = await emailService.sendAdminNotificationEmail(email, nom, prenom, phone, requestId);
    
    res.json({
      success: true,
      message: 'Admin notification email sent successfully',
      messageId: result?.messageId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send admin notification email',
      error: error.message
    });
  }
});

// Test endpoint for both emails
router.post('/test-both-emails', async (req, res) => {
  try {
    const { email, nom, prenom, phone, requestId } = req.body;
    
    // Validate required fields
    if (!email || !nom || !prenom || !requestId) {
      return res.status(400).json({
        success: false,
        message: 'Email, nom, prenom, and requestId are required'
      });
    }

    const results = await emailService.sendRegistrationEmails(email, nom, prenom, phone, requestId);
    
    res.json({
      success: true,
      message: 'Registration emails processed',
      results: {
        userEmailSent: !!results.userEmail,
        adminEmailSent: !!results.adminEmail,
        errors: results.errors,
        userMessageId: results.userEmail?.messageId,
        adminMessageId: results.adminEmail?.messageId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send registration emails',
      error: error.message
    });
  }
});

module.exports = router;