import { apiService } from './api'

class SecureGeoService {
  
  /**
   * Get secure GeoJSON data for a project
   */
  static async getGeoData(projectId, includeMetadata = false) {
    try {
      const response = await apiService.makeRequest(
        `/secure-geo/${projectId}?includeMetadata=${includeMetadata}`,
        'GET'
      )
      return response
    } catch (error) {
      console.error('Error fetching secure geo data:', error)
      return {
        success: false,
        message: error.message || 'Failed to fetch secure geo data'
      }
    }
  }

  /**
   * Update GeoJSON data for a project
   */
  static async updateGeoData(projectId, geoData) {
    try {
      const response = await apiService.makeRequest(
        `/secure-geo/${projectId}`,
        'PUT',
        { geoData }
      )
      return response
    } catch (error) {
      console.error('Error updating secure geo data:', error)
      return {
        success: false,
        message: error.message || 'Failed to update secure geo data'
      }
    }
  }

  /**
   * Export GeoJSON data
   */
  static async exportGeoData(projectId, format = 'geojson') {
    try {
      const response = await fetch(`/api/secure-geo/${projectId}/export?format=${format}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Export failed')
      }

      // Get filename from headers
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `project_${projectId}_geodata.${format}`

      // Get the data
      const data = await response.json()

      // Create download
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return {
        success: true,
        message: 'Data exported successfully'
      }

    } catch (error) {
      console.error('Error exporting secure geo data:', error)
      return {
        success: false,
        message: error.message || 'Failed to export secure geo data'
      }
    }
  }

  /**
   * Delete GeoJSON data
   */
  static async deleteGeoData(projectId) {
    try {
      const response = await apiService.makeRequest(
        `/secure-geo/${projectId}`,
        'DELETE'
      )
      return response
    } catch (error) {
      console.error('Error deleting secure geo data:', error)
      return {
        success: false,
        message: error.message || 'Failed to delete secure geo data'
      }
    }
  }

  /**
   * Get audit log for GeoJSON data
   */
  static async getAuditLog(projectId) {
    try {
      const response = await apiService.makeRequest(
        `/secure-geo/${projectId}/audit`,
        'GET'
      )
      return response
    } catch (error) {
      console.error('Error fetching audit log:', error)
      return {
        success: false,
        message: error.message || 'Failed to fetch audit log'
      }
    }
  }

  /**
   * Get security status of geo data
   */
  static async getSecurityStatus(projectId) {
    try {
      const response = await apiService.makeRequest(
        `/secure-geo/${projectId}/status`,
        'GET'
      )
      return response
    } catch (error) {
      console.error('Error fetching security status:', error)
      return {
        success: false,
        message: error.message || 'Failed to fetch security status'
      }
    }
  }

  /**
   * Import GeoJSON file to secure storage
   */
  static async importGeoData(projectId, filePath, options = {}) {
    try {
      const response = await apiService.makeRequest(
        `/secure-geo/import/${projectId}`,
        'POST',
        {
          filePath,
          removeOriginal: options.removeOriginal || false,
          securityLevel: options.securityLevel || 'confidential'
        }
      )
      return response
    } catch (error) {
      console.error('Error importing geo data:', error)
      return {
        success: false,
        message: error.message || 'Failed to import geo data'
      }
    }
  }

  /**
   * Migrate public files to secure storage (admin only)
   */
  static async migratePublicFiles() {
    try {
      const response = await apiService.makeRequest(
        '/secure-geo/migrate',
        'POST'
      )
      return response
    } catch (error) {
      console.error('Error migrating public files:', error)
      return {
        success: false,
        message: error.message || 'Failed to migrate public files'
      }
    }
  }

  /**
   * Check if project has secure geo data
   */
  static async hasSecureGeoData(projectId) {
    try {
      const statusResponse = await this.getSecurityStatus(projectId)
      return statusResponse.success && statusResponse.status?.isSecured
    } catch (error) {
      console.error('Error checking secure geo data:', error)
      return false
    }
  }

  /**
   * Get geo data for map display (handles both secure and legacy)
   */
  static async getGeoDataForMap(projectId) {
    try {
      // First try to get secure data
      const secureResponse = await this.getGeoData(projectId)
      
      if (secureResponse.success) {
        return {
          success: true,
          data: secureResponse.data,
          source: 'secure',
          metadata: secureResponse.metadata
        }
      }

      // Fallback to legacy public file (if exists)
      try {
        const legacyResponse = await fetch('/project1.geojson')
        if (legacyResponse.ok) {
          const legacyText = await legacyResponse.text()
          
          // Parse legacy format (one feature per line)
          const lines = legacyText.trim().split('\n').filter(line => line.trim())
          const features = lines.map(line => {
            const trimmed = line.trim()
            const cleanLine = trimmed.endsWith(',') ? trimmed.slice(0, -1) : trimmed
            return JSON.parse(cleanLine)
          })
          
          const geoData = {
            type: 'FeatureCollection',
            features: features
          }

          return {
            success: true,
            data: geoData,
            source: 'legacy',
            warning: 'Using legacy public file. Consider migrating to secure storage.'
          }
        }
      } catch (legacyError) {
        console.warn('Legacy file not accessible:', legacyError)
      }

      return {
        success: false,
        message: 'No geo data found for this project'
      }

    } catch (error) {
      console.error('Error getting geo data for map:', error)
      return {
        success: false,
        message: error.message || 'Failed to get geo data'
      }
    }
  }

  /**
   * Format audit log for display
   */
  static formatAuditLog(auditLog) {
    return auditLog.map(entry => ({
      ...entry,
      formattedTimestamp: new Date(entry.timestamp).toLocaleString(),
      actionIcon: this.getActionIcon(entry.action),
      actionColor: this.getActionColor(entry.action)
    }))
  }

  /**
   * Get icon for audit action
   */
  static getActionIcon(action) {
    const icons = {
      created: '📝',
      accessed: '👁️',
      modified: '✏️',
      exported: '📤',
      deleted: '🗑️'
    }
    return icons[action] || '📋'
  }

  /**
   * Get color for audit action
   */
  static getActionColor(action) {
    const colors = {
      created: 'text-green-600',
      accessed: 'text-blue-600',
      modified: 'text-yellow-600',
      exported: 'text-purple-600',
      deleted: 'text-red-600'
    }
    return colors[action] || 'text-gray-600'
  }
}

export default SecureGeoService
