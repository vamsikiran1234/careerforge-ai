const express = require('express');
const chatController = require('../controllers/chatController');
const { validate, chatSchema } = require('../middlewares/enhancedValidation');
const { validateId, validateRequestSize } = require('../middlewares/enhancedValidation');
const { rateLimiters, preventConcurrentOperations, suspiciousRequestDetection } = require('../middlewares/securityMiddleware');
const { asyncHandler } = require('../middlewares/enhancedErrorHandling');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { upload } = require('../services/fileService');

const router = express.Router();

// Apply authentication middleware to all chat routes
router.use(authenticateToken);

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

// GET /api/v1/chat/sessions - Get user's chat sessions (from authenticated user)
router.get('/sessions', 
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

// DELETE /api/v1/chat/session/:sessionId - Delete a chat session
router.delete('/session/:sessionId', 
  validateId('sessionId'),
  asyncHandler(chatController.deleteSession)
);

// POST /api/v1/chat/upload - Upload files and analyze with AI
router.post('/upload',
  upload.array('files', 5), // Allow up to 5 files
  preventConcurrentOperations('upload'),
  asyncHandler(chatController.uploadAndAnalyze)
);

// GET /api/v1/chat/models - Get available AI models
router.get('/models',
  asyncHandler(chatController.getAvailableModels)
);

module.exports = router;
