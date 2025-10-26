# 🚀 CareerForge AI - Complete API Endpoints Guide for Postman

## 📋 Table of Contents
1. [Server Information](#server-information)
2. [Authentication Endpoints](#authentication-endpoints)
3. [User Profile Endpoints](#user-profile-endpoints)
4. [Chat/AI Endpoints](#chat-endpoints)
5. [Quiz/Assessment Endpoints](#quiz-endpoints)
6. [Mentorship Platform Endpoints](#mentorship-endpoints)
7. [Mentor Chat Endpoints](#mentor-chat-endpoints)
8. [Mentor Session Booking Endpoints](#session-booking-endpoints)
9. [Review System Endpoints](#review-endpoints)
10. [Notification Endpoints](#notification-endpoints)
11. [Analytics Endpoints](#analytics-endpoints)
12. [Dashboard Endpoints](#dashboard-endpoints)
13. [Career Trajectory Endpoints](#career-endpoints)
14. [Reaction Endpoints](#reaction-endpoints)
15. [Share Endpoints](#share-endpoints)
16. [Health Check Endpoints](#health-check-endpoints)

---

## 🌐 Server Information

**Base URL**: `http://localhost:3000`  
**API Version**: `v1`  
**API Base**: `http://localhost:3000/api/v1`

### Environment Variables Needed:
```env
PORT=3000
JWT_SECRET=your-secret-key
DATABASE_URL=your-database-url
NODE_ENV=development
```

---

## 🔐 Authentication Endpoints

### Base Path: `/api/v1/auth`

#### 1. Register New User
```
POST /api/v1/auth/register

Headers:
Content-Type: application/json

Body (JSON):
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!@"
}

Success Response (201):
{
  "status": "success",
  "message": "User registered successfully. Please log in.",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "roles": ["STUDENT"],
      "avatar": null,
      "bio": null,
      "createdAt": "2025-10-12T...",
      "updatedAt": "2025-10-12T..."
    }
  }
}
```

**Validation Rules**:
- Name: Required
- Email: Valid email format
- Password: Min 8 chars, must contain uppercase, lowercase, number, and special character

#### 2. Login
```
POST /api/v1/auth/login

Headers:
Content-Type: application/json

Body (JSON):
{
  "email": "john@example.com",
  "password": "SecurePass123!@"
}

Success Response (200):
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "roles": ["STUDENT"],
      "avatar": null
    }
  }
}
```

#### 3. Forgot Password
```
POST /api/v1/auth/forgot-password

Headers:
Content-Type: application/json

Body (JSON):
{
  "email": "john@example.com"
}

Success Response (200):
{
  "status": "success",
  "message": "Password reset email sent. Please check your inbox."
}
```

#### 4. Reset Password
```
POST /api/v1/auth/reset-password

Headers:
Content-Type: application/json

Body (JSON):
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!@"
}

Success Response (200):
{
  "status": "success",
  "message": "Password reset successful. You can now log in with your new password."
}
```

#### 5. Verify Email
```
GET /api/v1/auth/verify-email?token=verification-token

Success Response (200):
{
  "status": "success",
  "message": "Email verified successfully"
}
```

---

## 👤 User Profile Endpoints

### Base Path: `/api/v1/users`

#### 1. Get User Profile
```
GET /api/v1/users/profile

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "roles": ["STUDENT"],
    "avatar": "url",
    "bio": "Bio text",
    "createdAt": "2025-10-12T...",
    "updatedAt": "2025-10-12T..."
  }
}
```

#### 2. Update User Profile
```
PUT /api/v1/users/profile

Headers:
Authorization: Bearer {jwt-token}
Content-Type: application/json

Body (JSON):
{
  "name": "John Updated",
  "bio": "New bio text",
  "avatar": "new-avatar-url"
}

Success Response (200):
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "user": { /* updated user object */ }
  }
}
```

#### 3. Delete User Account
```
DELETE /api/v1/users/profile

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "message": "Account deleted successfully"
}
```

---

## 💬 Chat/AI Endpoints

### Base Path: `/api/v1/chat`

#### 1. Send Chat Message (AI Career Guidance)
```
POST /api/v1/chat

Headers:
Authorization: Bearer {jwt-token}
Content-Type: application/json

Body (JSON):
{
  "message": "What career path should I take for AI?",
  "context": "I have a background in computer science"
}

Success Response (200):
{
  "status": "success",
  "data": {
    "response": "AI generated response...",
    "conversationId": "uuid",
    "timestamp": "2025-10-12T..."
  }
}
```

#### 2. Get Chat History
```
GET /api/v1/chat/history?limit=20&offset=0

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "message": "User message",
        "response": "AI response",
        "timestamp": "2025-10-12T..."
      }
    ],
    "total": 50,
    "limit": 20,
    "offset": 0
  }
}
```

#### 3. Delete Chat History
```
DELETE /api/v1/chat/history/:conversationId

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "message": "Chat history deleted"
}
```

---

## 📝 Quiz/Assessment Endpoints

### Base Path: `/api/v1/quiz`

#### 1. Get Available Quizzes
```
GET /api/v1/quiz/available

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "data": {
    "quizzes": [
      {
        "id": "uuid",
        "title": "Career Assessment Quiz",
        "description": "Discover your ideal career path",
        "duration": 15,
        "questionCount": 20
      }
    ]
  }
}
```

#### 2. Start Quiz
```
POST /api/v1/quiz/start

Headers:
Authorization: Bearer {jwt-token}
Content-Type: application/json

Body (JSON):
{
  "quizId": "uuid"
}

Success Response (200):
{
  "status": "success",
  "data": {
    "quizSessionId": "uuid",
    "questions": [
      {
        "id": "uuid",
        "question": "What motivates you most?",
        "options": ["A", "B", "C", "D"],
        "type": "multiple-choice"
      }
    ]
  }
}
```

#### 3. Submit Quiz Answers
```
POST /api/v1/quiz/submit

Headers:
Authorization: Bearer {jwt-token}
Content-Type: application/json

Body (JSON):
{
  "quizSessionId": "uuid",
  "answers": [
    {
      "questionId": "uuid",
      "answer": "A"
    }
  ]
}

Success Response (200):
{
  "status": "success",
  "data": {
    "score": 85,
    "results": {
      "careerRecommendations": ["Software Engineer", "Data Scientist"],
      "strengths": ["Analytical", "Problem-solving"],
      "developmentAreas": ["Communication", "Leadership"]
    }
  }
}
```

#### 4. Get Quiz Results
```
GET /api/v1/quiz/results/:quizSessionId

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "data": {
    "results": { /* quiz results */ }
  }
}
```

---

## 🤝 Mentorship Platform Endpoints

### Base Path: `/api/v1/mentorship`

#### 1. Register as Mentor
```
POST /api/v1/mentorship/register

Headers:
Authorization: Bearer {jwt-token}
Content-Type: application/json

Body (JSON):
{
  "expertise": ["Software Engineering", "Career Development"],
  "bio": "10+ years experience in tech...",
  "availability": "Weekdays 6-9pm",
  "hourlyRate": 50,
  "linkedinUrl": "https://linkedin.com/in/johndoe"
}

Success Response (201):
{
  "status": "success",
  "message": "Mentor application submitted",
  "data": {
    "mentorId": "uuid",
    "status": "PENDING"
  }
}
```

#### 2. Get All Mentors (Public)
```
GET /api/v1/mentorship/mentors?expertise=Software&page=1&limit=10

Headers:
Authorization: Bearer {jwt-token} (optional for public access)

Success Response (200):
{
  "status": "success",
  "data": {
    "mentors": [
      {
        "id": "uuid",
        "name": "Jane Smith",
        "expertise": ["Software Engineering"],
        "rating": 4.8,
        "reviewCount": 25,
        "hourlyRate": 50,
        "avatar": "url"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

#### 3. Get Mentor Details
```
GET /api/v1/mentorship/mentors/:mentorId

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "data": {
    "mentor": {
      "id": "uuid",
      "name": "Jane Smith",
      "bio": "...",
      "expertise": ["Software Engineering"],
      "rating": 4.8,
      "reviewCount": 25,
      "hourlyRate": 50,
      "availability": "...",
      "linkedinUrl": "..."
    }
  }
}
```

#### 4. Send Connection Request
```
POST /api/v1/mentorship/connect

Headers:
Authorization: Bearer {jwt-token}
Content-Type: application/json

Body (JSON):
{
  "mentorId": "uuid",
  "message": "I'd love to learn from your experience in..."
}

Success Response (201):
{
  "status": "success",
  "message": "Connection request sent",
  "data": {
    "connectionId": "uuid"
  }
}
```

#### 5. Get My Connections
```
GET /api/v1/mentorship/connections?status=ACCEPTED&role=MENTEE

Headers:
Authorization: Bearer {jwt-token}

Query Parameters:
- status: PENDING, ACCEPTED, REJECTED (optional)
- role: MENTOR, MENTEE (optional)

Success Response (200):
{
  "status": "success",
  "data": {
    "connections": [
      {
        "id": "uuid",
        "mentor": { /* mentor details */ },
        "mentee": { /* mentee details */ },
        "status": "ACCEPTED",
        "createdAt": "2025-10-12T..."
      }
    ]
  }
}
```

#### 6. Accept/Reject Connection
```
PATCH /api/v1/mentorship/connections/:connectionId

Headers:
Authorization: Bearer {jwt-token}
Content-Type: application/json

Body (JSON):
{
  "status": "ACCEPTED" // or "REJECTED"
}

Success Response (200):
{
  "status": "success",
  "message": "Connection updated",
  "data": {
    "connection": { /* updated connection */ }
  }
}
```

#### 7. Update Mentor Profile
```
PUT /api/v1/mentorship/profile

Headers:
Authorization: Bearer {jwt-token}
Content-Type: application/json

Body (JSON):
{
  "bio": "Updated bio...",
  "expertise": ["Updated expertise"],
  "hourlyRate": 60,
  "availability": "Updated availability"
}

Success Response (200):
{
  "status": "success",
  "message": "Mentor profile updated"
}
```

---

## 💬 Mentor Chat Endpoints

### Base Path: `/api/v1/mentor-chat`

#### 1. Send Message to Mentor
```
POST /api/v1/mentor-chat/send

Headers:
Authorization: Bearer {jwt-token}
Content-Type: application/json

Body (JSON):
{
  "recipientId": "mentor-uuid",
  "message": "Hello, I have a question about...",
  "connectionId": "connection-uuid"
}

Success Response (201):
{
  "status": "success",
  "data": {
    "message": {
      "id": "uuid",
      "senderId": "user-uuid",
      "recipientId": "mentor-uuid",
      "message": "Hello...",
      "timestamp": "2025-10-12T...",
      "read": false
    }
  }
}
```

#### 2. Get Chat Messages
```
GET /api/v1/mentor-chat/messages/:connectionId?limit=50&offset=0

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "data": {
    "messages": [
      {
        "id": "uuid",
        "senderId": "uuid",
        "recipientId": "uuid",
        "message": "Message text",
        "timestamp": "2025-10-12T...",
        "read": true
      }
    ],
    "total": 100
  }
}
```

#### 3. Mark Messages as Read
```
PATCH /api/v1/mentor-chat/read/:messageId

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "message": "Message marked as read"
}
```

#### 4. Get Unread Message Count
```
GET /api/v1/mentor-chat/unread

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "data": {
    "unreadCount": 5
  }
}
```

---

## 📅 Mentor Session Booking Endpoints

### Base Path: `/api/v1/sessions`

#### 1. Book Session with Mentor
```
POST /api/v1/sessions/book

Headers:
Authorization: Bearer {jwt-token}
Content-Type: application/json

Body (JSON):
{
  "mentorId": "uuid",
  "connectionId": "uuid",
  "scheduledAt": "2025-10-15T14:00:00Z",
  "duration": 60,
  "topic": "Career transition to AI",
  "notes": "Want to discuss career path..."
}

Success Response (201):
{
  "status": "success",
  "message": "Session booked successfully",
  "data": {
    "session": {
      "id": "uuid",
      "mentorId": "uuid",
      "menteeId": "uuid",
      "scheduledAt": "2025-10-15T14:00:00Z",
      "duration": 60,
      "status": "SCHEDULED",
      "topic": "Career transition to AI"
    }
  }
}
```

#### 2. Get My Sessions
```
GET /api/v1/sessions?status=SCHEDULED&role=MENTEE&page=1&limit=10

Headers:
Authorization: Bearer {jwt-token}

Query Parameters:
- status: SCHEDULED, COMPLETED, CANCELLED (optional)
- role: MENTOR, MENTEE (optional)
- page: number (default: 1)
- limit: number (default: 10)

Success Response (200):
{
  "status": "success",
  "data": {
    "sessions": [
      {
        "id": "uuid",
        "mentor": { /* mentor details */ },
        "mentee": { /* mentee details */ },
        "scheduledAt": "2025-10-15T14:00:00Z",
        "duration": 60,
        "status": "SCHEDULED",
        "topic": "Career transition"
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 10
  }
}
```

#### 3. Get Session Details
```
GET /api/v1/sessions/:sessionId

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "data": {
    "session": { /* full session details */ }
  }
}
```

#### 4. Cancel Session
```
PATCH /api/v1/sessions/:sessionId/cancel

Headers:
Authorization: Bearer {jwt-token}
Content-Type: application/json

Body (JSON):
{
  "reason": "Schedule conflict"
}

Success Response (200):
{
  "status": "success",
  "message": "Session cancelled successfully"
}
```

#### 5. Complete Session
```
PATCH /api/v1/sessions/:sessionId/complete

Headers:
Authorization: Bearer {jwt-token}
Content-Type: application/json

Body (JSON):
{
  "notes": "Great session, covered all topics..."
}

Success Response (200):
{
  "status": "success",
  "message": "Session marked as completed"
}
```

#### 6. Reschedule Session
```
PATCH /api/v1/sessions/:sessionId/reschedule

Headers:
Authorization: Bearer {jwt-token}
Content-Type: application/json

Body (JSON):
{
  "newScheduledAt": "2025-10-16T15:00:00Z",
  "reason": "Schedule conflict"
}

Success Response (200):
{
  "status": "success",
  "message": "Session rescheduled successfully"
}
```

---

## ⭐ Review System Endpoints

### Base Path: `/api/v1/reviews`

#### 1. Submit Review for Mentor
```
POST /api/v1/reviews

Headers:
Authorization: Bearer {jwt-token}
Content-Type: application/json

Body (JSON):
{
  "mentorId": "uuid",
  "sessionId": "uuid",
  "rating": 5,
  "comment": "Excellent mentor! Very helpful and insightful.",
  "tags": ["knowledgeable", "patient", "clear-communication"]
}

Success Response (201):
{
  "status": "success",
  "message": "Review submitted successfully",
  "data": {
    "review": {
      "id": "uuid",
      "rating": 5,
      "comment": "...",
      "createdAt": "2025-10-12T..."
    }
  }
}
```

#### 2. Get Reviews for Mentor
```
GET /api/v1/reviews/mentor/:mentorId?page=1&limit=10

Headers:
Authorization: Bearer {jwt-token} (optional)

Success Response (200):
{
  "status": "success",
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "rating": 5,
        "comment": "...",
        "reviewer": {
          "name": "John Doe",
          "avatar": "url"
        },
        "createdAt": "2025-10-12T..."
      }
    ],
    "averageRating": 4.8,
    "totalReviews": 25
  }
}
```

#### 3. Update My Review
```
PUT /api/v1/reviews/:reviewId

Headers:
Authorization: Bearer {jwt-token}
Content-Type: application/json

Body (JSON):
{
  "rating": 4,
  "comment": "Updated review comment..."
}

Success Response (200):
{
  "status": "success",
  "message": "Review updated successfully"
}
```

#### 4. Delete My Review
```
DELETE /api/v1/reviews/:reviewId

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "message": "Review deleted successfully"
}
```

---

## 🔔 Notification Endpoints

### Base Path: `/api/v1/notifications`

#### 1. Get My Notifications
```
GET /api/v1/notifications?read=false&page=1&limit=20

Headers:
Authorization: Bearer {jwt-token}

Query Parameters:
- read: true/false (optional)
- page: number
- limit: number

Success Response (200):
{
  "status": "success",
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "CONNECTION_REQUEST",
        "title": "New connection request",
        "message": "Jane Smith wants to connect...",
        "read": false,
        "createdAt": "2025-10-12T..."
      }
    ],
    "unreadCount": 5,
    "total": 50
  }
}
```

#### 2. Mark Notification as Read
```
PATCH /api/v1/notifications/:notificationId/read

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "message": "Notification marked as read"
}
```

#### 3. Mark All as Read
```
PATCH /api/v1/notifications/read-all

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "message": "All notifications marked as read"
}
```

#### 4. Delete Notification
```
DELETE /api/v1/notifications/:notificationId

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "message": "Notification deleted"
}
```

#### 5. Get Notification Settings
```
GET /api/v1/notifications/settings

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "data": {
    "settings": {
      "emailNotifications": true,
      "pushNotifications": true,
      "connectionRequests": true,
      "sessionReminders": true,
      "newMessages": true
    }
  }
}
```

#### 6. Update Notification Settings
```
PUT /api/v1/notifications/settings

Headers:
Authorization: Bearer {jwt-token}
Content-Type: application/json

Body (JSON):
{
  "emailNotifications": false,
  "pushNotifications": true,
  "connectionRequests": true
}

Success Response (200):
{
  "status": "success",
  "message": "Notification settings updated"
}
```

---

## 📊 Analytics Endpoints

### Base Path: `/api/v1/analytics`

#### 1. Get User Analytics Dashboard
```
GET /api/v1/analytics/dashboard

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "data": {
    "overview": {
      "totalSessions": 15,
      "totalMentors": 3,
      "totalQuizzes": 5,
      "careerScore": 85
    },
    "recentActivity": [ /* activity items */ ],
    "upcomingSessions": [ /* session items */ ]
  }
}
```

#### 2. Get Mentor Analytics
```
GET /api/v1/analytics/mentor

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "data": {
    "totalSessions": 50,
    "totalMentees": 20,
    "averageRating": 4.8,
    "totalEarnings": 2500,
    "sessionsByMonth": [ /* monthly data */ ]
  }
}
```

#### 3. Get Career Progress
```
GET /api/v1/analytics/career-progress

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "data": {
    "currentLevel": "Intermediate",
    "progress": 65,
    "completedMilestones": 8,
    "totalMilestones": 12,
    "skills": [ /* skill progress */ ]
  }
}
```

---

## 🏠 Dashboard Endpoints

### Base Path: `/api/v1/dashboard`

#### 1. Get User Dashboard
```
GET /api/v1/dashboard

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "data": {
    "user": { /* user details */ },
    "stats": {
      "totalSessions": 15,
      "upcomingSessionsCount": 3,
      "completedQuizzes": 5,
      "connectedMentors": 3
    },
    "upcomingSessions": [ /* sessions */ ],
    "recentActivity": [ /* activities */ ],
    "recommendations": [ /* career recommendations */ ]
  }
}
```

#### 2. Get Quick Stats
```
GET /api/v1/dashboard/stats

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "data": {
    "chatCount": 50,
    "quizzesTaken": 5,
    "mentorSessions": 15,
    "careerScore": 85
  }
}
```

---

## 🎯 Career Trajectory Endpoints

### Base Path: `/api/v1/career`

#### 1. Get Career Recommendations
```
POST /api/v1/career/recommendations

