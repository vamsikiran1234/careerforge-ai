# Automated Testing Guide

## Overview

This guide explains how to use the automated testing scripts to verify that all features of the CareerForge AI mentorship platform are working correctly.

## Prerequisites

1. **Backend Running**: Make sure your backend server is running
   ```bash
   cd c:\Users\vamsi\careerforge-ai
   npm run dev
   ```

2. **Dependencies Installed**: Ensure all packages are installed
   ```bash
   npm install
   ```

3. **Database**: PostgreSQL or SQLite database should be set up with Prisma

---

## Testing Scripts

### 1. `seedTestData.js` - Database Seed Script

**Purpose**: Populates your database with sample test data for testing purposes.

**What it creates**:
- 3 test users with different roles
- 1 verified mentor profile
- 1 accepted connection
- 2 sample sessions (1 confirmed, 1 completed)
- 1 review (5 stars)
- 5 chat messages

**Usage**:
```bash
cd c:\Users\vamsi\careerforge-ai
node scripts/seedTestData.js
```

**Expected Output**:
```
🌱 Starting database seeding with test data...

🧹 Cleaning up existing test data...
✅ Cleanup complete

👤 Creating User 1: Student + Admin...
✅ Created: student-admin@test.com (ID: xxx, Role: ADMIN)

👤 Creating User 2: Student...
✅ Created: student-only@test.com (ID: xxx, Role: STUDENT)

👤 Creating User 3: Verified Mentor...
✅ Created: mentor-user@test.com (ID: xxx, Role: STUDENT with ACTIVE mentor profile)

🔗 Creating connection between mentor and student...
✅ Connection created: John Student → Sarah Mentor (Status: ACCEPTED)

📅 Creating sample sessions...
✅ Created 2 sessions (1 confirmed, 1 completed)

⭐ Creating sample review...
✅ Review created: 5 stars from John Student

💬 Creating sample chat messages...
✅ Created 5 chat messages

═══════════════════════════════════════════════════════════════
✨ TEST DATA SEEDING COMPLETED SUCCESSFULLY! ✨
═══════════════════════════════════════════════════════════════
```

**Test Users Created**:

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| `student-admin@test.com` | `Test123!@#` | ADMIN | Admin user with student capabilities |
| `student-only@test.com` | `Test123!@#` | STUDENT | Regular student user |
| `mentor-user@test.com` | `Test123!@#` | MENTOR + STUDENT | Verified mentor with active profile |

---

### 2. `testAllFeatures.js` - Automated API Testing

**Purpose**: Automatically tests all major API endpoints to verify functionality.

**What it tests**:
- ✅ Authentication (login, register, logout)
- ✅ Mentor profiles (create, update, fetch)
- ✅ Connections (create, accept, reject, list)
- ✅ Sessions (book, confirm, complete, cancel)
- ✅ Reviews (create, fetch)
- ✅ Chat messages (send, receive, conversation history)
- ✅ Role-based access control

**Usage**:
```bash
cd c:\Users\vamsi\careerforge-ai
node scripts/testAllFeatures.js
```

