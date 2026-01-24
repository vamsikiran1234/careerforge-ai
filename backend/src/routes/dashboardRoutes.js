const express = require('express');
const router = express.Router();
const { getUserDashboardStats } = require('../controllers/dashboardController');
const { authenticateToken } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get user dashboard statistics
 *     description: Retrieve comprehensive statistics for user dashboard including chat sessions, quizzes, career goals, and mentorship data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     chatSessions:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                     quizzes:
 *                       type: object
 *                       properties:
 *                         completed:
 *                           type: integer
 *                         averageScore:
 *                           type: number
 *                     careerGoals:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         completed:
 *                           type: integer
 *                         inProgress:
 *                           type: integer
 *                     mentorship:
 *                       type: object
 *                       properties:
 *                         connections:
 *                           type: integer
 *                         sessions:
 *                           type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stats', authenticateToken, getUserDashboardStats);


module.exports = router;