Headers:
Authorization: Bearer {jwt-token}
Content-Type: application/json

Body (JSON):
{
  "skills": ["Python", "JavaScript", "Machine Learning"],
  "interests": ["AI", "Data Science"],
  "experience": "2 years"
}

Success Response (200):
{
  "status": "success",
  "data": {
    "recommendations": [
      {
        "title": "Machine Learning Engineer",
        "matchScore": 92,
        "description": "...",
        "requiredSkills": ["Python", "ML", "Statistics"],
        "salaryRange": "$80k-$120k",
        "growthPotential": "High"
      }
    ]
  }
}
```

#### 2. Get Career Path
```
GET /api/v1/career/path/:careerTitle

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "data": {
    "career": "Machine Learning Engineer",
    "currentLevel": "Junior",
    "nextSteps": [
      {
        "step": "Learn Advanced ML Algorithms",
        "duration": "3 months",
        "resources": [ /* learning resources */ ]
      }
    ],
    "milestones": [ /* career milestones */ ]
  }
}
```

#### 3. Save Career Goal
```
POST /api/v1/career/goals

Headers:
Authorization: Bearer {jwt-token}
Content-Type: application/json

Body (JSON):
{
  "title": "Become Machine Learning Engineer",
  "targetDate": "2026-12-31",
  "milestones": ["Learn Python", "Complete ML course", "Build portfolio"]
}

