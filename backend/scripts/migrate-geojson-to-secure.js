const mongoose = require('mongoose')
const path = require('path')
const SecureGeoService = require('../services/secureGeoService')
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

// Migrate GeoJSON data to secure storage
const migrateGeoData = async () => {
  try {
    console.log('🔄 Starting GeoJSON data migration to secure storage...')

    // Find the DERB MOULAY CHERIF project
    const project = await Project.findOne({
      'projectInfo.projectNumber': '216'
    })

    if (!project) {
      console.log('❌ DERB MOULAY CHERIF project not found')
      return
    }

    console.log(`📋 Found project: ${project.projectInfo.secteur} (#${project.projectInfo.projectNumber})`)

    // Path to the public GeoJSON file
    const publicFilePath = path.join(__dirname, '../../frontend/public/project1.geojson')
    console.log(`📁 Source file: ${publicFilePath}`)

    // Import the file to secure storage
    const result = await SecureGeoService.importFromFile(publicFilePath, project._id, {
      securityLevel: 'confidential',
      allowedRoles: ['admin', 'manager', 'surveyor'],
      userId: null, // System migration
      removeOriginal: false // Keep original for now
    })

    if (result.success) {
      console.log('✅ Successfully migrated GeoJSON data to secure storage')
      console.log(`📊 Secure data ID: ${result.id}`)
      
      // Test retrieval
      console.log('🔍 Testing data retrieval...')
      const testResult = await SecureGeoService.getGeoData(project._id, null, 'admin', {
        includeMetadata: true,
        logAccess: false
      })

      if (testResult.success) {
        console.log('✅ Data retrieval test successful')
        console.log(`📈 Features count: ${testResult.metadata.totalFeatures}`)
        console.log(`🔒 Security level: ${testResult.metadata.securityLevel}`)
        console.log(`📅 Last modified: ${testResult.metadata.lastModified}`)
      } else {
        console.log('❌ Data retrieval test failed:', testResult.message)
      }

    } else {
      console.log('❌ Migration failed:', result.message)
    }

  } catch (error) {
    console.error('❌ Error during migration:', error)
  }
}

// Show security status
const showSecurityStatus = async () => {
  try {
    console.log('\n🔒 Security Status Report:')
    console.log('=' .repeat(50))

    // Find all projects with secure geo data
    const SecureGeoData = require('../models/SecureGeoData')
    const secureData = await SecureGeoData.find({})
      .populate('projectId', 'projectInfo.projectNumber projectInfo.secteur')

    if (secureData.length === 0) {
      console.log('📭 No secure geo data found')
      return
    }

    secureData.forEach(data => {
      console.log(`\n📊 Project: ${data.projectId.projectInfo.secteur} (#${data.projectId.projectInfo.projectNumber})`)
      console.log(`   🔒 Security Level: ${data.securityLevel}`)
      console.log(`   📈 Features: ${data.metadata.totalFeatures}`)
      console.log(`   📅 Created: ${data.createdAt}`)
      console.log(`   👥 Allowed Roles: ${data.accessControl.allowedRoles.join(', ')}`)
      console.log(`   📝 Audit Entries: ${data.auditLog.length}`)
    })

  } catch (error) {
    console.error('❌ Error showing security status:', error)
  }
}

// Main execution
const run = async () => {
  await connectDB()
  
  console.log('🚀 GeoJSON Security Migration Tool')
  console.log('=' .repeat(50))
  
  // Show current status
  await showSecurityStatus()
  
  // Perform migration
  await migrateGeoData()
  
  // Show updated status
  await showSecurityStatus()
  
  await mongoose.disconnect()
  console.log('\n👋 Disconnected from MongoDB')
  process.exit(0)
}

// Handle command line arguments
const args = process.argv.slice(2)
if (args.includes('--status-only')) {
  // Only show status, don't migrate
  const statusOnly = async () => {
    await connectDB()
    await showSecurityStatus()
    await mongoose.disconnect()
    process.exit(0)
  }
  statusOnly()
} else {
  run()
}
