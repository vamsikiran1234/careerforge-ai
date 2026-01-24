const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const {
  getChatRooms,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  uploadChatFile,
} = require('../controllers/mentorChatController');

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/v1/mentor-chat/rooms
 * @desc    Get all chat rooms for current user
 * @access  Private
 */
router.get('/rooms', getChatRooms);

/**
 * @route   GET /api/v1/mentor-chat/rooms/:roomId/messages
 * @desc    Get all messages in a chat room
 * @access  Private
 * @query   page - Page number (default: 1)
 * @query   limit - Messages per page (default: 50)
 */
router.get('/rooms/:roomId/messages', getChatMessages);

/**
 * @route   POST /api/v1/mentor-chat/rooms/:roomId/messages
 * @desc    Send a message in a chat room
 * @access  Private
 * @body    content - Message text
 * @body    messageType - TEXT, IMAGE, FILE (default: TEXT)
 * @body    fileUrl - URL if file/image (optional)
 * @body    fileName - File name (optional)
 */
router.post('/rooms/:roomId/messages', sendMessage);

/**
 * @route   PUT /api/v1/mentor-chat/rooms/:roomId/read
 * @desc    Mark all messages in room as read
 * @access  Private
 */
router.put('/rooms/:roomId/read', markMessagesAsRead);

/**
 * @route   POST /api/v1/mentor-chat/upload
 * @desc    Upload file for chat
 * @access  Private
 */
router.post('/upload', uploadChatFile);

module.exports = router;
