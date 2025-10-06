# 🏗️ Phase 5 Architecture Overview

## Rating & Feedback System Architecture

---

## 📊 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │  MentorsPage     │  │ MentorProfile    │  │ MySessionsPage│ │
│  │                  │  │                  │  │               │ │
│  │  • Search Bar    │  │  • Mentor Info   │  │ • Sessions    │ │
│  │  • Rating Filter │  │  • ReviewList ━━━┼━━▶ • Rate Button│ │
│  │  • Mentor Cards  │  │  • Dist. Chart   │  │               │ │
│  └────────┬─────────┘  └────────┬─────────┘  └───────┬───────┘ │
│           │                     │                     │         │
│           │                     │                     │         │
│           │     ┌───────────────┴───────┬─────────────┘         │
│           │     │                       │                       │
│           │     │                       │                       │
│  ┌────────▼─────▼────┐      ┌──────────▼──────────┐           │
│  │   MentorCard      │      │   RatingModal       │           │
│  │                   │      │                     │           │
│  │  • Avatar         │      │  • Star Selection   │           │
│  │  • Rating Display │      │  • Detailed Ratings │           │
│  │  • Stats          │      │  • Comment Field    │           │
│  └───────────────────┘      │  • Submit Button    │           │
│                             └─────────────────────┘           │
│                                                                   │
└─────────────────────────────┬─────────────────────────────────┘
                              │
                              │ HTTP Requests
                              │ (axios)
                              │
┌─────────────────────────────▼─────────────────────────────────┐
│                        BACKEND LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Review Routes                          │   │
│  │                   (reviewRoutes.js)                       │   │
│  │                                                            │   │
│  │  POST   /api/v1/reviews              Create review        │   │
│  │  GET    /api/v1/reviews/mentor/:id   Get reviews         │   │
│  │  PUT    /api/v1/reviews/:id          Update review       │   │
│  │  DELETE /api/v1/reviews/:id          Delete review       │   │
│  │  POST   /api/v1/reviews/:id/respond  Respond to review   │   │
│  │  GET    /api/v1/reviews/my-reviews   My reviews          │   │
│  │  GET    /api/v1/reviews/received     Received reviews    │   │
│  └────────────────────────┬─────────────────────────────────┘   │
│                           │                                      │
│                           │ Calls controller functions           │
│                           │                                      │
│  ┌────────────────────────▼─────────────────────────────────┐   │
│  │              Review Controller                            │   │
│  │            (reviewController.js)                          │   │
│  │                                                            │   │
│  │  • createReview()             Validate & create review    │   │
│  │  • getMentorReviews()         Fetch with statistics      │   │
│  │  • updateReview()             Update & recalculate avg   │   │
│  │  • deleteReview()             Delete & recalculate avg   │   │
│  │  • mentorRespondToReview()    Add mentor response        │   │
│  │  • getMyReviews()             Get student's reviews      │   │
│  │  • getReceivedReviews()       Get mentor's reviews       │   │
│  │  • updateMentorAverageRating() Helper function           │   │
│  └────────────────────────┬─────────────────────────────────┘   │
│                           │                                      │
│                           │ Database queries                     │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                      DATABASE LAYER                           │
├───────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                 MentorReview Model                       │  │
│  │                  (Prisma Schema)                         │  │
│  │                                                           │  │
│  │  • id                    String (cuid)                   │  │
│  │  • mentorId              String (FK)                     │  │
│  │  • studentId             String (FK)                     │  │
│  │  • sessionId             String (FK, unique)             │  │
│  │  • overallRating         Int (1-5) [required]            │  │
│  │  • communicationRating   Int? (1-5) [optional]           │  │
│  │  • knowledgeRating       Int? (1-5) [optional]           │  │
│  │  • helpfulnessRating     Int? (1-5) [optional]           │  │
│  │  • comment               String? [optional]              │  │
│  │  • mentorResponse        String? [optional]              │  │
│  │  • isPublic              Boolean [default: true]         │  │
│  │  • createdAt             DateTime                        │  │
│  │  • updatedAt             DateTime                        │  │
│  │  • respondedAt           DateTime? [optional]            │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              MentorProfile Model                         │  │
│  │              (Related fields)                            │  │
│  │                                                           │  │
│  │  • averageRating         Float? [auto-calculated]        │  │
│  │  • totalSessions         Int                             │  │
│  │  • receivedReviews       MentorReview[] [relation]       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### Create Review Flow

```
Student                RatingModal           API                Controller           Database
  │                        │                  │                     │                    │
  │  Click "Rate Session"  │                  │                     │                    │
  ├───────────────────────▶│                  │                     │                    │
  │                        │                  │                     │                    │
  │  Fill rating form      │                  │                     │                    │
  │  (stars, comment)      │                  │                     │                    │
  │                        │                  │                     │                    │
  │  Click "Submit"        │                  │                     │                    │
  ├───────────────────────▶│                  │                     │                    │
  │                        │                  │                     │                    │
  │                        │  POST /reviews   │                     │                    │
  │                        ├─────────────────▶│                     │                    │
  │                        │                  │                     │                    │
  │                        │                  │  createReview()     │                    │
  │                        │                  ├────────────────────▶│                    │
  │                        │                  │                     │                    │
  │                        │                  │                     │  Validate session  │
  │                        │                  │                     │  Check duplicate   │
  │                        │                  │                     ├───────────────────▶│
  │                        │                  │                     │                    │
  │                        │                  │                     │  Create review     │
  │                        │                  │                     ├───────────────────▶│
  │                        │                  │                     │                    │
  │                        │                  │                     │  Calculate average │
  │                        │                  │                     │  Update mentor     │
  │                        │                  │                     ├───────────────────▶│
  │                        │                  │                     │                    │
  │                        │                  │    Success response │                    │
  │                        │  ◀─────────────────────────────────────┤                    │
  │                        │                  │                     │                    │
  │  Success message       │                  │                     │                    │
  │◀───────────────────────┤                  │                     │                    │
  │                        │                  │                     │                    │
  │  Modal closes          │                  │                     │                    │
  │  Sessions refresh      │                  │                     │                    │
```

### View Reviews Flow

```
User                 MentorProfile        ReviewList           API                Controller           Database
  │                        │                  │                  │                     │                    │
  │  Click mentor card     │                  │                  │                     │                    │
  ├───────────────────────▶│                  │                  │                     │                    │
  │                        │                  │                  │                     │                    │
  │  Profile modal opens   │                  │                  │                     │                    │
  │                        │                  │                  │                     │                    │
  │                        │  Load ReviewList │                  │                     │                    │
  │                        ├─────────────────▶│                  │                     │                    │
  │                        │                  │                  │                     │                    │
  │                        │                  │  GET /reviews/   │                     │                    │
  │                        │                  │  mentor/:id      │                     │                    │
  │                        │                  ├─────────────────▶│                     │                    │
  │                        │                  │                  │                     │                    │
  │                        │                  │                  │  getMentorReviews() │                    │
  │                        │                  │                  ├────────────────────▶│                    │
  │                        │                  │                  │                     │                    │
  │                        │                  │                  │                     │  Fetch reviews     │
  │                        │                  │                  │                     │  Calculate stats   │
  │                        │                  │                  │                     ├───────────────────▶│
  │                        │                  │                  │                     │                    │
  │                        │                  │                  │    Reviews + stats  │                    │
  │                        │                  │  ◀───────────────────────────────────────────────────────────┤
  │                        │                  │                  │                     │                    │
  │                        │  Display reviews │                  │                     │                    │
  │  View reviews          │  + distribution  │                  │                     │                    │
  │◀───────────────────────┼─────────────────┤                  │                     │                    │
  │                        │                  │                  │                     │                    │
```

### Filter by Rating Flow

```
User                 MentorsPage          Frontend State       Backend              Database
  │                        │                     │                │                     │
  │  Select "4+ stars"     │                     │                │                     │
  │  from dropdown         │                     │                │                     │
  ├───────────────────────▶│                     │                │                     │
  │                        │                     │                │                     │
  │                        │  setMinRating(4)    │                │                     │
  │                        ├────────────────────▶│                │                     │
  │                        │                     │                │                     │
  │                        │  Filter mentors     │                │                     │
  │                        │  where              │                │                     │
  │                        │  averageRating >= 4 │                │                     │
  │                        │◀────────────────────┤                │                     │
  │                        │                     │                │                     │
  │  View filtered list    │                     │                │                     │
  │◀───────────────────────┤                     │                │                     │
  │                        │                     │                │                     │
  │  (Client-side filter,  │                     │                │                     │
  │   no API call needed)  │                     │                │                     │
```

