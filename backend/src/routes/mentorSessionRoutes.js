const express = require('express');
const {
  setAvailability,
  getAvailability,
  bookSession,
  getMySessions,
  cancelSession,
  rescheduleSession,
  markSessionComplete,
  startSession,
} = require('../controllers/mentorSessionController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public Routes
// GET /api/v1/sessions/availability/:mentorId - Get mentor availability and booked slots
router.get('/availability/:mentorId', getAvailability);

// Protected Routes - Require Authentication
// POST /api/v1/sessions/availability - Set mentor availability (mentor only)
router.post('/availability', authenticateToken, setAvailability);

// POST /api/v1/sessions/book - Book a session with a mentor
router.post('/book', authenticateToken, bookSession);

/**
 * @swagger
 * /sessions/my-sessions:
 *   get:
 *     summary: Get all user's sessions
 *     description: Retrieve all sessions for the authenticated user (both as student and mentor). Sessions are categorized into upcoming, past, and cancelled.
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SCHEDULED, COMPLETED, CANCELLED, NO_SHOW]
 *         description: Filter sessions by status
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Filter only upcoming scheduled sessions
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     all:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MentorSession'
 *                     categorized:
 *                       type: object
 *                       properties:
 *                         upcoming:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/MentorSession'
 *                         past:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/MentorSession'
 *                         cancelled:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/MentorSession'
 *                     isMentor:
 *                       type: boolean
 *                       description: Whether the user has a mentor profile
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
// GET /api/v1/sessions/my-sessions - Get all user's sessions (as mentor or student)
router.get('/my-sessions', authenticateToken, getMySessions);

// PUT /api/v1/sessions/:id/start - Mark session as started (auto-called on video join)
router.put('/:id/start', authenticateToken, startSession);

// PUT /api/v1/sessions/:id/cancel - Cancel a session
router.put('/:id/cancel', authenticateToken, cancelSession);

// PUT /api/v1/sessions/:id/reschedule - Reschedule a session
router.put('/:id/reschedule', authenticateToken, rescheduleSession);

// PUT /api/v1/sessions/:id/complete - Mark session as complete (mentor only)
router.put('/:id/complete', authenticateToken, markSessionComplete);

module.exports = router;
