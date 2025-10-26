# 🎯 Complete Postman Authentication Flow - Step by Step

## Current Status: You're getting "TOKEN_MALFORMED" error

**Error:** `403 Forbidden - TOKEN_MALFORMED`  
**Reason:** You're trying to access `/users/profile` without a valid authentication token.

---

## ✅ COMPLETE FLOW: From Start to Accessing Protected Endpoints

---

## 🔐 PART 1: Initial Registration & Login

### **Step 1: Register User** (If Not Already Done)

**📍 Endpoint:** `POST {{base_url}}/api/v1/auth/register`

**📋 Location in Postman:**
- Open collection: **"CareerForge AI - Complete API"**
- Go to folder: **"🔐 Authentication"**
- Select request: **"Register User"**

**📝 Request Body:**
```json
{
  "name": "Vamsi Kiran",
  "email": "vamsikiran198@gmail.com",
  "password": "Vamsi$93525"
}
```

**🔵 Click:** "Send" button

**✅ Expected Response (201 Created):**
```json
{
  "status": "success",
  "message": "User registered successfully. Please log in.",
  "data": {
    "user": {
      "id": "cmg3qgu9u0000145s0mhs3uf4",
      "name": "Vamsi Kiran",
      "email": "vamsikiran198@gmail.com",
      "roles": ["STUDENT"],
      "createdAt": "2025-10-12T..."
    }
  }
}
```

**⚠️ If you get "User already exists":** Skip to Step 2

---

### **Step 2: Login to Get Token**

**📍 Endpoint:** `POST {{base_url}}/api/v1/auth/login`

**📋 Location in Postman:**
- Folder: **"🔐 Authentication"**
- Select request: **"Login"**

**📝 Request Body:**
```json
{
  "email": "vamsikiran198@gmail.com",
  "password": "Vamsi$93525"
}
```

**🔵 Click:** "Send" button

