# 🚀 CareerForge AI - Complete Deployment Guide

This guide covers deployment to multiple platforms with step-by-step instructions.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Deployment Options](#deployment-options)
   - [Railway (Recommended)](#railway-deployment)
   - [Vercel + Railway](#vercel--railway-hybrid)
   - [AWS (EC2/ECS)](#aws-deployment)
   - [Docker + VPS](#docker--vps-deployment)
   - [Heroku](#heroku-deployment)
4. [Post-Deployment](#post-deployment)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Services & Accounts
- ✅ GitHub account (for CI/CD)
- ✅ PostgreSQL database (managed service recommended)
- ✅ OpenAI API key OR Groq API key
- ✅ Domain name (optional but recommended)

### Required Tools
```bash
# Check if installed
node --version    # v18.0.0 or higher
npm --version     # v9.0.0 or higher
git --version     # v2.0.0 or higher
docker --version  # v20.0.0 or higher (optional)
```

---

## Environment Setup

### 1. Required Environment Variables

Create these environment variables in your deployment platform:

```env
# Core Settings
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/database

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
SESSION_SECRET=your-session-secret-key

# AI Service (choose one)
OPENAI_API_KEY=sk-...
# OR
GROQ_API_KEY=gsk_...

# Email (optional - for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Redis (optional - for caching)
REDIS_URL=redis://user:password@host:6379

# File Upload (optional)
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Monitoring (optional)
SENTRY_DSN=https://...@sentry.io/...
```

### 2. Generate Secure Keys

```bash
# Generate JWT secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Deployment Options

## Railway Deployment (⭐ RECOMMENDED - Easiest)

**Why Railway?** Free tier, automatic deployments, managed PostgreSQL, simple setup.

### Step 1: Setup Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Install Railway CLI (optional):
   ```bash
   npm install -g @railway/cli
   railway login
   ```

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your `careerforge-ai` repository
4. Railway will detect your configuration automatically

### Step 3: Add PostgreSQL Database
1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway automatically creates `DATABASE_URL` variable
4. Wait for database to provision (~30 seconds)

### Step 4: Configure Environment Variables
In Railway dashboard → Variables → Add:

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://careerforge-ai-production.up.railway.app
JWT_SECRET=<your-generated-secret>
SESSION_SECRET=<your-generated-secret>
OPENAI_API_KEY=<your-api-key>
```

### Step 5: Deploy
```bash
# Option A: Automatic (via GitHub push)
git add .
git commit -m "Deploy to Railway"
git push origin main
# Railway auto-deploys on push to main

# Option B: Manual via CLI
railway up
```

### Step 6: Run Database Migrations
```bash
# Using Railway CLI
railway run npx prisma db push

# Or via Railway dashboard: Settings → Deploy Triggers → Add deploy hook
```

### Step 7: Setup Custom Domain (Optional)
1. Railway dashboard → Settings → Domains
2. Click "Generate Domain" or "Custom Domain"
3. For custom domain: Add CNAME record in your DNS:
   ```
   CNAME: careerforge.yourdomain.com → your-app.up.railway.app
   ```

**✅ Done! Your app is live at:** `https://your-app.up.railway.app`

---

## Vercel + Railway Hybrid

**Best for:** Separate frontend (Vercel) and backend (Railway)

### Backend on Railway
Follow Railway steps above, but add:
```env
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

### Frontend on Vercel

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
vercel login
```

#### Step 2: Configure Frontend
```bash
cd frontend
```

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_API_URL": "https://your-railway-backend.up.railway.app"
  }
}
```

#### Step 3: Deploy Frontend
```bash
vercel --prod
```

#### Step 4: Link Custom Domain
1. Vercel dashboard → Settings → Domains
2. Add your domain
3. Configure DNS records as shown

**✅ Done! Frontend on Vercel, Backend on Railway**

---

## AWS Deployment

### Option A: AWS Elastic Beanstalk (Easier)

#### Step 1: Install AWS CLI & EB CLI
```bash
# Install AWS CLI
pip install awscli
aws configure

# Install EB CLI
pip install awsebcli
```

#### Step 2: Initialize Elastic Beanstalk
```bash
eb init -p node.js-18 careerforge-ai --region us-east-1
```

#### Step 3: Create Environment
```bash
eb create careerforge-production \
  --database.engine postgres \
  --database.username dbadmin \
  --database.password <secure-password> \
  --envvars NODE_ENV=production,JWT_SECRET=<secret>
```

#### Step 4: Deploy
```bash
eb deploy
eb open  # Opens your app in browser
```

### Option B: AWS ECS + Fargate (Production-grade)

#### Step 1: Build & Push Docker Image
```bash
# Authenticate to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Create repository
aws ecr create-repository --repository-name careerforge-ai

# Build and push
docker build -t careerforge-ai .
docker tag careerforge-ai:latest \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/careerforge-ai:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/careerforge-ai:latest
```

#### Step 2: Setup RDS PostgreSQL
```bash
aws rds create-db-instance \
  --db-instance-identifier careerforge-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username dbadmin \
  --master-user-password <secure-password> \
  --allocated-storage 20
```

#### Step 3: Create ECS Cluster & Service
```bash
# Create cluster
aws ecs create-cluster --cluster-name careerforge-cluster

# Register task definition (see task-definition.json below)
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster careerforge-cluster \
  --service-name careerforge-service \
  --task-definition careerforge-task \
  --desired-count 1 \
  --launch-type FARGATE
```

**task-definition.json:**
```json
{
  "family": "careerforge-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [{
    "name": "careerforge-app",
    "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/careerforge-ai:latest",
    "portMappings": [{"containerPort": 3000}],
    "environment": [
      {"name": "NODE_ENV", "value": "production"},
      {"name": "DATABASE_URL", "value": "postgresql://..."}
    ]
  }]
}
```

---

## Docker + VPS Deployment

**Best for:** DigitalOcean, Linode, Vultr, or any VPS

### Step 1: Provision VPS
```bash
# SSH into your VPS
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y
```

### Step 2: Setup Application
```bash
# Clone repository
git clone https://github.com/vamsikiran1234/careerforge-ai.git
cd careerforge-ai

# Create .env file
nano .env
# Paste your production environment variables
```

### Step 3: Setup Nginx Reverse Proxy
```bash
# Install Nginx
apt install nginx -y

# Create Nginx config
nano /etc/nginx/sites-available/careerforge
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/careerforge /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 4: Setup SSL with Let's Encrypt
```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Step 5: Deploy with Docker Compose
```bash
# Build and start services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check logs
docker-compose logs -f app

# Run migrations
docker-compose exec app npx prisma db push
```

### Step 6: Setup Auto-restart
```bash
# Create systemd service
nano /etc/systemd/system/careerforge.service
```

**careerforge.service:**
```ini
[Unit]
Description=CareerForge AI Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/root/careerforge-ai
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down

[Install]
WantedBy=multi-user.target
```

```bash
systemctl enable careerforge
systemctl start careerforge
```

---

## Heroku Deployment

### Step 1: Install Heroku CLI
```bash
# Install
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login
```

### Step 2: Create Heroku App
```bash
heroku create careerforge-ai
```

### Step 3: Add PostgreSQL
```bash
heroku addons:create heroku-postgresql:mini
```

### Step 4: Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=<your-secret>
heroku config:set OPENAI_API_KEY=<your-key>
heroku config:set FRONTEND_URL=https://careerforge-ai.herokuapp.com
```

### Step 5: Create Procfile
Create `Procfile` in root:
```
web: npm start
release: npx prisma db push
```

### Step 6: Deploy
```bash
git push heroku main
heroku open
```

---

## Post-Deployment

### 1. Verify Deployment
```bash
# Health check
curl https://your-domain.com/health

# API test
curl https://your-domain.com/api/auth/health
```

### 2. Run Database Migrations
```bash
# Railway
railway run npx prisma db push

# Heroku
heroku run npx prisma db push

# Docker/VPS
docker-compose exec app npx prisma db push

# AWS EB
eb ssh -c "cd /var/app/current && npx prisma db push"
```

### 3. Seed Initial Data (Optional)
```bash
npm run db:seed
```

### 4. Setup Monitoring

#### Sentry (Error Tracking)
1. Sign up at [sentry.io](https://sentry.io)
2. Create new project → Node.js
3. Add `SENTRY_DSN` to environment variables
4. Sentry is already integrated in the code

#### Uptime Monitoring
- [UptimeRobot](https://uptimerobot.com) (free)
- [Pingdom](https://pingdom.com)
- [StatusCake](https://statuscake.com)

### 5. Setup Backups

#### Railway
```bash
# Automatic backups included in paid plans
# Manual backup:
railway run pg_dump $DATABASE_URL > backup.sql
```

#### AWS RDS
```bash
aws rds create-db-snapshot \
  --db-instance-identifier careerforge-db \
  --db-snapshot-identifier careerforge-backup-$(date +%Y%m%d)
```

#### Docker/VPS
```bash
# Create backup script
cat > /root/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U postgres careerforge_prod > /backups/db_$DATE.sql
find /backups -name "db_*.sql" -mtime +7 -delete
EOF

chmod +x /root/backup.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /root/backup.sh" | crontab -
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check DATABASE_URL format
postgresql://username:password@host:port/database

# Test connection
psql $DATABASE_URL
```

#### 2. Prisma Client Not Generated
```bash
# Regenerate
npx prisma generate
npx prisma db push
```

#### 3. Port Already in Use
```bash
# Change PORT in environment variables
PORT=8080

# Or kill process
# Linux/Mac
lsof -ti:3000 | xargs kill -9
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### 4. CORS Errors
Add to environment variables:
```env
CORS_ORIGIN=https://your-frontend-domain.com
```

#### 5. Out of Memory
Increase memory in platform settings:
- Railway: Settings → Resources → Adjust memory
- Heroku: Upgrade dyno type
- Docker: Increase in docker-compose.yml

### Logs & Debugging

#### Railway
```bash
railway logs
```

#### Heroku
```bash
heroku logs --tail
```

#### Docker
```bash
docker-compose logs -f app
```

#### AWS
```bash
eb logs
# or
aws logs tail /aws/elasticbeanstalk/careerforge-production/var/log/web.stdout.log --follow
```

---

## 🎉 Deployment Complete!

### Quick Checklist
- ✅ Application running and accessible
- ✅ Database connected and migrated
- ✅ Environment variables configured
- ✅ SSL certificate installed (HTTPS)
- ✅ Monitoring setup (Sentry, Uptime)
- ✅ Backups configured
- ✅ Domain configured (if applicable)

### Next Steps
1. Setup CI/CD for automatic deployments
2. Configure CDN for static assets
3. Setup Redis for caching
4. Configure email service for notifications
5. Add custom domain
6. Setup analytics (Google Analytics, Mixpanel)

### Support
- 📧 Email: support@careerforge.com
- 💬 Discord: [Join our community](#)
- 📚 Docs: [docs.careerforge.com](#)

---

**Last Updated:** November 2025
**Version:** 1.0.0
