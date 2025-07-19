# CareerForge AI - CI/CD Pipeline Documentation

## 🚀 Continuous Integration & Continuous Deployment

This document outlines the complete CI/CD pipeline implementation for CareerForge AI, including automated testing, building, and deployment processes.

## 📋 Table of Contents

- [Pipeline Overview](#pipeline-overview)
- [GitHub Actions Workflow](#github-actions-workflow)
- [Docker Configuration](#docker-configuration)
- [Environment Management](#environment-management)
- [Deployment Scripts](#deployment-scripts)
- [Monitoring & Rollback](#monitoring--rollback)
- [Local Development](#local-development)

## 🔄 Pipeline Overview

The CI/CD pipeline consists of the following stages:

```mermaid
graph LR
    A[Code Push] --> B[Lint & Test]
    B --> C[Security Audit]
    C --> D[Build]
    D --> E[Docker Image]
    E --> F[Deploy to Staging]
    F --> G[Deploy to Production]
    G --> H[Health Check]
    H --> I[Notification]
```

### Pipeline Features

- ✅ **Automated Testing**: Run 46 comprehensive tests on every push/PR
- ✅ **Code Quality**: ESLint, Prettier, and security audits
- ✅ **Multi-Environment**: Separate staging and production deployments
- ✅ **Docker Support**: Containerized deployments with multi-stage builds
- ✅ **Health Checks**: Automated application health monitoring
- ✅ **Rollback Capability**: Automatic rollback on deployment failures
- ✅ **Notifications**: Slack/Discord integration for deployment status

## 🔧 GitHub Actions Workflow

### Workflow File: `.github/workflows/ci-cd.yml`

The main workflow includes the following jobs:

#### 1. **Test Job**
- Runs on Ubuntu with PostgreSQL service
- Executes all 46 tests with coverage reporting
- Uploads coverage to Codecov

#### 2. **Lint Job**
- Code quality checks with ESLint
- Code formatting validation with Prettier

#### 3. **Security Job**
- NPM audit for vulnerabilities
- Snyk security scanning

#### 4. **Build Job**
- Creates production build artifacts
- Only runs on main branch pushes

#### 5. **Docker Job**
- Builds and pushes Docker images to GitHub Container Registry
- Uses multi-stage builds for optimization

#### 6. **Deploy Jobs**
- **Staging**: Deploys on `develop` branch
- **Production**: Deploys on `main` branch
- Uses GitHub Environments for approval gates

#### 7. **Notification Job**
- Sends deployment status notifications
- Supports Slack, Discord, and email

### Triggering the Pipeline

```bash
# Trigger on push to main (production deployment)
git push origin main

# Trigger on push to develop (staging deployment)
git push origin develop

# Trigger on pull request (tests only)
git push origin feature/your-feature
```

## 🐳 Docker Configuration

### Multi-Stage Dockerfile

The project uses a multi-stage Dockerfile for optimized builds:

```dockerfile
# Development stage
FROM node:18-alpine AS dev
# ... development configuration

# Build stage
FROM base AS builder
# ... build process

# Production stage
FROM base AS runner
# ... production runtime
```

### Docker Compose

- **Development**: `docker-compose.yml`
- **Production**: `docker-compose.prod.yml`

```bash
# Development
npm run docker:dev

# Production
npm run docker:prod
```

## 🌍 Environment Management

### Environment Files

| Environment | File | Purpose |
|-------------|------|---------|
| Development | `.env` | Local development |
| Testing | `.env.test` | Automated testing |
| Staging | `.env.staging` | Staging environment |
| Production | `.env.production` | Production environment |

### Environment Variables

Key environment variables required:

```bash
# Application
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Authentication
JWT_SECRET=your-jwt-secret

# External Services
OPENAI_API_KEY=your-openai-key
REDIS_URL=redis://localhost:6379

# Feature Flags
FEATURE_CHAT_ENABLED=true
FEATURE_QUIZ_ENABLED=true
FEATURE_MENTOR_MATCHING=true
```

## 📝 Deployment Scripts

### Production Deployment

```bash
# Automated deployment (via CI/CD)
npm run deploy:prod

# Manual deployment
./scripts/deploy-production.sh
```

### Development Setup

```bash
# Quick setup
npm run deploy:setup

# Manual setup
./scripts/setup-development.sh
```

### Script Features

- ✅ **Database Backup**: Automatic backup before deployments
- ✅ **Health Checks**: Verify application health post-deployment
- ✅ **Rollback**: Automatic rollback on failure
- ✅ **Notifications**: Status updates via webhooks
- ✅ **Logging**: Comprehensive deployment logs

## 📊 Monitoring & Rollback

### Health Checks

The application includes comprehensive health checks:

```javascript
// Health check endpoint
GET /health

// Response
{
  "status": "healthy",
  "timestamp": "2024-01-19T12:00:00Z",
  "uptime": 3600,
  "database": "connected",
  "redis": "connected"
}
```

### Automatic Rollback

Rollback triggers:
- Failed health checks (30 attempts over 60 seconds)
- Application startup failures
- Database connection issues

```bash
# Manual rollback
docker run careerforge-ai:previous
```

### Monitoring Stack

Optional monitoring integration:
- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboards
- **Sentry**: Error tracking
- **LogDNA**: Log aggregation

## 💻 Local Development

### Quick Start

```bash
# Clone repository
git clone <repository-url>
cd careerforge-ai

# Setup development environment
npm run deploy:setup

# Start development server
npm run dev
```

### Development Commands

```bash
# Testing
npm test                 # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage

# Code Quality
npm run lint            # Check code style
npm run lint:fix        # Fix style issues
npm run format         # Format code

# Database
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run migrations
npm run db:seed         # Seed database

# Docker
npm run docker:build    # Build image
npm run docker:run      # Run container
npm run docker:dev      # Development with Docker
```

### Testing Coverage

Current test coverage: **100%** (46/46 tests passing)

| Test Suite | Tests | Status |
|------------|-------|--------|
| Health API | 11 | ✅ PASS |
| Quiz API | 12 | ✅ PASS |
| Mentor API | 18 | ✅ PASS |
| Chat API | 5 | ✅ PASS |

## 🔐 Security

### Security Measures

- **Dependency Scanning**: NPM audit + Snyk
- **Code Analysis**: ESLint security rules
- **Container Security**: Non-root user, minimal base image
- **Environment Isolation**: Separate staging/production
- **Secret Management**: GitHub Secrets for sensitive data

### Required Secrets

Configure these secrets in GitHub repository settings:

```bash
# Database
DATABASE_URL
JWT_SECRET

# External Services
OPENAI_API_KEY
SNYK_TOKEN

# Notifications
SLACK_WEBHOOK_URL
DISCORD_WEBHOOK_URL

# Cloud Providers (if using)
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
HEROKU_API_KEY
```

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build logs
npm run build

# Verify dependencies
npm ci
npm audit fix
```

#### Test Failures
```bash
# Run specific test suite
npm test -- --testNamePattern="mentor"

# Debug test environment
npm run test:watch
```

#### Deployment Issues
```bash
# Check container logs
docker logs careerforge-app

# Verify environment variables
docker exec careerforge-app env

# Test health endpoint
curl http://localhost:3000/health
```

#### Database Connection
```bash
# Test database connection
npx prisma db pull

# Reset database
npx prisma migrate reset
```

## 📞 Support

For deployment and CI/CD issues:

1. **Check GitHub Actions logs**: Go to Actions tab in repository
2. **Review container logs**: `docker logs <container-name>`
3. **Test locally**: Ensure tests pass locally before deployment
4. **Verify environment**: Check all required environment variables

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-19 | Initial CI/CD pipeline implementation |
| | | - GitHub Actions workflow |
| | | - Docker multi-stage builds |
| | | - Automated testing (46 tests) |
| | | - Environment management |
| | | - Deployment scripts |

---

**Next Steps**: The CI/CD pipeline is now fully implemented and ready for production use. The system provides automated testing, building, and deployment with comprehensive monitoring and rollback capabilities.
