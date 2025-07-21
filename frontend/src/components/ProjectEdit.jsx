import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, X } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
// Using standard HTML elements instead of missing UI components
import { apiService } from '../services/api'

const ProjectEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    projectNumber: '',
    anneeProjet: '',
    region: '',
    prefecture: '',
    consistance: '',
    projectStatus: '',
    latitude: '',
    longitude: '',
    dateDebutProjet: '',
    dateLivraisonPrevue: '',
    dateFinProjet: ''
  })

  useEffect(() => {
    if (id) {
      fetchProject()
    }
  }, [id])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const response = await apiService.getProjectById(id)
      const projectData = response.data || response
      setProject(projectData)
      
      // Populate form data
      setFormData({
        projectNumber: projectData.projectNumber || '',
        anneeProjet: projectData.anneeProjet || '',
        region: projectData.region || '',
        prefecture: projectData.prefecture || '',
        consistance: projectData.consistance || '',
        projectStatus: projectData.projectStatus || '',
        latitude: projectData.latitude || '',
        longitude: projectData.longitude || '',
        dateDebutProjet: projectData.dateDebutProjet ? new Date(projectData.dateDebutProjet).toISOString().split('T')[0] : '',
        dateLivraisonPrevue: projectData.dateLivraisonPrevue ? new Date(projectData.dateLivraisonPrevue).toISOString().split('T')[0] : '',
        dateFinProjet: projectData.dateFinProjet ? new Date(projectData.dateFinProjet).toISOString().split('T')[0] : ''
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
                Numéro de projet
              </label>
              <Input
                value={formData.projectNumber}
                onChange={(e) => handleInputChange('projectNumber', e.target.value)}
                placeholder="Ex: 001"
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
      </div>
    </div>
  )
}

export default ProjectEdit
