# 📘 Complete Postman Testing Guide - Password Reset Flow

## 🎯 Step-by-Step Guide: From Forgot Password to Accessing Protected Endpoints

---

## 📋 Prerequisites

1. **Server Running**: Make sure your backend server is running on `http://localhost:3000`
2. **Postman Installed**: Have Postman application ready
3. **Collection Imported**: Import the `CareerForge-AI.postman_collection.json`
4. **Email Service**: Ensure your email service (Gmail) is configured in `.env`

---

## 🔧 Setup: Create Postman Environment

### Step 1: Create Environment Variables

1. Click **"Environments"** tab in Postman (left sidebar)
2. Click **"+"** to create new environment
3. Name it: `CareerForge Local`
4. Add these variables:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| `base_url` | `http://localhost:3000` | `http://localhost:3000` |
| `token` | (empty) | (will be auto-filled) |
| `user_id` | (empty) | (will be auto-filled) |
| `user_email` | `vamsikiran198@gmail.com` | `vamsikiran198@gmail.com` |

5. Click **"Save"**
6. Select **"CareerForge Local"** from the environment dropdown (top right)

---

## 🚀 Complete Testing Flow

### ✅ Step 1: Register a New User (First Time Only)

**Endpoint:** `POST /api/v1/auth/register`

1. Open Postman → Go to **"Authentication"** folder
2. Select **"Register User"** request
3. The body should already have your details:
   ```json
   {
     "name": "Vamsi Kiran",
     "email": "vamsikiran198@gmail.com",
     "password": "Vamsi$93525"
   }
   ```
4. Click **"Send"**

**Expected Response (201 Created):**
```json
{
  "status": "success",
  "message": "User registered successfully. Please log in.",
  "data": {
    "user": {
      "id": "user-uuid-here",
      "name": "Vamsi Kiran",
      "email": "vamsikiran198@gmail.com",
      "roles": ["STUDENT"],
      "createdAt": "2025-10-12T..."
    }
  }
}
```

**If you get error "User already exists"**: Skip to Step 2 (Login)

---

### ✅ Step 2: Login (Get Initial Token)

**Endpoint:** `POST /api/v1/auth/login`

1. Go to **"Authentication"** folder
2. Select **"Login"** request
3. Body should be:
   ```json
   {
     "email": "vamsikiran198@gmail.com",
     "password": "Vamsi$93525"
   }
   ```
4. Click **"Send"**

**Expected Response (200 OK):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-uuid",
      "name": "Vamsi Kiran",
      "email": "vamsikiran198@gmail.com",
      "roles": ["STUDENT"]
    }
  }
}
```

**✨ Auto-Magic:** The token is automatically saved to your environment variables!

Check the **"Console"** tab at bottom - you should see:
```
Token saved: eyJhbGciOiJI...
User ID: user-uuid-here
```

---

### ✅ Step 3: Test Get Profile (Verify Token Works)

**Endpoint:** `GET /api/v1/users/profile`

1. Go to **"User Profile"** folder
2. Select **"Get My Profile"** request
3. Click **"Send"** (no body needed - token is auto-added)

**Expected Response (200 OK):**
```json
{
  "status": "success",
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "Vamsi Kiran",
      "email": "vamsikiran198@gmail.com",
      "avatar": null,
      "bio": null,
      "roles": ["STUDENT"],
      "createdAt": "2025-10-12T...",
      "updatedAt": "2025-10-12T...",
      "emailVerified": false
    }
  }
}
```

**✅ If this works, your authentication is working!**

---

## 🔄 Password Reset Flow

### ✅ Step 4: Forgot Password (Request Reset Link)

**Endpoint:** `POST /api/v1/auth/forgot-password`

1. Go to **"Authentication"** folder
2. Select **"Forgot Password"** request
3. Body should be:
   ```json
   {
     "email": "vamsikiran198@gmail.com"
   }
   ```
4. Click **"Send"**

**Expected Response (200 OK):**
```json
{
  "status": "success",
  "message": "Password reset email sent. Please check your inbox.",
  "data": {
    "email": "vamsikiran198@gmail.com"
  }
}
```

**📧 Important:** Check your email inbox (`vamsikiran198@gmail.com`) for the reset link!

---

### ✅ Step 5: Get Reset Token from Email

1. Open your email inbox
2. Look for email with subject: **"Password Reset Request - CareerForge AI"**
3. Click the reset link in the email

**The link will look like:**
```
http://localhost:5173/reset-password?token=abc123def456...
```

4. **Copy ONLY the token part** (everything after `token=`)

**Example:**
```
abc123def456ghi789jklmno012pqr345stu678vwx901yz
```

---

### ✅ Step 6: Reset Password (Using Token from Email)

**Endpoint:** `POST /api/v1/auth/reset-password`

1. Go to **"Authentication"** folder
2. Select **"Reset Password"** request
3. **Update the body:**
   ```json
   {
     "token": "PASTE-YOUR-TOKEN-FROM-EMAIL-HERE",
     "password": "Naga$93525"
   }
   ```

**Example with real token:**
```json
{
  "token": "abc123def456ghi789jklmno012pqr345stu678vwx901yz",
  "password": "Naga$93525"
}
```

4. Click **"Send"**

**Expected Response (200 OK):**
```json
{
  "status": "success",
  "message": "Password reset successfully. You can now log in with your new password."
}
```

**✅ Success!** Your password has been changed from `Vamsi$93525` to `Naga$93525`

---

### ✅ Step 7: Login with NEW Password

**Endpoint:** `POST /api/v1/auth/login`

1. Go to **"Authentication"** folder
2. Select **"Login"** request
3. **Update the body with NEW password:**
   ```json
   {
     "email": "vamsikiran198@gmail.com",
     "password": "Naga$93525"
   }
   ```
4. Click **"Send"**

**Expected Response (200 OK):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-uuid",
      "name": "Vamsi Kiran",
      "email": "vamsikiran198@gmail.com",
      "roles": ["STUDENT"]
    }
  }
}
```

