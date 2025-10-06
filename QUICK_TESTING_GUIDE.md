# Quick Testing Guide - Mentor Connection Flow Fix

## ✅ What Was Fixed

### 1. **403 Error** - "You must have an active connection"
**Problem**: Button labeled "Request Connection" was directly trying to book sessions  
**Fixed**: Now properly sends connection request first, waits for approval, then allows booking

### 2. **Session Type Confusion** - Chat vs Messages
**Clarified**: 
- **Messages (Sidebar)**: Async real-time chat for quick questions anytime
- **Chat Session**: Scheduled 30/60 min mentorship session via text with agenda

---

## 🧪 How to Test

### Step 1: Request Connection (NEW FLOW)
1. Go to **Find Mentors** page
2. Click on any mentor card
3. **Look for**: Modal shows "Checking..." then appropriate button
4. **If no connection**: Button shows "Request Connection" with Users icon
5. Click "Request Connection"
6. **Expected**: BookingModal opens (NOT session booking!)
7. Fill in:
   - Message to mentor
   - Select goals (Interview Prep, etc.)
8. Click "Send Request"
9. **Expected**: 
   - Success message appears
   - Redirected to "My Connections" page
   - See connection with "PENDING" badge

### Step 2: Check Connection Status
1. Go back to **Find Mentors**
2. Click same mentor again
3. **Expected**: 
   - Button shows "Connection Pending" (disabled, with Clock icon)
   - Status message: "Your connection request is awaiting mentor approval"

### Step 3: Mentor Accepts Connection
**Using Prisma Studio** (http://localhost:5555):
1. Go to `MentorConnection` table
2. Find your connection record
3. Change `status` from `PENDING` to `ACCEPTED`
4. Set `acceptedAt` to current timestamp
5. Save changes

**OR Login as Mentor**:
1. Switch to mentor account
2. Go to notifications/connections
3. Click "Accept" on the connection request

### Step 4: Book Session (AFTER ACCEPTED)
1. As student, go to **Find Mentors**
2. Click on the ACCEPTED mentor
3. **Expected**: 
   - Button shows "Book Session" (Calendar icon)
   - Status message: "You're connected! Ready to book a session"
4. Click "Book Session"
5. **Expected**: Navigate to `/sessions/book/{mentorId}`
6. **Expected**: ✅ NO 403 ERROR!
7. **Expected**: Availability calendar loads
8. Select date, time, duration, session type
9. Click "Book Session"
10. **Expected**: ✅ Session created successfully!

---

## 🎯 What Each Button Means Now

| Connection Status | Button Text | Icon | Action | Enabled |
|------------------|-------------|------|--------|---------|
| No connection | "Request Connection" | Users | Opens BookingModal | ✅ Yes |
| PENDING | "Connection Pending" | Clock | None | ❌ No |
| ACCEPTED | "Book Session" | Calendar | Navigate to booking | ✅ Yes |
| REJECTED | "Request Declined" | X | None | ❌ No |
| Fully booked | "Fully Booked" | Calendar | None | ❌ No |

---

## 📊 Database States to Check

### In Prisma Studio (http://localhost:5555)

**MentorConnection Table**:
- `status`: Must be `ACCEPTED` for booking to work
- `mentorId`: ID of the mentor
- `studentId`: Your user ID
- `acceptedAt`: Should have timestamp when accepted

**MentorSession Table** (after booking):
- `mentorId`: Mentor's profile ID
- `studentId`: Your user ID  
- `status`: Should be `SCHEDULED`
- `meetingLink`: Should have Jitsi URL
- `scheduledAt`: Your selected date/time

---

## 🐛 If You Still See Errors

### Console Logs to Check
Open browser DevTools (F12) → Console:

**When opening mentor profile**:
```javascript
// Should see connection status check
🔍 Checking connection status for mentor: {mentorId}
✅ Connection found: ACCEPTED
// OR
ℹ️ No existing connection found
```

**When clicking button**:
- "Request Connection" → Opens modal, no navigation
- "Book Session" → Navigates to `/sessions/book/{mentorId}`
- Pending/Declined → No action (button disabled)

### Backend Logs to Check
Look in backend terminal for:

**Connection Request**:
```
POST /api/v1/mentorship/connections/request
Status: 200
Connection created with status: PENDING
```

**Session Booking**:
```
POST /api/v1/sessions/book
Checking connection for student: {studentId} with mentor: {mentorId}
✅ Connection found: ACCEPTED
Session created successfully
```

### Common Issues

**Issue 1: Still seeing 403**
- Check connection status in database
- Must be `ACCEPTED`, not `PENDING`
- Refresh browser after changing status

**Issue 2: Button still says "Request Connection" but connection exists**
- Hard refresh browser (Ctrl+Shift+R)
- Check console for connection fetch errors
- Verify token is valid

**Issue 3: BookingModal not opening**
- Check console for errors
- Verify `handleRequestConnection` is being called
- Check if `showBooking` state is updating

---

## ✅ Success Criteria

### ✅ Connection Request Works
- [ ] Button labeled correctly based on status
- [ ] Opens BookingModal (not session booking)
- [ ] Can send connection request
- [ ] Redirects to "My Connections"
- [ ] Shows PENDING status

### ✅ Pending State Shows
- [ ] Button disabled with "Connection Pending"
- [ ] Clock icon displayed
- [ ] Status message shown
- [ ] Cannot navigate to booking

### ✅ Session Booking Works (After Acceptance)
- [ ] Button changes to "Book Session"
- [ ] Calendar icon displayed
- [ ] Status message shows "You're connected!"
- [ ] Navigates to booking page
- [ ] ✅ NO 403 ERROR
- [ ] Calendar loads with availability
- [ ] Can select time and book successfully

---

## 🎓 Professional Flow Achieved

### Before (BROKEN):
```
Find Mentor → Click "Request Connection" → ❌ 403 Error
```

### After (PROFESSIONAL):
```
Find Mentor 
  → Request Connection (BookingModal)
  → Wait for Approval (PENDING)
  → Connection Accepted 
  → Book Session (SessionBooking)
  → ✅ Success!
```

---

## 📞 Need Help?

If testing reveals issues:

1. **Check browser console** - Any errors?
2. **Check backend terminal** - Any 403/500 errors?
3. **Open Prisma Studio** - Verify connection status
4. **Screenshot the error** - Share for debugging
5. **Check network tab** - What API calls are made?

---

## 🚀 What's Next

After confirming this works:

1. **Test with real mentor approval** (not Prisma edit)
2. **Test the complete session lifecycle**:
   - Book session
   - Join session (Jitsi link)
   - Complete session
   - Leave review
3. **Test edge cases**:
   - Rejected connections
   - Mentor at capacity
   - Booking conflicts

---

**Servers Running**:
- ✅ Backend: http://localhost:3000
- ✅ Frontend: http://localhost:5173
- ✅ Prisma Studio: http://localhost:5555

**Ready to test!** 🎉
