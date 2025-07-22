const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
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

// Read and parse GeoJSON file
const readGeoJsonFile = () => {
  try {
    const filePath = path.join(__dirname, '../../frontend/public/project1.geojson');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse each line as a separate GeoJSON feature
    const lines = fileContent.trim().split('\n');
    const features = lines.map(line => JSON.parse(line));
    
    return features;
  } catch (error) {
    console.error('❌ Error reading GeoJSON file:', error);
    throw error;
  }
};

// Calculate comprehensive statistics
const calculateStatistics = (features) => {
  console.log(`📊 Analyzing ${features.length} building features...`);
  
  let totalBuildings = features.length;
  let totalSurface = 0;
  let totalResidents = 0;
  let totalHouseholds = 0;
  let riskBuildings = 0;
  
  // Classification breakdown
  const classifications = {};
  const usageTypes = {};
  const typologies = {};
  const riskTypes = {};
  
  features.forEach(feature => {
    const props = feature.properties;
    
    // Surface area
    if (props.Superfici && !isNaN(props.Superfici)) {
      totalSurface += parseFloat(props.Superfici);
    }
    
    // Residents count
    if (props.Nombre_Re && !isNaN(props.Nombre_Re)) {
      totalResidents += parseInt(props.Nombre_Re);
    }
    
    // Households count
    if (props.Nombre_Me && !isNaN(props.Nombre_Me)) {
      totalHouseholds += parseInt(props.Nombre_Me);
    }
    
    // Classification analysis
    if (props.Classific) {
      const classification = props.Classific.trim();
      classifications[classification] = (classifications[classification] || 0) + 1;
      
      // Count risk buildings (anything not "Bon")
      if (classification !== "Bon" && classification !== "Très Bon") {
        riskBuildings++;
      }
    }
    
    // Usage type analysis
    if (props.Type_Usag) {
      const usage = props.Type_Usag.trim();
      usageTypes[usage] = (usageTypes[usage] || 0) + 1;
    }
    
    // Typology analysis
    if (props.Typologie) {
      const typology = props.Typologie.trim();
      typologies[typology] = (typologies[typology] || 0) + 1;
    }
    
    // Risk analysis
    if (props.Risque) {
      const risks = props.Risque.split('/').map(r => r.trim()).filter(r => r);
      risks.forEach(risk => {
        riskTypes[risk] = (riskTypes[risk] || 0) + 1;
      });
    }
  });
  
  return {
    totalBuildings,
    totalSurface: Math.round(totalSurface),
    totalResidents,
    totalHouseholds,
    riskBuildings,
    riskPercentage: Math.round((riskBuildings / totalBuildings) * 100),
    averageSurface: Math.round(totalSurface / totalBuildings),
    averageResidents: Math.round(totalResidents / totalBuildings * 10) / 10,
    classifications,
    usageTypes,
    typologies,
    riskTypes
  };
};

// Create apartments data
const createApartmentsData = (features) => {
  return features.map((feature, index) => {
    const props = feature.properties;
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
      coordinates: feature.geometry && feature.geometry.coordinates ? feature.geometry.coordinates[0] : null
    };
  });
};

// Main function to create the project
const createSingleProject = async () => {
  try {
    await connectDB();
    
    // Read GeoJSON data
    const features = readGeoJsonFile();
    console.log(`📊 Loaded ${features.length} building features`);
    
    // Calculate statistics
    const stats = calculateStatistics(features);
    console.log('📊 Calculated statistics:', {
      totalBuildings: stats.totalBuildings,
      totalSurface: stats.totalSurface,
      totalResidents: stats.totalResidents,
      riskBuildings: stats.riskBuildings
    });
    
    // Create apartments data
    const apartments = createApartmentsData(features);
    
    // Delete all existing projects
    await Project.deleteMany({});
    console.log('🗑️ Deleted all existing projects');
    
    // Create the single project
    const project = new Project({
      projectNumber: "PROJ-001",
      nomProjet: "Project 1",
      consistance: "Analyse géospatiale et cartographie urbaine",
      region: "Casablanca-Settat",
      prefecture: "Casablanca",
      anneeProjet: "2024",
      dateDebutProjet: new Date("2023-01-01"),
      dateFinProjet: new Date("2023-12-31"),
      dateLivraisonPrevue: new Date("2024-01-31"),
      projectStatus: "En cours",
      latitude: "33.5932",
      longitude: "-7.5673",
      coordonneesX: "219738",
      coordonneesY: "124629",
      status: "accepté",
      archived: false,
      
      // Building survey data
      buildingStats: {
        totalBuildings: stats.totalBuildings,
        totalSurface: stats.totalSurface,
        totalResidents: stats.totalResidents,
        totalHouseholds: stats.totalHouseholds,
        riskBuildings: stats.riskBuildings,
        riskPercentage: stats.riskPercentage,
        averageSurface: stats.averageSurface,
        averageResidents: stats.averageResidents
      },
      
      apartments: apartments,
      
      geoJsonData: {
        type: "FeatureCollection",
        features: features
      },
      
      classifications: stats.classifications,
      usageTypes: stats.usageTypes,
      typologies: stats.typologies,
      riskTypes: stats.riskTypes,
      
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await project.save();
    console.log(`✅ Created project: ${project.nomProjet}`);
    
    // Display statistics
    console.log('📊 Project statistics:');
    console.log(`   - ${stats.totalBuildings} bâtiments`);
    console.log(`   - ${stats.totalResidents} résidents`);
    console.log(`   - ${stats.totalHouseholds} ménages`);
    console.log(`   - ${stats.riskBuildings} bâtiments à risque`);
    console.log(`   - ${stats.totalSurface} m² surface totale`);
    console.log(`   - ${stats.averageSurface} m² surface moyenne`);
    
    console.log('\n🎉 Single project creation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error creating project:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run the script
if (require.main === module) {
  createSingleProject();
}

module.exports = { createSingleProject };
