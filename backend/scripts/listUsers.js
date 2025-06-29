const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');
require('dotenv').config();

async function listUsers() {
  try {
    await connectDB();
    
    const users = await User.find({});
    console.log('📋 Users in database:', users.length);
    
    users.forEach(user => {
      console.log('👤 User:', {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      });
    });
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
    }
    
  } catch (error) {
    console.error('❌ Error listing users:', error);
  } finally {
    mongoose.connection.close();
  }
}

async function deleteUserByEmail(email) {
  try {
    await connectDB();
    const result = await User.deleteOne({ email });
    console.log(`🗑️ Deleted user with email ${email}:`, result);
  } catch (error) {
    console.error('❌ Error deleting user:', error);
  } finally {
    mongoose.connection.close();
  }
}

if (require.main === module) {
  const action = process.argv[2];
  if (action === 'delete') {
    const email = process.argv[3];
    if (email) {
      deleteUserByEmail(email);
    } else {
      console.log('Usage: node scripts/listUsers.js delete <email>');
    }
  } else {
    listUsers();
  }
}

module.exports = { listUsers, deleteUserByEmail };