const axios = require('axios');

const testForgotPassword = async () => {
  try {
    console.log('🧪 Testing Forgot Password with Resend...\n');
    
    const response = await axios.post('http://localhost:3000/api/v1/auth/forgot-password', {
      email: 'vamsikiran198@gmail.com'
    });
    
    console.log('✅ Success Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error Response:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Full Error:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.status === 500) {
      console.log('\n🔍 Check backend logs for detailed error');
    }
  }
};

testForgotPassword();
