const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Project = require('../models/Project');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/geoportail', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
  createSingleProject();
}).catch(error => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

async function createSingleProject() {
  try {
    // 1. DELETE ALL EXISTING PROJECTS
    const deleteResult = await Project.deleteMany({});
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing projects`);
    
    // 2. Read GeoJSON file
    const geoJsonPath = path.join(__dirname, '../../frontend/public/project1.geojson');
    const rawData = fs.readFileSync(geoJsonPath, 'utf8');
    const lines = rawData.trim().split('\n');
    const features = lines.map(line => JSON.parse(line.trim()));
    
    console.log(`📊 Loaded ${features.length} building features from GeoJSON`);
    
    // 3. Calculate statistics
    let totalBuildings = features.length;
    let totalSurface = 0;
    let totalResidents = 0;
    let totalHouseholds = 0;
    let riskBuildings = 0;
    const classifications = {};
    const usageTypes = {};
    
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
        
        // Count risk buildings
        if (classification !== "Bon" && classification !== "Très Bon") {
          riskBuildings++;
        }
      }
      
      // Usage type analysis
      if (props.Type_Usag) {
        const usage = props.Type_Usag.trim();
        usageTypes[usage] = (usageTypes[usage] || 0) + 1;
      }
    });
    
    // 4. Create apartments data
    const apartments = features.map((feature, index) => {
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
    
    // 5. Create the SINGLE project
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
        totalBuildings: totalBuildings,
        totalSurface: Math.round(totalSurface),
        totalResidents: totalResidents,
        totalHouseholds: totalHouseholds,
        riskBuildings: riskBuildings,
        riskPercentage: Math.round((riskBuildings / totalBuildings) * 100),
        averageSurface: Math.round(totalSurface / totalBuildings),
        averageResidents: Math.round(totalResidents / totalBuildings * 10) / 10
      },
      
      apartments: apartments,
      
      geoJsonData: {
        type: "FeatureCollection",
        features: features
      },
      
      classifications: classifications,
      usageTypes: usageTypes,
      
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await project.save();
    
    console.log('✅ Created single project: Project 1');
    console.log(`📊 Statistics:`);
    console.log(`   - ${totalBuildings} bâtiments`);
    console.log(`   - ${totalResidents} résidents`);
    console.log(`   - ${totalHouseholds} ménages`);
    console.log(`   - ${riskBuildings} bâtiments à risque`);
    console.log(`   - ${Math.round(totalSurface)} m² surface totale`);
    
    // 6. Verify only one project exists
    const projectCount = await Project.countDocuments({});
    console.log(`✅ Total projects in database: ${projectCount}`);
    
    if (projectCount === 1) {
      console.log('🎉 SUCCESS: Only ONE project exists in the database!');
    } else {
      console.log('❌ ERROR: Multiple projects still exist!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}
