const express = require('express');
const mentorController = require('../controllers/mentorController');
const { validate, mentorQuerySchema } = require('../middlewares/validation');

const router = express.Router();

// Mentor CRUD operations
// GET /api/v1/mentors - Get all mentors (with filtering)
router.get('/', mentorController.getAllMentors);

// GET /api/v1/mentors/:id - Get specific mentor
router.get('/:id', mentorController.getMentorById);

// POST /api/v1/mentors - Create new mentor
router.post('/', mentorController.createMentor);

// PUT /api/v1/mentors/:id - Update mentor
router.put('/:id', mentorController.updateMentor);

// DELETE /api/v1/mentors/:id - Delete mentor
router.delete('/:id', mentorController.deleteMentor);

// POST /api/v1/mentors/match - Find mentor matches based on criteria
router.post('/match', mentorController.findMentorMatches);

// Original mentor query system routes
// POST /api/v1/mentors/query - Submit question for mentor matching
router.post('/query', validate(mentorQuerySchema), mentorController.submitQuery);

// GET /api/v1/mentors/question/:questionId/match - Find matching mentors for a question
router.get('/question/:questionId/match', mentorController.findMatches);

// GET /api/v1/mentors/domains - Get available mentor domains
router.get('/domains', mentorController.getAvailableDomains);

// GET /api/v1/mentors/search - Advanced mentor search
router.get('/search', mentorController.searchMentors);

// GET /api/v1/mentors/user/:userId/questions - Get user's submitted questions
router.get('/user/:userId/questions', mentorController.getUserQuestions);

// PUT /api/v1/mentors/question/:questionId/deactivate - Deactivate a question
router.put('/question/:questionId/deactivate', mentorController.deactivateQuestion);

module.exports = router;
