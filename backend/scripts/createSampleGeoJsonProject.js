const mongoose = require('mongoose');
const Project = require('../models/Project');
require('dotenv').config();

// Sample GeoJSON data
const sampleGeoJson = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "School A",
        "type": "education",
        "description": "Primary school"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-7.620037, 33.589886]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Hospital B",
        "type": "health",
        "description": "Regional Hospital"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-7.618498, 33.587881]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Road 1",
        "type": "road",
        "surface": "asphalt"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-7.620037, 33.589886],
          [-7.618000, 33.588000],
          [-7.615000, 33.586000]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Green Park",
        "type": "park",
        "description": "Recreational green space"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-7.621000, 33.590000],
            [-7.620000, 33.590000],
            [-7.620000, 33.589000],
            [-7.621000, 33.589000],
            [-7.621000, 33.590000]
          ]
        ]
      }
    }
  ]
};

async function createSampleProject() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/geoporteil');
    console.log('✅ Connected to MongoDB');

    // Generate unique project number
    const projectNumber = `GEO-SAMPLE-${Date.now()}`;

    // Calculate center coordinates from GeoJSON features
    let centerLat = 0, centerLng = 0, pointCount = 0;

    sampleGeoJson.features.forEach(feature => {
      if (feature.geometry.type === 'Point') {
        centerLng += feature.geometry.coordinates[0];
        centerLat += feature.geometry.coordinates[1];
        pointCount++;
      }
    });

    if (pointCount > 0) {
      centerLng = centerLng / pointCount;
      centerLat = centerLat / pointCount;
    }

    // Create project with GeoJSON data
    const projectData = {
      projectNumber,
      anneeProjet: new Date().getFullYear().toString(),
      maitreOuvrage: null, // Will be set to null for now
      region: "Casablanca-Settat",
      prefecture: "Casablanca",
      consistance: `Sample Infrastructure Project with ${sampleGeoJson.features.length} geographic features including school, hospital, road, and park`,
      projectStatus: "En cours",
      latitude: centerLat.toString(),
      longitude: centerLng.toString(),
      geoJsonData: sampleGeoJson,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const project = new Project(projectData);
    await project.save();

    console.log('✅ Sample GeoJSON project created successfully!');
    console.log('📍 Project ID:', project._id);
    console.log('🔢 Project Number:', project.projectNumber);
    console.log('🗺️ Features:', sampleGeoJson.features.length);
    console.log('📍 Center coordinates:', [centerLat, centerLng]);

    return project;
  } catch (error) {
    console.error('❌ Error creating sample project:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the script if called directly
if (require.main === module) {
  createSampleProject()
    .then(() => {
      console.log('🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createSampleProject };
