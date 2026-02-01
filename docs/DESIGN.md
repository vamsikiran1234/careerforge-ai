# CareerForge AI - Design Document

## Table of Contents
- [System Design Overview](#system-design-overview)
- [Architecture Patterns](#architecture-patterns)
- [Database Schema](#database-schema)
- [API Design](#api-design)
- [Frontend Architecture](#frontend-architecture)
- [Real-time Communication](#real-time-communication)
- [AI Integration](#ai-integration)
- [Security Design](#security-design)
- [Performance Optimization](#performance-optimization)
- [Scalability](#scalability)

---

## System Design Overview

### Design Principles

1. **Separation of Concerns**: Clear boundaries between presentation, business logic, and data access layers
2. **Single Responsibility**: Each module/component has a well-defined, focused purpose
3. **DRY (Don't Repeat Yourself)**: Reusable components and utilities
4. **SOLID Principles**: Especially Open/Closed and Dependency Inversion
5. **Security by Design**: Security considerations at every layer
6. **Performance First**: Optimized queries, caching strategies, lazy loading
7. **User-Centric**: UX-driven design decisions

### Technology Choices & Rationale

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Backend Framework** | Express.js | Mature, minimal, flexible, excellent middleware ecosystem |
| **Frontend Library** | React 19 | Component-based, large ecosystem, virtual DOM optimization |
| **Language** | JavaScript/TypeScript | Universal language, strong typing (TS), excellent tooling |
| **Database** | SQLite/PostgreSQL | Relational data fits our domain, ACID compliance, Prisma ORM support |
| **ORM** | Prisma | Type-safe, excellent DX, auto-generated client, migration tools |
| **State Management** | Zustand | Lightweight, minimal boilerplate, React hooks integration |
| **Build Tool** | Vite | Fast HMR, modern ES modules, optimized production builds |
| **Styling** | Tailwind CSS | Utility-first, design consistency, minimal CSS bloat |
| **WebSocket** | Socket.io | Reliable, fallback mechanisms, room support |
| **Caching** | Redis | In-memory speed, pub/sub for real-time, session storage |
| **Queue** | Bull | Redis-based, retry logic, job scheduling, monitoring |

---

## Architecture Patterns

### Backend Architecture

#### Layered Architecture

```
┌─────────────────────────────────────────────┐
│           Presentation Layer                 │
│  (Routes, Request/Response Handling)         │
│  • Express Routes                            │
│  • Request Validation (express-validator)   │
│  • Response Formatting                       │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│           Business Logic Layer               │
│  (Controllers, Services)                     │
│  • Controllers: Request orchestration        │
│  • Services: Core business logic             │
│  • Utilities: Helper functions               │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│           Data Access Layer                  │
│  (Prisma ORM, Database Models)              │
│  • Prisma Client                             │
│  • Database Queries                          │
│  • Transaction Management                    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│           Data Layer                         │
│  (SQLite/PostgreSQL, Redis)                 │
│  • Persistent Storage                        │
│  • Cache                                     │
│  • Session Store                             │
└─────────────────────────────────────────────┘
```

#### Service-Oriented Design

Each major feature is implemented as a service module:

```javascript
// services/mentorshipService.js
class MentorshipService {
  async createMentorProfile(userId, profileData) { /* ... */ }
  async verifyMentor(token) { /* ... */ }
  async findMentors(filters, studentProfile) { /* ... */ }
  async matchMentorStudent(mentorId, studentId) { /* ... */ }
  async sendConnectionRequest(mentorId, studentId, message) { /* ... */ }
  async acceptConnection(connectionId, mentorId) { /* ... */ }
}

module.exports = new MentorshipService();
```

**Benefits:**
- Testable: Easy to mock and unit test
- Reusable: Services can be used across controllers
- Maintainable: Centralized business logic
- Scalable: Can be extracted to microservices

### Frontend Architecture

#### Component Architecture

```
┌─────────────────────────────────────────────────────┐
│                    App Component                     │
│  • Router configuration                              │
│  • Global providers (Auth, Theme)                    │
│  • Error boundaries                                  │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
┌─────────────┐  ┌──────────┐  ┌──────────────┐
│   Layouts   │  │   Pages  │  │  Components  │
│  • Sidebar  │  │ • Chat   │  │  • ChatBox   │
│  • Header   │  │ • Mentor │  │  • QuizCard  │
│  • Footer   │  │ • Quiz   │  │  • UserCard  │
└─────────────┘  └──────────┘  └──────────────┘
        │              │              │
        └──────────────┼──────────────┘
                       ▼
             ┌─────────────────┐
             │  Shared Modules │
             │  • Hooks        │
             │  • Store        │
             │  • Utils        │
             │  • API Client   │
             └─────────────────┘
```

#### State Management Pattern

**Zustand Stores:**

```typescript
// store/chat.ts
interface ChatState {
  // State
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  sendMessage: (message: string) => Promise<void>;
  loadSessions: () => Promise<void>;
  createNewSession: () => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
}

export const useChatStore = create<ChatState>(
  persist(
    (set, get) => ({
      // Implementation
    }),
    { name: 'chat-storage' }
  )
);
```

**Store Organization:**
- `auth.ts`: Authentication state (user, token, roles)
- `chat.ts`: AI chat sessions and messages
- `mentor.ts`: Mentor discovery, connections, sessions
- `career.ts`: Career goals, milestones, resources
- `notifications.ts`: Real-time notifications
- `ui.ts`: UI state (modals, sidebars, themes)

---

## Database Schema

### Entity-Relationship Diagram

```
┌──────────┐         ┌──────────────┐         ┌──────────────┐
│   User   │────1:1──│ MentorProfile│────1:N──│ MentorReview │
└────┬─────┘         └──────┬───────┘         └──────────────┘
     │                      │
     │1:N                   │1:N
     │                      │
┌────▼─────┐         ┌──────▼────────┐
│  Career  │         │    Mentor     │
│  Session │         │  Connection   │
└────┬─────┘         └──────┬────────┘
     │                      │1:1
     │1:N                   │
     │                ┌─────▼──────┐
┌────▼─────┐         │  ChatRoom  │
│ Message  │         └─────┬──────┘
│Reaction  │               │1:N
└──────────┘         ┌─────▼──────┐
                     │   Chat     │
                     │  Message   │
                     └────────────┘
```

### Core Tables

#### Users Table
```sql
users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  password VARCHAR NOT NULL,  -- bcrypt hashed
  roles TEXT DEFAULT '["STUDENT"]',  -- JSON array
  avatar VARCHAR,
  bio TEXT,
  resetPasswordToken VARCHAR,
  resetPasswordExpires TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
)

INDEXES:
  - PRIMARY KEY (id)
  - UNIQUE INDEX (email)
  - INDEX (resetPasswordToken)
```

**Design Decisions:**
- `roles` as JSON array allows multi-role support (student + admin)
- Separate `resetPasswordToken` for secure password reset flow
- `cuid` IDs for unpredictability and distributed generation

#### MentorProfile Table
```sql
mentor_profiles (
  id VARCHAR PRIMARY KEY,
  userId VARCHAR UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Professional
  company VARCHAR NOT NULL,
  jobTitle VARCHAR NOT NULL,
  industry VARCHAR NOT NULL,
  yearsOfExperience INT NOT NULL,
  
  -- Education
  collegeName VARCHAR NOT NULL,
  degree VARCHAR NOT NULL,
  graduationYear INT NOT NULL,
  major VARCHAR,
  
  -- Mentorship
  expertiseAreas TEXT NOT NULL,  -- JSON: ["Web Dev", "AI/ML"]
  bio TEXT NOT NULL,
  linkedinUrl VARCHAR,
  portfolioUrl VARCHAR,
  
  -- Availability
  availableHoursPerWeek INT DEFAULT 5,
  preferredMeetingType VARCHAR DEFAULT 'VIDEO',
  timezone VARCHAR DEFAULT 'UTC',
  
  -- Status
  isVerified BOOLEAN DEFAULT FALSE,
  verificationToken VARCHAR,
  verificationExpiry TIMESTAMP,
  status VARCHAR DEFAULT 'PENDING',  -- PENDING, ACTIVE, INACTIVE, SUSPENDED
  
  -- Stats (denormalized for performance)
  totalConnections INT DEFAULT 0,
  activeConnections INT DEFAULT 0,  -- Max 3
  totalSessions INT DEFAULT 0,
  averageRating FLOAT DEFAULT 0.0,
  
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
)

INDEXES:
  - PRIMARY KEY (id)
  - UNIQUE INDEX (userId)
  - INDEX (status, isVerified)  -- for mentor discovery
  - INDEX (industry, expertiseAreas)  -- for filtering
  - INDEX (verificationToken)
```

**Design Decisions:**
- Denormalized stats for faster reads (updated via triggers/jobs)
- `expertiseAreas` as JSON for flexible tagging
- `activeConnections` limit enforced at application level
- Verification system prevents spam mentor registrations

#### MentorConnection Table
```sql
mentor_connections (
  id VARCHAR PRIMARY KEY,
  mentorId VARCHAR NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  studentId VARCHAR NOT NULL,  -- userId of student
  
  status VARCHAR DEFAULT 'PENDING',  -- PENDING, ACCEPTED, REJECTED, COMPLETED
  message TEXT,  -- Student's request message
  
  matchScore FLOAT,  -- 0-100 AI-calculated match
  matchReason TEXT,  -- JSON: reasons for match
  
  acceptedAt TIMESTAMP,
  rejectedAt TIMESTAMP,
  completedAt TIMESTAMP,
  
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  UNIQUE (mentorId, studentId)
)

INDEXES:
  - PRIMARY KEY (id)
  - UNIQUE INDEX (mentorId, studentId)
  - INDEX (mentorId, status)
  - INDEX (studentId, status)
  - INDEX (status, acceptedAt)
```

**Design Decisions:**
- Unique constraint prevents duplicate connection requests
- `matchScore` enables sorting by relevance
- Separate timestamps for each status transition (audit trail)

#### ChatRoom & ChatMessage Tables
```sql
chat_rooms (
  id VARCHAR PRIMARY KEY,
  connectionId VARCHAR UNIQUE NOT NULL REFERENCES mentor_connections(id),
  mentorId VARCHAR NOT NULL REFERENCES mentor_profiles(id),
  studentId VARCHAR NOT NULL,
  
  isActive BOOLEAN DEFAULT TRUE,
  lastActivity TIMESTAMP DEFAULT NOW(),
  
  unreadCountMentor INT DEFAULT 0,
  unreadCountStudent INT DEFAULT 0,
  
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
)

chat_messages (
  id VARCHAR PRIMARY KEY,
  roomId VARCHAR NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  senderId VARCHAR NOT NULL,  -- userId
  
  content TEXT NOT NULL,
  messageType VARCHAR DEFAULT 'TEXT',  -- TEXT, FILE, SYSTEM
  
  isRead BOOLEAN DEFAULT FALSE,
  readAt TIMESTAMP,
  isEdited BOOLEAN DEFAULT FALSE,
  editedAt TIMESTAMP,
  
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
)

INDEXES:
  - INDEX (roomId, createdAt)  -- for paginated message loading
  - INDEX (senderId, isRead)  -- for unread count
```

**Design Decisions:**
- One-to-one relationship between connection and chat room
- Separate unread counts for mentor and student
- `lastActivity` for sorting chat list
- Message type supports future file sharing

#### MentorSession Table
```sql
mentor_sessions (
  id VARCHAR PRIMARY KEY,
  mentorId VARCHAR NOT NULL REFERENCES mentor_profiles(id),
  studentId VARCHAR NOT NULL,
  
  title VARCHAR NOT NULL,
  description TEXT,
  sessionType VARCHAR DEFAULT 'VIDEO',  -- VIDEO, VOICE, IN_PERSON
  
  scheduledAt TIMESTAMP NOT NULL,
  duration INT DEFAULT 60,  -- minutes
  timezone VARCHAR NOT NULL,
  
  meetingLink VARCHAR,  -- Jitsi/Zoom link
  meetingRoom VARCHAR,
  
  status VARCHAR DEFAULT 'SCHEDULED',  -- SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
  startedAt TIMESTAMP,
  endedAt TIMESTAMP,
  cancelledAt TIMESTAMP,
  cancellationReason TEXT,
  
  agendaNotes TEXT,
  sessionNotes TEXT,  -- Mentor's post-session notes
  
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
)

INDEXES:
  - INDEX (mentorId, scheduledAt)
  - INDEX (studentId, scheduledAt)
  - INDEX (status, scheduledAt)
```

**Design Decisions:**
- Flexible session types (video, voice, in-person)
- Meeting link auto-generated for video sessions
- Comprehensive status tracking
- Both pre- and post-session notes

#### CareerGoal & Related Tables
```sql
career_goals (
  id VARCHAR PRIMARY KEY,
  userId VARCHAR NOT NULL REFERENCES users(id),
  
  currentPosition VARCHAR NOT NULL,
  targetPosition VARCHAR NOT NULL,
  targetCompany VARCHAR,
  targetIndustry VARCHAR,
  timeline VARCHAR NOT NULL,  -- "6 months", "1 year"
  
  status VARCHAR DEFAULT 'IN_PROGRESS',  -- IN_PROGRESS, COMPLETED, ARCHIVED
  progress INT DEFAULT 0,  -- 0-100
  
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
)

skill_gaps (
  id VARCHAR PRIMARY KEY,
  goalId VARCHAR NOT NULL REFERENCES career_goals(id),
  
  skillName VARCHAR NOT NULL,
  category VARCHAR DEFAULT 'TECHNICAL',
  currentLevel INT NOT NULL,  -- 0-10
  targetLevel INT NOT NULL,  -- 0-10
  priority VARCHAR DEFAULT 'MEDIUM',  -- LOW, MEDIUM, HIGH
  status VARCHAR DEFAULT 'NOT_STARTED',
  
  estimatedWeeks INT,
  progressPercentage INT DEFAULT 0,
  
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
)

career_milestones (
  id VARCHAR PRIMARY KEY,
  goalId VARCHAR NOT NULL REFERENCES career_goals(id),
  
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR,
  targetDate TIMESTAMP,
  status VARCHAR DEFAULT 'PENDING',  -- PENDING, IN_PROGRESS, COMPLETED
  progress INT DEFAULT 0,
  
  estimatedHours INT,
  actualHours INT,
  priority INT DEFAULT 0,
  
  completedAt TIMESTAMP,
  
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
)

learning_resources (
  id VARCHAR PRIMARY KEY,
  skillGapId VARCHAR NOT NULL REFERENCES skill_gaps(id),
  
  title VARCHAR NOT NULL,
  type VARCHAR NOT NULL,  -- COURSE, VIDEO, ARTICLE, BOOK, PROJECT
  url VARCHAR NOT NULL,
  description TEXT,
  provider VARCHAR,
  
  duration VARCHAR,  -- "4 weeks", "10 hours"
  difficulty VARCHAR,  -- BEGINNER, INTERMEDIATE, ADVANCED
  cost FLOAT,
  rating FLOAT,
  
  isCompleted BOOLEAN DEFAULT FALSE,
  completedAt TIMESTAMP,
  
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
)
```

**Design Decisions:**
- Hierarchical structure: Goal → Milestones → Skill Gaps → Resources
- Progress tracking at multiple levels
- AI-generated resources linked to specific skills
- Flexible timeline formats

### Data Normalization

**Third Normal Form (3NF) Compliance:**
- All tables have primary keys
- No repeating groups (arrays stored as JSON in TEXT fields)
- No partial dependencies
- No transitive dependencies

**Denormalization for Performance:**
```sql
-- Instead of calculating on each query:
SELECT COUNT(*) FROM mentor_connections 
WHERE mentorId = ? AND status = 'ACCEPTED'

-- Store pre-calculated value:
mentor_profiles.activeConnections INT

-- Updated via:
-- 1. Database triggers (PostgreSQL)
-- 2. Application logic after status changes
-- 3. Scheduled jobs for consistency checks
```

---

## API Design

### RESTful Principles

**Resource Naming:**
- Plural nouns: `/api/v1/mentors`, `/api/v1/sessions`
- Hierarchical structure: `/api/v1/goals/{goalId}/milestones`
- No verbs in endpoints (use HTTP methods)

**HTTP Methods:**
- `GET`: Retrieve resources (idempotent)
- `POST`: Create new resources
- `PUT`: Replace entire resource
- `PATCH`: Partial update
- `DELETE`: Remove resource

**Status Codes:**
- `200 OK`: Successful GET, PATCH, PUT
- `201 Created`: Successful POST with resource creation
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing/invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Resource state conflict
- `422 Unprocessable Entity`: Validation errors
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### API Versioning

**URL-based versioning:**
```
https://api.careerforge.com/api/v1/mentors
https://api.careerforge.com/api/v2/mentors  # future
```

**Deprecation Strategy:**
1. Announce deprecation 6 months in advance
2. Add `X-API-Deprecated: true` header
3. Maintain old version for 12 months
4. Sunset with clear migration guide

### Request/Response Format

**Standard Success Response:**
```json
{
  "status": "success",
  "message": "Resource retrieved successfully",
  "data": {
    "id": "cm4abc123",
    "name": "John Doe",
    "...": "..."
  },
  "metadata": {
    "timestamp": "2026-02-01T10:30:00Z",
    "requestId": "req_xyz789"
  }
}
```

**Standard Error Response:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is already in use"
    }
  ],
  "metadata": {
    "timestamp": "2026-02-01T10:30:00Z",
    "requestId": "req_xyz789"
  }
}
```

**Pagination Format:**
```json
{
  "status": "success",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "totalItems": 95,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### API Authentication

**JWT Token Structure:**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "cm4user123",
    "email": "user@example.com",
    "roles": ["STUDENT", "ADMIN"],
    "iat": 1706781000,
    "exp": 1706867400  // 24 hours
  }
}
```

**Authorization Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Role-Based Access Control (RBAC):**
```javascript
// Middleware implementation
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userRoles = req.user.roles || [];
    const hasRole = allowedRoles.some(role => 
      userRoles.includes(role)
    );
    
    if (!hasRole) {
      return res.status(403).json({ 
        error: 'Insufficient permissions' 
      });
    }
    
    next();
  };
};

// Usage
router.get('/admin/stats', 
  authenticateToken, 
  authorize('ADMIN'), 
  getAdminStats
);
```

### Rate Limiting

**Limits by Endpoint Type:**
```javascript
const rateLimits = {
  global: { windowMs: 15 * 60 * 1000, max: 100 },  // 100 req/15min
  auth: { windowMs: 15 * 60 * 1000, max: 5 },       // 5 req/15min
  chat: { windowMs: 60 * 1000, max: 20 },           // 20 req/minute
  search: { windowMs: 60 * 1000, max: 30 }          // 30 req/minute
};
```

**Redis-backed Rate Limiting:**
- Distributed rate limiting across multiple servers
- Per-user and per-IP tracking
- Graceful degradation if Redis unavailable

---

## Frontend Architecture

### Component Patterns

#### Container/Presentational Pattern

**Container (Smart) Components:**
```typescript
// pages/mentor/MentorList.tsx
export const MentorList = () => {
  // Data fetching, state management
  const { mentors, loading } = useMentorStore();
  const [filters, setFilters] = useState({});
  
  useEffect(() => {
    fetchMentors(filters);
  }, [filters]);
  
  // Business logic
  const handleFilter = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };
  
  // Render presentational components
  return (
    <div>
      <MentorFilters onFilter={handleFilter} />
      <MentorGrid mentors={mentors} loading={loading} />
    </div>
  );
};
```

**Presentational (Dumb) Components:**
```typescript
// components/mentors/MentorCard.tsx
interface MentorCardProps {
  mentor: Mentor;
  onConnect: (id: string) => void;
}

export const MentorCard: React.FC<MentorCardProps> = ({ 
  mentor, 
  onConnect 
}) => {
  // Pure rendering logic, no data fetching
  return (
    <div className="card">
      <img src={mentor.avatar} />
      <h3>{mentor.name}</h3>
      <p>{mentor.jobTitle} at {mentor.company}</p>
      <button onClick={() => onConnect(mentor.id)}>
        Connect
      </button>
    </div>
  );
};
```

#### Compound Component Pattern

```typescript
// components/career/GoalBuilder.tsx
export const GoalBuilder = ({ children }) => {
  const [goalData, setGoalData] = useState({});
  
  return (
    <GoalContext.Provider value={{ goalData, setGoalData }}>
      {children}
    </GoalContext.Provider>
  );
};

GoalBuilder.CurrentPosition = ({ children }) => {
  const { goalData, setGoalData } = useGoalContext();
  return <div>{/* ... */}</div>;
};

GoalBuilder.TargetPosition = ({ children }) => {
  const { goalData, setGoalData } = useGoalContext();
  return <div>{/* ... */}</div>;
};

// Usage
<GoalBuilder>
  <GoalBuilder.CurrentPosition />
  <GoalBuilder.TargetPosition />
  <GoalBuilder.Timeline />
  <GoalBuilder.Review />
</GoalBuilder>
```

### State Management

**Zustand Store Pattern:**
```typescript
interface MentorStore {
  // State
  mentors: Mentor[];
  selectedMentor: Mentor | null;
  connections: Connection[];
  
  // Computed state (selectors)
  activeMentors: () => Mentor[];
  pendingConnections: () => Connection[];
  
  // Actions (async operations)
  fetchMentors: (filters?: Filters) => Promise<void>;
  connectWithMentor: (mentorId: string, message: string) => Promise<void>;
  
  // Mutations (sync state updates)
  setSelectedMentor: (mentor: Mentor | null) => void;
  updateConnectionStatus: (id: string, status: string) => void;
}

export const useMentorStore = create<MentorStore>()(
  persist(
    (set, get) => ({
      // State initialization
      mentors: [],
      selectedMentor: null,
      connections: [],
      
      // Selectors
      activeMentors: () => 
        get().mentors.filter(m => m.status === 'ACTIVE'),
      
      // Actions
      fetchMentors: async (filters) => {
        const data = await apiClient.get('/mentors', { params: filters });
        set({ mentors: data });
      },
      
      connectWithMentor: async (mentorId, message) => {
        const connection = await apiClient.post('/connections', {
          mentorId,
          message
        });
        set(state => ({
          connections: [...state.connections, connection]
        }));
      },
      
      // Mutations
      setSelectedMentor: (mentor) => set({ selectedMentor: mentor }),
    }),
    {
      name: 'mentor-storage',
      partialize: (state) => ({ connections: state.connections })
    }
  )
);
```

### Routing Strategy

**Route Organization:**
```typescript
// App.tsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
    ]
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ]
  },
  {
    path: '/app',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'quiz', element: <QuizPage /> },
      { path: 'mentors', element: <MentorListPage /> },
      { path: 'mentors/:id', element: <MentorProfilePage /> },
      { path: 'sessions', element: <SessionsPage /> },
      { path: 'career', element: <CareerPlannerPage /> },
      { path: 'career/:goalId', element: <GoalDetailPage /> },
    ]
  },
  {
    path: '/admin',
    element: <ProtectedRoute roles={['ADMIN']}><AdminLayout /></ProtectedRoute>,
    children: [
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'users', element: <UserManagement /> },
      { path: 'mentors/pending', element: <MentorApproval /> },
    ]
  }
]);
```

**Protected Route Implementation:**
```typescript
const ProtectedRoute: React.FC<{ 
  children: ReactNode; 
  roles?: string[] 
}> = ({ children, roles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} />;
  }
  
  if (roles.length > 0) {
    const hasRole = roles.some(role => user?.roles?.includes(role));
    if (!hasRole) {
      return <Navigate to="/app/dashboard" />;
    }
  }
  
  return <>{children}</>;
};
```

---

## Real-time Communication

### WebSocket Architecture

**Connection Management:**
```typescript
// hooks/useSocket.ts
export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    const socket = io(API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });
    
    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });
    
    socketRef.current = socket;
    
    return () => {
      socket.disconnect();
    };
  }, []);
  
  return {
    socket: socketRef.current,
    isConnected,
    joinRoom: (roomId) => socketRef.current?.emit('join-room', roomId),
    leaveRoom: (roomId) => socketRef.current?.emit('leave-room', roomId),
    sendMessage: (roomId, message) => 
      socketRef.current?.emit('send-message', { roomId, message })
  };
};
```

**Server-side Socket.io Setup:**
```javascript
// server.js
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true
  }
});

// Authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  // Join personal notification room
  socket.join(`user:${socket.userId}`);
  
  // Chat room operations
  socket.on('join-room', async (roomId) => {
    // Verify user has access to room
    const hasAccess = await verifyRoomAccess(socket.userId, roomId);
    if (hasAccess) {
      socket.join(`room:${roomId}`);
      console.log(`User ${socket.userId} joined room ${roomId}`);
    }
  });
  
  socket.on('send-message', async ({ roomId, content }) => {
    // Save to database
    const message = await saveMessage(roomId, socket.userId, content);
    
    // Broadcast to room
    io.to(`room:${roomId}`).emit('new-message', message);
    
    // Send notification to other user
    const otherUserId = await getOtherUserInRoom(roomId, socket.userId);
    io.to(`user:${otherUserId}`).emit('notification', {
      type: 'NEW_MESSAGE',
      data: { roomId, message }
    });
  });
  
  socket.on('typing', ({ roomId }) => {
    socket.to(`room:${roomId}`).emit('user-typing', {
      userId: socket.userId,
      roomId
    });
  });
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});
```

### Event-Driven Architecture

**Event Types:**
- **Chat Events**: `new-message`, `message-read`, `user-typing`, `user-stop-typing`
- **Notification Events**: `connection-request`, `connection-accepted`, `session-booked`
- **Session Events**: `session-started`, `session-ended`, `session-reminder`
- **System Events**: `maintenance-mode`, `announcement`

**Event Payload Structure:**
```json
{
  "event": "connection-request",
  "timestamp": "2026-02-01T10:30:00Z",
  "data": {
    "connectionId": "conn_123",
    "mentorId": "mentor_456",
    "studentId": "user_789",
    "message": "I'd love to connect..."
  },
  "metadata": {
    "version": "1.0",
    "source": "mentorship-service"
  }
}
```

---

## AI Integration

### Multi-Model Strategy

**Model Selection Logic:**
```javascript
class MultiAIService {
  async generateResponse(messages, context) {
    let response;
    let model = 'groq'; // Primary
    
    try {
      response = await this.groqChat(messages, context);
    } catch (error) {
      console.error('Groq failed, falling back to Gemini:', error);
      model = 'gemini';
      response = await this.geminiChat(messages, context);
    }
    
    return { response, model };
  }
  
