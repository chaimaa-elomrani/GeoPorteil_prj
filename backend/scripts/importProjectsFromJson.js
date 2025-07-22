const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Project = require('../models/Project');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/geoporteil', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
  importProjects();
}).catch(error => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

async function importProjects() {
  try {
    // 1. DELETE ALL EXISTING PROJECTS
    const deleteResult = await Project.deleteMany({});
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing projects`);
    
    // 2. Read projects.json file
    const projectsJsonPath = path.join(__dirname, '../../frontend/public/projects.json');
    const rawData = fs.readFileSync(projectsJsonPath, 'utf8');
    const projectsData = JSON.parse(rawData);
    
    console.log(`📊 Loaded ${projectsData.length} projects from JSON`);
    
    // 3. Transform and import projects
    let importedCount = 0;
    let skippedCount = 0;
    
    for (const projectData of projectsData) {
      try {
        // Transform the data to match our schema
        const transformedProject = {
          projectNumber: projectData.projectNumber || 'N/A',
          nomProjet: projectData.nomProjet || `Projet ${projectData.projectNumber}`,
          anneeProjet: projectData.anneeProjet || new Date().getFullYear(),
          consistance: projectData.consistance || 'Non spécifié',
          region: projectData.region || 'Non spécifié',
          prefecture: projectData.prefecture || 'Non spécifié',
          Commune: projectData.Commune || '',
          cercle: projectData.cercle || '',
          
          // Dates
          dateDebutProjet: projectData.dateDebutProjet?.$date ? new Date(projectData.dateDebutProjet.$date) : null,
          dateFinProjet: projectData.dateFinProjet?.$date ? new Date(projectData.dateFinProjet.$date) : null,
          dateLivraisonPrevue: projectData.dateLivraisonPrevue?.$date ? new Date(projectData.dateLivraisonPrevue.$date) : null,
          DateDeCreation: projectData.DateDeCreation ? new Date(projectData.DateDeCreation) : new Date(),
          
          // Status and administrative info
          projectStatus: projectData.projectStatus || 'En cours',
          status: projectData.status || 'accepté',
          archived: projectData.archived || false,
          
          // Land information
          statutFoncier: projectData.statutFoncier || '',
          referenceFonciere: projectData.referenceFonciere || '',
          
          // Coordinates
          latitude: projectData.latitude || '',
          longitude: projectData.longitude || '',
          coordonneesX: projectData.coordonneesX || '',
          coordonneesY: projectData.coordonneesY || '',
          
          // Project management
          tempsPasse: projectData.tempsPasse || 0,
          Facture: projectData.Facture || [],
          idDevis: projectData.idDevis || '',
          
          // References to other collections (will be null for now)
          maitreOuvrage: projectData.maitreOuvrage?.$oid || null,
          missionProjet: projectData.missionProjet?.$oid || null,
          chefProjet: null, // Will be assigned later
          equipe: [], // Will be assigned later
          
          // History
          historiqueArrets: projectData.historiqueArrets || [],
          estArrete: projectData.estArrete || false,
          dateArret: projectData.dateArret?.$date ? new Date(projectData.dateArret.$date) : null,
          dateDerniereReprise: projectData.dateDerniereReprise?.$date ? new Date(projectData.dateDerniereReprise.$date) : null,
          refusalReason: projectData.refusalReason || null,
          
          // Metadata
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Create the project
        const project = new Project(transformedProject);
        await project.save();
        
        importedCount++;
        
        if (importedCount % 10 === 0) {
          console.log(`📈 Imported ${importedCount} projects...`);
        }
        
      } catch (error) {
        console.error(`❌ Error importing project ${projectData.projectNumber}:`, error.message);
        skippedCount++;
      }
    }
    
    console.log('\n✅ Import completed!');
    console.log(`📊 Statistics:`);
    console.log(`   - Total projects in JSON: ${projectsData.length}`);
    console.log(`   - Successfully imported: ${importedCount}`);
    console.log(`   - Skipped (errors): ${skippedCount}`);
    
    // 4. Verify the import
    const totalProjects = await Project.countDocuments({});
    console.log(`   - Total projects in database: ${totalProjects}`);
    
    // 5. Show some sample projects
    const sampleProjects = await Project.find({}).limit(3).select('projectNumber nomProjet region projectStatus');
    console.log('\n📋 Sample imported projects:');
    sampleProjects.forEach(project => {
      console.log(`   - ${project.projectNumber}: ${project.nomProjet || 'Sans nom'} (${project.region}) - ${project.projectStatus}`);
    });
    
  } catch (error) {
    console.error('❌ Error during import:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}
