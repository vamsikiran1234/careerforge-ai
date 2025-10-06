const rateLimit = require('express-rate-limit');
const { createResponse } = require('../utils/helpers');

// Enhanced rate limiting with different limits for different endpoints
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: createResponse('error', 'Too many requests from this IP, please try again later.', {
      errorCode: 'RATE_LIMITED',
      retryAfter: Math.ceil(options.windowMs / 1000) || 900,
    }),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      const retryAfter = Math.ceil(options.windowMs / 1000) || 900;
      res.set('Retry-After', retryAfter);
      res.status(429).json(options.message || {
        status: 'error',
        message: 'Too many requests from this IP, please try again later.',
        errorCode: 'RATE_LIMITED',
        retryAfter
      });
    },
  };

  return rateLimit({ ...defaultOptions, ...options });
};

// Specific rate limiters for different endpoints
const rateLimiters = {
  // General API rate limiting
  general: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    keyGenerator: (req) => `general_${req.ip}`,
  }),

  // AI-powered endpoints (more restrictive)
  aiService: createRateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // 20 AI requests per 5 minutes
    keyGenerator: (req) => `ai_${req.ip}`,
    message: createResponse('error', 'Too many AI requests. AI services require more resources. Please wait and try again.', {
      errorCode: 'AI_RATE_LIMITED',
      retryAfter: 300,
    }),
  }),

  // Chat endpoints
  chat: createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // 10 chat messages per minute
    keyGenerator: (req) => `chat_${req.ip}_${req.body?.userId || 'anonymous'}`,
    message: createResponse('error', 'Too many chat messages. Please wait a moment before sending another message.', {
      errorCode: 'CHAT_RATE_LIMITED',
      retryAfter: 60,
    }),
  }),

  // Quiz endpoints
  quiz: createRateLimiter({
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 15, // 15 quiz actions per 2 minutes
    keyGenerator: (req) => `quiz_${req.ip}_${req.body?.userId || req.params?.userId || 'anonymous'}`,
    message: createResponse('error', 'Too many quiz requests. Please take your time with the quiz.', {
      errorCode: 'QUIZ_RATE_LIMITED',
      retryAfter: 120,
    }),
  }),

  // Mentor matching (moderate limits)
  mentorMatch: createRateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 30, // 30 mentor searches per 5 minutes
    keyGenerator: (req) => `mentor_${req.ip}`,
    message: createResponse('error', 'Too many mentor search requests. Please wait before searching again.', {
      errorCode: 'MENTOR_RATE_LIMITED',
      retryAfter: 300,
    }),
  }),

  // Auth endpoints (strict)
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 auth attempts per 15 minutes
    keyGenerator: (req) => `auth_${req.ip}`,
    message: createResponse('error', 'Too many authentication attempts. Please wait before trying again.', {
      errorCode: 'AUTH_RATE_LIMITED',
      retryAfter: 900,
    }),
  }),
};

// Concurrent request protection for specific operations
const activeOperations = new Map();

const preventConcurrentOperations = (operationType) => (req, res, next) => {
  const userId = req.body?.userId || req.params?.userId || req.params?.id;
  
  if (!userId) {
    return next(); // Skip if no user ID available
  }

  const operationKey = `${operationType}_${userId}`;
  
  if (activeOperations.has(operationKey)) {
    return res.status(409).json(
      createResponse('error', `A ${operationType} operation is already in progress for this user. Please wait for it to complete.`, {
        errorCode: 'OPERATION_IN_PROGRESS',
        operationType,
        userId: userId.substring(0, 8) + '...' // Partial ID for privacy
      })
    );
  }

  // Mark operation as active
  activeOperations.set(operationKey, {
    startTime: Date.now(),
    req: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    }
  });

  // Clean up on response completion
  const cleanup = () => {
    activeOperations.delete(operationKey);
  };

  res.on('finish', cleanup);
  res.on('close', cleanup);
  res.on('error', cleanup);

  // Auto-cleanup after 5 minutes (in case of hanging requests)
  setTimeout(() => {
    if (activeOperations.has(operationKey)) {
      console.warn(`Auto-cleaning up stale operation: ${operationKey}`);
      activeOperations.delete(operationKey);
    }
  }, 5 * 60 * 1000);

  next();
};

// Memory usage protection
const memoryUsageCheck = (maxMemoryMB = 512) => (req, res, next) => {
  const memUsage = process.memoryUsage();
  const memUsageMB = memUsage.rss / 1024 / 1024;

  if (memUsageMB > maxMemoryMB) {
    console.error(`High memory usage detected: ${memUsageMB.toFixed(2)}MB`);
    
    return res.status(503).json(
      createResponse('error', 'Server temporarily overloaded. Please try again later.', {
        errorCode: 'SERVER_OVERLOADED',
        retryAfter: 60
      })
    );
  }

  next();
};

// Request payload size protection (additional to express.json limit)
const payloadSizeCheck = (maxSizeKB = 100) => (req, res, next) => {
  const contentLength = parseInt(req.get('content-length') || 0);
  const maxSizeBytes = maxSizeKB * 1024;

  if (contentLength > maxSizeBytes) {
    return res.status(413).json(
      createResponse('error', `Request payload too large. Maximum size is ${maxSizeKB}KB.`, {
        errorCode: 'PAYLOAD_TOO_LARGE',
        maxSizeKB,
        receivedSizeKB: Math.round(contentLength / 1024)
      })
    );
  }

  next();
};

// Suspicious request detection
const suspiciousRequestDetection = () => {
  const suspiciousPatterns = [
    /<script[^>]*>.*?<\/script>/gi, // Script tags
    /javascript:/gi, // JavaScript protocol
    /on\w+\s*=/gi, // Event handlers
    // Removed SQL keywords as they're common in legitimate career discussions
    /\.\.\//g, // Directory traversal
    /%00/g, // Null bytes
    /<iframe[^>]*>/gi, // Iframe tags
  ];

  return (req, res, next) => {
    const requestData = JSON.stringify({
      body: req.body,
      query: req.query,
      params: req.params
    });

    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(requestData));

    if (isSuspicious) {
      console.warn('Suspicious request detected:', {
        ip: req.ip,
        url: req.originalUrl,
        method: req.method,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });

      return res.status(400).json(
        createResponse('error', 'Request contains potentially malicious content.', {
          errorCode: 'SUSPICIOUS_REQUEST'
        })
      );
    }

    next();
  };
};

// Health check for active operations
const getActiveOperationsStatus = () => {
  const now = Date.now();
  const operations = Array.from(activeOperations.entries()).map(([key, value]) => ({
    operation: key,
    duration: now - value.startTime,
    method: value.req.method,
    url: value.req.url,
    ip: value.req.ip.substring(0, 8) + '...' // Masked IP for privacy
  }));

  return {
    activeCount: activeOperations.size,
    operations: operations.length > 0 ? operations : undefined,
    memoryUsage: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    }
  };
};

module.exports = {
  rateLimiters,
  preventConcurrentOperations,
  memoryUsageCheck,
  payloadSizeCheck,
  suspiciousRequestDetection,
  getActiveOperationsStatus,
};
