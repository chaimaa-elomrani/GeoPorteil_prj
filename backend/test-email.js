require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Testing email configuration...');
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS length:', process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 'undefined');
  
  // Check if environment variables are loaded
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ Environment variables not loaded!');
    console.log('Current working directory:', process.cwd());
    console.log('Looking for .env file...');
    return;
  }
  
  // Fix: use createTransport (not createTransporter)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    debug: true,
    logger: true
  });

  try {
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('✅ Connection successful!');
    
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // send to yourself
      subject: 'Test Email',
      text: 'This is a test email'
    });
    
    console.log('✅ Email sent:', info.messageId);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEmail();