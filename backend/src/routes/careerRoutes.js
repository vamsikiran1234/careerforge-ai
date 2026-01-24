const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// All career routes require authentication
router.use(authenticateToken);

// ========================================
// CAREER GOALS ROUTES
// ========================================

// Create new career goal
router.post('/goals', careerController.createGoal);

// Get all user's goals
router.get('/goals', careerController.getGoals);

// Get specific goal with all relations
router.get('/goals/:goalId', careerController.getGoalById);

// Update goal
router.put('/goals/:goalId', careerController.updateGoal);

// Delete goal
router.delete('/goals/:goalId', careerController.deleteGoal);

// Update goal progress
router.patch('/goals/:goalId/progress', careerController.updateGoalProgress);

// ========================================
// MILESTONES ROUTES
// ========================================

// Add milestone to goal
router.post('/goals/:goalId/milestones', careerController.createMilestone);

// Get all milestones for a goal
router.get('/goals/:goalId/milestones', careerController.getMilestones);

// Update milestone
router.put('/goals/:goalId/milestones/:milestoneId', careerController.updateMilestone);

// Delete milestone
router.delete('/goals/:goalId/milestones/:milestoneId', careerController.deleteMilestone);

// Mark milestone as complete
router.patch('/goals/:goalId/milestones/:milestoneId/complete', careerController.completeMilestone);

// Update milestone progress
router.patch('/goals/:goalId/milestones/:milestoneId/progress', careerController.updateMilestoneProgress);

// ========================================
// SKILL GAPS ROUTES
// ========================================

// Get all skill gaps for a goal
router.get('/goals/:goalId/skills', careerController.getSkillGaps);

// Add skill gap
router.post('/goals/:goalId/skills', careerController.createSkillGap);

// Update skill gap
router.put('/goals/:goalId/skills/:skillId', careerController.updateSkillGap);

// Update skill progress
router.patch('/goals/:goalId/skills/:skillId/progress', careerController.updateSkillProgress);

// Delete skill gap
router.delete('/goals/:goalId/skills/:skillId', careerController.deleteSkillGap);

// ========================================
// LEARNING RESOURCES ROUTES
// ========================================

// Get all resources for a goal
router.get('/goals/:goalId/resources', careerController.getLearningResources);

// Add learning resource
router.post('/goals/:goalId/resources', careerController.createLearningResource);

// Update resource
router.put('/goals/:goalId/resources/:resourceId', careerController.updateLearningResource);

// Update resource status
router.patch('/goals/:goalId/resources/:resourceId/status', careerController.updateResourceStatus);

// Delete resource
router.delete('/goals/:goalId/resources/:resourceId', careerController.deleteLearningResource);

// Generate resources for a specific skill
router.post('/goals/:goalId/resources/generate', careerController.generateSkillResources);

// ========================================
// AI ANALYSIS ROUTES
// ========================================

// AI-powered career path analysis
router.post('/analyze', careerController.analyzeCareerPath);

// Get AI suggestions for a specific goal
router.post('/goals/:goalId/suggest', careerController.getAISuggestions);

// Generate complete trajectory with AI
router.post('/goals/:goalId/generate', careerController.generateTrajectory);

// ========================================
// STATISTICS & OVERVIEW ROUTES
// ========================================

// Get career dashboard overview
router.get('/overview', careerController.getCareerOverview);

// Get progress statistics
router.get('/stats', careerController.getCareerStats);

module.exports = router;
