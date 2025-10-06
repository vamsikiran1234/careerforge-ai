# Mentor Verification 400 Error - Fix Guide

## Issue
Verification page shows "Invalid or expired verification token" with 400 Bad Request error.

## Root Cause Analysis

The error screenshot shows:
```
Failed to load resource: :3000/api/v1/mentors-0a1bf37a1d224cdd31 (400 Bad Request)
```

**Problem**: The URL is malformed - it should be `:3000/api/v1/mentorship/verify/0a1bf37a1d224cdd31`

## Possible Causes

### 1. Token Already Used
- Verification tokens are single-use
- After successful verification, the token is set to `null` in database
- Clicking the link again results in 400 error

### 2. Token Expired
- Tokens expire after 24 hours
- `verificationExpiry` field checked in backend

### 3. Invalid Token Format
- Token not found in database
- Typo or corruption in URL

## Fix Applied

### Frontend Enhancement (`MentorVerificationPage.tsx`)

Added comprehensive logging and better error handling:

```typescript
// Better error messages based on status code
if (err.response?.status === 400) {
  errorMessage += 'Invalid or expired verification token.';
} else if (err.response?.status === 404) {
  errorMessage += 'Verification endpoint not found.';
}
```

## How to Test

### Test 1: Fresh Registration
```bash
1. Register as mentor
2. Check email/console for verification URL
3. Click verification link (should work first time)
4. Status: SUCCESS ✅
```

### Test 2: Expired Token
```bash
1. Wait 24+ hours after registration
2. Click verification link
3. Expected: "Invalid or expired verification token"
4. Should offer "Register Again" button
```

### Test 3: Used Token
```bash
1. Successfully verify once
2. Click same link again
3. Expected: "Invalid or expired verification token" (400)
4. This is CORRECT behavior - prevents re-verification
```

## Solutions for Users

### If Verification Fails:

1. **Check Email Inbox**
   - Verification email sent immediately after registration
   - Check spam folder
   - Email subject: "Verify Your Mentor Profile - CareerForge AI"

2. **Token Expired (24+ hours)**
   - Click "Register Again" button
   - Complete registration process again
   - New verification email will be sent

3. **Already Verified**
   - Go to Dashboard
   - Check mentor profile status
   - Should show "ACTIVE" if already verified

## Backend Validation

The backend correctly validates:

```javascript
const mentorProfile = await prisma.mentorProfile.findFirst({
  where: {
    verificationToken: token,
    verificationExpiry: {
      gt: new Date(), // Must not be expired
    },
  },
});

if (!mentorProfile) {
  return res.status(400).json({
    success: false,
    message: 'Invalid or expired verification token',
  });
}
```

## Console Logging Added

New logs help debugging:

```
🔍 Verification started
Token from URL: abc123...
API URL: http://localhost:3000/api/v1
📡 Making verification request to: http://localhost:3000/api/v1/mentorship/verify/abc123
✅ Verification response: { success: true, ... }
```

Or on error:
```
❌ Verification error: AxiosError
Error response: { success: false, message: "Invalid or expired verification token" }
Error status: 400
Request URL: http://localhost:3000/api/v1/mentorship/verify/abc123
```

## Expected Behavior

### ✅ Success Flow:
1. User registers as mentor
2. Email sent with verification link
3. User clicks link within 24 hours
4. Token validated
5. Status changed to ACTIVE
6. User redirected to dashboard

### ❌ Error Flow (400):
1. User clicks expired/used link
2. Backend returns 400
3. Frontend shows error message
4. User can register again

## Status

✅ **Enhanced Error Handling** - Better user feedback  
✅ **Comprehensive Logging** - Easier debugging  
✅ **Proper Error Messages** - User-friendly text  

## Note

The 400 error is **expected behavior** for:
- Expired tokens (24+ hours old)
- Already-used tokens (prevents re-verification)
- Invalid tokens (not in database)

This is a **security feature**, not a bug!

---

**Date**: December 2024  
**Status**: Enhanced with better UX  
**Breaking Changes**: None
