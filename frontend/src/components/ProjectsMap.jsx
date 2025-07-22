"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, GeoJSON, LayersControl, ScaleControl, ZoomControl } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useProjects } from "../hooks/useProjects"

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

const { BaseLayer, Overlay } = LayersControl

const ProjectsMap = () => {
  const { projects, loading, fetchProjectGeoJSON } = useProjects()
  const [filteredProjects, setFilteredProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [geoJsonData, setGeoJsonData] = useState(null)
  const [mapLoading, setMapLoading] = useState(false)
  const mapRef = useRef()

  // Filter projects based on search and status
  useEffect(() => {
    let filtered = projects

    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((project) => project.status.toLowerCase() === statusFilter.toLowerCase())
    }

    setFilteredProjects(filtered)
  }, [projects, searchTerm, statusFilter])

  // Handle project card click
  const handleProjectClick = async (project) => {
    if (selectedProject?._id === project._id) return

    try {
      setMapLoading(true)
      setSelectedProject(project)

      // Clear existing layers
      setGeoJsonData(null)

      // Fetch and load GeoJSON data
      const geoData = await fetchProjectGeoJSON(project.geoJsonUrl)
      setGeoJsonData(geoData)

      // Fit map bounds to the new data
      if (mapRef.current && geoData) {
        const geoJsonLayer = L.geoJSON(geoData)
        const bounds = geoJsonLayer.getBounds()
        if (bounds.isValid()) {
          mapRef.current.fitBounds(bounds, { padding: [20, 20] })
        }
      }
    } catch (error) {
      console.error("Error loading project data:", error)
    } finally {
      setMapLoading(false)
    }
  }

  // GeoJSON styling function
  const geoJsonStyle = (feature) => ({
    color: feature.properties.status === "active" ? "#22c55e" : "#e11d48",
    fillOpacity: 0.5,
    weight: 2,
    fillColor:
      feature.properties.type === "residential"
        ? "#3b82f6"
        : feature.properties.type === "industrial"
          ? "#f59e0b"
          : feature.properties.type === "agricultural"
            ? "#10b981"
            : "#8b5cf6",
  })

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-red-100 text-red-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Projets GIS Maroc</h1>

          {/* Search box */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">Tous les statuts</option>
            <option value="Active">Actif</option>
            <option value="Draft">Brouillon</option>
            <option value="Closed">Fermé</option>
          </select>
        </div>

        {/* Projects list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Chargement...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun projet trouvé</p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project._id}
                onClick={() => handleProjectClick(project)}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedProject?._id === project._id ? "ring-2 ring-blue-500 bg-blue-50" : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 truncate flex-1">{project.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                {project.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{project.description}</p>
                )}

                <p className="text-xs text-gray-500">
                  Mis à jour le {formatDate(project.updatedAt || project.createdAt)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 relative">
        {mapLoading && (
          <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg z-[1000] flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm">Chargement de la carte...</span>
          </div>
        )}

        <MapContainer
          center={[33.9716, -6.8498]} // Rabat, Morocco coordinates
          zoom={6}
          className="h-full w-full"
          ref={mapRef}
          zoomControl={false} // We'll add custom zoom control
        >
          {/* Layer Control for switching between map types */}
          <LayersControl position="topleft">
            {/* Base Layers */}
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

            <BaseLayer name="🎨 Stamen Watercolor">
              <TileLayer
                url="https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg"
                attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </BaseLayer>

            {/* Overlay Layers */}
            {geoJsonData && (
              <Overlay checked name={`📍 ${selectedProject?.name || "Données GeoJSON"}`}>
                <GeoJSON
                  key={selectedProject?._id} // Force re-render when project changes
                  data={geoJsonData}
                  style={geoJsonStyle}
                  onEachFeature={(feature, layer) => {
                    if (feature.properties) {
                      const popupContent = Object.entries(feature.properties)
                        .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                        .join("<br>")
                      layer.bindPopup(popupContent)
                    }
                  }}
                />
              </Overlay>
            )}
          </LayersControl>

          {/* Custom Zoom Control */}
          <ZoomControl position="bottomright" />

          {/* Scale Control */}
          <ScaleControl position="bottomleft" />
        </MapContainer>

        {/* Legend */}
        {selectedProject && (
          <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg z-[1000] max-w-xs">
            <h4 className="font-semibold mb-2">{selectedProject.name}</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Actif</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Inactif</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Résidentiel</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>Industriel</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <span>Agricole</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span>Autre</span>
              </div>
            </div>
          </div>
        )}

        {/* Map Info Panel */}
        <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[900] text-sm">
          <p className="text-gray-600">💡 Utilisez le contrôle des couches pour changer la vue</p>
        </div>
      </div>
    </div>
  )
}

export default ProjectsMap
