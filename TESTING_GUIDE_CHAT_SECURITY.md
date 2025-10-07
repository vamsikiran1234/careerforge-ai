# 🧪 Testing Guide: Chat Session Leakage Fix

## Test Environment
- **Frontend**: http://localhost:5174/
- **Backend**: http://localhost:3000/
- **Date**: October 7, 2025

---

## ✅ Test Plan

### Test 1: Verify Chat Storage is Cleared on Logout

**Steps:**
1. Open browser DevTools (F12)
2. Go to Application → Local Storage → http://localhost:5174
3. Login with `vamsikiran198@gmail.com`
4. Create 1-2 chat sessions
5. Check localStorage - you should see `chat-storage` key with your sessions
6. **Logout**
7. **Check localStorage again** - `chat-storage` key should be REMOVED
8. Check Console - should see: `✅ Cleared chat-storage on logout to prevent data leakage`

**Expected Result**: ✅ `chat-storage` is completely removed from localStorage after logout

---

### Test 2: Verify No Session Leakage Between Users

**Steps:**
1. **User A Login**:
   - Login with `vamsikiran198@gmail.com`
   - Create 3-4 new chat sessions with different questions
   - Note the session titles (e.g., "Career Goals", "Software Engineering Path")
   - Verify sessions appear in left sidebar
   
2. **User A Logout**:
   - Click Logout button
   - Verify you're redirected to login page
   - Open DevTools → Check localStorage → Verify `chat-storage` is removed

3. **User B Login**:
   - Login with a **different email** (e.g., `test@example.com` or create new account)
   - Go to AI Chat page
   - **CRITICAL CHECK**: Sidebar should be EMPTY or only show User B's own sessions
   - **VERIFY**: You should NOT see any of User A's sessions ("Career Goals", etc.)

4. **User B Create Sessions**:
   - Create 1-2 new chat sessions for User B
   - Verify only User B's sessions are visible

5. **User B Logout and User A Login Again**:
   - Logout User B
   - Login back as `vamsikiran198@gmail.com`
   - **VERIFY**: You should only see User A's original 3-4 sessions
   - You should NOT see User B's sessions

**Expected Result**: ✅ Each user only sees their own chat sessions, no cross-user data leakage

---

### Test 3: Verify Console Logs

**Steps:**
1. Open DevTools Console
2. Login as any user
3. Go to AI Chat page
4. Check console logs - should see:
   ```
   LoadSessions: Starting to load sessions...
   LoadSessions: API response: ...
   LoadSessions: Validated sessions: X sessions
   LoadSessions: Final merged sessions count: X
   ```

5. Logout
6. Check console - should see:
   ```
   ✅ Cleared chat-storage on logout to prevent data leakage
   ```

**Expected Result**: ✅ Console logs confirm proper data clearing and loading

---

### Test 4: Verify API Returns Correct Sessions

**Steps:**
1. Login as `vamsikiran198@gmail.com`
2. Open DevTools → Network tab
3. Go to AI Chat page
4. Find request to `/api/v1/chat/sessions`
5. Check response:
   - Should only contain sessions for current user
   - Verify `userId` field matches current user

**Expected Result**: ✅ API only returns sessions belonging to the authenticated user

---

### Test 5: Verify Temporary Sessions Are Preserved

**Steps:**
1. Login as any user
2. Start typing a message in AI Chat (don't send)
3. Refresh the page
4. Check if the unsent message is still there
5. Logout and login again
6. Verify the temporary session is gone

**Expected Result**: ✅ Temporary sessions work correctly but don't leak between users

---

## 🔍 What to Look For

### ✅ SUCCESS Indicators:
- `chat-storage` is removed from localStorage on logout
- Each user only sees their own chat sessions
- Console shows "Cleared chat-storage on logout"
- LoadSessions logs show correct session counts
- No mixing of sessions between users

### ❌ FAILURE Indicators:
- `chat-storage` remains in localStorage after logout
- User B sees User A's chat sessions
- Session count is higher than expected
- Sessions from previous user appear in sidebar
- Console errors related to session loading

---

## 🐛 Common Issues and Solutions

### Issue 1: Frontend not updating
**Solution**: Hard refresh (Ctrl+Shift+R) or clear browser cache

### Issue 2: Still seeing old sessions
**Solution**: 
1. Manually clear localStorage:
   ```javascript
   localStorage.clear()
   ```
2. Restart browser
3. Login again

### Issue 3: Backend returning wrong sessions
**Solution**: Check backend logs, verify JWT token, check user ID

---

## 📝 Test Results Template

```markdown
### Test Results - [Your Name] - [Date/Time]

**Test 1 - Chat Storage Cleared on Logout**
- [ ] PASS / [ ] FAIL
- Notes: ___________

**Test 2 - No Session Leakage Between Users**
- [ ] PASS / [ ] FAIL
- User A Email: ___________
- User A Sessions Created: ___
- User B Email: ___________
- User B Saw User A Sessions: YES / NO
- Notes: ___________

**Test 3 - Console Logs Correct**
- [ ] PASS / [ ] FAIL
- Notes: ___________

**Test 4 - API Returns Correct Sessions**
- [ ] PASS / [ ] FAIL
- Notes: ___________

**Test 5 - Temporary Sessions Work**
- [ ] PASS / [ ] FAIL
- Notes: ___________

**Overall Result**: PASS / FAIL

**Screenshots Attached**: [ ] YES / [ ] NO
```

---

## 🎯 Quick Test Script

If you want to test quickly, run this in the browser console:

```javascript
// 1. Check if chat-storage exists
console.log('Chat Storage:', localStorage.getItem('chat-storage'));

// 2. After logout, verify it's cleared
console.log('After Logout - Chat Storage:', localStorage.getItem('chat-storage'));
// Should log: null

// 3. Check all localStorage keys
console.log('All localStorage keys:', Object.keys(localStorage));

// 4. Manual clear if needed (for testing)
localStorage.removeItem('chat-storage');
console.log('✅ Manually cleared chat-storage');
```

---

## 📸 Evidence Collection

Please capture:
1. Screenshot of localStorage before logout (showing chat-storage)
2. Screenshot of localStorage after logout (chat-storage removed)
3. Screenshot of User B's sidebar (should not show User A's sessions)
4. Console logs showing the security messages
5. Network tab showing API response for /chat/sessions

---

## ✅ Sign-Off Checklist

- [ ] All 5 tests passed
- [ ] Tested with at least 2 different user accounts
- [ ] Verified localStorage is cleared on logout
- [ ] Verified no session leakage between users
- [ ] Console logs confirm proper behavior
- [ ] Screenshots captured
- [ ] No errors in console
- [ ] Ready for production deployment

**Tested By**: ___________________  
**Date**: ___________________  
**Status**: PASS / FAIL  

---

## 🚀 Post-Testing Actions

If all tests PASS:
1. ✅ Mark as ready for production
2. ✅ Deploy to staging first
3. ✅ Repeat tests on staging
4. ✅ Deploy to production
5. ✅ Monitor for issues

If any test FAILS:
1. ❌ Document the failure
2. ❌ Create bug report with screenshots
3. ❌ Debug and fix
4. ❌ Re-run all tests
5. ❌ Do NOT deploy to production
