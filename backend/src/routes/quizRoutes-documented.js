const express = require('express');
const quizController = require('../controllers/quizController');
const { validate, quizAnswerSchema } = require('../middlewares/validation');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply authentication to all quiz routes
router.use(authenticateToken);

/**
 * @swagger
 * /quiz/available:
 *   get:
 *     summary: Get available quizzes
 *     description: Retrieve list of all available quiz types
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available quizzes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     quizzes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: skills
 *                           name:
 *                             type: string
 *                             example: Skills Assessment
 *                           description:
 *                             type: string
 *                           duration:
 *                             type: string
 *                             example: 15-20 minutes
 *                           questions:
 *                             type: integer
 *                             example: 10
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/available', async (req, res) => {
  try {
    const quizTypes = [
      {
        id: 'skills',
        name: 'Skills Assessment',
        description: 'Evaluate your technical and soft skills',
        duration: '15-20 minutes',
        questions: 10
      },
      {
        id: 'career',
        name: 'Career Path Quiz',
        description: 'Discover the best career path for you',
        duration: '10-15 minutes',
        questions: 8
      },
      {
        id: 'personality',
        name: 'Personality Assessment',
        description: 'Understand your work style and preferences',
        duration: '15-20 minutes',
        questions: 12
      }
    ];
    
    res.status(200).json({
      status: 'success',
      message: 'Available quizzes retrieved successfully',
      data: { quizzes: quizTypes }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch available quizzes'
    });
  }
});

/**
 * @swagger
 * /quiz/start:
 *   post:
 *     summary: Start a new quiz session
 *     description: Begin a new quiz session and receive the first question
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quizType:
 *                 type: string
 *                 enum: [skills, career, personality]
 *                 example: skills
 *     responses:
 *       200:
 *         description: Quiz session started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/QuizSession'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/start', quizController.startQuiz);

/**
 * @swagger
 * /quiz/submit:
 *   post:
 *     summary: Submit quiz answers
 *     description: Submit answers for the current quiz session
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId, answer]
 *             properties:
 *               sessionId:
 *                 type: string
 *               answer:
 *                 type: string
 *               questionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Answer submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/submit', quizController.submitAnswer);

/**
 * @swagger
 * /quiz/{quizId}/answer:
 *   post:
 *     summary: Submit answer to current question
 *     description: Submit an answer for the current question in the quiz
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answer]
 *             properties:
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Answer submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/:quizId/answer', validate(quizAnswerSchema), quizController.submitAnswer);

/**
 * @swagger
 * /quiz/history:
 *   get:
 *     summary: Get quiz history
 *     description: Retrieve all quiz sessions for the authenticated user
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Quiz history retrieved successfully
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
 *                     sessions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/QuizSession'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/history', quizController.getUserQuizSessions);

/**
 * @swagger
 * /quiz/results/{sessionId}:
 *   get:
 *     summary: Get quiz results
 *     description: Retrieve results for a completed quiz session
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/QuizSession'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/results/:sessionId', quizController.getQuizSession);

/**
 * @swagger
 * /quiz/session/{quizId}:
 *   get:
 *     summary: Get quiz session details
 *     description: Retrieve details of a specific quiz session
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz session retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/QuizSession'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/session/:quizId', quizController.getQuizSession);

router.get('/sessions/:userId', quizController.getUserQuizSessions);

/**
 * @swagger
 * /quiz/statistics:
 *   get:
 *     summary: Get quiz statistics
 *     description: Retrieve statistical data about user's quiz performance
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                     completed:
 *                       type: integer
 *                     inProgress:
 *                       type: integer
 *                     avgScore:
 *                       type: number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/statistics', async (req, res) => {
  try {
    const userEmail = req.user.email || req.user.userEmail;
    
    const user = await require('../config/database').prisma.user.findUnique({
      where: { email: userEmail }
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    const sessions = await require('../config/database').prisma.quizSession.findMany({
      where: { userId: user.id }
    });
    
    const completed = sessions.filter(s => s.completedAt !== null).length;
    const inProgress = sessions.filter(s => s.completedAt === null).length;
    const avgScore = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.score || 0), 0) / completed || 0
      : 0;
    
    res.status(200).json({
      status: 'success',
      data: {
        completed,
        inProgress,
        avgScore: Math.round(avgScore * 100) / 100,
        total: sessions.length
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;
