const bcrypt = require('bcryptjs'); // Changed from 'bcrypt' to 'bcryptjs'

async function createUserWithHashedPassword(userData) {
  const { email, password, role = 'user', ...otherData } = userData;
  
  try {
    // Generate salt and hash the password
    const saltRounds = 12; // Higher number = more secure but slower
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const newUser = {
      email,
      password: hashedPassword,
      role,
      ...otherData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('User created with hashed password:', {
      ...newUser,
      password: '[HIDDEN]' // Don't log the actual hash
    });
    
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Example usage
async function createExampleUser() {
  const userData = {
    email: 'user@example.com',
    password: 'user@example.com!',
    role: 'admin',
    firstName: 'John',
    lastName: 'Doe'
  };
  
  const user = await createUserWithHashedPassword(userData);
  return user;
}

// Add this to run the function when script is executed directly
if (require.main === module) {
  createExampleUser()
    .then(user => {
      console.log('Successfully created user:', user);
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to create user:', error);
      process.exit(1);
    });
}

module.exports = { createUserWithHashedPassword, createExampleUser };
