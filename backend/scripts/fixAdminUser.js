const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function fixAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find and update the admin user
    const adminUser = await User.findOne({ email: 'admin@geoporteil.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('🔧 Fixing admin user...');

    // Update the user with all required fields
    adminUser.status = 'active';
    adminUser.password = 'admin123456'; // This will trigger the pre-save hook to hash it
    adminUser.nom = adminUser.nom || 'Admin';
    adminUser.prenom = adminUser.prenom || 'System';
    adminUser.phone = adminUser.phone || '+212600000000';

    await adminUser.save();
    
    console.log('✅ Admin user updated successfully!');
    console.log('- Status changed to: active');
    console.log('- Password reset to: admin123456');

    // Test the password again
    const isValidPassword = await adminUser.comparePassword('admin123456');
    console.log('🔑 Password test:', isValidPassword ? '✅ VALID' : '❌ STILL INVALID');

    // Also fix the other admin user if needed
    const otherAdmin = await User.findOne({ email: 'chaimaelomrani6@gmail.com' });
    if (otherAdmin && otherAdmin.status !== 'active') {
      otherAdmin.status = 'active';
      await otherAdmin.save();
      console.log('✅ Also activated chaimaelomrani6@gmail.com');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📤 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
fixAdminUser();
