require('dotenv').config();
const emailService = require('./src/services/emailService');

async function testResetUrlGeneration() {
  console.log('🧪 Testing reset URL generation...');
  console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL}`);
  
  // Simulate the same URL generation logic from emailService
  const resetToken = 'test-token-12345';
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  
  console.log(`Generated Reset URL: ${resetUrl}`);
  
  // Test URL components
  const url = new URL(resetUrl);
  console.log(`Protocol: ${url.protocol}`);
  console.log(`Host: ${url.host}`);
  console.log(`Pathname: ${url.pathname}`);
  console.log(`Search params: ${url.search}`);
  console.log(`Token parameter: ${url.searchParams.get('token')}`);
  
  // Test sending an actual email to see the URL
  try {
    const result = await emailService.sendPasswordResetEmail(
      'vamsikiran198@gmail.com',
      resetToken,
      'Test User'
    );
    console.log('\n✅ Test email sent successfully!');
    console.log('Check your Gmail for the reset email.');
  } catch (error) {
    console.error('\n❌ Failed to send test email:', error.message);
  }
}

testResetUrlGeneration();