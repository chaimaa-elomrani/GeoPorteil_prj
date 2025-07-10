console.log('Current directory:', process.cwd());
console.log('Looking for .env file...');

const fs = require('fs');
const path = require('path');

// Check if .env exists
const envPath = path.join(process.cwd(), '.env');
console.log('Checking path:', envPath);
console.log('.env exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  console.log('.env content:');
  console.log(fs.readFileSync(envPath, 'utf8'));
}

// Try to load dotenv
try {
  const dotenv = require('dotenv');
  console.log('dotenv loaded successfully');
  
  const result = dotenv.config();
  console.log('dotenv config result:', result);
  
  console.log('\nAfter loading dotenv:');
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS:', process.env.SMTP_PASS);
  console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
} catch (error) {
  console.error('Error loading dotenv:', error.message);
  console.log('You need to install dotenv: npm install dotenv');
}