import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Upload, X, Plus, FileText, Image, User, Users } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { apiService } from '../services/api'
import apiServiceDefault from '../services/api'

const ProjectCreate = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [images, setImages] = useState([])
  const [files, setFiles] = useState([])
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [formData, setFormData] = useState({
    projectNumber: '',
    nomProjet: '',
    anneeProjet: new Date().getFullYear().toString(),
    region: '',
    prefecture: '',
    consistance: '',
    projectStatus: 'En cours',
    latitude: '',
    longitude: '',
    dateDebutProjet: '',
    dateLivraisonPrevue: '',
    dateFinProjet: '',
    chefProjet: '',
    equipe: [],
    statutFoncier: '',
    referenceFonciere: '',
    Commune: '',
    cercle: '',
    coordonneesX: '',
    coordonneesY: ''
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await apiServiceDefault.getAllUsers()
      if (response.success) {
        // Filter only active users
        const activeUsers = response.data.users.filter(user => user.status === 'active')
        setUsers(activeUsers)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setImages(prev => [...prev, {
            file,
            url: e.target.result,
            name: file.name
          }])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files)
    uploadedFiles.forEach(file => {
      setFiles(prev => [...prev, {
        file,
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: file.type.includes('pdf') ? 'pdf' : 
              file.type.includes('excel') || file.type.includes('spreadsheet') ? 'excel' :
              file.type.includes('word') || file.type.includes('document') ? 'word' : 'other'
      }])
    })
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.projectNumber || !formData.region || !formData.prefecture) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Prepare project data
      const projectData = {
        ...formData,
        images: images.map(img => img.url), // In a real app, you'd upload to a server
        files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
        dateDebutProjet: formData.dateDebutProjet ? new Date(formData.dateDebutProjet).toISOString() : null,
        dateLivraisonPrevue: formData.dateLivraisonPrevue ? new Date(formData.dateLivraisonPrevue).toISOString() : null,
        dateFinProjet: formData.dateFinProjet ? new Date(formData.dateFinProjet).toISOString() : null
      }
      
      // Create project using API
      const response = await apiService.createProject(projectData)
      
      setSuccess('Projet créé avec succès!')
      setTimeout(() => {
        navigate(`/projects/${response.data._id}`)
      }, 1500)
      
    } catch (error) {
      console.error('Error creating project:', error)
      setError('Erreur lors de la création: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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
            <h1 className="text-2xl font-bold text-gray-900">
              Créer un Nouveau Projet
            </h1>
            <p className="text-gray-600">Ajoutez un nouveau projet avec images et documents</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations de base</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du projet *
                  </label>
                  <Input
                    value={formData.nomProjet}
                    onChange={(e) => handleInputChange('nomProjet', e.target.value)}
                    placeholder="Ex: Projet de développement urbain"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de projet *
                    </label>
                    <Input
                      value={formData.projectNumber}
                      onChange={(e) => handleInputChange('projectNumber', e.target.value)}
                      placeholder="Ex: PROJ-001"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Année du projet *
                    </label>
                    <Input
                      value={formData.anneeProjet}
                      onChange={(e) => handleInputChange('anneeProjet', e.target.value)}
                      placeholder="Ex: 2024"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description du projet
                  </label>
                  <textarea
                    value={formData.consistance}
                    onChange={(e) => handleInputChange('consistance', e.target.value)}
                    placeholder="Description détaillée du projet..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Région *
                    </label>
                    <Input
                      value={formData.region}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                      placeholder="Ex: Marrakech-Safi"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Préfecture *
                    </label>
                    <Input
                      value={formData.prefecture}
                      onChange={(e) => handleInputChange('prefecture', e.target.value)}
                      placeholder="Ex: Marrakech"
                      required
                    />
                  </div>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut du projet
                  </label>
                  <select
                    value={formData.projectStatus}
                    onChange={(e) => handleInputChange('projectStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="En cours">En cours</option>
                    <option value="livré">Livré</option>
                    <option value="Suspendu">Suspendu</option>
                    <option value="Terminé">Terminé</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
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

          {/* Images and Files */}
          <div className="space-y-6">
            {/* Chef de projet */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Chef de projet
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="text-sm text-gray-500">Chargement des utilisateurs...</div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sélectionner le chef de projet
                    </label>
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
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Équipe du projet */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Équipe du projet
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="text-sm text-gray-500">Chargement des utilisateurs...</div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Sélectionner les membres de l'équipe
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
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
                    {formData.equipe.length > 0 && (
                      <div className="mt-3 text-sm text-gray-600">
                        {formData.equipe.length} membre(s) sélectionné(s)
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Images Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Image className="h-5 w-5 mr-2" />
                  Images du projet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ajouter des images
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">Cliquez pour ajouter des images</p>
                      </div>
                    </label>
                  </div>

                  {images.length > 0 && (
                    <div className="space-y-2">
                      {images.map((image, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <img src={image.url} alt="" className="w-8 h-8 object-cover rounded" />
                            <span className="text-sm text-gray-700 truncate">{image.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Files Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ajouter des documents
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">Cliquez pour ajouter des fichiers</p>
                      </div>
                    </label>
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-700 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{file.size}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Création...' : 'Créer le Projet'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ProjectCreate
