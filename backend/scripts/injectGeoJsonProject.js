const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import the Project model
const Project = require('../models/Project');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/geoportail', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Function to read and parse GeoJSON data
const readGeoJsonData = () => {
  try {
    const geoJsonPath = path.join(__dirname, '../../frontend/public/project1.geojson');
    const rawData = fs.readFileSync(geoJsonPath, 'utf8');
    
    // Parse line-delimited GeoJSON
    const lines = rawData.trim().split('\n');
    const features = lines.map(line => {
      try {
        return JSON.parse(line.trim());
      } catch (e) {
        console.warn('Failed to parse line:', line.substring(0, 100));
        return null;
      }
    }).filter(Boolean);
    
    console.log(`📊 Parsed ${features.length} building features`);
    return features;
  } catch (error) {
    console.error('❌ Error reading GeoJSON file:', error);
    return [];
  }
};

// Function to calculate statistics from buildings
const calculateStats = (buildings) => {
  const stats = {
    totalBuildings: buildings.length,
    classifications: {},
    usageTypes: {},
    totalSurface: 0,
    totalResidents: 0,
    totalHouseholds: 0,
    averageSurface: 0,
    riskBuildings: 0,
    sectors: new Set(),
    surveyPeriod: { start: null, end: null }
  };

  buildings.forEach(building => {
    const props = building.properties;
    
    // Classifications
    const classif = props.Classific || 'Non classé';
    stats.classifications[classif] = (stats.classifications[classif] || 0) + 1;
    
    // Usage types
    const usage = props.Type_Usag || 'Non spécifié';
    stats.usageTypes[usage] = (stats.usageTypes[usage] || 0) + 1;
    
    // Surface area
    if (props.Superfici) {
      stats.totalSurface += parseFloat(props.Superfici) || 0;
    }
    
    // Residents and households
    if (props.Nombre_Re) {
      stats.totalResidents += parseInt(props.Nombre_Re) || 0;
    }
    if (props.Nombre_Me) {
      stats.totalHouseholds += parseInt(props.Nombre_Me) || 0;
    }
    
    // Risk buildings
    if (props.Classific === 'Danger' || props.Risque) {
      stats.riskBuildings++;
    }
    
    // Sectors
    if (props['Secteur/Q']) {
      stats.sectors.add(props['Secteur/Q']);
    }
    
    // Survey dates
    if (props.Date_Enqu) {
      const date = new Date(props.Date_Enqu);
      if (!isNaN(date.getTime())) {
        if (!stats.surveyPeriod.start || date < stats.surveyPeriod.start) {
          stats.surveyPeriod.start = date;
        }
        if (!stats.surveyPeriod.end || date > stats.surveyPeriod.end) {
          stats.surveyPeriod.end = date;
        }
      }
    }
  });
  
  stats.averageSurface = stats.totalSurface / stats.totalBuildings;
  stats.sectors = Array.from(stats.sectors);
  
  return stats;
};

// Function to create apartments data from buildings
const createApartmentsData = (buildings) => {
  return buildings.map((building, index) => {
    const props = building.properties;
    return {
      id: props.Batiment_i || props.Numero_Fi || `B${index + 1}`,
      address: props.Adresse || 'Adresse non spécifiée',
      surface: parseFloat(props.Superfici) || 0,
      levels: props.Nombre_Ni || 'N/A',
      usage: props.Type_Usag || 'Non spécifié',
      classification: props.Classific || 'Non classé',
      risk: props.Risque || null,
      residents: parseInt(props.Nombre_Re) || 0,
      households: parseInt(props.Nombre_Me) || 0,
      sector: props['Secteur/Q'] || 'Non spécifié',
      surveyor: props.Enqueteur || 'Non spécifié',
      surveyDate: props.Date_Enqu || null,
      photos: props.Photo ? props.Photo.split(';').map(p => p.trim()) : [],
      coordinates: building.geometry && building.geometry.coordinates && building.geometry.coordinates[0]
        ? building.geometry.coordinates[0][0]
        : [0, 0] // First coordinate of polygon or default
    };
  });
};

// Main function to inject the project
const injectGeoJsonProject = async () => {
  try {
    await connectDB();
    
    // Read GeoJSON data
    const buildings = readGeoJsonData();
    if (buildings.length === 0) {
      console.log('❌ No building data found');
      return;
    }
    
    // Calculate statistics
    const stats = calculateStats(buildings);
    console.log('📊 Calculated statistics:', {
      totalBuildings: stats.totalBuildings,
      totalSurface: Math.round(stats.totalSurface),
      totalResidents: stats.totalResidents,
      riskBuildings: stats.riskBuildings
    });
    
    // Create apartments data
    const apartments = createApartmentsData(buildings);
    
    // Delete existing projects
    await Project.deleteMany({});
    console.log('🗑️ Deleted existing projects');
    
    // Create the main project
    const project = new Project({
      projectNumber: "PROJ-001",
      nomProjet: "Project 1",
      consistance: "Analyse géospatiale et cartographie urbaine",
      region: "Casablanca-Settat",
      prefecture: "Casablanca",
      anneeProjet: "2024",
      dateDebutProjet: stats.surveyPeriod.start || new Date("2023-02-01"),
      dateFinProjet: stats.surveyPeriod.end || new Date("2023-12-31"),
      dateLivraisonPrevue: new Date("2024-01-31"),
      projectStatus: "En cours",
      latitude: "33.5932",
      longitude: "-7.5673",
      coordonneesX: "219738",
      coordonneesY: "124629",
      status: "accepté",
      archived: false,
      

      
      // Custom fields for building survey data
      buildingStats: {
        totalBuildings: stats.totalBuildings,
        totalSurface: Math.round(stats.totalSurface),
        averageSurface: Math.round(stats.averageSurface),
        totalResidents: stats.totalResidents,
        totalHouseholds: stats.totalHouseholds,
        riskBuildings: stats.riskBuildings,
        classifications: stats.classifications,
        usageTypes: stats.usageTypes,
        sectors: stats.sectors
      },
      
      // Store apartments/buildings data
      apartments: apartments,
      
      // GeoJSON data for map visualization
      geoJsonData: {
        type: "FeatureCollection",
        features: buildings
      }
    });
    
    await project.save();
    console.log('✅ Created project:', project.nomProjet);
    console.log('📊 Project statistics:');
    console.log(`   - ${stats.totalBuildings} bâtiments`);
    console.log(`   - ${stats.totalResidents} résidents`);
    console.log(`   - ${stats.riskBuildings} bâtiments à risque`);
    console.log(`   - ${Math.round(stats.totalSurface)} m² surface totale`);
    
    console.log('🎉 GeoJSON project injection completed successfully!');
    
  } catch (error) {
    console.error('❌ Error injecting project:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run the script
if (require.main === module) {
  injectGeoJsonProject();
}

module.exports = { injectGeoJsonProject };
