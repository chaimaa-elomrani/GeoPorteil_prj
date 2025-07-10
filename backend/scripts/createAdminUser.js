const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@geoporteil.com' });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      nom: 'Admin',
      prenom: 'System',
      email: 'admin@geoporteil.com',
      password: 'admin123456', // This will be hashed automatically by the pre-save hook
      role: 'admin',
      phone: '+212600000000',
      status: 'active'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@geoporteil.com');
    console.log('🔑 Password: admin123456');
    console.log('👤 Role: admin');

    // Also create a test client user
    const existingClient = await User.findOne({ email: 'client@geoporteil.com' });
    if (!existingClient) {
      const clientUser = new User({
        nom: 'Client',
        prenom: 'Test',
        email: 'client@geoporteil.com',
        password: 'client123456',
        role: 'client',
        phone: '+212600000001',
        status: 'active'
      });

      await clientUser.save();
      console.log('✅ Test client user created successfully!');
      console.log('📧 Email: client@geoporteil.com');
      console.log('🔑 Password: client123456');
      console.log('👤 Role: client');
    }

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
createAdminUser();
