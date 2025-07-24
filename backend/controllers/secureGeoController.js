const SecureGeoService = require('../services/secureGeoService')
const Project = require('../models/Project')
const path = require('path')

class SecureGeoController {

  /**
   * Import GeoJSON file to secure storage
   * POST /api/secure-geo/import/:projectId
   */
  static async importGeoData(req, res) {
    try {
      const { projectId } = req.params
      const { filePath, removeOriginal = true, securityLevel = 'confidential' } = req.body
      const userId = req.user?._id
      const userRole = req.user?.role || 'viewer'

      // Verify project exists
      const project = await Project.findById(projectId)
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        })
      }

      // Check permissions
      if (!['admin', 'manager'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to import geo data'
        })
      }

      // Import the file
      const result = await SecureGeoService.importFromFile(filePath, projectId, {
        securityLevel,
        allowedRoles: ['admin', 'manager', 'surveyor'],
        userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        removeOriginal
      })

      if (result.success) {
        res.status(201).json(result)
      } else {
        res.status(400).json(result)
      }

    } catch (error) {
      console.error('Error in importGeoData:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  /**
   * Get secure GeoJSON data
   * GET /api/secure-geo/:projectId
   */
  static async getGeoData(req, res) {
    try {
      const { projectId } = req.params
      const { includeMetadata = false } = req.query
      const userId = req.user?._id
      const userRole = req.user?.role || 'viewer'

      const result = await SecureGeoService.getGeoData(projectId, userId, userRole, {
        includeMetadata: includeMetadata === 'true',
        logAccess: true
      })

      if (result.success) {
        res.json(result)
      } else {
        res.status(result.message.includes('permissions') ? 403 : 404).json(result)
      }

    } catch (error) {
      console.error('Error in getGeoData:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  /**
   * Update GeoJSON data
   * PUT /api/secure-geo/:projectId
   */
  static async updateGeoData(req, res) {
    try {
      const { projectId } = req.params
      const { geoData } = req.body
      const userId = req.user?._id
      const userRole = req.user?.role || 'viewer'

      if (!geoData) {
        return res.status(400).json({
          success: false,
          message: 'GeoJSON data is required'
        })
      }

      const result = await SecureGeoService.updateGeoData(projectId, geoData, userId, userRole, {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      })

      if (result.success) {
        res.json(result)
      } else {
        res.status(result.message.includes('permissions') ? 403 : 404).json(result)
      }

    } catch (error) {
      console.error('Error in updateGeoData:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  /**
   * Export GeoJSON data
   * GET /api/secure-geo/:projectId/export
   */
  static async exportGeoData(req, res) {
    try {
      const { projectId } = req.params
      const { format = 'geojson' } = req.query
      const userId = req.user?._id
      const userRole = req.user?.role || 'viewer'

      const result = await SecureGeoService.exportGeoData(projectId, userId, userRole, format)

      if (result.success) {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`)
        res.json(result.data)
      } else {
        res.status(result.message.includes('permissions') ? 403 : 404).json(result)
      }

    } catch (error) {
      console.error('Error in exportGeoData:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  /**
   * Delete GeoJSON data
   * DELETE /api/secure-geo/:projectId
   */
  static async deleteGeoData(req, res) {
    try {
      const { projectId } = req.params
      const userId = req.user?._id
      const userRole = req.user?.role || 'viewer'

      const result = await SecureGeoService.deleteGeoData(projectId, userId, userRole, {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      })

      if (result.success) {
        res.json(result)
      } else {
        res.status(result.message.includes('permissions') ? 403 : 404).json(result)
      }

    } catch (error) {
      console.error('Error in deleteGeoData:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  /**
   * Get audit log for GeoJSON data
   * GET /api/secure-geo/:projectId/audit
   */
  static async getAuditLog(req, res) {
    try {
      const { projectId } = req.params
      const userId = req.user?._id
      const userRole = req.user?.role || 'viewer'

      const result = await SecureGeoService.getAuditLog(projectId, userId, userRole)

      if (result.success) {
        res.json(result)
      } else {
        res.status(result.message.includes('permissions') ? 403 : 404).json(result)
      }

    } catch (error) {
      console.error('Error in getAuditLog:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  /**
   * Migrate existing public GeoJSON files to secure storage
   * POST /api/secure-geo/migrate
   */
  static async migratePublicFiles(req, res) {
    try {
      const userId = req.user?._id
      const userRole = req.user?.role || 'viewer'

      // Only admins can perform migration
      if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can perform data migration'
        })
      }

      const results = []

      // Find the DERB MOULAY CHERIF project
      const project = await Project.findOne({
        'projectInfo.projectNumber': '216'
      })

      if (project) {
        // Import project1.geojson
        const publicFilePath = path.join(__dirname, '../../frontend/public/project1.geojson')
        
        const result = await SecureGeoService.importFromFile(publicFilePath, project._id, {
          securityLevel: 'confidential',
          allowedRoles: ['admin', 'manager', 'surveyor'],
          userId,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          removeOriginal: false // Keep original for now
        })

        results.push({
          project: project.projectInfo.secteur,
          projectNumber: project.projectInfo.projectNumber,
          file: 'project1.geojson',
          result
        })
      }

      res.json({
        success: true,
        message: 'Migration completed',
        results
      })

    } catch (error) {
      console.error('Error in migratePublicFiles:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }

  /**
   * Get security status of geo data
   * GET /api/secure-geo/:projectId/status
   */
  static async getSecurityStatus(req, res) {
    try {
      const { projectId } = req.params
      const userId = req.user?._id
      const userRole = req.user?.role || 'viewer'

      const result = await SecureGeoService.getGeoData(projectId, userId, userRole, {
        includeMetadata: true,
        logAccess: false
      })

      if (result.success) {
        res.json({
          success: true,
          status: {
            isSecured: true,
            securityLevel: result.metadata.securityLevel,
            totalFeatures: result.metadata.totalFeatures,
            lastModified: result.metadata.lastModified,
            version: result.metadata.version,
            hasAccess: true
          }
        })
      } else {
        res.json({
          success: true,
          status: {
            isSecured: false,
            hasAccess: false,
            message: result.message
          }
        })
      }

    } catch (error) {
      console.error('Error in getSecurityStatus:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      })
    }
  }
}

module.exports = SecureGeoController
