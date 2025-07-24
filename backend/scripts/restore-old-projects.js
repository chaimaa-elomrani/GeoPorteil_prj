const mongoose = require('mongoose');
const Project = require('../models/Project');

// Old projects data converted to new schema
const oldProjectsConverted = [
  {
    projectInfo: {
      projectNumber: "01",
      anneeProjet: 2024,
      region: "Marrakech-Safi",
      prefecture: "Marrakech",
      secteur: "Construction résidentielle",
      dateCreation: new Date("2025-01-02T00:00:00.000Z"),
      status: "accepté"
    },
    geojsonData: {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties: {
          Batiment_i: "B1",
          Numero_Fi: "F1",
          Date_Enqu: "2025-01-02",
          Enqueteur: "System",
          'Secteur/Q': "Construction résidentielle",
          Adresse: "Marrakech",
          Superfici: 100,
          Type_Usag: "Habitat",
          Nombre_Re: 5,
          Typologie: "Maison Moderne",
          Classific: "Bon",
          Risque: "Faible",
          Fiche_Bat: "F01"
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[31.679834, -8.354474], [31.679834, -8.354474], [31.679834, -8.354474], [31.679834, -8.354474], [31.679834, -8.354474]]]
        }
      }]
    },
    statistics: {
      totalBuildings: 1,
      totalResidents: 5,
      averageResidentsPerBuilding: 5,
      totalSurface: 100,
      averageSurfacePerBuilding: 100,
      riskClassification: { "Bon": { count: 1, percentage: 100 } },
      buildingTypes: { "Maison_Moderne": { count: 1, percentage: 100 } },
      usageTypes: { "Habitat": { count: 1, percentage: 100 } },
      occupationStatus: {},
      propertyOwnership: {},
      accessibility: { accessible: 0, notAccessible: 0, accessibilityRate: 0 },
      floorDistribution: {},
      enqueteurs: { "System": { count: 1, percentage: 100 } },
      dateRange: { earliest: "2025-01-02", latest: "2025-01-02" }
    },
    metadata: {
      totalFeatures: 1,
      boundingBox: { minLat: 31.679834, maxLat: 31.679834, minLng: -8.354474, maxLng: -8.354474 },
      dataQuality: { completeRecords: 1, incompleteRecords: 0, completenessRate: 100 }
    }
  },
  {
    projectInfo: {
      projectNumber: "02",
      anneeProjet: 2025,
      region: "Marrakech-Safi",
      prefecture: "Marrakech",
      secteur: "Construction à étages",
      dateCreation: new Date("2024-12-09T00:00:00.000Z"),
      status: "accepté"
    },
    geojsonData: {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties: {
          Batiment_i: "B1",
          Numero_Fi: "F1",
          Date_Enqu: "2024-12-09",
          Enqueteur: "System",
          'Secteur/Q': "Construction à étages",
          Adresse: "Marrakech",
          Superfici: 150,
          Type_Usag: "Habitat",
          Nombre_Re: 8,
          Typologie: "Immeuble",
          Classific: "Très Bon",
          Risque: "Faible",
          Fiche_Bat: "F02"
        },
        geometry: {
          type: "Polygon",
          coordinates: [[[31.676514, -8.046342], [31.676514, -8.046342], [31.676514, -8.046342], [31.676514, -8.046342], [31.676514, -8.046342]]]
        }
      }]
    },
    statistics: {
      totalBuildings: 1,
      totalResidents: 8,
      averageResidentsPerBuilding: 8,
      totalSurface: 150,
      averageSurfacePerBuilding: 150,
      riskClassification: { "Très_Bon": { count: 1, percentage: 100 } },
      buildingTypes: { "Immeuble": { count: 1, percentage: 100 } },
      usageTypes: { "Habitat": { count: 1, percentage: 100 } },
      occupationStatus: {},
      propertyOwnership: {},
      accessibility: { accessible: 0, notAccessible: 0, accessibilityRate: 0 },
      floorDistribution: {},
      enqueteurs: { "System": { count: 1, percentage: 100 } },
      dateRange: { earliest: "2024-12-09", latest: "2024-12-09" }
    },
    metadata: {
      totalFeatures: 1,
      boundingBox: { minLat: 31.676514, maxLat: 31.676514, minLng: -8.046342, maxLng: -8.046342 },
      dataQuality: { completeRecords: 1, incompleteRecords: 0, completenessRate: 100 }
    }
  }
];

async function restoreOldProjects() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/geoporteil');
    console.log('✅ Connected to MongoDB');

    // Insert converted projects
    let insertedCount = 0;
    
    for (const projectData of oldProjectsConverted) {
      try {
        // Check if project already exists
        const existing = await Project.findOne({
          'projectInfo.projectNumber': projectData.projectInfo.projectNumber
        });
        
        if (existing) {
          console.log(`⚠️ Project ${projectData.projectInfo.projectNumber} already exists, skipping`);
          continue;
        }
        
        const project = new Project(projectData);
        await project.save();
        insertedCount++;
        console.log(`✅ Restored project ${projectData.projectInfo.projectNumber} (${projectData.projectInfo.secteur})`);
      } catch (error) {
        console.error(`❌ Error restoring project ${projectData.projectInfo.projectNumber}:`, error.message);
      }
    }

    console.log(`🎉 Successfully restored ${insertedCount} old projects!`);
    
    // Show summary
    const totalProjects = await Project.countDocuments();
    console.log(`📊 Total projects in database: ${totalProjects}`);
    
    const allProjects = await Project.find({}, 'projectInfo.projectNumber projectInfo.secteur');
    console.log('📋 All projects:');
    allProjects.forEach(project => {
      console.log(`   - ${project.projectInfo.projectNumber}: ${project.projectInfo.secteur}`);
    });

  } catch (error) {
    console.error('❌ Error restoring projects:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

restoreOldProjects();
