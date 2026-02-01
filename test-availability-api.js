/**
 * Test Script for Mentor Availability System
 * 
 * Run this script to verify the availability API is working correctly
 * 
 * Usage:
 *   node test-availability-api.js
 * 
 * Prerequisites:
 *   - Backend server running on localhost:3000
 *   - Valid mentor user account
 *   - JWT token from login
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1';

// Replace with actual mentor JWT token after login
const MENTOR_TOKEN = 'YOUR_MENTOR_JWT_TOKEN_HERE';
const MENTOR_ID = 'YOUR_MENTOR_ID_HERE'; // From mentor profile

const headers = {
  'Authorization': `Bearer ${MENTOR_TOKEN}`,
  'Content-Type': 'application/json'
};

// Test data
const sampleAvailability = [
  {
    dayOfWeek: 1, // Monday
    startTime: '09:00',
    endTime: '12:00'
  },
  {
    dayOfWeek: 1, // Monday afternoon
    startTime: '14:00',
    endTime: '17:00'
  },
  {
    dayOfWeek: 3, // Wednesday
    startTime: '10:00',
    endTime: '16:00'
  },
  {
    dayOfWeek: 5, // Friday
    startTime: '09:00',
    endTime: '15:00'
  }
];

async function testSetAvailability() {
  console.log('\n🔵 Test 1: Set Mentor Availability');
  console.log('━'.repeat(50));
  
  try {
    const response = await axios.post(
      `${API_URL}/sessions/availability`,
      {
        availability: sampleAvailability,
        timezone: 'America/New_York'
      },
      { headers }
    );
    
    console.log('✅ SUCCESS');
    console.log('Status:', response.status);
    console.log('Message:', response.data.message);
    console.log('Slots created:', response.data.data.availability.length);
    console.log('Timezone:', response.data.data.timezone);
    return response.data;
  } catch (error) {
    console.log('❌ FAILED');
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetMyAvailability() {
  console.log('\n🔵 Test 2: Get My Availability');
  console.log('━'.repeat(50));
  
  try {
    const response = await axios.get(
      `${API_URL}/sessions/my-availability`,
      { headers }
    );
    
    console.log('✅ SUCCESS');
    console.log('Status:', response.status);
    console.log('Slots found:', response.data.data.availability.length);
    console.log('Availability:', JSON.stringify(response.data.data.availability, null, 2));
    return response.data;
  } catch (error) {
    console.log('❌ FAILED');
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetPublicAvailability() {
  console.log('\n🔵 Test 3: Get Public Availability (No Auth Required)');
  console.log('━'.repeat(50));
  
  try {
    const response = await axios.get(
      `${API_URL}/sessions/availability/${MENTOR_ID}`
    );
    
    console.log('✅ SUCCESS');
    console.log('Status:', response.status);
    console.log('Mentor:', response.data.data.mentor.user.name);
    console.log('Weekly schedule slots:', response.data.data.weeklySchedule.length);
    console.log('Available slots (next 30 days):', response.data.data.availableSlots.length);
    console.log('\nSample available slots:');
    console.log(response.data.data.availableSlots.slice(0, 5));
    return response.data;
  } catch (error) {
    console.log('❌ FAILED');
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

async function testUpdateSlot(slotId) {
  console.log('\n🔵 Test 4: Update Availability Slot');
  console.log('━'.repeat(50));
  
  try {
    const response = await axios.put(
      `${API_URL}/sessions/availability/${slotId}`,
      {
        startTime: '10:00',
        endTime: '13:00'
      },
      { headers }
    );
    
    console.log('✅ SUCCESS');
    console.log('Status:', response.status);
    console.log('Updated slot:', response.data.data);
    return response.data;
  } catch (error) {
    console.log('❌ FAILED');
    console.error('Error:', error.response?.data || error.message);
  }
}

async function testValidation() {
  console.log('\n🔵 Test 5: Validation Tests');
  console.log('━'.repeat(50));
  
  // Test invalid day of week
  console.log('\n📝 Testing invalid day of week (should fail)...');
  try {
    await axios.post(
      `${API_URL}/sessions/availability`,
      {
        availability: [{ dayOfWeek: 7, startTime: '09:00', endTime: '17:00' }],
        timezone: 'UTC'
      },
      { headers }
    );
    console.log('❌ Validation failed - should have rejected invalid day');
  } catch (error) {
    console.log('✅ Correctly rejected:', error.response?.data.message);
  }
  
  // Test invalid time format
  console.log('\n📝 Testing invalid time format (should fail)...');
  try {
    await axios.post(
      `${API_URL}/sessions/availability`,
      {
        availability: [{ dayOfWeek: 1, startTime: '25:00', endTime: '17:00' }],
        timezone: 'UTC'
      },
      { headers }
    );
    console.log('❌ Validation failed - should have rejected invalid time');
  } catch (error) {
    console.log('✅ Correctly rejected:', error.response?.data.message);
  }
  
  // Test end time before start time
  console.log('\n📝 Testing end before start (should fail)...');
  try {
    await axios.post(
      `${API_URL}/sessions/availability`,
      {
        availability: [{ dayOfWeek: 1, startTime: '17:00', endTime: '09:00' }],
        timezone: 'UTC'
      },
      { headers }
    );
    console.log('❌ Validation failed - should have rejected invalid range');
  } catch (error) {
    console.log('✅ Correctly rejected:', error.response?.data.message);
  }
}

async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║   MENTOR AVAILABILITY API TEST SUITE              ║');
  console.log('╚════════════════════════════════════════════════════╝');
  
  if (MENTOR_TOKEN === 'YOUR_MENTOR_JWT_TOKEN_HERE') {
    console.log('\n❌ ERROR: Please update MENTOR_TOKEN and MENTOR_ID at the top of this file');
    console.log('\n📝 Steps to get token:');
    console.log('   1. Login as mentor via /api/v1/auth/login');
    console.log('   2. Copy the JWT token from response');
    console.log('   3. Replace MENTOR_TOKEN in this file');
    console.log('   4. Get mentor ID from /api/v1/mentor/profile');
    console.log('   5. Replace MENTOR_ID in this file\n');
    return;
  }
  
  try {
    // Test 1: Set availability
    const setResult = await testSetAvailability();
    const firstSlotId = setResult.data.availability[0]?.id;
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test 2: Get own availability
    await testGetMyAvailability();
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test 3: Get public availability
    await testGetPublicAvailability();
    
    // Test 4: Update slot (if we have an ID)
    if (firstSlotId) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await testUpdateSlot(firstSlotId);
    }
    
    // Test 5: Validation
    await testValidation();
    
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║   ✅ ALL TESTS COMPLETED                          ║');
    console.log('╚════════════════════════════════════════════════════╝\n');
    
  } catch (error) {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║   ❌ TEST SUITE FAILED                            ║');
    console.log('╚════════════════════════════════════════════════════╝\n');
    console.error('Fatal error:', error.message);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testSetAvailability,
  testGetMyAvailability,
  testGetPublicAvailability,
  testUpdateSlot,
  testValidation
};
