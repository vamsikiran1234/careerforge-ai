const OpenAI = require('openai');

// Create OpenAI client with organization and project configuration
const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY,
};

// Add organization ID if provided
if (process.env.OPENAI_ORGANIZATION_ID) {
  openaiConfig.organization = process.env.OPENAI_ORGANIZATION_ID;
}

// Add project ID if provided
if (process.env.OPENAI_PROJECT_ID) {
  openaiConfig.project = process.env.OPENAI_PROJECT_ID;
}

const openai = new OpenAI(openaiConfig);

const config = {
  openai,
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
