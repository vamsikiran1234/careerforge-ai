const Groq = require('groq-sdk');

// Constants
const RATE_LIMIT_WINDOW_MS = 900000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100; // Maximum requests per window

// Create Groq client (Free and Fast AI API)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const config = {
  groq,
  // Keep legacy reference for backward compatibility, but use Groq
  openai: groq,
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  app: {
    name: 'CareerForge AI',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || RATE_LIMIT_WINDOW_MS,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || RATE_LIMIT_MAX_REQUESTS,
  },
};

module.exports = config;
