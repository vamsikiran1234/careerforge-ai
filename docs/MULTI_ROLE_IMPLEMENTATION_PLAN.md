# Multi-Role System Implementation Plan

## Overview
Implement a professional multi-role system allowing a single user to have multiple roles simultaneously (e.g., ADMIN + STUDENT). This enables administrators to test the platform as students without needing separate accounts.

## Current System Analysis

### Current Implementation
- **Database**: `role String @default("STUDENT")` - Single role per user
- **JWT Token**: Contains `role` (string)
- **Backend Middleware**: Checks `req.user.role === 'ADMIN'`
- **Frontend**: Checks `user?.role === 'ADMIN'`

### Limitations
- ❌ Cannot have multiple roles per user
- ❌ Admins need separate accounts to test student features
- ❌ Mentors who become admins lose student access

## Proposed Solution

### Architecture Overview
```
User Model
  ├─ roles: String[] (array of roles)
  ├─ Default: ["STUDENT"]
  └─ Possible values: ["STUDENT", "MENTOR", "ADMIN"]

JWT Token
  ├─ roles: string[] (array)
  └─ Backward compatible check

Middleware
  ├─ hasRole(role) - Check if user has specific role
  ├─ hasAnyRole([roles]) - Check if user has any of the roles
  └─ hasAllRoles([roles]) - Check if user has all roles
```

## Implementation Steps

### Phase 1: Database Migration (BREAKING CHANGE)

**1.1 Update Prisma Schema**
```prisma
model User {
  // Change from: role String @default("STUDENT")
  // Change to: roles String @default("STUDENT") // JSON array ["STUDENT"]
  roles String @default("STUDENT") // Stored as JSON string: '["STUDENT"]'
}
```

**1.2 Create Migration Script**
```javascript
// scripts/migrateToMultiRole.js
- Read all users
- Convert role string to roles array: "STUDENT" → '["STUDENT"]'
- Update database
- Backup old role field
```

### Phase 2: Backend Updates

**2.1 Update JWT Token Generation**
```javascript
// src/controllers/authController.js
const token = jwt.sign({
  userId: user.id,
  email: user.email,
  roles: JSON.parse(user.roles) // Convert JSON string to array
}, JWT_SECRET);
```

**2.2 Update Authentication Middleware**
```javascript
// src/middlewares/authMiddleware.js
const hasRole = (role) => (req, res, next) => {
  if (!req.user?.roles?.includes(role)) {
    return res.status(403).json({...});
  }
  next();
};

const hasAnyRole = (roles) => (req, res, next) => {
  if (!req.user?.roles?.some(r => roles.includes(r))) {
    return res.status(403).json({...});
  }
  next();
};
```

**2.3 Update Admin Middleware**
```javascript
// src/middlewares/adminMiddleware.js
const isAdmin = hasRole('ADMIN');
```

**2.4 Update Controllers**
- authController.js: Token generation, user info
- mentorshipController.js: Role checks in mentor registration
- analyticsController.js: Already uses isAdmin middleware

### Phase 3: Frontend Updates

**3.1 Update Type Definitions**
```typescript
// frontend/src/types/index.ts
interface User {
  id: string;
  email: string;
  name: string;
  roles: string[]; // Changed from role: string
  avatar?: string;
  bio?: string;
}
```

**3.2 Create Role Helper Functions**
```typescript
// frontend/src/utils/roleHelpers.ts
export const hasRole = (user: User | null, role: string): boolean => {
  return user?.roles?.includes(role) ?? false;
};

export const hasAnyRole = (user: User | null, roles: string[]): boolean => {
  return user?.roles?.some(r => roles.includes(r)) ?? false;
};

export const hasAllRoles = (user: User | null, roles: string[]): boolean => {
  return roles.every(r => user?.roles?.includes(r)) ?? false;
};

export const isAdmin = (user: User | null): boolean => hasRole(user, 'ADMIN');
export const isStudent = (user: User | null): boolean => hasRole(user, 'STUDENT');
export const isMentor = (user: User | null): boolean => hasRole(user, 'MENTOR');
```

**3.3 Update Components**
```typescript
// Sidebar.tsx
const isAdmin = hasRole(user, 'ADMIN');

// SettingsPage.tsx
{hasRole(user, 'ADMIN') && (
  <AdminSettings />
)}

// Mentor Registration
{!hasRole(user, 'MENTOR') && (
  <RegisterButton />
)}
```

**3.4 Update Zustand Store**
```typescript
// frontend/src/store/auth.ts
interface User {
  roles: string[]; // Changed from role
}
```

### Phase 4: Utility Scripts

**4.1 Role Management Scripts**
```javascript
// scripts/addRole.js
// Usage: node scripts/addRole.js vamsikiran198@gmail.com ADMIN

// scripts/removeRole.js
// Usage: node scripts/removeRole.js vamsikiran198@gmail.com STUDENT

// scripts/listUserRoles.js
// Usage: node scripts/listUserRoles.js vamsikiran198@gmail.com

// scripts/makeAdminStudent.js
// Quick script to give user both ADMIN and STUDENT roles
```

## Migration Strategy

### Step 1: Preparation
1. ✅ Backup database: `cp prisma/dev.db prisma/dev.db.backup`
2. ✅ Document current users and roles
3. ✅ Test migration script on copy

### Step 2: Database Migration
1. Update Prisma schema
2. Create migration: `npx prisma migrate dev --name multi_role_support`
3. Run migration script: `node scripts/migrateToMultiRole.js`
4. Verify all users have roles array

### Step 3: Backend Deployment
1. Update middleware files
2. Update controllers
3. Update JWT token generation
4. Test all endpoints with Postman

### Step 4: Frontend Deployment
1. Update type definitions
2. Create role helper utilities
3. Update all components
4. Test all role-based UI elements

### Step 5: Validation
1. Test ADMIN-only user
2. Test STUDENT-only user
3. Test ADMIN+STUDENT user (your case)
4. Test role-based navigation
5. Test role-based API access

## Benefits

✅ **Flexibility**: Single user can have multiple roles
✅ **Testing**: Admins can test as students without separate accounts
✅ **Scalability**: Easy to add new roles in future
✅ **Security**: Same permission model, just more flexible
✅ **Backward Compatible**: Can still check for single role

## Security Considerations

🔒 **Role Assignment**: Only admins can add/remove roles
🔒 **JWT Validation**: Roles verified on every request
🔒 **Middleware Protection**: All admin routes protected
🔒 **Frontend Guards**: UI adapts to user's roles

## Timeline Estimate

- Phase 1 (Database): 30 minutes
- Phase 2 (Backend): 1 hour
- Phase 3 (Frontend): 1 hour
- Phase 4 (Scripts): 30 minutes
- Testing: 1 hour

**Total: ~4 hours** for complete implementation

## Rollback Plan

If issues occur:
1. Restore database: `cp prisma/dev.db.backup prisma/dev.db`
2. Revert code changes via git
3. Restart services

## Post-Implementation

1. Update all documentation
2. Create user guide for role management
3. Add role management to admin panel UI
4. Monitor for any permission issues
