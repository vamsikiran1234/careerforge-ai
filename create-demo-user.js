const fetch = require('node-fetch');

async function createTestUser() {
  try {
    console.log('🔧 Creating test user for login...\n');
    
    const testUser = {
      name: 'Demo User',
      email: 'demo@careerforge.ai',
      password: 'DemoPassword123!'
    };
    
    // Register test user
    const response = await fetch('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      console.log('✅ Test user created successfully!');
      console.log(`📧 Email: ${testUser.email}`);
      console.log(`🔒 Password: ${testUser.password}`);
      console.log('\n🎯 You can now login with these credentials on the frontend!');
    } else if (data.message && data.message.includes('already exists')) {
      console.log('✅ Test user already exists!');
      console.log(`📧 Email: ${testUser.email}`);
      console.log(`🔒 Password: ${testUser.password}`);
      console.log('\n🎯 You can login with these credentials on the frontend!');
    } else {
      console.log('❌ Failed to create test user:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestUser();