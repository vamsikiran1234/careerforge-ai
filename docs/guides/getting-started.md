# Getting Started with CareerForge AI API

## Welcome to CareerForge AI! 🚀

This guide will help you get started with the CareerForge AI API in just a few minutes. Our API provides powerful AI-driven career guidance, skill assessments, and mentor matching capabilities.

## Quick Start

### 1. Get Your API Key

```bash
# Register for an account at https://careerforge.ai/signup
# Get your API key from the dashboard at https://careerforge.ai/dashboard/api-keys
```

### 2. Make Your First API Call

```bash
curl -X GET "https://api.careerforge.ai/api/v1/health" \
  -H "X-API-Key: your_api_key_here"
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "API is healthy",
  "data": {
    "version": "1.0.0",
    "timestamp": "2025-07-21T05:30:00Z"
  }
}
```

### 3. Start a Career Chat Session

```bash
curl -X POST "https://api.careerforge.ai/api/v1/chat" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{
    "userId": "your_user_id",
    "message": "I want to become a software engineer. What skills should I focus on?"
  }'
```

## Base URL and Endpoints

- **Production:** `https://api.careerforge.ai/api/v1`
- **Staging:** `https://staging-api.careerforge.ai/api/v1`
- **Development:** `http://localhost:5000/api/v1`

## Core Features

### 🤖 AI-Powered Career Chat
Get personalized career guidance using our advanced AI system:
- Career path recommendations
- Skill development advice
- Industry insights
- Interview preparation

### 📝 Adaptive Quiz System
Take dynamic career assessments that adapt to your responses:
- Multi-stage evaluation (interests, skills, values, goals, preferences)
- AI-generated questions based on your answers
- Personalized career recommendations
- Skill gap analysis

### 👨‍🏫 Mentor Matching
Find the perfect mentor for your career journey:
- AI-powered compatibility scoring
- Filter by domain, skills, and experience
- Read mentor profiles and reviews
- Direct booking capabilities

## Authentication

CareerForge AI supports multiple authentication methods:

### API Key (Recommended)
```bash
curl -H "X-API-Key: your_api_key_here" \
  "https://api.careerforge.ai/api/v1/endpoint"
```

### Bearer Token (JWT)
```bash
curl -H "Authorization: Bearer your_jwt_token" \
  "https://api.careerforge.ai/api/v1/endpoint"
```

## Rate Limits

Our API implements intelligent rate limiting to ensure fair usage:

| Endpoint Type | Limit | Window |
|---------------|--------|---------|
| General API | 100 requests | 15 minutes |
| AI Services | 20 requests | 5 minutes |
| Chat Messages | 10 messages | 1 minute |
| Quiz Actions | 15 actions | 2 minutes |
| Mentor Search | 30 searches | 5 minutes |
| Authentication | 5 attempts | 15 minutes |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1642781400
```

## Error Handling

All API responses follow a consistent format:

### Success Response
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": { /* response data */ },
  "timestamp": "2025-07-21T05:30:00Z"
}
```

### Error Response
```json
{
  "status": "error",
  "message": "User-friendly error message",
  "data": {
    "errorCode": "SPECIFIC_ERROR_CODE",
    "details": { /* error details */ },
    "suggestions": ["suggestion1", "suggestion2"]
  }
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Invalid input data | 400 |
| `UNAUTHORIZED` | Missing or invalid authentication | 401 |
| `RATE_LIMITED` | Rate limit exceeded | 429 |
| `USER_NOT_FOUND` | User does not exist | 404 |
| `AI_SERVICE_ERROR` | AI service unavailable | 500 |
| `DATABASE_ERROR` | Database connection issue | 500 |

## SDK Examples

### JavaScript/Node.js
```javascript
const CareerForgeAPI = require('@careerforge/api-client');

const client = new CareerForgeAPI({
  apiKey: 'your_api_key_here',
  environment: 'production' // or 'staging', 'development'
});

// Start a chat session
const response = await client.chat.send({
  userId: 'user_12345',
  message: 'What skills do I need for data science?'
});

console.log(response.data.reply);
```

### Python
```python
from careerforge import CareerForgeClient

client = CareerForgeClient(api_key='your_api_key_here')

# Start a quiz session
quiz = client.quiz.start(user_id='user_12345', domain='TECHNOLOGY')
print(f"Quiz ID: {quiz.id}")
print(f"First Question: {quiz.current_question.text}")

# Submit an answer
next_question = client.quiz.answer(
    quiz_id=quiz.id,
    answer="I enjoy solving complex problems"
)
```

### cURL Examples
```bash
# Get user's chat sessions
curl -X GET "https://api.careerforge.ai/api/v1/chat/sessions/user_12345" \
  -H "X-API-Key: your_api_key_here"

# Search for mentors
curl -X GET "https://api.careerforge.ai/api/v1/mentors?domain=TECHNOLOGY&skills=Python,React" \
  -H "X-API-Key: your_api_key_here"

# Get mentor match recommendations
curl -X POST "https://api.careerforge.ai/api/v1/mentors/match" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{
    "userId": "user_12345",
    "careerGoals": "Transition to machine learning engineering",
    "domain": "TECHNOLOGY",
    "skills": ["Python", "JavaScript"],
    "experienceLevel": "intermediate"
  }'
```

## Best Practices

### 1. Handle Rate Limits Gracefully
```javascript
async function makeAPICall() {
  try {
    const response = await client.chat.send(message);
    return response;
  } catch (error) {
    if (error.code === 'RATE_LIMITED') {
      const retryAfter = error.retryAfter;
      console.log(`Rate limited. Retry after ${retryAfter} seconds`);
      // Implement exponential backoff
      await delay(retryAfter * 1000);
      return makeAPICall();
    }
    throw error;
  }
}
```

### 2. Implement Proper Error Handling
```javascript
const handleAPIError = (error) => {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      // Show field-specific validation errors
      error.data.errors.forEach(err => {
        console.log(`${err.field}: ${err.message}`);
      });
      break;
    case 'AI_SERVICE_ERROR':
      // Show user-friendly message and suggest retry
      console.log('AI service is temporarily unavailable. Please try again.');
      break;
    default:
      console.log('An unexpected error occurred.');
  }
};
```

### 3. Cache Responses When Appropriate
```javascript
const cache = new Map();

async function getMentorProfile(mentorId) {
  const cacheKey = `mentor_${mentorId}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const mentor = await client.mentors.getById(mentorId);
  cache.set(cacheKey, mentor);
  
  // Cache for 5 minutes
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000);
  
  return mentor;
}
```

## Next Steps

- 📖 **Explore the [API Reference](./api-reference.md)** for detailed endpoint documentation
- 🔒 **Learn about [Authentication](./authentication.md)** methods and security
- ⚡ **Understand [Rate Limiting](./rate-limiting.md)** policies and optimization
- 🚨 **Read [Error Handling](./errors.md)** best practices
- 🔧 **Try our [Interactive API Explorer](https://api.careerforge.ai/docs)**

## Support

Need help? We're here for you:

- 📧 **Email:** support@careerforge.ai
- 💬 **Discord:** [CareerForge Community](https://discord.gg/careerforge)
- 📚 **Documentation:** [docs.careerforge.ai](https://docs.careerforge.ai)
- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/careerforge/api/issues)

---

Happy coding! 🚀
