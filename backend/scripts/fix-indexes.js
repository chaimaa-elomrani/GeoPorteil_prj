const mongoose = require('mongoose')

async function fixIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/geoporteil')
    console.log('✅ Connected to MongoDB')

    const db = mongoose.connection.db
    const collection = db.collection('projects')

    // List all indexes
    const indexes = await collection.indexes()
    console.log('📋 Current indexes:')
    indexes.forEach(index => {
      console.log('  -', JSON.stringify(index.key), index.name)
    })

    // Drop the problematic projectNumber index
    try {
      await collection.dropIndex('projectNumber_1')
      console.log('🗑️ Dropped projectNumber_1 index')
    } catch (error) {
      console.log('⚠️ projectNumber_1 index not found or already dropped')
    }

    // Drop all indexes except _id
    try {
      await collection.dropIndexes()
      console.log('🗑️ Dropped all indexes except _id')
    } catch (error) {
      console.log('⚠️ Error dropping indexes:', error.message)
    }

    console.log('✅ Index cleanup completed')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('👋 Disconnected from MongoDB')
  }
}

fixIndexes()
