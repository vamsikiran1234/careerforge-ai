const swaggerJsdoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'CareerForge AI API',
    version: '1.0.0',
    description: 'AI-powered career guidance platform with chatbot, skill assessment, and mentor matching',
    contact: {
      name: 'CareerForge AI Team',
      email: 'support@careerforge.ai',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Development server',
    },
    {
      url: 'https://api.careerforge.ai/api/v1',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
      },
    },
    schemas: {
      // User schemas
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'User ID',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
          },
          name: {
            type: 'string',
            description: 'User full name',
          },
          roles: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['STUDENT', 'MENTOR', 'ADMIN'],
            },
            description: 'User roles',
          },
          avatar: {
            type: 'string',
            nullable: true,
            description: 'Profile picture URL',
          },
          bio: {
            type: 'string',
            nullable: true,
            description: 'User biography',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      // Auth schemas
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
          },
          password: {
            type: 'string',
            minLength: 8,
            example: 'SecurePass123!',
            description: 'Must be at least 8 characters with uppercase, lowercase, number, and special character',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
          },
          password: {
            type: 'string',
            example: 'SecurePass123!',
          },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['success'],
          },
          message: {
            type: 'string',
          },
          data: {
            type: 'object',
            properties: {
              user: {
                $ref: '#/components/schemas/User',
              },
              token: {
                type: 'string',
                description: 'JWT authentication token',
              },
            },
          },
        },
      },
      // Chat schemas
      ChatMessage: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          role: {
            type: 'string',
            enum: ['user', 'assistant', 'system'],
          },
          content: {
            type: 'string',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      ChatSession: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          userId: {
            type: 'string',
          },
          title: {
            type: 'string',
          },
          messages: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/ChatMessage',
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      ChatRequest: {
        type: 'object',
        required: ['message'],
        properties: {
          message: {
            type: 'string',
            example: 'How can I improve my software engineering skills?',
          },
          sessionId: {
            type: 'string',
            description: 'Optional session ID to continue an existing conversation',
          },
        },
      },
      // Quiz schemas
      QuizQuestion: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          question: {
            type: 'string',
          },
          options: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          category: {
            type: 'string',
          },
        },
      },
      QuizSession: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          userId: {
            type: 'string',
          },
          currentQuestion: {
            $ref: '#/components/schemas/QuizQuestion',
          },
          progress: {
            type: 'object',
            properties: {
              answered: {
                type: 'integer',
              },
              total: {
                type: 'integer',
              },
            },
          },
          completed: {
            type: 'boolean',
          },
        },
      },
      // Error schemas
      Error: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['error', 'fail'],
          },
          message: {
            type: 'string',
            description: 'Error message',
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                },
                message: {
                  type: 'string',
                },
              },
            },
            description: 'Validation errors (if applicable)',
          },
        },
      },
      // Success response
      SuccessResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['success'],
          },
          message: {
            type: 'string',
          },
          data: {
            type: 'object',
            description: 'Response data',
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication token is missing or invalid',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              status: 'error',
              message: 'Authentication required',
            },
          },
        },
      },
      ForbiddenError: {
        description: 'User does not have permission to access this resource',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              status: 'error',
              message: 'Insufficient permissions',
            },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              status: 'error',
              message: 'Resource not found',
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              status: 'fail',
              message: 'Validation failed',
              errors: [
                {
                  field: 'email',
                  message: 'Valid email is required',
                },
              ],
            },
          },
        },
      },
      InternalServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              status: 'error',
              message: 'An unexpected error occurred',
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints',
    },
    {
      name: 'Chat',
      description: 'AI-powered career chat endpoints',
    },
    {
      name: 'Quiz',
      description: 'Adaptive career assessment quiz endpoints',
    },
    {
      name: 'User',
      description: 'User profile and management endpoints',
    },
    {
      name: 'Mentorship',
      description: 'Mentor matching and mentorship platform endpoints',
    },
    {
      name: 'Career',
      description: 'Career trajectory and goal tracking endpoints',
    },
    {
      name: 'Dashboard',
      description: 'User dashboard and analytics endpoints',
    },
    {
      name: 'Notifications',
      description: 'User notification management endpoints',
    },
    {
      name: 'Reviews',
      description: 'Mentor review and rating system endpoints',
    },
    {
      name: 'Analytics',
      description: 'Platform analytics and statistics (Admin only)',
    },
    {
      name: 'Sessions',
      description: 'Mentor session booking and management',
    },
  ],
};

const options = {
  swaggerDefinition,
  // Path to the API routes with JSDoc comments
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/models/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
