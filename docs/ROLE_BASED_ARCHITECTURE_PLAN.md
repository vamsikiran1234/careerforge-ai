# Role-Based Architecture Implementation Plan
## CareerForge AI - Multi-Role User Experience

**Date**: January 2025  
**Status**: 📋 PLANNING → IMPLEMENTATION  
**Priority**: 🔴 CRITICAL  
**Estimated Time**: 3-4 days  

---

## 🎯 Executive Summary

### Problem Statement
Users with multiple roles (Student, Mentor, Admin) experience confusion due to:
- Mixed navigation items from all roles in one sidebar
- No clear indication of current context/mode
- Overwhelming UI with irrelevant features
- Poor UX leading to user frustration

### Solution Overview
**Hybrid Architecture: Role Switcher + Dedicated Mentor Portal**

1. **Role Switcher Component** - Toggle between modes in header
2. **Separate Mentor Portal** - Dedicated layout at `/mentor/*`
3. **Context-Aware Navigation** - Sidebar adapts to current role
4. **Persistent Role Memory** - Remember last selected role
5. **Smooth Transitions** - Seamless switching experience

---

## 📐 Architecture Design

### URL Structure
```
┌─────────────────────────────────────────────────────────────┐
│  STUDENT AREA (Default)                                     │
│  URL: /                                                      │
│  ├─ /dashboard          → Student Dashboard                 │
│  ├─ /chat               → AI Career Chat                    │
│  ├─ /quiz               → Assessment Quiz                   │
│  ├─ /mentors            → Find Mentors                      │
│  ├─ /connections        → My Connections (student view)     │
│  └─ /messages           → Chat with Mentors                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  MENTOR PORTAL                                               │
│  URL: /mentor/*                                              │
│  ├─ /mentor/dashboard        → Mentor Dashboard             │
│  ├─ /mentor/connections      → Connection Requests          │
│  ├─ /mentor/mentees          → My Mentees                   │
│  ├─ /mentor/sessions         → Session Management           │
│  ├─ /mentor/availability     → Set Availability             │
│  ├─ /mentor/earnings         → Earnings & Analytics         │
│  └─ /mentor/profile          → Mentor Profile Settings      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ADMIN AREA (Embedded in Main App)                          │
│  URL: /admin/*                                               │
│  ├─ /admin/dashboard         → Admin Dashboard              │
│  ├─ /admin/verify-mentors    → Verify Mentors               │
│  ├─ /admin/users             → User Management              │
│  ├─ /admin/analytics         → Platform Analytics           │
│  └─ /admin/settings          → System Settings              │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy
```
App.tsx
├─ Header (with RoleSwitcher)
│  ├─ Logo
│  ├─ Search (student area only)
│  ├─ RoleSwitcher (dropdown)
│  ├─ Notifications
│  └─ UserMenu
│
├─ MainLayout (Student + Admin)
│  ├─ Sidebar (Student/Admin navigation)
│  └─ Outlet (page content)
│
└─ MentorPortalLayout (Mentor only)
   ├─ MentorSidebar (Mentor navigation)
   └─ Outlet (page content)
```

---

## 🔧 Technical Implementation Details

### Phase 1: Core Infrastructure (Day 1)

#### 1.1 Create Role Context
**File**: `frontend/src/contexts/RoleContext.tsx`

```typescript
interface RoleContextType {
  currentRole: 'STUDENT' | 'MENTOR' | 'ADMIN';
  availableRoles: Array<'STUDENT' | 'MENTOR' | 'ADMIN'>;
  switchRole: (role: 'STUDENT' | 'MENTOR' | 'ADMIN') => void;
  isMentor: boolean;
  isAdmin: boolean;
  isStudent: boolean;
}
```

**Features:**
- Detect user's available roles on mount
- Store current role in localStorage: `currentRole`
- Provide easy role checking helpers
- Emit role change events for navigation updates

#### 1.2 Create Role Switcher Component
**File**: `frontend/src/components/RoleSwitcher.tsx`

**Design:**
```
┌─────────────────────────────┐
│  🎓 Student Mode      ▼     │  ← Current role badge
└─────────────────────────────┘
        ↓ Click opens dropdown
