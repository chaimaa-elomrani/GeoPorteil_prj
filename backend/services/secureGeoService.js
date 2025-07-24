const SecureGeoData = require('../models/SecureGeoData')
const fs = require('fs').promises
const path = require('path')
const crypto = require('crypto')

class SecureGeoService {
  
  /**
   * Store GeoJSON data securely in database
   */
  static async storeGeoData(projectId, geoData, options = {}) {
    try {
      const {
        dataType = 'geojson',
        securityLevel = 'confidential',
        allowedRoles = ['admin', 'manager'],
        allowedUsers = [],
        userId,
        ipAddress,
        userAgent
      } = options

      // Create secure geo data record
      const secureGeoData = new SecureGeoData({
        projectId,
        dataType,
        securityLevel,
        accessControl: {
          allowedRoles,
          allowedUsers
        },
        metadata: {
          totalFeatures: geoData.features?.length || 0,
          version: '1.0'
        }
      })

      // Encrypt and store the data
      secureGeoData.setData(geoData)

      // Log the creation
      if (userId) {
        secureGeoData.auditLog.push({
          action: 'created',
          userId,
          timestamp: new Date(),
          ipAddress,
          userAgent,
          details: `Stored ${dataType} data with ${geoData.features?.length || 0} features`
        })
      }

      await secureGeoData.save()
      
      return {
        success: true,
        id: secureGeoData._id,
        message: 'GeoJSON data stored securely'
      }

    } catch (error) {
      console.error('Error storing geo data:', error)
      return {
        success: false,
        message: 'Failed to store geo data: ' + error.message
      }
    }
  }

  /**
   * Retrieve GeoJSON data with access control
   */
  static async getGeoData(projectId, userId, userRole, options = {}) {
    try {
      const {
        dataType = 'geojson',
        includeMetadata = false,
        logAccess = true
      } = options

      // Find accessible data
      const secureData = await SecureGeoData.findAccessible(userId, userRole, {
        projectId,
        dataType
      }).populate('projectId', 'projectInfo.projectNumber projectInfo.secteur')

      if (!secureData.length) {
        return {
          success: false,
          message: 'No accessible geo data found for this project'
        }
      }

      const geoDataRecord = secureData[0]

      // Check specific access permissions
      if (!SecureGeoData.checkAccess(userId, userRole, geoDataRecord.securityLevel)) {
        return {
          success: false,
          message: 'Insufficient permissions to access this data'
        }
      }

      // Decrypt the data
      const decryptedData = geoDataRecord.data

      if (!decryptedData) {
        return {
          success: false,
          message: 'Failed to decrypt geo data'
        }
      }

      // Log access
      if (logAccess) {
        await geoDataRecord.logAccess('accessed', userId, null, null, 
          `Retrieved ${dataType} data`)
      }

      const result = {
        success: true,
        data: decryptedData
      }

      if (includeMetadata) {
        result.metadata = {
          id: geoDataRecord._id,
          securityLevel: geoDataRecord.securityLevel,
          totalFeatures: geoDataRecord.metadata.totalFeatures,
          lastModified: geoDataRecord.metadata.lastModified,
          version: geoDataRecord.metadata.version
        }
      }

      return result

    } catch (error) {
      console.error('Error retrieving geo data:', error)
      return {
        success: false,
        message: 'Failed to retrieve geo data: ' + error.message
      }
    }
  }

  /**
   * Import GeoJSON file from public directory to secure storage
   */
  static async importFromFile(filePath, projectId, options = {}) {
    try {
      // Read the file
      const fileContent = await fs.readFile(filePath, 'utf8')

      // Parse GeoJSON - handle both single features and feature collections
      let geoData
      const lines = fileContent.trim().split('\n').filter(line => line.trim())

      if (lines.length === 1) {
        // Single GeoJSON object
        geoData = JSON.parse(fileContent)
      } else {
        // Multiple feature objects (one per line) - like our project1.geojson
        const features = lines.map(line => {
          const trimmed = line.trim()
          // Handle lines that might end with comma
          const cleanLine = trimmed.endsWith(',') ? trimmed.slice(0, -1) : trimmed
          return JSON.parse(cleanLine)
        })

        geoData = {
          type: 'FeatureCollection',
          features: features
        }
      }

      // Store securely
      const result = await this.storeGeoData(projectId, geoData, {
        ...options,
        dataType: 'geojson'
      })

      if (result.success) {
        // Optionally remove the original file for security
        if (options.removeOriginal) {
          await fs.unlink(filePath)
          console.log(`Removed original file: ${filePath}`)
        }
      }

      return result

    } catch (error) {
      console.error('Error importing geo file:', error)
      return {
        success: false,
        message: 'Failed to import geo file: ' + error.message
      }
    }
  }

