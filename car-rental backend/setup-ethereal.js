const nodemailer = require('nodemailer');

async function createEtherealAccount() {
  try {
    // Create a test account on Ethereal
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('Ethereal Email Test Account Created:');
    console.log('=====================================');
    console.log('SMTP_HOST=smtp.ethereal.email');
    console.log('SMTP_PORT=587');
    console.log('SMTP_SECURE=false');
    console.log(`SMTP_USER=${testAccount.user}`);
    console.log(`SMTP_PASS=${testAccount.pass}`);
    console.log('SMTP_FROM=noreply@example.com');
    console.log('=====================================');
    console.log('');
    console.log('Copy these values to your .env file');
    console.log('You can view sent emails at: https://ethereal.email');
    
  } catch (error) {
    console.error('Failed to create Ethereal account:', error.message);
  }
}

createEtherealAccount(); 