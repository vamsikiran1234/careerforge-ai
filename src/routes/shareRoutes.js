const express = require('express');
const { body, param } = require('express-validator');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validation');
const shareController = require('../controllers/shareController');
// Updated validation for share codes

const router = express.Router();

// Validation schemas
const shareValidation = [
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('title').optional().isString().isLength({ max: 200 }).withMessage('Title must be a string with max 200 characters'),
  body('description').optional().isString().isLength({ max: 500 }).withMessage('Description must be a string with max 500 characters'),
  body('allowComments').optional().isBoolean().withMessage('Allow comments must be a boolean'),
  body('isPublic').optional().isBoolean().withMessage('Is public must be a boolean'),
  body('expirationDays').optional().isInt({ min: 1, max: 365 }).withMessage('Expiration days must be between 1 and 365'),
  body('allowCopy').optional().isBoolean().withMessage('Allow copy must be a boolean'),
  body('allowDownload').optional().isBoolean().withMessage('Allow download must be a boolean'),
  body('allowScroll').optional().isBoolean().withMessage('Allow scroll must be a boolean'),
  body('password').optional().isString().isLength({ max: 100 }).withMessage('Password must be a string with max 100 characters'),
];

const shareCodeValidation = [
  param('shareCode').matches(/^[a-f0-9]+$/).withMessage('Invalid share code format'),
];

// POST /api/v1/share - Create a share link
router.post('/', 
  authenticateToken, 
  shareValidation, 
  validateRequest, 
  shareController.createShareLink
);

// GET /api/v1/share/:shareCode - Get shared conversation (public endpoint)
router.get('/:shareCode', 
  shareCodeValidation, 
  validateRequest, 
  shareController.getSharedConversation
);

// POST /api/v1/share/:shareCode/message - Send message in shared conversation (public endpoint)
router.post('/:shareCode/message', 
  shareCodeValidation, 
  body('message').notEmpty().withMessage('Message is required').isString().isLength({ max: 5000 }).withMessage('Message must be less than 5000 characters'),
  validateRequest, 
  shareController.sendMessageInSharedConversation
);

// GET /api/v1/share/session/:sessionId - Get all shares for a session
router.get('/session/:sessionId', 
  authenticateToken, 
  param('sessionId').notEmpty().withMessage('Session ID is required'), 
  validateRequest, 
  shareController.getSessionShares
);

// DELETE /api/v1/share/:shareId - Revoke a share
router.delete('/:shareId', 
  authenticateToken, 
  param('shareId').notEmpty().withMessage('Share ID is required'), 
  validateRequest, 
  shareController.revokeShare
);

module.exports = router;