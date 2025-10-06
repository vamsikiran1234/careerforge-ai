const express = require('express');
const {
  registerMentor,
  verifyMentorEmail,
  getMyMentorProfile,
  updateMentorProfile,
  getAllMentors,
  getMentorById,
  sendConnectionRequest,
  getMyConnections,
  acceptConnectionRequest,
  declineConnectionRequest,
  deleteConnection,
  getPendingMentors,
  approveMentor,
  rejectMentor,
} = require('../controllers/mentorshipController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');

const router = express.Router();

// Public Routes
router.get('/verify/:token', verifyMentorEmail); // Email verification (no auth required)

// Protected Routes - Mentor Registration & Profile Management
router.post('/register', authenticateToken, registerMentor);
router.get('/profile', authenticateToken, getMyMentorProfile);
router.put('/profile', authenticateToken, updateMentorProfile);

// Protected Routes - Mentor Discovery
router.get('/mentors', authenticateToken, getAllMentors);
router.get('/mentors/:id', authenticateToken, getMentorById);

// Protected Routes - Connection Requests
router.post('/connections/request', authenticateToken, sendConnectionRequest);
router.get('/connections', authenticateToken, getMyConnections);
router.post('/connections/:id/accept', authenticateToken, acceptConnectionRequest);
router.post('/connections/:id/decline', authenticateToken, declineConnectionRequest);
router.delete('/connections/:id', authenticateToken, deleteConnection);

// Admin Routes - Mentor Verification
router.get('/admin/mentors/pending', authenticateToken, isAdmin, getPendingMentors);
router.post('/admin/mentors/:id/approve', authenticateToken, isAdmin, approveMentor);
router.post('/admin/mentors/:id/reject', authenticateToken, isAdmin, rejectMentor);

module.exports = router;
