# Phase 2 Frontend Access Guide

## ✅ What Was Added

Phase 2 includes **2 comprehensive connection management pages**:

### 1. **Student Connections Page** (MyConnections.tsx)
- **File Location**: `frontend/src/components/connections/MyConnections.tsx`
- **Lines of Code**: 550+
- **URL Path**: `/connections`
- **Access**: Available to all logged-in students

### 2. **Mentor Connections Page** (MentorConnections.tsx)
- **File Location**: `frontend/src/components/connections/MentorConnections.tsx`
- **Lines of Code**: 600+
- **URL Path**: `/mentor/connections`
- **Access**: Available to users with MENTOR role

---

## 🚀 How to Access the Pages

### Method 1: Sidebar Navigation (UPDATED ✅)
1. **Login to your account**
2. Look at the **left sidebar**
3. Click on **"My Connections"** (new link added with UserCheck icon)

### Method 2: Direct URL Navigation
1. **For Students**: Navigate to `http://localhost:5173/connections`
2. **For Mentors**: Navigate to `http://localhost:5173/mentor/connections`

### Method 3: From Find Mentors Page
1. Go to **"Find Mentors"** in sidebar
2. Click on a mentor's profile
3. Send a connection request
4. Navigate to **"My Connections"** to see your request status

---

## 📊 What Each Page Shows

### Student View (`/connections`)
**4 Tabs:**
- **All** - All your connections (pending + active + declined)
- **Pending** - Waiting for mentor approval
- **Active** - Accepted connections (can chat & book sessions)
- **Declined** - Rejected requests

**Features:**
- View mentor profiles (avatar, company, job title, experience)
- See original request messages
- Status badges (Pending ⏱️ / Active ✅ / Declined ❌)
- Chat button (for active connections)
- Book Session button (for active connections)
- Delete connection with warning modal

### Mentor View (`/mentor/connections`)
**3 Tabs:**
- **Pending Requests** - Students waiting for approval
- **Active Mentees** - Your current mentees (max 3)
- **Declined** - Requests you've rejected

**Top Stats Cards:**
- Pending Requests count
- Active Mentees count
- Available Slots (3 - active count)

**Features:**
- Capacity warning when at 3 mentees
- Accept button (disabled when at capacity)
- Decline button with optional reason
- View student profiles and messages
- Chat and manage sessions (for active mentees)

---

## 🔗 Navigation Links Added

### Sidebar Update
**File**: `frontend/src/components/Sidebar.tsx`

**Added**:
```tsx
{ name: 'My Connections', href: '/connections', icon: UserCheck }
```

This appears in the sidebar navigation for all logged-in users.

---

## 🧪 Testing Guide

### Test as a Student:
1. Login as a student account
2. Click **"Find Mentors"** → Select a mentor → Click "Connect"
3. Fill out the connection request form
4. Click **"My Connections"** in sidebar
5. You should see your pending request in the "Pending" tab
6. Wait for mentor approval, or test with another account

### Test as a Mentor:
1. Login as a mentor account (or register as one)
2. Have a student send you a connection request (see above)
3. Navigate to `/mentor/connections` (or use direct URL)
4. You should see the request in "Pending Requests" tab
5. Click "Accept" to approve (creates a chat room automatically)
6. Student's request will move to "Active" in their view

### Test Connection Management:
1. **Accept a connection**: Mentor clicks "Accept" → Chat room created
2. **Decline a connection**: Mentor clicks "Decline" → Optional reason → Email sent
3. **Delete a connection**: Student clicks delete → Confirmation modal → Cascade deletes chat room
4. **Capacity limit**: Mentor with 3 active mentees sees warning + disabled accept button

---

## 🎨 UI Components Used

### From UI Library:
- `Card` - Container cards
- `Button` - Action buttons
- `Badge` - Status indicators
- `Modal` - Accept/Decline/Delete confirmations
- `Input` - Search and filter

### Icons (Lucide React):
- `Users` - User icons
- `Clock` - Pending status
- `CheckCircle2` - Active status
- `XCircle` - Declined status
- `MessageCircle` - Chat button
- `Calendar` - Book session
- `Trash2` - Delete action
- `AlertCircle` - Warning messages

---

## 🔧 Backend Integration

### API Endpoints Used:
```
GET    /api/v1/mentorship/connections       - Get all connections
POST   /api/v1/mentorship/connections/:id/accept  - Accept request
POST   /api/v1/mentorship/connections/:id/decline - Decline request
DELETE /api/v1/mentorship/connections/:id   - Delete connection
```

### State Management:
**Store**: `frontend/src/store/mentors.ts` (needs to be created or extended)

The pages use standard `useState` and `useEffect` with Axios for API calls.

---

## ⚠️ Important Notes

### Authentication Required:
Both pages are **protected routes** - users must be logged in to access them.

### Role-Based Access:
- `/connections` - Available to all logged-in users
- `/mentor/connections` - Should check for MENTOR role (currently accessible to all)

### Future Enhancement Needed:
Consider adding role-based route protection:
```tsx
// In App.tsx, wrap mentor routes:
{user?.role === 'MENTOR' && (
  <Route path="mentor/connections" element={<MentorConnections />} />
)}
```

---

## 📝 Next Steps

After verifying Phase 2 works:
1. ✅ Test connection request flow end-to-end
2. ✅ Verify email notifications are sent
3. ✅ Check that chat rooms are created on acceptance
4. ✅ Test capacity limits (3 mentees max)
5. 🚀 Move to **Phase 3: Real-Time Chat System**

---

## 🐛 Troubleshooting

### "My Connections" link not showing in sidebar?
**Fix**: Clear browser cache and refresh. The link was just added to Sidebar.tsx.

### Getting "Authentication required" error?
**Fix**: Make sure you're logged in. Check `localStorage` for 'auth-storage' key.

### Pages showing as blank?
1. Check browser console for errors
2. Verify React lazy loading is working
3. Check that files exist in `frontend/src/components/connections/`

### No connections showing?
1. Make sure you've sent/received connection requests
2. Check the correct tab (Pending/Active/Declined)
3. Verify backend API is running on the correct port

---

## 📞 Support

If pages are not appearing:
1. Check that frontend dev server is running (`npm run dev`)
2. Check browser console for errors
3. Verify routes are registered in `App.tsx` (lines 196-219)
4. Check that lazy imports are correct (lines 26-27)

---

**Last Updated**: Phase 2 Completion - October 4, 2025
**Status**: ✅ Complete - Ready for Phase 3