Success Response (201):
{
  "status": "success",
  "message": "Career goal saved",
  "data": {
    "goalId": "uuid"
  }
}
```

#### 4. Get My Career Goals
```
GET /api/v1/career/goals

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "data": {
    "goals": [
      {
        "id": "uuid",
        "title": "Become ML Engineer",
        "progress": 45,
        "targetDate": "2026-12-31",
        "status": "IN_PROGRESS"
      }
    ]
  }
}
```

---

## 👍 Reaction Endpoints

### Base Path: `/api/v1/reactions`

#### 1. Add Reaction to Message
```
POST /api/v1/reactions

Headers:
Authorization: Bearer {jwt-token}
Content-Type: application/json

Body (JSON):
{
  "messageId": "uuid",
  "reactionType": "LIKE" // LIKE, LOVE, HELPFUL, INSIGHTFUL
}

Success Response (201):
{
  "status": "success",
  "message": "Reaction added",
  "data": {
    "reactionId": "uuid"
  }
}
```

#### 2. Remove Reaction
```
DELETE /api/v1/reactions/:reactionId

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "message": "Reaction removed"
}
```

#### 3. Get Message Reactions
```
GET /api/v1/reactions/message/:messageId

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "data": {
    "reactions": [
      {
        "type": "LIKE",
        "count": 5,
        "users": [ /* user details */ ]
      }
    ]
  }
}
```

---

## 🔗 Share Endpoints

### Base Path: `/api/v1/share`

#### 1. Share Chat/Result
```
POST /api/v1/share

