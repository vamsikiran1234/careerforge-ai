const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// All career routes require authentication
router.use(authenticateToken);

// ========================================
// CAREER GOALS ROUTES
// ========================================

/**
 * @swagger
 * /career/goals:
 *   post:
 *     summary: Create new career goal
 *     description: Create a new career goal with milestones and track your professional development
 *     tags: [Career]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentRole, targetRole, timeframeMonths]
 *             properties:
 *               currentRole:
 *                 type: string
 *                 example: Student
 *                 description: Your current job role or academic status
 *               currentCompany:
 *                 type: string
 *                 example: University Name
 *               currentLevel:
 *                 type: string
 *                 example: Junior
 *               yearsExperience:
 *                 type: integer
 *                 example: 0
 *               targetRole:
 *                 type: string
 *                 example: Software Engineer
 *                 description: The role you want to achieve
 *               targetCompany:
 *                 type: string
 *                 example: Google
 *               targetLevel:
 *                 type: string
 *                 example: Mid-Level
 *               targetSalary:
 *                 type: number
 *                 example: 120000
 *               timeframeMonths:
 *                 type: integer
 *                 example: 24
 *                 description: Number of months to achieve this goal
 *               notes:
 *                 type: string
 *                 example: Focus on building strong portfolio projects
 *               visibility:
 *                 type: string
 *                 enum: [PRIVATE, PUBLIC, CONNECTIONS]
 *                 default: PRIVATE
 *     responses:
 *       201:
 *         description: Goal created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     goal:
 *                       type: object
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Current role, target role, and timeframe are required
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/goals', careerController.createGoal);

/**
 * @swagger
 * /career/goals:
 *   get:
 *     summary: Get all user's career goals
 *     description: Retrieve all career goals for the authenticated user
 *     tags: [Career]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Goals retrieved successfully
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
 *                     goals:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/goals', careerController.getGoals);

/**
 * @swagger
 * /career/goals/{goalId}:
 *   get:
 *     summary: Get specific goal details
 *     description: Retrieve detailed information about a specific career goal including milestones and progress
 *     tags: [Career]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Goal retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/goals/:goalId', careerController.getGoalById);

/**
 * @swagger
 * /career/goals/{goalId}:
 *   put:
 *     summary: Update career goal
 *     description: Update an existing career goal. All fields are optional.
 *     tags: [Career]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the career goal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentRole:
 *                 type: string
 *                 example: Junior Developer
 *               currentCompany:
 *                 type: string
 *                 example: Startup Inc
 *               targetRole:
 *                 type: string
 *                 example: Android App Developer
 *               targetCompany:
 *                 type: string
 *                 example: Microsoft
 *               timeframeMonths:
 *                 type: integer
 *                 example: 3
 *                 description: Number of months (must be a number, not text like "3 months")
 *               targetSalary:
 *                 type: number
 *                 example: 150000
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Goal updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid data type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: timeframeMonths must be a number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/goals/:goalId', careerController.updateGoal);

/**
 * @swagger
 * /career/goals/{goalId}:
 *   delete:
 *     summary: Delete career goal
 *     description: Permanently delete a career goal
 *     tags: [Career]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Goal deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete('/goals/:goalId', careerController.deleteGoal);

/**
 * @swagger
 * /career/goals/{goalId}/progress:
 *   patch:
 *     summary: Update goal progress
 *     description: Update the completion percentage of a career goal
 *     tags: [Career]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               progress:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 50
 *     responses:
 *       200:
 *         description: Progress updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.patch('/goals/:goalId/progress', careerController.updateGoalProgress);

// ========================================
// MILESTONES ROUTES
// ========================================

/**
 * @swagger
 * /career/goals/{goalId}/milestones:
 *   post:
 *     summary: Add milestone to goal
 *     description: Create a new milestone for tracking progress toward a career goal
 *     tags: [Career]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, deadline]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Complete React course
 *               description:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Milestone created successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/goals/:goalId/milestones', careerController.createMilestone);

/**
 * @swagger
 * /career/goals/{goalId}/milestones:
 *   get:
 *     summary: Get all milestones for a goal
 *     description: Retrieve all milestones associated with a specific career goal
 *     tags: [Career]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Milestones retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/goals/:goalId/milestones', careerController.getMilestones);

/**
 * @swagger
 * /career/goals/{goalId}/milestones/{milestoneId}:
 *   put:
 *     summary: Update milestone
 *     description: Update milestone details
 *     tags: [Career]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: milestoneId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Milestone updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/goals/:goalId/milestones/:milestoneId', careerController.updateMilestone);

/**
 * @swagger
 * /career/goals/{goalId}/milestones/{milestoneId}:
 *   delete:
 *     summary: Delete milestone
 *     description: Remove a milestone from a goal
 *     tags: [Career]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: milestoneId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Milestone deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete('/goals/:goalId/milestones/:milestoneId', careerController.deleteMilestone);

/**
 * @swagger
 * /career/goals/{goalId}/milestones/{milestoneId}/complete:
 *   patch:
 *     summary: Mark milestone as complete
 *     description: Mark a milestone as completed
 *     tags: [Career]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: milestoneId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Milestone marked as complete
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.patch('/goals/:goalId/milestones/:milestoneId/complete', careerController.completeMilestone);

router.patch('/goals/:goalId/milestones/:milestoneId/progress', careerController.updateMilestoneProgress);

// ========================================
// SKILL GAPS ROUTES
// ========================================

/**
 * @swagger
 * /career/goals/{goalId}/skills:
 *   get:
 *     summary: Get all skill gaps
 *     description: Retrieve all identified skill gaps for a career goal
 *     tags: [Career]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Skill gaps retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/goals/:goalId/skills', careerController.getSkillGaps);

/**
 * @swagger
 * /career/goals/{goalId}/skills:
 *   post:
 *     summary: Add skill gap
 *     description: Identify a new skill gap to work on
 *     tags: [Career]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [skillName]
 *             properties:
 *               skillName:
 *                 type: string
 *                 example: React.js
 *               currentLevel:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               targetLevel:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *     responses:
 *       201:
 *         description: Skill gap added successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/goals/:goalId/skills', careerController.createSkillGap);

router.put('/goals/:goalId/skills/:skillId', careerController.updateSkillGap);
router.patch('/goals/:goalId/skills/:skillId/progress', careerController.updateSkillProgress);
router.delete('/goals/:goalId/skills/:skillId', careerController.deleteSkillGap);

// ========================================
// LEARNING RESOURCES ROUTES
// ========================================

/**
 * @swagger
 * /career/goals/{goalId}/resources:
 *   get:
 *     summary: Get all learning resources
 *     description: Retrieve all learning resources for a career goal
 *     tags: [Career]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resources retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/goals/:goalId/resources', careerController.getLearningResources);

/**
 * @swagger
 * /career/goals/{goalId}/resources:
 *   post:
 *     summary: Add learning resource
 *     description: Add a new learning resource (course, book, tutorial) to a goal
 *     tags: [Career]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, type, url]
 *             properties:
 *               title:
 *                 type: string
 *                 example: React - The Complete Guide
 *               type:
 *                 type: string
 *                 enum: [course, book, tutorial, article, video]
 *               url:
 *                 type: string
 *                 example: https://udemy.com/react-course
 *     responses:
 *       201:
 *         description: Resource added successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/goals/:goalId/resources', careerController.createLearningResource);

router.put('/goals/:goalId/resources/:resourceId', careerController.updateLearningResource);
router.patch('/goals/:goalId/resources/:resourceId/status', careerController.updateResourceStatus);
router.delete('/goals/:goalId/resources/:resourceId', careerController.deleteLearningResource);

/**
 * @swagger
 * /career/goals/{goalId}/resources/generate:
 *   post:
 *     summary: Generate AI learning resources
 *     description: Use AI to generate personalized learning resources for a specific skill
 *     tags: [Career]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [skillName]
 *             properties:
 *               skillName:
 *                 type: string
 *                 example: React.js
 *     responses:
 *       200:
 *         description: Resources generated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/goals/:goalId/resources/generate', careerController.generateSkillResources);

// ========================================
// AI ANALYSIS ROUTES
// ========================================

/**
 * @swagger
 * /career/analyze:
 *   post:
 *     summary: AI-powered career path analysis
 *     description: Get AI-powered analysis and recommendations for career development
 *     tags: [Career]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentRole, targetRole]
 *             properties:
 *               currentRole:
 *                 type: string
 *                 example: Junior Developer
 *               targetRole:
 *                 type: string
 *                 example: Senior Software Engineer
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               timeframe:
 *                 type: string
 *                 example: 2 years
 *     responses:
 *       200:
 *         description: Analysis completed successfully
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
 *                     analysis:
 *                       type: string
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
/**
 * @swagger
 * /career/analyze:
 *   post:
 *     summary: AI-powered career path analysis
 *     description: Get AI analysis for transitioning from current role to target role
 *     tags: [Career]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentRole, targetRole]
 *             properties:
 *               currentRole:
 *                 type: string
 *                 example: Student
 *               targetRole:
 *                 type: string
 *                 example: Software Engineer
 *               yearsExperience:
 *                 type: integer
 *                 example: 0
 *               timeframeMonths:
 *                 type: integer
 *                 example: 12
 *     responses:
 *       200:
 *         description: Analysis completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     analysis:
 *                       type: object
 *                       items:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/analyze', careerController.analyzeCareerPath);

/**
 * @swagger
 * /career/goals/{goalId}/suggest:
 *   post:
 *     summary: Get AI suggestions for goal
 *     description: Get AI-powered suggestions and improvements for an existing goal
 *     tags: [Career]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *         description: The goal ID
 *     responses:
 *       200:
 *         description: Suggestions generated
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/goals/:goalId/suggest', careerController.getAISuggestions);

/**
 * @swagger
 * /career/goals/{goalId}/generate:
 *   post:
 *     summary: Generate complete AI trajectory
 *     description: Generate comprehensive AI-powered career trajectory including milestones, skill gaps, and learning resources
 *     tags: [Career]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema:
 *           type: string
 *         description: The goal ID to generate trajectory for
 *     responses:
 *       200:
 *         description: Trajectory generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     trajectory:
 *                       type: object
 *                       properties:
 *                         analysis:
 *                           type: object
 *                           description: AI feasibility and success analysis
 *                         milestones:
 *                           type: array
 *                           description: Generated career milestones
 *                         skillGaps:
 *                           type: array
 *                           description: Identified skill gaps
 *                         learningResources:
 *                           type: array
 *                           description: Recommended learning resources
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/goals/:goalId/generate', careerController.generateTrajectory);

// ========================================
// STATISTICS & OVERVIEW ROUTES
// ========================================

// Get career dashboard overview
router.get('/overview', careerController.getCareerOverview);

// Get progress statistics
router.get('/stats', careerController.getCareerStats);

module.exports = router;
