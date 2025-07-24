import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, X, User, Users } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
// Using standard HTML elements instead of missing UI components
import { apiService } from '../../services/api'
import apiServiceDefault from '../../services/api'

const ProjectEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [formData, setFormData] = useState({
    // Basic project info
    projectNumber: '',
    nomProjet: '',
    anneeProjet: '',
    region: '',
    prefecture: '',
    consistance: '',
    projectStatus: '',

    // Location data
    latitude: '',
    longitude: '',
    coordonneesX: '',
    coordonneesY: '',

    // Dates
    dateDebutProjet: '',
    dateLivraisonPrevue: '',
    dateFinProjet: '',
    DateDeCreation: '',

    // Additional fields
    statutFoncier: '',
    referenceFonciere: '',
    Commune: '',
    cercle: '',
    tempsPasse: 0,
    idDevis: '',

    // Team management
    chefProjet: '',
    equipe: [],

    // Status
    status: 'accepté',
    archived: false
  })

  useEffect(() => {
    if (id) {
      fetchProject()
    }
    fetchUsers()
  }, [id])

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await apiServiceDefault.getAllUsers()
      if (response.success) {
        const activeUsers = response.data.users.filter(user => user.status === 'active')
        setUsers(activeUsers)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchProject = async () => {
    try {
      setLoading(true)
      const response = await apiService.getProjectById(id)
      const projectData = response.data || response
      setProject(projectData)
      
      // Populate form data - handle both old and new project structures
      setFormData({
        // Basic project info
        projectNumber: projectData.projectInfo?.projectNumber || projectData.projectNumber || '',
        nomProjet: projectData.nomProjet || projectData.projectInfo?.nomProjet || '',
        anneeProjet: projectData.projectInfo?.anneeProjet || projectData.anneeProjet || '',
        region: projectData.projectInfo?.region || projectData.region || '',
        prefecture: projectData.projectInfo?.prefecture || projectData.prefecture || '',
        consistance: projectData.consistance || '',
        projectStatus: projectData.projectInfo?.status || projectData.projectStatus || '',

        // Location data
        latitude: projectData.latitude || '',
        longitude: projectData.longitude || '',
        coordonneesX: projectData.coordonneesX || '',
        coordonneesY: projectData.coordonneesY || '',

        // Dates
        dateDebutProjet: projectData.dateDebutProjet ? new Date(projectData.dateDebutProjet).toISOString().split('T')[0] : '',
        dateLivraisonPrevue: projectData.dateLivraisonPrevue ? new Date(projectData.dateLivraisonPrevue).toISOString().split('T')[0] : '',
        dateFinProjet: projectData.dateFinProjet ? new Date(projectData.dateFinProjet).toISOString().split('T')[0] : '',
        DateDeCreation: projectData.projectInfo?.dateCreation ? projectData.projectInfo.dateCreation.split('T')[0] : projectData.DateDeCreation ? projectData.DateDeCreation.split('T')[0] : '',

        // Additional fields
        statutFoncier: projectData.statutFoncier || '',
        referenceFonciere: projectData.referenceFonciere || '',
        Commune: projectData.Commune || '',
        cercle: projectData.cercle || '',
        tempsPasse: projectData.tempsPasse || 0,
        idDevis: projectData.idDevis || '',

        // Team management
        chefProjet: projectData.chefProjet || '',
        equipe: projectData.equipe || [],

        // Status
        status: projectData.projectInfo?.status || projectData.status || 'accepté',
        archived: projectData.archived || false
      })
    } catch (error) {
      console.error('Error fetching project:', error)
      setError('Erreur lors du chargement du projet')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTeamMemberToggle = (userId) => {
    setFormData(prev => ({
      ...prev,
      equipe: prev.equipe.includes(userId)
        ? prev.equipe.filter(id => id !== userId)
        : [...prev.equipe, userId]
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      
      // Convert dates back to ISO format
      const updateData = {
        ...formData,
        dateDebutProjet: formData.dateDebutProjet ? new Date(formData.dateDebutProjet).toISOString() : null,
        dateLivraisonPrevue: formData.dateLivraisonPrevue ? new Date(formData.dateLivraisonPrevue).toISOString() : null,
        dateFinProjet: formData.dateFinProjet ? new Date(formData.dateFinProjet).toISOString() : null
      }
      
      await apiService.updateProject(id, updateData)
      navigate(`/projects/${id}`)
    } catch (error) {
      console.error('Error saving project:', error)
      setError('Erreur lors de la sauvegarde: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error && !project) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/projects')}>
            Retour aux projets
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/projects/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Modifier le Projet {formData.projectNumber}
            </h1>
            <p className="text-gray-600">Modifiez les informations du projet</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/projects/${id}`)}
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de base</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du projet
              </label>
              <Input
                value={formData.nomProjet}
                onChange={(e) => handleInputChange('nomProjet', e.target.value)}
                placeholder="Ex: Projet de développement urbain"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de projet
              </label>
              <Input
                value={formData.projectNumber}
                onChange={(e) => handleInputChange('projectNumber', e.target.value)}
                placeholder="Ex: PROJ-001"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Année du projet
              </label>
              <Input
                value={formData.anneeProjet}
                onChange={(e) => handleInputChange('anneeProjet', e.target.value)}
                placeholder="Ex: 2024"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consistance
              </label>
              <textarea
                value={formData.consistance}
                onChange={(e) => handleInputChange('consistance', e.target.value)}
                placeholder="Description du projet..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut du projet
              </label>
              <select
                value={formData.projectStatus}
                onChange={(e) => handleInputChange('projectStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un statut</option>
                <option value="En cours">En cours</option>
                <option value="livré">Livré</option>
                <option value="Suspendu">Suspendu</option>
                <option value="Terminé">Terminé</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle>Localisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Région
              </label>
              <Input
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                placeholder="Ex: Marrakech-Safi"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Préfecture
              </label>
              <Input
                value={formData.prefecture}
                onChange={(e) => handleInputChange('prefecture', e.target.value)}
                placeholder="Ex: Marrakech"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <Input
                  value={formData.latitude}
                  onChange={(e) => handleInputChange('latitude', e.target.value)}
                  placeholder="Ex: 31.6295"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <Input
                  value={formData.longitude}
                  onChange={(e) => handleInputChange('longitude', e.target.value)}
                  placeholder="Ex: -7.9811"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coordonnée X
                </label>
                <Input
                  value={formData.coordonneesX}
                  onChange={(e) => handleInputChange('coordonneesX', e.target.value)}
                  placeholder="Ex: 219738"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coordonnée Y
                </label>
                <Input
                  value={formData.coordonneesY}
                  onChange={(e) => handleInputChange('coordonneesY', e.target.value)}
                  placeholder="Ex: 124629"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commune
                </label>
                <Input
                  value={formData.Commune}
                  onChange={(e) => handleInputChange('Commune', e.target.value)}
                  placeholder="Ex: Casablanca"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cercle
                </label>
                <Input
                  value={formData.cercle}
                  onChange={(e) => handleInputChange('cercle', e.target.value)}
                  placeholder="Ex: Casablanca"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut foncier
                </label>
                <Input
                  value={formData.statutFoncier}
                  onChange={(e) => handleInputChange('statutFoncier', e.target.value)}
                  placeholder="Ex: Propriété privée"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Référence foncière
                </label>
                <Input
                  value={formData.referenceFonciere}
                  onChange={(e) => handleInputChange('referenceFonciere', e.target.value)}
                  placeholder="Ex: TF-12345"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Dates du projet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début
                </label>
                <Input
                  type="date"
                  value={formData.dateDebutProjet}
                  onChange={(e) => handleInputChange('dateDebutProjet', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de livraison prévue
                </label>
                <Input
                  type="date"
                  value={formData.dateLivraisonPrevue}
                  onChange={(e) => handleInputChange('dateLivraisonPrevue', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin
                </label>
                <Input
                  type="date"
                  value={formData.dateFinProjet}
                  onChange={(e) => handleInputChange('dateFinProjet', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Management */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Gestion d'équipe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Chef de projet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chef de projet
              </label>
              {loadingUsers ? (
                <div className="text-sm text-gray-500">Chargement des utilisateurs...</div>
              ) : (
                <select
                  value={formData.chefProjet}
                  onChange={(e) => handleInputChange('chefProjet', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un chef de projet</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Équipe du projet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Users className="h-4 w-4 inline mr-1" />
                Équipe du projet
              </label>
              {loadingUsers ? (
                <div className="text-sm text-gray-500">Chargement des utilisateurs...</div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {users.map(user => (
                    <label key={user._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.equipe.includes(user._id)}
                        onChange={() => handleTeamMemberToggle(user._id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {formData.equipe.length > 0 && (
                <div className="mt-3 text-sm text-gray-600">
                  {formData.equipe.length} membre(s) sélectionné(s)
                </div>
              )}
            </div>

            {/* Additional project fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temps passé (heures)
                </label>
                <Input
                  type="number"
                  value={formData.tempsPasse}
                  onChange={(e) => handleInputChange('tempsPasse', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Devis
                </label>
                <Input
                  value={formData.idDevis}
                  onChange={(e) => handleInputChange('idDevis', e.target.value)}
                  placeholder="Ex: DEV-2024-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de création
                </label>
                <Input
                  type="date"
                  value={formData.DateDeCreation}
                  onChange={(e) => handleInputChange('DateDeCreation', e.target.value)}
                />
              </div>
            </div>

            {/* Status and Archive */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="accepté">Accepté</option>
                  <option value="En cours">En cours</option>
                  <option value="livré">Livré</option>
                  <option value="Suspendu">Suspendu</option>
                  <option value="Terminé">Terminé</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.archived}
                    onChange={(e) => handleInputChange('archived', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Projet archivé</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProjectEdit
