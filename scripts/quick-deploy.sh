#!/bin/bash

# Quick Deploy Script - Interactive deployment wizard
# Usage: bash scripts/quick-deploy.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    clear
    echo -e "${PURPLE}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║        🚀 CareerForge AI Deployment Wizard 🚀            ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${CYAN}[STEP $1/$2]${NC} $3"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Select deployment platform
select_platform() {
    print_header
    echo -e "${YELLOW}Select your deployment platform:${NC}"
    echo ""
    echo "  1) Railway (Recommended - Easiest, Free tier)"
    echo "  2) Vercel + Railway (Best for separate frontend/backend)"
    echo "  3) Heroku (Traditional PaaS)"
    echo "  4) Docker + VPS (DigitalOcean, Linode, etc.)"
    echo "  5) AWS (Elastic Beanstalk or ECS)"
    echo "  6) Exit"
    echo ""
    read -p "Enter your choice (1-6): " PLATFORM_CHOICE
    
    case $PLATFORM_CHOICE in
        1) PLATFORM="railway" ;;
        2) PLATFORM="vercel" ;;
        3) PLATFORM="heroku" ;;
        4) PLATFORM="docker" ;;
        5) PLATFORM="aws" ;;
        6) exit 0 ;;
        *) 
            print_error "Invalid choice"
            sleep 2
            select_platform
            ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    print_step 1 5 "Checking prerequisites..."
    echo ""
    
    MISSING=()
    
    # Check Node.js
    if command -v node &> /dev/null; then
        print_success "Node.js $(node -v) installed"
    else
        print_error "Node.js not found"
        MISSING+=("Node.js")
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        print_success "npm $(npm -v) installed"
    else
        print_error "npm not found"
        MISSING+=("npm")
    fi
    
    # Check git
    if command -v git &> /dev/null; then
        print_success "git installed"
    else
        print_error "git not found"
        MISSING+=("git")
    fi
    
    if [ ${#MISSING[@]} -gt 0 ]; then
        echo ""
        print_error "Missing required tools: ${MISSING[*]}"
        echo "Please install them and try again."
        exit 1
    fi
    
    echo ""
    read -p "Press Enter to continue..."
}

# Collect environment variables
collect_env_vars() {
    print_step 2 5 "Collecting environment variables..."
    echo ""
    
    # Check if .env exists
    if [ -f ".env" ]; then
        print_info "Found existing .env file"
        read -p "Do you want to use existing .env? (y/n): " USE_EXISTING
        if [[ $USE_EXISTING =~ ^[Yy]$ ]]; then
            return
        fi
    fi
    
    echo ""
    echo "Enter your environment variables (or press Enter to skip):"
    echo ""
    
    # Database URL
    read -p "DATABASE_URL (PostgreSQL connection string): " DATABASE_URL
    if [ -z "$DATABASE_URL" ]; then
        print_info "Database will be created by platform"
    fi
    
    # JWT Secret
    read -p "JWT_SECRET (leave empty to auto-generate): " JWT_SECRET
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
        print_success "Generated JWT_SECRET"
    fi
    
    # AI API Key
    echo ""
    echo "Choose AI provider:"
    echo "  1) OpenAI (GPT-4, GPT-3.5)"
    echo "  2) Groq (Fast, free tier)"
    read -p "Choice (1-2): " AI_CHOICE
    
    if [ "$AI_CHOICE" == "1" ]; then
        read -p "OPENAI_API_KEY: " OPENAI_API_KEY
    else
        read -p "GROQ_API_KEY: " GROQ_API_KEY
    fi
    
    # Frontend URL
    read -p "FRONTEND_URL (leave empty for now): " FRONTEND_URL
    
    # Create .env file
    cat > .env << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=${JWT_SECRET}
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
OPENAI_API_KEY=${OPENAI_API_KEY}
GROQ_API_KEY=${GROQ_API_KEY}
FRONTEND_URL=${FRONTEND_URL}
CORS_ORIGIN=*
MAX_FILE_SIZE=5242880
EOF
    
    print_success "Environment variables saved to .env"
    echo ""
    read -p "Press Enter to continue..."
}

# Run tests
run_tests() {
    print_step 3 5 "Running tests..."
    echo ""
    
    print_info "Installing dependencies..."
    npm install --silent
    
    print_info "Running test suite..."
    if npm test -- --silent &> /dev/null; then
        print_success "All tests passed!"
    else
        print_error "Some tests failed"
        read -p "Continue anyway? (y/n): " CONTINUE
        if [[ ! $CONTINUE =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    echo ""
    read -p "Press Enter to continue..."
}

# Build application
build_application() {
    print_step 4 5 "Building application..."
    echo ""
    
    print_info "Installing production dependencies..."
    npm ci --production --silent
    
    print_info "Generating Prisma client..."
    npx prisma generate
    
    print_info "Building frontend..."
    cd frontend
    npm ci --silent
    npm run build
    cd ..
    
    print_success "Build completed!"
    echo ""
    read -p "Press Enter to continue..."
}

# Deploy to Railway
deploy_railway() {
    print_step 5 5 "Deploying to Railway..."
    echo ""
    
    # Install Railway CLI if needed
    if ! command -v railway &> /dev/null; then
        print_info "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    print_info "Logging in to Railway..."
    railway login
    
    print_info "Linking or creating project..."
    railway init || railway link
    
    print_info "Setting environment variables..."
    if [ -f ".env" ]; then
        while IFS='=' read -r key value; do
            if [ ! -z "$key" ] && [[ ! $key =~ ^# ]]; then
                railway variables set "$key=$value" || true
            fi
        done < .env
    fi
    
    print_info "Adding PostgreSQL database..."
    railway add
    
    print_info "Deploying application..."
    railway up
    
    print_info "Running migrations..."
    railway run npx prisma db push
    
    print_success "Deployment completed!"
    echo ""
    print_info "Getting your app URL..."
    railway open
}

# Deploy to Vercel
deploy_vercel() {
    print_step 5 5 "Deploying to Vercel..."
    echo ""
    
    # Install Vercel CLI if needed
    if ! command -v vercel &> /dev/null; then
        print_info "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    print_info "Logging in to Vercel..."
    vercel login
    
    print_info "Deploying frontend..."
    cd frontend
    vercel --prod
    cd ..
    
    print_success "Frontend deployed to Vercel!"
    print_info "Don't forget to deploy backend to Railway or another service"
    echo ""
    read -p "Press Enter to continue..."
}

# Deploy to Heroku
deploy_heroku() {
    print_step 5 5 "Deploying to Heroku..."
    echo ""
    
    if ! command -v heroku &> /dev/null; then
        print_error "Heroku CLI not installed"
        print_info "Install from: https://cli.heroku.com"
        exit 1
    fi
    
    print_info "Logging in to Heroku..."
    heroku login
    
    print_info "Creating app..."
    heroku create careerforge-ai-${RANDOM} || true
    
    print_info "Adding PostgreSQL..."
    heroku addons:create heroku-postgresql:mini
    
    print_info "Setting environment variables..."
    if [ -f ".env" ]; then
        while IFS='=' read -r key value; do
            if [ ! -z "$key" ] && [[ ! $key =~ ^# ]] && [ "$key" != "DATABASE_URL" ]; then
                heroku config:set "$key=$value"
            fi
        done < .env
    fi
    
    # Create Procfile
    cat > Procfile << 'EOF'
web: npm start
release: npx prisma db push
EOF
    
    git add Procfile
    git commit -m "Add Procfile for Heroku" || true
    
    print_info "Deploying to Heroku..."
    git push heroku main
    
    print_success "Deployment completed!"
    heroku open
}

# Deploy with Docker
deploy_docker() {
    print_step 5 5 "Deploying with Docker..."
    echo ""
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker not installed"
        print_info "Install from: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    print_info "Building Docker image..."
    docker build -t careerforge-ai:latest .
    
    print_info "Starting services..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    
    sleep 5
    
    print_info "Running migrations..."
    docker-compose exec app npx prisma db push
    
    print_success "Deployment completed!"
    print_info "Application running at http://localhost:3000"
}

# Deploy to AWS
deploy_aws() {
    print_step 5 5 "Deploying to AWS..."
    echo ""
    
    if ! command -v eb &> /dev/null; then
        print_error "AWS EB CLI not installed"
        print_info "Install with: pip install awsebcli"
        exit 1
    fi
    
    print_info "Initializing Elastic Beanstalk..."
    eb init -p node.js-18 careerforge-ai --region us-east-1 || true
    
    print_info "Creating environment..."
    eb create careerforge-production --database.engine postgres || true
    
    print_info "Deploying..."
    eb deploy
    
    print_info "Running migrations..."
    eb ssh -c "cd /var/app/current && npx prisma db push"
    
    print_success "Deployment completed!"
    eb open
}

# Post-deployment steps
post_deployment() {
    print_header
    echo -e "${GREEN}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║              🎉 Deployment Successful! 🎉                ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo "Next steps:"
    echo ""
    echo "  1. ✓ Verify application is running"
    echo "  2. ✓ Check logs for any errors"
    echo "  3. ✓ Test critical functionality"
    echo "  4. ✓ Setup monitoring (Sentry, UptimeRobot)"
    echo "  5. ✓ Configure custom domain"
    echo "  6. ✓ Setup SSL certificate"
    echo "  7. ✓ Enable automated backups"
    echo ""
    echo "Documentation: DEPLOYMENT_GUIDE.md"
    echo ""
}

# Main flow
main() {
    print_header
    sleep 1
    
    select_platform
    check_prerequisites
    collect_env_vars
    run_tests
    build_application
    
    case $PLATFORM in
        railway)
            deploy_railway
            ;;
        vercel)
            deploy_vercel
            ;;
        heroku)
            deploy_heroku
            ;;
        docker)
            deploy_docker
            ;;
        aws)
            deploy_aws
            ;;
    esac
    
    post_deployment
}

# Run
main
