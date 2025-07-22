import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON, LayersControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ArrowLeft, Upload, Eye, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

const { BaseLayer } = LayersControl

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const GeoJsonViewer = () => {
  const navigate = useNavigate()
  const [geoJsonData, setGeoJsonData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [mapCenter, setMapCenter] = useState([33.5932, -7.5673]) // Default to the building location
  const [mapZoom, setMapZoom] = useState(18)
  const [imageGallery, setImageGallery] = useState({ isOpen: false, images: [], currentIndex: 0, buildingId: '' })

  // Load the project1.geojson file on component mount
  useEffect(() => {
    loadGeoJsonFile()

    // Add global function for popup buttons
    window.openBuildingGallery = (buildingId, photoField) => {
      openImageGallery(buildingId, photoField)
    }

    // Cleanup
    return () => {
      delete window.openBuildingGallery
    }
  }, [])

  const loadGeoJsonFile = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/project1.geojson')
      if (!response.ok) {
        throw new Error('Failed to load GeoJSON file')
      }

      const text = await response.text()
      console.log('📍 Raw GeoJSON text:', text.substring(0, 200) + '...')

      // Parse line-delimited GeoJSON features
      const lines = text.trim().split('\n')
      const features = lines.map(line => {
        try {
          return JSON.parse(line.trim())
        } catch (e) {
          console.warn('Failed to parse line:', line)
          return null
        }
      }).filter(Boolean)

      // Create a proper FeatureCollection
      const data = {
        type: "FeatureCollection",
        features: features
      }

      console.log('📍 Processed GeoJSON data:', data)
      console.log('📊 Number of features:', features.length)

      setGeoJsonData(data)
      
      // Calculate map center from the data
      if (data.features && data.features.length > 0) {
        const firstFeature = data.features[0]
        if (firstFeature.geometry.type === 'Polygon') {
          const coords = firstFeature.geometry.coordinates[0][0]
          setMapCenter([coords[1], coords[0]]) // [lat, lng]
          setMapZoom(19)
        }
      }
      
    } catch (err) {
      console.error('❌ Error loading GeoJSON:', err)
      setError('Erreur lors du chargement du fichier GeoJSON: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Style function for GeoJSON features
  const getFeatureStyle = (feature) => {
    const classification = feature.properties?.Classific || 'default'
    
    const styles = {
      'Danger': { 
        color: '#dc2626', 
        fillColor: '#fca5a5', 
        weight: 3, 
        fillOpacity: 0.7,
        dashArray: '5, 5'
      },
      'Bon': { 
        color: '#16a34a', 
        fillColor: '#86efac', 
        weight: 2, 
        fillOpacity: 0.6 
      },
      'Moyen': { 
        color: '#ea580c', 
        fillColor: '#fdba74', 
        weight: 2, 
        fillOpacity: 0.6 
      },
      'default': { 
        color: '#3b82f6', 
        fillColor: '#93c5fd', 
        weight: 2, 
        fillOpacity: 0.6 
      }
    }
    
    return styles[classification] || styles.default
  }

  // Function to get building images
  const getBuildingImages = (buildingId, photoField) => {
    const images = []

    // Primary image based on building ID
    const primaryImage = `/project1_images/${buildingId}_F01.jpg`
    images.push(primaryImage)

    // Additional images from Photo field (e.g., "374-1;374-2;374-3;374-4")
    if (photoField && typeof photoField === 'string') {
      const photoIds = photoField.split(';').map(id => id.trim())
      photoIds.forEach(photoId => {
        if (photoId && photoId !== `${buildingId}-1`) { // Skip duplicate of primary
          // Try different naming patterns
          const imageUrl = `/project1_images/${photoId.replace('-', '_')}_F01.jpg`
          images.push(imageUrl)
        }
      })
    }

    return images
  }

  // Function to check if image exists
  const checkImageExists = (url) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = url
    })
  }

  // Popup content for features
  const getFeaturePopup = (feature) => {
    const props = feature.properties || {}
    const buildingId = props.Batiment_i || props.Numero_Fi
    const images = getBuildingImages(buildingId, props.Photo)

    return `
      <div class="p-6 max-w-2xl">
        <!-- Header Section -->
        <div class="border-b border-gray-200 pb-4 mb-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-900">🏠 Bâtiment ${buildingId || 'N/A'}</h2>
            <div class="flex items-center space-x-2">
              <span class="px-3 py-1 rounded-full text-sm font-medium ${
                props.Classific === 'Danger' ? 'bg-red-100 text-red-800 border border-red-200' :
                props.Classific === 'Bon' ? 'bg-green-100 text-green-800 border border-green-200' :
                props.Classific === 'Moyen' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                props.Classific === 'Risque' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                props.Classific === 'Facteurs De Dégradation' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                'bg-gray-100 text-gray-800 border border-gray-200'
              }">
                ${props.Classific || 'Non classé'}
              </span>
            </div>
          </div>
          <p class="text-sm text-gray-600 mt-1">Fiche: ${props.Fiche_Bat || 'N/A'} • Enquête: ${props.Date_Enqu || 'N/A'}</p>
        </div>

        <!-- Images Section -->
        ${images.length > 0 ? `
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span class="mr-2">📸</span> Photos du bâtiment
            </h3>
            <div class="grid grid-cols-3 gap-3 mb-3">
              ${images.slice(0, 6).map(img => `
                <div class="relative group">
                  <img
                    src="${img}"
                    alt="Photo bâtiment ${buildingId}"
                    class="w-full h-24 object-cover rounded-lg border-2 border-gray-200 cursor-pointer group-hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
                    onclick="window.open('${img}', '_blank')"
                    onerror="this.style.display='none'"
                  />
                  <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                    <svg class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="text-center">
              <button
                onclick="window.openBuildingGallery('${buildingId}', '${props.Photo || ''}')"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
              >
                📸 Voir toutes les photos (${images.length})
              </button>
              ${images.length > 6 ? `
                <p class="text-xs text-gray-500 mt-1">+${images.length - 6} photos supplémentaires</p>
              ` : ''}
            </div>
          </div>
        ` : `
          <div class="mb-6 text-center py-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <p class="text-gray-500 text-sm">Aucune photo disponible</p>
          </div>
        `}

        <!-- Building Information Grid -->
        <div class="grid grid-cols-2 gap-6 mb-6">
          <!-- Left Column -->
          <div class="space-y-4">
            <div>
              <h4 class="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <span class="mr-2">📍</span> Localisation
              </h4>
              <div class="bg-gray-50 p-3 rounded-lg">
                <p class="text-sm text-gray-800 font-medium">${props.Adresse || 'Adresse non spécifiée'}</p>
                <p class="text-xs text-gray-600 mt-1">Secteur: ${props['Secteur/Q'] || 'N/A'}</p>
              </div>
            </div>

            <div>
              <h4 class="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <span class="mr-2">🏗️</span> Caractéristiques
              </h4>
              <div class="bg-gray-50 p-3 rounded-lg space-y-2">
                <div class="flex justify-between">
                  <span class="text-xs text-gray-600">Usage:</span>
                  <span class="text-xs font-medium text-gray-800">${props.Type_Usag || 'N/A'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-xs text-gray-600">Superficie:</span>
                  <span class="text-xs font-medium text-gray-800">${props.Superfici || 'N/A'} m²</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-xs text-gray-600">Niveaux:</span>
                  <span class="text-xs font-medium text-gray-800">${props.Nombre_Ni || 'N/A'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-xs text-gray-600">Typologie:</span>
                  <span class="text-xs font-medium text-gray-800">${props.Typologie || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-4">
            <div>
              <h4 class="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <span class="mr-2">👥</span> Occupation
              </h4>
              <div class="bg-gray-50 p-3 rounded-lg space-y-2">
                <div class="flex justify-between">
                  <span class="text-xs text-gray-600">Statut:</span>
                  <span class="text-xs font-medium text-gray-800">${props.Occupatio || 'N/A'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-xs text-gray-600">Occupants:</span>
                  <span class="text-xs font-medium text-gray-800">${props.Statut_Oc || 'N/A'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-xs text-gray-600">Propriété:</span>
                  <span class="text-xs font-medium text-gray-800">${props.Foncier || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 class="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <span class="mr-2">🏠</span> Logements
              </h4>
              <div class="bg-gray-50 p-3 rounded-lg space-y-2">
                <div class="flex justify-between">
                  <span class="text-xs text-gray-600">Ménages:</span>
                  <span class="text-xs font-medium text-gray-800">${props.Nombre_Me || 'N/A'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-xs text-gray-600">Résidents:</span>
                  <span class="text-xs font-medium text-gray-800">${props.Nombre_Re || 'N/A'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-xs text-gray-600">Locaux:</span>
                  <span class="text-xs font-medium text-gray-800">${props.Nombre_Lu || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Risk Assessment Section -->
        ${props.Risque ? `
          <div class="mb-4">
            <h4 class="text-sm font-semibold text-red-700 mb-2 flex items-center">
              <span class="mr-2">⚠️</span> Évaluation des risques
            </h4>
            <div class="bg-red-50 border border-red-200 p-3 rounded-lg">
              <p class="text-sm text-red-800 whitespace-pre-line">${props.Risque.replace(/\n/g, '<br>').replace(/\//g, '<br>•')}</p>
            </div>
          </div>
        ` : ''}

        <!-- Survey Information -->
        <div class="border-t border-gray-200 pt-4 mt-4">
          <div class="flex items-center justify-between text-xs text-gray-500">
            <div class="flex items-center space-x-4">
              <span>👨‍💼 ${props.Enqueteur || 'N/A'}</span>
              <span>📅 ${props.Date_Enqu || 'N/A'}</span>
            </div>
            <span class="bg-gray-100 px-2 py-1 rounded">${props.Fiche_Bat || 'N/A'}</span>
          </div>
        </div>
      </div>`;
  }

  const handleFeatureClick = (feature) => {
    setSelectedFeature(feature.properties)
  }

  const openImageGallery = (buildingId, photoField) => {
    const images = getBuildingImages(buildingId, photoField)
    setImageGallery({
      isOpen: true,
      images: images,
      currentIndex: 0,
      buildingId: buildingId
    })
  }

  const closeImageGallery = () => {
    setImageGallery({ isOpen: false, images: [], currentIndex: 0, buildingId: '' })
  }

  const nextImage = () => {
    setImageGallery(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length
    }))
  }

  const prevImage = () => {
    setImageGallery(prev => ({
      ...prev,
      currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1
    }))
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/projects')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Visualiseur GeoJSON - Données de Bâtiments
              </h1>
              <p className="text-gray-600 text-sm">
                {geoJsonData ? `${geoJsonData.features?.length || 0} bâtiment(s) chargé(s)` : 'Chargement...'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={loadGeoJsonFile}
              disabled={loading}
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              {loading ? 'Chargement...' : 'Recharger'}
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 relative">
        {geoJsonData && (
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="h-full w-full"
            style={{ zIndex: 1 }}
          >
            <LayersControl position="topleft">
              <BaseLayer checked name="🗺️ OpenStreetMap">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
              </BaseLayer>
              <BaseLayer name="🛰️ Satellite">
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                />
              </BaseLayer>
            </LayersControl>

            {/* GeoJSON Layer */}
            <GeoJSON
              data={geoJsonData}
              style={getFeatureStyle}
              onEachFeature={(feature, layer) => {
                layer.bindPopup(getFeaturePopup(feature), {
                  maxWidth: 650,
                  minWidth: 600,
                  className: 'building-popup-large',
                  autoPan: true,
                  autoPanPadding: [20, 20]
                })
                layer.on('click', () => handleFeatureClick(feature))
              }}
            />

            {/* Custom CSS for popups */}
            <style jsx global>{`
              .building-popup-large .leaflet-popup-content-wrapper {
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                border: none;
                background: white;
                padding: 0;
                max-width: 650px !important;
                min-width: 600px !important;
              }
              .building-popup-large .leaflet-popup-content {
                margin: 0;
                line-height: 1.6;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                width: 100% !important;
                max-width: none !important;
              }
              .building-popup-large .leaflet-popup-tip {
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              }
              .building-popup-large .leaflet-popup-close-button {
                color: #9ca3af;
                font-size: 24px;
                font-weight: bold;
                padding: 12px;
                right: 12px;
                top: 12px;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.9);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                transition: all 0.2s ease;
              }
              .building-popup-large .leaflet-popup-close-button:hover {
                color: #374151;
                background: rgba(255, 255, 255, 1);
                transform: scale(1.1);
              }
              .building-popup-large img {
                transition: all 0.2s ease;
              }
              .building-popup-large img:hover {
                transform: scale(1.02);
              }
              .building-popup-large .grid {
                display: grid;
              }
              .building-popup-large .grid-cols-2 {
                grid-template-columns: repeat(2, minmax(0, 1fr));
              }
              .building-popup-large .grid-cols-3 {
                grid-template-columns: repeat(3, minmax(0, 1fr));
              }
              .building-popup-large .gap-2 {
                gap: 0.5rem;
              }
              .building-popup-large .gap-3 {
                gap: 0.75rem;
              }
              .building-popup-large .gap-4 {
                gap: 1rem;
              }
              .building-popup-large .gap-6 {
                gap: 1.5rem;
              }
              .building-popup-large .space-y-2 > * + * {
                margin-top: 0.5rem;
              }
              .building-popup-large .space-y-4 > * + * {
                margin-top: 1rem;
              }
              .building-popup-large .space-x-2 > * + * {
                margin-left: 0.5rem;
              }
              .building-popup-large .space-x-4 > * + * {
                margin-left: 1rem;
              }
              @media (max-width: 768px) {
                .building-popup-large .leaflet-popup-content-wrapper {
                  min-width: 350px !important;
                  max-width: 400px !important;
                }
                .building-popup-large .grid-cols-2 {
                  grid-template-columns: repeat(1, minmax(0, 1fr));
                }
                .building-popup-large .grid-cols-3 {
                  grid-template-columns: repeat(2, minmax(0, 1fr));
                }
              }
            `}</style>
          </MapContainer>
        )}

        {/* Feature Info Panel */}
        {selectedFeature && (
          <div className="absolute top-4 right-4 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-[1000] max-h-[80vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg text-gray-900">
                  Bâtiment {selectedFeature.Batiment_i || selectedFeature.Numero_Fi}
                </h3>
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  ×
                </button>
              </div>

              {/* Images Section */}
              {(() => {
                const buildingId = selectedFeature.Batiment_i || selectedFeature.Numero_Fi
                const images = getBuildingImages(buildingId, selectedFeature.Photo)
                return images.length > 0 ? (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-700 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Photos du bâtiment
                      </h4>
                      <button
                        onClick={() => openImageGallery(buildingId, selectedFeature.Photo)}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                      >
                        Voir tout
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {images.slice(0, 6).map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Photo bâtiment ${buildingId} - ${index + 1}`}
                            className="w-full h-24 object-cover rounded border cursor-pointer group-hover:opacity-80 transition-opacity"
                            onClick={() => window.open(img, '_blank')}
                            onError={(e) => e.target.style.display = 'none'}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded transition-all duration-200 flex items-center justify-center">
                            <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                    {images.length > 6 && (
                      <p className="text-xs text-gray-500 text-center mt-2">
                        +{images.length - 6} autres photos disponibles
                      </p>
                    )}
                  </div>
                ) : null
              })()}

              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Adresse:</span>
                  <p className="text-gray-600 mt-1">{selectedFeature.Adresse}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="font-medium text-gray-700">Usage:</span>
                    <p className="text-gray-600">{selectedFeature.Type_Usag}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Superficie:</span>
                    <p className="text-gray-600">{selectedFeature.Superfici} m²</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="font-medium text-gray-700">Niveaux:</span>
                    <p className="text-gray-600">{selectedFeature.Nombre_Ni}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Classification:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedFeature.Classific === 'Danger' ? 'bg-red-100 text-red-800' :
                      selectedFeature.Classific === 'Bon' ? 'bg-green-100 text-green-800' :
                      selectedFeature.Classific === 'Moyen' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedFeature.Classific}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="font-medium text-gray-700">Occupation:</span>
                    <p className="text-gray-600">{selectedFeature.Occupatio}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Statut:</span>
                    <p className="text-gray-600">{selectedFeature.Statut_Oc}</p>
                  </div>
                </div>

                {selectedFeature.Risque && (
                  <div>
                    <span className="font-medium text-gray-700">Risques:</span>
                    <p className="text-gray-600 text-xs mt-1 whitespace-pre-line">
                      {selectedFeature.Risque}
                    </p>
                  </div>
                )}

                <div className="border-t pt-3 mt-3 text-xs text-gray-500">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="font-medium">Date enquête:</span>
                      <p>{selectedFeature.Date_Enqu}</p>
                    </div>
                    <div>
                      <span className="font-medium">Enquêteur:</span>
                      <p>{selectedFeature.Enqueteur}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="font-medium">Fiche:</span>
                    <span className="ml-1">{selectedFeature.Fiche_Bat}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Gallery Modal */}
        {imageGallery.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-[2000] flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">
                  Photos - Bâtiment {imageGallery.buildingId}
                </h3>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {imageGallery.currentIndex + 1} / {imageGallery.images.length}
                  </span>
                  <button
                    onClick={closeImageGallery}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Image Display */}
              <div className="relative">
                <img
                  src={imageGallery.images[imageGallery.currentIndex]}
                  alt={`Bâtiment ${imageGallery.buildingId} - Photo ${imageGallery.currentIndex + 1}`}
                  className="w-full h-96 object-contain bg-gray-100"
                  onError={(e) => {
                    e.target.src = '/background_bg.jpg' // Fallback image
                  }}
                />

                {/* Navigation Arrows */}
                {imageGallery.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Strip */}
              {imageGallery.images.length > 1 && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex space-x-2 overflow-x-auto">
                    {imageGallery.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setImageGallery(prev => ({ ...prev, currentIndex: index }))}
                        className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                          index === imageGallery.currentIndex ? 'border-blue-500' : 'border-gray-300'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GeoJsonViewer
