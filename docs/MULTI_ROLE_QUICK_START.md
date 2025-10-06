# Multi-Role System - Quick Start Guide

## ✅ Implementation Complete!

Your CareerForge AI platform now supports **multiple roles per user**! The same user can be both **ADMIN and STUDENT** simultaneously.

---

## 🎉 What's Been Done

### ✅ Database Migration
- ✅ Backup created: `prisma/dev.db.backup`
- ✅ Schema updated: `role` String → `roles` String (JSON array)
- ✅ Migration applied: All existing users migrated to new format
- ✅ Prisma client regenerated

### ✅ Backend Updates
- ✅ JWT tokens now include `roles` array
- ✅ Auth middleware updated to check roles array
- ✅ Admin middleware updated for multi-role support
- ✅ Login/Register endpoints return roles in user object

### ✅ Frontend Updates
- ✅ User type updated to use `roles: string[]`
- ✅ Role helper utilities created (`roleHelpers.ts`)
- ✅ Sidebar updated to use role helpers
- ✅ Settings page updated to display multiple role badges

### ✅ Utility Scripts Created
- ✅ `scripts/addRole.js` - Add a role to a user
- ✅ `scripts/removeRole.js` - Remove a role from a user
- ✅ `scripts/listUserRoles.js` - List user roles
- ✅ `scripts/makeAdminStudent.js` - Quick script for ADMIN+STUDENT

---

## 🚀 Your Current Status

**User:** Vamsi Kiran (vamsikiran198@gmail.com)
**Roles:** ADMIN + STUDENT ✅

You now have access to:
- ✓ Admin Dashboard (`/admin`)
- ✓ Mentor Verification (`/admin/mentors`)
- ✓ AI Chat (`/chat`)
- ✓ Career Quiz (`/quiz`)
- ✓ Find Mentors (`/mentors`)
- ✓ All student features

---

## 📋 Next Steps

### Step 1: Restart Backend Server
```powershell
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### Step 2: Logout and Login Again
1. Open frontend: http://localhost:5173
2. Click "Logout" in sidebar
3. Login again with: **vamsikiran198@gmail.com**
4. Your JWT token will now contain both roles

### Step 3: Verify Multi-Role Features
After login, check:
- ✓ **Sidebar** - Should show "ADMIN" section with purple color
- ✓ **Settings Page** - Should show both "Admin" and "Student" badges
- ✓ **Admin Dashboard** - Should load without 403 error
- ✓ **All Student Features** - Should work normally

---

## 🛠️ Managing Roles

### Add a Role to User
```powershell
node scripts/addRole.js <email> <ROLE>

# Examples:
node scripts/addRole.js user@example.com MENTOR
node scripts/addRole.js user@example.com ADMIN
```

### Remove a Role from User
```powershell
node scripts/removeRole.js <email> <ROLE>

# Examples:
node scripts/removeRole.js user@example.com MENTOR
node scripts/removeRole.js user@example.com STUDENT
```

### List All User Roles
```powershell
# List all users
node scripts/listUserRoles.js

# List specific user
node scripts/listUserRoles.js user@example.com
```

### Quick: Make User Admin+Student
```powershell
node scripts/makeAdminStudent.js <email>

# Example:
node scripts/makeAdminStudent.js newuser@example.com
```

---

## 🎯 Valid Roles

- **STUDENT** - Access AI Chat, Career Quiz, Find Mentors, Connections
- **MENTOR** - Access Mentor Dashboard (requires mentor profile)
- **ADMIN** - Access Admin Dashboard, Verify Mentors

---

## 🔧 Technical Details

### Backend: JWT Token Structure
```javascript
{
  userId: "cmg3qgu9u0000145s0mhs3uf4",
  email: "vamsikiran198@gmail.com",
  roles: ["ADMIN", "STUDENT"],
  iat: 1728050400,
  exp: 1728655200
}
```

### Frontend: Role Helper Functions
```typescript
import { isAdmin, isStudent, hasRole, hasAnyRole } from '@/utils/roleHelpers';

// Check single role
if (isAdmin(user)) { /* ... */ }
if (isStudent(user)) { /* ... */ }

// Check specific role
if (hasRole(user, 'MENTOR')) { /* ... */ }

// Check any of multiple roles
if (hasAnyRole(user, ['ADMIN', 'MENTOR'])) { /* ... */ }
```

### Database: User Roles Format
```javascript
// In database (SQLite)
roles: '["ADMIN","STUDENT"]'  // JSON string

// In JavaScript/TypeScript
roles: ["ADMIN", "STUDENT"]   // Parsed array
```

---

## ⚠️ Important Notes

1. **Logout Required**: Users MUST logout and login again after role changes
2. **Minimum One Role**: Users must have at least one role (cannot be empty)
3. **Case Sensitive**: Roles are stored in UPPERCASE (ADMIN, STUDENT, MENTOR)
4. **JSON Format**: Roles stored as JSON string in database for SQLite compatibility

---

## 🎨 UI Changes

### Sidebar
- Admin section appears **only** if user has ADMIN role
- Purple gradient styling for admin section
- All student navigation items always visible

### Settings Page
- Multiple role badges displayed side by side
- Each role has distinct color:
  - **ADMIN** - Purple
  - **MENTOR** - Blue
  - **STUDENT** - Green

---

## 🐛 Troubleshooting

### Issue: "Admin access required" error
**Solution**: Logout and login again to refresh JWT token

### Issue: Admin sidebar not showing
**Solution**: 
1. Verify roles in database: `node scripts/listUserRoles.js your@email.com`
2. Logout and login again
3. Check browser console for errors

### Issue: Role change not taking effect
**Solution**: Clear localStorage and login again
```javascript
// In browser console
localStorage.clear();
// Then login again
```

---

## 📚 Related Documentation

- **Full Implementation Plan**: `docs/MULTI_ROLE_IMPLEMENTATION_PLAN.md`
- **Migration Details**: `prisma/migrations/20251004153018_multi_role_support/`
- **Role Helpers**: `frontend/src/utils/roleHelpers.ts`

---

## ✨ Benefits of Multi-Role System

✅ **Test as Different Roles** - Admins can test student features without separate account
✅ **Flexible Permissions** - Users can have multiple roles simultaneously  
✅ **Future-Proof** - Easy to add new roles (INSTRUCTOR, MODERATOR, etc.)
✅ **Better UX** - Single account, multiple capabilities
✅ **Secure** - Role checks on every API request

---

## 🎉 You're Ready!

Your platform now has a professional multi-role system. **Logout, login, and enjoy both ADMIN and STUDENT features with one account!**

**Admin Dashboard:** http://localhost:5173/admin
**Main Dashboard:** http://localhost:5173/dashboard

---

**Questions?** Check the full implementation plan in `docs/MULTI_ROLE_IMPLEMENTATION_PLAN.md`
