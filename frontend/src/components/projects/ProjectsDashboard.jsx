"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  Plus,
  MapPin,
  Eye,
  Calendar,
  User,
  Building,
  Clock,
  CheckCircle,
  Pause,
  Filter,
  RefreshCw,
  Archive,
  Trash2,
  Edit,
} from "lucide-react"
import { apiService } from "../../services/api"
import ConfirmationModal from "../modals/ConfirmationModal"

export default function ProjectsDashboard() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [regionFilter, setRegionFilter] = useState("all")

  const [stats, setStats] = useState({
    total: 0,
    enCours: 0,
    livre: 0,
    suspendu: 0,
    termine: 0,
  })

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    action: null,
    projectId: null,
    projectName: '',
    projectNumber: '',
    loading: false
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  // Helper function to open confirmation modal
  const openConfirmationModal = (action, project) => {
    setConfirmationModal({
      isOpen: true,
      action: action,
      projectId: project._id,
      projectName: project.projectInfo?.secteur || project.nomProjet || `Projet ${project.projectInfo?.projectNumber || project.projectNumber}`,
      projectNumber: project.projectInfo?.projectNumber || project.projectNumber,
      loading: false
    })
  }

  // Helper function to close confirmation modal
  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      action: null,
      projectId: null,
      projectName: '',
      projectNumber: '',
      loading: false
    })
  }

  // Handle confirmation modal confirm action
  const handleConfirmAction = () => {
    const { action, projectId } = confirmationModal

    switch (action) {
      case 'archive':
        handleArchive(projectId)
        break
      case 'delete':
        handleDelete(projectId)
        break
      case 'reactivate':
        handleReactivate(projectId)
        break
      default:
        closeConfirmationModal()
    }
  }

  useEffect(() => {
    filterProjects()
  }, [projects, searchTerm, statusFilter, regionFilter])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      console.log("🔄 Fetching projects...")
      const response = await apiService.getAllProjects()
      console.log("📊 Raw API Response:", response)

      // Handle different response structures
      let projectsData = []
      if (response.success && response.data && response.data.projects && Array.isArray(response.data.projects)) {
        projectsData = response.data.projects
      } else if (response.data && Array.isArray(response.data)) {
        projectsData = response.data
      } else if (Array.isArray(response)) {
        projectsData = response
      } else if (response.projects && Array.isArray(response.projects)) {
        projectsData = response.projects
      }

      console.log("✅ Processed projects data:", projectsData)
      setProjects(projectsData)
      calculateStats(projectsData)
    } catch (error) {
      console.error("❌ Error fetching projects:", error)
      // Set empty array on error to prevent crashes
      setProjects([])
      setStats({ total: 0, enCours: 0, livre: 0, suspendu: 0, termine: 0 })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (projectsData) => {
    if (!Array.isArray(projectsData)) {
      console.warn("⚠️ Projects data is not an array:", projectsData)
      return
    }

    const stats = {
      total: projectsData.length,
      enCours: projectsData.filter((p) => p.projectStatus === "En cours").length,
      livre: projectsData.filter((p) => p.projectStatus === "livré").length,
      suspendu: projectsData.filter((p) => p.projectStatus === "Suspendu").length,
      termine: projectsData.filter((p) => p.projectStatus === "Terminé").length,
    }
    console.log("📈 Calculated stats:", stats)
    setStats(stats)
  }

  const filterProjects = () => {
    if (!Array.isArray(projects)) {
      setFilteredProjects([])
      return
    }

    let filtered = projects

    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.projectNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.maitreOuvrage?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.prefecture?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      if (statusFilter === "archived") {
        filtered = filtered.filter((project) => project.archived === true)
      } else {
        filtered = filtered.filter((project) => project.projectStatus === statusFilter && project.archived !== true)
      }
    } else {
      // By default, don't show archived projects unless specifically filtered
      filtered = filtered.filter((project) => project.archived !== true)
    }

    if (regionFilter !== "all") {
      filtered = filtered.filter((project) => project.region === regionFilter)
    }

    setFilteredProjects(filtered)
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
        className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {status}
      </span>
    )
  }

  const getUniqueRegions = () => {
    if (!Array.isArray(projects)) return []
    const regions = [...new Set(projects.map((p) => p.region).filter(Boolean))]
    return regions.sort()
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

  const handleViewDetails = (projectId) => {
    navigate(`/projects/${projectId}`)
  }



  const handleRefresh = () => {
    fetchProjects()
  }

  const handleEdit = (projectId) => {
    navigate(`/projects/${projectId}/edit`)
  }

  const handleArchive = async (projectId) => {
    setConfirmationModal(prev => ({ ...prev, loading: true }))

    try {
      const response = await apiService.archiveProject(projectId)

      if (response.success) {
        await fetchProjects()
        closeConfirmationModal()
        // Show success message (you can replace with a toast notification)
        alert('Projet archivé avec succès')
      } else {
        alert('Erreur lors de l\'archivage: ' + response.message)
        closeConfirmationModal()
      }
    } catch (error) {
      console.error('Error archiving project:', error)
      alert('Erreur lors de l\'archivage: ' + error.message)
      closeConfirmationModal()
    }
  }

  const handleDelete = async (projectId) => {
    setConfirmationModal(prev => ({ ...prev, loading: true }))

    try {
      const response = await apiService.deleteProject(projectId)

      if (response.success) {
        await fetchProjects()
        closeConfirmationModal()
        // Show success message (you can replace with a toast notification)
        alert('Projet supprimé avec succès')
      } else {
        alert('Erreur lors de la suppression: ' + response.message)
        closeConfirmationModal()
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Erreur lors de la suppression: ' + error.message)
      closeConfirmationModal()
    }
  }

  // Add reactivate handler
  const handleReactivate = async (projectId) => {
    setConfirmationModal(prev => ({ ...prev, loading: true }))

    try {
      const response = await apiService.unarchiveProject(projectId)

      if (response.success) {
        await fetchProjects()
        closeConfirmationModal()
        // Show success message (you can replace with a toast notification)
        alert('Projet réactivé avec succès')
      } else {
        alert('Erreur lors de la réactivation: ' + response.message)
        closeConfirmationModal()
      }
    } catch (error) {
      console.error('Error reactivating project:', error)
      alert('Erreur lors de la réactivation: ' + error.message)
      closeConfirmationModal()
    }
  }

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projets</h1>
              <p className="text-gray-600 mt-1">Gestion et suivi des projets</p>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-16 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projets</h1>
            <p className="text-gray-600 mt-1">Gérez tous les projets de votre plateforme</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Actualiser</span>
            </button>
            <button
              onClick={() => navigate("/projects/create")}
              className="bg-[#354939] hover:bg-[#2a3a2d] text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Ajouter un projet</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <Building className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En cours</p>
                <p className="text-3xl font-bold text-blue-600">{stats.enCours}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Livrés</p>
                <p className="text-3xl font-bold text-green-600">{stats.livre}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspendus</p>
                <p className="text-3xl font-bold text-red-600">{stats.suspendu}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Pause className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terminés</p>
                <p className="text-3xl font-bold text-gray-600">{stats.termine}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">Filtres</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#354939] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#354939] focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="En cours">En cours</option>
                <option value="livré">Livré</option>
                <option value="Suspendu">Suspendu</option>
                <option value="Terminé">Terminé</option>
                <option value="archived">Archivés</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Région</label>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#354939] focus:border-transparent"
              >
                <option value="all">Toutes les régions</option>
                {getUniqueRegions().map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all duration-200 cursor-pointer group"
              >
                <div className="p-6">
                  {/* Project Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-[#354939] transition-colors mb-1">
                        {project.nomProjet || `Projet ${project.projectNumber}` || "Projet sans nom"}
                      </h3>
                      <div className="text-xs text-gray-500 mb-2">
                        {project.projectNumber || "N/A"}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <User className="h-4 w-4 mr-1" />
                        <span>Chef: {project.maitreOuvrage?.name || "Non assigné"}</span>
                      </div>
                    </div>
                    {getStatusBadge(project.projectStatus)}
                  </div>

                  {/* Project Info */}
                  <div className="space-y-3 mb-6">
                    {project.region && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>
                          {project.region} - {project.prefecture}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Début: {formatDate(project.dateDebutProjet)}</span>
                    </div>
                    {project.consistance && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Type:</span> {project.consistance}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                    {/* Primary Actions Row */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewDetails(project._id)
                        }}
                        className="flex-1 bg-[#354939] hover:bg-[#2a3a2d] text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Détails</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(project._id)
                        }}
                        className="flex-1 border border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                        title="Modifier le projet"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Modifier</span>
                      </button>
                    </div>

                    {/* Secondary Actions Row */}
                    <div className="flex gap-2">
                      {project.archived ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openConfirmationModal('reactivate', project)
                          }}
                          className="flex-1 border border-green-500 text-green-600 hover:bg-green-500 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                          title="Réactiver le projet"
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span className="truncate">Réactiver</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openConfirmationModal('archive', project)
                          }}
                          className="flex-1 border border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                          title="Archiver le projet"
                        >
                          <Archive className="h-4 w-4" />
                          <span className="truncate">Archiver</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openConfirmationModal('delete', project)
                        }}
                        className="flex-1 border border-red-500 text-red-600 hover:bg-red-500 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                        title="Supprimer le projet"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="truncate">Supprimer</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet trouvé</h3>
            <p className="text-gray-500 mb-6">
              {projects.length === 0
                ? "Aucun projet n'a été créé pour le moment."
                : "Essayez de modifier vos critères de recherche."}
            </p>
            {projects.length === 0 && (
              <button
                onClick={() => navigate("/projects/create")}
                className="bg-[#354939] hover:bg-[#2a3a2d] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Créer le premier projet</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleConfirmAction}
        action={confirmationModal.action}
        projectName={confirmationModal.projectName}
        projectNumber={confirmationModal.projectNumber}
        loading={confirmationModal.loading}
      />
    </div>
  )
}