  /**
   * Export GeoJSON data (with audit logging)
   */
  static async exportGeoData(projectId, userId, userRole, format = 'geojson') {
    try {
      // Get the data
      const result = await this.getGeoData(projectId, userId, userRole, {
        logAccess: false // We'll log export separately
      })

      if (!result.success) {
        return result
      }

      // Log export action
      const secureData = await SecureGeoData.findOne({
        projectId,
        dataType: 'geojson'
      })

      if (secureData) {
        await secureData.logAccess('exported', userId, null, null, 
          `Exported data in ${format} format`)
      }

      return {
        success: true,
        data: result.data,
        filename: `project_${projectId}_geodata.${format}`
      }

    } catch (error) {
      console.error('Error exporting geo data:', error)
      return {
        success: false,
        message: 'Failed to export geo data: ' + error.message
      }
    }
  }

  /**
   * Update GeoJSON data
   */
  static async updateGeoData(projectId, newData, userId, userRole, options = {}) {
    try {
      // Find existing data
      const secureData = await SecureGeoData.findOne({
        projectId,
        dataType: options.dataType || 'geojson'
      })

      if (!secureData) {
        return {
          success: false,
          message: 'Geo data not found'
        }
      }

      // Check permissions
      if (!SecureGeoData.checkAccess(userId, userRole, secureData.securityLevel)) {
        return {
          success: false,
          message: 'Insufficient permissions to update this data'
        }
      }

      // Update the data
      secureData.setData(newData)

      // Log the update
      await secureData.logAccess('modified', userId, options.ipAddress, 
        options.userAgent, 'Updated geo data')

      await secureData.save()

      return {
        success: true,
        message: 'Geo data updated successfully'
      }

    } catch (error) {
      console.error('Error updating geo data:', error)
      return {
        success: false,
        message: 'Failed to update geo data: ' + error.message
      }
    }
  }

  /**
   * Delete GeoJSON data
   */
  static async deleteGeoData(projectId, userId, userRole, options = {}) {
    try {
      const secureData = await SecureGeoData.findOne({
        projectId,
        dataType: options.dataType || 'geojson'
      })

      if (!secureData) {
        return {
          success: false,
          message: 'Geo data not found'
        }
      }

      // Only admins can delete
      if (userRole !== 'admin') {
        return {
          success: false,
          message: 'Only administrators can delete geo data'
        }
      }

      // Log deletion before removing
      await secureData.logAccess('deleted', userId, options.ipAddress, 
        options.userAgent, 'Deleted geo data')

      await SecureGeoData.findByIdAndDelete(secureData._id)

      return {
        success: true,
        message: 'Geo data deleted successfully'
      }

    } catch (error) {
      console.error('Error deleting geo data:', error)
      return {
        success: false,
        message: 'Failed to delete geo data: ' + error.message
      }
    }
  }

  /**
   * Get audit log for geo data
   */
  static async getAuditLog(projectId, userId, userRole) {
    try {
      if (userRole !== 'admin' && userRole !== 'manager') {
        return {
          success: false,
          message: 'Insufficient permissions to view audit logs'
        }
      }

      const secureData = await SecureGeoData.findOne({
        projectId,
        dataType: 'geojson'
      }).populate('auditLog.userId', 'username email')

      if (!secureData) {
        return {
          success: false,
          message: 'Geo data not found'
        }
      }

      return {
        success: true,
        auditLog: secureData.auditLog
      }

    } catch (error) {
      console.error('Error retrieving audit log:', error)
      return {
        success: false,
        message: 'Failed to retrieve audit log: ' + error.message
      }
    }
  }
}

module.exports = SecureGeoService
