// Debug script to decode and verify JWT token
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Get token from command line argument or use a test token
const token = process.argv[2];

if (!token) {
  console.log('❌ No token provided');
  console.log('');
  console.log('📝 Usage:');
  console.log('   node debug-token.js YOUR_TOKEN_HERE');
  console.log('');
  console.log('💡 To get your token:');
  console.log('   1. Open Postman');
  console.log('   2. Click Environments (left sidebar)');
  console.log('   3. Select your environment');
  console.log('   4. Copy the "token" value');
  console.log('   5. Run: node debug-token.js PASTE_TOKEN_HERE');
  process.exit(1);
}

console.log('🔍 Token Debug Information');
console.log('═══════════════════════════════════════════════════════');
console.log('');

// Basic token info
console.log('📊 Token Stats:');
console.log('  - Length:', token.length, 'characters');
console.log('  - Starts with:', token.substring(0, 20) + '...');
console.log('  - Parts:', token.split('.').length, '(should be 3)');
console.log('');

// Check JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.log('❌ JWT_SECRET not found in .env file!');
  console.log('');
  console.log('📝 Action: Add JWT_SECRET to your .env file');
  process.exit(1);
}

console.log('✅ JWT_SECRET found in .env');
console.log('');

// Try to decode without verification (to see payload)
try {
  const decoded = jwt.decode(token);
  
  if (!decoded) {
    console.log('❌ Token cannot be decoded - invalid format');
    console.log('');
    console.log('📝 The token might be corrupted or truncated');
    process.exit(1);
  }
  
  console.log('📦 Token Payload (decoded):');
  console.log('  - User ID:', decoded.userId);
  console.log('  - Email:', decoded.email);
  console.log('  - Roles:', decoded.roles ? decoded.roles.join(', ') : 'None');
  console.log('  - Issued At:', new Date(decoded.iat * 1000).toLocaleString());
  console.log('  - Expires At:', new Date(decoded.exp * 1000).toLocaleString());
  console.log('');
  
  // Check if expired
  const now = Math.floor(Date.now() / 1000);
  const isExpired = decoded.exp < now;
  
  if (isExpired) {
    const expiredMinutesAgo = Math.floor((now - decoded.exp) / 60);
    console.log('❌ Token is EXPIRED');
    console.log('  - Expired:', expiredMinutesAgo, 'minutes ago');
    console.log('');
    console.log('📝 Action: Login again to get a new token');
    console.log('   POST http://localhost:3000/api/v1/auth/login');
  } else {
    const minutesRemaining = Math.floor((decoded.exp - now) / 60);
    const hoursRemaining = Math.floor(minutesRemaining / 60);
    const daysRemaining = Math.floor(hoursRemaining / 24);
    
    console.log('✅ Token is NOT expired');
    if (daysRemaining > 0) {
      console.log('  - Time remaining:', daysRemaining, 'days');
    } else if (hoursRemaining > 0) {
      console.log('  - Time remaining:', hoursRemaining, 'hours');
    } else {
      console.log('  - Time remaining:', minutesRemaining, 'minutes');
    }
  }
  console.log('');
  
  // Try to verify with JWT_SECRET
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token signature is VALID');
    console.log('');
    console.log('📝 This token should work for authenticated requests!');
    console.log('');
    console.log('🔗 Test it:');
    console.log('   curl -H "Authorization: Bearer ' + token.substring(0, 30) + '..." http://localhost:3000/api/v1/users/profile');
  } catch (verifyError) {
    console.log('❌ Token signature verification FAILED');
    console.log('  - Error:', verifyError.message);
    console.log('');
    if (verifyError.message.includes('invalid signature')) {
      console.log('📝 Cause: JWT_SECRET in .env does not match the secret used to create this token');
      console.log('');
      console.log('🔧 Solutions:');
      console.log('   1. Make sure JWT_SECRET in .env is correct');
      console.log('   2. OR login again to get a new token with current JWT_SECRET');
    } else if (verifyError.message.includes('expired')) {
      console.log('📝 Cause: Token has expired');
      console.log('');
      console.log('🔧 Solution: Login again to get a new token');
    }
  }
  
} catch (error) {
  console.log('❌ Error decoding token:', error.message);
  console.log('');
  console.log('📝 The token format is invalid');
}

console.log('');
console.log('═══════════════════════════════════════════════════════');