**Expected Output**:
```
╔═══════════════════════════════════════════════════════════════════╗
║        CAREERFORGE AI - AUTOMATED API TESTING SUITE              ║
╚═══════════════════════════════════════════════════════════════════╝

ℹ️  Testing API at: http://localhost:5000
ℹ️  Make sure your backend server is running!
ℹ️  Make sure you ran: node scripts/seedTestData.js

═══════════════════════════════════════════════════════════════════
  AUTHENTICATION TESTS
═══════════════════════════════════════════════════════════════════

🧪 Testing: Login as Student... ✅ PASS (Token: eyJhbGciOiJIUzI1NiIsI...)
🧪 Testing: Login as Mentor... ✅ PASS (Token: eyJhbGciOiJIUzI1NiIsI...)
🧪 Testing: Login as Admin... ✅ PASS (Token: eyJhbGciOiJIUzI1NiIsI...)
🧪 Testing: Invalid Login (should fail)... ✅ PASS (Correctly rejected invalid credentials)
🧪 Testing: Get Current User (Student)... ✅ PASS (User: John Student)

═══════════════════════════════════════════════════════════════════
  MENTOR PROFILE TESTS
═══════════════════════════════════════════════════════════════════

🧪 Testing: Get Mentor Profile... ✅ PASS (Profile ID: xxx, Status: ACTIVE)
🧪 Testing: Get All Mentors (Public)... ✅ PASS (Found 1 mentors)
🧪 Testing: Get Specific Mentor Profile... ✅ PASS (Title: Senior Software Engineer...)
🧪 Testing: Update Mentor Profile... ✅ PASS (Updated hourly rate to $80)

[... more tests ...]

═══════════════════════════════════════════════════════════════════
  TEST SUMMARY
═══════════════════════════════════════════════════════════════════
Total Tests: 25
✅ Passed: 25 (100%)
❌ Failed: 0 (0%)

🎉 ALL TESTS PASSED! 🎉
Your application is working correctly!
```

---

## Step-by-Step Testing Workflow

### Step 1: Prepare the Environment

1. **Start Backend Server**:
   ```bash
   cd c:\Users\vamsi\careerforge-ai
   npm run dev
   ```
   
   Wait for:
   ```
   Server is running on port 5000
   ```

2. **Verify Database Connection**:
   - Check that Prisma can connect to your database
   - If using SQLite, ensure `prisma/dev.db` exists
   - If using PostgreSQL, ensure connection string is correct in `.env`

### Step 2: Seed Test Data

Run the seed script:
```bash
node scripts/seedTestData.js
```

**What to check**:
- ✅ All users created successfully
- ✅ Mentor profile is ACTIVE
- ✅ Connection is ACCEPTED
- ✅ Sessions created (1 confirmed, 1 completed)
- ✅ Review created (5 stars)
- ✅ Chat messages created (5 messages)

**If errors occur**:
- Check Prisma schema matches database
- Run `npx prisma generate` to update Prisma Client
- Run `npx prisma migrate dev` if schema changed
- Check database permissions

### Step 3: Run Automated Tests

Run the test suite:
```bash
node scripts/testAllFeatures.js
```

**What to check**:
- ✅ All authentication tests pass
- ✅ Mentor profile tests pass
- ✅ Connection tests pass
- ✅ Session tests pass
- ✅ Review tests pass
- ✅ Message tests pass
- ✅ Access control tests pass

**If tests fail**:
- Read the error message carefully
- Check if backend is running
- Verify test data was seeded
- Check browser console for frontend errors
- Review API routes in your backend code

### Step 4: Manual Browser Testing

1. **Start Frontend**:
   ```bash
   cd c:\Users\vamsi\careerforge-ai\frontend
   npm run dev
   ```

2. **Test as Student** (`student-only@test.com`):
   - Login with `Test123!@#`
   - Browse mentors
   - View "My Connections" (should see Sarah Mentor)
   - Click "Chat" button → should open conversation
   - View "My Sessions" (should see 2 sessions)
   - View completed session → leave a review

3. **Test as Mentor** (`mentor-user@test.com`):
   - Login with `Test123!@#`
   - Click "Mentor Portal"
   - View "Connection Requests"
   - View "My Sessions" (should see same 2 sessions)
   - Confirm pending sessions

4. **Test as Admin** (`student-admin@test.com`):
   - Login with `Test123!@#`
   - Access admin dashboard
   - View all users
   - Manage mentors

---

## Troubleshooting

### Issue: "Cannot connect to backend"

**Solution**:
```bash
# Check if backend is running
cd c:\Users\vamsi\careerforge-ai
npm run dev

# Check if port 5000 is available
netstat -ano | findstr :5000
```

### Issue: "Prisma Client validation failed"

**Solution**:
```bash
# Regenerate Prisma Client
npx prisma generate

# Apply migrations
npx prisma migrate dev

# Reset database if needed (WARNING: deletes all data)
npx prisma migrate reset
```

