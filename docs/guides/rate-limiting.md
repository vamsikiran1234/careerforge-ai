# Rate Limiting Guide

## Overview

CareerForge AI implements comprehensive rate limiting to ensure fair usage, prevent abuse, and maintain optimal performance for all users. Our multi-tier approach provides different limits based on endpoint types and user subscription levels.

## Rate Limiting Strategy

### Multi-Tier Approach

We use different rate limits for different types of operations:

1. **General API Operations** - Standard CRUD operations
2. **AI-Powered Services** - Computationally expensive AI operations
3. **Real-time Interactions** - Chat and interactive features
4. **Search Operations** - Search and discovery features
5. **Authentication** - Security-sensitive operations

### Rate Limit Tiers

| Endpoint Category | Free Tier | Pro Tier | Enterprise |
|------------------|-----------|----------|------------|
| **General API** | 100/15min | 500/15min | 2000/15min |
| **AI Services** | 20/5min | 100/5min | 500/5min |
| **Chat Messages** | 10/min | 30/min | 100/min |
| **Quiz Actions** | 15/2min | 50/2min | 200/2min |
| **Mentor Search** | 30/5min | 100/5min | 500/5min |
| **Authentication** | 5/15min | 10/15min | 20/15min |

## Rate Limit Headers

Every API response includes rate limit information in the headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1642781400
X-RateLimit-Window: 900
```

### Header Descriptions

- **`X-RateLimit-Limit`**: Maximum requests allowed in the current window
- **`X-RateLimit-Remaining`**: Number of requests remaining in current window
- **`X-RateLimit-Reset`**: Unix timestamp when the rate limit resets
- **`X-RateLimit-Window`**: Rate limit window duration in seconds

## Rate Limit Exceeded Response

When rate limits are exceeded, you'll receive a `429 Too Many Requests` response:

```json
{
  "status": "error",
  "message": "Too many requests from this IP, please try again later",
  "data": {
    "errorCode": "RATE_LIMITED",
    "retryAfter": 900,
    "details": {
      "limit": 100,
      "window": "15 minutes",
      "endpoint": "/api/v1/chat"
    },
    "suggestions": [
      "Wait 15 minutes before making more requests",
      "Consider upgrading to a higher rate limit plan",
      "Implement exponential backoff in your application"
    ]
  }
}
```

### Response Headers
```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1642781400
Retry-After: 900
Content-Type: application/json
```

## Endpoint-Specific Limits

### Chat Endpoints

**Rate Limit:** 10 messages per minute per user

```bash
# Example: Chat rate limiting
curl -X POST "https://api.careerforge.ai/api/v1/chat" \
  -H "X-API-Key: your_key" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "message": "Career advice?"}'
```

**Headers in Response:**
```http
X-RateLimit-Chat-Limit: 10
X-RateLimit-Chat-Remaining: 9
X-RateLimit-Chat-Reset: 1642781460
```

### AI Service Endpoints

**Rate Limit:** 20 requests per 5 minutes

Affects:
- `/api/v1/chat` (AI responses)
- `/api/v1/quiz/start` (AI question generation)
- `/api/v1/quiz/{id}/answer` (AI-driven progression)
- `/api/v1/mentors/match` (AI matching algorithm)

### Quiz System

**Rate Limit:** 15 actions per 2 minutes per user

Actions include:
- Starting a new quiz
- Submitting answers
- Getting quiz progress

### Mentor Search

**Rate Limit:** 30 searches per 5 minutes

Applies to:
- `/api/v1/mentors` (search)
- `/api/v1/mentors/match` (AI matching)

### Authentication

**Rate Limit:** 5 attempts per 15 minutes per IP

Protects:
- Login attempts
- Password resets
- Token refresh requests

## Best Practices

### 1. Monitor Rate Limit Headers

Always check rate limit headers in your responses:

```javascript
const response = await fetch('/api/v1/chat', {
  method: 'POST',
  headers: { 'X-API-Key': apiKey },
  body: JSON.stringify(data)
});

const remaining = parseInt(response.headers.get('X-RateLimit-Remaining'));
const reset = parseInt(response.headers.get('X-RateLimit-Reset'));

