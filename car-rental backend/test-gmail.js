const nodemailer = require('nodemailer');

async function testGmailConnection() {
  console.log('Testing Gmail SMTP connection...');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'njugunahpeternjoroge@gmail.com',
      pass: 'eduaabfwhzwotvvh'
    }
  });

  try {
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('✅ Gmail connection verified successfully!');
    
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: 'njugunahpeternjoroge@gmail.com',
      to: 'njugunahpeternjoroge@gmail.com',
      subject: 'Test Email from Car Rental App',
      text: 'This is a test email from your car rental application.',
      html: '<p>This is a test email from your car rental application.</p>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Gmail test failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check if your Gmail app password is correct');
      console.log('2. Make sure 2-Step Verification is enabled');
      console.log('3. Generate a new app password at: https://myaccount.google.com/apppasswords');
    } else if (error.message.includes('timeout')) {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check your internet connection');
      console.log('2. Try again in a few minutes');
      console.log('3. Gmail might be temporarily blocking the connection');
    }
  }
}

testGmailConnection(); 