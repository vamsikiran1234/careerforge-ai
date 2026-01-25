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

/**
 * @swagger
 * /share:
 *   post:
 *     summary: Create a share link for a conversation
 *     description: Create a shareable link for a career chat session with custom settings
 *     tags: [Share]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Career session ID to share
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 description: Custom title for the share
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Description of the shared conversation
 *               isPublic:
 *                 type: boolean
 *                 default: true
 *                 description: Whether the share is publicly visible
 *               allowComments:
 *                 type: boolean
 *                 default: false
 *                 description: Allow viewers to comment
 *               allowCopy:
 *                 type: boolean
 *                 default: true
 *                 description: Allow viewers to copy conversation
 *               allowDownload:
 *                 type: boolean
 *                 default: true
 *                 description: Allow viewers to download conversation
 *               allowScroll:
 *                 type: boolean
 *                 default: false
 *                 description: Show scroll controls to viewers
 *               password:
 *                 type: string
 *                 maxLength: 100
 *                 description: Optional password protection
 *               expirationDays:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 365
 *                 description: Days until the share expires
 *     responses:
 *       201:
 *         description: Share link created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ShareSettings'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
// POST /api/v1/share - Create a share link
router.post('/', 
  authenticateToken, 
  shareValidation, 
  validateRequest, 
  shareController.createShareLink
);

/**
 * @swagger
 * /share/{shareCode}:
 *   get:
 *     summary: Get a shared conversation
 *     description: Retrieve a shared conversation using the share code. Password may be required.
 *     tags: [Share]
 *     parameters:
 *       - in: path
 *         name: shareCode
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-f0-9]+$'
 *         description: Unique share code
 *       - in: header
 *         name: X-Share-Password
 *         schema:
 *           type: string
 *         description: Password for password-protected shares
 *     responses:
 *       200:
 *         description: Shared conversation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SharedConversation'
 *       401:
 *         description: Password required or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Password required
 *                 data:
 *                   type: object
 *                   properties:
 *                     requiresPassword:
 *                       type: boolean
 *                       example: true
 *       404:
 *         description: Share not found or expired
 *       500:
 *         description: Server error
 */
// GET /api/v1/share/:shareCode - Get shared conversation (public endpoint)
router.get('/:shareCode', 
  shareCodeValidation, 
  validateRequest, 
  shareController.getSharedConversation
);

/**
 * @swagger
 * /share/{shareCode}/message:
 *   post:
 *     summary: Send a message in a shared conversation
 *     description: Continue the conversation in a shared session by sending a message and getting an AI response
 *     tags: [Share]
 *     parameters:
 *       - in: path
 *         name: shareCode
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-f0-9]+$'
 *         description: Unique share code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 maxLength: 5000
 *                 description: Message to send to the AI
 *                 example: What skills do I need to become a software engineer?
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         reply:
 *                           type: string
 *                           description: AI response
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                         sessionId:
 *                           type: string
 *                           description: Session ID
 *       400:
 *         description: Invalid message
 *       404:
 *         description: Share not found or expired
 *       500:
 *         description: Server error
 */
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