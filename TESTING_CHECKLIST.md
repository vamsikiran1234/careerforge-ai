# Testing Checklist: Mentor Registration & Verification

## ✅ Pre-Testing Setup

- [ ] Backend server running on port 3000
- [ ] Frontend server running on port 5173
- [ ] Database accessible (prisma/dev.db)
- [ ] Email service configured (or console logging enabled)

---

## 📝 Test Scenario 1: Fresh Mentor Registration

### Steps:
1. [ ] Open browser to `http://localhost:5173`
2. [ ] Click "Become a Mentor" or navigate to `/mentorship/register`
3. [ ] Fill out all required fields:
   - [ ] Professional info (company, job title, industry, experience)
   - [ ] Educational info (college, degree, graduation year)
   - [ ] Expertise areas (select at least one)
   - [ ] Bio (under 500 characters)
   - [ ] Optional: LinkedIn URL, Portfolio URL
4. [ ] Click "Submit Registration"

### Expected Results:
- [ ] Success message: "Mentor profile created successfully. Please check your email to verify your account."
- [ ] Verification email sent (check console logs if email service not configured)
- [ ] Database: New record in `mentor_profiles` with:
  - `isVerified = false`
  - `status = 'PENDING'`
  - `verificationToken` set
  - `verificationExpiry` set to 24 hours from now

### SQL Verification:
```sql
SELECT mp.id, u.email, mp.isVerified, mp.status, mp.verificationExpiry
FROM mentor_profiles mp
JOIN users u ON mp.userId = u.id
ORDER BY mp.createdAt DESC
LIMIT 1;
```

---

## 📝 Test Scenario 2: Email Verification (Success)

### Steps:
1. [ ] Copy verification link from email/console
2. [ ] Paste link in browser (should be `/mentorship/verify/{token}`)
3. [ ] Page loads and shows verification progress

### Expected Results:
- [ ] Loading spinner appears briefly
- [ ] Green checkmark icon displays
- [ ] Success message: "Email verified successfully! Your profile is pending admin approval."
- [ ] Secondary message: "An admin will review your profile shortly. You'll be notified once approved!"
- [ ] Buttons displayed: "Go to Dashboard" and "View My Profile"
- [ ] Database: Profile updated with:
  - `isVerified = true`
  - `status = 'PENDING'` (not ACTIVE - awaiting admin approval)
  - `verificationToken = null`
  - `verificationExpiry = null`

### SQL Verification:
```sql
SELECT id, isVerified, status, verificationToken
FROM mentor_profiles
WHERE id = 'your_mentor_id_here';
```

---

## 📝 Test Scenario 3: Email Verification (Expired Token)

### Setup:
- Register mentor but don't verify for 24+ hours
- OR manually set `verificationExpiry` to past date in database

### Steps:
1. [ ] Click verification link after expiration
2. [ ] Page loads and shows error state

### Expected Results:
- [ ] Red X icon displays
- [ ] Error message: "Invalid or expired verification token"
- [ ] Secondary message: "Please try registering again or contact support if the problem persists."
- [ ] Buttons displayed: "Register Again" and "Back to Dashboard"
- [ ] Database: Profile remains unchanged with `isVerified = false`

---

## 📝 Test Scenario 4: Re-Registration After Expiry

### Prerequisites:
- Completed Test Scenario 3 (have expired profile)

### Steps:
1. [ ] Click "Register Again" button from verification error page
2. [ ] Fill out registration form again (can use same email)
3. [ ] Submit form

### Expected Results:
- [ ] Old expired profile automatically deleted
- [ ] New profile created with fresh verification token
- [ ] New verification email sent
- [ ] Database: Only one profile exists for the user (old one deleted)

### SQL Verification:
```sql
-- Should return only 1 row
SELECT COUNT(*) as profile_count
FROM mentor_profiles
WHERE userId = 'your_user_id_here';
```

---

## 📝 Test Scenario 5: Admin Approval (Script Method)

### Steps:
1. [ ] Open terminal
2. [ ] Navigate to project root: `cd c:/Users/vamsi/careerforge-ai`
3. [ ] Run approval script: `node scripts/approveMentors.js`
4. [ ] Review list of pending mentors
5. [ ] Choose option 1 (Approve ALL) or 2 (Approve specific)
6. [ ] Confirm approval

### Expected Results:
- [ ] Script displays all pending mentors with details
- [ ] After confirmation, mentors approved successfully
- [ ] Console shows: "✅ Approved {count} mentor(s)"
- [ ] Database: Profiles updated with `status = 'ACTIVE'`

### SQL Verification:
```sql
SELECT id, isVerified, status
FROM mentor_profiles
WHERE id = 'approved_mentor_id_here';
-- Should show: isVerified=1, status='ACTIVE'
```

---

## 📝 Test Scenario 6: Find Mentors (Before Approval)

### Prerequisites:
- Mentor verified but NOT approved (status = PENDING)

### Steps:
1. [ ] Log in as student user
2. [ ] Navigate to `/mentors` (Find Mentors page)
3. [ ] Search for recently registered mentor

### Expected Results:
- [ ] Mentor NOT visible in list
- [ ] Only ACTIVE mentors shown
- [ ] No errors in console

---

## 📝 Test Scenario 7: Find Mentors (After Approval)

### Prerequisites:
- Mentor verified AND approved (status = ACTIVE)

### Steps:
1. [ ] Log in as student user
2. [ ] Navigate to `/mentors` (Find Mentors page)
3. [ ] Verify mentor appears in list

### Expected Results:
- [ ] Approved mentor visible in grid/list
- [ ] Mentor card shows:
  - Name
  - Job title
  - Company
  - Years of experience
  - Expertise areas
  - Average rating (or "New")
  - Availability status

---

