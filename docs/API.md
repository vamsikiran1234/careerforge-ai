# CareerForge AI - API Documentation

## Base URL
```
Development: http://localhost:3000/api/v1
Production: https://api.careerforge.com/api/v1
```

## Table of Contents
- [Authentication](#authentication)
- [Chat & AI Conversations](#chat--ai-conversations)
- [Quiz & Assessments](#quiz--assessments)
- [Mentorship Platform](#mentorship-platform)
- [Session Booking](#session-booking)
- [Career Planning](#career-planning)
- [Notifications](#notifications)
- [Analytics](#analytics)
- [User Management](#user-management)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Authentication

### Register
Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

**Response:** `201 Created`
```json
{
  "status": "success",
  "message": "User registered successfully. Please log in.",
  "data": {
    "user": {
      "id": "cm4abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "roles": ["STUDENT"],
      "avatar": null,
      "createdAt": "2026-02-01T10:30:00.000Z",
      "updatedAt": "2026-02-01T10:30:00.000Z"
    }
  }
}
```

**Errors:**
- `400` - Validation failed (weak password, invalid email, etc.)
- `409` - Email already exists

---

### Login
Authenticate and receive JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "cm4abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "roles": ["STUDENT"],
      "avatar": null,
      "bio": null
    }
  }
}
```

**Token Details:**
- Expiry: 7 days
- Type: Bearer token
- Include in requests: `Authorization: Bearer <token>`

**Errors:**
- `401` - Invalid credentials
- `404` - User not found

---

### Forgot Password
Request password reset email.

**Endpoint:** `POST /auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Password reset email sent successfully",
  "data": {
    "resetUrl": "http://localhost:5173/auth/reset-password?token=abc123..."
  }
}
```

---

### Reset Password
Set new password using reset token.

**Endpoint:** `POST /auth/reset-password`

**Request Body:**
```json
{
  "token": "abc123...",
  "newPassword": "NewSecurePass456!"
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Password reset successful"
}
```

**Errors:**
- `400` - Invalid or expired token
- `422` - Password doesn't meet requirements

---

## Chat & AI Conversations

### Send Message
Send a message and receive AI-generated response.

**Endpoint:** `POST /chat/message`
**Auth Required:** Yes

**Request Body:**
```json
{
  "message": "What skills do I need to become a software engineer?",
  "sessionId": "cm4session123",
  "model": "groq"
}
```

**Query Parameters:**
- `model` (optional): `groq` (default) or `gemini`

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "sessionId": "cm4session123",
    "title": "Software Engineering Skills",
    "reply": "To become a software engineer, you'll need...",
    "timestamp": "2026-02-01T10:30:00.000Z",
    "messageCount": 3,
    "model": "groq"
  }
}
```

---

### Send Message with Files
Upload and analyze files (PDF resumes, transcripts).

**Endpoint:** `POST /chat/message-with-files`
**Auth Required:** Yes
**Content-Type:** `multipart/form-data`

**Form Data:**
```
message: "Analyze my resume and suggest improvements"
sessionId: cm4session123
files: [resume.pdf]
```

**File Restrictions:**
- Max size: 10 MB per file
- Allowed types: PDF, TXT, DOCX
- Max files: 5 per request

**Response:** Similar to regular message endpoint, plus:
```json
{
  "data": {
    "files": [
      {
        "name": "resume.pdf",
        "type": "application/pdf",
        "size": 245678,
        "pages": 2,
        "extractedText": "John Doe\nSoftware Engineer..."
      }
    ]
  }
}
```

---

### Get Conversations
Retrieve all chat sessions for authenticated user.

**Endpoint:** `GET /chat/sessions`
**Auth Required:** Yes

**Query Parameters:**
- `limit` (optional): Number of sessions (default: 20)
- `offset` (optional): Pagination offset (default: 0)
- `sortBy` (optional): `createdAt` | `updatedAt` (default: `updatedAt`)
- `order` (optional): `asc` | `desc` (default: `desc`)

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "sessions": [
      {
        "id": "cm4session123",
        "title": "Career Path Discussion",
        "createdAt": "2026-02-01T09:00:00.000Z",
        "updatedAt": "2026-02-01T10:30:00.000Z",
        "messageCount": 12,
        "lastMessage": "Thank you for the advice!",
        "preview": "How do I transition from web development to AI/ML?"
      }
    ],
    "totalSessions": 45,
    "pagination": {
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

### Get Single Session
Retrieve full conversation history for a session.

**Endpoint:** `GET /chat/session/:sessionId`
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "session": {
      "id": "cm4session123",
      "title": "Career Path Discussion",
      "messages": [
        {
          "id": "msg1",
          "role": "user",
          "content": "How do I transition to AI/ML?",
          "timestamp": "2026-02-01T09:00:00.000Z"
        },
        {
          "id": "msg2",
          "role": "assistant",
          "content": "Here's a structured path...",
          "timestamp": "2026-02-01T09:00:15.000Z"
        }
      ],
      "createdAt": "2026-02-01T09:00:00.000Z",
      "updatedAt": "2026-02-01T10:30:00.000Z",
      "endedAt": null,
      "branches": []
    }
  }
}
```

---

### Delete Session
Remove a conversation session.

**Endpoint:** `DELETE /chat/session/:sessionId`
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Session deleted successfully"
}
```

---

### Share Conversation
Create a shareable link for a conversation.

**Endpoint:** `POST /share/session/:sessionId`
**Auth Required:** Yes

**Request Body:**
```json
{
  "requiresPassword": true,
  "password": "share123",
  "expiresIn": 7
}
```

**Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "shareCode": "abc123def456",
    "shareUrl": "https://careerforge.com/shared/abc123def456",
    "expiresAt": "2026-02-08T10:30:00.000Z",
    "requiresPassword": true
  }
}
```

---

## Quiz & Assessments

### Get Available Quizzes
List all quiz categories and types.

**Endpoint:** `GET /quiz/available`
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "categories": [
      {
        "id": "technical",
        "name": "Technical Skills",
        "description": "Programming, algorithms, system design",
        "quizzes": [
          {
            "id": "javascript-fundamentals",
            "name": "JavaScript Fundamentals",
            "difficulty": "BEGINNER",
            "questionCount": 20,
            "estimatedTime": "15 minutes"
          }
        ]
      },
      {
        "id": "career-planning",
        "name": "Career Planning",
        "quizzes": [...]
      }
    ]
  }
}
```

---

### Start Quiz Session
Initialize a new quiz attempt.

**Endpoint:** `POST /quiz/start`
**Auth Required:** Yes

**Request Body:**
```json
{
  "quizType": "javascript-fundamentals",
  "difficulty": "INTERMEDIATE"
}
```

**Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "sessionId": "quiz_abc123",
    "quizType": "javascript-fundamentals",
    "totalQuestions": 20,
    "timeLimit": 900,
    "questions": [
      {
        "id": "q1",
        "questionText": "What is closure in JavaScript?",
        "options": [
          { "id": "a", "text": "A function with access to outer scope" },
          { "id": "b", "text": "A loop structure" },
          { "id": "c", "text": "A type of variable" },
          { "id": "d", "text": "A syntax error" }
        ],
        "type": "MULTIPLE_CHOICE"
      }
    ],
    "currentQuestionIndex": 0
  }
}
```

---

### Submit Answer
Submit answer for current question.

**Endpoint:** `POST /quiz/answer`
**Auth Required:** Yes

**Request Body:**
```json
{
  "sessionId": "quiz_abc123",
  "questionId": "q1",
  "answer": "a"
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "isCorrect": true,
    "explanation": "Correct! A closure is indeed a function that has access to variables in its outer scope.",
    "nextQuestion": {
      "id": "q2",
      "questionText": "..."
    },
    "progress": {
      "answered": 1,
      "total": 20,
      "correct": 1
    }
  }
}
```

---

### Get Quiz Results
Retrieve completed quiz session results.

**Endpoint:** `GET /quiz/results/:sessionId`
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "sessionId": "quiz_abc123",
    "quizType": "javascript-fundamentals",
    "score": 85,
    "totalQuestions": 20,
    "correctAnswers": 17,
    "timeSpent": 780,
    "completedAt": "2026-02-01T11:00:00.000Z",
    "skillAnalysis": {
      "strengths": ["Closures", "Promises", "Arrow Functions"],
      "weaknesses": ["Prototypal Inheritance", "Event Loop"],
      "recommendations": [
        {
          "skill": "Prototypal Inheritance",
          "resources": [
            {
              "title": "Understanding JavaScript Prototypes",
              "type": "article",
              "url": "https://...",
              "estimatedTime": "15 min read"
            }
          ]
        }
      ]
    },
    "detailedAnswers": [
      {
        "questionId": "q1",
        "question": "What is closure?",
        "yourAnswer": "a",
        "correctAnswer": "a",
        "isCorrect": true,
        "explanation": "..."
      }
    ]
  }
}
```

---

### Get Quiz History
List all quiz attempts for user.

**Endpoint:** `GET /quiz/history`
**Auth Required:** Yes

**Query Parameters:**
- `limit`: Default 10
- `offset`: Default 0

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "sessions": [
      {
        "sessionId": "quiz_abc123",
        "quizType": "javascript-fundamentals",
        "score": 85,
        "completedAt": "2026-02-01T11:00:00.000Z"
      }
    ],
    "stats": {
      "totalQuizzes": 12,
      "averageScore": 82.5,
      "topCategory": "JavaScript"
    }
  }
}
```

---

## Mentorship Platform

### Register as Mentor
Submit mentor profile for verification.

**Endpoint:** `POST /mentorship/register`
**Auth Required:** Yes

**Request Body:**
```json
{
  "company": "Google",
  "jobTitle": "Senior Software Engineer",
  "industry": "Technology",
  "yearsOfExperience": 8,
  "collegeName": "MIT",
  "degree": "B.S. Computer Science",
  "graduationYear": 2015,
  "major": "Computer Science",
  "expertiseAreas": ["Web Development", "System Design", "Career Coaching"],
  "bio": "I help early-career engineers navigate their growth...",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "portfolioUrl": "https://johndoe.dev",
  "availableHoursPerWeek": 5,
  "preferredMeetingType": "VIDEO",
  "timezone": "America/New_York"
}
```

**Response:** `201 Created`
```json
{
  "status": "success",
  "message": "Mentor registration submitted. Verification email sent.",
  "data": {
    "mentorProfile": {
      "id": "mentor_123",
      "status": "PENDING",
      "verificationEmailSent": true
    }
  }
}
```

---

### Get All Mentors
Discover and filter mentors.

**Endpoint:** `GET /mentorship/mentors`
**Auth Required:** Yes

**Query Parameters:**
- `expertise`: Filter by expertise area
- `industry`: Filter by industry
- `company`: Filter by company
- `minExperience`: Minimum years of experience
- `availableOnly`: Only show mentors with open slots (default: true)
- `sortBy`: `rating` | `experience` | `connections` (default: `rating`)
- `limit`: Default 20
- `offset`: Default 0

**Example:**
```
GET /mentorship/mentors?expertise=Web%20Development&minExperience=5&sortBy=rating
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "mentors": [
      {
        "id": "mentor_123",
        "user": {
          "id": "user_456",
          "name": "John Doe",
          "avatar": "https://..."
        },
        "company": "Google",
        "jobTitle": "Senior Software Engineer",
        "industry": "Technology",
        "yearsOfExperience": 8,
        "expertiseAreas": ["Web Development", "System Design"],
        "bio": "I help early-career engineers...",
        "averageRating": 4.8,
        "totalSessions": 45,
        "activeConnections": 2,
        "availableSlots": 1,
        "isVerified": true,
        "status": "ACTIVE"
      }
    ],
    "pagination": {
      "total": 156,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

### Get Mentor Details
View full mentor profile.

**Endpoint:** `GET /mentorship/mentors/:mentorId`
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "mentor": {
      "id": "mentor_123",
      "user": { ... },
      "company": "Google",
      "jobTitle": "Senior Software Engineer",
      "yearsOfExperience": 8,
      "education": {
        "collegeName": "MIT",
        "degree": "B.S. Computer Science",
        "graduationYear": 2015
      },
      "expertiseAreas": ["Web Development", "System Design"],
      "bio": "...",
      "linkedinUrl": "https://linkedin.com/in/johndoe",
      "stats": {
        "totalConnections": 15,
        "activeConnections": 2,
        "totalSessions": 45,
        "averageRating": 4.8,
        "responseRate": 95
      },
      "availability": {
        "hoursPerWeek": 5,
        "preferredMeetingType": "VIDEO",
        "timezone": "America/New_York",
        "nextAvailable": "2026-02-03T14:00:00.000Z"
      },
      "recentReviews": [
        {
          "id": "review_789",
          "studentName": "Alice Smith",
          "rating": 5,
          "comment": "Extremely helpful and insightful!",
          "createdAt": "2026-01-28T10:00:00.000Z"
        }
      ]
    }
  }
}
```

---

### Send Connection Request
Request mentorship connection.

**Endpoint:** `POST /mentorship/connections/request`
**Auth Required:** Yes

**Request Body:**
```json
{
  "mentorId": "mentor_123",
  "message": "Hi! I'm interested in web development and would love your guidance on transitioning from frontend to full-stack development."
}
```

**Response:** `201 Created`
```json
{
  "status": "success",
  "message": "Connection request sent successfully",
  "data": {
    "connection": {
      "id": "conn_456",
      "mentorId": "mentor_123",
      "studentId": "user_789",
      "status": "PENDING",
      "message": "Hi! I'm interested in...",
      "createdAt": "2026-02-01T11:00:00.000Z"
    }
  }
}
```

---

### Get My Connections
List all mentorship connections.

**Endpoint:** `GET /mentorship/connections`
**Auth Required:** Yes

**Query Parameters:**
- `status`: `PENDING` | `ACCEPTED` | `REJECTED` | `COMPLETED`
- `role`: `mentor` | `student` (user's role in connection)

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "connections": [
      {
        "id": "conn_456",
        "mentor": {
          "id": "mentor_123",
          "name": "John Doe",
          "avatar": "https://...",
          "company": "Google",
          "jobTitle": "Senior Software Engineer"
        },
        "student": {
          "id": "user_789",
          "name": "Alice Smith",
          "avatar": "https://..."
        },
        "status": "ACCEPTED",
        "matchScore": 87.5,
        "acceptedAt": "2026-02-01T12:00:00.000Z",
        "createdAt": "2026-02-01T11:00:00.000Z",
        "chatRoom": {
          "id": "room_999",
          "unreadCount": 2,
          "lastMessage": {
            "content": "Great! Let's schedule a call.",
            "createdAt": "2026-02-01T14:00:00.000Z"
          }
        }
      }
    ]
  }
}
```

