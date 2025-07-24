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
    // Project Info
    projectInfo: {
      projectNumber: '',
      anneeProjet: new Date().getFullYear(),
      region: '',
      prefecture: '',
      secteur: '',
      dateCreation: new Date().toISOString().split('T')[0],
      status: 'accepté'
    },

    // Building Features (initially one building)
    buildings: [{
      properties: {
        Batiment_i: '',
        Numero_Fi: '',
        Date_Enqu: '',
        Enqueteur: '',
        Ancienne_: '',
        'Secteur/Q': '',
        Adresse: '',
        Occupatio: '',
        Statut_Oc: '',
        Statut_Sc: null,
        Proprieta: '',
        Foncier: '',
        Foncier_A: null,
        Superfici: 0,
        Type_Usag: '',
        Type_Us_1: null,
        Type_Equi: null,
        Soussoll: '',
        Nombre_Ni: '',
        Nombre_Lo: null,
        Nombre_Me: 0,
        Nombre_Re: 0,
        Nombre__1: 0,
        Nombre_Lu: 0,
        Conformit: null,
        Conform_1: null,
        Nombre_Ba: 0,
        Accessibl: '',
        Motif_Acc: null,
        Typologie: '',
        Typolog_1: null,
        Monument_: '',
        Valeur_Pa: '',
        Age_Batim: null,
        Classific: '',
        Risque: '',
        Risque_Au: null,
        Fiche_Bat: '',
        Photo: '',
        Field2: null
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[]]]
      }
    }],

    // Team management
    chefProjet: '',
    equipe: []
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

  const handleProjectInfoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      projectInfo: {
        ...prev.projectInfo,
        [field]: value
      }
    }))
  }

  const handleBuildingPropertyChange = (buildingIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      buildings: prev.buildings.map((building, index) =>
        index === buildingIndex
          ? {
              ...building,
              properties: {
                ...building.properties,
                [field]: value
              }
            }
          : building
      )
    }))
  }

  const handleGeometryChange = (buildingIndex, coordinates) => {
    setFormData(prev => ({
      ...prev,
      buildings: prev.buildings.map((building, index) =>
        index === buildingIndex
          ? {
              ...building,
              geometry: {
                ...building.geometry,
                coordinates: coordinates
              }
            }
          : building
      )
    }))
  }

  const addBuilding = () => {
    const newBuilding = {
      properties: {
        Batiment_i: '',
        Numero_Fi: '',
        Date_Enqu: '',
        Enqueteur: '',
        Ancienne_: '',
        'Secteur/Q': formData.projectInfo.secteur,
        Adresse: '',
        Occupatio: '',
        Statut_Oc: '',
        Statut_Sc: null,
        Proprieta: '',
        Foncier: '',
        Foncier_A: null,
        Superfici: 0,
        Type_Usag: '',
        Type_Us_1: null,
        Type_Equi: null,
        Soussoll: '',
        Nombre_Ni: '',
        Nombre_Lo: null,
        Nombre_Me: 0,
        Nombre_Re: 0,
        Nombre__1: 0,
        Nombre_Lu: 0,
        Conformit: null,
        Conform_1: null,
        Nombre_Ba: 0,
        Accessibl: '',
        Motif_Acc: null,
        Typologie: '',
        Typolog_1: null,
        Monument_: '',
        Valeur_Pa: '',
        Age_Batim: null,
        Classific: '',
        Risque: '',
        Risque_Au: null,
        Fiche_Bat: '',
        Photo: '',
        Field2: null
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[]]]
      }
    }

    setFormData(prev => ({
      ...prev,
      buildings: [...prev.buildings, newBuilding]
    }))
  }

  const removeBuilding = (buildingIndex) => {
    if (formData.buildings.length > 1) {
      setFormData(prev => ({
        ...prev,
        buildings: prev.buildings.filter((_, index) => index !== buildingIndex)
      }))
    }
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

  const calculateStatistics = () => {
    const buildings = formData.buildings
    const totalBuildings = buildings.length
    const totalResidents = buildings.reduce((sum, b) => sum + (b.properties.Nombre_Re || 0), 0)
    const totalSurface = buildings.reduce((sum, b) => sum + (b.properties.Superfici || 0), 0)

    // Calculate statistics maps
    const riskClassification = new Map()
    const buildingTypes = new Map()
    const usageTypes = new Map()
    const occupationStatus = new Map()
    const propertyOwnership = new Map()
    const floorDistribution = new Map()
    const enqueteurs = new Map()

    buildings.forEach(building => {
      const props = building.properties

      // Risk classification
      if (props.Classific) {
        const key = props.Classific.replace(/[.\s/]/g, '_')
        riskClassification.set(key, {
          count: (riskClassification.get(key)?.count || 0) + 1,
          percentage: 0
        })
      }

      // Building types, usage types, etc. (similar pattern)
      if (props.Typologie) {
        const key = props.Typologie.replace(/[.\s/]/g, '_')
        buildingTypes.set(key, { count: (buildingTypes.get(key)?.count || 0) + 1, percentage: 0 })
      }

      if (props.Type_Usag) {
        const key = props.Type_Usag.replace(/[.\s/]/g, '_')
        usageTypes.set(key, { count: (usageTypes.get(key)?.count || 0) + 1, percentage: 0 })
      }

      if (props.Occupatio) {
        const key = props.Occupatio.replace(/[.\s/]/g, '_')
        occupationStatus.set(key, { count: (occupationStatus.get(key)?.count || 0) + 1, percentage: 0 })
      }

      if (props.Foncier) {
        const key = props.Foncier.replace(/[.\s/]/g, '_')
        propertyOwnership.set(key, { count: (propertyOwnership.get(key)?.count || 0) + 1, percentage: 0 })
      }

      if (props.Nombre_Ni) {
        const key = props.Nombre_Ni.replace(/[.\s/]/g, '_')
        floorDistribution.set(key, { count: (floorDistribution.get(key)?.count || 0) + 1, percentage: 0 })
      }

      if (props.Enqueteur) {
        const key = props.Enqueteur.replace(/[.\s/]/g, '_')
        enqueteurs.set(key, { count: (enqueteurs.get(key)?.count || 0) + 1, percentage: 0 })
      }
    })

    // Calculate percentages
    const calculatePercentages = (map) => {
      map.forEach((value) => {
        value.percentage = Math.round((value.count / totalBuildings) * 100)
      })
    }

    calculatePercentages(riskClassification)
    calculatePercentages(buildingTypes)
    calculatePercentages(usageTypes)
    calculatePercentages(occupationStatus)
    calculatePercentages(propertyOwnership)
    calculatePercentages(floorDistribution)
    calculatePercentages(enqueteurs)

    return {
      totalBuildings,
      totalResidents,
      averageResidentsPerBuilding: totalBuildings > 0 ? totalResidents / totalBuildings : 0,
      totalSurface,
      averageSurfacePerBuilding: totalBuildings > 0 ? totalSurface / totalBuildings : 0,
      riskClassification,
      buildingTypes,
      usageTypes,
      occupationStatus,
      propertyOwnership,
      accessibility: {
        accessible: buildings.filter(b => b.properties.Accessibl === 'Oui').length,
        notAccessible: buildings.filter(b => b.properties.Accessibl === 'Non').length,
        accessibilityRate: buildings.length > 0 ? (buildings.filter(b => b.properties.Accessibl === 'Oui').length / buildings.length) * 100 : 0
      },
      floorDistribution,
      enqueteurs,
      dateRange: {
        earliest: buildings.reduce((earliest, b) => {
          const date = b.properties.Date_Enqu
          return !earliest || (date && date < earliest) ? date : earliest
        }, null) || new Date().toISOString().split('T')[0],
        latest: buildings.reduce((latest, b) => {
          const date = b.properties.Date_Enqu
          return !latest || (date && date > latest) ? date : latest
        }, null) || new Date().toISOString().split('T')[0]
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate required project info fields
    if (!formData.projectInfo.projectNumber || !formData.projectInfo.region || !formData.projectInfo.prefecture || !formData.projectInfo.secteur) {
      setError('Veuillez remplir tous les champs obligatoires du projet')
      return
    }

    // Validate buildings
    if (formData.buildings.length === 0) {
      setError('Le projet doit contenir au moins un bâtiment')
      return
    }

    // Validate required building fields
    for (let i = 0; i < formData.buildings.length; i++) {
      const building = formData.buildings[i]
      const props = building.properties
      if (!props.Batiment_i || !props.Numero_Fi || !props.Adresse || !props.Typologie || !props.Classific || !props.Risque || !props.Fiche_Bat) {
        setError(`Bâtiment ${i + 1}: Veuillez remplir tous les champs obligatoires (Batiment_i, Numero_Fi, Adresse, Typologie, Classification, Risque, Fiche_Bat)`)
        return
      }
    }

    try {
      setLoading(true)
      setError(null)

      // Calculate statistics
      const statistics = calculateStatistics()

      // Create GeoJSON features
      const features = formData.buildings.map(building => ({
        type: 'Feature',
        properties: building.properties,
        geometry: building.geometry
      }))

      // Create project data according to schema
      const projectData = {
        projectInfo: {
          ...formData.projectInfo,
          dateCreation: new Date(formData.projectInfo.dateCreation)
        },
        geojsonData: {
          type: 'FeatureCollection',
          features: features
        },
        statistics: statistics,
        metadata: {
          totalFeatures: features.length,
          boundingBox: {
            minLat: -90, maxLat: 90, minLng: -180, maxLng: 180
          },
          dataQuality: {
            completeRecords: features.length,
            incompleteRecords: 0,
            completenessRate: 100
          }
        },
        chefProjet: formData.chefProjet,
        equipe: formData.equipe
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