## 📝 Test Scenario 8: View Mentor Profile (No 404 Errors)

### Steps:
1. [ ] From Find Mentors page, click on mentor card
2. [ ] Mentor profile modal/page opens
3. [ ] Scroll through all sections

### Expected Results:
- [ ] Profile opens successfully (no 404 errors)
- [ ] All sections display correctly:
  - [ ] Header with name, title, company
  - [ ] Stats cards (rating, sessions, hours)
  - [ ] About/Bio section
  - [ ] Expertise areas (tags)
  - [ ] Education section
  - [ ] Links (LinkedIn, Portfolio) if provided
  - [ ] Availability info (timezone, meeting type)
  - [ ] **Reviews section** (no 404 error, even if empty)
  - [ ] Action buttons (Close, Request Connection)
- [ ] Console shows NO errors like:
  - ❌ "404 Not Found: /reviews/mentor/{id}"
  - ❌ "404 Not Found: /sessions/availability/{id}"

### Console Verification:
- [ ] Open browser DevTools → Console tab
- [ ] Should see **NO 404 errors** for reviews or availability

---

## 📝 Test Scenario 9: Request Connection

### Steps:
1. [ ] Open approved mentor's profile
2. [ ] Click "Request Connection" button

### Expected Results:
- [ ] Success message displayed
- [ ] Connection request created in database
- [ ] Mentor receives notification (if notification system enabled)
- [ ] Button changes to show "Pending" or similar state

### SQL Verification:
```sql
SELECT *
FROM mentor_connections
WHERE mentorId = 'mentor_id' AND studentId = 'student_id';
-- Should return 1 row with status='PENDING'
```

---

## 📝 Test Scenario 10: View Reviews (Empty State)

### Prerequisites:
- Mentor has no reviews yet

### Steps:
1. [ ] Open mentor profile
2. [ ] Scroll to reviews section

### Expected Results:
- [ ] No 404 error
- [ ] Empty state message: "No reviews yet" or similar
- [ ] Section displays gracefully with placeholder content

---

## 📝 Test Scenario 11: Session Availability

### Steps:
1. [ ] Navigate to `/sessions/book/{mentorId}`
2. [ ] Page should load availability calendar

### Expected Results:
- [ ] No 404 error on availability fetch
- [ ] Calendar/availability UI displays
- [ ] If mentor hasn't set availability: appropriate message shown

---

## 🐛 Common Issues to Watch For

### Issue: Console shows JWT errors
- **Check**: Token stored in localStorage
- **Verify**: `localStorage.getItem('token')` and `localStorage.getItem('authToken')`
- **Fix**: Clear localStorage and log in again

### Issue: Mentor not appearing in Find Mentors
- **Check**: Run SQL to verify status
  ```sql
  SELECT isVerified, status FROM mentor_profiles WHERE id = 'mentor_id';
  ```
- **Required**: Must be `isVerified=1` AND `status='ACTIVE'`
- **Fix**: Run `node scripts/approveMentors.js`

### Issue: 404 on reviews endpoint
- **Check**: Verify correct ID being passed
- **Debug**: Add console.log in MentorProfile.tsx
  ```tsx
  console.log('Mentor ID:', mentor.id);
  console.log('User ID:', mentor.user.id);
  ```
- **Expected**: Should pass `mentor.id` (profile ID), not `mentor.user.id`

### Issue: Verification link says expired immediately
- **Check**: Server time vs database time
- **Verify**: `SELECT datetime('now')` in SQLite should match current time
- **Fix**: Ensure system clock is correct

---

## 📊 Database State Checks

### Check 1: Mentor Profile Status
```sql
SELECT 
  mp.id,
  u.email,
  mp.isVerified,
  mp.status,
  mp.createdAt
FROM mentor_profiles mp
JOIN users u ON mp.userId = u.id
ORDER BY mp.createdAt DESC;
```

### Check 2: Verification Token Status
```sql
SELECT 
  id,
  verificationToken IS NOT NULL as has_token,
  verificationExpiry,
  CASE 
    WHEN verificationExpiry > datetime('now') THEN 'VALID'
    ELSE 'EXPIRED'
  END as token_status
FROM mentor_profiles
WHERE verificationToken IS NOT NULL;
```

### Check 3: Connection Requests
```sql
SELECT 
  mc.id,
  mc.status,
  s.name as student_name,
  m.name as mentor_name,
  mc.createdAt
FROM mentor_connections mc
JOIN users s ON mc.studentId = s.id
JOIN mentor_profiles mp ON mc.mentorId = mp.id
JOIN users m ON mp.userId = m.id
ORDER BY mc.createdAt DESC;
```

---

## ✅ Final Checklist

After completing all tests, verify:

- [ ] ✅ Fresh registration works
- [ ] ✅ Email verification succeeds
- [ ] ✅ Expired tokens handled gracefully
- [ ] ✅ Re-registration allowed for expired profiles
- [ ] ✅ Admin approval script works
- [ ] ✅ Only ACTIVE mentors visible in Find Mentors
- [ ] ✅ Mentor profile opens without 404 errors
- [ ] ✅ Reviews section loads correctly
- [ ] ✅ Session availability loads correctly
- [ ] ✅ Connection requests work
- [ ] ✅ No console errors or warnings
- [ ] ✅ All user-facing messages are clear and helpful

---

## 🎉 Success Criteria

All tests passed means:
1. ✅ Users can register as mentors successfully
2. ✅ Email verification works correctly
3. ✅ Expired tokens are handled properly
4. ✅ Admin approval workflow functions
5. ✅ Mentors appear in Find Mentors only when ACTIVE
6. ✅ No 404 errors on mentor profiles
7. ✅ Connection requests work end-to-end
8. ✅ Professional user experience throughout

**Result**: Mentor registration system is working properly and professionally! 🚀
