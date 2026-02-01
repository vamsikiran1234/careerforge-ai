const express = require('express');
const {
  setAvailability,
  getAvailability,
  getMyAvailability,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
  bookSession,
  getMySessions,
  cancelSession,
  rescheduleSession,
  markSessionComplete,
  startSession,
} = require('../controllers/mentorSessionController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// ========================================
// AVAILABILITY ROUTES
// ========================================

/**
 * @swagger
 * /sessions/availability/{mentorId}:
 *   get:
 *     summary: Get mentor availability schedule
 *     description: Retrieve a mentor's weekly recurring availability and available time slots for the next 30 days
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: mentorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Mentor profile ID
 *     responses:
 *       200:
 *         description: Availability retrieved successfully
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
 *                     mentor:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         avatar:
 *                           type: string
 *                           nullable: true
 *                         company:
 *                           type: string
 *                         jobTitle:
 *                           type: string
 *                         timezone:
 *                           type: string
 *                         availableHoursPerWeek:
 *                           type: integer
 *                         preferredMeetingType:
 *                           type: string
 *                     weeklySchedule:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MentorAvailability'
 *                     bookedSlots:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           scheduledAt:
 *                             type: string
 *                             format: date-time
 *                           duration:
 *                             type: integer
 *                           status:
 *                             type: string
 *                     availableSlots:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AvailableSlot'
 *       404:
 *         description: Mentor not found
 *       500:
 *         description: Server error
 */
// Public Routes
// GET /api/v1/sessions/availability/:mentorId - Get mentor availability and booked slots
router.get('/availability/:mentorId', getAvailability);

/**
 * @swagger
 * /sessions/availability:
 *   post:
 *     summary: Set mentor availability schedule
 *     description: Create or replace the mentor's weekly recurring availability schedule (mentor only)
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - availability
 *             properties:
 *               availability:
 *                 type: array
 *                 description: Array of weekly availability slots
 *                 items:
 *                   type: object
 *                   required:
 *                     - dayOfWeek
 *                     - startTime
 *                     - endTime
 *                   properties:
 *                     dayOfWeek:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                       description: Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
 *                     startTime:
 *                       type: string
 *                       pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                       example: '09:00'
 *                     endTime:
 *                       type: string
 *                       pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                       example: '17:00'
 *               timezone:
 *                 type: string
 *                 description: Mentor's timezone
 *                 example: 'UTC'
 *           example:
 *             availability:
 *               - dayOfWeek: 1
 *                 startTime: '09:00'
 *                 endTime: '12:00'
 *               - dayOfWeek: 1
 *                 startTime: '14:00'
 *                 endTime: '17:00'
 *               - dayOfWeek: 3
 *                 startTime: '10:00'
 *                 endTime: '16:00'
 *             timezone: 'America/New_York'
 *     responses:
 *       200:
 *         description: Availability updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Availability updated successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     availability:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MentorAvailability'
 *                     timezone:
 *                       type: string
 *       400:
 *         description: Invalid availability data
 *       403:
 *         description: Only verified mentors can set availability
 *       500:
 *         description: Server error
 */
// Protected Routes - Require Authentication
// POST /api/v1/sessions/availability - Set/replace all mentor availability slots (mentor only)
router.post('/availability', authenticateToken, setAvailability);

/**
 * @swagger
 * /sessions/my-availability:
 *   get:
 *     summary: Get own availability schedule
 *     description: Retrieve the authenticated mentor's availability schedule (mentor only)
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Availability retrieved successfully
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
 *                     availability:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MentorAvailability'
 *                     timezone:
 *                       type: string
 *       403:
 *         description: Only mentors can access this endpoint
 *       500:
 *         description: Server error
 */
// GET /api/v1/sessions/my-availability - Get own availability (mentor only)
router.get('/my-availability', authenticateToken, getMyAvailability);

/**
 * @swagger
 * /sessions/availability/{slotId}:
 *   put:
 *     summary: Update a specific availability slot
 *     description: Update an individual availability slot (mentor only)
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *         description: Availability slot ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dayOfWeek:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *               startTime:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               endTime:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Slot updated successfully
 *       404:
 *         description: Slot not found
 *       403:
 *         description: Unauthorized
 *   delete:
 *     summary: Delete a specific availability slot
 *     description: Remove an availability slot (mentor only)
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *         description: Availability slot ID
 *     responses:
 *       200:
 *         description: Slot deleted successfully
 *       404:
 *         description: Slot not found
 *       403:
 *         description: Unauthorized
 */
// PUT /api/v1/sessions/availability/:slotId - Update a specific availability slot (mentor only)
router.put('/availability/:slotId', authenticateToken, updateAvailabilitySlot);

// DELETE /api/v1/sessions/availability/:slotId - Delete a specific availability slot (mentor only)
router.delete('/availability/:slotId', authenticateToken, deleteAvailabilitySlot);

// ========================================
// SESSION MANAGEMENT ROUTES
// ========================================

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
