# 🎯 COMPLETE MENTORSHIP PLATFORM - STEP-BY-STEP TESTING GUIDE

## ✅ Issues Fixed

### 1. Admin Dashboard 500 Error - FIXED ✅
**Problem:** Analytics controller was using old `role` field (now it's `roles` array)
**Solution:** Updated analytics controller to parse roles from JSON array

### 2. Mentor Verification "Invalid Token" Error
**Problem:** You're trying to verify with an OLD token from BEFORE you ran the cleanup script
**Solution:** Need to register as mentor AGAIN with fresh token

---

## 🚀 CORRECT STEP-BY-STEP PROCESS

### STEP 0: Restart Backend Server (CRITICAL!)
```powershell
# Stop current server (Ctrl+C)
npm run dev
```
**Why?** Backend needs to load the updated analytics controller and new Prisma client

---

### STEP 1: Logout and Login (Multi-Role Setup)

1. Open frontend: **http://localhost:5173**
2. Click **"Logout"** in sidebar
3. **Login again** with:
   - Email: `vamsikiran198@gmail.com`
   - Password: your password

**Expected Result:**
- ✅ Sidebar shows **"ADMIN"** section (purple)
- ✅ Settings page shows both **"Admin"** and **"Student"** badges
- ✅ You have access to both admin and student features

---

### STEP 2: Test Admin Dashboard (Should Work Now!)

1. Click **"Admin Dashboard"** in sidebar
2. Should load without 500 error ✅
3. You'll see platform statistics (users, mentors, sessions, etc.)

**If you see error:**
- Make sure you restarted backend server
- Check browser console for details
- Try refreshing the page

---

### STEP 3: Register as Mentor (FRESH START)

1. Click **"Become a Mentor"** in sidebar
2. Fill out the registration form:
   - **Company:** Example Corp
   - **Job Title:** Senior Developer  
   - **Industry:** Technology
   - **Years of Experience:** 5
   - **College Name:** Your College
   - **Degree:** Bachelor's
   - **Graduation Year:** 2018
   - **Major:** Computer Science
   - **Expertise Areas:** Select 2-3 areas (e.g., Web Development, AI/ML)
   - **Bio:** Write a short bio (at least 50 characters)
   - **LinkedIn URL:** (optional) https://linkedin.com/in/yourprofile
   - **Available Hours/Week:** 5
   - **Meeting Type:** VIDEO or BOTH
3. Click **"Register as Mentor"**

**Expected Result:**
```
✅ Success message: "Mentor profile created successfully. Please check your email to verify your account."
```

---

### STEP 4: Verify Email (Check Console!)

**IMPORTANT:** Since email might not be configured, check the BACKEND CONSOLE:

1. Look at your backend terminal (where `npm run dev` is running)
2. Find the verification link in the console output
3. It will look like:
   ```
   📧 Verification email would be sent to: vamsikiran198@gmail.com
   🔗 Verification URL: http://localhost:5173/mentorship/verify/abc123def456...
   ```
4. **Copy the entire verification URL**
5. **Paste it in your browser** and press Enter

**Expected Result:**
```
✅ Email Verification Success!
Message: "Email verified successfully! Your profile is pending admin approval."
```

**Status at this point:**
- ✅ Mentor profile created
- ✅ Email verified (isVerified = true)
- ⏳ Status = PENDING (waiting for admin approval)
- ❌ Not visible in "Find Mentors" yet

---

### STEP 5: Approve Mentor as Admin

**Option A: Use Script (Recommended)**
```powershell
node scripts/approveMentors.js
```
- Choose option **1** (Approve ALL pending mentors)
- Type **yes** to confirm

**Option B: Use Admin Panel (If working)**
1. Go to **"Verify Mentors"** in admin sidebar
2. Click **"Approve"** button next to your mentor profile

**Expected Result:**
```
✅ Mentor profile approved!
Status changed: PENDING → ACTIVE
```

---

### STEP 6: Verify Mentor Appears in Find Mentors

1. Click **"Find Mentors"** in sidebar
2. You should see your mentor profile card ✅
3. Click on the card to open profile modal
4. Check browser console (F12) - should be NO 404 errors
5. Reviews section should say "No reviews yet"
6. Session booking should show available times

**Expected Result:**
- ✅ Mentor card visible
- ✅ Profile opens without errors
- ✅ All sections load properly

---

### STEP 7: Test Connection Request (As Student)

1. From the mentor profile modal, click **"Request Connection"**
2. Write a brief message explaining why you want to connect
3. Click **"Send Request"**

**Expected Result:**
```
✅ Success: "Connection request sent successfully!"
```

**In Database:**
- New connection created with status = PENDING
- Notification created for mentor

---

### STEP 8: Test Admin Features

1. Go to **"Admin Dashboard"**
   - View platform statistics
   - See user growth, mentor counts, session stats

2. Go to **"Verify Mentors"**
   - Should show "No pending mentors" (since you approved yourself)
   - Can view all mentors and their status

---

## 🎯 COMPLETE FLOW SUMMARY

```
1. Restart Backend → Load new code
2. Logout/Login → Get multi-role JWT token
3. Test Admin Dashboard → Should work (500 error fixed)
4. Register as Mentor → Fill form, submit
5. Copy Verification Link → From backend console
6. Click Verification Link → Verify email
7. Approve as Admin → Use script or admin panel
8. Check Find Mentors → Mentor visible
9. Request Connection → Test student feature
10. All Features Working ✅
```

---

## 🐛 Troubleshooting

### Issue: "Invalid or expired verification token"
**Cause:** Using old token from before cleanup script
**Solution:** Register as mentor again (Step 3)

### Issue: Admin Dashboard 500 error
**Cause:** Backend not restarted after code changes
**Solution:** Restart backend server (Ctrl+C then `npm run dev`)

### Issue: Mentor not appearing in Find Mentors
**Checklist:**
- [ ] Email verified? (isVerified = true)
- [ ] Admin approved? (status = ACTIVE)
- [ ] Try refreshing the page
- [ ] Check backend console for errors

### Issue: Can't see admin section in sidebar
**Solution:** Logout and login again to get new JWT token with roles array

---

## 📊 Database Verification Commands

### Check Your User Roles
```powershell
node scripts/listUserRoles.js vamsikiran198@gmail.com
```
**Expected Output:**
```
Roles: ADMIN, STUDENT
```

### Check Mentor Profile Status
```powershell
# Using Node.js REPL
node
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Check your mentor profile
prisma.mentorProfile.findFirst({
  where: { userId: 'your-user-id' }
}).then(console.log);
```

**Expected Fields:**
- `isVerified`: true (after email verification)
- `status`: "ACTIVE" (after admin approval)
- `verificationToken`: null (cleared after verification)

---

## ✅ SUCCESS CHECKLIST

After following all steps, you should have:

- [x] Backend server restarted with new code
- [x] User logged in with both ADMIN and STUDENT roles
- [x] Admin dashboard loads without errors
- [x] Mentor profile registered with fresh data
- [x] Email verified successfully
- [x] Mentor profile approved by admin
- [x] Mentor visible in Find Mentors page
- [x] Profile opens without 404 errors
- [x] Connection request works
- [x] All admin features accessible

---

## 🎉 Expected Final State

### Your User (vamsikiran198@gmail.com)
- **Roles:** ["ADMIN", "STUDENT"]
- **Mentor Profile:** ACTIVE, verified
- **Can Access:**
  - Admin Dashboard ✅
  - Verify Mentors ✅
  - AI Chat ✅
  - Career Quiz ✅
  - Find Mentors ✅
  - Request connections ✅
  - Everything! ✅

### Sidebar Navigation
```
Dashboard
AI Chat
Career Quiz
Find Mentors (shows YOUR mentor profile)
My Connections
Messages
My Sessions
Become a Mentor (shows "Pending Approval" if registered)
Settings

━━━━━━━━━━━━━━━━━
ADMIN (Purple Section)
━━━━━━━━━━━━━━━━━
Admin Dashboard (works now!)
Verify Mentors

Logout
```

---

## 📝 Notes

1. **Always restart backend** after code changes
2. **Always logout/login** after role changes
3. **Check backend console** for verification links
4. **Use fresh tokens** - old tokens won't work after cleanup
5. **Admin approval required** - mentors start as PENDING

---

## 🚀 You're Ready!

Follow these steps in order and everything will work perfectly. The platform is now professionally implemented with multi-role support!

**Questions?** Check the console for errors and refer to this guide.