Headers:
Authorization: Bearer {jwt-token}
Content-Type: application/json

Body (JSON):
{
  "contentType": "CHAT", // CHAT, QUIZ_RESULT, CAREER_PATH
  "contentId": "uuid",
  "shareWith": "PUBLIC" // PUBLIC, PRIVATE, SPECIFIC_USER
}

Success Response (201):
{
  "status": "success",
  "message": "Content shared",
  "data": {
    "shareId": "uuid",
    "shareUrl": "https://careerforge.ai/share/uuid"
  }
}
```

#### 2. Get Shared Content
```
GET /api/v1/share/:shareId

Success Response (200):
{
  "status": "success",
  "data": {
    "content": { /* shared content */ },
    "sharedBy": "John Doe",
    "sharedAt": "2025-10-12T..."
  }
}
```

#### 3. Revoke Share
```
DELETE /api/v1/share/:shareId

Headers:
Authorization: Bearer {jwt-token}

Success Response (200):
{
  "status": "success",
  "message": "Share revoked"
}
```

---

## 🏥 Health Check Endpoints

### Base Path: `/`

#### 1. Health Check
```
GET /health

Success Response (200):
{
  "status": "success",
  "message": "CareerForge AI API is running",
  "timestamp": "2025-10-12T10:30:00Z",
  "environment": "development"
}
```

#### 2. API Documentation
```
GET /api/v1/docs

