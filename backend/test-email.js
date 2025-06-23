require('dotenv').config();
const emailService = require('./services/emailService');

async function testEmail() {
  try {
    await emailService.sendAdminNotificationEmail('test@example.com', 'test123');
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Email failed:', error);
  }
}

testEmail();