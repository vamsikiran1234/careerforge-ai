const express = require('express');
const chatController = require('../controllers/chatController');
const { validate, chatSchema } = require('../middlewares/enhancedValidation');
const { validateId, validateRequestSize } = require('../middlewares/enhancedValidation');
const { rateLimiters, preventConcurrentOperations, suspiciousRequestDetection } = require('../middlewares/securityMiddleware');
const { asyncHandler } = require('../middlewares/enhancedErrorHandling');

const router = express.Router();

// Apply security middleware to all chat routes
router.use(suspiciousRequestDetection());
router.use(rateLimiters.chat);

// POST /api/v1/chat - Create or continue chat session
router.post('/', 
  validateRequestSize(50 * 1024), // 50KB max for chat messages
  validate(chatSchema),
  preventConcurrentOperations('chat'),
  asyncHandler(chatController.createChatSession)
);

// GET /api/v1/chat/sessions/:userId - Get user's chat sessions  
router.get('/sessions/:userId', 
  validateId('userId'),
  asyncHandler(chatController.getUserSessions)
);

// GET /api/v1/chat/session/:sessionId - Get specific session messages
router.get('/session/:sessionId', 
  validateId('sessionId'),
  asyncHandler(chatController.getSessionMessages)
);

// PUT /api/v1/chat/session/:sessionId/end - End a chat session
router.put('/session/:sessionId/end', 
  validateId('sessionId'),
  asyncHandler(chatController.endSession)
);

module.exports = router;
