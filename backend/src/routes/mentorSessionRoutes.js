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
