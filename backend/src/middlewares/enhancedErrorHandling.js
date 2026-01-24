const { createResponse } = require('../utils/helpers');

// Enhanced 404 handler with detailed logging
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.method} ${req.originalUrl}`);
  error.status = 404;
  
  // Log the attempted route for monitoring
  console.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  res.status(404);
  next(error);
};

// Enhanced error handler with comprehensive error categorization
const errorHandler = (err, req, res) => {
  let statusCode = err.status || res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal server error';
  let errorCode = 'INTERNAL_ERROR';
  const details = {};

  // Database/Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2000':
        statusCode = 400;
        message = 'Input data is too long for the field';
        errorCode = 'INPUT_TOO_LONG';
        break;
      case 'P2001':
        statusCode = 404;
        message = 'Record not found';
        errorCode = 'RECORD_NOT_FOUND';
        break;
      case 'P2002':
        statusCode = 409;
        message = 'Unique constraint violation';
        errorCode = 'DUPLICATE_ENTRY';
        details.field = err.meta?.target;
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Foreign key constraint violation';
        errorCode = 'FOREIGN_KEY_ERROR';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Record not found';
        errorCode = 'RECORD_NOT_FOUND';
        break;
      case 'P1001':
        statusCode = 503;
        message = 'Database connection failed';
        errorCode = 'DATABASE_CONNECTION_ERROR';
        break;
      case 'P1008':
        statusCode = 408;
        message = 'Database operation timed out';
        errorCode = 'DATABASE_TIMEOUT';
        break;
      default:
        statusCode = 500;
        message = 'Database error occurred';
        errorCode = 'DATABASE_ERROR';
    }
  }

  // Groq AI service errors
  if (err.name === 'APIError' || err.type === 'invalid_request_error') {
    switch (err.code) {
      case 'insufficient_quota':
        statusCode = 503;
        message = 'AI service quota exceeded. Please try again later.';
        errorCode = 'AI_QUOTA_EXCEEDED';
        break;
      case 'model_not_found':
        statusCode = 503;
        message = 'AI model temporarily unavailable. Please try again later.';
        errorCode = 'AI_MODEL_UNAVAILABLE';
        break;
      case 'invalid_api_key':
        statusCode = 500;
        message = 'AI service configuration error. Please contact support.';
        errorCode = 'AI_CONFIG_ERROR';
        break;
      case 'rate_limit_exceeded':
        statusCode = 429;
        message = 'Too many AI requests. Please wait a moment and try again.';
        errorCode = 'AI_RATE_LIMITED';
        break;
      case 'context_length_exceeded':
        statusCode = 400;
        message = 'Input too long for AI processing. Please shorten your message.';
        errorCode = 'INPUT_TOO_LONG';
        break;
      default:
        statusCode = 503;
        message = 'AI service temporarily unavailable. Please try again later.';
        errorCode = 'AI_SERVICE_ERROR';
    }
  }

  // Network/timeout errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    statusCode = 503;
    message = 'External service unavailable. Please try again later.';
    errorCode = 'SERVICE_UNAVAILABLE';
  }

  if (err.code === 'ETIMEDOUT' || err.message.includes('timeout')) {
    statusCode = 408;
    message = 'Request timed out. Please try again.';
    errorCode = 'REQUEST_TIMEOUT';
  }

  // JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON format in request body';
    errorCode = 'INVALID_JSON';
  }

  // Validation errors from Joi
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    details.validationErrors = err.details;
  }

  // Memory/resource errors
  if (err.code === 'EMFILE' || err.code === 'ENOMEM') {
    statusCode = 503;
    message = 'Server temporarily overloaded. Please try again later.';
    errorCode = 'SERVER_OVERLOADED';
  }

  // Security-related errors
  if (err.message.includes('Forbidden') || err.status === 403) {
    statusCode = 403;
    message = 'Access denied';
    errorCode = 'ACCESS_DENIED';
  }

  // Rate limiting errors
  if (err.message.includes('Too many requests')) {
    statusCode = 429;
    errorCode = 'RATE_LIMITED';
    details.retryAfter = 60; // seconds
  }

  // Log the error for monitoring
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  console[logLevel](`${statusCode} ${errorCode}: ${message}`, {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    errorCode,
    details
  });

  // Prepare response
  const response = createResponse('error', message, {
    errorCode,
    ...(Object.keys(details).length > 0 && { details }),
    ...(statusCode === 429 && details.retryAfter && { retryAfter: details.retryAfter }),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      originalError: err.message 
    }),
  });

  res.status(statusCode).json(response);
};

// Async error wrapper to catch async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Database connection error handler
const handleDatabaseError = async (req, res, next) => {
  try {
    const { prisma } = require('../config/database');
    await prisma.$queryRaw`SELECT 1`;
    next();
  } catch (error) {
    const dbError = new Error('Database connection failed');
    dbError.code = 'P1001';
    dbError.status = 503;
    next(dbError);
  }
};

// AI service error handler
const handleAIServiceError = (error) => {
  console.error('AI Service Error:', {
    error: error.message,
    code: error.code,
    type: error.type,
    timestamp: new Date().toISOString()
  });

  // Return user-friendly error based on error type
  if (error.code === 'insufficient_quota') {
    const quotaError = new Error('AI service quota exceeded. Please try again later.');
    quotaError.code = 'insufficient_quota';
    quotaError.name = 'APIError';
    return quotaError;
  }

  if (error.code === 'rate_limit_exceeded') {
    const rateError = new Error('Too many AI requests. Please wait a moment and try again.');
    rateError.code = 'rate_limit_exceeded';
    rateError.name = 'APIError';
    return rateError;
  }

  if (error.code === 'invalid_api_key') {
    const keyError = new Error('AI service configuration error. Please contact support.');
    keyError.code = 'invalid_api_key';
    keyError.name = 'APIError';
    return keyError;
  }

  if (error.code === 'model_not_found') {
    const modelError = new Error('AI model temporarily unavailable. Please try again later.');
    modelError.code = 'model_not_found';
    modelError.name = 'APIError';
    return modelError;
  }

  // Generic AI service error
  const genericError = new Error('AI service temporarily unavailable. Please try again later.');
  genericError.code = 'ai_service_error';
  genericError.name = 'APIError';
  return genericError;
};

// Request timeout handler
const timeoutHandler = (timeoutMs = 30000) => (req, res, next) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      const timeoutError = new Error(`Request timed out after ${timeoutMs}ms`);
      timeoutError.code = 'REQUEST_TIMEOUT';
      timeoutError.status = 408;
      next(timeoutError);
    }
  }, timeoutMs);

  // Clear timeout if response is sent
  res.on('finish', () => clearTimeout(timeout));
  res.on('close', () => clearTimeout(timeout));

  next();
};

module.exports = { 
  notFound, 
  errorHandler, 
  asyncHandler,
  handleDatabaseError,
  handleAIServiceError,
  timeoutHandler
};
