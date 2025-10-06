# 🚀 COMPLETE MENTORSHIP PLATFORM TESTING GUIDE
## Step-by-Step from Fresh Start

---

## 📋 PREREQUISITES

Before starting, ensure:
- [ ] Backend running on `http://localhost:3000`
- [ ] Frontend running on `http://localhost:5173`
- [ ] Database accessible at `prisma/dev.db`
- [ ] All dependencies installed (`npm install` in both root and frontend)

---

## 🗑️ STEP 1: CLEAN UP EXISTING DATA (Start Fresh)

### 1.1 Run Cleanup Script
```bash
cd c:/Users/vamsi/careerforge-ai
node scripts/cleanupMentorData.js
```

**What it does:**
- Deletes ALL existing mentor profiles
- Deletes ALL connections, sessions, reviews
- Deletes ALL mentor-related chat rooms and messages
- Gives you a clean slate

**When prompted:** Type `DELETE ALL` to confirm

**Expected Output:**
```
✅ All mentor data has been deleted successfully!
```

---

## 👤 STEP 2: CREATE AN ADMIN USER

You need an admin account to approve mentors.

### 2.1 Check if you have an admin user

**Open SQLite database:**
```bash
# Using SQLite CLI
sqlite3 prisma/dev.db

# Run this query
SELECT id, email, name, role FROM users WHERE role = 'ADMIN';
```

**OR use this Node script:**
```bash
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.user.findFirst({ where: { role: 'ADMIN' }}).then(user => { console.log('Admin user:', user); process.exit(0); });"
```

### 2.2 If NO admin user exists, create one

**Method 1: Update existing user to admin**
```sql
-- In SQLite CLI (sqlite3 prisma/dev.db)
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

**Method 2: Create new admin user (if you don't have any account)**
```bash
# Register normally through frontend, then update role
# After registering, run:
sqlite3 prisma/dev.db "UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';"
```

**Verify admin creation:**
```sql
SELECT id, email, name, role FROM users WHERE role = 'ADMIN';
```

**Expected Output:**
```
clx123... | admin@example.com | Admin Name | ADMIN
```

---

## 🎓 STEP 3: REGISTER AS A MENTOR

### 3.1 Open Browser
Navigate to: `http://localhost:5173`

### 3.2 Create a Student Account (for testing)
1. Click "Sign Up"
2. Fill in:
   - Name: `Test Student`
   - Email: `student@test.com`
   - Password: `Test123!@#`
3. Click "Create Account"
4. Login with these credentials

### 3.3 Register as Mentor
1. Click "Become a Mentor" in sidebar OR
2. Navigate to: `http://localhost:5173/mentorship/register`

### 3.4 Fill Registration Form

**Step 1: Professional Information**
- Company: `Google`
- Job Title: `Senior Software Engineer`
- Industry: `Technology`
- Years of Experience: `5`

**Step 2: Educational Background**
- College Name: `MIT`
- Degree: `Bachelor of Science`
- Graduation Year: `2018`
- Major: `Computer Science`

**Step 3: Mentorship Details**
- Expertise Areas: Select `Web Development`, `Cloud Architecture`
- Bio: `Experienced software engineer passionate about mentoring...`
- LinkedIn URL: `https://linkedin.com/in/testmentor`
- Available Hours Per Week: `10`
- Preferred Meeting Type: `Video`
- Timezone: `America/New_York`

### 3.5 Submit Registration

**Expected Result:**
- ✅ Success message: "Mentor profile created successfully. Please check your email to verify your account."
- ✅ Console shows verification link (if email not configured)

**⚠️ What to check:**
```javascript
// Open browser console (F12)
// Look for verification link like:
http://localhost:5173/mentorship/verify/abc123...
```

**Copy this verification link!**

---

## ✅ STEP 4: VERIFY EMAIL

### 4.1 Click Verification Link
Paste the verification link from Step 3.5 into browser

### 4.2 Verification Success

**Expected Result:**
- ✅ Green checkmark icon
- ✅ Message: "Email verified successfully! Your profile is pending admin approval."
- ✅ Secondary message: "An admin will review your profile shortly. You'll be notified once approved!"
- ✅ Buttons: "Go to Dashboard", "View My Profile"

**⚠️ Check Database:**
```sql
SELECT id, isVerified, status FROM mentor_profiles ORDER BY createdAt DESC LIMIT 1;
```

**Expected:**
```
isVerified = 1
status = 'PENDING'
```

---

## 🔍 STEP 5: CHECK MENTOR IS NOT YET VISIBLE

### 5.1 Try to Find Mentor (Should Not Appear Yet)
1. Logout from mentor account
2. Login as student (`student@test.com`)
3. Go to "Find Mentors" page: `http://localhost:5173/mentors`

**Expected Result:**
- ❌ Mentor NOT visible in list
- ✅ "No mentors found" message OR empty list
- ✅ This is CORRECT behavior (mentor needs admin approval)

---

## 👑 STEP 6: ADMIN APPROVAL

### 6.1 Login as Admin
1. Logout
2. Login with your ADMIN account (from Step 2)

