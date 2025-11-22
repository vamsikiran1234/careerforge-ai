# CareerForge AI - Railway Deployment Script (PowerShell)
# This script automates deployment of backend to Railway on Windows

$ErrorActionPreference = "Stop"

Write-Host "🚀 CareerForge AI - Railway Deployment" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
$railwayExists = Get-Command railway -ErrorAction SilentlyContinue
if (-not $railwayExists) {
    Write-Host "❌ Railway CLI not found" -ForegroundColor Red
    Write-Host "Install it with: npm install -g @railway/cli" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Railway CLI found" -ForegroundColor Green
Write-Host ""

# Login to Railway
Write-Host "🔐 Logging in to Railway..." -ForegroundColor Yellow
railway login

# Link project (if not already linked)
if (-not (Test-Path "railway.json")) {
    Write-Host "🔗 Linking Railway project..." -ForegroundColor Yellow
    railway link
}

# Pull environment variables
Write-Host "📥 Pulling environment variables..." -ForegroundColor Yellow
railway env

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

# Run database migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
railway run npx prisma migrate deploy

# Seed database (optional - uncomment if needed)
# Write-Host "🌱 Seeding database..." -ForegroundColor Yellow
# railway run npm run db:seed

# Deploy to Railway
Write-Host "🚀 Deploying to Railway..." -ForegroundColor Yellow
railway up

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "View your deployment:" -ForegroundColor Cyan
Write-Host "- Dashboard: https://railway.app/dashboard"
Write-Host "- Logs: railway logs"
Write-Host "- Shell: railway shell"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Generate a public domain in Railway settings"
Write-Host "2. Update VITE_API_URL in Vercel with your Railway URL"
Write-Host "3. Update CORS_ORIGIN in Railway with your Vercel URL"
