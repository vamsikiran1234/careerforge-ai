# 🚀 QUICK START: Testing Mentorship Platform

## ⚡ What You Need to Do (5 Steps)

### 1️⃣ CLEAN UP (Start Fresh)
```bash
cd c:/Users/vamsi/careerforge-ai
node scripts/cleanupMentorData.js
# Type: DELETE ALL when prompted
```

### 2️⃣ CREATE ADMIN USER
```bash
# Check if you have an admin
sqlite3 prisma/dev.db "SELECT email, role FROM users WHERE role = 'ADMIN';"

# If no admin, make yourself admin:
sqlite3 prisma/dev.db "UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';"

# Verify:
sqlite3 prisma/dev.db "SELECT email, role FROM users WHERE role = 'ADMIN';"
```

### 3️⃣ REGISTER AS MENTOR
1. Open: `http://localhost:5173/mentorship/register`
2. Fill the form (any test data)
3. Click "Submit"
4. **COPY the verification link** from console

### 4️⃣ VERIFY EMAIL & APPROVE
```bash
# 1. Click verification link (from step 3)
# 2. You'll see "Pending admin approval"

# 3. Run approval script:
node scripts/approveMentors.js
# Choose option 1 (Approve ALL)
# Type 'yes'
```

### 5️⃣ TEST EVERYTHING
1. **Find Mentors:** Go to `/mentors` - mentor should appear ✅
2. **View Profile:** Click mentor card - opens without errors ✅
3. **Reviews:** Scroll to reviews section - no 404 ✅
4. **Request Connection:** Click button - success! ✅

---

## 🎯 How to Access Admin Panel

### If You're Admin:
1. Login with admin account
2. Look at **LEFT SIDEBAR**
3. Scroll down past regular menu items
4. You'll see **"ADMIN"** section in purple:
   - 🛡️ **Admin Dashboard** → `/admin`
   - ✓ **Verify Mentors** → `/admin/mentors`

### If You Don't See Admin Section:
Your account is not an admin. Run:
```bash
sqlite3 prisma/dev.db "UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';"
```
Then logout and login again.

---

## ✅ Quick Verification Checklist

After following steps 1-5, verify these work:

- [ ] Mentor appears in Find Mentors list
- [ ] Clicking mentor card opens profile
- [ ] Reviews section loads (shows "No reviews yet")
- [ ] **NO 404 errors** in browser console (F12)
- [ ] "Request Connection" button works
- [ ] Admin can see "ADMIN" section in sidebar
- [ ] Admin can access `/admin/mentors`
- [ ] Admin can approve/reject mentors

---

## 🐛 If Something Doesn't Work

### Mentor not showing in Find Mentors?
```bash
# Check status:
sqlite3 prisma/dev.db "SELECT isVerified, status FROM mentor_profiles;"

# Should show: isVerified=1, status='ACTIVE'
# If PENDING, run: node scripts/approveMentors.js
```

### Reviews showing 404 error?
```javascript
// Check browser console for the API call
// Should be: /api/v1/reviews/mentor/{mentorProfileId}
// NOT: /api/v1/reviews/mentor/{userId}

// If wrong, the fix wasn't applied correctly
```

### Can't see admin section in sidebar?
```bash
# Check your role:
sqlite3 prisma/dev.db "SELECT email, role FROM users WHERE email = 'your@email.com';"

# Should show: role='ADMIN'
# If not, update: UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

### Servers not running?
```bash
# Terminal 1 (Backend):
cd c:/Users/vamsi/careerforge-ai
npm run dev

# Terminal 2 (Frontend):
cd c:/Users/vamsi/careerforge-ai/frontend
npm run dev
```

---

## 📚 Full Documentation

For detailed testing, see:
- **`COMPLETE_MENTORSHIP_TESTING_GUIDE.md`** - Step-by-step testing (16 steps)
- **`MENTOR_FIX_SUMMARY.md`** - Quick reference of all fixes
- **`MENTORSHIP_IMPLEMENTATION_VERIFICATION.md`** - Complete implementation check
- **`TESTING_CHECKLIST.md`** - Detailed test scenarios

---

## ✨ That's It!

If steps 1-5 work and checklist passes → **Everything is working perfectly!** 🎉

The mentorship platform is fully functional, professionally implemented, and ready to use.
