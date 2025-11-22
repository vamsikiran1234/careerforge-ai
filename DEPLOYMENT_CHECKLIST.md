# CareerForge AI - Deployment Verification Checklist

Use this checklist to verify your deployment is successful.

## ✅ Pre-Deployment Checklist

### Code Preparation
- [ ] All code committed to GitHub
- [ ] `.env` files in `.gitignore`
- [ ] No secrets in code
- [ ] `package.json` has correct `engines` field
- [ ] Dependencies up to date
- [ ] Build succeeds locally (`npm run build`)
- [ ] Tests pass (`npm test`)

### Accounts Created
- [ ] GitHub account
- [ ] Railway account (linked to GitHub)
- [ ] Vercel account (linked to GitHub)
- [ ] Groq API account
- [ ] Gmail app password generated (optional)

## ✅ Database Deployment (Railway)

### PostgreSQL Setup
- [ ] PostgreSQL service created on Railway
- [ ] Database is "Active" status
- [ ] Connection string copied
- [ ] Connection string format is correct
- [ ] Can connect from local machine

### Migrations
- [ ] Prisma client generated
- [ ] Migrations applied (`prisma migrate deploy`)
- [ ] Database seeded (`npm run db:seed`)
- [ ] All tables created (12 tables)
- [ ] Test data inserted

### Verification Commands
```powershell
# Test connection
railway run npx prisma db push

# Check tables
railway run npx prisma studio

# Count records
railway run node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count().then(count => console.log('Users:', count));
"
```

## ✅ Backend Deployment (Railway)

### Service Configuration
- [ ] Backend service created
- [ ] GitHub repo linked
- [ ] Build command set: `npm install && npm run db:generate`
- [ ] Start command set: `npm start`
- [ ] Root directory correct: `/`

### Environment Variables
- [ ] `NODE_ENV=production`
- [ ] `PORT=3000`
- [ ] `DATABASE_URL` set
- [ ] `JWT_SECRET` set (32+ chars)
- [ ] `GROQ_API_KEY` set
- [ ] `CORS_ORIGIN` set (Vercel URL)
- [ ] All optional variables set

### Deployment Status
- [ ] Deployment succeeded (green checkmark)
- [ ] Build logs show no errors
- [ ] Service is "Active"
- [ ] Public domain generated
- [ ] Domain URL saved

### API Testing
```powershell
# Test health endpoint
curl https://YOUR_RAILWAY_URL/health

# Test API endpoint
curl https://YOUR_RAILWAY_URL/api/v1/health

# Test auth endpoint
curl -X POST https://YOUR_RAILWAY_URL/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{"name":"Test","email":"test@test.com","password":"Test123!@#","role":"STUDENT"}'
```

- [ ] `/health` returns `{"status":"ok"}`
- [ ] `/api/v1/health` returns database status
- [ ] Auth endpoints respond
- [ ] No 500 errors in logs

## ✅ Frontend Deployment (Vercel)

### Project Configuration
- [ ] Project imported from GitHub
- [ ] Framework preset: Vite
- [ ] Root directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Install command: `npm install`

### Environment Variables
- [ ] `VITE_API_URL` set (Railway URL)
- [ ] `VITE_APP_NAME` set
- [ ] `VITE_APP_VERSION` set
- [ ] `VITE_ENABLE_ANALYTICS` set
- [ ] All variables applied to all environments

### Deployment Status
- [ ] Deployment succeeded
- [ ] Build logs show no errors
- [ ] Production URL generated
- [ ] Production URL saved
- [ ] HTTPS enabled (lock icon)

### Frontend Testing
- [ ] Homepage loads (`https://YOUR_VERCEL_URL`)
- [ ] Navigation works
- [ ] Images load
- [ ] Styles applied correctly
- [ ] No console errors (F12 → Console)
- [ ] Mobile responsive (DevTools mobile view)

## ✅ Integration Testing

### API Connection
- [ ] Frontend can reach backend
- [ ] No CORS errors in console
- [ ] API calls succeed (Network tab)
- [ ] Loading states work
- [ ] Error messages display

### User Authentication
- [ ] Register new user works
- [ ] Login works
- [ ] Token saved in localStorage
- [ ] Protected routes require auth
- [ ] Logout works
- [ ] Password reset works

### AI Chat Feature
- [ ] Chat page loads
- [ ] Can send messages
- [ ] AI responds within 5 seconds
- [ ] Messages persist
- [ ] Chat history loads
- [ ] No rate limit errors