---

### Accept Connection Request
Mentor accepts student connection.

**Endpoint:** `POST /mentorship/connections/:connectionId/accept`
**Auth Required:** Yes (Mentor role)

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Connection accepted successfully",
  "data": {
    "connection": {
      "id": "conn_456",
      "status": "ACCEPTED",
      "acceptedAt": "2026-02-01T12:00:00.000Z",
      "chatRoom": {
        "id": "room_999",
        "isActive": true
      }
    }
  }
}
```

---

## Session Booking

### Get Mentor Availability
View mentor's available time slots.

**Endpoint:** `GET /sessions/availability/:mentorId`
**Auth Required:** Yes

**Query Parameters:**
- `startDate`: ISO 8601 date (default: today)
- `endDate`: ISO 8601 date (default: 14 days from today)
- `timezone`: IANA timezone (default: user's timezone)

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "availability": [
      {
        "date": "2026-02-03",
        "slots": [
          {
            "startTime": "2026-02-03T14:00:00.000Z",
            "endTime": "2026-02-03T14:30:00.000Z",
            "isAvailable": true,
            "isBooked": false
          },
          {
            "startTime": "2026-02-03T15:00:00.000Z",
            "endTime": "2026-02-03T15:30:00.000Z",
            "isAvailable": false,
            "isBooked": true,
            "bookedBy": "current_user"
          }
        ]
      }
    ],
    "timezone": "America/New_York",
    "totalAvailableSlots": 24
  }
}
```

---

### Book Session
Schedule a mentorship session.

**Endpoint:** `POST /sessions/book`
**Auth Required:** Yes

**Request Body:**
```json
{
  "mentorId": "mentor_123",
  "scheduledAt": "2026-02-03T14:00:00.000Z",
  "duration": 30,
  "title": "Career Discussion",
  "description": "Want to discuss transition to full-stack development",
  "sessionType": "VIDEO",
  "timezone": "America/New_York"
}
```

**Response:** `201 Created`
```json
{
  "status": "success",
  "message": "Session booked successfully",
  "data": {
    "session": {
      "id": "session_789",
      "mentorId": "mentor_123",
      "studentId": "user_456",
      "title": "Career Discussion",
      "scheduledAt": "2026-02-03T14:00:00.000Z",
      "duration": 30,
      "sessionType": "VIDEO",
      "status": "SCHEDULED",
      "meetingLink": "https://meet.jit.si/careerforge-session-789",
      "meetingRoom": "careerforge-session-789"
    }
  }
}
```

---

### Get My Sessions
List all booked sessions.

**Endpoint:** `GET /sessions/my-sessions`
**Auth Required:** Yes

**Query Parameters:**
- `status`: `SCHEDULED` | `COMPLETED` | `CANCELLED`
- `role`: `mentor` | `student`
- `upcoming`: `true` | `false` (default: show all)

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "sessions": [
      {
        "id": "session_789",
        "mentor": {
          "id": "mentor_123",
          "name": "John Doe",
          "avatar": "https://..."
        },
        "student": {
          "id": "user_456",
          "name": "Alice Smith"
        },
        "title": "Career Discussion",
        "scheduledAt": "2026-02-03T14:00:00.000Z",
        "duration": 30,
        "status": "SCHEDULED",
        "meetingLink": "https://meet.jit.si/careerforge-session-789",
        "canCancel": true,
        "canReschedule": true
      }
    ],
    "stats": {
      "totalSessions": 5,
      "upcomingSessions": 2,
      "completedSessions": 3
    }
  }
}
```

---

### Cancel Session
Cancel a scheduled session.

**Endpoint:** `POST /sessions/:sessionId/cancel`
**Auth Required:** Yes

**Request Body:**
```json
{
  "reason": "Scheduling conflict"
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Session cancelled successfully",
  "data": {
    "session": {
      "id": "session_789",
      "status": "CANCELLED",
      "cancelledAt": "2026-02-01T11:00:00.000Z",
      "cancellationReason": "Scheduling conflict"
    }
  }
}
```

---

## Career Planning

### Create Career Goal
Start a new career trajectory.

**Endpoint:** `POST /career/goals`
**Auth Required:** Yes

**Request Body:**
```json
{
  "currentPosition": "Frontend Developer",
  "targetPosition": "Full-Stack Developer",
  "targetCompany": "FAANG",
  "targetIndustry": "Technology",
  "timeline": "12 months"
}
```

**Response:** `201 Created`
```json
{
  "status": "success",
  "message": "Career goal created successfully. AI is generating personalized plan...",
  "data": {
    "goal": {
      "id": "goal_123",
      "currentPosition": "Frontend Developer",
      "targetPosition": "Full-Stack Developer",
      "timeline": "12 months",
      "status": "IN_PROGRESS",
      "progress": 0,
      "createdAt": "2026-02-01T11:00:00.000Z",
      "milestones": [
        {
          "id": "milestone_1",
          "title": "Master Backend Fundamentals",
          "description": "Learn Node.js, Express, and RESTful API design",
          "targetDate": "2026-05-01",
          "status": "PENDING",
          "estimatedHours": 80
        }
      ],
      "skillGaps": [
        {
          "id": "skill_1",
          "skillName": "Node.js",
          "category": "TECHNICAL",
          "currentLevel": 2,
          "targetLevel": 8,
          "priority": "HIGH",
          "estimatedWeeks": 8
        }
      ],
      "resources": [
        {
          "id": "resource_1",
          "skillGapId": "skill_1",
          "title": "Node.js - The Complete Guide",
          "type": "COURSE",
          "url": "https://udemy.com/...",
          "provider": "Udemy",
          "duration": "40 hours",
          "difficulty": "BEGINNER",
          "cost": 84.99,
          "rating": 4.7
        }
      ]
    }
  }
}
```

---

### Get Career Goals
List all career goals.

**Endpoint:** `GET /career/goals`
**Auth Required:** Yes

**Query Parameters:**
- `status`: `IN_PROGRESS` | `COMPLETED` | `ARCHIVED`

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "goals": [
      {
        "id": "goal_123",
        "currentPosition": "Frontend Developer",
        "targetPosition": "Full-Stack Developer",
        "timeline": "12 months",
        "status": "IN_PROGRESS",
        "progress": 35,
        "createdAt": "2026-02-01T11:00:00.000Z",
        "stats": {
          "totalMilestones": 8,
          "completedMilestones": 2,
          "totalSkills": 12,
          "masteredSkills": 4
        }
      }
    ]
  }
}
```

