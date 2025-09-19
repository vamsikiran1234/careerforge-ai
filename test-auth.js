const fetch = require('node-fetch');

async function testAuth() {
  try {
    console.log('🔍 Testing Authentication System...\n');
    
    // Test registration
    console.log('1. Testing Registration...');
    const regResponse = await fetch('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!'
      })
    });
    
    const regData = await regResponse.json();
    console.log('Registration Response:', JSON.stringify(regData, null, 2));
    
    // Test login
    console.log('\n2. Testing Login...');
    const loginResponse = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123!'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login Response:', JSON.stringify(loginData, null, 2));
    
    if (loginData.status === 'success' && loginData.data?.token) {
      console.log('\n3. Testing Token Validation...');
      const token = loginData.data.token;
      
      const meResponse = await fetch('http://localhost:3000/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const meData = await meResponse.json();
      console.log('Token Validation Response:', JSON.stringify(meData, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAuth();