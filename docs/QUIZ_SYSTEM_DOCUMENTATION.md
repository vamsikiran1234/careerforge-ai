# 🎯 CareerForge AI - Quiz System Complete Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Data Flow](#data-flow)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [Recent Fixes](#recent-fixes)
7. [Testing Guide](#testing-guide)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 System Overview

The CareerForge AI Quiz System is a **5-stage adaptive career assessment** that uses AI to generate personalized questions and recommendations based on user responses.

### Key Features:
- ✅ **Adaptive Questioning**: AI generates contextual questions based on previous answers
- ✅ **5-Stage Assessment**: Skills → Interests → Personality → Learning Style → Career Goals
- ✅ **Session Persistence**: Users can resume incomplete quizzes
- ✅ **AI-Powered Recommendations**: Comprehensive career guidance at completion
- ✅ **Progress Tracking**: Visual progress indicators across all stages

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      QUIZ SYSTEM ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────────┘

Frontend (React + TypeScript)
├── QuizPage.tsx                 # Main quiz interface controller
├── QuizInterface.tsx            # Question display & answer submission
├── QuizResults.tsx              # Final recommendations display
├── QuizHistory.tsx              # Past quiz sessions
└── useQuizStore (Zustand)       # State management with persistence

                    ↕ HTTP/REST API ↕

Backend (Node.js + Express)
├── quizController.js            # Request handling & validation
│   ├── startQuiz()             # Initialize or resume session
│   ├── submitAnswer()          # Process answer & get next question
│   ├── getQuizSession()        # Retrieve session details
│   └── getUserQuizSessions()   # List user's quiz history
│
├── aiService.js                 # AI integration
│   └── quizNext()              # Generate questions & recommendations
│
└── quizUtils.js                 # Helper functions
    ├── calculateProgress()
    ├── getStageInfo()
    └── validateStage()

                    ↕ Prisma ORM ↕

Database (PostgreSQL)
├── quiz_sessions                # Session metadata
└── quiz_questions               # Individual Q&A records
```

---

## 🔄 Data Flow

### 1. Starting a Quiz

```
User clicks "Start Assessment"
         ↓
QuizPage → useQuizStore.startQuiz(userId)
         ↓
POST /api/v1/quiz/start { userId }
         ↓
┌─────────────────────────────────────────┐
│   quizController.startQuiz()            │
│                                         │
│   1. Validate userId exists             │
│   2. Check for existing active session  │
│      ├─ Found? Load existing session    │
│      │   ├─ Has questions? Return last  │
│      │   └─ No questions? Generate Q1   │
│      └─ Not found? Create new session   │
│          ├─ Generate Q1 via AI          │
│          └─ Save to database            │
│   3. Return session + question + progress│
└─────────────────────────────────────────┘
         ↓
Frontend receives:
{
  sessionId: "cuid_xyz",
  currentStage: "SKILLS_ASSESSMENT",
  question: {
    text: "What is your primary programming language?",
    options: ["JavaScript", "Python", "Java", "C++"]
  },
  progress: {
    currentStage: 1,
    totalStages: 5,
    percentage: 20
  }
}
         ↓
QuizPage.useEffect detects currentSession
         ↓
setView('quiz') → Render QuizInterface
```

### 2. Submitting an Answer

```
User selects answer & clicks Submit
         ↓
QuizInterface → useQuizStore.submitAnswer(sessionId, answer)
         ↓
POST /api/v1/quiz/:quizId/answer { answer }
         ↓
┌─────────────────────────────────────────┐
│   quizController.submitAnswer()         │
│                                         │
│   1. Load session from database         │
│   2. Parse existing answers (JSON)      │
│   3. Add new answer to current stage    │
│   4. Call aiService.quizNext()         │
│      ├─ Analyzes all answers so far     │
│      ├─ Determines stage completion     │
│      ├─ Generates next question OR      │
│      └─ Generates final recommendations │
│   5. Update session in database         │
│   6. Return next step to frontend       │
└─────────────────────────────────────────┘
         ↓
Response (More Questions):
{
  sessionId: "cuid_xyz",
  currentStage: "SKILLS_ASSESSMENT",
  question: { ... next question ... },
  progress: { ... updated progress ... }
}
         OR
Response (Quiz Complete):
{
  sessionId: "cuid_xyz",
  isComplete: true,
  results: {
    topCareers: [...],
    skillsToFocus: [...],
    learningPath: {...},
    nextSteps: [...],
    marketInsights: {...}
  }
}
         ↓
Frontend updates UI accordingly
```

### 3. AI Question Generation Flow

```
aiService.quizNext(sessionId, userAnswer)
         ↓
1. Load session with all context:
   - User profile (name, role, bio)
   - Current stage
   - All previous Q&A
   - Question count
         ↓
2. Parse answers from JSON string:
   const answers = JSON.parse(session.answers)
         ↓
3. Determine stage progression:
   - Count answers in current stage
   - Check if stage complete (4 Qs for Skills, 3 for Interests, etc.)
   - Move to next stage or mark COMPLETED
         ↓
4. Build AI prompt with:
   - User context
   - Stage objectives
   - Previous responses
   - Question format requirements
         ↓
5. Call Gemini AI API
         ↓
6. Parse AI response (JSON):
   {
     type: "question",
     stage: "SKILLS_ASSESSMENT",
     question: "...",
     options: ["A", "B", "C", "D"]
   }
   OR
   {
     type: "recommendations",
     stage: "COMPLETED",
     recommendations: { ... }
   }
         ↓
7. Return to controller
```

---

## 🔌 API Endpoints

### POST /api/v1/quiz/start

**Purpose**: Initialize new quiz or resume existing session

**Request**:
```json
{
  "userId": "user_abc123"
}
```

**Success Response (200/201)**:
```json
{
  "status": "success",
  "message": "Quiz session started successfully",
  "data": {
    "sessionId": "cuid_quiz789",
    "currentStage": "SKILLS_ASSESSMENT",
    "question": {
      "text": "Which programming paradigm are you most comfortable with?",
      "options": [
        "Object-Oriented Programming (OOP)",
        "Functional Programming",
        "Procedural Programming",
        "I'm still learning the basics"
      ],
      "stage": "SKILLS_ASSESSMENT"
    },
    "progress": {
      "currentStage": 1,
      "totalStages": 5,
      "percentage": 20
    }
  }
}
```

**Error Responses**:
- `400`: User ID missing
- `404`: User not found
- `500`: AI service failure or database error

---

### POST /api/v1/quiz/:quizId/answer

**Purpose**: Submit answer and get next question

**Request**:
```json
{
  "answer": "Object-Oriented Programming (OOP)",
  "questionId": "question_id_optional"
}
```

**Success Response (200)** - More Questions:
```json
{
  "status": "success",
  "message": "Answer submitted successfully",
  "data": {
    "sessionId": "cuid_quiz789",
    "currentStage": "SKILLS_ASSESSMENT",
    "question": {
      "text": "How many years of programming experience do you have?",
      "options": ["< 1 year", "1-3 years", "3-5 years", "5+ years"]
    },
    "progress": {
      "currentStage": 1,
      "totalStages": 5,
      "percentage": 20
    }
  }
}
```

**Success Response (200)** - Quiz Complete:
```json
{
  "status": "success",
  "message": "Quiz completed successfully!",
  "data": {
    "sessionId": "cuid_quiz789",
    "isComplete": true,
    "results": {
      "topCareers": [
        {
          "title": "Full Stack Developer",
          "description": "Perfect match based on your technical skills",
          "match_percentage": 92,
          "skills_required": ["React", "Node.js", "PostgreSQL"],
          "salary_range": "$80,000 - $130,000",
          "growth_potential": "High - 25% growth projected",
          "learning_timeline": "6-9 months to job-ready",
          "why_match": "Your OOP background and full-stack interests align perfectly"
        }
      ],
      "skillsToFocus": [...],
      "learningPath": {...},
      "nextSteps": [...],
      "marketInsights": {...}
    },
    "progress": {
      "currentStage": 5,
      "totalStages": 5,
      "percentage": 100
    }
  }
}
```

---

### GET /api/v1/quiz/session/:quizId

**Purpose**: Retrieve quiz session details

**Success Response (200)**:
```json
{
  "status": "success",
  "data": {
    "sessionId": "cuid_quiz789",
    "currentStage": "CAREER_INTERESTS",
    "completedAt": null,
    "createdAt": "2025-10-02T10:30:00Z",
    "questions": [
      {
        "questionText": "...",
        "userAnswer": "...",
        "stage": "SKILLS_ASSESSMENT"
      }
    ]
  }
}
```

---

### GET /api/v1/quiz/sessions/:userId

**Purpose**: Get all quiz sessions for a user

**Success Response (200)**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "session1",
      "currentStage": "COMPLETED",
      "completedAt": "2025-10-01T15:00:00Z",
      "score": 87
    },
    {
      "id": "session2",
      "currentStage": "PERSONALITY_TRAITS",
      "completedAt": null
    }
  ]
}
```

---

## 💾 Database Schema

### quiz_sessions Table

```sql
CREATE TABLE quiz_sessions (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_stage TEXT DEFAULT 'SKILLS_ASSESSMENT',
  answers      TEXT DEFAULT '{}',  -- JSON string: { "SKILLS_ASSESSMENT": [...], ... }
  results      TEXT,               -- JSON string: { topCareers: [...], ... }
  score        DECIMAL,
  completed_at TIMESTAMP,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX idx_quiz_sessions_completed ON quiz_sessions(completed_at);
```

### quiz_questions Table

```sql
CREATE TABLE quiz_questions (
  id              TEXT PRIMARY KEY,
  quiz_session_id TEXT NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_text   TEXT NOT NULL,
  options         TEXT DEFAULT '[]',  -- JSON string: ["Option A", "Option B", ...]
  correct_answer  TEXT,
  user_answer     TEXT,
  stage           TEXT NOT NULL,
  order           INTEGER DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quiz_questions_session ON quiz_questions(quiz_session_id);
CREATE INDEX idx_quiz_questions_stage ON quiz_questions(stage);
```

---

## 🔧 Recent Fixes (October 2, 2025)

### Issues Identified & Resolved:

#### 1. **JSON Parsing Error** ✅ FIXED
- **Problem**: `session.answers` is stored as JSON string but was being used directly as object
- **Error**: `currentStage is not defined` (actually a side effect of JSON parsing failure)
- **Fix**: Added proper JSON parsing in 3 locations:
  ```javascript
  // aiService.js line 283
  const currentAnswers = typeof session.answers === 'string' 
    ? JSON.parse(session.answers || '{}')
    : (session.answers || {});
  
  // quizUtils.js line 123
  const answers = typeof session.answers === 'string' 
    ? JSON.parse(session.answers || '{}')
    : (session.answers || {});
  
  // quizController.js already had proper parsing
  ```

#### 2. **Prisma Relation Name Error** ✅ FIXED
- **Problem**: Using `questions` instead of `quizQuestions` in include statement
- **Error**: `Unknown field 'questions' for include statement on model 'QuizSession'`
- **Fix**: Changed line 37 in quizController.js:
  ```javascript
  // Before: questions: { ... }
  // After:  quizQuestions: { ... }
  ```

#### 3. **Missing Error Handling** ✅ FIXED
- **Problem**: Unhandled errors in quiz start and AI service calls
- **Fix**: Added comprehensive try-catch blocks:
  - Existing session resumption (lines 47-99)
  - New session creation (lines 103-157)
  - Proper error messages returned to frontend

#### 4. **Null Question Handling** ✅ FIXED
- **Problem**: Frontend crashed when question was null
- **Fix**: Added validation in:
  - Backend: Checks if AI service returns valid question
  - Frontend: QuizInterface shows loading state if question is null

---

## 🧪 Testing Guide

### Manual Testing Checklist:

1. **Start New Quiz**:
   ```bash
   # Clean database first
   npm run db:reset
   
   # Restart backend
   npm run dev
   
   # Test in browser:
   # 1. Click "Start Assessment"
   # 2. Should see Question 1 of Skills Assessment
   # 3. Check browser console for logs
   ```

2. **Resume Existing Quiz**:
   ```bash
   # Don't complete quiz, just close browser
   # Reopen and click "Start Assessment"
   # Should resume where you left off
   ```

3. **Complete Full Quiz**:
   ```bash
   # Answer all 15 questions (4+3+3+2+3)
   # Should see recommendations page
   # Check results structure matches schema
   ```

4. **Run Cleanup Script**:
   ```bash
   node scripts/cleanupQuizSessions.js
   # Review output for any data inconsistencies
   ```

### Automated Testing:

```javascript
// Add to test suite
describe('Quiz System', () => {
  test('should start new quiz session', async () => {
    const response = await request(app)
      .post('/api/v1/quiz/start')
      .send({ userId: testUser.id });
    
    expect(response.status).toBe(201);
    expect(response.body.data.sessionId).toBeDefined();
    expect(response.body.data.question).toBeDefined();
  });

  test('should resume existing session', async () => {
    // Create session first
    const session = await createQuizSession();
    
    // Try to start again
    const response = await request(app)
      .post('/api/v1/quiz/start')
      .send({ userId: testUser.id });
    
    expect(response.status).toBe(200);
    expect(response.body.data.sessionId).toBe(session.id);
  });
});
```

---

## 🐛 Troubleshooting

### Common Issues:

#### 1. Error: "currentStage is not defined"
**Cause**: JSON parsing issue or corrupted session data  
**Solution**:
```bash
# Run cleanup script
node scripts/cleanupQuizSessions.js

# Or delete all incomplete sessions
DELETE FROM quiz_sessions WHERE completed_at IS NULL;
```

#### 2. Error: "Unknown field 'questions'"
**Cause**: Using wrong relation name in Prisma query  
**Solution**: Ensure all queries use `quizQuestions` not `questions`

#### 3. Quiz doesn't start / No question shown
**Cause**: AI service failure or API key issue  
**Solution**:
```bash
# Check Gemini API key
echo $GEMINI_API_KEY

# Check backend logs
npm run dev  # Look for AI service errors

# Test AI service directly
node -e "require('./src/services/aiService').quizNext('test-session-id', null)"
```

#### 4. Multiple active sessions for same user
**Cause**: Sessions not being properly completed  
**Solution**:
```bash
# Run cleanup to keep only most recent
node scripts/cleanupQuizSessions.js

# Or manually:
DELETE FROM quiz_sessions 
WHERE user_id = 'USER_ID' 
AND completed_at IS NULL 
AND id NOT IN (
  SELECT id FROM quiz_sessions 
  WHERE user_id = 'USER_ID' 
  ORDER BY created_at DESC 
  LIMIT 1
);
```

---

## 📊 Quiz Stages Reference

| Stage | Name | Questions | Focus Area |
|-------|------|-----------|------------|
| 1 | SKILLS_ASSESSMENT | 4 | Technical proficiency, programming languages, tools |
| 2 | CAREER_INTERESTS | 3 | Industry preferences, work environment, company culture |
| 3 | PERSONALITY_TRAITS | 3 | Work style, collaboration, leadership |
| 4 | LEARNING_STYLE | 2 | Knowledge acquisition, skill development |
| 5 | CAREER_GOALS | 3 | Short/long-term objectives, success metrics |

**Total Questions**: 15  
**Estimated Time**: 10-15 minutes  
**Completion Rate**: Track in database

---

## 🚀 Next Steps & Improvements

### Recommended Enhancements:

1. **Question Bank**: Pre-generate questions to reduce AI calls
2. **Progress Saving**: Auto-save every answer (currently manual)
3. **Time Limits**: Optional timed mode for assessment
4. **Question Difficulty**: Adaptive difficulty based on answers
5. **Multi-Language**: Support for multiple languages
6. **Analytics**: Track completion rates, average scores
7. **Retake Logic**: Allow users to retake after 30 days
8. **Question Feedback**: "Report question" feature

---

## 📝 Summary

The quiz system is now **production-ready** with:
- ✅ Proper JSON parsing throughout
- ✅ Comprehensive error handling
- ✅ Session resumption support
- ✅ Database cleanup utilities
- ✅ Clear logging for debugging
- ✅ Frontend null checks
- ✅ Complete documentation

**To use**: Simply restart the backend server and the quiz will work correctly!

```bash
cd c:\Users\vamsi\careerforge-ai
npm run dev
```

---

*Last Updated: October 2, 2025*  
*Maintained by: CareerForge AI Development Team*