**✅ Expected Response (200 OK):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWczcWd1OXUwMDAwMTQ1czBtaHMzdWY0IiwiZW1haWwiOiJ2YW1zaWtpcmFuMTk4QGdtYWlsLmNvbSIsInJvbGVzIjpbIlNUVURFTlQiXSwiaWF0IjoxNzI4NzQ1OTIwLCJleHAiOjE3MjkzNTA3MjB9.xYz123abc...",
    "user": {
      "id": "cmg3qgu9u0000145s0mhs3uf4",
      "name": "Vamsi Kiran",
      "email": "vamsikiran198@gmail.com",
      "roles": ["STUDENT"]
    }
  }
}
```

**✨ IMPORTANT:** Check the bottom **Console** tab in Postman. You should see:
```
Token saved: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
User ID: cmg3qgu9u0000145s0mhs3uf4
```

**🔍 Verify Token is Saved:**
1. Click **"Environments"** (left sidebar, lightning bolt icon)
2. Select your environment (e.g., "CareerForge Local")
3. Look for variable `token` - it should have a long string value
4. If empty, see "Manual Token Setup" below

---

### **Step 3: Test Profile Access** (This is where you are now)

**📍 Endpoint:** `GET {{base_url}}/api/v1/users/profile`

**📋 Location in Postman:**
- Folder: **"👤 User Profile"**
- Select request: **"Get My Profile"**

**📝 No Body Needed** (GET request)

**🔑 Check Authorization:**
1. Click on **"Authorization"** tab (below the URL)
2. Type should be: **"Inherit auth from parent"** OR **"Bearer Token"**
3. If "Bearer Token", the Token field should show: `{{token}}`

**🔵 Click:** "Send" button

**✅ Expected Response (200 OK):**
```json
{
  "status": "success",
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": "cmg3qgu9u0000145s0mhs3uf4",
      "name": "Vamsi Kiran",
      "email": "vamsikiran198@gmail.com",
      "avatar": null,
      "bio": null,
      "roles": ["STUDENT"],
      "createdAt": "2025-10-12T14:23:45.123Z",
      "updatedAt": "2025-10-12T14:23:45.123Z",
      "emailVerified": false
    }
  }
}
```

**❌ If you still get 403 TOKEN_MALFORMED:** Go to "Troubleshooting" section below

---

## 🔄 PART 2: Password Reset Flow

Now that you have a working token and can access your profile, let's do the password reset flow.

---

### **Step 4: Request Password Reset**

**📍 Endpoint:** `POST {{base_url}}/api/v1/auth/forgot-password`

**📋 Location in Postman:**
- Folder: **"🔐 Authentication"**
- Select request: **"Forgot Password"**

**📝 Request Body:**
```json
{
  "email": "vamsikiran198@gmail.com"
}
```

**🔵 Click:** "Send" button

**✅ Expected Response (200 OK):**
```json
{
  "status": "success",
  "message": "Password reset email sent. Please check your inbox.",
  "data": {
    "email": "vamsikiran198@gmail.com"
  }
}
```

**📧 Action Required:** Check your email inbox for password reset link!

---

### **Step 5: Get Reset Token from Email**

**📧 Email Steps:**
1. Open your email: **vamsikiran198@gmail.com**
2. Look for email with subject: **"Password Reset Request - CareerForge AI"**
3. Open the email
4. Find the reset link - it looks like:
   ```
   http://localhost:5173/reset-password?token=abc123def456ghi789jklmno012pqr345stu678vwx901yz
   ```
5. **Copy ONLY the token part** (everything after `token=`)

**Example token:**
```
abc123def456ghi789jklmno012pqr345stu678vwx901yz
```

**💡 Alternative - Use Check Script:**
If you don't have access to email, run this in terminal:
```powershell
node check-reset-token.js
```

This will show you the exact token from the database!

---

### **Step 6: Reset Password Using Token**

**📍 Endpoint:** `POST {{base_url}}/api/v1/auth/reset-password`

**📋 Location in Postman:**
- Folder: **"🔐 Authentication"**
- Select request: **"Reset Password"**

**📝 Request Body:**
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

**🔵 Click:** "Send" button

**✅ Expected Response (200 OK):**
```json
{
  "status": "success",
  "message": "Password reset successfully. You can now log in with your new password."
}
```

**🎉 Success!** Your password is now changed from `Vamsi$93525` to `Naga$93525`

---

### **Step 7: Login with NEW Password**

**📍 Endpoint:** `POST {{base_url}}/api/v1/auth/login`

**📋 Location in Postman:**
- Folder: **"🔐 Authentication"**
- Select request: **"Login"**

**📝 Request Body (with NEW password):**
```json
{
  "email": "vamsikiran198@gmail.com",
  "password": "Naga$93525"
}
```

**🔵 Click:** "Send" button

**✅ Expected Response (200 OK):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.NEW_TOKEN_HERE...",
    "user": {
      "id": "cmg3qgu9u0000145s0mhs3uf4",
      "name": "Vamsi Kiran",
      "email": "vamsikiran198@gmail.com",
      "roles": ["STUDENT"]
    }
  }
}
```

**✨ New Token Automatically Saved!** Check Console tab for confirmation.

---

### **Step 8: Test Profile with NEW Token**

**📍 Endpoint:** `GET {{base_url}}/api/v1/users/profile`

**📋 Location in Postman:**
- Folder: **"👤 User Profile"**
- Select request: **"Get My Profile"**

**🔵 Click:** "Send" button

**✅ Expected Response (200 OK):**
```json
{
  "status": "success",
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": "cmg3qgu9u0000145s0mhs3uf4",
      "name": "Vamsi Kiran",
      "email": "vamsikiran198@gmail.com",
      ...
    }
  }
}
```

**🎉 Complete!** Password reset flow is working perfectly!

---

## 🔧 Troubleshooting: TOKEN_MALFORMED Error

### Problem: Getting 403 Forbidden - TOKEN_MALFORMED

This means the authorization header is missing or malformed.

### **Solution 1: Check Environment is Selected**

1. Look at top-right corner of Postman
2. There's a dropdown that says "No Environment" or "CareerForge Local"
3. **Select your environment** (e.g., "CareerForge Local")
4. Try the request again

---

### **Solution 2: Manual Token Setup**

If token is not auto-saving:

**Step A: Get Token from Login Response**
1. Go to **"Login"** request
2. Click "Send"
3. In the response, copy the token value (the long string)

