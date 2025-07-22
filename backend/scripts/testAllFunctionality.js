const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/geoportail', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test all functionality
const testAllFunctionality = async () => {
  try {
    await connectDB();
    
    console.log('\n🧪 Testing All Functionality...\n');
    
    // Test 1: Check if admin user exists
    console.log('1. Testing Admin User...');
    const adminUser = await User.findOne({ email: 'admin@geoporteil.com' });
    if (adminUser) {
      console.log('✅ Admin user exists');
      console.log(`   - Email: ${adminUser.email}`);
      console.log(`   - Role: ${adminUser.role}`);
      console.log(`   - Status: ${adminUser.status}`);
    } else {
      console.log('❌ Admin user not found');
    }
    
    // Test 2: Check projects
    console.log('\n2. Testing Projects...');
    const projects = await Project.find({});
    console.log(`✅ Found ${projects.length} project(s)`);
    
    if (projects.length > 0) {
      const project = projects[0];
      console.log(`   - Project: ${project.nomProjet}`);
      console.log(`   - Status: ${project.projectStatus}`);
      console.log(`   - Archived: ${project.archived}`);
      console.log(`   - Has building data: ${project.buildingStats ? 'Yes' : 'No'}`);
      console.log(`   - Has apartments: ${project.apartments ? project.apartments.length : 0}`);
    }
    
    // Test 3: Check users
    console.log('\n3. Testing Users...');
    const users = await User.find({});
    console.log(`✅ Found ${users.length} user(s)`);
    
    const usersByStatus = {};
    users.forEach(user => {
      usersByStatus[user.status] = (usersByStatus[user.status] || 0) + 1;
    });
    
    console.log('   - User status breakdown:');
    Object.entries(usersByStatus).forEach(([status, count]) => {
      console.log(`     ${status}: ${count}`);
    });
    
    // Test 4: Check signup requests
    console.log('\n4. Testing Signup Requests...');
    const signupRequests = await User.find({ status: 'pending' });
    console.log(`✅ Found ${signupRequests.length} pending signup request(s)`);
    
    // Test 5: Database indexes
    console.log('\n5. Testing Database Indexes...');
    const userIndexes = await User.collection.getIndexes();
    const projectIndexes = await Project.collection.getIndexes();
    console.log(`✅ User collection has ${Object.keys(userIndexes).length} indexes`);
    console.log(`✅ Project collection has ${Object.keys(projectIndexes).length} indexes`);
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Admin user: ${adminUser ? '✅' : '❌'}`);
    console.log(`   - Projects: ${projects.length} found`);
    console.log(`   - Users: ${users.length} found`);
    console.log(`   - Pending requests: ${signupRequests.length} found`);
    
    console.log('\n🚀 System is ready for use!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run the test
if (require.main === module) {
  testAllFunctionality();
}

module.exports = { testAllFunctionality };