### Issue: "User already exists"

**Solution**:
```bash
# The seed script automatically cleans up test users
# But if needed, manually delete:
# - Users with email containing '@test.com'
# Or reset entire database:
npx prisma migrate reset
```

### Issue: "429 Too Many Requests"

**Solution**:
- Wait 15 minutes before trying again
- Close other browser tabs
- Clear browser cache
- Check rate limiting middleware in backend

### Issue: "Mentor Portal Access Denied"

**Solution**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for debug logs with emojis (🔍, ✅, ❌)
4. Check `localStorage` for roles:
   ```javascript
   console.log(localStorage.getItem('user'));
   console.log(localStorage.getItem('roles'));
   ```
5. Verify mentor profile status is ACTIVE:
   ```bash
   # In your database tool or Prisma Studio
   npx prisma studio
   # Check MentorProfile → status field
   ```

### Issue: "Book Session button not working"

**Solution**:
1. Check browser console for errors
2. Verify mentorId is a valid UUID (not `[object Object]`)
3. Check network tab for API request/response
4. Ensure mentor profile exists and is ACTIVE

### Issue: "Chat messages not showing"

**Solution**:
1. Verify connection is ACCEPTED (not PENDING)
2. Check if Socket.io is connected:
   ```javascript
   // In browser console
   console.log(window.socket?.connected);
   ```
3. Check backend logs for Socket.io events
4. Verify `/messages/:id` route is working

---

## Expected Test Results

### Authentication Tests (5 tests)
- ✅ Login as Student
- ✅ Login as Mentor
- ✅ Login as Admin
- ✅ Invalid Login (correctly fails)
- ✅ Get Current User

### Mentor Profile Tests (4 tests)
- ✅ Get Mentor Profile
- ✅ Get All Mentors
- ✅ Get Specific Mentor
- ✅ Update Mentor Profile

### Connection Tests (4 tests)
- ✅ Get Student Connections
- ✅ Get Mentor Connection Requests
- ✅ Create Connection Request
- ✅ Accept Connection Request

### Session Tests (4 tests)
- ✅ Get Student Sessions
- ✅ Get Mentor Sessions
- ✅ Create New Session
- ✅ Confirm Session

### Review Tests (2 tests)
- ✅ Get Mentor Reviews
- ✅ Create Review

### Message Tests (4 tests)
- ✅ Get Messages
- ✅ Send Message (Student to Mentor)
- ✅ Send Reply (Mentor to Student)
- ✅ Get Conversation

### Access Control Tests (3 tests)
- ✅ Block non-mentor from mentor endpoints
- ✅ Require authentication for protected routes
- ✅ Admin role verification

**Total**: 25+ tests

---

## Continuous Testing Workflow

### After Making Code Changes

1. **Run automated tests**:
   ```bash
   node scripts/testAllFeatures.js
   ```

2. **Check for failures**:
   - If any test fails, read the error message
   - Fix the issue in your code
   - Re-run tests

3. **Manual browser testing**:
   - Test the specific feature you changed
   - Test related features (regression testing)
   - Test on different browsers if possible

### Before Deploying

1. **Clean seed**:
   ```bash
   node scripts/seedTestData.js
   ```

2. **Full test suite**:
   ```bash
   node scripts/testAllFeatures.js
   ```

3. **Manual testing checklist**:
   - [ ] User registration
   - [ ] User login
   - [ ] Browse mentors
   - [ ] Book a session
   - [ ] Send chat message
   - [ ] Leave a review
   - [ ] Access mentor portal
   - [ ] Accept connection request
   - [ ] Confirm session

4. **Check logs**:
   - No console errors in browser
   - No errors in backend logs
   - All API responses are 200/201 (not 500)

---

## Test Data Reference

### Users