---

### Update Milestone Status
Mark milestone as complete.

**Endpoint:** `PATCH /career/goals/:goalId/milestones/:milestoneId`
**Auth Required:** Yes

**Request Body:**
```json
{
  "status": "COMPLETED",
  "progress": 100,
  "actualHours": 85
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Milestone updated successfully",
  "data": {
    "milestone": {
      "id": "milestone_1",
      "status": "COMPLETED",
      "progress": 100,
      "completedAt": "2026-02-15T10:00:00.000Z"
    },
    "goalProgress": {
      "overallProgress": 45,
      "completedMilestones": 3,
      "totalMilestones": 8
    }
  }
}
```

---

## Notifications

### Get Notifications
Retrieve user notifications.

**Endpoint:** `GET /notifications`
**Auth Required:** Yes

**Query Parameters:**
- `unread`: `true` | `false`
- `type`: Filter by notification type
- `limit`: Default 20
- `offset`: Default 0

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "type": "CONNECTION_REQUEST",
        "title": "New Connection Request",
        "message": "John Doe wants to connect as your mentor",
        "data": {
          "connectionId": "conn_456",
          "mentorId": "mentor_123"
        },
        "actionUrl": "/app/connections",
        "isRead": false,
        "createdAt": "2026-02-01T10:00:00.000Z"
      },
      {
        "id": "notif_124",
        "type": "SESSION_REMINDER",
        "title": "Upcoming Session",
        "message": "Your session with John Doe starts in 1 hour",
        "data": {
          "sessionId": "session_789",
          "scheduledAt": "2026-02-01T15:00:00.000Z"
        },
        "actionUrl": "/app/sessions/session_789",
        "isRead": false,
        "createdAt": "2026-02-01T14:00:00.000Z"
      }
    ],
    "unreadCount": 5,
    "total": 45
  }
}
```

**Notification Types:**
- `CONNECTION_REQUEST`: New mentorship connection request
- `CONNECTION_ACCEPTED`: Connection request accepted
- `CONNECTION_REJECTED`: Connection request declined
- `NEW_MESSAGE`: New chat message received
- `SESSION_BOOKED`: Session booking confirmed
- `SESSION_CANCELLED`: Session was cancelled
- `SESSION_REMINDER`: Upcoming session reminder (1 hour, 24 hours)
- `MILESTONE_COMPLETED`: Career milestone achieved
- `QUIZ_COMPLETED`: Quiz results ready
- `SYSTEM_ANNOUNCEMENT`: Platform announcement

---

### Mark as Read
Mark notification(s) as read.

**Endpoint:** `POST /notifications/mark-read`
**Auth Required:** Yes

**Request Body:**
```json
{
  "notificationIds": ["notif_123", "notif_124"]
}
```

**Or mark all as read:**
```json
{
  "markAllAsRead": true
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Notifications marked as read",
  "data": {
    "updated": 2,
    "remainingUnread": 3
  }
}
```

---

## Analytics

### User Dashboard Stats
Get personalized dashboard statistics.

**Endpoint:** `GET /dashboard/stats`
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "overview": {
      "totalSessions": 12,
      "activeConnections": 2,
      "completedQuizzes": 8,
      "careerGoals": 1,
      "goalsProgress": 35
    },
    "recentActivity": [
      {
        "type": "session_completed",
        "title": "Completed session with John Doe",
        "timestamp": "2026-02-01T10:00:00.000Z"
      }
    ],
    "upcomingSessions": [
      {
        "id": "session_789",
        "title": "Career Discussion",
        "mentor": "John Doe",
        "scheduledAt": "2026-02-03T14:00:00.000Z"
      }
    ],
    "skillDevelopment": {
      "totalSkills": 12,
      "inProgress": 5,
      "mastered": 4,
      "notStarted": 3
    },
    "achievements": [
      {
        "title": "First Quiz Completed",
        "description": "Completed your first skill assessment",
        "earnedAt": "2026-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

---

### Platform Analytics (Admin)
Get platform-wide statistics.

**Endpoint:** `GET /analytics/platform`
**Auth Required:** Yes (Admin role)

**Query Parameters:**
- `period`: `7` | `30` | `90` | `365` (days)

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "users": {
      "total": 1247,
      "new": 89,
      "active": 456,
      "growth": [
        { "date": "2026-01-25", "count": 1158 },
        { "date": "2026-02-01", "count": 1247 }
      ]
    },
    "mentors": {
      "total": 156,
      "active": 89,
      "pending": 12,
      "averageRating": 4.6
    },
    "sessions": {
      "total": 892,
      "scheduled": 45,
      "completed": 789,
      "cancelled": 58,
      "byStatus": [
        { "status": "COMPLETED", "count": 789 },
        { "status": "SCHEDULED", "count": 45 }
      ]
    },
    "engagement": {
      "dailyActiveUsers": 234,
      "averageSessionDuration": "18m 45s",
      "messagesPerDay": 1456,
      "quizzesPerDay": 67
    }
  }
}
```

