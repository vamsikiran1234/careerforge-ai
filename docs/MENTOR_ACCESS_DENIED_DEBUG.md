# Mentor Portal Access Denied Issue - Debug & Fix

**Date**: January 2025  
**Status**: 🔍 **DEBUGGING ADDED**  
**Priority**: 🔥 **CRITICAL**

---

## 🐛 Issue Reported

### Problem: Access Denied for Registered Mentors

**Symptom**:
- User IS a registered mentor
- Can access `/mentor/mentees` page successfully
- Clicks "View Connection Requests" button
- Gets "Access Denied" modal saying "You need to be a registered mentor"
- Cannot access `/mentor/connections` page

**User Impact**:
- Mentors cannot view pending connection requests
- Cannot accept/decline new student connections
- Blocks core mentor functionality
- Confusing experience - already inside mentor portal!

---

## 🔍 Root Cause Analysis

### Potential Causes:

1. **Race Condition in Role Detection**
   - RoleContext fetches mentor status on mount
   - Navigation might happen before roles are fully loaded
   - Async state not persisting across route changes

2. **localStorage Not Persisting Role**
   - `currentRole` saved as 'STUDENT' instead of 'MENTOR'
   - RoleContext defaults to first role if saved role invalid
   - Navigation resets role to STUDENT

3. **API Call Failing Intermittently**
   - `/mentorship/profile` returns error occasionally
   - Network timeout or 429 rate limit
   - Auth token expires between pages

4. **Mentor Profile Status Issue**
   - Profile exists but status is not 'ACTIVE' or 'PENDING'
   - Status might be 'INACTIVE', 'REJECTED', or other value
   - Role detection logic excludes those statuses

5. **Route Guard Re-checking Too Early**
   - ProtectedMentorRoute checks `isMentor` before context loads
   - Loading state not properly handled
   - Brief window where isMentor = false

---

## ✅ Debug Solution Implemented

### Changes Made:

Added comprehensive logging to track the issue and help diagnose the root cause.

---

### Change 1: Enhanced RoleContext Logging

**File**: `frontend/src/contexts/RoleContext.tsx`

**Added Logs**:
```typescript
// Before mentor check
console.log('🔍 RoleContext: Checking mentor profile...');

// After API response
console.log('✅ RoleContext: Mentor response:', mentorResponse.data);
console.log('📊 RoleContext: Mentor profile status:', profile.status);

// When MENTOR role added
console.log('✨ RoleContext: MENTOR role added!');

// When MENTOR role NOT added
console.log('⚠️ RoleContext: Mentor status is', profile.status, '- not adding MENTOR role');

// On error
console.log('❌ RoleContext: Not a mentor or error:', error);

// Final roles
console.log('🎯 RoleContext: Final available roles:', roles);

// Saved role
console.log('💾 RoleContext: Saved role from localStorage:', savedRole);
console.log('✅ RoleContext: Using saved role:', savedRole);
console.log('🆕 RoleContext: Using first available role:', roles[0]);
```

**What This Shows**:
- Whether mentor API call succeeds
- What status the mentor profile has
- If MENTOR role gets added to available roles
- What role is saved/loaded from localStorage
- Complete role detection flow

---

### Change 2: ProtectedMentorRoute Logging

**File**: `frontend/src/components/ProtectedMentorRoute.tsx`

**Added Logs**:
```typescript
// On every check
console.log('🔒 ProtectedMentorRoute: Check status', { 
  loading, 
  isMentor, 
  availableRoles 
});

// When access denied
console.log('🚫 ProtectedMentorRoute: ACCESS DENIED', { 
  isMentor, 
  availableRoles, 
  loading 
});
```

**What This Shows**:
- Whether role context is still loading
- Current mentor status (true/false)
- Available roles array
- Why access was denied

---

### Change 3: Visual Debug Info on Access Denied Screen

**Added to UI**:
```typescript
<p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
  Debug: Available roles: {availableRoles?.join(', ') || 'None'}
</p>
```

**What This Shows**:
- User can see what roles were detected
- Visible confirmation of the problem
- No need to open console (but console has more details)

**Expected Values**:
- ✅ Should show: "STUDENT, MENTOR"
- ❌ Currently shows: "STUDENT" (or just "None")

---

### Change 4: Fixed "Become a Mentor" Link

**BEFORE** (Wrong):
```typescript
href="/become-a-mentor"  // This route doesn't exist
```

**AFTER** (Correct):
```typescript
href="/mentorship/register"  // Correct mentor registration route
```

**Why Fixed**:
- `/become-a-mentor` is not a valid route
- Would show 404 if clicked
- `/mentorship/register` is the actual registration page

---

## 📊 How to Diagnose the Issue

### Step 1: Open Browser Console

1. Open your browser
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Clear existing logs (trash icon)

### Step 2: Navigate to Mentor Portal

1. Go to `/mentor/dashboard` or `/mentor/mentees`
2. Watch console for logs starting with emojis:
   - 🔍 = Starting check
   - ✅ = Success
   - ❌ = Error
   - 🎯 = Final result

### Step 3: Check Role Detection

**Look for these logs**:
```
🔍 RoleContext: Checking mentor profile...
✅ RoleContext: Mentor response: { success: true, data: {...} }
📊 RoleContext: Mentor profile status: ACTIVE
✨ RoleContext: MENTOR role added!
🎯 RoleContext: Final available roles: ["STUDENT", "MENTOR"]
```

**Expected**: Should see `MENTOR role added` and final roles include "MENTOR"

### Step 4: Click "View Connection Requests"

1. Click the button
2. Watch console for:
```
🔒 ProtectedMentorRoute: Check status { loading: false, isMentor: true, ... }
```

**If Access Denied**:
```
🚫 ProtectedMentorRoute: ACCESS DENIED { 
  isMentor: false,  // ❌ This should be true!
  availableRoles: ["STUDENT"],  // ❌ Should include "MENTOR"
  loading: false 
}
```

### Step 5: Check localStorage

In console, run:
```javascript
localStorage.getItem('currentRole')
// Should return: "MENTOR"

const authStorage = JSON.parse(localStorage.getItem('auth-storage'));
console.log('User:', authStorage.state.user);
console.log('Token:', authStorage.state.token);
```

---

## 🔧 Possible Fixes Based on Console Output

### Scenario 1: Mentor API Returns 404

**Console Shows**:
```
❌ RoleContext: Not a mentor or error: AxiosError 404
```

**Problem**: Mentor profile doesn't exist or wasn't created properly

**Fix**: Re-register as mentor at `/mentorship/register`

---

### Scenario 2: Mentor Status is Not ACTIVE

**Console Shows**:
```
📊 RoleContext: Mentor profile status: PENDING
⚠️ RoleContext: Mentor status is PENDING - not adding MENTOR role
```

**Problem**: Code only allows 'ACTIVE' or 'PENDING', but logic might be wrong

**Fix**: Check if profile status should still allow access
- PENDING = Waiting for admin approval (should still have access)
- If showing PENDING, code should add MENTOR role

---

### Scenario 3: localStorage Has Wrong Role

**Console Shows**:
```
💾 RoleContext: Saved role from localStorage: STUDENT
🎯 RoleContext: Final available roles: ["STUDENT", "MENTOR"]
✅ RoleContext: Using saved role: STUDENT
```

**Problem**: Role saved as STUDENT even though MENTOR available

**Fix**: Clear localStorage and let it re-detect
```javascript
localStorage.removeItem('currentRole');
location.reload();
```

---

### Scenario 4: Token Expired

**Console Shows**:
```
❌ RoleContext: Not a mentor or error: AxiosError 401
```

**Problem**: Auth token expired between pages

