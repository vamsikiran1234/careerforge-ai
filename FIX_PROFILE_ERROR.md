# 🔧 TROUBLESHOOTING: "Failed to retrieve user profile" Error

## ❌ Current Error

```json
{
  "status": "error",
  "message": "Failed to retrieve user profile"
}
```

**This means:** The server received your request but had an internal error when trying to fetch your profile from the database.

---

## 🎯 Step-by-Step Fix

### **Step 1: Check if Server is Running**

Open PowerShell and run:
```powershell
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "CareerForge AI API is running"
}
```

**❌ If server is not running:**
```powershell
npm run dev
```

Wait for: `🚀 CareerForge AI server running on port 3000`

---

### **Step 2: Check Server Console Logs**

Look at your terminal where the server is running. You should see error messages like:

```
Get profile error: [detailed error message]
```

Common errors and solutions:

#### **Error: "PrismaClientKnownRequestError"**
**Cause:** Database connection issue

**Fix:**
```powershell
# Regenerate Prisma client
npx prisma generate

# Restart server
npm run dev
```

#### **Error: "User not found"**
**Cause:** The user ID in the token doesn't exist in the database

**Fix:** Run the check script:
```powershell
node check-users.js
```

Then login again to get a fresh token.

---

### **Step 3: Get a FRESH Token**

The most common cause is an invalid or corrupted token. Let's get a fresh one:

#### **A. Login in Postman**

1. Open Postman → **"🔐 Authentication"** → **"Login"**

2. Body:
   ```json
   {
     "email": "vamsikiran198@gmail.com",
     "password": "Vamsi$93525"
   }
   ```

3. Click **"Send"**

4. **Copy the token from the response:**
   - Look for `"token": "eyJ..."`
   - Copy the ENTIRE token string (usually 200-300 characters)

#### **B. Save Token to Environment**

1. Click **"Environments"** (lightning bolt icon on left)
2. Select your environment (e.g., "CareerForge Local")
3. Find the `token` variable
4. Paste the token in **"Current Value"** column
5. Press **Ctrl+S** to save

#### **C. Verify Token is Valid**

Run this command (replace YOUR_TOKEN with the token you just copied):
```powershell
node debug-token.js YOUR_TOKEN_HERE
```

**Expected Output:**
```
✅ Token is NOT expired
✅ Token signature is VALID
📝 This token should work for authenticated requests!
```

**❌ If token is invalid:** Login again in Postman

---

### **Step 4: Test Profile Again**

1. Open Postman → **"👤 User Profile"** → **"Get My Profile"**

2. Make sure environment is selected (top-right dropdown)

3. Click **"Send"**

**✅ Should work now!**

---

## 🔍 Deep Debugging

If the above steps don't work, let's debug deeper:

### **Debug 1: Check User Exists**

```powershell
node check-users.js
```

**Verify your email is in the list:**
- Look for: `vamsikiran198@gmail.com`
- Note the user ID

### **Debug 2: Check Token Payload**

1. Get your token from Postman environment
2. Run:
   ```powershell
   node debug-token.js YOUR_TOKEN_HERE
   ```

3. Check if the **User ID** in the token matches the one from `check-users.js`

### **Debug 3: Test with cURL**

Get your token and run:
```powershell
$token = "PASTE_YOUR_TOKEN_HERE"
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/users/profile" -Method Get -Headers $headers
```

**This bypasses Postman and tests the API directly.**

### **Debug 4: Check Authorization Header**

In Postman, after clicking "Send":
1. Go to **"Console"** tab (bottom)
2. Click on the request
3. Expand **"Request Headers"**
4. Look for: `Authorization: Bearer eyJ...`

**❌ If missing:** Authorization is not being added!

**Fix:**
1. Collection Settings:
   - Click collection name: **"CareerForge AI - Complete API"**
   - Go to **"Authorization"** tab
   - Type: **"Bearer Token"**
   - Token: `{{token}}`
   - Save

