const mongoose = require('mongoose');
const Project = require('../models/Project');
require('dotenv').config();

// Real project data from the user
const realProjects = [
  {
    "_id": "676e787fc18d82a93baceb51",
    "projectNumber": "216",
    "anneeProjet": "2024",
    "region": "Souss-Massa",
    "prefecture": "Taroudannt",
    "consistance": "Projet de construction - Titre foncier T-",
    "projectStatus": "Suspendu",
    "dateDebutProjet": new Date("2024-12-27T00:00:00.000Z"),
    "latitude": "30.4697", // Taroudannt coordinates
    "longitude": "-7.9547",
    "status": "accepté",
    "archived": true
  },
  {
    "_id": "6776b6857e5543c9e498e54c",
    "projectNumber": "01",
    "anneeProjet": "2024",
    "region": "Marrakech-Safi",
    "prefecture": "Marrakech",
    "consistance": "TC - Construction résidentielle",
    "projectStatus": "livré",
    "dateDebutProjet": new Date("2025-01-02T00:00:00.000Z"),
    "dateLivraisonPrevue": new Date("2025-01-06T00:00:00.000Z"),
    "dateFinProjet": new Date("2025-01-06T00:00:00.000Z"),
    "latitude": "31.679834",
    "longitude": "-8.354474",
    "coordonneesX": "219738",
    "coordonneesY": "124629",
    "status": "accepté",
    "archived": false
  },
  {
    "_id": "677d12be9a6fa1883eba7cbf",
    "projectNumber": "02",
    "anneeProjet": "2025",
    "region": "Marrakech-Safi",
    "prefecture": "Marrakech",
    "consistance": "RDC+1 - Construction à étages",
    "projectStatus": "livré",
    "dateDebutProjet": new Date("2024-12-09T00:00:00.000Z"),
    "dateLivraisonPrevue": new Date("2025-01-07T00:00:00.000Z"),
    "dateFinProjet": new Date("2025-01-07T00:00:00.000Z"),
    "latitude": "31.676514",
    "longitude": "-8.046342",
    "status": "accepté",
    "archived": false
  },
  {
    "_id": "677d14f89a6fa1883eba8219",
    "projectNumber": "03",
    "anneeProjet": "2025",
    "region": "Marrakech-Safi",
    "prefecture": "Marrakech",
    "consistance": "TN - Terrain nu pour construction",
    "projectStatus": "livré",
    "dateDebutProjet": new Date("2025-01-07T00:00:00.000Z"),
    "dateLivraisonPrevue": new Date("2025-01-14T00:00:00.000Z"),
    "dateFinProjet": new Date("2025-01-14T00:00:00.000Z"),
    "latitude": "31.572958",
    "longitude": "-7.962957",
    "status": "accepté",
    "archived": false
  },
  {
    "_id": "677e409efc4adc3947112065",
    "projectNumber": "04",
    "anneeProjet": "2025",
    "region": "Marrakech-Safi",
    "prefecture": "Marrakech",
    "consistance": "TN - Terrain nu",
    "projectStatus": "livré",
    "dateDebutProjet": new Date("2025-01-08T00:00:00.000Z"),
    "dateFinProjet": new Date("2025-01-16T00:00:00.000Z"),
    "dateLivraisonPrevue": new Date("2025-01-15T00:00:00.000Z"),
    "latitude": "31.572574",
    "longitude": "-7.961063",
    "status": "accepté",
    "archived": false
  },
  {
    "_id": "677e94acfc4adc394711e21d",
    "projectNumber": "05",
    "anneeProjet": "2025",
    "region": "Marrakech-Safi",
    "prefecture": "Marrakech",
    "consistance": "TN - Terrain nu avec titre foncier",
    "projectStatus": "En cours",
    "dateDebutProjet": new Date("2025-01-08T00:00:00.000Z"),
    "dateLivraisonPrevue": new Date("2025-02-08T00:00:00.000Z"),
    "dateFinProjet": new Date("2025-03-15T00:00:00.000Z"),
    "latitude": "31.669407",
    "longitude": "-7.928995",
    "status": "accepté",
    "archived": false
  }
];

async function injectRealProjects() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/geoporteil');
    console.log('✅ Connected to MongoDB');

    // Clear existing projects (except the GeoJSON sample)
    const deleteResult = await Project.deleteMany({ 
      projectNumber: { $ne: 'GEO-SAMPLE-1753055140612' } 
    });
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing projects`);

    // Insert real projects
    const insertedProjects = [];
    
    for (const projectData of realProjects) {
      try {
        // Convert string _id to ObjectId
        const { _id, ...projectWithoutId } = projectData;
        
        const project = new Project({
          ...projectWithoutId,
          _id: new mongoose.Types.ObjectId(_id),
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        await project.save();
        insertedProjects.push(project);
        console.log(`✅ Inserted project ${project.projectNumber} (${project.region})`);
      } catch (error) {
        console.error(`❌ Error inserting project ${projectData.projectNumber}:`, error.message);
      }
    }

    console.log(`🎉 Successfully injected ${insertedProjects.length} real projects!`);
    
    // Show summary
    const totalProjects = await Project.countDocuments();
    console.log(`📊 Total projects in database: ${totalProjects}`);
    
    const projectsByStatus = await Project.aggregate([
      { $group: { _id: '$projectStatus', count: { $sum: 1 } } }
    ]);
    
    console.log('📈 Projects by status:');
    projectsByStatus.forEach(status => {
      console.log(`   ${status._id}: ${status.count}`);
    });

    return insertedProjects;
  } catch (error) {
    console.error('❌ Error injecting projects:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the script if called directly
if (require.main === module) {
  injectRealProjects()
    .then(() => {
      console.log('🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { injectRealProjects };
