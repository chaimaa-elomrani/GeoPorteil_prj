"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Building,
  FileText,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Pause,
  Edit,
  Trash2,
  RefreshCw,
  Image,
  Download,
  Eye,
} from "lucide-react"
import { apiService } from "../services/api"

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProject()
    }
  }, [id])

  const fetchProject = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Fetching project with ID:", id)
      const response = await apiService.getProjectById(id)
      console.log("📊 Project API Response:", response)

      // Handle different response structures
      let projectData = null
      if (response.data) {
        projectData = response.data
      } else if (response.project) {
        projectData = response.project
      } else {
        projectData = response
      }

      console.log("✅ Processed project data:", projectData)
      setProject(projectData)
    } catch (error) {
      console.error("❌ Error fetching project:", error)
      setError("Erreur lors du chargement du projet")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      "En cours": { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock },
      livré: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
      Suspendu: { color: "bg-red-100 text-red-800 border-red-200", icon: Pause },
      Terminé: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: CheckCircle },
    }

    const config = statusConfig[status] || { color: "bg-gray-100 text-gray-800 border-gray-200", icon: Clock }
    const Icon = config.icon

    return (
      <span
        className={`inline-flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full border ${config.color}`}
      >
        <Icon className="w-4 h-4" />
        {status}
      </span>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Non défini"
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch (error) {
      return "Date invalide"
    }
  }

  const handleViewOnMap = () => {
    navigate(`/projects/map/${id}`)
  }

  const handleEdit = () => {
    navigate(`/projects/${id}/edit`)
  }

  const handleRefresh = () => {
    fetchProject()
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await apiService.deleteProject(id)
      navigate('/projects')
    } catch (error) {
      console.error('Error deleting project:', error)
      setError('Erreur lors de la suppression: ' + error.message)
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }



  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/projects")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chargement...</h1>
              <p className="text-gray-600 mt-1">Récupération des détails du projet</p>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/projects")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projet non trouvé</h1>
              <p className="text-gray-600 mt-1">Le projet demandé n'existe pas</p>
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Projet non trouvé</h3>
            <p className="text-gray-500 mb-6">{error || "Le projet demandé n'existe pas."}</p>
            <button
              onClick={() => navigate("/projects")}
              className="bg-[#354939] hover:bg-[#2a3a2d] text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Retour aux projets
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/projects")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projet {project.projectNumber}</h1>
              <p className="text-gray-600 mt-1">Année {project.anneeProjet}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {getStatusBadge(project.projectStatus)}
            <button
              onClick={handleRefresh}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualiser</span>
            </button>
            <button
              onClick={handleEdit}
              className="border border-[#354939] text-[#354939] hover:bg-[#354939] hover:text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Modifier</span>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Supprimer</span>
            </button>
            {((project.latitude && project.longitude) || (project.coordonneesX && project.coordonneesY)) && (
              <button
                onClick={handleViewOnMap}
                className="bg-[#354939] hover:bg-[#2a3a2d] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <MapPin className="h-4 w-4" />
                <span>Voir sur la carte</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Overview */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Building className="h-5 w-5 text-[#354939]" />
                  <span>Informations générales</span>
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Numéro de projet</label>
                    <p className="text-gray-900 font-medium">{project.projectNumber || "Non défini"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Année</label>
                    <p className="text-gray-900 font-medium">{project.anneeProjet || "Non défini"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Statut foncier</label>
                    <p className="text-gray-900 font-medium">{project.statutFoncier || "Non défini"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Référence foncière</label>
                    <p className="text-gray-900 font-medium">{project.referenceFonciere || "Non défini"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Consistance</label>
                    <p className="text-gray-900 font-medium">{project.consistance || "Non défini"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-[#354939]" />
                  <span>Localisation</span>
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Région</label>
                    <p className="text-gray-900 font-medium">{project.region || "Non défini"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Préfecture</label>
                    <p className="text-gray-900 font-medium">{project.prefecture || "Non défini"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Commune</label>
                    <p className="text-gray-900 font-medium">{project.Commune || "Non défini"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Cercle</label>
                    <p className="text-gray-900 font-medium">{project.cercle || "Non défini"}</p>
                  </div>
                  {project.latitude && project.longitude && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Latitude</label>
                        <p className="text-gray-900 font-medium">{project.latitude}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Longitude</label>
                        <p className="text-gray-900 font-medium">{project.longitude}</p>
                      </div>
                    </>
                  )}
                  {project.coordonneesX && project.coordonneesY && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Coordonnées X</label>
                        <p className="text-gray-900 font-medium">{project.coordonneesX}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Coordonnées Y</label>
                        <p className="text-gray-900 font-medium">{project.coordonneesY}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-[#354939]" />
                  <span>Planning</span>
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Date de début</label>
                    <p className="text-gray-900 font-medium">{formatDate(project.dateDebutProjet)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Date de fin prévue</label>
                    <p className="text-gray-900 font-medium">{formatDate(project.dateFinProjet)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Livraison prévue</label>
                    <p className="text-gray-900 font-medium">{formatDate(project.dateLivraisonPrevue)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Statut</label>
                    <div className="mt-1">{getStatusBadge(project.projectStatus)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Image className="h-5 w-5 text-[#354939]" />
                  <span>Images du projet</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({project.images ? project.images.length : 0})
                  </span>
                </h2>
              </div>
              <div className="p-6">
                {project.images && project.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {project.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Project image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg shadow-sm border border-gray-200 group-hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => window.open(image, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                          <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <img
                        src="/background_bg.jpg"
                        alt="Default project image"
                        className="w-full h-full object-cover rounded-lg opacity-50"
                      />
                    </div>
                    <p className="text-gray-500 text-sm">Aucune image disponible pour ce projet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Files Section */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-[#354939]" />
                  <span>Documents et fichiers</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({project.files ? project.files.length : 0})
                  </span>
                </h2>
              </div>
              <div className="p-6">
                {project.files && project.files.length > 0 ? (
                  <div className="space-y-3">
                    {project.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {file.type === 'pdf' && (
                              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <span className="text-xs font-bold text-red-600">PDF</span>
                              </div>
                            )}
                            {file.type === 'excel' && (
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-xs font-bold text-green-600">XLS</span>
                              </div>
                            )}
                            {file.type === 'word' && (
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-xs font-bold text-blue-600">DOC</span>
                              </div>
                            )}
                            {file.type === 'image' && (
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Image className="w-5 h-5 text-purple-600" />
                              </div>
                            )}
                            {!['pdf', 'excel', 'word', 'image'].includes(file.type) && (
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name || `Document ${index + 1}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {file.size || 'Taille inconnue'} • {file.type || 'Type inconnu'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">Aucun document attaché à ce projet</p>
                    <p className="text-gray-400 text-xs mt-1">Les fichiers PDF, Excel, Word et autres documents apparaîtront ici</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Information */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <User className="h-5 w-5 text-[#354939]" />
                  <span>Maître d'ouvrage</span>
                </h2>
              </div>
              <div className="p-6">
                {project.maitreOuvrage ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Nom</label>
                      <p className="text-gray-900 font-medium">{project.maitreOuvrage.name || "Non défini"}</p>
                    </div>
                    {project.maitreOuvrage.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{project.maitreOuvrage.email}</span>
                      </div>
                    )}
                    {project.maitreOuvrage.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{project.maitreOuvrage.phone}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Non défini</p>
                )}
              </div>
            </div>

            {/* Project Stats */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Statistiques</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Factures</span>
                    <span className="font-medium">{project.Facture?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Temps passé</span>
                    <span className="font-medium">{project.tempsPasse || 0}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Arrêts</span>
                    <span className="font-medium">{project.historiqueArrets?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Archivé</span>
                    <span className="font-medium">{project.archived ? "Oui" : "Non"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Actions rapides</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">Modifier le projet</span>
                  </button>
                  {((project.latitude && project.longitude) || (project.coordonneesX && project.coordonneesY)) && (
                    <button
                      onClick={handleViewOnMap}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">Voir sur la carte</span>
                    </button>
                  )}
                  <button className="w-full flex items-center space-x-3 px-4 py-3 text-left border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="h-4 w-4" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le projet <strong>{project.projectNumber}</strong> ?
              Cette action est irréversible.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