2. Request Settings:
   - Open **"Get My Profile"** request
   - Go to **"Authorization"** tab
   - Type: **"Inherit auth from parent"**

---

## 🔧 Common Causes & Solutions

### **Cause 1: Token Not Being Sent**

**Check:**
```powershell
# In Postman Console, look for Authorization header
```

**Fix:**
- Make sure environment is selected
- Verify `token` variable has a value
- Check Authorization tab is set to "Bearer Token"

---

### **Cause 2: Invalid Token Format**

**Symptoms:**
- Token doesn't start with `eyJ`
- Token has spaces or newlines
- Token is truncated

**Fix:**
```powershell
# Login again and copy token carefully
# Make sure to copy the ENTIRE string
```

---

### **Cause 3: Wrong JWT_SECRET**

**Check your .env file:**
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**If you changed JWT_SECRET recently:**
- Old tokens won't work
- Need to login again to get new token with new secret

---

### **Cause 4: User ID Mismatch**

**Token has user ID that doesn't exist in database**

**Fix:**
1. Delete the user:
   ```powershell
   # Use Prisma Studio
   npx prisma studio
   # Or recreate database
   npx prisma db push --force-reset
   ```

2. Register again
3. Login to get fresh token

---

### **Cause 5: Database Connection Issue**

**Check if database file exists:**
```powershell
Test-Path prisma/dev.db
```

**Fix:**
```powershell
# Regenerate database
npx prisma generate
npx prisma db push

# Restart server
npm run dev
```

---

## 🚀 Quick Fix - Start Fresh

If nothing else works, do a complete reset:

```powershell
# 1. Stop server (Ctrl+C)

# 2. Reset database
npx prisma db push --force-reset

# 3. Regenerate Prisma client
npx prisma generate

# 4. Start server
npm run dev

# 5. In Postman - Register
POST /api/v1/auth/register
Body: { name, email, password }

# 6. Login
POST /api/v1/auth/login
Body: { email, password }

# 7. Test profile
GET /api/v1/users/profile
```

---

## ✅ Success Checklist

After following the steps, verify:

- [ ] Server is running (`npm run dev`)
- [ ] Health check works (`curl http://localhost:3000/health`)
- [ ] User exists (`node check-users.js`)
- [ ] Login returns token (200 OK)
- [ ] Token is saved to environment (check Environments)
- [ ] Token is valid (`node debug-token.js TOKEN`)
- [ ] Environment is selected in Postman (top-right)
- [ ] Authorization header is being sent (check Console)
- [ ] Profile request returns 200 OK

---

## 📋 What to Do RIGHT NOW

### **Immediate Actions:**

1. **Open PowerShell** and run:
   ```powershell
   # Check server is running
   curl http://localhost:3000/health
   ```

2. **If server not running:**
   ```powershell
   npm run dev
   ```

3. **In Postman, do Login:**
   - POST /api/v1/auth/login
   - Body: { "email": "vamsikiran198@gmail.com", "password": "Vamsi$93525" }
   - Click Send
   - Copy the token from response

4. **Save token to environment:**
   - Environments → Your environment
   - Paste token in `token` variable
   - Save (Ctrl+S)

5. **Test profile again:**
   - GET /api/v1/users/profile
   - Click Send
   - Should work now! ✅

---

## 🆘 Still Not Working?

Run these diagnostic commands and send me the output:

```powershell
# 1. Check server health
curl http://localhost:3000/health

# 2. Check users exist
node check-users.js

# 3. Test login manually
$body = @{
    email = "vamsikiran198@gmail.com"
    password = "Vamsi$93525"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method Post -ContentType "application/json" -Body $body

# 4. Copy the token from output above and test it
node debug-token.js PASTE_TOKEN_HERE
```

Send me the output and I'll help you fix it! 🚀

---

**Most likely fix: Just login again in Postman to get a fresh token!** ✅
