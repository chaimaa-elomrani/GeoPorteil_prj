import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Archive, ArchiveRestore, Eye, Trash2, Search, Filter } from 'lucide-react'
import AdminLayout from '../components/AdminLayout'
import apiService from '../services/api'

const ArchivePage = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    fetchArchivedProjects()
  }, [])

  const fetchArchivedProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get all projects and filter archived ones
      const response = await apiService.getAllProjects({ archived: true })
      if (response.success) {
        const archivedProjects = response.data.projects.filter(project => project.archived)
        setProjects(archivedProjects)
      } else {
        setError('Erreur lors du chargement des projets archivés')
      }
    } catch (err) {
      console.error('Error fetching archived projects:', err)
      setError('Erreur lors du chargement des projets archivés')
    } finally {
      setLoading(false)
    }
  }

  const handleUnarchive = async (projectId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir désarchiver ce projet ?')) {
      return
    }

    try {
      setActionLoading(prev => ({ ...prev, [`unarchive_${projectId}`]: true }))
      const response = await apiService.unarchiveProject(projectId)
      
      if (response.success) {
        await fetchArchivedProjects()
        alert('Projet désarchivé avec succès')
      } else {
        alert('Erreur lors du désarchivage: ' + response.message)
      }
    } catch (error) {
      console.error('Error unarchiving project:', error)
      alert('Erreur lors du désarchivage: ' + error.message)
    } finally {
      setActionLoading(prev => ({ ...prev, [`unarchive_${projectId}`]: false }))
    }
  }

  const handleDelete = async (projectId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer définitivement ce projet ? Cette action est irréversible.')) {
      return
    }

    try {
      setActionLoading(prev => ({ ...prev, [`delete_${projectId}`]: true }))
      const response = await apiService.deleteProject(projectId)
      
      if (response.success) {
        await fetchArchivedProjects()
        alert('Projet supprimé définitivement')
      } else {
        alert('Erreur lors de la suppression: ' + response.message)
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Erreur lors de la suppression: ' + error.message)
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete_${projectId}`]: false }))
    }
  }

  const handleView = (projectId) => {
    navigate(`/projects/${projectId}`)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Non défini'
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch (error) {
      return 'Date invalide'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'En cours': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'livré': return 'bg-green-100 text-green-800 border-green-200'
      case 'Suspendu': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Terminé': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredProjects = projects.filter(project => {
    const projectName = project.projectInfo?.secteur || project.nomProjet || ''
    const region = project.projectInfo?.region || project.region || ''
    const prefecture = project.projectInfo?.prefecture || project.prefecture || ''

    return projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           region.toLowerCase().includes(searchTerm.toLowerCase()) ||
           prefecture.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (loading) {
    return (
      <AdminLayout title="Projets Archivés">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#354939] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des projets archivés...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Projets Archivés">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Archive className="h-6 w-6 text-gray-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projets Archivés</h1>
              <p className="text-gray-600">Gérez vos projets archivés</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              {filteredProjects.length} projet{filteredProjects.length > 1 ? 's' : ''} archivé{filteredProjects.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, région ou préfecture..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#354939] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Projects Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <Archive className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet archivé</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Aucun projet archivé ne correspond à votre recherche.' : 'Vous n\'avez pas encore archivé de projets.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Projet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Localisation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'archivage
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.map((project) => (
                    <tr key={project._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {project.projectInfo?.secteur || project.nomProjet || 'Projet sans nom'}
                          </div>
                          <div className="text-sm text-gray-500">
                            #{project.projectInfo?.projectNumber || project.projectNumber || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{project.projectInfo?.region || project.region || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{project.projectInfo?.prefecture || project.prefecture || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(project.projectInfo?.status || project.projectStatus)}`}>
                          {project.projectInfo?.status || project.projectStatus || 'Non défini'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(project.updatedAt)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleView(project._id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleUnarchive(project._id)}
                            disabled={actionLoading[`unarchive_${project._id}`]}
                            className="text-green-600 hover:text-green-900 p-1 rounded transition-colors disabled:opacity-50"
                            title="Désarchiver"
                          >
                            <ArchiveRestore className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(project._id)}
                            disabled={actionLoading[`delete_${project._id}`]}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors disabled:opacity-50"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default ArchivePage
