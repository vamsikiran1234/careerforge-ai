# CareerForge AI - Project Documentation

## Table of Contents
- [Executive Summary](#executive-summary)
- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Team & Roles](#team--roles)

---

## Executive Summary

**CareerForge AI** is an enterprise-grade, AI-powered career guidance platform that combines intelligent chatbot assistance, skill gap analysis, mentor matching, and personalized career trajectory planning. Built for students and early-career professionals, the platform leverages machine learning and natural language processing to provide actionable career insights and facilitate meaningful mentor-student connections.

### Key Metrics
- **Target Users**: College students and early-career professionals (0-3 years experience)
- **Platform Type**: Full-stack web application (SaaS)
- **AI Models**: Groq LLaMA 3.1 70B, Google Gemini 1.5 Flash
- **Real-time Features**: WebSocket-based chat, live notifications
- **Scalability**: Microservices-ready architecture with Redis caching

---

## Project Overview

### Problem Statement
Students and early-career professionals face significant challenges in:
- Understanding optimal career paths based on their skills and interests
- Identifying and bridging skill gaps for desired roles
- Finding and connecting with experienced industry mentors
- Making informed decisions about career transitions
- Accessing personalized, context-aware career guidance

### Solution
CareerForge AI addresses these challenges through an integrated platform offering:

1. **Intelligent Career Chatbot**
   - Context-aware conversations using advanced LLMs
   - Conversation branching and threading
   - File analysis (resumes, transcripts)
   - Session management and sharing capabilities

2. **AI-Powered Career Assessment**
   - Comprehensive 5-stage assessment system
   - AI-generated personalized questions
   - Detailed career matching with recommendations
   - Learning path and skill development roadmap
   - Market insights and actionable next steps

3. **Mentor Matching Platform**
   - AI-powered mentor-student matching algorithm
   - Profile verification and rating system
   - Integrated chat and video session scheduling
   - Review and feedback mechanism

4. **Career Trajectory Planning**
   - Personalized milestone generation
   - Resource curation (courses, articles, videos)
   - Progress tracking and goal management
   - Timeline-based achievement planning

### Target Audience

**Primary Users:**
- **Students**: Undergraduates seeking career guidance
- **Early Professionals**: 0-3 years of work experience
- **Career Changers**: Professionals transitioning between roles/industries

**Secondary Users:**
- **Mentors/Alumni**: Industry professionals providing guidance
- **Administrators**: Platform operators managing system health

### Business Value
- **For Students**: Free, accessible career guidance 24/7
- **For Mentors**: Platform to give back and build professional network
- **For Institutions**: Scalable alumni engagement tool
- **For Platform**: Data insights for improving AI models and matching algorithms

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │   Chat   │  │   Quiz   │  │ Mentors  │  │   Career    │ │
│  │   UI     │  │   UI     │  │    UI    │  │  Planner    │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘ │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        State Management (Zustand + React Query)       │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API + WebSocket
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               API Gateway (Express.js)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Auth │ Rate Limit │ CORS │ Security (Helmet)        │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┬──────────────┐
        ▼                ▼                ▼              ▼
┌──────────────┐  ┌──────────┐  ┌──────────────┐  ┌─────────┐
│   Business   │  │    AI    │  │  Real-time   │  │  Queue  │
│    Logic     │  │ Services │  │   Socket.io  │  │  Bull   │
│ (Controllers)│  │ Groq/    │  │  (Chat,      │  │ (Jobs)  │
│              │  │ Gemini   │  │ Notifications)│  │         │
└──────┬───────┘  └─────┬────┘  └──────────────┘  └────┬────┘
       │                │                               │
       └────────────────┼───────────────────────────────┘
                        ▼
           ┌──────────────────────────┐
           │   Data Access Layer      │
           │   (Prisma ORM)           │
           └────────────┬─────────────┘
                        │
            ┌───────────┼───────────┐
            ▼           ▼           ▼
    ┌──────────┐  ┌─────────┐  ┌────────┐
    │ SQLite/  │  │  Redis  │  │  File  │
    │PostgreSQL│  │ (Cache/ │  │Storage │
    │   (DB)   │  │Sessions)│  │(AWS S3)│
    └──────────┘  └─────────┘  └────────┘
```

### Component Architecture

#### Backend Services
1. **Authentication Service**
   - JWT-based authentication
   - Role-based access control (RBAC)
   - Password reset with secure tokens
   - Session management

2. **Chat Service**
   - Multi-model AI integration (Groq, Gemini)
   - Context-aware conversation handling
   - Message threading and branching
   - Session persistence and sharing

3. **Career Assessment Service**
   - AI-powered dynamic question generation (5-stage assessment)
   - Session management with pause/resume capability
   - Comprehensive response analysis using LLM
   - Personalized career recommendations and learning paths
   - Results storage and history tracking

4. **Mentorship Service**
   - Profile creation and verification
   - AI-powered matching algorithm
   - Connection request management
   - Rating and review system

5. **Session Booking Service**
   - Calendar-based availability management
   - Real-time booking and confirmation
   - Conflict detection
   - Automated notifications

6. **Career Planning Service**
   - AI-generated milestone creation
   - Skill gap analysis
   - Resource recommendation
   - Progress tracking

7. **Notification Service**
   - Multi-channel notifications (in-app, email)
   - Real-time delivery via WebSocket
   - Notification preferences
   - Read/unread tracking

8. **Analytics Service**
   - Platform-wide statistics
   - User behavior tracking
   - Mentor performance metrics
   - System health monitoring

#### Frontend Architecture
```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── chat/           # AI Chat interface
│   ├── quiz/           # Quiz/Assessment UI
│   ├── mentors/        # Mentor discovery & profiles
│   ├── sessions/       # Session booking & management
│   ├── career/         # Career planning tools
│   ├── admin/          # Admin dashboards
│   └── common/         # Shared components
├── store/
│   ├── auth.ts         # Authentication state
│   ├── chat.ts         # Chat state & logic
│   ├── mentor.ts       # Mentorship state
│   └── career.ts       # Career planning state
├── hooks/
│   ├── useSocket.ts    # WebSocket management
│   ├── useAuth.ts      # Authentication hooks
│   └── useApi.ts       # API request hooks
├── lib/
│   ├── api-client.ts   # Axios configuration
│   └── utils.ts        # Helper functions
└── types/              # TypeScript definitions
```

### Data Models

#### Core Entities
1. **User**: Authentication and profile data
2. **MentorProfile**: Extended mentor information
3. **MentorConnection**: Mentor-student relationships
4. **ChatRoom**: Private communication channels
5. **ChatMessage**: Individual chat messages
6. **MentorSession**: Scheduled mentoring sessions
7. **CareerGoal**: User career objectives
8. **SkillGap**: Identified skill deficiencies
9. **CareerMilestone**: Progress checkpoints
10. **QuizSession**: Career assessment sessions with 5-stage progression and AI-generated results
11. **QuizQuestion**: Individual assessment questions with user responses per session

*(See [Database Design Document](./DESIGN.md#database-schema) for detailed schema)*

### Security Architecture

```
┌──────────────────────────────────────────────────────┐
│              Security Layers                          │
├──────────────────────────────────────────────────────┤
│ 1. Transport Security (HTTPS/TLS 1.3)               │
│ 2. API Gateway (Rate Limiting, CORS)                │
│ 3. Authentication (JWT with refresh tokens)          │
│ 4. Authorization (RBAC - Student/Mentor/Admin)       │
│ 5. Data Validation (Express-validator)              │
│ 6. SQL Injection Prevention (Prisma ORM)            │
│ 7. XSS Protection (Helmet.js, Content Security)     │
│ 8. Sensitive Data Encryption (bcrypt for passwords) │
│ 9. Audit Logging (Winston logger)                   │
│ 10. Error Masking (Production error responses)      │
└──────────────────────────────────────────────────────┘
```

---

## Core Features

### 1. AI Career Chatbot

**Capabilities:**
- Natural language understanding powered by LLaMA 3.1 70B
- Context retention across conversations
- Multi-turn dialogue with conversation branching
- File upload and analysis (PDF resumes, transcripts)
- Code block rendering with syntax highlighting
- Conversation export (PDF, Markdown, Text)
- Public conversation sharing with password protection

**User Flow:**
```
User Input → Context Analysis → AI Processing → 
Response Generation → UI Rendering → Session Update
```

**Technical Implementation:**
- **Models**: Groq LLaMA 3.1 70B (primary), Google Gemini 1.5 Flash (fallback)
- **Context Window**: Up to 8K tokens with sliding window
- **Response Time**: Average 2-3 seconds
- **Features**: Streaming responses, retry mechanism, error recovery

### 2. AI-Powered Career Assessment System

**Assessment Stages:**
The system conducts a comprehensive 5-stage career assessment with AI-generated questions:
- **SKILLS_ASSESSMENT**: Evaluates technical abilities and current skill levels
- **CAREER_INTERESTS**: Explores what interests and motivates the user
- **PERSONALITY_TRAITS**: Analyzes personality fit for different career paths
- **LEARNING_STYLE**: Understands how the user learns best
- **CAREER_GOALS**: Identifies long-term career objectives and aspirations

**Assessment Flow:**
```
Start Quiz → AI Generates Stage-Specific Questions (5 per stage) → 
User Responds → Progress Through 5 Stages → 
AI Analysis of All Responses → Personalized Career Recommendations
```

**Technical Implementation:**
- **AI-Powered Questions**: Dynamic question generation using Groq LLaMA 3.1 70B / Google Gemini
- **Multi-Stage Process**: 25 total questions (5 questions per stage)
- **Session Persistence**: Resume interrupted assessments from where you left off
- **Intelligent Analysis**: AI analyzes all responses collectively to provide insights

**Features:**
- AI-generated personalized questions based on previous answers
- Real-time progress tracking across 5 assessment stages
- Session management (start, pause, resume, complete)
- Comprehensive career matching with percentage scores
- Detailed skill gap analysis and recommendations
- Learning path generation with phases and timelines
- Market insights (demand, competition, industry trends)
- Assessment history and results archive

**Assessment Results:**
Upon completion, users receive comprehensive AI-generated recommendations including:

1. **Top Career Matches** (3-5 careers):
   - Career title with match percentage (AI-calculated)
   - Detailed role description
   - Why it matches (based on assessment responses)
   - Salary range estimates
   - Growth potential rating (High/Medium/Low)
   - Learning timeline (months to prepare)
   - Required skills list

2. **Skills to Focus On** (4-6 skills):
   - Skill name and priority level (High/Medium/Low)
   - Description of why the skill is important
   - Curated learning resources

3. **Personalized Learning Path**:
   - Multi-phase roadmap (Foundation → Skill Development → Professional Growth)
   - Duration estimates for each phase
   - Topic coverage per phase
   - Recommended resources and platforms

4. **Actionable Next Steps** (5-7 steps):
   - Step-by-step action items
   - Timeline for completion
   - Priority levels
   - Practical guidance (courses, portfolio, networking, etc.)

5. **Market Insights**:
   - Industry demand level
   - Competition assessment
   - Current market trends
   - Remote work opportunities

### 3. Mentorship Platform

**Mentor Discovery:**
- Advanced filtering (expertise, industry, company, experience)
- AI-powered matching based on quiz results and goals
- Profile verification system
- Rating and review aggregation

**Connection Management:**
- Request/Accept/Reject workflow
- Maximum 3 active mentees per mentor
- Connection expiry and renewal
- Message preview and status tracking

**Communication:**
- Real-time WebSocket chat
- File sharing capabilities
- Read receipts and typing indicators
- Chat history and search

**Session Booking:**
- Calendar-based availability setting
- 30-minute time slot booking
- Automated conflict detection
- Email and in-app notifications
- Session rescheduling and cancellation

### 4. Career Trajectory Planner

**Goal Setting:**
- Current position to target role mapping
- Timeline estimation (weeks to years)
- Industry and specialization selection

**AI-Generated Components:**
- **Milestones**: Step-by-step career progression checkpoints
- **Skill Gaps**: Required skills vs current proficiency analysis
- **Resources**: Curated courses, articles, videos, and books
- **Timeline**: Realistic achievement schedule

**Progress Tracking:**
- Milestone completion status
- Skill development progress
- Resource consumption tracking
- Achievement visualization

**Features:**
- Drag-and-drop milestone reordering
- Custom milestone and resource addition
- Export to PDF/Calendar integration
- Sharing capabilities

### 5. Real-time Notifications

**Notification Types:**
- Connection requests (mentor/student)
- Message received
- Session booking/cancellation
- Milestone completion
- Quiz results ready
- System announcements

**Delivery Channels:**
- In-app notifications with badge counts
- Email notifications (configurable)
- Real-time WebSocket push

**Management:**
- Mark as read/unread
- Bulk operations
- Notification preferences
- History and archive

### 6. Analytics & Dashboards

**User Dashboard:**
- Quick stats (sessions, connections, progress)
- Recent activity feed
- Upcoming sessions
- Skill development charts
- Goal progress visualization

**Mentor Dashboard:**
- Active connections overview
- Session statistics
- Rating and review summary
- Availability management
- Earnings tracking (future feature)

**Admin Dashboard:**
- Platform-wide statistics
- User growth trends
- Session analytics
- Mentor performance metrics
- System health monitoring
- Verification queue

---

## Technology Stack

### Backend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Runtime** | Node.js | 18.x/20.x | Server runtime environment |
| **Framework** | Express.js | 4.18.x | Web application framework |
| **Language** | JavaScript | ES2022 | Server-side programming |
| **Database** | SQLite/PostgreSQL | Latest | Relational database |
| **ORM** | Prisma | 6.16.x | Type-safe database client |
| **Caching** | Redis | 7.x | Session storage, caching |
| **Queue** | Bull | 4.x | Background job processing |
| **WebSocket** | Socket.io | 4.x | Real-time bidirectional communication |
| **Authentication** | JWT | 9.x | Stateless authentication |
| **Validation** | Express-validator | 7.x | Request validation |
| **Security** | Helmet.js | 8.x | HTTP header security |
| **Rate Limiting** | Express-rate-limit | 7.x | API rate limiting |
| **Logging** | Winston | 3.x | Application logging |
| **AI/ML** | Groq SDK | 0.32.x | LLaMA 3.1 integration |
| **AI/ML** | Google Generative AI | 0.24.x | Gemini integration |
| **File Upload** | Multer | 2.x | Multipart form handling |
| **Email** | Nodemailer | 6.x | Email delivery |
| **PDF Processing** | pdf-parse | 1.x | PDF text extraction |
| **Monitoring** | Sentry | 10.x | Error tracking |

### Frontend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Runtime** | React | 19.x | UI library |
| **Language** | TypeScript | 5.x | Type-safe development |
| **Build Tool** | Vite | 6.x | Fast build and HMR |
| **State Management** | Zustand | 5.x | Lightweight state management |
| **Data Fetching** | TanStack Query | 5.x | Server state management |
| **Routing** | React Router | 7.x | Client-side routing |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS framework |
| **UI Components** | Headless UI | 2.x | Accessible component primitives |
| **Icons** | Lucide React | 0.525.x | Icon library |
| **Charts** | Recharts | 3.x | Data visualization |
| **Animations** | Framer Motion | 12.x | Animation library |
| **Forms** | React Hook Form | (TBD) | Form state management |
| **Date/Time** | date-fns | 4.x | Date manipulation |
| **Markdown** | react-markdown | 10.x | Markdown rendering |
| **Code Highlighting** | react-syntax-highlighter | 15.x | Code syntax highlighting |
| **HTTP Client** | Axios | 1.x | Promise-based HTTP client |
| **WebSocket Client** | Socket.io-client | 4.x | Real-time client |
| **Monitoring** | Sentry React | 10.x | Error tracking |

### Development & DevOps

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Version Control** | Git + GitHub | Source code management |
| **CI/CD** | GitHub Actions | Automated testing and deployment |
| **Containerization** | Docker | Application containerization |
| **Orchestration** | Docker Compose | Local development environment |
| **Testing (Backend)** | Jest | Unit and integration testing |
| **Testing (Frontend)** | Vitest | Fast unit testing |
| **Code Quality** | ESLint | JavaScript/TypeScript linting |
| **Code Formatting** | Prettier | Code formatting |
| **Documentation** | Markdown | Technical documentation |
| **API Testing** | Postman | Manual API testing |
| **Package Manager** | npm | Dependency management |

### Infrastructure (Production)

| Service | Provider | Purpose |
|---------|----------|---------|
| **Hosting** | Railway/Render | Application hosting |
| **Database** | PostgreSQL | Production database |
| **Caching** | Redis Cloud | Managed Redis instance |
| **File Storage** | AWS S3 | Static file storage |
| **CDN** | CloudFlare | Content delivery |
| **Email** | SendGrid/AWS SES | Transactional emails |
| **Monitoring** | Sentry | Error tracking and monitoring |
| **Analytics** | (TBD) | User analytics |
| **Domain** | (TBD) | Custom domain |
| **SSL** | Let's Encrypt | HTTPS certificates |

---

## Development Workflow

### Environment Setup

1. **Prerequisites:**
   ```bash
   Node.js 18.x or 20.x
   npm 9.x or higher
   Git 2.x
   Docker & Docker Compose (optional)
   PostgreSQL 14+ (production)
   Redis 7+ (production)
   ```

2. **Installation:**
   ```bash
   # Clone repository
   git clone https://github.com/vamsikiran1234/careerforge-ai.git
   cd careerforge-ai
   
   # Backend setup
   cd backend
   npm install
   cp .env.example .env
   # Configure .env with your credentials
   npx prisma generate
   npx prisma migrate dev
   npm run dev
   
   # Frontend setup (new terminal)
   cd frontend
   npm install
   npm run dev
   ```

3. **Environment Variables:**
   - `DATABASE_URL`: Database connection string
   - `JWT_SECRET`: Secret key for JWT signing
   - `GROQ_API_KEY`: Groq AI API key
   - `GEMINI_API_KEY`: Google Gemini API key
   - `REDIS_URL`: Redis connection string
   - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: AWS credentials
   - `SENDGRID_API_KEY`: SendGrid email API key
   - `SENTRY_DSN`: Sentry error tracking DSN

### Git Workflow

**Branch Strategy:**
```
main            # Production-ready code
  └── vamsi     # Development branch
      ├── feature/chat-improvements
      ├── feature/mentor-matching
      ├── bugfix/quiz-scoring
      └── hotfix/security-patch
```

**Commit Convention:**
```
feat: Add career milestone drag-and-drop
fix: Resolve quiz scoring calculation error
docs: Update API documentation
style: Format code with Prettier
refactor: Optimize mentor matching algorithm
test: Add unit tests for chat service
chore: Update dependencies
```

### Testing Strategy

**Backend Testing:**
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Coverage report
npm run test:coverage
```

**Frontend Testing:**
```bash
# Component tests
npm run test

# E2E tests
npm run test:e2e
```

**Manual Testing:**
- Postman collection for API endpoints
- Browser DevTools for frontend debugging
- WebSocket testing tools (Socket.io client)

### Code Quality

**Linting:**
```bash
# Backend
cd backend && npm run lint

# Frontend
cd frontend && npm run lint
```

**Formatting:**
```bash
# Backend
cd backend && npm run format

# Frontend
cd frontend && npm run format
```

**Type Checking:**
```bash
# Frontend (TypeScript)
cd frontend && npm run type-check
```

### CI/CD Pipeline

**GitHub Actions Workflows:**

1. **PR Checks** (`.github/workflows/pr-check.yml`)
   - Code linting
   - Type checking
   - Unit tests
   - Build verification

2. **CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)
   - Multi-node version testing (18.x, 20.x)
   - Backend tests and build
   - Frontend tests and build
   - Code quality analysis
   - Database migration validation
   - Deployment readiness check