  async groqChat(messages, context) {
    const completion = await this.groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...this.formatContextForGroq(context),
        ...messages
      ],
      model: 'llama-3.1-70b-versatile',
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
      stream: false
    });
    
    return completion.choices[0].message.content;
  }
  
  async geminiChat(messages, context) {
    const model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash' 
    });
    
    const prompt = this.formatMessagesForGemini(messages, context);
    const result = await model.generateContent(prompt);
    
    return result.response.text();
  }
}
```

**Context Management:**
```javascript
class ContextManager {
  buildContext(sessionId, newMessage) {
    const session = this.getSession(sessionId);
    const recentMessages = session.messages.slice(-10); // Last 10 messages
    const userProfile = this.getUserProfile(session.userId);
    
    return {
      sessionInfo: {
        id: sessionId,
        messageCount: session.messages.length,
        duration: Date.now() - new Date(session.createdAt).getTime()
      },
      userContext: {
        name: userProfile.name,
        careerGoals: userProfile.careerGoals,
        quizResults: userProfile.recentQuizResults
      },
      conversationHistory: recentMessages.map(m => ({
        role: m.role,
        content: m.content
      })),
      currentQuery: newMessage
    };
  }
  
  estimateTokens(context) {
    // Rough estimation: 1 token ≈ 4 characters
    const text = JSON.stringify(context);
    return Math.ceil(text.length / 4);
  }
  
