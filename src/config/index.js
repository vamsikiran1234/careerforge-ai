const Groq = require('groq-sdk');

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
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
};

module.exports = config;
