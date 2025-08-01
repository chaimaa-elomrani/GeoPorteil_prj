"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { MapContainer, TileLayer, Marker, Popup, LayersControl, GeoJSON } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Custom CSS for enhanced popups
const customPopupStyles = `
  .leaflet-popup-content-wrapper {
    border-radius: 20px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    border: none;
    background: white;
    padding: 0;
  }
  .leaflet-popup-content {
    margin: 0;
    line-height: 1.6;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
  }
  .leaflet-popup-tip {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  .leaflet-popup-close-button {
    color: #9ca3af;
    font-size: 20px;
    font-weight: bold;
    padding: 10px;
    right: 8px;
    top: 8px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  .leaflet-popup-close-button:hover {
    color: #374151;
    background: rgba(255, 255, 255, 1);
    transform: scale(1.1);
  }
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`

// Inject custom styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = customPopupStyles
  document.head.appendChild(styleSheet)
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Calendar, User, Building } from "lucide-react"
import { apiService } from "../services/api"

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

const { BaseLayer } = LayersControl

// GeoJSON styling function
const getFeatureStyle = (feature) => {
  const type = feature.properties?.type || 'default'

  const styles = {
    education: { color: '#3B82F6', fillColor: '#DBEAFE', weight: 2, fillOpacity: 0.6 },
    health: { color: '#EF4444', fillColor: '#FEE2E2', weight: 2, fillOpacity: 0.6 },
    road: { color: '#6B7280', weight: 4, opacity: 0.8 },
    park: { color: '#10B981', fillColor: '#D1FAE5', weight: 2, fillOpacity: 0.6 },
    default: { color: '#8B5CF6', fillColor: '#EDE9FE', weight: 2, fillOpacity: 0.6 }
  }

  return styles[type] || styles.default
}

// GeoJSON popup content
const getFeaturePopup = (feature) => {
  const props = feature.properties || {}
  return `
    <div class="p-2">
      <h3 class="font-semibold text-lg">${props.name || 'Feature'}</h3>
      ${props.type ? `<p class="text-sm text-gray-600 capitalize">Type: ${props.type}</p>` : ''}
      ${props.description ? `<p class="text-sm text-gray-700 mt-1">${props.description}</p>` : ''}
      ${props.surface ? `<p class="text-sm text-gray-600">Surface: ${props.surface}</p>` : ''}
    </div>
  `
}