**Deployment Flow:**
```
Code Push → Tests → Build → Deploy to Staging → 
Manual Approval → Deploy to Production
```

---

## Deployment

### Development Environment
```bash
# Using Docker Compose
docker-compose up -d

# Access
Frontend: http://localhost:5173
Backend: http://localhost:3000
Database: localhost:5432 (PostgreSQL)
Redis: localhost:6379
```

### Production Deployment

**Railway/Render Deployment:**
1. Connect GitHub repository
2. Configure environment variables
3. Set build and start commands
4. Deploy

**Build Commands:**
```bash
# Backend
npm install && npx prisma generate && npx prisma migrate deploy

# Frontend
npm install && npm run build
```

**Health Checks:**
- Backend: `GET /health`
- Frontend: Automatic via hosting provider

**Monitoring:**
- Error tracking: Sentry
- Uptime monitoring: (TBD)
- Performance monitoring: (TBD)

### Database Migrations

```bash
# Create migration
npx prisma migrate dev --name add_feature

# Apply to production
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

---

## Team & Roles

### Current Team
- **Vamsi**: Full-stack Developer, Project Lead
- **Contributors**: Open for contributions

### Development Phases

**Phase 1-2: Foundation** ✅
- User authentication
- AI chatbot with conversation management
- 5-stage career assessment system with AI-generated questions and personalized recommendations

**Phase 3-5: Mentorship Platform** ✅
- Mentor profiles and verification
- Connection management
- Real-time chat
- Session booking
- Review system

**Phase 6-8: Enhanced Features** ✅
- Notifications
- Analytics dashboards
- Career trajectory planner

**Future Roadmap:**
- Mobile applications (React Native)
- Payment integration for premium features
- Video calling integration
- AI resume builder
- Job board integration
- Company partnerships
- Machine learning model improvements
- Advanced analytics and insights

---

## License

MIT License - See [LICENSE](../LICENSE) file for details.

---

## Contributing

Contributions are welcome! Please read our contributing guidelines and code of conduct before submitting pull requests.

### How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

---

*Last Updated: February 2026*
