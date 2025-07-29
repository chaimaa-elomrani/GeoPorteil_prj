import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Eye, Shield, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import AdminLayout from '../components/layout/AdminLayout'
import SecureGeoService from '../services/secureGeoService'
import { apiService } from '../services/api'

const ImportedProjectsPage = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchImportedProjects()
  }, [])

  const fetchImportedProjects = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Get all projects that have secure geo data
      const response = await apiService.makeRequest('/projects', 'GET')
      
      if (response.success) {
        // Filter projects that have geojsonData (imported projects)
        const importedProjects = response.data.filter(project => 
          project.geojsonData && 
          project.metadata?.importSource === 'Frontend Upload'
        )
        
        setProjects(importedProjects)
      } else {
        setError('Failed to fetch projects')
      }
    } catch (error) {
      console.error('Error fetching imported projects:', error)
      setError('An error occurred while fetching projects')
    } finally {
      setLoading(false)
    }
  }

  const handleViewOnMap = (project) => {
    // Navigate to map view with project data
    navigate(`/projects/${project._id}/map`)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Imported Projects">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading imported projects...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Imported Projects">
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Imported Projects</CardTitle>
                  <p className="text-gray-600 mt-1">
                    View and manage your securely imported GeoJSON projects
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={fetchImportedProjects}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button onClick={() => navigate('/projects/import')}>
                  Import New Project
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No imported projects found
                </h3>
                <p className="text-gray-600 mb-6">
                  Start by importing your first GeoJSON project
                </p>
                <Button onClick={() => navigate('/projects/import')}>
                  Import Your First Project
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">
                        {project.projectInfo?.secteur || project.metadata?.description || 'Unnamed Project'}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Project #{project.projectInfo?.projectNumber}
                      </p>
                    </div>
                    <div className="ml-2">
                      <Shield className="h-5 w-5 text-blue-600" title="Securely stored" />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Project Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Features:</span>
                      <p className="font-medium">
                        {project.geojsonData?.features?.length || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.projectInfo?.status)}`}>
                        {project.projectInfo?.status || 'Active'}
                      </span>
                    </div>
                  </div>

                  {/* Creation Date */}
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Created {formatDate(project.createdAt)}</span>
                  </div>

                  {/* Description */}
                  {project.metadata?.description && (
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {project.metadata.description}
                    </p>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={() => handleViewOnMap(project)}
                    className="w-full"
                    variant="outline"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View on Map
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {projects.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-900">{projects.length}</p>
                  <p className="text-blue-700">Total Projects</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-900">
                    {projects.reduce((sum, p) => sum + (p.geojsonData?.features?.length || 0), 0)}
                  </p>
                  <p className="text-blue-700">Total Features</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-900">
                    {projects.filter(p => p.projectInfo?.status === 'active').length}
                  </p>
                  <p className="text-blue-700">Active Projects</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}

export default ImportedProjectsPage
