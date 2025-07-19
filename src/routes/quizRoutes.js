const express = require('express');
const quizController = require('../controllers/quizController');
const { validate, quizAnswerSchema, userIdSchema } = require('../middlewares/validation');

const router = express.Router();

// POST /api/v1/quiz/start - Start a new quiz session
router.post('/start', validate(userIdSchema), quizController.startQuiz);

// POST /api/v1/quiz/:quizId/answer - Submit answer to current question
router.post('/:quizId/answer', validate(quizAnswerSchema), quizController.submitAnswer);

// GET /api/v1/quiz/session/:quizId - Get specific quiz session details
router.get('/session/:quizId', quizController.getQuizSession);

// GET /api/v1/quiz/sessions/:userId - Get all quiz sessions for a user
router.get('/sessions/:userId', quizController.getUserQuizSessions);

// DELETE /api/v1/quiz/:quizId - Delete a quiz session
router.delete('/:quizId', quizController.deleteQuizSession);

module.exports = router;
