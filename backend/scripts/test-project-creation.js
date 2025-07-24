const mongoose = require('mongoose')
const Project = require('../models/Project')

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/geoporteil')
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

// Test project creation
const testProjectCreation = async () => {
  try {
    console.log('🧪 Testing project creation...')
    
    const testProjectData = {
      projectInfo: {
        projectNumber: `TEST-${Date.now()}`,
        anneeProjet: 2024,
        region: 'Test Region',
        prefecture: 'Test Prefecture',
        secteur: 'Test Sector',
        dateCreation: new Date(),
        status: 'accepté'
      },
      geojsonData: {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {
            Batiment_i: 'B1',
            Numero_Fi: 'F1',
            Date_Enqu: '2024-01-01',
            Enqueteur: 'Test Enqueteur',
            'Secteur/Q': 'Test Sector',
            Adresse: 'Test Address',
            Superfici: 100,
            Type_Usag: 'Habitat',
            Nombre_Re: 5,
            Typologie: 'Maison Moderne',
            Classific: 'Bon',
            Risque: 'Faible',
            Fiche_Bat: 'FICHE-1'
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
          }
        }]
      },
      statistics: {
        totalBuildings: 1,
        totalResidents: 5,
        averageResidentsPerBuilding: 5,
        totalSurface: 100,
        averageSurfacePerBuilding: 100,
        riskClassification: {
          'Faible': { count: 1, percentage: 100 }
        },
        buildingTypes: {
          'Maison_Moderne': { count: 1, percentage: 100 }
        },
        usageTypes: {
          'Habitat': { count: 1, percentage: 100 }
        },
        occupationStatus: {},
        propertyOwnership: {},
        accessibility: {
          accessible: 0,
          notAccessible: 0,
          accessibilityRate: 0
        },
        floorDistribution: {},
        enqueteurs: {
          'Test_Enqueteur': { count: 1, percentage: 100 }
        },
        dateRange: {
          earliest: '2024-01-01',
          latest: '2024-01-01'
        }
      },
      metadata: {
        totalFeatures: 1,
        boundingBox: {
          minLat: -90,
          maxLat: 90,
          minLng: -180,
          maxLng: 180
        },
        dataQuality: {
          completeRecords: 1,
          incompleteRecords: 0,
          completenessRate: 100
        }
      }
    }
    
    console.log('📝 Creating test project...')
    const project = new Project(testProjectData)
    await project.save()
    
    console.log('✅ Test project created successfully!')
    console.log('📊 Project ID:', project._id)
    console.log('📊 Project Number:', project.projectInfo.projectNumber)
    
    // Clean up - remove the test project
    await Project.findByIdAndDelete(project._id)
    console.log('🧹 Test project cleaned up')
    
  } catch (error) {
    console.error('❌ Error testing project creation:', error)
    console.error('❌ Error details:', error.message)
    if (error.errors) {
      console.error('❌ Validation errors:', Object.keys(error.errors))
    }
  }
}

// Run the test
const run = async () => {
  await connectDB()
  await testProjectCreation()
  await mongoose.disconnect()
  console.log('👋 Disconnected from MongoDB')
  process.exit(0)
}

run()
