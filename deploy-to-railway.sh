#!/bin/bash

# CareerForge AI - Railway Deployment Script
# This script automates deployment of backend to Railway

set -e

echo "🚀 CareerForge AI - Railway Deployment"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found${NC}"
    echo "Install it with: npm install -g @railway/cli"
    exit 1
fi

echo -e "${GREEN}✅ Railway CLI found${NC}"
echo ""

# Login to Railway
echo "🔐 Logging in to Railway..."
railway login

# Link project (if not already linked)
if [ ! -f "railway.json" ]; then
    echo "🔗 Linking Railway project..."
    railway link
fi

# Pull environment variables
echo "📥 Pulling environment variables..."
railway env

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
railway run npx prisma migrate deploy

# Seed database (optional - uncomment if needed)
# echo "🌱 Seeding database..."
# railway run npm run db:seed

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "View your deployment:"
echo "- Dashboard: https://railway.app/dashboard"
echo "- Logs: railway logs"
echo "- Shell: railway shell"
echo ""
echo "Next steps:"
echo "1. Generate a public domain in Railway settings"
echo "2. Update VITE_API_URL in Vercel with your Railway URL"
echo "3. Update CORS_ORIGIN in Railway with your Vercel URL"
