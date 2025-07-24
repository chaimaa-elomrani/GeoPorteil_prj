const express = require('express')
const router = express.Router()
const SecureGeoController = require('../controllers/secureGeoController')
const cookieAuth = require('../middleware/cookieAuth')

// Apply authentication middleware to all routes (allows all authenticated users)
router.use(cookieAuth)

// Import GeoJSON file to secure storage
router.post('/import/:projectId', SecureGeoController.importGeoData)

// Get secure GeoJSON data
router.get('/:projectId', SecureGeoController.getGeoData)

// Update GeoJSON data
router.put('/:projectId', SecureGeoController.updateGeoData)

// Export GeoJSON data
router.get('/:projectId/export', SecureGeoController.exportGeoData)

// Delete GeoJSON data
router.delete('/:projectId', SecureGeoController.deleteGeoData)

// Get audit log
router.get('/:projectId/audit', SecureGeoController.getAuditLog)

// Get security status
router.get('/:projectId/status', SecureGeoController.getSecurityStatus)

// Migrate public files (admin only)
router.post('/migrate', SecureGeoController.migratePublicFiles)

module.exports = router
