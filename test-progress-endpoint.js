const axios = require('axios');

// Test the progress history endpoint
async function testProgressEndpoint() {
  try {
    console.log('🧪 Testing progress history endpoint...');
    
    // You'll need to replace these with actual values:
    const goalId = 'your-goal-id-here';
    const authToken = 'your-auth-token-here';
    
    const response = await axios.get(`http://localhost:3000/api/v1/career/goals/${goalId}/progress-history`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success! Response:', response.data);
    console.log('📊 History length:', response.data.data.history.length);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

// Uncomment and run this when you have the server running and valid credentials
// testProgressEndpoint();

console.log('📝 To test:');
console.log('1. Start the backend server: npm run dev');
console.log('2. Get a valid goal ID and auth token from the browser');
console.log('3. Update the goalId and authToken variables above');
console.log('4. Uncomment the testProgressEndpoint() call');
console.log('5. Run: node test-progress-endpoint.js');