if (remaining < 5) {
  console.warn('Approaching rate limit. Consider throttling requests.');
}
```

### 2. Implement Exponential Backoff

```javascript
async function makeRequestWithBackoff(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After')) || 60;
        const backoffTime = Math.min(retryAfter * 1000 * Math.pow(2, i), 30000);
        
        console.log(`Rate limited. Retrying in ${backoffTime}ms`);
        await delay(backoffTime);
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

### 3. Batch Operations When Possible

Instead of making multiple individual requests:

```javascript
// ❌ Multiple individual requests
for (const userId of userIds) {
  await client.chat.getSessions(userId);
}

// ✅ Batch request (when available)
const allSessions = await client.chat.getBatchSessions(userIds);
```

### 4. Use Caching Strategically

Cache responses to reduce API calls:

```javascript
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedMentor(mentorId) {
  const cacheKey = `mentor_${mentorId}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const mentor = await client.mentors.getById(mentorId);
  cache.set(cacheKey, { data: mentor, timestamp: Date.now() });
  
  return mentor;
}
```

### 5. Implement Request Queuing

For high-traffic applications:

```javascript
class RateLimitedQueue {
  constructor(maxConcurrent = 5, minInterval = 200) {
    this.queue = [];
    this.running = 0;
    this.maxConcurrent = maxConcurrent;
    this.minInterval = minInterval;
    this.lastRequest = 0;
  }
  
  async add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.process();
    });
  }
  
  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }
    
    const { requestFn, resolve, reject } = this.queue.shift();
    this.running++;
    
    // Ensure minimum interval between requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    if (timeSinceLastRequest < this.minInterval) {
      await delay(this.minInterval - timeSinceLastRequest);
    }
    
    try {
      this.lastRequest = Date.now();
      const result = await requestFn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process(); // Process next item in queue
    }
  }
}
```

## Rate Limit Optimization

### 1. Choose the Right Endpoint

Some operations can be achieved with different endpoints that have different rate limits:

```javascript
// ❌ High rate limit endpoint for simple data
const mentor = await client.mentors.getWithAIInsights(mentorId); // AI service limit

// ✅ Lower rate limit endpoint for basic data
const mentor = await client.mentors.getById(mentorId); // General API limit
```

### 2. Optimize AI Service Usage

AI service endpoints have the most restrictive limits. Use them efficiently:

```javascript
// ❌ Separate AI calls for each question
const question1 = await client.quiz.getNextQuestion(quizId);
const question2 = await client.quiz.getNextQuestion(quizId);

// ✅ Batch questions when possible
const questions = await client.quiz.getNextQuestions(quizId, count: 3);
```

### 3. Use Webhooks for Real-time Updates

Instead of polling for updates:

```javascript
// ❌ Polling for quiz completion
setInterval(async () => {
  const quiz = await client.quiz.getSession(quizId);
  if (quiz.isComplete) {
    handleQuizComplete(quiz);
  }
}, 5000);

// ✅ Webhook for completion notification
app.post('/webhooks/quiz-complete', (req, res) => {
  const { quizId, results } = req.body;
  handleQuizComplete(results);
  res.status(200).send('OK');
});
```

## Monitoring and Alerts

### Set Up Rate Limit Monitoring

```javascript
class RateLimitMonitor {
  constructor(threshold = 0.8) {
    this.threshold = threshold; // Alert when 80% of limit used
    this.metrics = new Map();
  }
  
  trackResponse(response) {
    const limit = parseInt(response.headers.get('X-RateLimit-Limit'));
    const remaining = parseInt(response.headers.get('X-RateLimit-Remaining'));
    const reset = parseInt(response.headers.get('X-RateLimit-Reset'));
    
    const usageRatio = (limit - remaining) / limit;
    
    if (usageRatio > this.threshold) {
      this.alertHighUsage(limit, remaining, reset);
    }
    
    this.metrics.set('lastCheck', {
      limit, remaining, reset, usageRatio, timestamp: Date.now()
    });
  }
  
  alertHighUsage(limit, remaining, reset) {
    const resetTime = new Date(reset * 1000);
    console.warn(`High rate limit usage: ${remaining}/${limit} remaining. Resets at ${resetTime}`);
    
    // Send alert to monitoring system
    this.sendAlert({
      type: 'RATE_LIMIT_WARNING',
      remaining,
      limit,
      resetTime
    });
  }
}
```

## Enterprise Rate Limits

For high-volume applications, consider our Enterprise tier:

### Features
- **Higher Limits**: Up to 10x higher rate limits
- **Burst Capacity**: Handle traffic spikes
- **Custom Limits**: Tailored to your use case
- **Priority Support**: Dedicated rate limit assistance
- **Analytics**: Detailed usage analytics and optimization recommendations

### Contact Sales
- **Email**: enterprise@careerforge.ai
- **Phone**: +1 (555) 123-4567
- **Schedule Demo**: [calendly.com/careerforge-enterprise](https://calendly.com/careerforge-enterprise)

---

## Support

If you're experiencing rate limiting issues:

1. **Check your current tier** in the dashboard
2. **Review usage patterns** for optimization opportunities
3. **Consider upgrading** to a higher tier
4. **Contact support** for custom solutions

**Support Channels:**
- 📧 Email: support@careerforge.ai
- 💬 Discord: [CareerForge Community](https://discord.gg/careerforge)
- 📞 Phone: +1 (555) 123-4567
