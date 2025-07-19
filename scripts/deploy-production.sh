#!/bin/bash

# Deploy script for production environment
# Usage: ./scripts/deploy-production.sh

set -e

echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCKER_IMAGE="careerforge-ai:latest"
CONTAINER_NAME="careerforge-app"
BACKUP_DIR="/backups"
DEPLOYMENT_ENV="production"

# Function to print colored output
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

# Check if running as root or with sudo
check_permissions() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root or with sudo privileges"
        exit 1
    fi
}

# Backup database before deployment
backup_database() {
    print_status "Creating database backup..."
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="${BACKUP_DIR}/careerforge_backup_${TIMESTAMP}.sql"
    
    mkdir -p $BACKUP_DIR
    
    docker exec careerforge-postgres pg_dump -U postgres careerforge_prod > $BACKUP_FILE
    
    if [ $? -eq 0 ]; then
        print_success "Database backup created: $BACKUP_FILE"
    else
        print_error "Database backup failed"
        exit 1
    fi
}

# Health check function
health_check() {
    print_status "Performing health check..."
    
    for i in {1..30}; do
        if curl -f http://localhost:3000/health > /dev/null 2>&1; then
            print_success "Health check passed"
            return 0
        fi
        print_status "Waiting for application to start... ($i/30)"
        sleep 2
    done
    
    print_error "Health check failed - application not responding"
    return 1
}

# Rollback function
rollback() {
    print_warning "Rolling back to previous version..."
    
    docker stop $CONTAINER_NAME || true
    docker rm $CONTAINER_NAME || true
    
    # Start previous version (assuming it's tagged as 'previous')
    docker run -d \
        --name $CONTAINER_NAME \
        --network careerforge-network \
        -p 3000:3000 \
        --env-file .env.production \
        careerforge-ai:previous
    
    if health_check; then
        print_success "Rollback completed successfully"
    else
        print_error "Rollback failed"
        exit 1
    fi
}

# Main deployment function
deploy() {
    print_status "Starting deployment process..."
    
    # Pull latest image
    print_status "Pulling latest Docker image..."
    docker pull $DOCKER_IMAGE
    
    # Tag current version as previous for rollback
    docker tag $DOCKER_IMAGE careerforge-ai:previous || true
    
    # Create backup
    backup_database
    
    # Stop current container
    print_status "Stopping current application..."
    docker stop $CONTAINER_NAME || true
    docker rm $CONTAINER_NAME || true
    
    # Run database migrations
    print_status "Running database migrations..."
    docker run --rm \
        --network careerforge-network \
        --env-file .env.production \
        $DOCKER_IMAGE \
        npx prisma migrate deploy
    
    # Start new container
    print_status "Starting new application container..."
    docker run -d \
        --name $CONTAINER_NAME \
        --network careerforge-network \
        -p 3000:3000 \
        --env-file .env.production \
        --restart unless-stopped \
        $DOCKER_IMAGE
    
    # Health check
    if health_check; then
        print_success "Deployment completed successfully! 🎉"
        
        # Clean up old images
        print_status "Cleaning up old Docker images..."
        docker image prune -f
        
        # Send success notification
        curl -X POST -H 'Content-type: application/json' \
            --data '{"text":"✅ CareerForge AI production deployment successful!"}' \
            $SLACK_WEBHOOK_URL || true
    else
        print_error "Deployment failed - performing rollback"
        rollback
        exit 1
    fi
}

# Trap errors and perform rollback
trap 'print_error "An error occurred during deployment"; rollback' ERR

# Main execution
main() {
    print_status "Production Deployment Script"
    print_status "Environment: $DEPLOYMENT_ENV"
    print_status "Docker Image: $DOCKER_IMAGE"
    print_status "Timestamp: $(date)"
    
    # Perform pre-deployment checks
    check_permissions
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running"
        exit 1
    fi
    
    # Check if environment file exists
    if [ ! -f ".env.production" ]; then
        print_error "Production environment file (.env.production) not found"
        exit 1
    fi
    
    # Start deployment
    deploy
}

# Execute main function
main "$@"