### 6.2 Access Admin Panel

**⚠️ IMPORTANT: Currently there's NO admin link in sidebar!**

You have two options:

**Option A: Direct URL Access**
```
http://localhost:5173/admin
```

**Option B: Use Approval Script (Recommended)**
```bash
node scripts/approveMentors.js
```

### 6.3 Approve Mentor via Script

```bash
# Run the script
node scripts/approveMentors.js

# You'll see:
📋 Found 1 pending mentor(s):

1. Test Mentor
   Email: student@test.com
   Company: Google
   Job Title: Senior Software Engineer
   Experience: 5 years
   Expertise: Web Development, Cloud Architecture
   College: MIT (2018)
   Verified: ✅
   Status: PENDING
   Mentor ID: clx123...

What would you like to do?
1. Approve ALL pending mentors
2. Approve specific mentor by number
3. Exit

# Choose option 1 or 2
# Type 'yes' to confirm
```

**Expected Result:**
```
✅ Approved 1 mentor(s)
```

**⚠️ Verify in Database:**
```sql
SELECT id, isVerified, status FROM mentor_profiles WHERE id = 'mentor_id_here';
```

**Expected:**
```
isVerified = 1
status = 'ACTIVE'
```

---

## 🔎 STEP 7: VERIFY MENTOR APPEARS IN FIND MENTORS

### 7.1 Login as Student
1. Logout from admin
2. Login as student (`student@test.com`)

### 7.2 Navigate to Find Mentors
Go to: `http://localhost:5173/mentors`

**Expected Result:**
- ✅ Mentor card visible with:
  - Name: Test Mentor
  - Job Title: Senior Software Engineer
  - Company: Google
  - Experience: 5 years
  - Expertise tags
  - Rating: "New" (no reviews yet)
  - Availability status

**⚠️ Check Console (F12):**
- ✅ NO 404 errors
- ✅ NO 403 errors
- ✅ Successful API call to `/mentorship/mentors`

---

## 👁️ STEP 8: VIEW MENTOR PROFILE

### 8.1 Click on Mentor Card
Click the mentor card from Find Mentors page

**Expected Result:**
- ✅ Modal/page opens with full mentor profile
- ✅ All sections display:
  - [ ] Header (name, title, company, verified badge)
  - [ ] Stats cards (rating, sessions, hours per week)
  - [ ] About/Bio section
  - [ ] Expertise areas (tags)
  - [ ] Education info
  - [ ] Links (LinkedIn, Portfolio)
  - [ ] Availability info (timezone, meeting type)
  - [ ] **Reviews section** (shows "No reviews yet")
  - [ ] Action buttons (Close, Request Connection)

**⚠️ Check Console (F12):**
- ✅ **NO 404 error** on `/reviews/mentor/{id}`
- ✅ **NO 404 error** on `/sessions/availability/{id}`
- ✅ Reviews section loads (even if empty)

**If you see 404 errors, the fix didn't work properly!**

---

## 🤝 STEP 9: REQUEST CONNECTION

### 9.1 From Mentor Profile
Click "Request Connection" button

**Expected Result:**
- ✅ Success message/notification
- ✅ Button changes state (disabled or shows "Pending")
- ✅ No errors in console

**⚠️ Verify in Database:**
```sql
SELECT * FROM mentor_connections 
WHERE mentorId = 'mentor_profile_id' 
AND studentId = 'student_user_id'
ORDER BY createdAt DESC LIMIT 1;
```

**Expected:**
```
status = 'PENDING'
createdAt = (current timestamp)
```

---

## 🔔 STEP 10: CHECK MENTOR RECEIVES NOTIFICATION

### 10.1 Login as Mentor
1. Logout
2. Login with mentor account

### 10.2 Check Notifications
Look for notification bell icon (top right)

**Expected Result:**
- ✅ Notification badge with count (1)
- ✅ Click to see notification: "New connection request from Test Student"

**⚠️ Verify in Database:**
```sql
SELECT * FROM notifications 
WHERE userId = 'mentor_user_id' 
AND type = 'CONNECTION_REQUEST'
ORDER BY createdAt DESC LIMIT 1;
```

---

## ✔️ STEP 11: ACCEPT CONNECTION (Mentor Side)

### 11.1 Navigate to Connections
Go to: `http://localhost:5173/connections`

### 11.2 View Pending Requests
Should see pending connection from student

### 11.3 Accept Connection
Click "Accept" button

**Expected Result:**
- ✅ Success message
- ✅ Connection moves to "Active" tab
- ✅ Student receives notification

**⚠️ Verify in Database:**
```sql
SELECT status FROM mentor_connections WHERE id = 'connection_id';
```

**Expected:**
```
status = 'ACCEPTED'
```

---

## 💬 STEP 12: TEST CHAT FUNCTIONALITY

### 12.1 From Connections Page
Click "Chat" button next to accepted connection

**Expected Result:**
- ✅ Chat window opens
- ✅ Can send messages
- ✅ Messages appear in real-time (if WebSocket working)

---

## 📅 STEP 13: BOOK A SESSION