---

## 🗂️ Component Hierarchy

```
App
│
├── MentorsPage
│   ├── Search Input
│   ├── Rating Filter Dropdown ★
│   ├── Filter Toggle Button
│   └── Mentor Grid
│       └── MentorCard (multiple)
│           ├── Avatar
│           ├── Name & Title
│           ├── Rating Display ★
│           └── Stats
│
├── MentorProfile (Modal)
│   ├── Header
│   ├── Stats Cards (includes rating) ★
│   ├── Bio Section
│   ├── Expertise Tags
│   ├── Education Info
│   ├── Links
│   ├── Availability Info
│   ├── ReviewList Component ★
│   │   ├── Rating Summary Card
│   │   ├── Distribution Chart
│   │   └── Review Cards (multiple)
│   │       ├── Student Info
│   │       ├── Stars & Date
│   │       ├── Detailed Ratings
│   │       ├── Comment
│   │       └── Mentor Response
│   └── Action Buttons
│
└── MySessionsPage
    └── Session List
        └── Session Card (multiple)
            ├── Session Info
            ├── Status Badge
            ├── Join Meeting Button
            └── Rate Session Button ★
                └── (Opens RatingModal)

RatingModal (Overlay)
├── Modal Header
├── Session Info Display
├── Overall Rating Selector ★
├── Detailed Ratings (optional) ★
├── Comment Textarea
├── Public/Private Toggle
├── Character Counter
└── Submit Button
```

**★ = New/Modified in Phase 5**

---

## 📊 Database Relationships

```
┌─────────────────┐
│      User       │
│                 │
│ • id (PK)       │
│ • name          │
│ • email         │
│ • role          │
└────┬────────────┘
     │
     │ 1:1 (if role = MENTOR)
     │
┌────▼────────────────────────┐
│     MentorProfile           │
│                             │
│ • id (PK)                   │
│ • userId (FK → User)        │
│ • averageRating (Float) ★   │
│ • totalSessions (Int)       │
│ • bio, expertise, etc.      │
└────┬────────────────────────┘
     │
     │ 1:N
     │
┌────▼────────────────────────┐        ┌────────────────────┐
│     MentorReview ★          │        │  MentorshipSession │
│                             │        │                    │
│ • id (PK)                   │◀───────│ • id (PK)          │
│ • mentorId (FK → Mentor)    │   1:1  │ • mentorId (FK)    │
│ • studentId (FK → User)     │        │ • studentId (FK)   │
│ • sessionId (FK → Session)  │        │ • status           │
│ • overallRating (1-5) ★     │        │ • startTime        │
│ • communicationRating ★     │        └────────────────────┘
│ • knowledgeRating ★         │
│ • helpfulnessRating ★       │
│ • comment                   │
│ • mentorResponse            │
│ • isPublic                  │
│ • createdAt                 │
│ • respondedAt               │
└─────────────────────────────┘

★ = Key Phase 5 fields
```

---

## 🔒 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Security Layers                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Layer 1: Authentication                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  • JWT token required for all endpoints              │   │
│  │  • Token validated on every request                  │   │
│  │  • User identity extracted from token                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Layer 2: Authorization                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  • Session participant check (create review)         │   │
│  │  • Author-only edits (update/delete review)          │   │
│  │  • Mentor-only responses (respond to review)         │   │
│  │  • Role-based access control                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Layer 3: Validation                                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  • Session must exist and be completed               │   │
│  │  • Duplicate review prevention                       │   │
│  │  • Rating bounds (1-5 stars)                         │   │
│  │  • Character limits (comment, response)              │   │
│  │  • Data type validation                              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Layer 4: Input Sanitization                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  • XSS prevention (escape HTML)                      │   │
│  │  • SQL injection protection (Prisma ORM)             │   │
│  │  • Input trimming and normalization                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 Rating Calculation Flow

