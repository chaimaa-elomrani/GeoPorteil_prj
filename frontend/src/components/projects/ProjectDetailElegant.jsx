import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Building,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Home,
  Users
} from "lucide-react"
import apiService from "../../services/api"
import SecureGeoDataManager from "../security/SecureGeoDataManager"

const ProjectDetailElegant = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getProjectById(id)
      if (response.success) {
        setProject(response.data)
      } else {
        setError("Projet non trouvé")
      }
    } catch (err) {
      console.error("Error fetching project:", err)
      setError("Erreur lors du chargement du projet")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Non défini"
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      })
    } catch (error) {
      return "Date invalide"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "En cours": return "bg-blue-50 text-blue-700"
      case "livré": return "bg-green-50 text-green-700"
      case "Suspendu": return "bg-orange-50 text-orange-700"
      case "Terminé": return "bg-gray-50 text-gray-700"
      case "accepté": return "bg-green-50 text-green-700"
      default: return "bg-gray-50 text-gray-700"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full mx-4">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/projects")}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Retour aux projets
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate("/projects")}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <div className="flex items-center space-x-4 mb-2">
                  <h1 className="text-2xl font-light text-gray-900">
                    {project.projectInfo?.secteur || project.nomProjet || `Projet ${project.projectInfo?.projectNumber || project.projectNumber}`}
                  </h1>
                  <span className="text-sm font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    #{project.projectInfo?.projectNumber || project.projectNumber}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.projectInfo?.status || project.projectStatus)}`}>
                    {project.projectInfo?.status || project.projectStatus || "Non défini"}
                  </span>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{project.projectInfo?.region || project.region} • {project.projectInfo?.prefecture || project.prefecture}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{project.projectInfo?.anneeProjet || project.anneeProjet}</span>
                  </div>
                  {project.statistics && (
                    <div className="flex items-center space-x-1">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span>{project.statistics.totalBuildings} bâtiments • {project.statistics.totalResidents} résidents</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/projects/${id}/edit`)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Modifier</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Project Overview */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Informations générales</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Secteur</label>
                  <p className="mt-1 text-gray-900">{project.projectInfo?.secteur || "Non spécifié"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date de création</label>
                  <p className="mt-1 text-gray-900">{formatDate(project.projectInfo?.dateCreation)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Région</label>
                  <p className="mt-1 text-gray-900">{project.projectInfo?.region}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Préfecture</label>
                  <p className="mt-1 text-gray-900">{project.projectInfo?.prefecture}</p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            {project.statistics && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Statistiques</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-light text-gray-900">{project.statistics.totalBuildings}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Bâtiments</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-light text-gray-900">{project.statistics.totalResidents}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Résidents</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-light text-gray-900">{project.statistics.totalSurface}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Surface (m²)</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-light text-gray-900">{Math.round(project.statistics.averageResidentsPerBuilding)}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Résidents/Bât.</div>
                  </div>
                </div>
              </div>
            )}

            {/* Building Details */}
            {project.geojsonData?.features && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Détails des bâtiments</h2>
                <div className="space-y-4">
                  {project.geojsonData.features.map((feature, index) => (
                    <div key={index} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">Bâtiment {feature.properties.Batiment_i}</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">#{feature.properties.Numero_Fi}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Adresse</label>
                          <p className="mt-1 text-gray-900">{feature.properties.Adresse}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Enquêteur</label>
                          <p className="mt-1 text-gray-900">{feature.properties.Enqueteur}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Surface</label>
                          <p className="mt-1 text-gray-900">{feature.properties.Superfici} m²</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Résidents</label>
                          <p className="mt-1 text-gray-900">{feature.properties.Nombre_Re}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Étages</label>
                          <p className="mt-1 text-gray-900">{feature.properties.Nombre_Ni}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Usage</label>
                          <p className="mt-1 text-gray-900">{feature.properties.Type_Usag}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Secure Geo Data Manager */}
            <SecureGeoDataManager
              projectId={project._id}
              projectName={project.projectInfo?.secteur || project.nomProjet || `Projet ${project.projectInfo?.projectNumber || project.projectNumber}`}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Résumé</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Statut</span>
                  <span className={`text-sm px-2 py-1 rounded ${getStatusColor(project.projectInfo?.status)}`}>
                    {project.projectInfo?.status}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Année</span>
                  <span className="text-sm font-medium text-gray-900">{project.projectInfo?.anneeProjet}</span>
                </div>
                {project.statistics && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Bâtiments</span>
                      <span className="text-sm font-medium text-gray-900">{project.statistics.totalBuildings}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-500">Résidents</span>
                      <span className="text-sm font-medium text-gray-900">{project.statistics.totalResidents}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            {project.geojsonData && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                <button
                  onClick={() => navigate('/geojson-viewer')}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Voir sur la carte</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailElegant
