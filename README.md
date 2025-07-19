# 🚀 CareerForge AI

[![CI/CD Pipeline](https://github.com/your-username/careerforge-ai/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/your-username/careerforge-ai/actions/workflows/ci-cd.yml)
[![Test Coverage](https://codecov.io/gh/your-username/careerforge-ai/branch/main/graph/badge.svg)](https://codecov.io/gh/your-username/careerforge-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> An AI-powered career guidance platform that provides personalized mentorship, skill assessments, and career recommendations through intelligent chatbot interactions.

## ✨ Features

- 🤖 **AI-Powered Chatbot**: Intelligent career guidance using OpenAI GPT
- 📊 **Skill Assessment**: Comprehensive quizzes to evaluate technical and soft skills
- 👥 **Mentor Matching**: Smart algorithm to connect users with suitable mentors
- 🎯 **Personalized Recommendations**: Tailored career paths based on skills and interests
- 📈 **Progress Tracking**: Monitor learning journey and skill development
- 🔐 **Secure Authentication**: JWT-based user authentication and authorization
- 🚀 **Production Ready**: Complete CI/CD pipeline with automated testing and deployment

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │   Express API   │    │   PostgreSQL    │
│                 │◄──►│                 │◄──►│                 │
│  - Chat UI      │    │  - REST APIs    │    │  - User Data    │
│  - Quiz System  │    │  - AI Service   │    │  - Quiz Data    │
│  - Dashboard    │    │  - Auth System  │    │  - Mentor Data  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                ▲
                                │
                       ┌─────────────────┐
                       │   OpenAI API    │
                       │                 │
                       │  - GPT Models   │
                       │  - Chat Engine  │
                       └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- npm or yarn
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/careerforge-ai.git
cd careerforge-ai

# Install dependencies
npm install

# Setup development environment
npm run deploy:setup

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Environment Configuration

Create a `.env` file with the following variables:

```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/careerforge_dev
JWT_SECRET=your-jwt-secret-key
OPENAI_API_KEY=your-openai-api-key
```

## 📊 API Endpoints

### Health Check
```http
GET /health
```

### Authentication
```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
```

### Chat System
```http
POST /api/v1/chat
GET /api/v1/chat/sessions/:userId
GET /api/v1/chat/session/:sessionId
PUT /api/v1/chat/session/:sessionId/end
```

### Quiz System
```http
POST /api/v1/quiz/start
POST /api/v1/quiz/:quizId/answer
GET /api/v1/quiz/session/:sessionId
GET /api/v1/quiz/sessions/:userId
DELETE /api/v1/quiz/:quizId
```

### Mentor Matching
```http
GET /api/v1/mentors
GET /api/v1/mentors/:id
POST /api/v1/mentors
PUT /api/v1/mentors/:id
DELETE /api/v1/mentors/:id
POST /api/v1/mentors/match
```

## 🧪 Testing

The project includes comprehensive test coverage (100% - 46/46 tests passing):

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test suite
npm test -- --testNamePattern="mentor"
```

### Test Suites

| Test Suite | Tests | Coverage |
|------------|-------|----------|
| Health API | 11 | 100% |
| Quiz API | 12 | 100% |
| Mentor API | 18 | 100% |
| Chat API | 5 | 100% |

## 🐳 Docker Support

### Development with Docker

```bash
# Start development environment
npm run docker:dev

# Build Docker image
npm run docker:build

# Run production container
npm run docker:run
```

### Docker Compose

```bash
# Start all services (app + database + redis)
docker-compose up

# Production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## 🚀 Deployment

### CI/CD Pipeline

The project includes a complete CI/CD pipeline with GitHub Actions:

- ✅ **Automated Testing**: Runs on every push/PR
- ✅ **Code Quality**: ESLint, Prettier, security audits
- ✅ **Multi-Environment**: Staging and production deployments
- ✅ **Docker**: Containerized deployments
- ✅ **Health Checks**: Automated monitoring
- ✅ **Rollback**: Automatic failure recovery

### Manual Deployment

```bash
# Production deployment
npm run deploy:prod

# Staging deployment
git push origin develop
```

For detailed deployment instructions, see [CI/CD Documentation](./docs/CI-CD-DEPLOYMENT.md).

## 📁 Project Structure

```
careerforge-ai/
├── src/
│   ├── controllers/         # Business logic
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── services/           # External services
│   ├── utils/              # Utility functions
│   └── server.js           # Application entry point
├── tests/                  # Test files
├── prisma/                 # Database schema and migrations
├── scripts/                # Build and deployment scripts
├── .github/workflows/      # CI/CD pipelines
├── docs/                   # Documentation
└── docker-compose.yml      # Docker configuration
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev                 # Start development server
npm run build              # Build for production
npm run start              # Start production server

# Testing
npm test                   # Run tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report

# Code Quality
npm run lint               # Check code style
npm run lint:fix           # Fix style issues
npm run format             # Format code

# Database
npm run db:generate        # Generate Prisma client
npm run db:migrate         # Run migrations
npm run db:seed            # Seed database

# Docker
npm run docker:dev         # Development with Docker
npm run docker:prod        # Production deployment
```

### Code Quality

The project enforces code quality through:

- **ESLint**: JavaScript/Node.js linting
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **Jest**: Unit and integration testing
- **Prisma**: Type-safe database operations

## 🔐 Security

Security measures implemented:

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API request throttling
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Joi schema validation
- **SQL Injection Protection**: Prisma ORM
- **Dependency Scanning**: NPM audit + Snyk

## 📈 Performance

Performance optimizations:

- **Database Indexing**: Optimized query performance
- **Caching**: Redis integration for session management
- **Compression**: Gzip response compression
- **Connection Pooling**: Efficient database connections
- **Docker Multi-stage**: Optimized container builds

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow

1. **Setup**: Run `npm run deploy:setup`
2. **Development**: Use `npm run dev` for hot reloading
3. **Testing**: Ensure all tests pass with `npm test`
4. **Linting**: Fix code style with `npm run lint:fix`
5. **Documentation**: Update relevant documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for the GPT API
- [Prisma](https://prisma.io/) for the database toolkit
- [Express.js](https://expressjs.com/) for the web framework
- [Jest](https://jestjs.io/) for the testing framework

## 📞 Support

- **Documentation**: [Comprehensive guides](./docs/)
- **Issues**: [GitHub Issues](https://github.com/your-username/careerforge-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/careerforge-ai/discussions)

## 🔗 Links

- **Live Demo**: [https://careerforge-ai.vercel.app](https://careerforge-ai.vercel.app)
- **API Documentation**: [https://api.careerforge-ai.com/docs](https://api.careerforge-ai.com/docs)
- **Status Page**: [https://status.careerforge-ai.com](https://status.careerforge-ai.com)

---

**CareerForge AI** - Empowering careers through artificial intelligence 🚀