---

## User Management

### Get User Profile
Retrieve current user's profile.

**Endpoint:** `GET /users/profile`
**Auth Required:** Yes

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user_456",
      "name": "Alice Smith",
      "email": "alice@example.com",
      "roles": ["STUDENT"],
      "avatar": "https://...",
      "bio": "Aspiring full-stack developer",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "stats": {
        "totalSessions": 12,
        "connections": 2,
        "quizzesTaken": 8
      }
    }
  }
}
```

---

### Update Profile
Update user information.

**Endpoint:** `PUT /users/profile`
**Auth Required:** Yes

**Request Body:**
```json
{
  "name": "Alice M. Smith",
  "bio": "Full-stack developer passionate about AI/ML",
  "avatar": "https://..."
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "user": { ... }
  }
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "status": "error",
  "message": "Human-readable error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is already in use",
      "code": "DUPLICATE_EMAIL"
    }
  ],
  "metadata": {
    "timestamp": "2026-02-01T10:30:00.000Z",
    "requestId": "req_abc123"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| `200` | OK | Successful GET, PUT, PATCH |
| `201` | Created | Successful POST with resource creation |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Invalid input, validation errors |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Resource conflict (duplicate email, etc.) |
| `422` | Unprocessable Entity | Validation errors with details |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |
| `503` | Service Unavailable | Temporary service outage |

### Common Error Codes

```javascript
// Authentication Errors
{
  "code": "INVALID_CREDENTIALS",
  "message": "Email or password is incorrect"
}

{
  "code": "TOKEN_EXPIRED",
  "message": "Authentication token has expired. Please log in again."
}

// Validation Errors
{
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}

// Resource Errors
{
  "code": "RESOURCE_NOT_FOUND",
  "message": "Mentor profile not found"
}

{
  "code": "RESOURCE_CONFLICT",
  "message": "Connection request already exists"
}

// Business Logic Errors
{
  "code": "MAX_CONNECTIONS_REACHED",
  "message": "Mentor has reached maximum active connections (3)"
}

{
  "code": "SLOT_ALREADY_BOOKED",
  "message": "This time slot is no longer available"
}
```

---

## Rate Limiting

### Default Limits

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| **Global** | 100 requests | 15 minutes |
| **Authentication** | 5 requests | 15 minutes |
| **Chat/AI** | 20 requests | 1 minute |
| **Search** | 30 requests | 1 minute |
| **File Upload** | 10 requests | 1 hour |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1643712000
```

### Rate Limit Exceeded Response

```json
{
  "status": "error",
  "message": "Too many requests. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "metadata": {
    "retryAfter": 300,
    "limit": 100,
    "window": "15 minutes"
  }
}
```

---

## WebSocket Events

### Connection
```javascript
const socket = io('wss://api.careerforge.com', {
  auth: { token: 'Bearer eyJhbGciOi...' },
  transports: ['websocket', 'polling']
});
```

### Chat Events

**Join Room:**
```javascript
socket.emit('join-room', roomId);
```

**Send Message:**
```javascript
socket.emit('send-message', {
  roomId: 'room_123',
  content: 'Hello!',
  messageType: 'TEXT'
});
```

**Receive Message:**
```javascript
socket.on('new-message', (message) => {
  console.log(message);
  // {
  //   roomId: 'room_123',
  //   senderId: 'user_456',
  //   content: 'Hello!',
  //   messageType: 'TEXT',
  //   createdAt: '2026-02-01T10:30:00.000Z'
  // }
});
```

**Typing Indicators:**
```javascript
socket.emit('typing', { roomId: 'room_123' });
socket.emit('stop-typing', { roomId: 'room_123' });

