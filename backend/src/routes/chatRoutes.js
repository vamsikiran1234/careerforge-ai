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

/**
 * @swagger
 * /chat:
 *   post:
 *     summary: Create or continue chat session
 *     description: Send a message to the AI chatbot and receive career guidance. Can create a new session or continue an existing one.
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRequest'
 *     responses:
 *       200:
 *         description: Chat response received successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Message sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                     response:
 *                       type: string
 *                     messages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ChatMessage'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', 
  validateRequestSize(50 * 1024), // 50KB max for chat messages
  validate(chatSchema),
  preventConcurrentOperations('chat'),
  asyncHandler(chatController.createChatSession)
);

/**
 * @swagger
 * /chat/sessions:
 *   get:
 *     summary: Get user's chat sessions
 *     description: Retrieve all chat sessions for the authenticated user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chat sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ChatSession'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/sessions', 
  asyncHandler(chatController.getUserSessions)
);

/**
 * @swagger
 * /chat/history:
 *   get:
 *     summary: Get chat history (alias)
 *     description: Alias for /sessions endpoint - retrieves all chat sessions for the authenticated user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chat history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ChatSession'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/history', 
  asyncHandler(chatController.getUserSessions)
);

/**
 * @swagger
 * /chat/session/{sessionId}:
 *   get:
 *     summary: Get specific session messages
 *     description: Retrieve all messages for a specific chat session
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat session ID
 *     responses:
 *       200:
 *         description: Session messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/ChatSession'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/session/:sessionId', 
  validateId('sessionId'),
  asyncHandler(chatController.getSessionMessages)
);

/**
 * @swagger
 * /chat/session/{sessionId}/end:
 *   put:
 *     summary: End a chat session
 *     description: Mark a chat session as ended
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat session ID
 *     responses:
 *       200:
 *         description: Session ended successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/session/:sessionId/end', 
  validateId('sessionId'),
  asyncHandler(chatController.endSession)
);

/**
 * @swagger
 * /chat/session/{sessionId}:
 *   delete:
 *     summary: Delete a chat session
 *     description: Permanently delete a chat session and all its messages
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat session ID
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/session/:sessionId', 
  validateId('sessionId'),
  asyncHandler(chatController.deleteSession)
);

/**
 * @swagger
 * /chat/upload:
 *   post:
 *     summary: Upload files and analyze with AI
 *     description: Upload files (resume, documents) and get AI-powered analysis
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 5
 *                 description: Files to upload (max 5 files)
 *     responses:
 *       200:
 *         description: Files uploaded and analyzed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     analysis:
 *                       type: string
 *                     files:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/upload',
  upload.array('files', 5), // Allow up to 5 files
  preventConcurrentOperations('upload'),
  asyncHandler(chatController.uploadAndAnalyze)
);

/**
 * @swagger
 * /chat/models:
 *   get:
 *     summary: Get available AI models
 *     description: Retrieve list of available AI models for chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available models retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     models:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/models',
  asyncHandler(chatController.getAvailableModels)
);

module.exports = router;
