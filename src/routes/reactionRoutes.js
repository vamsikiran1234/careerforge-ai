const express = require('express');
const reactionController = require('../controllers/reactionController');
const { validate } = require('../middlewares/enhancedValidation');
const { validateId, validateRequestSize } = require('../middlewares/enhancedValidation');
const { asyncHandler } = require('../middlewares/enhancedErrorHandling');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');

const router = express.Router();

// Apply authentication middleware to all reaction routes
router.use(authenticateToken);

// Validation schemas
const reactionSchema = [
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('messageId').notEmpty().withMessage('Message ID is required'),
  body('reactionType')
    .isIn(['THUMBS_UP', 'THUMBS_DOWN', 'BOOKMARK', 'STAR'])
    .withMessage('Invalid reaction type'),
  body('feedback').optional().isString().isLength({ max: 2000 })
    .withMessage('Feedback must be a string with max 2000 characters'),
];

// POST /api/v1/reactions - Add or update a reaction to a message
router.post('/', 
  validateRequestSize(10 * 1024), // 10KB max for reactions
  validate(reactionSchema),
  asyncHandler(reactionController.addReaction)
);

// DELETE /api/v1/reactions/:reactionId - Remove a reaction
router.delete('/:reactionId', 
  validateId('reactionId'),
  asyncHandler(reactionController.removeReaction)
);

// GET /api/v1/reactions/session/:sessionId - Get all reactions for a session
router.get('/session/:sessionId', 
  validateId('sessionId'),
  asyncHandler(reactionController.getSessionReactions)
);

// GET /api/v1/reactions/message/:messageId - Get reactions for specific message
router.get('/message/:messageId', 
  validateId('messageId'),
  asyncHandler(reactionController.getMessageReactions)
);

module.exports = router;