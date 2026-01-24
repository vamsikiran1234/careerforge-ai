const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getMentorStats,
  getSessionStats,
  getUserStats,
  getReviewStats
} = require('../controllers/analyticsController');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(isAdmin);

// Platform overview statistics
router.get('/platform', getPlatformStats);

// Mentor statistics
router.get('/mentors', getMentorStats);

// Session statistics with time series
router.get('/sessions', getSessionStats);

// User statistics
router.get('/users', getUserStats);

// Review statistics
router.get('/reviews', getReviewStats);

module.exports = router;
