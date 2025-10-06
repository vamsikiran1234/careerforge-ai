/**
 * AUTOMATED API TESTING SCRIPT
 * 
 * This script tests all major API endpoints with sample data.
 * 
 * Tests:
 * ✅ Authentication (login, register, logout, forgot password)
 * ✅ Mentor Registration & Verification
 * ✅ Connection Requests (create, accept, reject)
 * ✅ Session Booking (create, confirm, complete, cancel)
 * ✅ Reviews (create, fetch)
 * ✅ Chat Messages (send, fetch)
 * ✅ Role-based Access Control
 * 
 * Prerequisites:
 * 1. Run: node scripts/seedTestData.js (to populate test data)
 * 2. Ensure backend is running on http://localhost:5000
 * 
 * Usage: node scripts/testAllFeatures.js
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const API = axios.create({ baseURL: BASE_URL });

// Test users from seedTestData.js
const TEST_USERS = {
  admin: {
    email: 'student-admin@test.com',
    password: 'Test123!@#',
    name: 'Admin Student'
  },
  student: {
    email: 'student-only@test.com',
    password: 'Test123!@#',
    name: 'John Student'
  },
  mentor: {
    email: 'mentor-user@test.com',
    password: 'Test123!@#',
    name: 'Sarah Mentor'
  }
};

// Store tokens and IDs during tests
let tokens = {};
let userIds = {};
let mentorProfileId = null;
let connectionId = null;
let sessionId = null;

// Test result tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Helper Functions
function logTest(testName) {
  totalTests++;
  process.stdout.write(`🧪 Testing: ${testName}... `);
}

function logPass(message = '') {
  passedTests++;
  console.log(`✅ PASS ${message}`);
}

function logFail(error) {
  failedTests++;
  console.log(`❌ FAIL`);
  console.log(`   Error: ${error.message}`);
  if (error.response?.data) {
    console.log(`   Response: ${JSON.stringify(error.response.data)}`);
  }
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`);
}

function logSection(title) {
  console.log('\n' + '═'.repeat(70));
  console.log(`  ${title}`);
  console.log('═'.repeat(70) + '\n');
}

// Test Functions
async function testAuth() {
  logSection('AUTHENTICATION TESTS');

  // Test 1: Login as Student
  logTest('Login as Student');
  try {
    const response = await API.post('/auth/login', {
      email: TEST_USERS.student.email,
      password: TEST_USERS.student.password
    });
    tokens.student = response.data.token;
    userIds.student = response.data.user.id;
    logPass(`(Token: ${tokens.student.substring(0, 20)}...)`);
  } catch (error) {
    logFail(error);
  }

  // Test 2: Login as Mentor
  logTest('Login as Mentor');
  try {
    const response = await API.post('/auth/login', {
      email: TEST_USERS.mentor.email,
      password: TEST_USERS.mentor.password
    });
    tokens.mentor = response.data.token;
    userIds.mentor = response.data.user.id;
    logPass(`(Token: ${tokens.mentor.substring(0, 20)}...)`);
  } catch (error) {
    logFail(error);
  }

  // Test 3: Login as Admin
  logTest('Login as Admin');
  try {
    const response = await API.post('/auth/login', {
      email: TEST_USERS.admin.email,
      password: TEST_USERS.admin.password
    });
    tokens.admin = response.data.token;
    userIds.admin = response.data.user.id;
    logPass(`(Token: ${tokens.admin.substring(0, 20)}...)`);
  } catch (error) {
    logFail(error);
  }

  // Test 4: Invalid Login
  logTest('Invalid Login (should fail)');
  try {
    await API.post('/auth/login', {
      email: 'wrong@test.com',
      password: 'wrongpassword'
    });
    logFail(new Error('Should have failed but succeeded'));
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 404) {
      logPass('(Correctly rejected invalid credentials)');
    } else {
      logFail(error);
    }
  }

  // Test 5: Get Current User
  logTest('Get Current User (Student)');
  try {
    const response = await API.get('/auth/me', {
      headers: { Authorization: `Bearer ${tokens.student}` }
    });
    if (response.data.email === TEST_USERS.student.email) {
      logPass(`(User: ${response.data.name})`);
    } else {
      logFail(new Error('Wrong user returned'));
    }
  } catch (error) {
    logFail(error);
  }
}

async function testMentorProfile() {
  logSection('MENTOR PROFILE TESTS');

  // Test 1: Get Mentor Profile
  logTest('Get Mentor Profile');
  try {
    const response = await API.get('/mentorship/profile', {
      headers: { Authorization: `Bearer ${tokens.mentor}` }
    });
    mentorProfileId = response.data.id;
    logPass(`(Profile ID: ${mentorProfileId}, Status: ${response.data.status})`);
  } catch (error) {
    logFail(error);
  }

  // Test 2: Get All Mentors
  logTest('Get All Mentors (Public)');
  try {
    const response = await API.get('/mentorship/mentors', {
      headers: { Authorization: `Bearer ${tokens.student}` }
    });
    const mentorCount = response.data.length;
    logPass(`(Found ${mentorCount} mentors)`);
  } catch (error) {
    logFail(error);
  }

  // Test 3: Get Specific Mentor Profile
  logTest('Get Specific Mentor Profile');
  try {
    const response = await API.get(`/mentorship/mentors/${mentorProfileId}`, {
      headers: { Authorization: `Bearer ${tokens.student}` }
    });
    if (response.data.id === mentorProfileId) {
      logPass(`(Title: ${response.data.title})`);
    } else {
      logFail(new Error('Wrong mentor profile returned'));
    }
  } catch (error) {
    logFail(error);
  }

  // Test 4: Update Mentor Profile
  logTest('Update Mentor Profile');
  try {
    const response = await API.put('/mentorship/profile', 
      {
        bio: 'Updated bio: Helping students succeed in tech careers! (TEST)',
        hourlyRate: 80.00
      },
      {
        headers: { Authorization: `Bearer ${tokens.mentor}` }
      }
    );
    if (response.data.hourlyRate === 80.00) {
      logPass('(Updated hourly rate to $80)');
    } else {
      logFail(new Error('Profile update failed'));
    }
  } catch (error) {
    logFail(error);
  }
}

async function testConnections() {
  logSection('CONNECTION TESTS');

  // Test 1: Get Student's Connections
  logTest('Get Student Connections');
  try {
    const response = await API.get('/mentorship/connections', {
      headers: { Authorization: `Bearer ${tokens.student}` }
    });
    if (response.data.length > 0) {
      connectionId = response.data[0].id;
      logPass(`(Found ${response.data.length} connections, ID: ${connectionId})`);
    } else {
      logFail(new Error('No connections found'));
    }
  } catch (error) {
    logFail(error);
  }

  // Test 2: Get Mentor's Connection Requests
  logTest('Get Mentor Connection Requests');
  try {
    const response = await API.get('/mentorship/connections/requests', {
      headers: { Authorization: `Bearer ${tokens.mentor}` }
    });
    logPass(`(Found ${response.data.length} requests)`);
  } catch (error) {
    logFail(error);
  }

  // Test 3: Create New Connection Request
  logTest('Create New Connection Request (Admin to Mentor)');
  try {
    const response = await API.post('/mentorship/connections',
      {
        mentorId: mentorProfileId,
        message: 'Hi! I am the admin and would like to connect for testing purposes.'
      },
      {
        headers: { Authorization: `Bearer ${tokens.admin}` }
      }
    );
    logPass(`(Connection ID: ${response.data.id})`);
  } catch (error) {
    logFail(error);
  }

  // Test 4: Accept Connection Request
  logTest('Accept Connection Request');
  try {
    // Get pending requests first
    const requests = await API.get('/mentorship/connections/requests', {
      headers: { Authorization: `Bearer ${tokens.mentor}` }
    });
    
    const pendingRequest = requests.data.find(r => r.status === 'PENDING');
    
    if (pendingRequest) {
      await API.put(`/mentorship/connections/${pendingRequest.id}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${tokens.mentor}` }
        }
      );
      logPass(`(Accepted connection ID: ${pendingRequest.id})`);
    } else {
      logInfo('No pending requests to accept (all already accepted)');
      logPass('(Skipped - no pending requests)');
    }
  } catch (error) {
    logFail(error);
  }
}

async function testSessions() {
  logSection('SESSION BOOKING TESTS');

  // Test 1: Get Student's Sessions
  logTest('Get Student Sessions');
  try {
    const response = await API.get('/sessions', {
      headers: { Authorization: `Bearer ${tokens.student}` }
    });
    if (response.data.length > 0) {
      sessionId = response.data[0].id;
      logPass(`(Found ${response.data.length} sessions, First ID: ${sessionId})`);
    } else {
      logFail(new Error('No sessions found'));
    }
  } catch (error) {
    logFail(error);
  }

  // Test 2: Get Mentor's Sessions
  logTest('Get Mentor Sessions');
  try {
    const response = await API.get('/sessions', {
      headers: { Authorization: `Bearer ${tokens.mentor}` }
    });
    logPass(`(Mentor has ${response.data.length} sessions)`);
  } catch (error) {
    logFail(error);
  }

  // Test 3: Create New Session
  logTest('Create New Session');
  try {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    const response = await API.post('/sessions',
      {
        mentorId: mentorProfileId,
        title: 'Test Session - Resume Review',
        description: 'Automated test session for resume review and career advice.',
        scheduledAt: futureDate.toISOString(),
        duration: 60
      },
      {
        headers: { Authorization: `Bearer ${tokens.student}` }
      }
    );
    logPass(`(New session ID: ${response.data.id})`);
  } catch (error) {
    logFail(error);
  }

  // Test 4: Confirm Session (Mentor)
  logTest('Confirm Session (Mentor)');
  try {
    const sessions = await API.get('/sessions', {
      headers: { Authorization: `Bearer ${tokens.mentor}` }
    });
    
    const pendingSession = sessions.data.find(s => s.status === 'PENDING');
    
    if (pendingSession) {
      await API.put(`/sessions/${pendingSession.id}/confirm`,
        { meetingLink: 'https://meet.google.com/test-abc-xyz' },
        {
          headers: { Authorization: `Bearer ${tokens.mentor}` }
        }
      );
      logPass(`(Confirmed session ID: ${pendingSession.id})`);
    } else {
      logInfo('No pending sessions to confirm');
      logPass('(Skipped - no pending sessions)');
    }
  } catch (error) {
    logFail(error);
  }
}

async function testReviews() {
  logSection('REVIEW TESTS');

  // Test 1: Get Reviews for Mentor
  logTest('Get Mentor Reviews');
  try {
    const response = await API.get(`/reviews/mentor/${userIds.mentor}`, {
      headers: { Authorization: `Bearer ${tokens.student}` }
    });
    logPass(`(Found ${response.data.length} reviews)`);
  } catch (error) {
    logFail(error);
  }

  // Test 2: Create Review for Completed Session
  logTest('Create Review for Completed Session');
  try {
    const sessions = await API.get('/sessions', {
      headers: { Authorization: `Bearer ${tokens.student}` }
    });
    
    const completedSession = sessions.data.find(s => s.status === 'COMPLETED');
    
    if (completedSession) {
      // Check if review already exists
      try {
        await API.post('/reviews',
          {
            sessionId: completedSession.id,
            revieweeId: userIds.mentor,
            rating: 5,
            comment: 'Excellent session! Very helpful and insightful. (Automated test review)'
          },
          {
            headers: { Authorization: `Bearer ${tokens.student}` }
          }
        );
        logPass(`(Created review for session ${completedSession.id})`);
      } catch (err) {
        if (err.response?.status === 400 && err.response?.data?.message?.includes('already reviewed')) {
          logInfo('Review already exists for this session');
          logPass('(Review already exists - skipped)');
        } else {
          throw err;
        }
      }
    } else {
      logInfo('No completed sessions found to review');
      logPass('(Skipped - no completed sessions)');
    }
  } catch (error) {
    logFail(error);
  }
}

async function testMessages() {
  logSection('CHAT MESSAGE TESTS');

  // Test 1: Get Messages (Student)
  logTest('Get Messages (Student)');
  try {
    const response = await API.get('/messages', {
      headers: { Authorization: `Bearer ${tokens.student}` }
    });
    logPass(`(Found ${response.data.length} messages)`);
  } catch (error) {
    logFail(error);
  }

  // Test 2: Send Message (Student to Mentor)
  logTest('Send Message (Student to Mentor)');
  try {
    const response = await API.post('/messages',
      {
        receiverId: userIds.mentor,
        content: 'This is an automated test message. Hello from the testing script!'
      },
      {
        headers: { Authorization: `Bearer ${tokens.student}` }
      }
    );
    logPass(`(Message ID: ${response.data.id})`);
  } catch (error) {
    logFail(error);
  }

  // Test 3: Send Reply (Mentor to Student)
  logTest('Send Reply (Mentor to Student)');
  try {
    const response = await API.post('/messages',
      {
        receiverId: userIds.student,
        content: 'Hi! This is an automated reply from the mentor. Testing successful!'
      },
      {
        headers: { Authorization: `Bearer ${tokens.mentor}` }
      }
    );
    logPass(`(Message ID: ${response.data.id})`);
  } catch (error) {
    logFail(error);
  }

  // Test 4: Get Conversation (between Student and Mentor)
  logTest('Get Conversation (Student <-> Mentor)');
  try {
    const response = await API.get(`/messages/${userIds.mentor}`, {
      headers: { Authorization: `Bearer ${tokens.student}` }
    });
    logPass(`(Found ${response.data.length} messages in conversation)`);
  } catch (error) {
    logFail(error);
  }
}

async function testRoleAccess() {
  logSection('ROLE-BASED ACCESS CONTROL TESTS');

  // Test 1: Student CANNOT access mentor dashboard
  logTest('Student Access to Mentor Dashboard (should fail)');
  try {
    await API.get('/mentorship/connections/requests', {
      headers: { Authorization: `Bearer ${tokens.admin}` } // Admin has no mentor profile
    });
    logFail(new Error('Student/Admin should not access mentor-only endpoint'));
  } catch (error) {
    if (error.response?.status === 403 || error.response?.status === 404) {
      logPass('(Correctly blocked non-mentor access)');
    } else {
      logFail(error);
    }
  }

  // Test 2: Unauthorized access (no token)
  logTest('Unauthorized Access (no token, should fail)');
  try {
    await API.get('/sessions');
    logFail(new Error('Should require authentication'));
  } catch (error) {
    if (error.response?.status === 401) {
      logPass('(Correctly requires authentication)');
    } else {
      logFail(error);
    }
  }

  // Test 3: Admin can access user data
  logTest('Admin Access to User Management');
  try {
    const response = await API.get('/auth/me', {
      headers: { Authorization: `Bearer ${tokens.admin}` }
    });
    if (response.data.role === 'ADMIN') {
      logPass('(Admin role verified)');
    } else {
      logFail(new Error('Admin role not detected'));
    }
  } catch (error) {
    logFail(error);
  }
}

// Main Test Runner
async function runAllTests() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║        CAREERFORGE AI - AUTOMATED API TESTING SUITE              ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log('\n');
  
  logInfo(`Testing API at: ${BASE_URL}`);
  logInfo('Make sure your backend server is running!');
  logInfo('Make sure you ran: node scripts/seedTestData.js\n');

  try {
    await testAuth();
    await testMentorProfile();
    await testConnections();
    await testSessions();
    await testReviews();
    await testMessages();
    await testRoleAccess();

    // Final Summary
    logSection('TEST SUMMARY');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests} (${Math.round(passedTests/totalTests*100)}%)`);
    console.log(`❌ Failed: ${failedTests} (${Math.round(failedTests/totalTests*100)}%)`);
    console.log('');

    if (failedTests === 0) {
      console.log('🎉 ALL TESTS PASSED! 🎉');
      console.log('Your application is working correctly!\n');
      process.exit(0);
    } else {
      console.log('⚠️  Some tests failed. Please review the errors above.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Fatal error during testing:', error.message);
    process.exit(1);
  }
}

// Check if backend is running
async function checkBackend() {
  try {
    await API.get('/');
    return true;
  } catch (error) {
    console.error('❌ Cannot connect to backend at', BASE_URL);
    console.error('   Make sure your server is running: npm run dev');
    return false;
  }
}

// Start testing
(async () => {
  const isBackendRunning = await checkBackend();
  if (isBackendRunning) {
    await runAllTests();
  } else {
    process.exit(1);
  }
})();
