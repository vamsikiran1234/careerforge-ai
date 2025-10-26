const express = require('express');
const quizController = require('../controllers/quizController');
const { validate, quizAnswerSchema, userIdSchema } = require('../middlewares/validation');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply authentication to all quiz routes
router.use(authenticateToken);

// GET /api/v1/quiz/available - Get available quizzes (frontend compatibility)
router.get('/available', async (req, res) => {
  try {
    // Return available quiz types/categories
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

// POST /api/v1/quiz/start - Start a new quiz session
router.post('/start', quizController.startQuiz);

// POST /api/v1/quiz/submit - Submit quiz answers (frontend compatibility)
router.post('/submit', quizController.submitAnswer);

// POST /api/v1/quiz/:quizId/answer - Submit answer to current question
router.post('/:quizId/answer', validate(quizAnswerSchema), quizController.submitAnswer);

// GET /api/v1/quiz/history - Get user's quiz history (frontend compatibility)
router.get('/history', quizController.getUserQuizSessions);

// GET /api/v1/quiz/results/:sessionId - Get quiz results (frontend compatibility)
router.get('/results/:sessionId', quizController.getQuizSession);

// GET /api/v1/quiz/session/:quizId - Get specific quiz session details
router.get('/session/:quizId', quizController.getQuizSession);

// GET /api/v1/quiz/sessions/:userId - Get all quiz sessions for a user (legacy)
router.get('/sessions/:userId', quizController.getUserQuizSessions);

// GET /api/v1/quiz/statistics - Get user's quiz statistics
router.get('/statistics', async (req, res) => {
  try {
    const userEmail = req.user.email || req.user.userEmail;
    
    // Find user
    const user = await require('../config/database').prisma.user.findUnique({
      where: { email: userEmail }
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Get quiz statistics
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
      message: 'Quiz statistics retrieved successfully',
      data: {
        totalQuizzes: sessions.length,
        completedQuizzes: completed,
        inProgressQuizzes: inProgress,
        averageScore: Math.round(avgScore * 100) / 100
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch quiz statistics'
    });
  }
});

// PUT /api/v1/quiz/:sessionId/retake - Retake a quiz
router.put('/:sessionId/retake', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userEmail = req.user.email || req.user.userEmail;
    
    // Find user
    const user = await require('../config/database').prisma.user.findUnique({
      where: { email: userEmail }
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Find the quiz session
    const session = await require('../config/database').prisma.quizSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id
      }
    });
    
    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Quiz session not found'
      });
    }
    
    // Create a new session for retake
    const newSession = await require('../config/database').prisma.quizSession.create({
      data: {
        userId: user.id,
        currentStage: 'SKILLS_ASSESSMENT',
        answers: '{}',
        score: 0
      }
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Quiz retake session created',
      data: { session: newSession }
    });
  } catch (error) {
    console.error('Retake quiz error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create retake session'
    });
  }
});

// DELETE /api/v1/quiz/:quizId - Delete a quiz session
router.delete('/:quizId', quizController.deleteQuizSession);

module.exports = router;