  truncateContext(context, maxTokens = 6000) {
    while (this.estimateTokens(context) > maxTokens) {
      // Remove oldest message
      context.conversationHistory.shift();
    }
    return context;
  }
}
```

### Prompt Engineering

**System Prompt Template:**
```javascript
const CAREER_ADVISOR_PROMPT = `
You are CareerForge AI, an expert career advisor and mentor with deep knowledge of:
- Career planning and development strategies
- Technology industry trends and roles
- Skill gap analysis and learning paths
- Interview preparation and job search
- Salary negotiation and career transitions

Your personality:
- Professional yet friendly and approachable
- Encouraging and supportive
- Honest and realistic about challenges
- Data-driven and evidence-based

Your guidelines:
1. Ask clarifying questions to understand user's context
2. Provide actionable, specific advice
3. Suggest concrete next steps
4. Reference relevant resources when helpful
5. Acknowledge limitations (you're not a therapist, lawyer, etc.)
6. Format responses for readability (use markdown)

User Context:
- Name: {{userName}}
- Current Role: {{currentRole}}
- Career Goals: {{careerGoals}}
- Recent Quiz Results: {{quizResults}}

Conversation history is provided below. Respond thoughtfully to the user's latest message.
`;

// Template variable replacement
function formatPrompt(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || '';
  });
}
```

### Response Processing

**Markdown Parsing & Code Highlighting:**
```typescript
// components/chat/MessageContent.tsx
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const MessageContent: React.FC<{ content: string }> = ({ content }) => {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          
          return !inline && language ? (
            <SyntaxHighlighter
              style={oneDark}
              language={language}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        a({ href, children }) {
          return (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {children}
            </a>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
```

---

## Security Design

### Authentication Flow

```
┌──────────┐                 ┌──────────┐                 ┌──────────┐
│  Client  │                 │   API    │                 │ Database │
└─────┬────┘                 └─────┬────┘                 └─────┬────┘
      │                            │                            │
      │ POST /auth/login           │                            │
      │ { email, password }        │                            │
      ├───────────────────────────>│                            │
      │                            │                            │
      │                            │ Query user by email        │
      │                            ├───────────────────────────>│
      │                            │                            │
      │                            │ User data                  │
      │                            │<───────────────────────────┤
      │                            │                            │
      │                            │ bcrypt.compare(password)   │
      │                            │                            │
      │                            │ Generate JWT               │
      │                            │ { userId, roles, exp }     │
      │                            │                            │
      │ { token, user }            │                            │
      │<───────────────────────────┤                            │
      │                            │                            │
      │ Store token in localStorage│                            │
      │                            │                            │
      │ GET /api/protected         │                            │
      │ Authorization: Bearer JWT  │                            │
      ├───────────────────────────>│                            │
      │                            │                            │
      │                            │ Verify JWT signature       │
      │                            │ Check expiration           │
      │                            │                            │
      │                            │ Extract userId from JWT    │
      │                            │                            │
      │                            │ Query user data            │
      │                            ├───────────────────────────>│
      │                            │                            │
      │                            │ User data                  │
      │                            │<───────────────────────────┤
      │                            │                            │
      │ Protected data             │                            │
      │<───────────────────────────┤                            │
      │                            │                            │
```

### Password Security

**Hashing Strategy:**
```javascript
const bcrypt = require('bcryptjs');

// Registration
async function hashPassword(plainPassword) {
  const saltRounds = 12; // 2^12 iterations
  return await bcrypt.hash(plainPassword, saltRounds);
}

// Login
async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

// Password strength validation
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
// Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
```

### Input Validation & Sanitization

**Express-validator Implementation:**
```javascript
const { body, param, validationResult } = require('express-validator');

// Validation middleware
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),
  
  body('password')
    .isLength({ min: 8 })
    .matches(passwordRegex)
    .withMessage('Password must meet complexity requirements'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .escape()
    .withMessage('Name must be 2-100 characters'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ 
        status: 'error',
        errors: errors.array() 
      });
    }
    next();
  }
];

