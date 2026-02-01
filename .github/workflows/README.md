# GitHub Actions Workflows

This directory contains CI/CD workflows for CareerForge AI platform.

## Workflows

### 1. CI/CD Pipeline (`ci-cd.yml`)
**Triggers:** Push to `main`, `vamsi`, `develop` branches or Pull Requests

**Jobs:**
- **Backend Build & Test**
  - Runs on Node.js 18.x and 20.x
  - Installs dependencies
  - Generates Prisma client
  - Runs migrations check
  - Executes linting and tests
  - Creates build artifacts

- **Frontend Build & Test**
  - Runs on Node.js 18.x and 20.x
  - Installs dependencies
  - Type checking with TypeScript
  - Linting validation
  - Production build
  - Uploads build artifacts

- **Code Quality Analysis**
  - Checks for merge conflicts
  - Validates file sizes
  - Security audit for dependencies
  - Code quality metrics

- **Database Migration Validation**
  - Validates Prisma schema
  - Checks migration status
  - Ensures database compatibility

- **Deployment Readiness Check**
  - Verifies environment configuration
  - Checks Docker setup
  - Validates Railway configuration
  - Confirms deployment readiness

### 2. Pull Request Check (`pr-check.yml`)
**Triggers:** Pull Request events (opened, synchronized, reopened)

**Jobs:**
- **PR Validation**
  - Validates PR title and description
  - Checks for file changes
  - Validates commit messages

- **Quick Build Check**
  - Fast backend dependency check
  - Frontend build validation

## Status Badges

Add these to your README.md to show workflow status:

```markdown
![CI/CD Pipeline](https://github.com/vamsikiran1234/careerforge-ai/actions/workflows/ci-cd.yml/badge.svg)
![PR Check](https://github.com/vamsikiran1234/careerforge-ai/actions/workflows/pr-check.yml/badge.svg)
```

## How to View Workflows

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. You'll see all workflow runs listed

## Secrets Required

Configure these in GitHub repository settings (Settings > Secrets and variables > Actions):

- `VITE_API_URL` - Frontend API URL for production builds

## Local Testing

You can test workflows locally using [act](https://github.com/nektos/act):

```bash
# Install act
winget install nektos.act

# Test the CI/CD workflow
act push

# Test PR workflow
act pull_request
```

## Troubleshooting

### Workflows not appearing?
1. Ensure files are in `.github/workflows/` directory
2. Check YAML syntax is valid
3. Verify Actions are enabled in repository settings
4. Make sure workflows are committed and pushed

### Build failures?
1. Check the workflow run logs in Actions tab
2. Verify all dependencies are listed in package.json
3. Ensure Node.js version matches your local environment
4. Check for environment variable requirements

## Workflow Customization

To modify workflows:
1. Edit the `.yml` files in this directory
2. Test changes on a feature branch first
3. Commit and push to trigger the workflow
4. Review results in Actions tab

## Best Practices

✅ Always test on feature branches before merging to main
✅ Keep workflow files simple and maintainable
✅ Use caching to speed up builds
✅ Add meaningful job and step names
✅ Use matrix strategy for multiple Node.js versions
✅ Implement proper error handling
✅ Upload artifacts for debugging