**✨ The NEW token is automatically saved!**

---

### ✅ Step 8: Test Profile Again (Verify New Token Works)

**Endpoint:** `GET /api/v1/users/profile`

1. Go to **"User Profile"** folder
2. Select **"Get My Profile"** request
3. Click **"Send"**

**Expected Response (200 OK):**
```json
{
  "status": "success",
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "Vamsi Kiran",
      "email": "vamsikiran198@gmail.com",
      ...
    }
  }
}
```

**✅ If this works, password reset is complete and authentication is working!**

---

## 🔍 Troubleshooting Common Issues

### ❌ Issue 1: "Error: Not Found - /api/v1/users/profile"

**Cause:** The profile endpoint was missing in userRoutes.js

**Solution:** ✅ Already fixed! The endpoint has been added.

**Verify:**
- Restart your backend server: `npm run dev` or `node src/server.js`
- Try the profile request again

---

### ❌ Issue 2: "Validation failed - Password must be at least 8 characters"

**Cause:** Field name mismatch - Postman was sending `newPassword` instead of `password`

**Solution:** ✅ Already fixed in the collection!

**Verify body format:**
```json
{
  "token": "your-token-here",
  "password": "Naga$93525"  // ✅ Correct field name
}
```

**NOT:**
```json
{
  "token": "your-token-here",
  "newPassword": "Naga$93525"  // ❌ Wrong field name
}
```

---

### ❌ Issue 3: "Invalid or expired reset token"

**Possible Causes:**
1. Token expired (valid for 1 hour only)
2. Token already used
3. Wrong token copied

**Solution:**
1. Request a new password reset (Step 4)
2. Get fresh token from new email (Step 5)
3. Use immediately (Step 6)
4. Make sure you copy the **entire token** from the URL

---

### ❌ Issue 4: "Invalid email or password" after reset

**Possible Causes:**
1. Using old password instead of new one
2. Typo in new password

**Solution:**
1. Make sure you're using the NEW password you just set in Step 6
2. Double-check spelling and special characters
3. Password is case-sensitive!

---

### ❌ Issue 5: Token not auto-saving

**Check:**
1. Environment is selected (top right dropdown should show "CareerForge Local")
2. Check Console tab for "Token saved" message
3. Manually check Environment variables:
   - Click "Environments" → "CareerForge Local"
   - Look for `token` variable - should have a value

**Manual Fix:**
1. Copy the token from the login response
2. Go to Environments → "CareerForge Local"
3. Paste token in `token` variable's "Current Value"
4. Save

---

## 🎯 Quick Reference: Complete Flow Summary

```
1. Register User (if not exists)
   POST /api/v1/auth/register
   Body: { name, email, password }
   
2. Login (get initial token)
   POST /api/v1/auth/login
   Body: { email, password: "Vamsi$93525" }
   ✅ Token auto-saved
   
3. Test Profile (verify token works)
   GET /api/v1/users/profile
   Headers: Authorization: Bearer {{token}}
   
4. Forgot Password (request reset)
   POST /api/v1/auth/forgot-password
   Body: { email }
   📧 Check email inbox
   
5. Get Token from Email
   Copy token from reset link URL
   
6. Reset Password (use token)
   POST /api/v1/auth/reset-password
   Body: { token: "from-email", password: "Naga$93525" }
   
7. Login with NEW password
   POST /api/v1/auth/login
   Body: { email, password: "Naga$93525" }
   ✅ New token auto-saved
   
8. Test Profile Again
   GET /api/v1/users/profile
   ✅ Works with new token!
```

---

## 📝 Important Notes

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character from: `@$!%*?&`

**Valid Examples:**
- ✅ `Vamsi$93525`
- ✅ `Naga$93525`
- ✅ `Test@1234`
- ✅ `MyPass!99`

**Invalid Examples:**
- ❌ `password` (no uppercase, number, or special char)
- ❌ `PASSWORD123` (no lowercase or special char)
- ❌ `Pass123` (no special char, too short)

### Token Expiration
- **Login Token:** Valid for 7 days
- **Reset Token:** Valid for 1 hour only
- **Tip:** Complete reset flow quickly after requesting!

### Email Configuration
If emails are not being sent:
1. Check `.env` file has correct Gmail settings
2. Verify Gmail App Password is correct
3. Check console logs for email errors
4. Test email service endpoint: `POST /api/v1/test/email`

---

## ✅ Success Checklist

After completing all steps, you should be able to:

- [x] Register a new user
- [x] Login and receive JWT token
- [x] Access protected endpoints (like `/users/profile`)
- [x] Request password reset email
- [x] Receive reset email with token
- [x] Reset password using token from email
- [x] Login with new password
- [x] Access protected endpoints with new token

---

## 🚀 Next Steps

Once password reset is working, test other endpoints:

1. **Update Profile**
   - `PUT /api/v1/users/profile`
   - Update name, bio, avatar

2. **AI Chat**
   - `POST /api/v1/chat`
   - Send message to AI assistant

3. **Quiz System**
   - `GET /api/v1/quiz/available`
   - Browse and take quizzes

4. **Mentorship**
   - `GET /api/v1/mentorship/mentors`
   - Browse mentors and connect

All endpoints are documented in the Postman collection with examples! 🎉

---

**Need Help?** Check the server console logs for detailed error messages!
