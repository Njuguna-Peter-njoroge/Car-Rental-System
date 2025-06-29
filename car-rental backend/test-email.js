const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

async function testEmail() {
  console.log('Testing email configuration...');
  
  // Check environment variables
  console.log('Environment variables:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
  console.log('SMTP_PORT:', process.env.SMTP_PORT || 'NOT SET');
  console.log('SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET');
  console.log('SMTP_FROM:', process.env.SMTP_FROM || 'NOT SET');
  
  // Try to create transporter
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    
    console.log('Transporter created successfully');
    
    // Test connection
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    
    // Try to send test email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'test@example.com',
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email',
      html: '<p>This is a test email</p>',
    });
    
    console.log('Test email sent successfully:', info.messageId);
    
  } catch (error) {
    console.error('Email test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testEmail(); 