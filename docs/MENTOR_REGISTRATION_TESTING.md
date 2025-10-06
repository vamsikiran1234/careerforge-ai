# Mentor Registration System - Testing Guide

## ✅ What's Been Implemented

### Backend (Complete)
- ✅ **Database Schema**: 8 new Prisma models for mentorship platform
- ✅ **API Endpoints**: 6 RESTful endpoints for mentor management
- ✅ **Email Verification**: Nodemailer integration with Gmail
- ✅ **Error Handling**: Graceful fallback if email not configured

### Frontend (Complete)
- ✅ **Registration Page**: 3-step form with validation
- ✅ **Verification Page**: Email verification landing page
- ✅ **Routes**: Integrated into App.tsx routing
- ✅ **UI/UX**: Matches existing design system perfectly

## 🧪 How to Test

### Step 1: Start the Server
```bash
npm run dev
```
Server should start without errors on port 3000.

### Step 2: Start Frontend
```bash
cd frontend
npm run dev
```
Frontend should run on http://localhost:5173

### Step 3: Register as a Mentor

1. **Login to CareerForge** (you need an existing account)
   - Go to: http://localhost:5173/login
   - Login with your credentials

2. **Navigate to Mentor Registration**
   - Go to: http://localhost:5173/mentorship/register
   - Or add a link in the UI to access this page

3. **Fill Out the 3-Step Form**

   **Step 1 - Professional Information:**
   - Current Company: "Google"
   - Job Title: "Senior Software Engineer"
   - Industry: "Technology"
   - Years of Experience: "5"
   
   **Step 2 - Educational Background:**
   - College/University: "MIT"
   - Degree: "Bachelor of Science"
   - Major: "Computer Science"
   - Graduation Year: "2018"
   
   **Step 3 - Mentorship Details:**
   - Expertise Areas: Click badges to select (e.g., "Web Development", "AI/ML")
   - Bio: Write 200-500 characters about yourself
   - LinkedIn URL: (optional) "https://linkedin.com/in/yourprofile"
   - Portfolio URL: (optional) "https://yourportfolio.com"
   - Available Hours/Week: "5"
   - Preferred Meeting Type: "Video Call"

4. **Submit Registration**
   - Click "Complete Registration"
   - Success screen will appear

### Step 4: Check Email Verification

**If Email is Configured (EMAIL_USER and EMAIL_APP_PASSWORD in .env):**
- Check your email inbox
- Click the verification link
- You'll be redirected to verification success page

**If Email is NOT Configured:**
- Check the server console logs
- Look for: `⚠️  Email not configured. Verification link: http://localhost:5173/mentorship/verify/[TOKEN]`
- Copy the link and paste in browser to verify manually

### Step 5: Verify Database Records

Open Prisma Studio to check if data was saved:
```bash
npx prisma studio
```

Navigate to:
- **MentorProfile** table → Should see your new mentor profile
- Check fields: company, jobTitle, expertiseAreas (JSON), bio, status (PENDING initially)
- After verification: isVerified = true, status = ACTIVE

## 📋 API Endpoints Reference

### 1. Register as Mentor
```http
POST /api/v1/mentorship/register
Authorization: Bearer {token}
Content-Type: application/json

{
  "company": "Google",
  "jobTitle": "Senior Software Engineer",
  "industry": "Technology",
  "yearsOfExperience": 5,
  "collegeName": "MIT",
  "degree": "Bachelor of Science",
  "graduationYear": 2018,
  "major": "Computer Science",
  "expertiseAreas": ["Web Development", "AI/ML"],
  "bio": "Experienced engineer passionate about mentoring...",
  "linkedinUrl": "https://linkedin.com/in/yourprofile",
  "portfolioUrl": "https://yourportfolio.com",
  "availableHoursPerWeek": 5,
  "preferredMeetingType": "VIDEO",
  "timezone": "America/New_York"
}
```

### 2. Verify Email
```http
GET /api/v1/mentorship/verify/{token}
```

### 3. Get My Mentor Profile
```http
GET /api/v1/mentorship/profile
Authorization: Bearer {token}
```

### 4. Update Mentor Profile
```http
PUT /api/v1/mentorship/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "bio": "Updated bio...",
  "availableHoursPerWeek": 10
}
```

### 5. Get All Mentors (Discovery)
```http
GET /api/v1/mentorship/mentors?expertise=Web+Development&industry=Technology
Authorization: Bearer {token}
```

### 6. Get Mentor by ID
```http
GET /api/v1/mentorship/mentors/{mentorId}
Authorization: Bearer {token}
```

## 🔍 What to Look For

### ✅ Success Indicators
- Form validation works (required fields, character limits)
- Progress bar updates between steps
- Expertise badges toggle on/off
- Success message appears after submission
- Verification link works (either email or console)
- Database records created correctly
- No server errors in console

### ❌ Common Issues
- **"nodemailer.createTransporter is not a function"** → Fixed with lazy loading
- **Email not sending** → Check .env EMAIL_USER and EMAIL_APP_PASSWORD
- **Route not found** → Make sure frontend route is added to App.tsx
- **Authentication required** → Must be logged in to access registration

## 🎨 UI Features Implemented
- 3-step wizard with progress indicators
- Icon-based step headers (Briefcase, GraduationCap, Target)
- Badge selection for expertise areas
- Character counter for bio (500 max)
- Form validation with error messages
- Loading states on submission
- Success screen with email icon
- Dark mode support
- Responsive design (mobile-friendly)
- Smooth animations and transitions

## 📧 Email Configuration (Optional)

To enable email sending, ensure these are set in `.env`:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173
```

**To get Gmail App Password:**
1. Enable 2-factor authentication on your Google account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate app password for "Mail"
4. Use this password (not your regular Gmail password)

## 🚀 Next Steps

After successful testing:
1. ✅ Mentor Registration System (Phase 1) - **COMPLETE**
2. 🔜 Mentor Discovery Page (Phase 2) - With Match Score algorithm
3. 🔜 Connection Request System (Phase 3) - Student → Mentor requests
4. 🔜 Real-time Chat (Phase 4) - Socket.io private messaging
5. 🔜 Video Sessions (Phase 5) - Jitsi integration
6. 🔜 Rating System (Phase 6) - Post-session feedback
7. 🔜 Notifications (Phase 7) - Real-time alerts
8. 🔜 Admin Dashboard (Phase 8) - Mentor verification

## 💡 Testing Tips

1. **Use Prisma Studio** to inspect database in real-time
2. **Check browser console** for any frontend errors
3. **Monitor server logs** for API calls and email status
4. **Test with multiple accounts** to simulate different users
5. **Try invalid data** to ensure validation works
6. **Test on mobile** to verify responsive design

---

**Status**: ✅ Ready for Testing
**Last Updated**: October 3, 2025
**Server Fixed**: Nodemailer import issue resolved
