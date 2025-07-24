import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Building, Users, AlertTriangle, BarChart3, Map, Eye } from 'lucide-react'
import apiService from '../services/api'

const BuildingSurveyDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedClassification, setSelectedClassification] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const response = await apiService.getProjectById(id)
      if (response.success) {
        setProject(response.data)
      } else {
        setError('Projet non trouvé')
      }
    } catch (err) {
      setError('Erreur lors du chargement du projet')
      console.error('Error fetching project:', err)
    } finally {
      setLoading(false)
    }
  }

  const getClassificationColor = (classification) => {
    switch (classification) {
      case 'Danger': return 'bg-red-100 text-red-800 border-red-200'
      case 'Risque': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Facteurs De Dégradation': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Bon': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredApartments = project?.apartments?.filter(apt => {
    const matchesClassification = selectedClassification === 'all' || apt.classification === selectedClassification
    const matchesSearch = searchTerm === '' || 
      apt.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.sector.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesClassification && matchesSearch
  }) || []

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#354939] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du projet...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/projects')}
            className="bg-[#354939] text-white px-4 py-2 rounded-lg hover:bg-[#2a3a2d]"
          >
            Retour aux projets
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/projects')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Retour
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Project 1</h1>
                <p className="text-gray-600 mt-1">Analyse géospatiale et cartographie urbaine - Casablanca</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    PROJ-001
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    En cours
                  </span>
                  <span className="text-sm text-gray-500">2024</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/geojson-viewer')}
                className="bg-[#354939] text-white px-4 py-2 rounded-lg hover:bg-[#2a3a2d] transition-colors flex items-center"
              >
                <Map className="h-4 w-4 mr-2" />
                Visualiseur cartographique
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Overview */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Aperçu du projet</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  Analyse géospatiale complète de 834 bâtiments dans le secteur urbain de Casablanca.
                  Ce projet comprend l'évaluation des risques structurels, l'analyse de l'occupation
                  des logements, et la cartographie détaillée de chaque bâtiment avec documentation
                  photographique et données géolocalisées.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Informations du projet</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Numéro de projet:</span>
                    <span className="font-medium">PROJ-001</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Région:</span>
                    <span className="font-medium">Casablanca-Settat</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Préfecture:</span>
                    <span className="font-medium">Casablanca</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Année:</span>
                    <span className="font-medium">2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Statut:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      En cours
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Building className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">834</div>
                <div className="text-sm text-blue-700">Bâtiments</div>
                <div className="text-xs text-blue-600 mt-1">Secteur complet</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-900">9,811</div>
                <div className="text-sm text-green-700">Résidents</div>
                <div className="text-xs text-green-600 mt-1">2,741 ménages</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-900">833</div>
                <div className="text-sm text-red-700">À risque</div>
                <div className="text-xs text-red-600 mt-1">99.9% du total</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-900">65,823</div>
                <div className="text-sm text-purple-700">m² total</div>
                <div className="text-xs text-purple-600 mt-1">Moy: 79 m²</div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Classifications */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Classification des bâtiments</h3>
              <div className="space-y-3">
                {project.buildingStats?.classifications && Object.entries(project.buildingStats.classifications).map(([classification, count]) => (
                  <div key={classification} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getClassificationColor(classification)}`}>
                        {classification}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{count} bâtiments</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(count / (project.buildingStats?.totalBuildings || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Usage Types */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Types d'usage</h3>
              <div className="space-y-3">
                {project.buildingStats?.usageTypes && Object.entries(project.buildingStats.usageTypes).map(([usage, count]) => (
                  <div key={usage} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{usage}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{count}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(count / (project.buildingStats?.totalBuildings || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Buildings List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Liste des bâtiments</h3>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedClassification}
                  onChange={(e) => setSelectedClassification(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">Toutes classifications</option>
                  {project.buildingStats?.classifications && Object.keys(project.buildingStats.classifications).map(classification => (
                    <option key={classification} value={classification}>{classification}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bâtiment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classification</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Surface</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Résidents</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApartments.slice(0, 50).map((apartment) => (
                    <tr key={apartment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{apartment.id}</div>
                        <div className="text-sm text-gray-500">{apartment.levels}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{apartment.address}</div>
                        <div className="text-sm text-gray-500">{apartment.sector}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getClassificationColor(apartment.classification)}`}>
                          {apartment.classification}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {apartment.surface} m²
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {apartment.residents}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {apartment.usage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredApartments.length > 50 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Affichage de 50 sur {filteredApartments.length} bâtiments
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuildingSurveyDetail
