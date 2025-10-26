// Simple script to check if backend is running
const http = require('http');

console.log('🔍 Checking if backend server is running...');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Backend server is running!');
      console.log('📊 Response:', JSON.parse(data));
      console.log('🎯 You can now use real progress data');
    } else {
      console.log(`❌ Backend responded with status: ${res.statusCode}`);
      console.log('📄 Response:', data);
    }
  });
});

req.on('error', (err) => {
  if (err.code === 'ECONNREFUSED') {
    console.log('❌ Backend server is not running');
    console.log('🚀 Start it with: npm run dev');
  } else {
    console.log('❌ Error connecting to backend:', err.message);
  }
});

req.on('timeout', () => {
  console.log('⏰ Request timed out - backend may be slow or not responding');
  req.destroy();
});

req.end();