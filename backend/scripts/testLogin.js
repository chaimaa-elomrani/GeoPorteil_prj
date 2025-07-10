const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function testLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the admin user
    const adminUser = await User.findOne({ email: 'admin@geoporteil.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Admin user found:');
    console.log('- ID:', adminUser._id);
    console.log('- Email:', adminUser.email);
    console.log('- Role:', adminUser.role);
    console.log('- Status:', adminUser.status);
    console.log('- Has password:', !!adminUser.password);
    console.log('- Password length:', adminUser.password ? adminUser.password.length : 0);

    // Test password comparison
    const testPassword = 'admin123456';
    const isValidPassword = await adminUser.comparePassword(testPassword);
    console.log('🔑 Password test with "admin123456":', isValidPassword ? '✅ VALID' : '❌ INVALID');

    // Test with wrong password
    const wrongPassword = 'wrongpassword';
    const isWrongPassword = await adminUser.comparePassword(wrongPassword);
    console.log('🔑 Password test with "wrongpassword":', isWrongPassword ? '❌ SHOULD BE INVALID' : '✅ CORRECTLY INVALID');

    // List all users
    const allUsers = await User.find({}).select('email role status');
    console.log('\n📋 All users in database:');
    allUsers.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Status: ${user.status}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📤 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
testLogin();
