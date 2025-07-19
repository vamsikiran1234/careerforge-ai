#!/bin/bash

# Local development setup script
# Usage: ./scripts/setup-development.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js version: $(node -v)"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Some features may not work."
        return 1
    fi
    
    print_success "Docker version: $(docker --version)"
    return 0
}

# Install dependencies
install_dependencies() {
    print_status "Installing npm dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Created .env file from .env.example"
        else
            print_warning "No .env.example file found. Creating basic .env file..."
            cat > .env << EOF
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/careerforge_dev
JWT_SECRET=your-development-jwt-secret-key
OPENAI_API_KEY=your-openai-api-key-here
EOF
        fi
        
        print_warning "Please update the .env file with your actual configuration values"
    else
        print_success ".env file already exists"
    fi
}

# Setup database with Docker
setup_database_docker() {
    if check_docker; then
        print_status "Setting up PostgreSQL database with Docker..."
        
        # Start PostgreSQL container
        docker run -d \
            --name careerforge-postgres \
            -e POSTGRES_DB=careerforge_dev \
            -e POSTGRES_USER=postgres \
            -e POSTGRES_PASSWORD=password \
            -p 5432:5432 \
            postgres:15-alpine || print_warning "PostgreSQL container may already exist"
        
        # Wait for database to be ready
        print_status "Waiting for database to be ready..."
        sleep 10
        
        print_success "PostgreSQL database is running"
    else
        print_warning "Docker not available. Please set up PostgreSQL manually."
    fi
}

# Generate Prisma client and run migrations
setup_prisma() {
    print_status "Setting up Prisma..."
    
    # Generate Prisma client
    npx prisma generate
    print_success "Prisma client generated"
    
    # Run database migrations
    if npx prisma db push; then
        print_success "Database schema updated"
    else
        print_warning "Database migration failed. Make sure your database is running."
    fi
}

# Run tests to verify setup
verify_setup() {
    print_status "Running tests to verify setup..."
    
    if npm test; then
        print_success "All tests passed! Setup is complete."
    else
        print_warning "Some tests failed. Please check your configuration."
    fi
}

# Main setup function
main() {
    print_status "🚀 CareerForge AI Development Setup"
    print_status "======================================"
    
    # Check prerequisites
    check_node
    
    # Setup project
    install_dependencies
    setup_environment
    setup_database_docker
    setup_prisma
    
    # Verify everything works
    verify_setup
    
    print_success "🎉 Development environment setup complete!"
    print_status ""
    print_status "Next steps:"
    print_status "1. Update your .env file with proper configuration"
    print_status "2. Run 'npm run dev' to start the development server"
    print_status "3. Open http://localhost:3000 in your browser"
    print_status ""
    print_status "Available commands:"
    print_status "  npm run dev        - Start development server"
    print_status "  npm test           - Run tests"
    print_status "  npm run build      - Build for production"
    print_status "  npm run start      - Start production server"
    print_status "  docker-compose up  - Start with Docker"
}

# Execute main function
main "$@"
