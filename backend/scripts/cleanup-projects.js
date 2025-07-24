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

// Clean up duplicate or problematic project numbers
const cleanupProjects = async () => {
  try {
    console.log('🧹 Starting project cleanup...')
    
    // Find all projects
    const projects = await Project.find({})
    console.log(`📊 Found ${projects.length} projects`)
    
    // Check for projects with old structure (direct projectNumber field)
    const oldStructureProjects = projects.filter(p => p.projectNumber && !p.projectInfo)
    console.log(`🔄 Found ${oldStructureProjects.length} projects with old structure`)
    
    // Check for projects with new structure
    const newStructureProjects = projects.filter(p => p.projectInfo && p.projectInfo.projectNumber)
    console.log(`✅ Found ${newStructureProjects.length} projects with new structure`)
    
    // List all project numbers to check for duplicates
    const allProjectNumbers = []
    
    projects.forEach(project => {
      if (project.projectInfo && project.projectInfo.projectNumber) {
        allProjectNumbers.push(project.projectInfo.projectNumber)
      } else if (project.projectNumber) {
        allProjectNumbers.push(project.projectNumber)
      }
    })
    
    console.log('📋 All project numbers:', allProjectNumbers)
    
    // Find duplicates
    const duplicates = allProjectNumbers.filter((item, index) => allProjectNumbers.indexOf(item) !== index)
    if (duplicates.length > 0) {
      console.log('⚠️ Duplicate project numbers found:', duplicates)
    } else {
      console.log('✅ No duplicate project numbers found')
    }
    
    // Remove all projects to start fresh
    console.log('🗑️ Removing all projects...')
    const deleteResult = await Project.deleteMany({})
    console.log(`✅ Removed ${deleteResult.deletedCount} projects`)
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  }
}

// Run the cleanup
const run = async () => {
  await connectDB()
  await cleanupProjects()
  await mongoose.disconnect()
  console.log('👋 Disconnected from MongoDB')
  process.exit(0)
}

run()