```
┌──────────────────────────────────────────────────────────────┐
│           Average Rating Calculation Algorithm               │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Trigger Events:                                               │
│  • Review created                                              │
│  • Review updated (rating changed)                             │
│  • Review deleted                                              │
│  • Review visibility changed (public ↔ private)                │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Step 1: Fetch all PUBLIC reviews for mentor          │  │
│  └────────────────────┬───────────────────────────────────┘  │
│                       │                                        │
│                       ▼                                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Step 2: Extract overallRating from each review       │  │
│  │          ratings = [5, 4, 5, 3, 5, 4, 5]              │  │
│  └────────────────────┬───────────────────────────────────┘  │
│                       │                                        │
│                       ▼                                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Step 3: Calculate sum and count                      │  │
│  │          sum = 31, count = 7                           │  │
│  └────────────────────┬───────────────────────────────────┘  │
│                       │                                        │
│                       ▼                                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Step 4: Calculate average                            │  │
│  │          average = sum / count                         │  │
│  │          average = 31 / 7 = 4.43                       │  │
│  └────────────────────┬───────────────────────────────────┘  │
│                       │                                        │
│                       ▼                                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Step 5: Update MentorProfile.averageRating           │  │
│  │          mentor.averageRating = 4.43                   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  Note: Only PUBLIC reviews are included in calculation         │
│        Private reviews are excluded                            │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 Component State Management

### RatingModal State

```typescript
const [overallRating, setOverallRating] = useState(0);
const [communicationRating, setCommunicationRating] = useState(0);
const [knowledgeRating, setKnowledgeRating] = useState(0);
const [helpfulnessRating, setHelpfulnessRating] = useState(0);
const [comment, setComment] = useState('');
const [isPublic, setIsPublic] = useState(true);
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState('');
const [hoveredStar, setHoveredStar] = useState(0);
```

### ReviewList State

```typescript
const [reviews, setReviews] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [statistics, setStatistics] = useState({
  averageRating: 0,
  totalReviews: 0,
  distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
});
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(false);
```

### MentorsPage State

```typescript
const [searchQuery, setSearchQuery] = useState('');
const [minRating, setMinRating] = useState(0);
const [showFilters, setShowFilters] = useState(false);
const [showProfile, setShowProfile] = useState(false);
```

---

## 🔄 API Response Structures

### Create Review Response
```json
{
  "success": true,
  "review": {
    "id": "clx123abc",
    "mentorId": "mentor_456",
    "studentId": "student_789",
    "sessionId": "session_123",
    "overallRating": 5,
    "communicationRating": 5,
    "knowledgeRating": 4,
    "helpfulnessRating": 5,
    "comment": "Excellent mentor!",
    "isPublic": true,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

### Get Mentor Reviews Response
```json
{
  "success": true,
  "reviews": [
    {
      "id": "review_1",
      "overallRating": 5,
      "comment": "Great mentor!",
      "createdAt": "2025-01-15T10:30:00Z",
      "student": {
        "name": "Anonymous Student"
      },
      "mentorResponse": "Thank you!",
      "respondedAt": "2025-01-16T12:00:00Z"
    }
  ],
  "statistics": {
    "averageRating": 4.5,
    "totalReviews": 25,
    "distribution": {
      "5": 15,
      "4": 8,
      "3": 2,
      "2": 0,
      "1": 0
    }
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

## 🎨 Color Scheme

```css
/* Rating Colors */
--rating-yellow: #FCD34D       /* Star fill color */
--rating-yellow-dark: #F59E0B  /* Hover state */
--rating-gray: #D1D5DB         /* Inactive stars */

/* Mentor Response */
--response-bg: #DBEAFE         /* Light blue background */
--response-border: #3B82F6     /* Blue border */
--response-bg-dark: #1E3A8A    /* Dark mode background */

/* Rating Distribution */
--dist-bar-5: #10B981          /* 5-star bar - green */
--dist-bar-4: #3B82F6          /* 4-star bar - blue */
--dist-bar-3: #F59E0B          /* 3-star bar - amber */
--dist-bar-2: #EF4444          /* 2-star bar - red */
--dist-bar-1: #DC2626          /* 1-star bar - dark red */
```

---

## 📦 Dependencies Used

### Backend
- express - Web framework
- prisma - ORM for database
- jsonwebtoken - Authentication
- express-validator - Input validation

### Frontend
- react - UI framework
- axios - HTTP client
- lucide-react - Icons (Star, etc.)
- date-fns - Date formatting
- tailwindcss - Styling

---

**Phase 5 Architecture Documentation Complete** ✅

*This architecture supports a scalable, secure, and user-friendly rating system*
