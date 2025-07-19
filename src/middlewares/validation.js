const Joi = require('joi');

const validate = schema => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message,
    });
  }
  next();
};

const chatSchema = Joi.object({
  userId: Joi.string().required().messages({
    'string.empty': 'User ID is required',
    'any.required': 'User ID is required',
  }),
  message: Joi.string().min(1).max(1000).required().messages({
    'string.empty': 'Message cannot be empty',
    'string.min': 'Message must be at least 1 character long',
    'string.max': 'Message cannot exceed 1000 characters',
    'any.required': 'Message is required',
  }),
});

const quizAnswerSchema = Joi.object({
  answer: Joi.string().required().messages({
    'string.empty': 'Answer is required',
    'any.required': 'Answer is required',
  }),
  questionId: Joi.string().optional().messages({
    'string.base': 'Question ID must be a string',
  }),
});

const userIdSchema = Joi.object({
  userId: Joi.string().required().messages({
    'string.empty': 'User ID is required',
    'any.required': 'User ID is required',
  }),
});

const mentorQuerySchema = Joi.object({
  question: Joi.string().min(5).max(500).required().messages({
    'string.empty': 'Question is required',
    'string.min': 'Question must be at least 5 characters long',
    'string.max': 'Question cannot exceed 500 characters',
    'any.required': 'Question is required',
  }),
  userId: Joi.string().required().messages({
    'string.empty': 'User ID is required',
    'any.required': 'User ID is required',
  }),
});

const userSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  role: Joi.string().valid('STUDENT', 'MENTOR', 'ADMIN').default('STUDENT').messages({
    'any.only': 'Role must be either STUDENT, MENTOR, or ADMIN',
  }),
  bio: Joi.string().max(500).optional().messages({
    'string.max': 'Bio cannot exceed 500 characters',
  }),
  avatar: Joi.string().uri().optional().messages({
    'string.uri': 'Avatar must be a valid URL',
  }),
});

module.exports = {
  validate,
  chatSchema,
  quizAnswerSchema,
  userIdSchema,
  mentorQuerySchema,
  userSchema,
};
