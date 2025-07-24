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
  Trash2,
  BarChart3,
  Users,
  Home,
  TrendingUp
} from "lucide-react"
import apiService from "../services/api"

const ProjectDetailNew = () => {
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
      case "En cours": return "bg-blue-100 text-blue-800 border-blue-200"
      case "livré": return "bg-green-100 text-green-800 border-green-200"
      case "Suspendu": return "bg-orange-100 text-orange-800 border-orange-200"
      case "Terminé": return "bg-gray-100 text-gray-800 border-gray-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "En cours": return <Clock className="h-4 w-4" />
      case "livré": return <CheckCircle className="h-4 w-4" />
      case "Suspendu": return <AlertCircle className="h-4 w-4" />
      case "Terminé": return <CheckCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/projects")}
                className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Chargement...</h1>
                <p className="text-gray-600 mt-2">Récupération des détails du projet</p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/projects")}
              className="bg-[#354939] text-white px-6 py-3 rounded-lg hover:bg-[#2a3a2d] transition-colors"
            >
              Retour aux projets
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Projet non trouvé</h2>
            <p className="text-gray-600 mb-6">Le projet demandé n'existe pas ou a été supprimé.</p>
            <button
              onClick={() => navigate("/projects")}
              className="bg-[#354939] text-white px-6 py-3 rounded-lg hover:bg-[#2a3a2d] transition-colors"
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
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate("/projects")}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <div className="flex items-center space-x-4 mb-3">
                  <h1 className="text-3xl font-light text-gray-900">
                    {project.projectInfo?.secteur || project.nomProjet || `Projet ${project.projectInfo?.projectNumber || project.projectNumber}`}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      #{project.projectInfo?.projectNumber || project.projectNumber}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.projectInfo?.status || project.projectStatus)}`}>
                      {project.projectInfo?.status || project.projectStatus || "Non défini"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{project.projectInfo?.region || project.region} • {project.projectInfo?.prefecture || project.prefecture}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{project.projectInfo?.anneeProjet || project.anneeProjet}</span>
                  </div>
                  {project.statistics && (
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span>{project.statistics.totalBuildings} bâtiments • {project.statistics.totalResidents} résidents</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
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
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Overview */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Aperçu du projet</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {project.consistance || "Aucune description disponible pour ce projet."}
                </p>
              </div>
            </div>

            {/* Project Statistics (if building survey data exists) */}
            {project.buildingStats && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Statistiques du projet</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-xl">
                    <Building className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-blue-900">{project.buildingStats.totalBuildings}</div>
                    <div className="text-sm text-blue-700 font-medium">Bâtiments</div>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-xl">
                    <Users className="h-10 w-10 text-green-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-green-900">{project.buildingStats.totalResidents?.toLocaleString()}</div>
                    <div className="text-sm text-green-700 font-medium">Résidents</div>
                  </div>
                  <div className="text-center p-6 bg-red-50 rounded-xl">
                    <AlertCircle className="h-10 w-10 text-red-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-red-900">{project.buildingStats.riskBuildings}</div>
                    <div className="text-sm text-red-700 font-medium">À risque</div>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-xl">
                    <BarChart3 className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-purple-900">{project.buildingStats.totalSurface?.toLocaleString()}</div>
                    <div className="text-sm text-purple-700 font-medium">m² total</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Project Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Informations du projet</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">{project.region || "Non spécifié"}</div>
                    <div className="text-sm text-gray-500">{project.prefecture || "Non spécifié"}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">Début: {formatDate(project.dateDebutProjet)}</div>
                    <div className="text-sm text-gray-500">Fin: {formatDate(project.dateFinProjet)}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">Chef de projet</div>
                    <div className="text-sm text-gray-500">{project.maitreOuvrage?.name || "Non assigné"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Actions rapides</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/projects/${id}/edit`)}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Modifier le projet</span>
                </button>
                {project.geoJsonData && (
                  <button
                    onClick={() => navigate('/geojson-viewer')}
                    className="w-full border border-green-500 text-green-600 px-4 py-3 rounded-lg hover:bg-green-500 hover:text-white transition-colors flex items-center justify-center space-x-2"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>Voir sur la carte</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailNew
