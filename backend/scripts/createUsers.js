const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

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

// Create users
const createUsers = async () => {
  try {
    await connectDB();
    
    console.log('👥 Creating users...\n');
    
    // Delete existing users
    await User.deleteMany({});
    console.log('🗑️ Deleted existing users');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123456', 10);
    const adminUser = new User({
      prenom: 'Admin',
      nom: 'System',
      email: 'admin@geoporteil.com',
      password: adminPassword,
      role: 'admin',
      status: 'active',
      isActive: true,
      phone: '+212 6 12 34 56 78',
      address: 'Casablanca, Morocco',
      dateOfBirth: new Date('1980-01-01'),
      profilePicture: null,
      emailVerified: true,
      emailVerificationToken: null,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      lastLogin: new Date(),
      loginAttempts: 0,
      lockUntil: null
    });
    
    await adminUser.save();
    console.log('✅ Created admin user:');
    console.log(`   - Email: ${adminUser.email}`);
    console.log(`   - Password: admin123456`);
    console.log(`   - Role: ${adminUser.role}`);
    
    // Create regular user
    const userPassword = await bcrypt.hash('user123456', 10);
    const regularUser = new User({
      prenom: 'John',
      nom: 'Doe',
      email: 'user@geoporteil.com',
      password: userPassword,
      role: 'client',
      status: 'active',
      isActive: true,
      phone: '+212 6 87 65 43 21',
      address: 'Rabat, Morocco',
      dateOfBirth: new Date('1990-05-15'),
      profilePicture: null,
      emailVerified: true,
      emailVerificationToken: null,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      lastLogin: new Date(),
      loginAttempts: 0,
      lockUntil: null
    });
    
    await regularUser.save();
    console.log('✅ Created regular user:');
    console.log(`   - Email: ${regularUser.email}`);
    console.log(`   - Password: user123456`);
    console.log(`   - Role: ${regularUser.role}`);
    
    // Create pending signup request
    const pendingPassword = await bcrypt.hash('pending123456', 10);
    const pendingUser = new User({
      prenom: 'Jane',
      nom: 'Smith',
      email: 'jane.smith@example.com',
      password: pendingPassword,
      role: 'client',
      status: 'pending',
      isActive: false,
      phone: '+212 6 11 22 33 44',
      address: 'Marrakech, Morocco',
      dateOfBirth: new Date('1985-08-20'),
      profilePicture: null,
      emailVerified: false,
      emailVerificationToken: null,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      lastLogin: null,
      loginAttempts: 0,
      lockUntil: null
    });
    
    await pendingUser.save();
    console.log('✅ Created pending signup request:');
    console.log(`   - Email: ${pendingUser.email}`);
    console.log(`   - Status: ${pendingUser.status}`);
    
    // Create suspended user
    const suspendedPassword = await bcrypt.hash('suspended123456', 10);
    const suspendedUser = new User({
      prenom: 'Bob',
      nom: 'Wilson',
      email: 'bob.wilson@example.com',
      password: suspendedPassword,
      role: 'client',
      status: 'suspended',
      isActive: false,
      phone: '+212 6 55 66 77 88',
      address: 'Fes, Morocco',
      dateOfBirth: new Date('1975-12-10'),
      profilePicture: null,
      emailVerified: true,
      emailVerificationToken: null,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      lastLogin: new Date('2023-11-01'),
      loginAttempts: 0,
      lockUntil: null,
      suspendedAt: new Date(),
      suspensionReason: 'Violation of terms of service'
    });
    
    await suspendedUser.save();
    console.log('✅ Created suspended user:');
    console.log(`   - Email: ${suspendedUser.email}`);
    console.log(`   - Status: ${suspendedUser.status}`);
    
    console.log('\n🎉 All users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: admin@geoporteil.com / admin123456');
    console.log('   User:  user@geoporteil.com / user123456');
    
  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run the script
if (require.main === module) {
  createUsers();
}

module.exports = { createUsers };
