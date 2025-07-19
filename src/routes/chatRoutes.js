const express = require('express');
const chatController = require('../controllers/chatController');
const { validate, chatSchema } = require('../middlewares/validation');

const router = express.Router();

// POST /api/v1/chat - Create or continue chat session
router.post('/', validate(chatSchema), chatController.createChatSession);

// GET /api/v1/chat/sessions/:userId - Get user's chat sessions
router.get('/sessions/:userId', chatController.getUserSessions);

// GET /api/v1/chat/session/:sessionId - Get specific session messages
router.get('/session/:sessionId', chatController.getSessionMessages);

// PUT /api/v1/chat/session/:sessionId/end - End a chat session
router.put('/session/:sessionId/end', chatController.endSession);

module.exports = router;
