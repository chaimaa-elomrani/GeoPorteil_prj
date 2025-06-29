const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');
require('dotenv').config();

async function createTestUser() {
  try {
    // Connect to database
    await connectDB();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: 'user@example.com' });
    if (existingUser) {
      console.log('✅ User already exists:', existingUser.email);
      console.log('User details:', {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role
      });
      return existingUser;
    }
    
    // Create new user with correct schema fields
    const userData = {
      name: 'johndoe', // Required and unique field
      email: 'user@example.com',
      password: 'user@example.com!', // Will be hashed by pre-save hook
      role: 'admin'
    };
    
    console.log('Creating user with data:', { ...userData, password: '[HIDDEN]' });
    
    const user = new User(userData);
    await user.save();
    
    console.log('✅ Test user created successfully:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    });
    
    return user;
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
    if (error.code === 11000) {
      console.error('Duplicate key error - user with this name or email already exists');
    }
  } finally {
    mongoose.connection.close();
  }
}

if (require.main === module) {
  createTestUser();
}

module.exports = { createTestUser };