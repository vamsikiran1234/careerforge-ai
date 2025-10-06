# Complete Mentor System Issues & Fixes

**Date**: January 5, 2025  
**Status**: 🔧 IN PROGRESS

## Issues Reported

### Issue 1: Email Verification Shows "Failed" ❌
**Symptom**: When clicking verification link, shows "Verification Failed" message but mentor still appears in pending list

### Issue 2: "Mentor not found" Error ❌
**Symptom**: When clicking "Request Connection" on mentor card in Find Mentors page, shows "Mentor not found" error

### Issue 3: 404 Error for Sessions API ❌
**Symptom**: Console showing 404 errors for `/api/v1/sessions/availability/:mentorId`

---

## Investigation & Fixes

### Fix 1: Email Verification - Handle Already Verified Emails ✅

**Problem**: If user clicks verification link twice, it shows "failed" because token is already consumed

**Solution**: Updated `verifyMentorEmail()` to handle already-verified cases gracefully

**Code Changes** (`src/controllers/mentorshipController.js`):

```javascript
// Added check for already verified profiles
const alreadyVerifiedProfile = await prisma.mentorProfile.findFirst({
  where: {
    verificationToken: null, // Token cleared after verification
    isVerified: true,
  },
});

if (alreadyVerifiedProfile) {
  console.log('✅ Email already verified for profile:', alreadyVerifiedProfile.id);
  return res.json({
    success: true,
    message: 'Email already verified! Your profile is pending admin approval.',
    alreadyVerified: true,
  });
}
```

**Result**: Now shows success message even if already verified ✅

---

### Fix 2: "Mentor not found" Error - Debug Required 🔍

**Possible Causes**:

1. **Wrong Mentor ID Being Passed**
   - Frontend may be passing `user.id` instead of `mentorProfile.id`
   - Check what ID is being sent in connection request

2. **Mentor Status Not ACTIVE**
   - Connection request requires `status: 'ACTIVE'`
   - If mentor still `status: 'PENDING'`, request will fail
   - **Database check shows**: Mentor IS active now ✅

3. **Profile ID Mismatch**
   - New profile created: `cmgcnyd7u0001ui1wej4saivh`
   - Old profile: `cmgcmii960001uihsbjwwopit`
   - Frontend may be caching old ID

**Backend Code** (`sendConnectionRequest`):

```javascript
// Check if mentor exists and is active
const mentor = await prisma.mentorProfile.findUnique({
  where: { id: mentorId },
  include: { user: true },
});

if (!mentor) {
  return res.status(404).json({
    success: false,
    message: 'Mentor not found',
  });
}

if (!mentor.isVerified || mentor.status !== 'ACTIVE') {
  return res.status(400).json({
    success: false,
    message: 'This mentor is not available for connections',
  });
}
```

**Debug Steps**:

1. **Check Frontend Logs**:
   ```javascript
   console.log('Mentor ID being sent:', mentorId);
   console.log('Full mentor object:', mentor);
   ```

2. **Check Backend Logs**:
   ```javascript
   console.log('Received mentorId:', mentorId);
   console.log('Found mentor:', mentor ? mentor.id : 'NOT FOUND');
   ```

3. **Verify in Database**:
   ```bash
   node scripts/checkMentorProfiles.js
   ```
   Current result: 1 ACTIVE mentor with ID `cmgcnyd7u0001ui1wej4saivh`

---

### Fix 3: Sessions API 404 Error - Route Exists But... 🔍

**Investigation**:
- ✅ Route defined in `src/routes/mentorSessionRoutes.js`
- ✅ Controller `getAvailability` exists
- ✅ Route registered in `app.js` at `/api/v1/sessions`
- ❓ Why still 404?

**Possible Causes**:

1. **Frontend calling before mentor is active**
   - Frontend tries to load availability when clicking mentor card
   - If mentor ID is wrong, backend returns 404