socket.on('user-typing', ({ userId, roomId }) => {
  // Show typing indicator
});

socket.on('user-stop-typing', ({ userId, roomId }) => {
  // Hide typing indicator
});
```

### Notification Events

**Receive Notification:**
```javascript
socket.on('notification', (notification) => {
  console.log(notification);
  // {
  //   id: 'notif_123',
  //   type: 'CONNECTION_REQUEST',
  //   title: 'New Connection Request',
  //   message: '...',
  //   data: { ... }
  // }
});
```

---

## Best Practices

### Authentication
- Store JWT token securely (localStorage or httpOnly cookie)
- Include token in all authenticated requests: `Authorization: Bearer <token>`
- Handle token expiration gracefully (refresh or redirect to login)

### Pagination
- Always specify `limit` to avoid large responses
- Use `offset` for pagination or cursor-based pagination where available
- Check `hasMore` field to determine if more pages exist

### Error Handling
- Always check `status` field in response
- Parse `errors` array for validation details
- Display user-friendly error messages from `message` field
- Log full error response for debugging

### Performance
- Use query parameters to filter data client-side
- Implement caching for frequently accessed data
- Debounce search queries
- Use WebSocket for real-time updates instead of polling

### Security
- Never expose JWT tokens in URLs
- Validate all user inputs client-side before sending
- Handle sensitive data (passwords, tokens) securely
- Implement CSRF protection for state-changing operations

---

*API Version: 1.0.0*  
*Last Updated: February 2026*  
*Base URL: `https://api.careerforge.com/api/v1`*