// Usage
router.post('/register', validateRegistration, registerController);
```

### XSS Protection

**Content Security Policy:**
```javascript
const helmet = require('helmet');

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.example.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    imgSrc: ["'self'", "data:", "https://"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    connectSrc: ["'self'", process.env.API_URL],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"]
  }
}));
```

**Output Encoding:**
```typescript
// Frontend: React automatically escapes JSX content
<div>{user.bio}</div> // Safe from XSS

// For dangerously setting HTML (avoid when possible):
import DOMPurify from 'dompurify';

<div 
  dangerouslySetInnerHTML={{ 
    __html: DOMPurify.sanitize(htmlContent) 
  }} 
/>
```

### SQL Injection Prevention

**Prisma ORM Protection:**
```javascript
// ✅ SAFE: Parameterized queries via Prisma
const user = await prisma.user.findUnique({
  where: { email: userEmail } // Automatically escaped
});

// ✅ SAFE: Even with raw SQL, use parameters
const result = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userEmail}
`; // Prisma escapes parameters

// ❌ UNSAFE: String concatenation (don't do this)
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;
```

### CSRF Protection

**Token-based CSRF Prevention:**
```javascript
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(csrf({ cookie: true }));

// Send CSRF token with form
app.get('/form', (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});

// Verify CSRF token on POST
app.post('/submit', (req, res) => {
  // Automatically verified by csrf middleware
  res.send('Success');
});
```