```javascript
// Student + Admin
{
  email: 'student-admin@test.com',
  password: 'Test123!@#',
  name: 'Admin Student',
  role: 'ADMIN'
}

// Student Only
{
  email: 'student-only@test.com',
  password: 'Test123!@#',
  name: 'John Student',
  role: 'STUDENT'
}

// Mentor + Student
{
  email: 'mentor-user@test.com',
  password: 'Test123!@#',
  name: 'Sarah Mentor',
  role: 'STUDENT',
  mentorProfile: {
    status: 'ACTIVE',
    title: 'Senior Software Engineer & Career Coach',
    hourlyRate: 75.00,
    expertise: ['JavaScript', 'React', 'Node.js', 'System Design']
  }
}
```

### Connection

```javascript
{
  student: 'John Student (student-only@test.com)',
  mentor: 'Sarah Mentor (mentor-user@test.com)',
  status: 'ACCEPTED',
  message: 'Hi Sarah! I would love to learn from your experience...'
}
```

### Sessions

```javascript
// Session 1: Confirmed (future)
{
  title: 'Career Planning & Goal Setting',
  duration: 60,
  status: 'CONFIRMED',
  scheduledAt: '2 days from now',
  price: 75.00,
  meetingLink: 'https://meet.google.com/abc-defg-hij'
}

// Session 2: Completed (past)
{
  title: 'Mock Interview - Technical Round',
  duration: 90,
  status: 'COMPLETED',
  scheduledAt: '7 days ago',
  price: 112.50,
  completedAt: '7 days ago'
}
```

### Review

```javascript
{
  session: 'Mock Interview - Technical Round',
  reviewer: 'John Student',
  reviewee: 'Sarah Mentor',
  rating: 5,
  comment: 'Amazing session! Sarah was incredibly helpful...'
}
```

### Chat Messages (5 messages)

```javascript
[
  'Hi Sarah! Thank you for accepting my connection request...',
  'Hi John! I\'m happy to help...',
  'Quick question - should I prepare anything specific...',
  'Great question! It would be helpful if you could think about...',
  'Perfect! I\'ll prepare those. See you soon!'
]
```

---

## Advanced Testing

### Custom Test Data

To create your own test data, modify `scripts/seedTestData.js`:

```javascript
// Add more users
const user4 = await prisma.user.create({
  data: {
    email: 'custom@test.com',
    password: hashedPassword,
    name: 'Custom User',
    role: 'STUDENT',
    isVerified: true
  }
});

// Add more connections
const connection2 = await prisma.connection.create({
  data: {
    studentId: user4.id,
    mentorId: mentorProfile.id,
    status: 'PENDING',
    message: 'Custom connection request'
  }
});
```

### Testing Specific Endpoints

Modify `scripts/testAllFeatures.js` to add custom tests:

```javascript
async function testCustomFeature() {
  logSection('CUSTOM FEATURE TESTS');

  logTest('Your Custom Test');
  try {
    const response = await API.get('/your-endpoint', {
      headers: { Authorization: `Bearer ${tokens.student}` }
    });
    logPass('Custom test passed!');
  } catch (error) {
    logFail(error);
  }
}

// Add to runAllTests()
async function runAllTests() {
  // ... existing tests
  await testCustomFeature(); // Add your custom test
}
```

---

## Summary

### Quick Start Commands

```bash
# 1. Seed test data
node scripts/seedTestData.js

# 2. Run automated tests
node scripts/testAllFeatures.js

# 3. Start frontend
cd frontend
npm run dev

# 4. Login and test manually
# Use: student-only@test.com / Test123!@#
```

### Success Criteria

✅ All automated tests pass (25+ tests)  
✅ No console errors in browser  
✅ No backend errors in terminal  
✅ All features work in manual testing  
✅ All 3 roles (Student, Mentor, Admin) work correctly

---

## Need Help?

1. **Check the logs**: Browser console + backend terminal
2. **Run automated tests**: `node scripts/testAllFeatures.js`
3. **Verify test data**: `node scripts/seedTestData.js`
4. **Check database**: `npx prisma studio`
5. **Review documentation**: `docs/` folder

---

**Last Updated**: 2025-10-05  
**Version**: 1.0.0  
**Author**: CareerForge AI Development Team