Success Response (200):
{
  "status": "success",
  "data": {
    "version": "1.0.0",
    "endpoints": [ /* all endpoints */ ]
  }
}
```

---

## 🔧 Testing Tips for Postman

### 1. Environment Variables Setup
Create a Postman environment with these variables:
```
base_url: http://localhost:3000
api_version: v1
token: (will be set after login)
user_id: (will be set after login)
```

### 2. Authentication Flow
1. First, call `POST /api/v1/auth/register` to create an account
2. Then call `POST /api/v1/auth/login` to get JWT token
3. Save the token in Postman environment: `{{token}}`
4. Use `{{token}}` in Authorization header for all protected routes

### 3. Pre-request Script for Auth
Add this to collection-level Pre-request Script:
```javascript
// Auto-add token if available
if (pm.environment.get("token")) {
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer " + pm.environment.get("token")
    });
}
```

### 4. Test Script for Login
Add this to login request Tests:
```javascript
// Save token after successful login
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.data.token);
    pm.environment.set("user_id", jsonData.data.user.id);
}
```

---

## 🚨 Common Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "field": "email",
        "message": "Valid email is required"
      }
    ]
  }
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "status": "error",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Internal server error",
  "data": {
    "error": "Error details (only in development mode)"
  }
}
```

---

## 📝 Testing Checklist

