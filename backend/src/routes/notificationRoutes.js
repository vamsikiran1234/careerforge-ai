const express = require('express');
const router = express.Router();
const {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} = require('../controllers/notificationController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// Get user's notifications (with pagination and filters)
router.get('/', getUserNotifications);

// Get unread notifications count
router.get('/unread-count', getUnreadCount);

// Mark all notifications as read
router.put('/read-all', markAllAsRead);

// Delete all notifications
router.delete('/all', deleteAllNotifications);

// Mark specific notification as read
router.put('/:id/read', markAsRead);

// Delete specific notification
router.delete('/:id', deleteNotification);

// Create notification (usually called by other services, but exposed for admin/testing)
router.post('/', createNotification);

module.exports = router;