**Step B: Save Token to Environment**
1. Click **"Environments"** (left sidebar)
2. Click your environment name
3. Find `token` variable
4. Paste the token in **"Current Value"** column
5. Click **"Save"** (Ctrl+S)

**Step C: Try Profile Request Again**

---

### **Solution 3: Check Authorization Settings**

**For Individual Request:**
1. Open **"Get My Profile"** request
2. Click **"Authorization"** tab
3. Type: Select **"Bearer Token"**
4. Token: Type `{{token}}`
5. Click "Send"

**For Entire Collection:**
1. Click on collection name: **"CareerForge AI - Complete API"**
2. Click **"Authorization"** tab
3. Type: **"Bearer Token"**
4. Token: `{{token}}`
5. All requests will inherit this

---

### **Solution 4: Verify Token Format**

Run this in PowerShell to check your token:

```powershell
# In Postman Console (bottom), look for "Token saved: ..."
# Copy that token and run:

$token = "PASTE-YOUR-TOKEN-HERE"
Write-Host "Token length:" $token.Length
Write-Host "Token starts with:" $token.Substring(0, 20)
```

**Valid token should:**
- Be 200-300 characters long
- Start with `eyJ`
- Have two dots (`.`) separating three parts

**Example valid token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWczc...
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^...
      Header (Base64)                  Payload (Base64)
```

---

## 📊 Complete Flow Summary

```
┌─────────────────────────────────────────────────────────┐
│              AUTHENTICATION FLOW                         │
└─────────────────────────────────────────────────────────┘

1️⃣  REGISTER (First time only)
    POST /api/v1/auth/register
    Body: { name, email, password: "Vamsi$93525" }
    ✅ User created

2️⃣  LOGIN (Get token)
    POST /api/v1/auth/login
    Body: { email, password: "Vamsi$93525" }
    ✅ Token auto-saved to environment
    
3️⃣  TEST PROFILE (Verify token works)
    GET /api/v1/users/profile
    Headers: Authorization: Bearer {{token}}
    ✅ Profile data returned

┌─────────────────────────────────────────────────────────┐
│            PASSWORD RESET FLOW                           │
└─────────────────────────────────────────────────────────┘

4️⃣  FORGOT PASSWORD (Request reset)
    POST /api/v1/auth/forgot-password
    Body: { email }
    ✅ Email sent

5️⃣  CHECK EMAIL
    📧 Open inbox → Copy token from link
    
6️⃣  RESET PASSWORD (Use token)
    POST /api/v1/auth/reset-password
    Body: { token: "from-email", password: "Naga$93525" }
    ✅ Password changed

7️⃣  LOGIN (With new password)
    POST /api/v1/auth/login
    Body: { email, password: "Naga$93525" }
    ✅ New token auto-saved

8️⃣  TEST PROFILE (Verify new token)
    GET /api/v1/users/profile
    ✅ Works with new token!
```

---

## 🎯 What You Should Do Right Now

Based on your screenshot showing `TOKEN_MALFORMED` error:

### **Immediate Action:**

1. **Go to "Login" request**
   - Folder: 🔐 Authentication → Login
   
2. **Check the body:**
   ```json
   {
     "email": "vamsikiran198@gmail.com",
     "password": "Vamsi$93525"
   }
   ```

3. **Click "Send"**

4. **Look at Console tab (bottom of Postman)**
   - Should say: "Token saved: eyJ..."

5. **Check environment dropdown (top-right)**
   - Should show your environment selected (not "No Environment")

6. **Try "Get My Profile" again**
   - Should work now with 200 OK

7. **Then proceed with password reset** (Steps 4-8 above)

---

## ✅ Success Indicators

You'll know everything is working when:

- ✅ Login returns token
- ✅ Console shows "Token saved"
- ✅ Environment variable `token` has a value
- ✅ Get Profile returns 200 OK with user data
- ✅ Password reset email arrives
- ✅ Reset password succeeds
- ✅ Login with new password works
- ✅ Profile access works with new token

---

## 📞 Need Help?

If you're still stuck, run these debug commands:

```powershell
# Check if server is running
curl http://localhost:3000/health

# Check reset token status
node check-reset-token.js

# Check if user exists
node check-users.js
```

---

**Start with LOGIN (Step 2) and verify the token is saved before proceeding!** 🚀
