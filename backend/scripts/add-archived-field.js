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

// Add archived field to existing projects
const addArchivedField = async () => {
  try {
    console.log('🔧 Adding archived field to existing projects...')
    
    // Update all projects that don't have the archived field
    const result = await Project.updateMany(
      { archived: { $exists: false } },
      { $set: { archived: false } }
    )
    
    console.log(`✅ Updated ${result.modifiedCount} projects with archived: false`)
    
    // Show current status
    const totalProjects = await Project.countDocuments()
    const archivedProjects = await Project.countDocuments({ archived: true })
    const activeProjects = await Project.countDocuments({ archived: false })
    
    console.log(`📊 Project Status:`)
    console.log(`   Total: ${totalProjects}`)
    console.log(`   Active: ${activeProjects}`)
    console.log(`   Archived: ${archivedProjects}`)
    
  } catch (error) {
    console.error('❌ Error adding archived field:', error)
  }
}

// Run the update
const run = async () => {
  await connectDB()
  await addArchivedField()
  await mongoose.disconnect()
  console.log('👋 Disconnected from MongoDB')
  process.exit(0)
}

run()