export default function ProjectsMapWithProject() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mapCenter, setMapCenter] = useState([33.9716, -6.8498]) // Default to Rabat, Morocco
  const [mapZoom, setMapZoom] = useState(6)
  const mapRef = useRef()

  useEffect(() => {
    if (projectId) {
      fetchProject()
    }
  }, [projectId])

  const fetchProject = async () => {
    try {
      setLoading(true)
      console.log("🔄 Fetching project for map with ID:", projectId)
      const response = await apiService.getProjectById(projectId)
      console.log("📊 Project response:", response)
      const projectData = response.data || response
      setProject(projectData)

      // Set map center based on project coordinates or GeoJSON data
      if (projectData.geoJsonData && projectData.geoJsonData.features && projectData.geoJsonData.features.length > 0) {
        // Calculate center from GeoJSON features
        let totalLat = 0, totalLng = 0, pointCount = 0

        projectData.geoJsonData.features.forEach(feature => {
          if (feature.geometry.type === 'Point') {
            totalLng += feature.geometry.coordinates[0]
            totalLat += feature.geometry.coordinates[1]
            pointCount++
          }
        })

        if (pointCount > 0) {
          setMapCenter([totalLat / pointCount, totalLng / pointCount])
          setMapZoom(15)
        } else {
          // Use first feature coordinates if no points
          const firstFeature = projectData.geoJsonData.features[0]
          if (firstFeature.geometry.coordinates) {
            const coords = firstFeature.geometry.coordinates
            if (firstFeature.geometry.type === 'LineString') {
              const midPoint = coords[Math.floor(coords.length / 2)]
              setMapCenter([midPoint[1], midPoint[0]])
              setMapZoom(14)
            }
          }
        }
      } else if (projectData.latitude && projectData.longitude) {
        setMapCenter([Number.parseFloat(projectData.latitude), Number.parseFloat(projectData.longitude)])
        setMapZoom(15)
      } else if (projectData.coordonneesX && projectData.coordonneesY) {
        // Convert Lambert coordinates to lat/lng if needed
        // For now, we'll use a default center
        setMapCenter([33.9716, -6.8498])
        setMapZoom(10)
      }
    } catch (error) {
      console.error("❌ Error fetching project:", error)
      setError("Erreur lors du chargement du projet: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      "En cours": { color: "bg-blue-100 text-blue-800" },
      livré: { color: "bg-green-100 text-green-800" },
      Suspendu: { color: "bg-red-100 text-red-800" },
      Terminé: { color: "bg-gray-100 text-gray-800" },
    }

    const config = statusConfig[status] || { color: "bg-gray-100 text-gray-800" }

    return <Badge className={config.color}>{status}</Badge>
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Non défini"
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const handleViewDetails = () => {
    navigate(`/projects/${projectId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du projet...</p>
          <p className="text-sm text-gray-500 mt-2">ID: {projectId}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Projet non trouvé</h3>
          <p className="mt-1 text-sm text-gray-500">Le projet demandé n'existe pas.</p>
          <Button onClick={() => navigate("/dashboard/projects")} className="mt-4">
            Retour aux projets
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/projects")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-bold text-gray-900">Projet {project.projectNumber}</h1>
          </div>

          <div className="flex items-center justify-between">
            {getStatusBadge(project.projectStatus)}
            <Button size="sm" onClick={handleViewDetails}>
              Voir détails
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Project Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building className="h-4 w-4" />
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-600">Numéro:</span>
                <p className="text-gray-900">{project.projectNumber}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Année:</span>
                <p className="text-gray-900">{project.anneeProjet}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Consistance:</span>
                <p className="text-gray-900">{project.consistance || "Non défini"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Localisation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-600">Région:</span>
                <p className="text-gray-900">{project.region || "Non défini"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Préfecture:</span>
                <p className="text-gray-900">{project.prefecture || "Non défini"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Commune:</span>
                <p className="text-gray-900">{project.Commune || "Non défini"}</p>
              </div>
              {project.latitude && project.longitude && (
                <>
                  <div>
                    <span className="font-medium text-gray-600">Latitude:</span>
                    <p className="text-gray-900">{project.latitude}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Longitude:</span>
                    <p className="text-gray-900">{project.longitude}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Client */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Maître d'ouvrage
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="text-gray-900">{project.maitreOuvrage?.name || "Non défini"}</p>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Planning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-600">Début:</span>
                <p className="text-gray-900">{formatDate(project.dateDebutProjet)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Livraison:</span>
                <p className="text-gray-900">{formatDate(project.dateLivraisonPrevue)}</p>
              </div>
            </CardContent>
          </Card>

          {/* GeoJSON Features */}
          {project.geoJsonData && project.geoJsonData.features && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Éléments Géographiques ({project.geoJsonData.features.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {project.geoJsonData.features.slice(0, 5).map((feature, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded border">
                    <div className="font-medium text-gray-900">
                      {feature.properties?.name || `Feature ${index + 1}`}
                    </div>
                    {feature.properties?.type && (
                      <div className="text-xs text-gray-600 capitalize">
                        Type: {feature.properties.type}
                      </div>
                    )}
                    {feature.properties?.description && (
                      <div className="text-xs text-gray-600 mt-1">
                        {feature.properties.description}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      Géométrie: {feature.geometry?.type}
                    </div>
                  </div>
                ))}
                {project.geoJsonData.features.length > 5 && (
                  <div className="text-xs text-gray-500 text-center py-2">
                    ... et {project.geoJsonData.features.length - 5} autres éléments
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer center={mapCenter} zoom={mapZoom} className="h-full w-full" ref={mapRef}>
          <LayersControl position="topleft">
            <BaseLayer checked name="🗺️ OpenStreetMap">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </BaseLayer>
            <BaseLayer name="🛰️ Satellite (Esri)">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>, DigitalGlobe, GeoEye, Earthstar Geographics'
              />
            </BaseLayer>
            <BaseLayer name="🌍 Terrain (OpenTopo)">
              <TileLayer
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://opentopomap.org/">OpenTopoMap</a> contributors'
              />
            </BaseLayer>
            <BaseLayer name="🗺️ CartoDB Positron">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
            </BaseLayer>
            <BaseLayer name="🌙 CartoDB Dark">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
            </BaseLayer>
            <BaseLayer name="🛰️ Google Satellite">
              <TileLayer
                url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                attribution='&copy; Google'
              />
            </BaseLayer>
            <BaseLayer name="🗺️ Google Streets">
              <TileLayer
                url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                attribution='&copy; Google'
              />
            </BaseLayer>
            <BaseLayer name="🌍 Google Terrain">
              <TileLayer
                url="https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
                attribution='&copy; Google'
              />
            </BaseLayer>
            <BaseLayer name="🛣️ OpenStreetMap France">
              <TileLayer
                url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </BaseLayer>
            <BaseLayer name="🏔️ Stamen Terrain">
              <TileLayer
                url="https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png"
                attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </BaseLayer>
            <BaseLayer name="🎨 Stamen Watercolor">
              <TileLayer
                url="https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg"
                attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </BaseLayer>
          </LayersControl>

          {/* Project Area Polygon */}
          {project.latitude && project.longitude && (
            <>
              {/* Project Center Marker */}
              <Marker position={[Number.parseFloat(project.latitude), Number.parseFloat(project.longitude)]}>
                <Popup maxWidth={450} minWidth={350} className="custom-popup">
                  <div className="p-5 w-full">
                    {/* Header */}
                    <div className="text-center mb-4">
                      <h3 className="font-bold text-2xl text-gray-900 mb-2">Projet {project.projectNumber}</h3>
                      <div className="flex items-center justify-center space-x-3">
                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          Année {project.anneeProjet}
                        </span>
                        {getStatusBadge(project.projectStatus)}
                      </div>
                    </div>

                    {/* Project Image */}
                    {project.images && project.images.length > 0 && (
                      <div className="mb-5">
                        <div className="rounded-xl h-48 overflow-hidden shadow-lg">
                          <img
                            src={project.images[0]}
                            alt="Project"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {project.images.length > 1 && (
                          <div className="text-center mt-2">
                            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                              +{project.images.length - 1} autres photos
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Project Details */}
                    <div className="space-y-4 mb-5">
                      {/* Description */}
                      {project.consistance && (
                        <div className="text-center">
                          <p className="text-base text-gray-700 leading-relaxed line-clamp-2">
                            {project.consistance}
                          </p>
                        </div>
                      )}

                      {/* Location */}
                      <div className="text-center">
                        <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm font-medium text-blue-800">
                            {project.region} - {project.prefecture}
                          </span>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {project.coordonneesX && project.coordonneesY && (
                          <div className="text-center bg-gray-50 p-2 rounded-lg">
                            <p className="font-medium text-gray-700">Coordonnées</p>
                            <p className="text-gray-600 font-mono text-xs">
                              {Number.parseFloat(project.latitude || 0).toFixed(4)}, {Number.parseFloat(project.longitude || 0).toFixed(4)}
                            </p>
                          </div>
                        )}
                        {project.anneeProjet && (
                          <div className="text-center bg-gray-50 p-2 rounded-lg">
                            <p className="font-medium text-gray-700">Année</p>
                            <p className="text-gray-600">{project.anneeProjet}</p>
                          </div>
                        )}
                      </div>

                      {/* Dates */}
                      {(project.dateDebutProjet || project.dateLivraisonPrevue) && (
                        <div className="flex justify-center space-x-4 text-xs text-gray-600">
                          {project.dateDebutProjet && (
                            <div className="text-center">
                              <p className="font-medium">Début</p>
                              <p>{formatDate(project.dateDebutProjet)}</p>
                            </div>
                          )}
                          {project.dateLivraisonPrevue && (
                            <div className="text-center">
                              <p className="font-medium">Livraison</p>
                              <p>{formatDate(project.dateLivraisonPrevue)}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Progress indicator if available */}
                      {project.projectStatus && (
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">Avancement du projet</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                project.projectStatus === 'livré' ? 'bg-green-500 w-full' :
                                project.projectStatus === 'En cours' ? 'bg-blue-500 w-3/4' :
                                project.projectStatus === 'Suspendu' ? 'bg-orange-500 w-1/2' :
                                'bg-gray-400 w-1/4'
                              }`}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Files Section - Only show if files exist */}
                    {project.files && project.files.length > 0 && (
                      <div className="mb-4">
                        <div className="text-center">
                          <div className="inline-flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-full">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">
                              {project.files.length} document{project.files.length > 1 ? 's' : ''} attaché{project.files.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="text-center pt-4 border-t border-gray-200">
                      <button
                        onClick={() => navigate(`/projects/${project._id}`)}
                        className="bg-[#354939] hover:bg-[#2a3a2d] text-white px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        Voir les détails complets
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Project Area Polygon */}
              <GeoJSON
                data={{
                  type: "Feature",
                  properties: {
                    name: `Zone du Projet ${project.projectNumber}`,
                    type: "project_area",
                    description: project.consistance
                  },
                  geometry: {
                    type: "Polygon",
                    coordinates: [[
                      [Number.parseFloat(project.longitude) - 0.005, Number.parseFloat(project.latitude) - 0.005],
                      [Number.parseFloat(project.longitude) + 0.005, Number.parseFloat(project.latitude) - 0.005],
                      [Number.parseFloat(project.longitude) + 0.005, Number.parseFloat(project.latitude) + 0.005],
                      [Number.parseFloat(project.longitude) - 0.005, Number.parseFloat(project.latitude) + 0.005],
                      [Number.parseFloat(project.longitude) - 0.005, Number.parseFloat(project.latitude) - 0.005]
                    ]]
                  }
                }}
                style={{
                  color: '#354939',
                  weight: 3,
                  opacity: 0.8,
                  fillColor: '#354939',
                  fillOpacity: 0.2,
                  dashArray: '5, 5'
                }}
                onEachFeature={(feature, layer) => {
                  layer.bindPopup(`
                    <div class="p-2">
                      <h3 class="font-semibold">${feature.properties.name}</h3>
                      <p class="text-sm text-gray-600">${feature.properties.description}</p>
                      <p class="text-sm text-gray-500 mt-1">Zone d'intervention du projet</p>
                    </div>
                  `)
                }}
              />
            </>
          )}

          {/* GeoJSON Features */}
          {project.geoJsonData && project.geoJsonData.features && (
            <GeoJSON
              data={project.geoJsonData}
              style={getFeatureStyle}
              onEachFeature={(feature, layer) => {
                if (feature.properties) {
                  layer.bindPopup(getFeaturePopup(feature))
                }
              }}
            />
          )}
        </MapContainer>

        {/* Map Info Panel */}
        <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[1000] text-sm">
          <p className="text-gray-600">💡 Utilisez le contrôle des couches pour changer la vue</p>
        </div>
      </div>
    </div>
  )
}
