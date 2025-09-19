const fetch = require('node-fetch');

async function testForgotPasswordAPI() {
  try {
    console.log('🔐 Testing Forgot Password API...\n');
    
    // Test the API endpoint directly
    const response = await fetch('http://localhost:3000/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@careerforge.ai' })
    });
    
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (data.status === 'success') {
      console.log('✅ Forgot password API working!');
      if (data.data?.previewUrl) {
        console.log(`📧 Email preview: ${data.data.previewUrl}`);
      }
    } else {
      console.log('❌ API failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testForgotPasswordAPI();