---

## Performance Optimization

### Database Optimization

**Indexing Strategy:**
```sql
-- Frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_mentor_profiles_status_verified ON mentor_profiles(status, isVerified);
CREATE INDEX idx_mentor_connections_student_status ON mentor_connections(studentId, status);

-- Composite indexes for common query patterns
CREATE INDEX idx_chat_messages_room_created ON chat_messages(roomId, createdAt DESC);
CREATE INDEX idx_mentor_sessions_mentor_scheduled ON mentor_sessions(mentorId, scheduledAt);

-- Partial indexes for specific use cases
CREATE INDEX idx_active_mentors ON mentor_profiles(id) 
  WHERE status = 'ACTIVE' AND isVerified = true;
```

**Query Optimization:**
```javascript
// ❌ N+1 Query Problem
const mentors = await prisma.mentorProfile.findMany();
for (const mentor of mentors) {
  // Separate query for each mentor's reviews (N+1)
  const reviews = await prisma.mentorReview.findMany({
    where: { mentorId: mentor.id }
  });
}

// ✅ Optimized: Single query with includes
const mentors = await prisma.mentorProfile.findMany({
  include: {
    receivedReviews: true,
    availability: true,
    user: {
      select: { name: true, email: true }
    }
  }
});

// ✅ Further optimization: Pagination
const mentors = await prisma.mentorProfile.findMany({
  take: 20,
  skip: (page - 1) * 20,
  include: { /* ... */ },
  orderBy: { averageRating: 'desc' }
});
```

