import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, GeoJSON, LayersControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ArrowLeft, MapPin, Info, Shield, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import AdminLayout from '../components/layout/AdminLayout'
import SecureGeoService from '../services/secureGeoService'
import { apiService } from '../services/api'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const ProjectMapPage = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [geoData, setGeoData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedFeature, setSelectedFeature] = useState(null)

  useEffect(() => {
    if (projectId) {
      fetchProjectData()
    }
  }, [projectId])

  const fetchProjectData = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Fetch project details
      const projectResponse = await apiService.makeRequest(`/projects/${projectId}`, 'GET')
      
      if (projectResponse.success) {
        setProject(projectResponse.data)
        
        // Get GeoJSON data (try secure first, then fallback to project data)
        if (projectResponse.data.geojsonData) {
          setGeoData(projectResponse.data.geojsonData)
        } else {
          // Try to get from secure storage
          const secureResponse = await SecureGeoService.getGeoData(projectId)
          if (secureResponse.success) {
            setGeoData(secureResponse.data)
          } else {
            setError('No geographic data found for this project')
          }
        }
      } else {
        setError('Project not found')
      }
    } catch (error) {
      console.error('Error fetching project data:', error)
      setError('An error occurred while loading the project')
    } finally {
      setLoading(false)
    }
  }

  const getFeatureStyle = (feature) => {
    const geometryType = feature.geometry.type
    
    switch (geometryType) {
      case 'Point':
        return {
          radius: 8,
          fillColor: '#3b82f6',
          color: '#1e40af',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }
      case 'LineString':
      case 'MultiLineString':
        return {
          color: '#ef4444',
          weight: 3,
          opacity: 0.8
        }
      case 'Polygon':
      case 'MultiPolygon':
        return {
          fillColor: '#10b981',
          fillOpacity: 0.4,
          color: '#059669',
          weight: 2,
          opacity: 0.8
        }
      default:
        return {
          color: '#6b7280',
          weight: 2,
          opacity: 0.8
        }
    }
  }

  const onEachFeature = (feature, layer) => {
    // Add click event
    layer.on('click', () => {
      setSelectedFeature(feature)
    })

    // Add hover effects
    layer.on('mouseover', () => {
      if (feature.geometry.type !== 'Point') {
        layer.setStyle({
          weight: 4,
          opacity: 1,
          fillOpacity: 0.6
        })
      }
    })

    layer.on('mouseout', () => {
      if (feature.geometry.type !== 'Point') {
        layer.setStyle(getFeatureStyle(feature))
      }
    })

    // Add popup with basic info
    if (feature.properties) {
      const popupContent = Object.entries(feature.properties)
        .filter(([key, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
        .join('<br>')
      
      if (popupContent) {
        layer.bindPopup(popupContent)
      }
    }
  }

  const pointToLayer = (feature, latlng) => {
    return L.circleMarker(latlng, getFeatureStyle(feature))
  }

  const calculateMapCenter = () => {
    if (!geoData || !geoData.features || geoData.features.length === 0) {
      return [33.589886, -7.620037] // Default to Casablanca
    }

    const bounds = L.geoJSON(geoData).getBounds()
    return bounds.getCenter()
  }

  if (loading) {
    return (
      <AdminLayout title="Project Map">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading project map...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout title="Project Map">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Project</h3>
                <p className="text-red-700 mb-6">{error}</p>
                <div className="space-x-4">
                  <Button onClick={fetchProjectData} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button onClick={() => navigate('/projects/imported')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Projects
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={`Map: ${project?.projectInfo?.secteur || 'Project'}`}>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/projects/imported')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Projects
                </Button>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <h1 className="text-xl font-bold">
                      {project?.projectInfo?.secteur || project?.metadata?.description || 'Project Map'}
                    </h1>
                    <p className="text-gray-600 text-sm">
                      Project #{project?.projectInfo?.projectNumber} • {geoData?.features?.length || 0} features
                    </p>
                  </div>
                </div>
              </div>
              <Button onClick={fetchProjectData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Map and Info */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                <div className="h-[600px] rounded-lg overflow-hidden">
                  {geoData ? (
                    <MapContainer
                      center={calculateMapCenter()}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <LayersControl position="topright">
                        <LayersControl.BaseLayer checked name="OpenStreetMap">
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="Satellite">
                          <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                          />
                        </LayersControl.BaseLayer>
                      </LayersControl>
                      
                      <GeoJSON
                        data={geoData}
                        style={getFeatureStyle}
                        onEachFeature={onEachFeature}
                        pointToLayer={pointToLayer}
                      />
                    </MapContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No geographic data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Info className="h-5 w-5 mr-2" />
                  Project Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <p>{project?.projectInfo?.secteur || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Number:</span>
                  <p>{project?.projectInfo?.projectNumber || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Features:</span>
                  <p>{geoData?.features?.length || 0}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <p>{project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                {project?.metadata?.description && (
                  <div>
                    <span className="font-medium text-gray-700">Description:</span>
                    <p className="text-gray-600">{project.metadata.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected Feature Info */}
            {selectedFeature && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Selected Feature</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <p>{selectedFeature.geometry.type}</p>
                  </div>
                  {selectedFeature.properties && Object.entries(selectedFeature.properties)
                    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
                    .map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium text-gray-700">{key}:</span>
                        <p className="break-words">{String(value)}</p>
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default ProjectMapPage
