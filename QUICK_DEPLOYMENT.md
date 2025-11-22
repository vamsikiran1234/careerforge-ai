# ⚡ Quick Deployment Guide - CareerForge AI

**Deploy in 30 minutes!** This is the condensed version. For detailed instructions, see [COMPLETE_DEPLOYMENT_GUIDE.md](./COMPLETE_DEPLOYMENT_GUIDE.md)

---

## 🎯 Prerequisites

- GitHub, Railway, and Vercel accounts (all free)
- Groq API key from https://console.groq.com (free)
- 30 minutes of time

---

## 🚀 Deployment Steps

### 1️⃣ Push to GitHub (5 min)

```powershell
# Clean up
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2️⃣ Deploy Database - Railway (5 min)

1. Go to https://railway.app
2. New Project → "Provision PostgreSQL"
3. Copy connection string from "Connect" tab
4. Save it: `DATABASE_URL=postgresql://postgres:...`

### 3️⃣ Deploy Backend - Railway (10 min)

1. Railway → New → "GitHub Repo" → Select `careerforge-ai`
2. Click service → "Variables" → Add:

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=<paste from step 2>
JWT_SECRET=<generate random 64 chars>
GROQ_API_KEY=<from console.groq.com>
CORS_ORIGIN=https://careerforge-ai.vercel.app
```

3. Settings → "Generate Domain"
4. Save URL: `BACKEND_URL=https://...railway.app`

5. Run migrations:
```powershell
npm install -g @railway/cli
railway login
railway link
railway run npx prisma migrate deploy
```

### 4️⃣ Deploy Frontend - Vercel (5 min)

1. Go to https://vercel.com
2. New Project → Import `careerforge-ai`
3. Configure:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build: `npm run build`
   - Output: `dist`

4. Environment Variables:
```bash
VITE_API_URL=<paste BACKEND_URL from step 3>
VITE_APP_NAME=CareerForge AI
```

5. Deploy! → Get URL: `https://careerforge-ai.vercel.app`

### 5️⃣ Update CORS (2 min)

1. Railway → Backend → Variables
2. Update `CORS_ORIGIN` with Vercel URL
3. Redeploy

### 6️⃣ Test (3 min)

```powershell
# Test backend
curl https://YOUR_RAILWAY_URL/health

# Test frontend
# Open https://YOUR_VERCEL_URL in browser
# Sign up → Test AI chat
```

---

## ✅ Done!

**Your URLs:**
- Frontend: `https://careerforge-ai.vercel.app`
- Backend: `https://careerforge-api-xxxx.railway.app`

---

## 🐛 Issues?

### Frontend can't connect to backend
- Check `VITE_API_URL` in Vercel
- Check `CORS_ORIGIN` in Railway
- Redeploy both

### Database connection error
- Verify `DATABASE_URL` format
- Check PostgreSQL is "Active" in Railway

### AI chat not working
- Verify `GROQ_API_KEY` in Railway
- Test at https://console.groq.com

---

## 📚 Full Documentation

- [Complete Deployment Guide](./COMPLETE_DEPLOYMENT_GUIDE.md) - Detailed step-by-step
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Verification checklist
- [Environment Variables](./frontend/.env.production.example) - All env vars explained

---

## 🎉 Next Steps

1. ✅ Complete [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
2. 📊 Monitor Railway/Vercel dashboards
3. 🎨 Customize branding
4. 📱 Test on mobile
5. 🚀 Share with users!

**Need Help?** Check [Troubleshooting section](./COMPLETE_DEPLOYMENT_GUIDE.md#troubleshooting) in the full guide.
