// Test Complete Authentication Flow
const axios = require('axios');

const baseUrl = 'http://localhost:3000/api/v1';
const email = 'vamsikiran198@gmail.com';
const password = 'Vamsi$93525';
const name = 'Vamsi Kiran';

async function testAuthFlow() {
  console.log('\n🚀 CareerForge AI - Complete Authentication Flow Test');
  console.log('========================================================\n');

  let token;
  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Server Health
  console.log('📋 Test 1: Server Health Check');
  try {
    const health = await axios.get('http://localhost:3000/health');
    if (health.data.status === 'success') {
      console.log('✅ Server is running');
      console.log(`   Environment: ${health.data.environment}\n`);
      testsPassed++;
    }
  } catch (error) {
    console.log('❌ Server is not running');
    console.log('   Please run: npm run dev\n');
    testsFailed++;
    return;
  }

  // Test 2: User Registration
  console.log('📋 Test 2: User Registration (with STUDENT+ADMIN roles)');
  console.log(`   Email: ${email}`);
  try {
    const register = await axios.post(`${baseUrl}/auth/register`, {
      name,
      email,
      password
    });

    if (register.data.status === 'success') {
      const roles = register.data.data.user.roles;
      const hasStudent = roles.includes('STUDENT');
      const hasAdmin = roles.includes('ADMIN');

      if (hasStudent && hasAdmin) {
        console.log('✅ User registered with STUDENT+ADMIN roles');
        console.log(`   Roles: ${roles.join(', ')}\n`);
        testsPassed++;
      } else {
        console.log('❌ User registered but missing ADMIN role');
        console.log(`   Roles: ${roles.join(', ')}\n`);
        testsFailed++;
      }
    }
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log('⚠️  User already exists - will test login instead\n');
    } else {
      console.log('❌ Registration failed');
      console.log(`   ${error.response?.data?.message || error.message}\n`);
      testsFailed++;
    }
  }

  // Test 3: User Login
  console.log('📋 Test 3: User Login');
  console.log(`   Email: ${email}`);
  try {
    const login = await axios.post(`${baseUrl}/auth/login`, {
      email,
      password
    });

    if (login.data.status === 'success') {
      token = login.data.data.token;
      const user = login.data.data.user;
      const roles = user.roles;
      const hasStudent = roles.includes('STUDENT');
      const hasAdmin = roles.includes('ADMIN');

      if (hasStudent && hasAdmin) {
        console.log('✅ Login successful with STUDENT+ADMIN roles');
        console.log(`   User: ${user.name}`);
        console.log(`   Roles: ${roles.join(', ')}\n`);
        testsPassed++;
      } else {
        console.log('⚠️  Login successful but user only has STUDENT role');
        console.log('   This means the user was created before the role fix.');
        console.log('   SOLUTION: Delete user and re-register to get ADMIN role.\n');
        testsFailed++;
      }

      console.log(`   Token (first 50 chars): ${token.substring(0, 50)}...\n`);
    }
  } catch (error) {
    console.log('❌ Login failed');
    console.log(`   ${error.response?.data?.message || error.message}\n`);
    testsFailed++;
    return;
  }

  // Test 4: Get User Profile
  console.log('📋 Test 4: Get User Profile');
  console.log('   Endpoint: GET /api/v1/users/profile');
  console.log('   Authorization: Bearer Token');
  try {
    const profile = await axios.get(`${baseUrl}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (profile.data.status === 'success') {
      const data = profile.data.data;
      console.log('✅ Profile access successful\n');
      console.log('   📋 User Profile Details:');
      console.log(`      ID: ${data.id}`);
      console.log(`      Name: ${data.name}`);
      console.log(`      Email: ${data.email}`);
      console.log(`      Roles: ${data.roles.join(', ')}`);
      console.log(`      Email Verified: ${data.emailVerified}`);
      console.log(`      Created: ${data.createdAt}\n`);

      const hasStudent = data.roles.includes('STUDENT');
      const hasAdmin = data.roles.includes('ADMIN');

      if (hasStudent && hasAdmin) {
        console.log('   ✅ User has BOTH STUDENT and ADMIN roles!\n');
        testsPassed++;
      } else {
        console.log('   ⚠️  User only has STUDENT role (missing ADMIN)');
        console.log('   💡 To fix: Delete this user and register again\n');
        testsFailed++;
      }
    }
  } catch (error) {
    console.log('❌ Profile access failed');
    console.log(`   ${error.response?.data?.message || error.message}\n`);
    testsFailed++;
  }

  // Test Summary
  console.log('========================================================');
  console.log('📊 Test Summary');
  console.log('========================================================\n');
  console.log(`   ✅ Tests Passed: ${testsPassed}`);
  console.log(`   ❌ Tests Failed: ${testsFailed}\n`);

  if (testsFailed === 0) {
    console.log('🎉 All tests passed! Your authentication flow is working!\n');
    console.log('📝 Token for Postman:');
    console.log(token);
    console.log('\n💡 Next Steps:');
    console.log('   1. Copy the token above');
    console.log('   2. Open Postman → Environments');
    console.log('   3. Save it in the "token" variable');
    console.log('   4. Test other endpoints with this token\n');
  } else {
    console.log('⚠️  Some tests failed. Review the errors above.\n');
  }

  console.log('========================================================\n');
}

testAuthFlow().catch(error => {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
});