### Caching Strategy

**Redis Caching Layers:**
```javascript
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

// Cache hierarchy
class CacheService {
  async get(key) {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async set(key, value, ttl = 3600) {
    await redis.setex(key, ttl, JSON.stringify(value));
  }
  
  async invalidate(pattern) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

// Usage in service
class MentorService {
  async getMentorById(id) {
    const cacheKey = `mentor:${id}`;
    
    // Try cache first
    let mentor = await cache.get(cacheKey);
    
    if (!mentor) {
      // Cache miss - query database
      mentor = await prisma.mentorProfile.findUnique({
        where: { id },
        include: { /* ... */ }
      });
      
      // Store in cache (15 minutes)
      await cache.set(cacheKey, mentor, 900);
    }
    
    return mentor;
  }
  
  async updateMentor(id, data) {
    const updated = await prisma.mentorProfile.update({
      where: { id },
      data
    });
    
    // Invalidate cache
    await cache.invalidate(`mentor:${id}*`);
    
    return updated;
  }
}
```

**Cache Invalidation Patterns:**
```javascript
// Time-based expiration
await cache.set('trending-mentors', data, 1800); // 30 minutes

// Event-based invalidation
eventEmitter.on('mentor-profile-updated', async (mentorId) => {
  await cache.invalidate(`mentor:${mentorId}*`);
  await cache.invalidate('mentor-list:*');
});

// Lazy invalidation (stale-while-revalidate)
async function getMentorsWithSWR() {
  const cached = await cache.get('mentors');
  
  if (cached) {
    // Return stale data immediately
    setImmediate(async () => {
      // Revalidate in background
      const fresh = await prisma.mentorProfile.findMany();
      await cache.set('mentors', fresh, 3600);
    });
    
    return cached;
  }
  
  // No cache - fetch and cache
  const fresh = await prisma.mentorProfile.findMany();
  await cache.set('mentors', fresh, 3600);
  return fresh;
}
```

