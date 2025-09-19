const fetch = require('node-fetch');

async function testGmailPasswordReset() {
  try {
    console.log('📧 Testing Gmail Password Reset for vamsikiran198@gmail.com...\n');
    
    // Test forgot password with Gmail
    console.log('1. Sending forgot password request...');
    const response = await fetch('http://localhost:3000/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'vamsikiran198@gmail.com' })
    });
    
    const data = await response.json();
    console.log('\n📨 Server Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.status === 'success') {
      console.log('\n✅ SUCCESS! Real email sent to your Gmail account!');
      console.log('📧 Check your Gmail inbox for the password reset email');
      console.log('📱 Also check your spam folder if you don\'t see it');
      
      console.log('\n📋 Next Steps:');
      console.log('1. Open your Gmail inbox');
      console.log('2. Look for email from "CareerForge AI"');
      console.log('3. Click the "Reset Password" button in the email');
      console.log('4. Enter your new password');
      
    } else {
      console.log('\n❌ Failed to send email:', data.message);
      console.log('\n🔧 Possible issues:');
      console.log('- Gmail App Password not configured correctly');
      console.log('- 2-Factor Authentication not enabled');
      console.log('- Backend server not running');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n🔧 Make sure:');
    console.log('- Backend server is running (npm start)');
    console.log('- Gmail App Password is configured in .env file');
  }
}

console.log('🚨 Before running this test:');
console.log('1. Set up Gmail App Password (see GMAIL_SETUP.md)');
console.log('2. Update EMAIL_APP_PASSWORD in .env file');
console.log('3. Restart the backend server');
console.log('4. Then run this test\n');

testGmailPasswordReset();