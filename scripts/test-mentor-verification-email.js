/**
 * Test Script: Mentor Verification Email
 * 
 * This script tests the new mentor verification email service.
 * It will attempt to send a test verification email.
 * 
 * Usage: node scripts/test-mentor-verification-email.js
 */

require('dotenv').config();
const emailService = require('../src/services/emailService');

async function testMentorVerificationEmail() {
  console.log('\n🧪 Testing Mentor Verification Email Service\n');
  console.log('=' .repeat(60));

  // Test configuration
  const testEmail = process.env.TEST_EMAIL || 'vamsikiran198@gmail.com';
  const testToken = 'test-verification-token-' + Date.now();
  const testUserName = 'Test User';

  console.log('\n📧 Test Configuration:');
  console.log(`   Recipient: ${testEmail}`);
  console.log(`   User Name: ${testUserName}`);
  console.log(`   Token: ${testToken}`);
  console.log(`   Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);

  console.log('\n🔄 Sending test email...\n');

  try {
    const result = await emailService.sendMentorVerificationEmail(
      testEmail,
      testToken,
      testUserName
    );

    console.log('\n✅ SUCCESS! Email sent successfully!');
    console.log('=' .repeat(60));
    console.log('\n📊 Email Details:');
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   Verification URL: ${result.verificationUrl}`);
    console.log(`   Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);

    console.log('\n📬 Check your email inbox:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Subject: "Verify Your Mentor Profile - CareerForge AI"`);
    console.log(`   Look for: Professional HTML email with blue button`);

    console.log('\n🔗 Manual Verification Link (for testing):');
    console.log(`   ${result.verificationUrl}`);

    console.log('\n✅ Test completed successfully!');
    console.log('=' .repeat(60));
    
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERROR! Email sending failed!');
    console.error('=' .repeat(60));
    console.error('\n💥 Error Details:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);

    console.log('\n🔍 Troubleshooting Tips:');
    console.log('   1. Check EMAIL_USER in .env file');
    console.log('   2. Check EMAIL_APP_PASSWORD in .env file');
    console.log('   3. Verify Gmail SMTP is enabled');
    console.log('   4. Check internet connection');
    console.log('   5. Verify Gmail app password is correct (16 characters)');

    console.log('\n📧 Email Configuration:');
    console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
    console.log(`   EMAIL_APP_PASSWORD: ${process.env.EMAIL_APP_PASSWORD ? '***' + process.env.EMAIL_APP_PASSWORD.slice(-4) : 'NOT SET'}`);
    console.log(`   EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || 'gmail (default)'}`);

    console.log('\n❌ Test failed!');
    console.log('=' .repeat(60));
    
    process.exit(1);
  }
}

// Run the test
console.log('\n🚀 Starting mentor verification email test...');
testMentorVerificationEmail();