### Frontend Performance

**Code Splitting:**
```typescript
// Route-based code splitting
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const ChatPage = lazy(() => import('@/pages/chat/ChatPage'));
const MentorList = lazy(() => import('@/pages/mentor/MentorList'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/mentors" element={<MentorList />} />
      </Routes>
    </Suspense>
  );
}
```

**React Query Caching:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch with automatic caching
function useMentors(filters) {
  return useQuery({
    queryKey: ['mentors', filters],
    queryFn: () => apiClient.get('/mentors', { params: filters }),
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false
  });
}

// Optimistic updates
function useConnectMentor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (mentorId) => apiClient.post('/connections', { mentorId }),
    onMutate: async (mentorId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries(['connections']);
      
      // Snapshot previous value
      const previous = queryClient.getQueryData(['connections']);
      
      // Optimistically update cache
      queryClient.setQueryData(['connections'], (old) => [
        ...old,
        { mentorId, status: 'PENDING' }
      ]);
      
      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['connections'], context.previous);
    },
    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries(['connections']);
    }
  });
}
```

**Virtual Scrolling:**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function MessageList({ messages }) {
  const parentRef = useRef();
  
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Average message height
    overscan: 5 // Render 5 items above/below viewport
  });
  
  return (
    <div ref={parentRef} style={{ height: '500px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const message = messages[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`
              }}
            >
              <MessageCard message={message} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## Scalability

### Horizontal Scaling

**Stateless Application Design:**
```
┌────────────────┐
│  Load Balancer │ (Round-robin / Least connections)
└───────┬────────┘
        │
    ┌───┴───┬────────┬────────┐
    ▼       ▼        ▼        ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ App 1  │ │ App 2  │ │ App 3  │ │ App 4  │
└───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
    │          │          │          │
    └──────────┴──────────┴──────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
    ┌────────┐    ┌────────┐
    │Database│    │ Redis  │
    │(Primary│    │ Cache  │
    │+Replica│    │+Session│
    └────────┘    └────────┘
```

**Session Management:**
```javascript
const session = require('express-session');
const RedisStore = require('connect-redis').default;

app.use(session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

### Database Scaling

**Read Replicas:**
```javascript
const { PrismaClient } = require('@prisma/client');

// Write to primary
const prismaPrimary = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL }
  }
});

// Read from replica
const prismaReplica = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_REPLICA_URL }
  }
});

// Usage
async function getMentors() {
  // Read-heavy operation uses replica
  return await prismaReplica.mentorProfile.findMany();
}

async function createMentor(data) {
  // Write operation uses primary
  return await prismaPrimary.mentorProfile.create({ data });
}
```

**Connection Pooling:**
```javascript
// Prisma connection pool configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Connection pool settings
  pool: {
    max: 20, // Maximum connections
    min: 5,  // Minimum connections
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 300000
  }
});
```

### Background Job Processing

**Bull Queue Setup:**
```javascript
const Queue = require('bull');

// Define queues
const emailQueue = new Queue('email', process.env.REDIS_URL);
const notificationQueue = new Queue('notifications', process.env.REDIS_URL);
const analyticsQueue = new Queue('analytics', process.env.REDIS_URL);

// Add job
await emailQueue.add('welcome-email', {
  userId: user.id,
  email: user.email,
  name: user.name
}, {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000
  }
});

// Process jobs
emailQueue.process('welcome-email', async (job) => {
  const { email, name } = job.data;
  
  await sendEmail({
    to: email,
    subject: 'Welcome to CareerForge AI',
    template: 'welcome',
    data: { name }
  });
  
  return { sent: true, timestamp: Date.now() };
});

// Monitor job status
emailQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
  // Alert monitoring system
});
```

### CDN & Asset Optimization

**Static Asset Strategy:**
```javascript
// Vite build configuration
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          markdown: ['react-markdown', 'react-syntax-highlighter']
        }
      }
    },
    // Asset inlining threshold
    assetsInlineLimit: 4096, // 4KB
    
    // Generate source maps for production debugging
    sourcemap: true,
    
    // Minimize output
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true // Remove console.logs
      }
    }
  }
});
```

**Image Optimization:**
```typescript
// components/common/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height
}) => {
  const [loaded, setLoaded] = useState(false);
  
  // Generate srcset for responsive images
  const srcset = `
    ${src}?w=400 400w,
    ${src}?w=800 800w,
    ${src}?w=1200 1200w
  `;
  
  return (
    <div style={{ position: 'relative', width, height }}>
      {/* Low-quality placeholder */}
      {!loaded && (
        <img
          src={`${src}?w=20&blur=10`}
          alt=""
          style={{ filter: 'blur(10px)' }}
        />
      )}
      
      {/* High-quality image */}
      <img
        src={src}
        srcSet={srcset}
        sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{ 
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s'
        }}
      />
    </div>
  );
};
```

---

*Last Updated: February 2026*
*Version: 1.0.0*
