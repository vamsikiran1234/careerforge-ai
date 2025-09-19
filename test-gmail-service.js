require('dotenv').config();
const emailService = require('./src/services/emailService');

async function testGmailService() {
  console.log('🧪 Testing Gmail email service...');
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Email Service: ${process.env.EMAIL_SERVICE}`);
  console.log(`Email User: ${process.env.EMAIL_USER}`);
  console.log(`App Password Length: ${process.env.EMAIL_APP_PASSWORD?.length || 'undefined'}`);
  
  try {
    const result = await emailService.testEmailService();
    console.log('\n✅ Gmail test successful!');
    console.log('Result:', result);
  } catch (error) {
    console.error('\n❌ Gmail test failed!');
    console.error('Error:', error.message);
    console.error('Details:', error);
  }
}

testGmailService();