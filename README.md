<div align="center">

# 🚀 CareerForge AI

**AI-Powered Career Guidance & Mentorship Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18.x%20%7C%2020.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Tech Stack](#tech-stack) • [Contributing](#contributing)

</div>

---

## Overview

CareerForge AI is a comprehensive career development platform that combines artificial intelligence, mentorship matching, and personalized learning paths to help students and early-career professionals navigate their career journeys effectively.

### Key Capabilities

- **🤖 AI Career Advisor**: 24/7 intelligent career guidance powered by Groq LLaMA 3.1 70B and Google Gemini 1.5 Flash
- **👥 Mentorship Matching**: Smart algorithm connects students with industry professionals based on skills, goals, and expertise
- **📊 Skill Assessment**: Interactive quizzes and assessments with AI-generated personalized learning recommendations
- **🎯 Career Planning**: Structured roadmaps with milestones, skill gaps analysis, and curated resources
- **💬 Real-Time Communication**: WebSocket-powered chat for instant mentor-student collaboration
- **🔔 Intelligent Notifications**: Context-aware notifications for sessions, connections, and milestones
- **📈 Progress Analytics**: Comprehensive dashboards tracking skill development, session history, and achievements

---

## Features

### For Students

| Feature | Description |
|---------|-------------|
| **AI Chat Assistant** | Get instant answers to career questions, resume feedback, and interview preparation tips |
| **Mentor Discovery** | Browse verified professionals from top companies, filter by expertise, industry, and experience |
| **Session Booking** | Schedule 1-on-1 video sessions with mentors through integrated calendar |
| **Skill Assessments** | Take quizzes in technical skills, soft skills, and career readiness |
| **Career Roadmap** | Receive AI-generated personalized career plans with actionable milestones |
| **Resource Library** | Access curated courses, articles, and videos tailored to your skill gaps |

### For Mentors

| Feature | Description |
|---------|-------------|
| **Mentor Profile** | Showcase expertise, experience, and availability to attract students |
| **Connection Management** | Review and accept student requests, manage active mentorships |
| **Session Scheduling** | Set availability, manage bookings, and conduct video sessions |
| **Impact Analytics** | Track mentorship impact, session statistics, and student progress |
| **Recognition** | Build reputation through ratings, reviews, and verified mentor badge |

### Platform Features

- **Multi-Role Support**: Students, mentors, and administrators with role-based permissions
- **Email Verification**: Secure mentor onboarding with email verification workflow
- **Password Security**: bcrypt hashing, reset tokens with expiration, secure password requirements
- **Real-Time Updates**: WebSocket connections for instant messaging and typing indicators
- **Responsive Design**: Mobile-first UI built with Tailwind CSS and shadcn/ui components
- **File Upload**: Resume and document upload with PDF parsing for AI analysis
- **Search & Filters**: Advanced filtering for mentor discovery, session history, and analytics
- **Notifications**: Email and in-app notifications for sessions, connections, and achievements

---

## Quick Start

### Prerequisites

- **Node.js**: 18.x or 20.x ([Download](https://nodejs.org/))
- **PostgreSQL**: 14+ ([Download](https://www.postgresql.org/download/)) or use SQLite for development
- **npm** or **pnpm**: Package manager
- **API Keys**: Groq API key ([Get here](https://console.groq.com/)) and optional Google Gemini key

### Installation

**1. Clone Repository**
```bash
git clone https://github.com/yourusername/careerforge-ai.git
cd careerforge-ai
```

**2. Backend Setup**
```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database URL and API keys

# Initialize database
npx prisma generate
npx prisma migrate dev --name init

# Seed test data (optional)
node scripts/seedTestData.js
```

**3. Frontend Setup**
```bash
cd ../frontend
npm install
```

**4. Start Development Servers**

**Terminal 1 - Backend (port 3000):**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend (port 5173):**
```bash
cd frontend
npm run dev
```

**5. Access Application**
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3000/api/v1](http://localhost:3000/api/v1)
- API Documentation: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### Environment Configuration

**Backend `.env` (Required)**
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/careerforge"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"

# AI Models
GROQ_API_KEY="your-groq-api-key"
GEMINI_API_KEY="your-gemini-api-key"  # Optional fallback

# Email Service (Gmail)
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-app-password"

# Application
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:5173"

# Redis (Optional - for production)
REDIS_URL="redis://localhost:6379"
```

**Frontend `.env` (Optional)**
```bash
VITE_API_URL="http://localhost:3000/api/v1"
VITE_WS_URL="ws://localhost:3000"
```

### Docker Deployment

**Quick Start with Docker Compose:**
```bash
docker-compose up -d
```

**Manual Docker Build:**
```bash
# Build backend image
docker build -t careerforge-backend ./backend

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  -e GROQ_API_KEY="your-key" \
  careerforge-backend
```

---

## Documentation

### Core Documentation

- **[📋 Project Overview](docs/PROJECT.md)** - Executive summary, architecture, and features
- **[🎨 Design Documentation](docs/DESIGN.md)** - System design, patterns, and technical architecture
- **[📚 API Reference](docs/API.md)** - Complete REST API and WebSocket documentation
- **[🤝 Contributing Guide](CONTRIBUTING.md)** - Contribution guidelines and workflow

### Additional Resources

- **[Backend README](backend/README.md)** - Backend-specific setup and development
- **[Prisma Schema](prisma/schema.prisma)** - Database schema and relationships
- **[Postman Collection](CareerForge-AI.postman_collection.json)** - API testing collection

---

## Tech Stack

### Backend

| Category | Technologies |
|----------|-------------|
| **Runtime** | Node.js 18/20 |
| **Framework** | Express.js 4.21 |
| **Database** | PostgreSQL 14+ (production), SQLite (development) |
| **ORM** | Prisma 6.0 |
| **Authentication** | JWT, bcrypt |
| **AI Models** | Groq LLaMA 3.1 70B, Google Gemini 1.5 Flash |
| **Real-Time** | Socket.io 4.8 |
| **Email** | Nodemailer with Gmail |
| **File Upload** | Multer |
| **Validation** | Joi |
| **Documentation** | Swagger/OpenAPI |
| **Job Queues** | Bull (Redis) |

### Frontend

| Category | Technologies |
|----------|-------------|
| **Framework** | React 19.0 |
| **Language** | TypeScript 5.6 |
| **Build Tool** | Vite 6.0 |
| **Styling** | Tailwind CSS 3.4 |
| **UI Components** | shadcn/ui, Radix UI |
| **State Management** | Zustand 5.0 |
| **Data Fetching** | TanStack Query (React Query) 5.62 |
| **Routing** | React Router 7.1 |
| **Forms** | React Hook Form 7.54, Zod |
| **Charts** | Recharts 2.15 |
| **Real-Time** | Socket.io Client 4.8 |
| **Markdown** | React Markdown |
| **Icons** | Lucide React |

### DevOps & Infrastructure

| Category | Technologies |
|----------|-------------|
| **CI/CD** | GitHub Actions |
| **Containerization** | Docker, Docker Compose |
| **Deployment** | Railway, Vercel |
| **Monitoring** | Built-in health checks |
| **Logging** | Winston (backend), console (frontend) |
| **Testing** | Jest, React Testing Library |
| **Code Quality** | ESLint, Prettier |
| **Version Control** | Git, GitHub |

---

## Project Structure

```
careerforge-ai/
├── backend/                      # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/          # Request handlers (authController, chatController, etc.)
│   │   ├── routes/               # API routes (authRoutes, mentorshipRoutes, etc.)
│   │   ├── services/             # Business logic (chatService, mentorshipService, etc.)
│   │   ├── middlewares/          # Express middlewares (auth, validation, error handling)
│   │   ├── models/               # Data models and schemas
│   │   ├── utils/                # Utilities (emailService, aiHelper, etc.)
│   │   ├── config/               # Configuration (database, swagger, etc.)
│   │   ├── socket/               # WebSocket handlers
│   │   └── index.js              # Application entry point
│   ├── prisma/
│   │   └── schema.prisma         # Database schema (628 lines, 20+ models)
│   ├── tests/                    # Backend tests
│   ├── package.json              # Dependencies and scripts
│   └── Dockerfile                # Docker configuration
│
├── frontend/                     # React TypeScript frontend
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── ui/               # Reusable UI components (shadcn/ui)
│   │   │   ├── chat/             # Chat interface components
│   │   │   ├── mentor/           # Mentorship-related components
│   │   │   └── dashboard/        # Dashboard components
│   │   ├── pages/                # Page components
│   │   │   ├── Auth/             # Login, Register, Reset Password
│   │   │   ├── Dashboard/        # Main dashboard
│   │   │   ├── Chat/             # AI chat interface
│   │   │   ├── Mentorship/       # Mentor discovery and connections
│   │   │   ├── Quiz/             # Skill assessments
│   │   │   └── Career/           # Career planning
│   │   ├── store/                # Zustand state management
│   │   │   ├── authStore.ts      # Authentication state
│   │   │   ├── chatStore.ts      # Chat state
│   │   │   └── notificationStore.ts  # Notifications
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useAuth.ts        # Authentication hook
│   │   │   ├── useSocket.ts      # WebSocket hook
│   │   │   └── useNotifications.ts  # Notifications hook
│   │   ├── lib/                  # Libraries & utilities
│   │   │   ├── api.ts            # API client (axios)
│   │   │   └── utils.ts          # Helper functions
│   │   ├── types/                # TypeScript type definitions
│   │   └── App.tsx               # Root component
│   ├── package.json              # Dependencies and scripts
│   └── vite.config.ts            # Vite configuration
│
├── docs/                         # Documentation
│   ├── PROJECT.md                # Project overview and architecture
│   ├── DESIGN.md                 # Design patterns and technical details
│   └── API.md                    # API reference
│
├── scripts/                      # Utility scripts
│   ├── seedTestData.js           # Database seeding
│   ├── backup-database.ps1       # Database backup
│   └── deploy-production.sh      # Deployment script
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml             # GitHub Actions CI/CD pipeline
│
├── docker-compose.yml            # Docker Compose configuration
├── railway.toml                  # Railway deployment config
└── README.md                     # This file
```

---

## Available Scripts

### Backend

```bash
cd backend

# Development
npm run dev                 # Start development server with nodemon (port 3000)
npm start                   # Start production server
npm test                    # Run test suite

# Database
npm run db:generate         # Generate Prisma client
npm run db:migrate          # Run database migrations
npm run db:studio           # Open Prisma Studio (GUI)
npm run db:seed             # Seed database with test data
npm run db:reset            # Reset database (WARNING: deletes all data)

# Code Quality
npm run lint                # Run ESLint
npm run format              # Format code with Prettier
```

### Frontend

```bash
cd frontend

# Development
npm run dev                 # Start development server (port 5173)
npm run build               # Build for production
npm run preview             # Preview production build
npm run lint                # Run ESLint
npm run type-check          # TypeScript type checking
```

### CI/CD

```bash
# GitHub Actions automatically runs on push/PR:
# - Backend tests (Node 18.x, 20.x)
# - Frontend build (Node 18.x, 20.x)
# - Code quality checks (ESLint, TypeScript)
# - Database validation (Prisma)
# - Deployment to Railway/Vercel
```

---

## Development Workflow

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

**Commit Message Convention:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Testing

**Backend Tests:**
```bash
cd backend

# Run all tests
npm test

# Run specific test file
npm test -- tests/authController.test.js

# Watch mode
npm test -- --watch
```

**Manual API Testing:**
```bash
# Use Postman collection
# Import: CareerForge-AI.postman_collection.json

# Or use test scripts
node test-auth.js          # Test authentication flow
node test-chat.js          # Test AI chat functionality
node test-quiz-flow.js     # Test quiz system
```

### Code Quality

**Linting:**
```bash
# Backend
cd backend && npm run lint

# Frontend
cd frontend && npm run lint

# Auto-fix
npm run lint -- --fix
```

**Type Checking:**
```bash
cd frontend && npm run type-check
```

---

## Deployment

### Railway (Backend)

**Automated Deployment:**
```bash
# Push to main branch triggers automatic deployment
git push origin main

# Or use Railway CLI
railway up
```

**Manual Deployment:**
1. Create Railway project
2. Add PostgreSQL database
3. Configure environment variables
4. Connect GitHub repository
5. Deploy from `main` branch

**Environment Variables (Production):**
- `DATABASE_URL` - Provided by Railway PostgreSQL
- `JWT_SECRET` - Generate secure random string
- `GROQ_API_KEY` - Your Groq API key
- `FRONTEND_URL` - Your frontend URL (e.g., `https://yourapp.vercel.app`)
- `NODE_ENV=production`

### Vercel (Frontend)

**Automated Deployment:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend && vercel --prod
```

**Manual Deployment:**
1. Import project from GitHub
2. Set root directory to `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variables: `VITE_API_URL`, `VITE_WS_URL`

---

## API Usage Examples

### Authentication

```javascript
// Register new user
const response = await fetch('http://localhost:3000/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePass123!'
  })
});

const data = await response.json();
console.log(data.data.user);

// Login
const loginResponse = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'SecurePass123!'
  })
});

const { token } = await loginResponse.json();
```

### AI Chat

```javascript
// Send message to AI
const chatResponse = await fetch('http://localhost:3000/api/v1/chat/message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: 'What skills do I need to become a software engineer?',
    sessionId: 'new' // or existing session ID
  })
});

const chatData = await chatResponse.json();
console.log(chatData.data.reply);
```

### WebSocket Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token }
});

// Join chat room
socket.emit('join-room', roomId);

// Send message
socket.emit('send-message', {
  roomId,
  content: 'Hello!',
  messageType: 'TEXT'
});

// Receive messages
socket.on('new-message', (message) => {
  console.log('New message:', message);
});

// Typing indicators
socket.emit('typing', { roomId });
socket.on('user-typing', ({ userId }) => {
  console.log(`User ${userId} is typing...`);
});
```

---

## Troubleshooting

### Common Issues

**Issue: Database connection error**
```bash
# Check PostgreSQL is running
# Verify DATABASE_URL in .env
# For SQLite, use: DATABASE_URL="file:./prisma/dev.db"

# Regenerate Prisma client
cd backend
npx prisma generate
```

**Issue: JWT token expired**
```bash
# Token expires after 7 days
# User needs to log in again
# Check JWT_EXPIRES_IN in .env
```

**Issue: CORS errors in development**
```bash
# Backend allows localhost:5173 by default
# Check FRONTEND_URL in backend/.env
# Verify frontend is running on port 5173
```

**Issue: AI API not working**
```bash
# Check GROQ_API_KEY is set correctly
# Verify API key has credits
# Check Groq API status: https://status.groq.com/
```

**Issue: WebSocket connection failed**
```bash
# Check backend is running
# Verify WS_URL in frontend
# Check firewall/proxy settings
```

**Issue: Email not sending**
```bash
# Gmail requires App Password (not regular password)
# Enable 2FA: https://myaccount.google.com/security
# Generate App Password: https://myaccount.google.com/apppasswords
```

### Debug Mode

**Enable verbose logging:**
```bash
# Backend
DEBUG=* npm run dev

# View Prisma queries
DATABASE_URL="postgresql://...?connection_limit=5&pool_timeout=20&log_level=query"
```

---

## Performance Optimization

### Backend

- **Database Indexing**: Prisma schema includes indexes on frequently queried fields
- **Query Optimization**: Use Prisma's `include` and `select` to fetch only needed data
- **Caching**: Redis caching for frequently accessed data (optional)
- **Connection Pooling**: Prisma connection pooling configured for production
- **Rate Limiting**: Built-in rate limiting on API endpoints

### Frontend

- **Code Splitting**: Vite automatically splits code by routes
- **Lazy Loading**: React.lazy() for large components
- **Image Optimization**: Use WebP format, lazy loading
- **Bundle Size**: Analyze with `npm run build -- --analyze`
- **React Query**: Automatic caching and background refetching

---

## Security

### Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication with 7-day expiration
- **bcrypt**: Password hashing with 12 salt rounds
- **Role-Based Access Control**: Student, Mentor, Admin roles
- **Email Verification**: Mentor verification via email tokens

### Data Protection

- **SQL Injection**: Prisma ORM prevents SQL injection
- **XSS Protection**: React automatically escapes user input
- **CSRF Protection**: SameSite cookies, token validation
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Joi validation on all inputs
- **Secure Headers**: Helmet.js for HTTP headers

### Best Practices

- Never commit `.env` files
- Use environment variables for secrets
- Regularly update dependencies
- Enable 2FA for admin accounts
- Use HTTPS in production
- Implement content security policy

---

## Monitoring & Health Checks

### Health Endpoint

```bash
# Check backend health
curl http://localhost:3000/health

# Response
{
  "status": "ok",
  "timestamp": "2026-02-01T10:30:00.000Z",
  "database": "connected",
  "redis": "connected"
}
```

### Logging

**Backend logs:**
- Request/response logs in development
- Error logs with stack traces
- Database query logs (with DEBUG=*)

**Frontend logs:**
- Console logs in development only
- Error boundary catches React errors
- Network errors logged to console

---

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:

- Code of conduct
- Development workflow
- Pull request process
- Coding standards
- Testing requirements

### Quick Contribution Steps

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** and test thoroughly
4. **Commit**: `git commit -m 'feat: add amazing feature'`
5. **Push**: `git push origin feature/amazing-feature`
6. **Open Pull Request** with detailed description

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Groq AI** - Lightning-fast AI inference
- **Google Gemini** - Multimodal AI capabilities
- **shadcn/ui** - Beautiful UI components
- **Prisma** - Next-generation ORM
- **React Team** - Amazing frontend framework

---

## Contact & Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/careerforge-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/careerforge-ai/discussions)

---

## Roadmap

### v1.1 (Planned)

- [ ] Mobile app (React Native)
- [ ] Video call integration (Jitsi/WebRTC)
- [ ] AI resume builder
- [ ] Job board integration
- [ ] LinkedIn profile analysis
- [ ] Advanced analytics dashboard

### v1.2 (Future)

- [ ] Group mentoring sessions
- [ ] Webinar platform
- [ ] Certification system
- [ ] Community forums
- [ ] Payment integration for premium features

---

<div align="center">

**Built with ❤️ by the CareerForge Team**

[⭐ Star us on GitHub](https://github.com/yourusername/careerforge-ai) • [🐛 Report Bug](https://github.com/yourusername/careerforge-ai/issues) • [✨ Request Feature](https://github.com/yourusername/careerforge-ai/issues)

</div>