### Authentication & User Management
- [ ] Register new user
- [ ] Login with credentials
- [ ] Get user profile
- [ ] Update user profile
- [ ] Forgot password
- [ ] Reset password
- [ ] Email verification

### AI Career Guidance
- [ ] Send chat message
- [ ] Get chat history
- [ ] Delete chat history

### Assessments
- [ ] Get available quizzes
- [ ] Start quiz
- [ ] Submit quiz answers
- [ ] Get quiz results

### Mentorship Platform
- [ ] Register as mentor
- [ ] Get all mentors
- [ ] Get mentor details
- [ ] Send connection request
- [ ] Accept/reject connection
- [ ] Update mentor profile

### Mentor Communication
- [ ] Send message to mentor
- [ ] Get chat messages
- [ ] Mark messages as read
- [ ] Get unread count

### Session Management
- [ ] Book session
- [ ] Get my sessions
- [ ] Get session details
- [ ] Cancel session
- [ ] Complete session
- [ ] Reschedule session

### Reviews & Ratings
- [ ] Submit review
- [ ] Get mentor reviews
- [ ] Update review
- [ ] Delete review

### Notifications
- [ ] Get notifications
- [ ] Mark as read
- [ ] Mark all as read
- [ ] Update notification settings

### Analytics & Dashboard
- [ ] Get user dashboard
- [ ] Get analytics
- [ ] Get career progress

### Career Development
- [ ] Get career recommendations
- [ ] Get career path
- [ ] Save career goal
- [ ] Get career goals

---

## 🎯 Postman Collection Import

You can create a Postman collection using this structure. Save this as `CareerForge-AI.postman_collection.json`:

```json
{
  "info": {
    "name": "CareerForge AI",
    "description": "Complete API collection for CareerForge AI platform",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{token}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000",
      "type": "string"
    }
  ]
}
```

---

## 📞 Support

If you encounter any issues:
1. Check server is running: `npm run dev` (backend)
2. Check database connection
3. Verify JWT_SECRET is set in .env
4. Check console logs for detailed errors
5. Ensure all dependencies are installed: `npm install`

---

**Happy Testing! 🚀**
