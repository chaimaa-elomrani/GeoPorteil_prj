import React, { useState, useEffect } from 'react'
import { Shield, Lock, Eye, Download, Trash2, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import SecureGeoService from '../services/secureGeoService'

const SecureGeoDataManager = ({ projectId, projectName }) => {
  const [securityStatus, setSecurityStatus] = useState(null)
  const [auditLog, setAuditLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})
  const [showAuditLog, setShowAuditLog] = useState(false)

  useEffect(() => {
    if (projectId) {
      fetchSecurityStatus()
      fetchAuditLog()
    }
  }, [projectId])

  const fetchSecurityStatus = async () => {
    try {
      setLoading(true)
      const response = await SecureGeoService.getSecurityStatus(projectId)
      if (response.success) {
        setSecurityStatus(response.status)
      }
    } catch (error) {
      console.error('Error fetching security status:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAuditLog = async () => {
    try {
      const response = await SecureGeoService.getAuditLog(projectId)
      if (response.success) {
        setAuditLog(SecureGeoService.formatAuditLog(response.auditLog))
      }
    } catch (error) {
      console.error('Error fetching audit log:', error)
    }
  }

  const handleExport = async () => {
    try {
      setActionLoading(prev => ({ ...prev, export: true }))
      const response = await SecureGeoService.exportGeoData(projectId)
      if (response.success) {
        // Refresh audit log to show export action
        await fetchAuditLog()
      } else {
        alert('Export failed: ' + response.message)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Export failed: ' + error.message)
    } finally {
      setActionLoading(prev => ({ ...prev, export: false }))
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete the secure geo data? This action cannot be undone.')) {
      return
    }

    try {
      setActionLoading(prev => ({ ...prev, delete: true }))
      const response = await SecureGeoService.deleteGeoData(projectId)
      if (response.success) {
        await fetchSecurityStatus()
        await fetchAuditLog()
        alert('Secure geo data deleted successfully')
      } else {
        alert('Delete failed: ' + response.message)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Delete failed: ' + error.message)
    } finally {
      setActionLoading(prev => ({ ...prev, delete: false }))
    }
  }

  const getSecurityLevelColor = (level) => {
    const colors = {
      public: 'bg-green-100 text-green-800 border-green-200',
      internal: 'bg-blue-100 text-blue-800 border-blue-200',
      confidential: 'bg-orange-100 text-orange-800 border-orange-200',
      restricted: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[level] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getSecurityLevelIcon = (level) => {
    const icons = {
      public: <Eye className="h-4 w-4" />,
      internal: <Shield className="h-4 w-4" />,
      confidential: <Lock className="h-4 w-4" />,
      restricted: <AlertTriangle className="h-4 w-4" />
    }
    return icons[level] || <Shield className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Secure Geo Data
              </h3>
              <p className="text-sm text-gray-500">
                {projectName} - Security & Access Control
              </p>
            </div>
          </div>
          
          {securityStatus?.isSecured && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExport}
                disabled={actionLoading.export}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span>{actionLoading.export ? 'Exporting...' : 'Export'}</span>
              </button>
              
              <button
                onClick={handleDelete}
                disabled={actionLoading.delete}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                <span>{actionLoading.delete ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Security Status */}
      <div className="p-6">
        {securityStatus?.isSecured ? (
          <div className="space-y-4">
            {/* Status Overview */}
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-700">
                Geo data is securely stored and encrypted
              </span>
            </div>

            {/* Security Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  {getSecurityLevelIcon(securityStatus.securityLevel)}
                  <span className="text-sm font-medium text-gray-700">Security Level</span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSecurityLevelColor(securityStatus.securityLevel)}`}>
                  {securityStatus.securityLevel?.toUpperCase()}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Total Features</div>
                <div className="text-2xl font-bold text-gray-900">
                  {securityStatus.totalFeatures?.toLocaleString() || 'N/A'}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Last Modified</div>
                <div className="text-sm text-gray-900">
                  {securityStatus.lastModified 
                    ? new Date(securityStatus.lastModified).toLocaleDateString()
                    : 'N/A'
                  }
                </div>
              </div>
            </div>

            {/* Audit Log Toggle */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowAuditLog(!showAuditLog)}
                className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Clock className="h-4 w-4" />
                <span>
                  {showAuditLog ? 'Hide' : 'Show'} Audit Log ({auditLog.length} entries)
                </span>
              </button>

              {showAuditLog && auditLog.length > 0 && (
                <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                  {auditLog.slice(0, 10).map((entry, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg text-sm">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{entry.actionIcon}</span>
                        <div>
                          <span className={`font-medium ${entry.actionColor}`}>
                            {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                          </span>
                          {entry.details && (
                            <span className="text-gray-600 ml-2">- {entry.details}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {entry.formattedTimestamp}
                      </span>
                    </div>
                  ))}
                  {auditLog.length > 10 && (
                    <div className="text-center py-2 text-sm text-gray-500">
                      ... and {auditLog.length - 10} more entries
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No Secure Geo Data Found
            </h4>
            <p className="text-gray-600 mb-4">
              {securityStatus?.hasAccess === false 
                ? 'You do not have permission to access geo data for this project.'
                : 'This project does not have geo data stored in secure storage.'
              }
            </p>
            {securityStatus?.message && (
              <p className="text-sm text-gray-500 italic">
                {securityStatus.message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SecureGeoDataManager
