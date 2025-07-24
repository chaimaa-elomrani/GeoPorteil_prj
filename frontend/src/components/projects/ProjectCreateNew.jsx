import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Plus, X, User, Users, Building } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { apiService } from '../../services/api'
import apiServiceDefault from '../../services/api'

const ProjectCreateNew = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  
  const [formData, setFormData] = useState({
    // Project Info
    projectInfo: {
      projectNumber: '', // Will be generated in useEffect
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
        Date_Enqu: new Date().toISOString().split('T')[0],
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
        coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
      }
    }],
    
    // Team management
    chefProjet: '',
    equipe: []
  })

  useEffect(() => {
    fetchUsers()
    generateProjectNumber()
  }, [])

  const generateProjectNumber = () => {
    const year = new Date().getFullYear()
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const projectNumber = `PROJ-${year}-${timestamp}-${random}`

    setFormData(prev => ({
      ...prev,
      projectInfo: {
        ...prev.projectInfo,
        projectNumber: projectNumber
      }
    }))
  }

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

  const addBuilding = () => {
    const newBuilding = {
      properties: {
        Batiment_i: '',
        Numero_Fi: '',
        Date_Enqu: new Date().toISOString().split('T')[0],
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
        coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
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

  const calculateStatistics = () => {
    const buildings = formData.buildings
    const totalBuildings = buildings.length
    const totalResidents = buildings.reduce((sum, b) => sum + (b.properties.Nombre_Re || 0), 0)
    const totalSurface = buildings.reduce((sum, b) => sum + (b.properties.Superfici || 0), 0)

    // Convert Maps to Objects for MongoDB storage
    const convertMapToObject = (map) => {
      const obj = {}
      map.forEach((value, key) => {
        obj[key] = value
      })
      return obj
    }

    // Create statistics maps (simplified for creation)
    const riskClassification = new Map()
    const buildingTypes = new Map()
    const usageTypes = new Map()
    const occupationStatus = new Map()
    const propertyOwnership = new Map()
    const floorDistribution = new Map()
    const enqueteurs = new Map()

    buildings.forEach(building => {
      const props = building.properties

      // Process each classification type
      if (props.Classific) {
        const key = props.Classific.replace(/[.\s/]/g, '_')
        riskClassification.set(key, {
          count: (riskClassification.get(key)?.count || 0) + 1,
          percentage: 0
        })
      }

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
        value.percentage = totalBuildings > 0 ? Math.round((value.count / totalBuildings) * 100) : 0
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
      averageResidentsPerBuilding: totalBuildings > 0 ? Math.round((totalResidents / totalBuildings) * 100) / 100 : 0,
      totalSurface,
      averageSurfacePerBuilding: totalBuildings > 0 ? Math.round((totalSurface / totalBuildings) * 100) / 100 : 0,
      riskClassification: convertMapToObject(riskClassification),
      buildingTypes: convertMapToObject(buildingTypes),
      usageTypes: convertMapToObject(usageTypes),
      occupationStatus: convertMapToObject(occupationStatus),
      propertyOwnership: convertMapToObject(propertyOwnership),
      accessibility: {
        accessible: buildings.filter(b => b.properties.Accessibl === 'Oui').length,
        notAccessible: buildings.filter(b => b.properties.Accessibl === 'Non').length,
        accessibilityRate: buildings.length > 0 ? Math.round((buildings.filter(b => b.properties.Accessibl === 'Oui').length / buildings.length) * 100) : 0
      },
      floorDistribution: convertMapToObject(floorDistribution),
      enqueteurs: convertMapToObject(enqueteurs),
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
        setError(`Bâtiment ${i + 1}: Veuillez remplir tous les champs obligatoires`)
        return
      }
    }

    try {
      setLoading(true)
      setError(null)

      // Calculate statistics
      const statistics = calculateStatistics()

      // Create GeoJSON features with proper validation
      const features = formData.buildings.map((building, index) => {
        // Ensure all required fields have values
        const properties = {
          ...building.properties,
          Batiment_i: building.properties.Batiment_i || `B${index + 1}`,
          Numero_Fi: building.properties.Numero_Fi || `F${index + 1}`,
          Date_Enqu: building.properties.Date_Enqu || new Date().toISOString().split('T')[0],
          Enqueteur: building.properties.Enqueteur || 'Non spécifié',
          'Secteur/Q': building.properties['Secteur/Q'] || formData.projectInfo.secteur,
          Adresse: building.properties.Adresse || 'Adresse non spécifiée',
          Superfici: Number(building.properties.Superfici) || 0,
          Type_Usag: building.properties.Type_Usag || 'Habitat',
          Nombre_Re: Number(building.properties.Nombre_Re) || 0,
          Typologie: building.properties.Typologie || 'Maison Moderne',
          Classific: building.properties.Classific || 'Bon',
          Risque: building.properties.Risque || 'Faible',
          Fiche_Bat: building.properties.Fiche_Bat || `FICHE-${index + 1}`
        }

        return {
          type: 'Feature',
          properties: properties,
          geometry: building.geometry
        }
      })

      // Create project data according to schema
      const projectData = {
        projectInfo: {
          projectNumber: formData.projectInfo.projectNumber,
          anneeProjet: Number(formData.projectInfo.anneeProjet) || new Date().getFullYear(),
          region: formData.projectInfo.region || 'Default Region',
          prefecture: formData.projectInfo.prefecture || 'Default Prefecture',
          secteur: formData.projectInfo.secteur || 'Default Sector',
          dateCreation: new Date(formData.projectInfo.dateCreation || new Date()),
          status: formData.projectInfo.status || 'accepté'
        },
        geojsonData: {
          type: 'FeatureCollection',
          features: features
        },
        statistics: statistics,
        metadata: {
          totalFeatures: features.length,
          boundingBox: {
            minLat: -90,
            maxLat: 90,
            minLng: -180,
            maxLng: 180
          },
          dataQuality: {
            completeRecords: features.length,
            incompleteRecords: 0,
            completenessRate: 100
          }
        }
      }

      // Add team data if provided
      if (formData.chefProjet) {
        projectData.chefProjet = formData.chefProjet
      }
      if (formData.equipe && formData.equipe.length > 0) {
        projectData.equipe = formData.equipe
      }

      console.log('🚀 Sending project data:', JSON.stringify(projectData, null, 2))

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
    <div className="min-h-screen bg-gray-50">
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
              <h1 className="text-2xl font-bold text-gray-900">Nouveau Projet</h1>
              <p className="text-gray-600 mt-1">Créer un nouveau projet avec données d'enquête</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => navigate("/projects")}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Annuler</span>
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Création...' : 'Créer le projet'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informations du projet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de projet *
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        value={formData.projectInfo.projectNumber}
                        onChange={(e) => handleProjectInfoChange('projectNumber', e.target.value)}
                        placeholder="Ex: 2024-123456"
                        required
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={generateProjectNumber}
                        variant="outline"
                        size="sm"
                        className="px-3"
                        title="Générer un nouveau numéro"
                      >
                        🔄
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Année du projet *
                    </label>
                    <Input
                      type="number"
                      value={formData.projectInfo.anneeProjet || ''}
                      onChange={(e) => handleProjectInfoChange('anneeProjet', parseInt(e.target.value) || new Date().getFullYear())}
                      placeholder="2024"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Région *
                    </label>
                    <Input
                      value={formData.projectInfo.region}
                      onChange={(e) => handleProjectInfoChange('region', e.target.value)}
                      placeholder="Ex: Souss-Massa"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Préfecture *
                    </label>
                    <Input
                      value={formData.projectInfo.prefecture}
                      onChange={(e) => handleProjectInfoChange('prefecture', e.target.value)}
                      placeholder="Ex: Taroudannt"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Secteur *
                    </label>
                    <Input
                      value={formData.projectInfo.secteur}
                      onChange={(e) => handleProjectInfoChange('secteur', e.target.value)}
                      placeholder="Ex: DERB MOULAY CHERIF"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de création
                    </label>
                    <Input
                      type="date"
                      value={formData.projectInfo.dateCreation}
                      onChange={(e) => handleProjectInfoChange('dateCreation', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statut
                    </label>
                    <select
                      value={formData.projectInfo.status}
                      onChange={(e) => handleProjectInfoChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="accepté">Accepté</option>
                      <option value="active">Actif</option>
                      <option value="completed">Terminé</option>
                      <option value="suspended">Suspendu</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Buildings Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Bâtiments ({formData.buildings.length})
                  </CardTitle>
                  <Button
                    onClick={addBuilding}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter un bâtiment</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.buildings.map((building, buildingIndex) => (
                  <div key={buildingIndex} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Bâtiment {buildingIndex + 1}
                      </h3>
                      {formData.buildings.length > 1 && (
                        <Button
                          onClick={() => removeBuilding(buildingIndex)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Essential Building Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ID Bâtiment *
                        </label>
                        <Input
                          value={building.properties.Batiment_i}
                          onChange={(e) => handleBuildingPropertyChange(buildingIndex, 'Batiment_i', e.target.value)}
                          placeholder="Ex: B001"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 nb-1">
                          Numéro Fiche *
                        </label>
                        <Input
                          value={building.properties.Numero_Fi}
                          onChange={(e) => handleBuildingPropertyChange(buildingIndex, 'Numero_Fi', e.target.value)}
                          placeholder="Ex: F001"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date d'enquête
                        </label>
                        <Input
                          type="date"
                          value={building.properties.Date_Enqu}
                          onChange={(e) => handleBuildingPropertyChange(buildingIndex, 'Date_Enqu', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adresse *
                        </label>
                        <Input
                          value={building.properties.Adresse}
                          onChange={(e) => handleBuildingPropertyChange(buildingIndex, 'Adresse', e.target.value)}
                          placeholder="Adresse complète"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Enquêteur
                        </label>
                        <Input
                          value={building.properties.Enqueteur}
                          onChange={(e) => handleBuildingPropertyChange(buildingIndex, 'Enqueteur', e.target.value)}
                          placeholder="Nom de l'enquêteur"
                        />
                      </div>
                    </div>

                    {/* Building Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Surface (m²) *
                        </label>
                        <Input
                          type="number"
                          value={building.properties.Superfici || ''}
                          onChange={(e) => handleBuildingPropertyChange(buildingIndex, 'Superfici', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre d'étages
                        </label>
                        <Input
                          value={building.properties.Nombre_Ni}
                          onChange={(e) => handleBuildingPropertyChange(buildingIndex, 'Nombre_Ni', e.target.value)}
                          placeholder="Ex: R+2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre de résidents *
                        </label>
                        <Input
                          type="number"
                          value={building.properties.Nombre_Re || ''}
                          onChange={(e) => handleBuildingPropertyChange(buildingIndex, 'Nombre_Re', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre de ménages
                        </label>
                        <Input
                          type="number"
                          value={building.properties.Nombre_Me || ''}
                          onChange={(e) => handleBuildingPropertyChange(buildingIndex, 'Nombre_Me', parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Classification and Risk */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Typologie *
                        </label>
                        <select
                          value={building.properties.Typologie}
                          onChange={(e) => handleBuildingPropertyChange(buildingIndex, 'Typologie', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Sélectionner...</option>
                          <option value="Maison Moderne">Maison Moderne</option>
                          <option value="Maison Traditionnelle">Maison Traditionnelle</option>
                          <option value="Immeuble">Immeuble</option>
                          <option value="Villa">Villa</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Classification *
                        </label>
                        <select
                          value={building.properties.Classific}
                          onChange={(e) => handleBuildingPropertyChange(buildingIndex, 'Classific', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Sélectionner...</option>
                          <option value="Bon">Bon</option>
                          <option value="Très Bon">Très Bon</option>
                          <option value="Moyen">Moyen</option>
                          <option value="Facteurs De Dégradation">Facteurs De Dégradation</option>
                          <option value="Danger">Danger</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Risque *
                        </label>
                        <select
                          value={building.properties.Risque}
                          onChange={(e) => handleBuildingPropertyChange(buildingIndex, 'Risque', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Sélectionner...</option>
                          <option value="Faible">Faible</option>
                          <option value="Moyen">Moyen</option>
                          <option value="Élevé">Élevé</option>
                          <option value="Très Élevé">Très Élevé</option>
                        </select>
                      </div>
                    </div>

                    {/* Additional Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type d'usage *
                        </label>
                        <select
                          value={building.properties.Type_Usag}
                          onChange={(e) => handleBuildingPropertyChange(buildingIndex, 'Type_Usag', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Sélectionner...</option>
                          <option value="Habitat">Habitat</option>
                          <option value="Commerce">Commerce</option>
                          <option value="Habitat/Commerces">Habitat/Commerces</option>
                          <option value="Industriel">Industriel</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Accessibilité
                        </label>
                        <select
                          value={building.properties.Accessibl}
                          onChange={(e) => handleBuildingPropertyChange(buildingIndex, 'Accessibl', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Sélectionner...</option>
                          <option value="Oui">Oui</option>
                          <option value="Non">Non</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fiche Bâtiment *
                        </label>
                        <Input
                          value={building.properties.Fiche_Bat}
                          onChange={(e) => handleBuildingPropertyChange(buildingIndex, 'Fiche_Bat', e.target.value)}
                          placeholder="Référence fiche"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Gestion d'équipe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Chef de projet */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chef de projet
                  </label>
                  {loadingUsers ? (
                    <div className="text-sm text-gray-500">Chargement...</div>
                  ) : (
                    <select
                      value={formData.chefProjet}
                      onChange={(e) => setFormData(prev => ({ ...prev, chefProjet: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Sélectionner un chef</option>
                      {users.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.firstName} {user.lastName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Équipe du projet */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Users className="h-4 w-4 inline mr-1" />
                    Équipe ({formData.equipe.length})
                  </label>
                  {loadingUsers ? (
                    <div className="text-sm text-gray-500">Chargement...</div>
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
                </div>
              </CardContent>
            </Card>

            {/* Project Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Résumé du projet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Bâtiments</span>
                  <span className="text-sm font-medium text-gray-900">{formData.buildings.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Résidents totaux</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formData.buildings.reduce((sum, b) => sum + (b.properties.Nombre_Re || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Surface totale</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formData.buildings.reduce((sum, b) => sum + (b.properties.Superfici || 0), 0)} m²
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-500">Équipe</span>
                  <span className="text-sm font-medium text-gray-900">{formData.equipe.length} membre(s)</span>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Remplissez tous les champs obligatoires (*)</p>
                  <p>• Ajoutez au moins un bâtiment avec ses détails</p>
                  <p>• Sélectionnez un chef de projet et une équipe</p>
                  <p>• Les statistiques seront calculées automatiquement</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectCreateNew
