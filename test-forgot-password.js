const fetch = require('node-fetch');

async function testForgotPasswordFlow() {
  console.log('🔐 Testing Complete Forgot Password Flow...\n');
  
  try {
    // Step 1: Create a test user for password reset
    console.log('1. Creating test user...');
    const testUser = {
      name: 'Password Reset Test',
      email: 'passwordtest@careerforge.ai',
      password: 'OldPassword123!'
    };
    
    const registerResponse = await fetch('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const registerData = await registerResponse.json();
    
    if (registerData.status === 'success') {
      console.log('✅ Test user created successfully');
    } else if (registerData.message && registerData.message.includes('already exists')) {
      console.log('✅ Test user already exists');
    } else {
      console.log('❌ Failed to create test user:', registerData.message);
      return;
    }

    // Step 2: Test forgot password request
    console.log('\n2. Testing forgot password request...');
    const forgotResponse = await fetch('http://localhost:3000/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email })
    });
    
    const forgotData = await forgotResponse.json();
    console.log('Forgot Password Response:', JSON.stringify(forgotData, null, 2));
    
    if (forgotData.status === 'success') {
      console.log('✅ Forgot password email sent successfully');
      
      if (forgotData.data?.previewUrl) {
        console.log(`📧 Email preview URL: ${forgotData.data.previewUrl}`);
      }
      
      // Step 3: Simulate getting the reset token (in real app, user would get this from email)
      console.log('\n3. Getting reset token from database...');
      
      // We'll need to query the database to get the reset token
      const { prisma } = require('./src/config/database');
      
      const userWithToken = await prisma.user.findUnique({
        where: { email: testUser.email },
        select: { resetPasswordToken: true, resetPasswordExpires: true }
      });
      
      if (userWithToken?.resetPasswordToken) {
        const resetToken = userWithToken.resetPasswordToken;
        console.log('✅ Reset token found:', resetToken.substring(0, 10) + '...');
        
        // Step 4: Test password reset
        console.log('\n4. Testing password reset...');
        const newPassword = 'NewPassword123!';
        
        const resetResponse = await fetch('http://localhost:3000/api/v1/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: resetToken,
            password: newPassword
          })
        });
        
        const resetData = await resetResponse.json();
        console.log('Reset Password Response:', JSON.stringify(resetData, null, 2));
        
        if (resetData.status === 'success') {
          console.log('✅ Password reset successful');
          
          // Step 5: Test login with new password
          console.log('\n5. Testing login with new password...');
          const loginResponse = await fetch('http://localhost:3000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: testUser.email,
              password: newPassword
            })
          });
          
          const loginData = await loginResponse.json();
          
          if (loginData.status === 'success') {
            console.log('✅ Login with new password successful');
            console.log(`   User: ${loginData.data.user.name}`);
            console.log(`   Token: ${loginData.data.token.substring(0, 20)}...`);
          } else {
            console.log('❌ Login with new password failed:', loginData.message);
          }
          
          // Step 6: Verify old password doesn't work
          console.log('\n6. Verifying old password no longer works...');
          const oldLoginResponse = await fetch('http://localhost:3000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: testUser.email,
              password: testUser.password // old password
            })
          });
          
          const oldLoginData = await oldLoginResponse.json();
          
          if (oldLoginData.status === 'error') {
            console.log('✅ Old password correctly rejected');
          } else {
            console.log('❌ Old password still works - this is a security issue!');
          }
          
        } else {
          console.log('❌ Password reset failed:', resetData.message);
        }
        
      } else {
        console.log('❌ Reset token not found in database');
      }
      
    } else {
      console.log('❌ Forgot password request failed:', forgotData.message);
    }

    console.log('\n🎉 Forgot Password Flow Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Test email service separately
async function testEmailService() {
  console.log('\n📧 Testing Email Service...');
  
  try {
    const emailService = require('./src/services/emailService');
    const result = await emailService.testEmailService();
    console.log('✅ Email service test successful:', result);
  } catch (error) {
    console.error('❌ Email service test failed:', error.message);
  }
}

// Run tests
async function runAllTests() {
  await testEmailService();
  await testForgotPasswordFlow();
}

runAllTests();