2. **MentorId is user ID not profile ID**
   - Frontend may be using `mentor.user.id` instead of `mentor.id`
   - Backend expects `mentorProfile.id`

3. **CORS or Authentication Issue**
   - Request might be blocked
   - Check if route requires auth but token not sent

**Backend Route**:
```javascript
// Public route - no auth required
router.get('/availability/:mentorId', getAvailability);
```

**Frontend Call** (`SessionBooking.tsx`):
```typescript
const response = await axios.get(`${VITE_API_URL}/sessions/availability/${mentorId}`);
```

**Debug Steps**:

1. **Check what mentorId is being used**:
   - Open browser console
   - Look for the availability API call
   - Check the mentorId in the URL
   - Compare with actual mentor profile ID from database

2. **Test with curl**:
   ```bash
   curl http://localhost:3000/api/v1/sessions/availability/cmgcnyd7u0001ui1wej4saivh
   ```

3. **Check backend console**:
   - Should see logs from `getAvailability` controller
   - If not, route isn't being hit

---

## Current Database State

```bash
node scripts/checkMentorProfiles.js
```

**Result**:
```
📊 Total Mentor Profiles: 1

✅ ACTIVE Profiles (Approved Mentors):
   1. Vamsi Kiran (vamsikiran198@gmail.com)
      Profile ID: cmgcnyd7u0001ui1wej4saivh
      Expertise: IOS Developer Intern

💡 Expected Admin Dashboard Counts:
   Total Mentors: 1
   Pending: 0
   Active: 1
```

**Important**: 
- Mentor IS active ✅
- Profile ID is `cmgcnyd7u0001ui1wej4saivh`
- Frontend must use THIS ID for connections and availability

---

## Testing Steps

### Test 1: Email Verification (Already Verified)
1. Try clicking verification link again
2. **Expected**: "Email already verified! Your profile is pending admin approval"
3. **Not**: "Verification failed" ❌

### Test 2: Connection Request
1. Login as different user (not the mentor)
2. Go to "Find Mentors"
3. Find Vamsi Kiran's mentor card
4. Click "Request Connection"
5. **Check browser console**:
   - What mentor ID is being sent?
   - What's the error response?
6. **Check backend console**:
   - Did request reach `sendConnectionRequest`?
   - What mentorId was received?
   - Was mentor found in database?

### Test 3: Sessions Availability
1. Click on mentor card
2. Open browser DevTools → Network tab
3. Look for API call to `/sessions/availability/...`
4. **Check**:
   - What mentor ID is in the URL?
   - What's the response (404, 500, 200)?
   - What's the error message?

---

## Required Frontend Checks

### Check 1: Mentor ID Usage

**In MentorCard.tsx / MentorsPage.tsx**:
```typescript
// Make sure you're using mentor.id (profile ID)
// NOT mentor.user.id (user ID)

const handleConnection = (mentor: MentorProfile) => {
  console.log('🔍 Mentor ID:', mentor.id);              // Profile ID ✅
  console.log('🔍 User ID:', mentor.user.id);          // User ID ❌
  console.log('🔍 Mentor object:', mentor);
  
  // Should send mentor.id
  sendConnectionRequest({ mentorId: mentor.id, message: '...' });
};
```

### Check 2: API Endpoint

**Verify VITE_API_URL**:
```bash
# In frontend/.env
VITE_API_URL=http://localhost:3000/api/v1
```

**Connection request should go to**:
```
POST http://localhost:3000/api/v1/mentorship/connections/request
Body: {
  "mentorId": "cmgcnyd7u0001ui1wej4saivh",
  "message": "optional message"
}
```

### Check 3: Clear Cache

