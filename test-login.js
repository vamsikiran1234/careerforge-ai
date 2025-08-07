const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login API...');
    
    const response = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'vamsikiran198@gmail.com',
      password: 'Password123!'
    });
    
    console.log('Login successful:', response.status, response.data);
  } catch (error) {
    console.error('Login failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Error message:', error.message);
  }
}

testLogin();