### 13.1 From Mentor Profile or Connections
Click "Book Session" button

**Expected Result:**
- ✅ Session booking page/modal opens
- ✅ Availability calendar loads (no 404)
- ✅ Can select date/time
- ✅ Can submit booking

**⚠️ Check Console:**
- ✅ NO 404 on `/sessions/availability/{mentorId}`

---

## ⭐ STEP 14: LEAVE A REVIEW (After Session)

### 14.1 Complete a Session
(For testing, manually update session status to COMPLETED in database)

```sql
UPDATE mentor_sessions 
SET status = 'COMPLETED' 
WHERE id = 'session_id';
```

### 14.2 Leave Review
Go to completed sessions, click "Leave Review"

**Expected Result:**
- ✅ Review form opens
- ✅ Can rate (1-5 stars)
- ✅ Can write feedback
- ✅ Can submit

**⚠️ Verify:**
```sql
SELECT * FROM mentor_reviews 
WHERE mentorId = 'mentor_profile_id' 
ORDER BY createdAt DESC LIMIT 1;
```

---

## 🔍 STEP 15: VERIFY REVIEW APPEARS ON PROFILE

### 15.1 View Mentor Profile Again
Go back to Find Mentors → Click mentor card

**Expected Result:**
- ✅ Reviews section shows your review
- ✅ NO 404 error
- ✅ Average rating updated
- ✅ Review content displays correctly

---

## 📊 STEP 16: CHECK ADMIN ANALYTICS (Optional)

### 16.1 Login as Admin
Login with admin account

### 16.2 Access Analytics
Navigate to: `http://localhost:5173/admin/analytics`

**Expected Result:**
- ✅ Dashboard shows statistics
- ✅ Mentor count
- ✅ Connection count
- ✅ Session count

---

## ✅ FINAL VERIFICATION CHECKLIST

Go through this checklist to ensure everything works:

### Database State
- [ ] Mentor profile exists with `status='ACTIVE'` and `isVerified=1`
- [ ] Connection exists with `status='ACCEPTED'`
- [ ] Chat room created for connection
- [ ] Session exists
- [ ] Review exists

### Frontend Functionality
- [ ] Mentor registration form works
- [ ] Email verification works
- [ ] Admin approval changes status to ACTIVE
- [ ] Mentor appears in Find Mentors (only when ACTIVE)
- [ ] Mentor profile opens without 404 errors
- [ ] Reviews section loads (no 404)
- [ ] Session availability loads (no 404)
- [ ] Connection request works
- [ ] Chat opens and works
- [ ] Session booking works
- [ ] Review submission works

### Console Checks
- [ ] NO 404 errors for `/reviews/mentor/{id}`
- [ ] NO 404 errors for `/sessions/availability/{id}`
- [ ] NO 403 errors (authentication working)
- [ ] NO JWT errors (token management working)

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue 1: "Mentor not found" (404) on reviews
**Cause:** Frontend passing wrong ID  
**Fix:** Verify `MentorProfile.tsx` line 246 uses `mentor.id` not `mentor.user.id`

### Issue 2: Mentor not visible after verification
**Cause:** Status is PENDING (needs admin approval)  
**Fix:** Run `node scripts/approveMentors.js`

### Issue 3: Admin can't access admin pages
**Cause:** User role is not ADMIN  
**Fix:** Run `UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';`

### Issue 4: Verification link expired
**Cause:** 24+ hours passed since registration  
**Fix:** Click "Register Again", fill form, get new link

### Issue 5: 403 errors everywhere
**Cause:** Token not stored/expired  
**Fix:** Logout and login again

---

## 📂 IMPORTANT FILES TO CHECK IF ISSUES

1. **Backend:**
   - `src/controllers/mentorshipController.js` - Registration & verification logic
   - `src/controllers/reviewController.js` - Review endpoints
   - `src/controllers/mentorSessionController.js` - Session endpoints

2. **Frontend:**
   - `frontend/src/components/mentors/MentorProfile.tsx` - Profile display
   - `frontend/src/components/mentors/MentorsPage.tsx` - Mentor list
   - `frontend/src/store/mentors.ts` - Mentor state management

3. **Database:**
   - `prisma/schema.prisma` - Database schema
   - `prisma/dev.db` - SQLite database file

---

## 🎯 SUCCESS CRITERIA

You've successfully tested the entire mentorship platform when:

1. ✅ Mentor can register
2. ✅ Email verification works
3. ✅ Admin can approve mentors
4. ✅ Students can find ACTIVE mentors
5. ✅ Mentor profiles load without errors
6. ✅ Students can request connections
7. ✅ Mentors can accept connections
8. ✅ Chat works between connected users
9. ✅ Sessions can be booked
10. ✅ Reviews can be left and displayed

**ALL ABOVE = MENTORSHIP PLATFORM WORKING PERFECTLY!** 🎉

---

## 📞 NEED HELP?

If you encounter any issues:
1. Check browser console for errors (F12)
2. Check backend terminal for errors
3. Verify database state with SQL queries
4. Review the fix documentation in `MENTOR_FIX_SUMMARY.md`
