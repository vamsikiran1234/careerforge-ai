const express = require('express');
const {
  createReview,
  getMentorReviews,
  updateReview,
  deleteReview,
  mentorRespondToReview,
  getMyReviews,
  getReceivedReviews,
} = require('../controllers/reviewController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public Routes
// GET /api/v1/reviews/mentor/:mentorId - Get all public reviews for a mentor
router.get('/mentor/:mentorId', getMentorReviews);

// Protected Routes - Require Authentication
// POST /api/v1/reviews - Create a review
router.post('/', authenticateToken, createReview);

// GET /api/v1/reviews/my-reviews - Get user's reviews (as student)
router.get('/my-reviews', authenticateToken, getMyReviews);

// GET /api/v1/reviews/received - Get reviews received by mentor
router.get('/received', authenticateToken, getReceivedReviews);

// PUT /api/v1/reviews/:id - Update a review (author only)
router.put('/:id', authenticateToken, updateReview);

// DELETE /api/v1/reviews/:id - Delete a review (author only)
router.delete('/:id', authenticateToken, deleteReview);

// POST /api/v1/reviews/:id/respond - Mentor responds to a review
router.post('/:id/respond', authenticateToken, mentorRespondToReview);

module.exports = router;
