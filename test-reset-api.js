require('dotenv').config();
const axios = require('axios');

async function testResetPasswordAPI() {
  console.log('🧪 Testing Reset Password API...\n');

  const token = 'db876db4ad6e91ddd8f1435817a8c9d78e90c204c752700b94ef5238791b6b7d';
  const password = 'Vamsi$93525';

  try {
    console.log('Request details:');
    console.log('URL:', 'http://localhost:3000/api/v1/auth/reset-password');
    console.log('Token:', token.substring(0, 20) + '...');
    console.log('Password:', password);

    const response = await axios.post('http://localhost:3000/api/v1/auth/reset-password', {
      token: token,
      password: password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Success!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);

  } catch (error) {
    console.log('\n❌ Error occurred:');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Error Response:', error.response?.data);
    
    if (error.response?.data?.data?.errors) {
      console.log('\nValidation Errors:');
      error.response.data.data.errors.forEach(err => {
        console.log(`  - ${err.field}: ${err.message}`);
      });
    }
  }
}

testResetPasswordAPI();