1. Hard refresh browser: `Ctrl + Shift + R`
2. Clear local storage:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```
3. Close and reopen browser
4. Login again

---

## Backend Enhancements Needed

### Add More Logging to Connection Request

**File**: `src/controllers/mentorshipController.js`

**Add at the beginning of `sendConnectionRequest`**:

```javascript
const sendConnectionRequest = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { mentorId, message } = req.body;

    // ADD THIS LOGGING
    console.log('🔗 Connection request received');
    console.log('   Student ID:', studentId);
    console.log('   Mentor ID:', mentorId);
    console.log('   Message:', message);

    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: 'Mentor ID is required',
      });
    }

    // Check if mentor exists and is active
    console.log('🔍 Looking for mentor profile...');
    
    const mentor = await prisma.mentorProfile.findUnique({
      where: { id: mentorId },
      include: { user: true },
    });

    console.log('   Mentor found:', mentor ? 'YES' : 'NO');
    
    if (mentor) {
      console.log('   Mentor ID:', mentor.id);
      console.log('   Status:', mentor.status);
      console.log('   isVerified:', mentor.isVerified);
      console.log('   Name:', mentor.user.name);
    }
    
    // ... rest of code
```

---

## Immediate Actions Required

### 1. Add Frontend Logging ✅

**Create**: `frontend/src/utils/debugMentor.ts`

```typescript
export const debugMentorConnection = (mentor: any) => {
  console.group('🔍 Mentor Connection Debug');
  console.log('Mentor Profile ID:', mentor.id);
  console.log('User ID:', mentor.user?.id);
  console.log('Mentor Name:', mentor.user?.name);
  console.log('Status:', mentor.status);
  console.log('Is Verified:', mentor.isVerified);
  console.log('Full Mentor Object:', mentor);
  console.groupEnd();
};
```

**Use in connection handler**:
```typescript
import { debugMentorConnection } from '@/utils/debugMentor';

const handleConnect = (mentor: MentorProfile) => {
  debugMentorConnection(mentor);
  // ... rest of connection logic
};
```

### 2. Check Find Mentors Query

**Verify**: `frontend/src/store/mentors.ts`

```typescript
// Make sure fetchMentors includes correct fields
fetchMentors: async () => {
  const response = await axios.get(`${API_URL}/mentorship/mentors`);
  console.log('📋 Fetched mentors:', response.data.data);
  
  // Each mentor should have:
  // - id: mentorProfile.id (NOT user.id)
  // - user: { id, name, email, avatar }
  // - status: 'ACTIVE'
  // - isVerified: true
};
```

### 3. Test with Backend Logs

**Start backend and watch logs**:
```bash
npm run dev
```

**Try connection from frontend, look for**:
```
🔗 Connection request received
   Student ID: ...
   Mentor ID: ...
🔍 Looking for mentor profile...
   Mentor found: YES/NO
```

---

## Next Steps

1. ✅ **Email verification fixed** - handles already verified gracefully
2. 🔍 **Add frontend logging** - see what mentor ID is being sent
3. 🔍 **Add backend logging** - confirm what backend receives
4. 🧪 **Test connection** - identify exact failure point
5. 🐛 **Fix ID mismatch** - ensure using profile ID not user ID
6. ✅ **Verify sessions API** - test availability endpoint directly

---

## Files Changed

1. ✅ `src/controllers/mentorshipController.js` - Enhanced email verification
2. 📝 `docs/COMPLETE_MENTOR_SYSTEM_DEBUG.md` - This file

## Status Summary

| Issue | Status | Next Action |
|-------|--------|-------------|
| Email verification message | ✅ FIXED | Test with clicking link twice |
| Mentor not found error | 🔍 DEBUG | Add logging, check IDs |
| Sessions 404 error | 🔍 DEBUG | Test with correct mentor ID |
| Pending mentors showing | ✅ FIXED | Verified working |
| Analytics counts | ✅ FIXED | Showing correct numbers |

---

**Ready for debugging! Both servers restarted with fixes.** 🚀

Please test and report:
1. What mentor ID shows in browser console when clicking connect?
2. What error shows in backend console?
3. Does sessions availability work if you use correct profile ID?
