const express = require('express');
const router = express.Router();
const { getUserDashboardStats } = require('../controllers/dashboardController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Get user-specific dashboard statistics
router.get('/stats', authenticateToken, getUserDashboardStats);

module.exports = router;