**Fix**: Logout and login again
```javascript
localStorage.clear();
window.location.href = '/login';
```

---

### Scenario 5: Role Detection Works, But Navigation Fails

**Console Shows**:
```
🎯 RoleContext: Final available roles: ["STUDENT", "MENTOR"]
💾 RoleContext: Saved role from localStorage: MENTOR
✅ RoleContext: Using saved role: MENTOR

// But then when navigating:
🔒 ProtectedMentorRoute: Check status { loading: true, isMentor: false, ... }
🚫 ProtectedMentorRoute: ACCESS DENIED
```

**Problem**: Role context re-initializes on navigation, briefly shows loading=false before roles load

**Fix**: Update ProtectedMentorRoute to wait longer for context to load

---

## 🚀 Temporary Workaround

Until the root cause is fixed, users can:

### Option 1: Force Mentor Role

```javascript
// In browser console:
localStorage.setItem('currentRole', 'MENTOR');
location.reload();
```

### Option 2: Direct URL Access

Instead of clicking the button, type in address bar:
```
http://localhost:5174/mentor/connections
```

If role context is properly loaded, direct navigation should work.

### Option 3: Use Sidebar Navigation

Instead of the "View Connection Requests" button, use:
1. Look at left sidebar
2. Click "Connection Requests" in mentor sidebar
3. Should work if already in mentor portal

---

## 📁 Files Modified

| File | Change |
|------|--------|
| `RoleContext.tsx` | Added comprehensive logging for role detection flow |
| `ProtectedMentorRoute.tsx` | Added logging for access checks + visual debug info |
| Both | Fixed "Become a Mentor" link path |

---

## 🎯 Expected Behavior

### Correct Flow:

```
User clicks "View Connection Requests"
    ↓
React Router navigates to /mentor/connections
    ↓
ProtectedMentorRoute checks role context
    ↓
isMentor = true (from RoleContext)
    ↓
✅ Render MentorConnections component
    ↓
User sees pending connection requests
```

### Current Flow (Broken):

```
User clicks "View Connection Requests"
    ↓
React Router navigates to /mentor/connections
    ↓
ProtectedMentorRoute checks role context
    ↓
❌ isMentor = false (WRONG!)
    ↓
Shows "Access Denied" modal
    ↓
User frustrated
```

---

## 📚 Next Steps

1. **User Testing Required**:
   - User should test with console open
   - Copy all console logs
   - Screenshot the "Debug: Available roles" line
   - Share findings

2. **Based on Logs, We'll Implement**:
   - Permanent fix for the specific scenario
   - Better state management
   - Improved loading/caching
   - Role persistence across navigation

3. **Potential Final Fixes**:
   - Add role caching with timestamp
   - Implement role refresh on navigation
   - Better error handling for API failures
   - Optimistic UI (assume mentor if was mentor before)

---

## 🔍 Debug Checklist

When testing, provide this information:

- [ ] What shows in console for `🎯 Final available roles`?
- [ ] What shows in console for `💾 Saved role from localStorage`?
- [ ] What shows in console for `🔒 ProtectedMentorRoute: Check status`?
- [ ] What shows on screen for `Debug: Available roles:`?
- [ ] What is your mentor profile status? (ACTIVE/PENDING/other)
- [ ] Does direct URL `/mentor/connections` work?
- [ ] Does sidebar "Connection Requests" link work?
- [ ] Does the button work after page refresh?

---

## 📝 Summary

**Issue**: Mentor gets "Access Denied" when clicking "View Connection Requests"  
**Immediate Action**: Added comprehensive debugging logs  
**What to Do**: Test with console open, share console output  
**Workaround**: Use sidebar navigation or direct URL  
**Status**: Waiting for debug logs to determine root cause  

---

**Last Updated**: January 2025  
**Status**: 🔍 Debugging Phase  
**Next**: Analyze console logs and implement permanent fix  
