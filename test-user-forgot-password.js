const fetch = require('node-fetch');

async function testForgotPasswordWithUserEmail() {
  try {
    console.log('🔧 Testing Forgot Password for vamsikiran198@gmail.com...\n');
    
    const email = 'vamsikiran198@gmail.com';
    
    // Test forgot password
    console.log(`📧 Sending forgot password request for: ${email}`);
    const response = await fetch('http://localhost:3000/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    console.log('\n📨 Forgot Password Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.status === 'success') {
      console.log('\n✅ SUCCESS! Password reset email sent!');
      
      if (data.data?.previewUrl) {
        console.log(`\n🌐 Email Preview URL (for development): ${data.data.previewUrl}`);
        console.log('   Click this link to see the email that would be sent!');
      }
      
      console.log('\n📋 Next Steps:');
      console.log('1. Check the email preview URL above');
      console.log('2. Copy the reset token from the email');
      console.log('3. Use the reset token to change your password');
      
    } else {
      console.log('\n❌ Failed to send reset email:', data.message);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testForgotPasswordWithUserEmail();