### Mentor Features
- [ ] Mentor registration works
- [ ] Mentor profile displays
- [ ] Mentor list loads
- [ ] Can view mentor details
- [ ] Can book sessions
- [ ] Sessions appear in calendar

### Core Features
- [ ] Dashboard loads
- [ ] Career trajectory works
- [ ] Quiz starts and completes
- [ ] File uploads work
- [ ] Notifications show
- [ ] Reviews/ratings work

## ✅ Performance Testing

### Load Times
- [ ] Homepage < 3 seconds
- [ ] Dashboard < 5 seconds
- [ ] API response < 1 second
- [ ] Chat response < 5 seconds

### Lighthouse Scores (in Chrome DevTools)
```
Target scores:
- Performance: > 80
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 80
```

- [ ] Performance score acceptable
- [ ] Accessibility score acceptable
- [ ] Best Practices score acceptable
- [ ] SEO score acceptable

## ✅ Security Checks

### Code Security
- [ ] No API keys in code
- [ ] No passwords in code
- [ ] No sensitive data in client-side code
- [ ] `.env` files in `.gitignore`
- [ ] Secrets only in environment variables

### API Security
- [ ] JWT authentication working
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Helmet middleware enabled
- [ ] Input validation working
- [ ] SQL injection protection (Prisma)

### HTTPS & SSL
- [ ] Frontend has HTTPS (Vercel automatic)
- [ ] Backend has HTTPS (Railway automatic)
- [ ] Database connection encrypted
- [ ] No mixed content warnings

## ✅ Monitoring Setup

### Error Tracking
- [ ] Sentry configured (optional)
- [ ] Error reports working
- [ ] Source maps uploaded

### Logging
- [ ] Backend logs accessible (Railway)
- [ ] Log level set correctly
- [ ] No sensitive data in logs
- [ ] Log rotation enabled

### Uptime Monitoring
- [ ] UptimeRobot configured (optional)
- [ ] Status page created (optional)
- [ ] Alert emails configured

## ✅ Documentation

### URLs Documented
- [ ] Frontend URL saved
- [ ] Backend URL saved
- [ ] Database URL saved (securely)
- [ ] GitHub repo URL saved

### Credentials Saved Securely
- [ ] Database password
- [ ] JWT secret
- [ ] API keys
- [ ] Email credentials
- [ ] Admin credentials

### README Updated
- [ ] Live demo links added
- [ ] Deployment instructions added
- [ ] Environment variables documented
- [ ] Architecture diagram updated

## ✅ Final Verification

### End-to-End Test
Complete this user journey:
1. [ ] Visit homepage
2. [ ] Sign up as new user
3. [ ] Complete onboarding quiz
4. [ ] Browse mentors
5. [ ] Send chat message to AI
6. [ ] View dashboard
7. [ ] Update profile
8. [ ] Book a mentor session
9. [ ] Receive email notification
10. [ ] Log out
11. [ ] Log back in

### Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile Chrome
- [ ] Mobile Safari

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast sufficient
- [ ] Alt text on images
- [ ] ARIA labels present

## 🚨 Common Issues Checklist

If something doesn't work, check:

### Frontend Issues
- [ ] VITE_API_URL is correct (no trailing slash)
- [ ] Environment variables applied to production
- [ ] Vercel redeployed after changing env vars
- [ ] No console errors
- [ ] Browser cache cleared

### Backend Issues
- [ ] DATABASE_URL is correct
- [ ] CORS_ORIGIN includes Vercel URL
- [ ] All environment variables set
- [ ] Railway service is active
- [ ] No errors in Railway logs

### Database Issues
- [ ] PostgreSQL service is active
- [ ] Connection string format correct
- [ ] Migrations applied
- [ ] Tables exist
- [ ] Can connect from backend

### AI Chat Issues
- [ ] GROQ_API_KEY is valid
- [ ] Not exceeding rate limits
- [ ] API key has correct permissions
- [ ] Fallback models configured

## 📊 Success Criteria

Your deployment is successful when ALL of these are true:

✅ All checklist items completed  
✅ No errors in production  
✅ All core features working  
✅ Performance acceptable  
✅ Security hardened  
✅ Monitoring enabled  
✅ Documentation complete  

## 🎉 Post-Deployment

After successful verification:

- [ ] Announce launch on social media
- [ ] Share with team/stakeholders
- [ ] Monitor first 24 hours closely
- [ ] Collect user feedback
- [ ] Plan next iteration

---

**Verification Date:** _______________

**Verified By:** _______________

**Deployment Status:** [ ] PASS  [ ] FAIL

**Notes:**
________________________________
________________________________
________________________________