┌─────────────────────────────┐
│  Switch to:                 │
│  ✓ 🎓 Student               │  ← Current (checkmark)
│    👨‍🏫 Mentor Portal          │
│    🛡️ Admin Tools            │
└─────────────────────────────┘
```

**Features:**
- Shows current role with icon and label
- Dropdown lists all available roles
- Current role has checkmark
- Unavailable roles are greyed out
- Smooth transition animation
- Redirects to appropriate dashboard on switch

#### 1.3 Role Detection Service
**File**: `frontend/src/services/roleService.ts`

**Functions:**
```typescript
async function detectUserRoles(userId: string): Promise<UserRoles>
async function checkIsMentor(token: string): Promise<boolean>
async function checkIsAdmin(token: string): Promise<boolean>
```

**Logic:**
- Check if user has mentor profile → Add MENTOR role
- Check user.roles array → Add ADMIN role if exists
- All users have STUDENT role by default

---

### Phase 2: Mentor Portal Layout (Day 1-2)

#### 2.1 Create Mentor Portal Layout
**File**: `frontend/src/layouts/MentorPortalLayout.tsx`

**Features:**
- Separate layout specifically for mentors
- Different color scheme (professional blue/purple)
- Mentor-focused header with earnings widget
- Mentor sidebar with portal-specific navigation
- Dashboard stats always visible

#### 2.2 Create Mentor Sidebar
**File**: `frontend/src/components/MentorSidebar.tsx`

**Navigation Items:**
```typescript
const mentorNavigation = [
  {
    name: 'Dashboard',
    href: '/mentor/dashboard',
    icon: LayoutDashboard,
    badge: null
  },
  {
    name: 'Connection Requests',
    href: '/mentor/connections',
    icon: MailPlus,
    badge: pendingCount // Dynamic
  },
  {
    name: 'My Mentees',
    href: '/mentor/mentees',
    icon: Users,
    badge: activeMenteesCount
  },
  {
    name: 'Sessions',
    href: '/mentor/sessions',
    icon: Calendar,
    badge: upcomingSessionsCount
  },
  {
    name: 'Availability',
    href: '/mentor/availability',
    icon: Clock,
    badge: null
  },
  {
    name: 'Earnings',
    href: '/mentor/earnings',
    icon: DollarSign,
    badge: null
  },
  {
    name: 'Profile',
    href: '/mentor/profile',
    icon: Settings,
    badge: null
  }
];
```

#### 2.3 Create Mentor Dashboard
**File**: `frontend/src/pages/mentor/MentorDashboard.tsx`

**Sections:**
- Quick Stats Cards (Earnings, Mentees, Sessions, Reviews)
- Pending Requests Widget
- Upcoming Sessions Calendar
- Recent Activity Feed
- Earnings Chart (last 30 days)

---

### Phase 3: Update Main Layout (Day 2)

#### 3.1 Update Main Sidebar
**File**: `frontend/src/components/Sidebar.tsx`

**Changes:**
- Remove role-based conditionals (already implemented)
- Keep only Student + Admin navigation
- Remove mentor-specific items
- Mentor items moved to MentorSidebar

**Student Navigation:**
```typescript
const studentNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'AI Career Chat', href: '/chat', icon: MessageSquare },
  { name: 'Assessment Quiz', href: '/quiz', icon: FileQuestion },
  { name: 'Find Mentors', href: '/mentors', icon: Users },
  { name: 'My Connections', href: '/connections', icon: UserCheck },
  { name: 'Messages', href: '/messages', icon: Mail },
];
```

**Admin Navigation:**
```typescript
const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin/dashboard', icon: Shield },
  { name: 'Verify Mentors', href: '/admin/verify-mentors', icon: UserCheck, badge: pendingCount },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
];
```

#### 3.2 Update Header Component
**File**: `frontend/src/components/Header.tsx`

**Changes:**
- Add RoleSwitcher component to right side
- Position: Between search and notifications
- Show only if user has multiple roles
- Hide on mobile (show in menu instead)

---

### Phase 4: Routing Configuration (Day 2-3)

#### 4.1 Update App.tsx Routes
**File**: `frontend/src/App.tsx`

**New Route Structure:**
```tsx
<Routes>
  {/* Public Routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  
  {/* Protected Routes - Main Layout (Student + Admin) */}
  <Route element={<MainLayout />}>
    {/* Student Routes */}
    <Route path="/" element={<Navigate to="/dashboard" />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/chat" element={<Chat />} />
    <Route path="/quiz" element={<Quiz />} />
    <Route path="/mentors" element={<FindMentors />} />
    <Route path="/connections" element={<MyConnections />} />
    <Route path="/messages" element={<Messages />} />
    
    {/* Admin Routes */}
    <Route path="/admin/*" element={<AdminRoutes />} />
  </Route>
  
  {/* Protected Routes - Mentor Portal Layout */}
  <Route element={<ProtectedMentorRoute />}>
    <Route element={<MentorPortalLayout />}>
      <Route path="/mentor" element={<Navigate to="/mentor/dashboard" />} />
      <Route path="/mentor/dashboard" element={<MentorDashboard />} />
      <Route path="/mentor/connections" element={<MentorConnections />} />
      <Route path="/mentor/mentees" element={<MentorMentees />} />
      <Route path="/mentor/sessions" element={<MentorSessions />} />
      <Route path="/mentor/availability" element={<MentorAvailability />} />
      <Route path="/mentor/earnings" element={<MentorEarnings />} />
      <Route path="/mentor/profile" element={<MentorProfile />} />
    </Route>
  </Route>
</Routes>
```

#### 4.2 Create Protected Mentor Route
**File**: `frontend/src/components/ProtectedMentorRoute.tsx`

**Logic:**
- Check if user has mentor profile
- If not, redirect to `/become-a-mentor`
- If mentor but not approved, show pending message
- If approved, allow access

---

### Phase 5: UX Enhancements (Day 3)

#### 5.1 Role Switch Transition
**Features:**
- Smooth page transition animation
- Loading state during navigation
- Toast notification: "Switched to Mentor Mode"
- Persist last visited page per role

#### 5.2 Breadcrumb Updates
**Component**: `frontend/src/components/Breadcrumb.tsx`

**Examples:**
- Student: `Home > Find Mentors > John Doe`
- Mentor: `Mentor Portal > Dashboard`
- Admin: `Admin > Verify Mentors`

#### 5.3 Visual Indicators
- **Student Mode**: Blue theme (`bg-blue-50`)
- **Mentor Mode**: Purple theme (`bg-purple-50`)
- **Admin Mode**: Red theme (`bg-red-50`)

#### 5.4 Mobile Responsive
- Role switcher in mobile menu
- Swipe to switch between portals
- Bottom navigation for mobile

---

### Phase 6: Data & State Management (Day 3-4)

#### 6.1 Role-Specific Data Fetching
**Service**: `frontend/src/services/dataService.ts`

```typescript
// Fetch different data based on role
if (currentRole === 'STUDENT') {
  fetchStudentDashboardData();
  fetchMyConnections();
} else if (currentRole === 'MENTOR') {
  fetchMentorDashboardData();
  fetchPendingRequests();
  fetchUpcomingSessions();
}
```

#### 6.2 Update Auth Store
**File**: `frontend/src/store/authStore.ts`

**Add:**
```typescript
interface AuthState {
  // ... existing fields
  currentRole: 'STUDENT' | 'MENTOR' | 'ADMIN';
  availableRoles: string[];
  setCurrentRole: (role: string) => void;
}
```

---

## 📋 Implementation Checklist

### Day 1: Foundation
- [ ] Create RoleContext provider
- [ ] Create RoleSwitcher component
- [ ] Create roleService for detection
- [ ] Create MentorPortalLayout
- [ ] Create MentorSidebar
- [ ] Test role detection logic

### Day 2: Portal & Routing
- [ ] Create MentorDashboard page
- [ ] Update App.tsx routing structure
- [ ] Create ProtectedMentorRoute
- [ ] Update Header with RoleSwitcher
- [ ] Update main Sidebar (remove mentor items)
- [ ] Test navigation between portals

### Day 3: Pages & Polish
- [ ] Create remaining mentor pages:
  - [ ] MentorMentees.tsx
  - [ ] MentorSessions.tsx
  - [ ] MentorAvailability.tsx
  - [ ] MentorEarnings.tsx
  - [ ] MentorProfile.tsx
- [ ] Add transition animations
- [ ] Add breadcrumbs
- [ ] Mobile responsive testing

### Day 4: Testing & Refinement
- [ ] Test all role combinations:
  - [ ] Student only
  - [ ] Mentor only (new registration)
  - [ ] Student + Mentor
  - [ ] Student + Admin
  - [ ] All three roles
- [ ] Test role switching
- [ ] Test protected routes
- [ ] Test persistence (localStorage)
- [ ] Fix any bugs
- [ ] Update documentation

---

## 🎨 Design Specifications

### Color Themes by Role

**Student Mode:**
```css
--primary: #3B82F6 (blue-500)
--sidebar-bg: #F0F9FF (blue-50)
--accent: #60A5FA (blue-400)
```

**Mentor Mode:**
```css
--primary: #8B5CF6 (purple-500)
--sidebar-bg: #FAF5FF (purple-50)
--accent: #A78BFA (purple-400)
```

**Admin Mode:**
```css
--primary: #EF4444 (red-500)
--sidebar-bg: #FEF2F2 (red-50)
--accent: #F87171 (red-400)
```

### Role Switcher Design
```
┌─────────────────────────────────┐
│  Icon  Label            Arrow   │
│  🎓    Student Mode      ▼      │
└─────────────────────────────────┘
   14px   16px font-medium  12px
```

**Dropdown:**
```
┌─────────────────────────────────┐
│  🎓  Student             ✓      │  ← Current
│  👨‍🏫  Mentor Portal              │
│  🛡️  Admin Tools                │
└─────────────────────────────────┘
  Hover: bg-gray-100 dark:bg-gray-800
  Disabled: opacity-50, cursor-not-allowed
```

---

## 🔒 Security Considerations

### 1. Route Protection
- Verify mentor status server-side on all `/mentor/*` endpoints
- Check admin role server-side on all `/admin/*` endpoints
- JWT token validation on every protected route

### 2. Role Verification
- Never trust frontend role state alone
- Always verify with backend API
- Cache role status for 5 minutes only
- Re-verify on critical actions

### 3. Data Isolation
- Mentors can only see their own mentees
- Students can only see their own connections
- Admins have full access (with audit log)

---

## 📊 Success Metrics

### User Experience
- ✅ Clear role indication at all times
- ✅ < 1 second role switch time
- ✅ Zero navigation confusion
- ✅ Mobile responsive on all devices

### Technical
- ✅ No route conflicts
- ✅ Proper role-based data fetching
- ✅ Protected routes working correctly
- ✅ Persistent role memory across sessions

### Business
- ✅ Increased mentor engagement
- ✅ Reduced support tickets about navigation
- ✅ Higher student satisfaction scores
- ✅ Better conversion (student → mentor)

---

## 🚀 Rollout Plan

### Stage 1: Development (Local)
- Build and test all components locally
- Verify all role combinations
- Test with real data

### Stage 2: Staging (Test Server)
- Deploy to staging environment
- Invite beta testers (5-10 users with multiple roles)
- Collect feedback
- Fix critical issues

### Stage 3: Production (Gradual)
- Deploy to production
- Monitor error logs
- Watch user behavior analytics
- Quick rollback plan ready

---

## 🐛 Known Challenges & Solutions

### Challenge 1: Role Detection on First Login
**Problem**: New users don't have role preferences set  
**Solution**: Default to STUDENT, show onboarding modal to set preference

### Challenge 2: Switching Mid-Flow
**Problem**: User is filling a form in student mode, switches to mentor  
**Solution**: Show confirmation modal: "You have unsaved changes. Switch anyway?"

### Challenge 3: Deep Links
**Problem**: User receives email link to `/mentor/connections` but is in student mode  
**Solution**: Auto-switch to mentor mode when accessing mentor URLs

### Challenge 4: Mobile Navigation
**Problem**: Role switcher takes up space on small screens  
**Solution**: Move to hamburger menu on mobile, show current role badge only

---

## 📚 File Structure

```
frontend/src/
├── contexts/
│   └── RoleContext.tsx                    (NEW)
│
├── components/
│   ├── RoleSwitcher.tsx                   (NEW)
│   ├── MentorSidebar.tsx                  (NEW)
│   ├── ProtectedMentorRoute.tsx           (NEW)
│   ├── Header.tsx                         (UPDATE)
│   └── Sidebar.tsx                        (UPDATE)
│
├── layouts/
│   ├── MainLayout.tsx                     (EXISTS)
│   └── MentorPortalLayout.tsx             (NEW)
│
├── pages/
│   ├── mentor/
│   │   ├── MentorDashboard.tsx            (NEW)
│   │   ├── MentorMentees.tsx              (NEW)
│   │   ├── MentorSessions.tsx             (NEW)
│   │   ├── MentorAvailability.tsx         (NEW)
│   │   ├── MentorEarnings.tsx             (NEW)
│   │   └── MentorProfile.tsx              (NEW)
│   └── ... (existing pages)
│
├── services/
│   └── roleService.ts                     (NEW)
│
└── App.tsx                                (UPDATE)
```

---

## 🎓 Developer Notes

### Best Practices
1. Always use `useRole()` hook instead of checking localStorage directly
2. Use `RoleGuard` component for conditional rendering
3. Test role switching on every new feature
4. Keep role-specific logic in services, not components

### Code Conventions
```typescript
// Good ✅
const { currentRole, isMentor } = useRole();
if (isMentor) { ... }

// Bad ❌
const role = localStorage.getItem('currentRole');
if (role === 'MENTOR') { ... }
```

### Testing Requirements
- Unit tests for role detection
- Integration tests for role switching
- E2E tests for complete user flows
- Visual regression tests for each role theme

---

## 📞 Support & Maintenance

### Documentation Updates Needed
- [ ] Update user guide with role switching instructions
- [ ] Update API documentation with role-based endpoints
- [ ] Update developer onboarding docs
- [ ] Create video tutorial for role switching

### Monitoring
- Track role switch frequency (analytics)
- Monitor errors in role detection
- Watch performance of role-specific pages
- A/B test different role switcher positions

---

## ✅ Definition of Done

This feature is complete when:
- [ ] All checklist items are completed
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Code review approved
- [ ] QA testing completed
- [ ] Documentation updated
- [ ] Deployed to production
- [ ] No critical bugs for 48 hours
- [ ] User feedback is positive (>80% satisfaction)

---

**Status**: 📋 READY FOR IMPLEMENTATION  
**Next Step**: Create RoleContext and RoleSwitcher component  
**Estimated Completion**: 3-4 days from start  

Let's build this! 🚀
