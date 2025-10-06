const Joi = require('joi');
const { createResponse } = require('../utils/helpers');

// Enhanced validation middleware with sanitization
const validate = schema => (req, res, next) => {
  // Sanitize request body before validation
  req.body = sanitizeInput(req.body);
  
  const { error } = schema.validate(req.body, {
    abortEarly: false, // Return all validation errors
    stripUnknown: true, // Remove unknown fields
    presence: 'required' // Make all fields required by default
  });
  
  if (error) {
    const errorMessages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
    
    // Use the first error message as the main response message
    const userMessage = error.details[0].message;
    
    return res.status(400).json(
      createResponse('error', userMessage, {
        errors: errorMessages,
        errorCount: errorMessages.length
      })
    );
  }
  next();
};

// Enhanced input sanitization
const sanitizeInput = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeInput);
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Remove potential XSS and SQL injection patterns
      sanitized[key] = value
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/['";]/g, '') // Remove potential SQL injection chars
        .substring(0, 10000); // Limit string length
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

// Enhanced chat validation schema (updated to work with auth middleware)
const chatSchema = Joi.object({
  message: Joi.string()
    .min(1)
    .max(50000)
    .required()
    .messages({
      'string.empty': 'Message cannot be empty',
      'string.min': 'Message must be at least 1 character long',
      'string.max': 'Message cannot exceed 50,000 characters',
      'any.required': 'Message is required',
    }),
  sessionId: Joi.string()
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .optional()
    .messages({
      'string.pattern.base': 'Session ID contains invalid characters',
    }),
});

// Enhanced quiz answer validation schema
const quizAnswerSchema = Joi.object({
  answer: Joi.string()
    .min(1)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Answer is required',
      'string.min': 'Answer must be at least 1 character',
      'string.max': 'Answer cannot exceed 500 characters',
      'any.required': 'Answer is required',
    }),
  questionId: Joi.string()
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .optional()
    .messages({
      'string.pattern.base': 'Question ID contains invalid characters',
    }),
});

// Enhanced mentor query validation schema
const mentorQuerySchema = Joi.object({
  question: Joi.string()
    .min(5)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Question is required',
      'string.min': 'Question must be at least 5 characters long',
      'string.max': 'Question cannot exceed 500 characters',
      'any.required': 'Question is required',
    }),
  userId: Joi.string()
    .min(1)
    .max(100)
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .required()
    .messages({
      'string.empty': 'User ID is required',
      'string.min': 'User ID must be at least 1 character',
      'string.max': 'User ID cannot exceed 100 characters',
      'string.pattern.base': 'User ID contains invalid characters',
      'any.required': 'User ID is required',
    }),
  domain: Joi.string()
    .valid(
      'WEB_DEVELOPMENT', 'DATA_SCIENCE', 'MOBILE_DEVELOPMENT', 'DEVOPS',
      'CYBERSECURITY', 'AI_ML', 'BLOCKCHAIN', 'GAME_DEVELOPMENT',
      'UI_UX_DESIGN', 'PRODUCT_MANAGEMENT', 'FINANCE', 'MARKETING',
      'CONSULTING', 'ENTREPRENEURSHIP', 'OTHER'
    )
    .optional()
    .messages({
      'any.only': 'Domain must be a valid career domain',
    }),
});

// Enhanced mentor match validation schema
const mentorMatchSchema = Joi.object({
  skills: Joi.array()
    .items(Joi.string().min(1).max(50))
    .min(1)
    .max(10)
    .required()
    .messages({
      'array.min': 'At least one skill is required',
      'array.max': 'Cannot specify more than 10 skills',
      'any.required': 'Skills are required',
    }),
  careerGoal: Joi.string()
    .min(3)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Career goal must be at least 3 characters',
      'string.max': 'Career goal cannot exceed 100 characters',
    }),
  experienceLevel: Joi.string()
    .valid('beginner', 'intermediate', 'advanced', 'expert')
    .optional()
    .messages({
      'any.only': 'Experience level must be beginner, intermediate, advanced, or expert',
    }),
  domain: Joi.string()
    .valid(
      'TECHNOLOGY', 'DATA_SCIENCE', 'DESIGN', 'BUSINESS', 'FINANCE',
      'MARKETING', 'CONSULTING', 'ENTREPRENEURSHIP', 'OTHER'
    )
    .optional(),
  budget: Joi.number()
    .min(0)
    .max(1000)
    .optional()
    .messages({
      'number.min': 'Budget cannot be negative',
      'number.max': 'Budget cannot exceed $1000',
    }),
  location: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Location must be at least 2 characters',
      'string.max': 'Location cannot exceed 50 characters',
    }),
  learningStyle: Joi.string()
    .valid('visual', 'auditory', 'hands-on', 'reading', 'mixed')
    .optional()
});

// Enhanced user creation validation schema
const userCreateSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'string.pattern.base': 'Name can only contain letters and spaces',
      'any.required': 'Name is required',
    }),
  email: Joi.string()
    .email({ minDomainSegments: 2 })
    .max(255)
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
      'string.max': 'Email cannot exceed 255 characters',
      'any.required': 'Email is required',
    }),
  role: Joi.string()
    .valid('STUDENT', 'MENTOR', 'ADMIN')
    .default('STUDENT')
    .messages({
      'any.only': 'Role must be either STUDENT, MENTOR, or ADMIN',
    }),
  bio: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Bio cannot exceed 500 characters',
    }),
  avatar: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .max(500)
    .optional()
    .messages({
      'string.uri': 'Avatar must be a valid URL',
      'string.max': 'Avatar URL cannot exceed 500 characters',
    }),
});

// ID validation middleware
const validateId = (paramName = 'id') => (req, res, next) => {
  const id = req.params[paramName];
  
  if (!id) {
    return res.status(400).json(
      createResponse('error', `${paramName} is required`)
    );
  }
  
  // Validate ID format (alphanumeric, hyphens, underscores)
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    return res.status(400).json(
      createResponse('error', `Invalid ${paramName} format`)
    );
  }
  
  // Validate ID length
  if (id.length < 1 || id.length > 100) {
    return res.status(400).json(
      createResponse('error', `${paramName} must be between 1 and 100 characters`)
    );
  }
  
  next();
};

// Request size validation middleware
const validateRequestSize = (maxSize = 1024 * 1024) => (req, res, next) => {
  const contentLength = parseInt(req.get('content-length') || 0);
  
  if (contentLength > maxSize) {
    return res.status(413).json(
      createResponse('error', `Request too large. Maximum size is ${maxSize} bytes`)
    );
  }
  
  next();
};

module.exports = {
  validate,
  validateId,
  validateRequestSize,
  sanitizeInput,
  chatSchema,
  quizAnswerSchema,
  mentorQuerySchema,
  mentorMatchSchema,
  userCreateSchema,
};
