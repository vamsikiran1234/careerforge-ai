const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const careerAnalysisService = require('../services/careerAnalysisService');

// HTTP Status Codes
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_CREATED = 201;
const HTTP_STATUS_BAD_REQUEST = 400;
const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_ERROR = 500;

// ========================================
// HELPER FUNCTIONS
// ========================================

// Verify goal ownership
async function verifyGoalOwnership(goalId, userId) {
  const goal = await prisma.careerGoal.findFirst({
    where: { id: goalId, userId }
  });
  
  if (!goal) {
    throw new Error('Goal not found or access denied');
  }
  
  return goal;
}

// Calculate goal progress based on milestones
async function calculateGoalProgress(goalId) {
  const milestones = await prisma.milestone.findMany({
    where: { goalId }
  });
  
  if (milestones.length === 0) return 0;
  
  const totalProgress = milestones.reduce((sum, milestone) => sum + milestone.progress, 0);
  return Math.round(totalProgress / milestones.length);
}

// ========================================
// CAREER GOALS CONTROLLERS
// ========================================

// Create new career goal
exports.createGoal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      currentRole,
      currentCompany,
      currentLevel,
      yearsExperience,
      targetRole,
      targetCompany,
      targetLevel,
      targetSalary,
      timeframeMonths,
      notes,
      visibility
    } = req.body;

    // Validate required fields
    if (!currentRole || !targetRole || !timeframeMonths) {
      return res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: 'Current role, target role, and timeframe are required'
      });
    }

    // Calculate target date
    const startDate = new Date();
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + parseInt(timeframeMonths));

    // Create career goal
    const goal = await prisma.careerGoal.create({
      data: {
        userId,
        currentRole,
        currentCompany,
        currentLevel,
        yearsExperience: yearsExperience ? parseInt(yearsExperience) : null,
        targetRole,
        targetCompany,
        targetLevel,
        targetSalary: targetSalary ? parseFloat(targetSalary) : null,
        timeframeMonths: parseInt(timeframeMonths),
        startDate,
        targetDate,
        notes,
        visibility: visibility || 'PRIVATE'
      }
    });

    console.log(`✅ Created career goal: ${goal.id} for user: ${userId}`);

    return res.status(HTTP_STATUS_CREATED).json({
      success: true,
      data: { goal }
    });
  } catch (error) {
    console.error('❌ Error creating goal:', error);
    return res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to create career goal',
      details: error.message
    });
  }
};

// Get all user's goals
exports.getGoals = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status } = req.query;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const goals = await prisma.careerGoal.findMany({
      where,
      include: {
        milestones: {
          orderBy: { order: 'asc' }
        },
        skillGaps: {
          orderBy: { priority: 'desc' }
        },
        _count: {
          select: {
            milestones: true,
            skillGaps: true,
            learningResources: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { goals }
    });
  } catch (error) {
    console.error('❌ Error fetching goals:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to fetch career goals',
      details: error.message
    });
  }
};

// Get specific goal by ID
exports.getGoalById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId } = req.params;

    const goal = await prisma.careerGoal.findFirst({
      where: { id: goalId, userId },
      include: {
        milestones: {
          orderBy: { order: 'asc' }
        },
        skillGaps: {
          orderBy: { priority: 'desc' }
        },
        learningResources: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!goal) {
      return res.status(HTTP_STATUS_NOT_FOUND).json({
        success: false,
        error: 'Goal not found'
      });
    }

    return res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { goal }
    });
  } catch (error) {
    console.error('❌ Error fetching goal:', error);
    return res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to fetch goal',
      details: error.message
    });
  }
};

// Update goal
exports.updateGoal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId } = req.params;

    // Verify ownership
    await verifyGoalOwnership(goalId, userId);

    const updateData = { ...req.body };
    
    // Parse numeric fields to ensure correct types
    if (updateData.timeframeMonths) {
      updateData.timeframeMonths = parseInt(updateData.timeframeMonths);
    }
    if (updateData.yearsExperience) {
      updateData.yearsExperience = parseInt(updateData.yearsExperience);
    }
    if (updateData.targetSalary) {
      updateData.targetSalary = parseFloat(updateData.targetSalary);
    }
    
    // Handle target date recalculation if timeframe changes
    if (updateData.timeframeMonths) {
      const goal = await prisma.careerGoal.findUnique({
        where: { id: goalId }
      });
      
      const targetDate = new Date(goal.startDate);
      targetDate.setMonth(targetDate.getMonth() + updateData.timeframeMonths);
      updateData.targetDate = targetDate;
    }

    const updatedGoal = await prisma.careerGoal.update({
      where: { id: goalId },
      data: updateData,
      include: {
        milestones: true,
        skillGaps: true,
        learningResources: true
      }
    });

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { goal: updatedGoal }
    });
  } catch (error) {
    console.error('❌ Error updating goal:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to update goal',
      details: error.message
    });
  }
};

// Delete goal
exports.deleteGoal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId } = req.params;

    // Verify ownership
    await verifyGoalOwnership(goalId, userId);

    await prisma.careerGoal.delete({
      where: { id: goalId }
    });

    console.log(`✅ Deleted goal: ${goalId}`);

    res.status(HTTP_STATUS_OK).json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting goal:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to delete goal',
      details: error.message
    });
  }
};

// Update goal progress
exports.updateGoalProgress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId } = req.params;
    const { progress } = req.body;

    // Verify ownership
    await verifyGoalOwnership(goalId, userId);

    // Validate progress
    const progressValue = parseInt(progress);
    if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
      return res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: 'Progress must be between 0 and 100'
      });
    }

    const updateData = { progress: progressValue };
    
    // If progress is 100%, mark as achieved
    if (progressValue === 100) {
      updateData.status = 'ACHIEVED';
      updateData.achievedAt = new Date();
    }

    const updatedGoal = await prisma.careerGoal.update({
      where: { id: goalId },
      data: updateData
    });

    return res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { goal: updatedGoal }
    });
  } catch (error) {
    console.error('❌ Error updating goal progress:', error);
    return res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to update progress',
      details: error.message
    });
  }
};

// ========================================
// MILESTONES CONTROLLERS
// ========================================

// Create milestone
exports.createMilestone = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId } = req.params;
    const {
      title,
      description,
      category,
      targetDate,
      priority,
      estimatedHours,
      aiSuggested,
      aiGuidance
    } = req.body;

    // Verify goal ownership
    await verifyGoalOwnership(goalId, userId);

    // Validate required fields
    if (!title || !category || !targetDate) {
      return res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: 'Title, category, and target date are required'
      });
    }

    // Get next order number
    const lastMilestone = await prisma.milestone.findFirst({
      where: { goalId },
      orderBy: { order: 'desc' }
    });
    const order = lastMilestone ? lastMilestone.order + 1 : 0;

    const milestone = await prisma.milestone.create({
      data: {
        goalId,
        title,
        description,
        category,
        targetDate: new Date(targetDate),
        priority: priority || 'MEDIUM',
        estimatedHours: estimatedHours ? parseInt(estimatedHours) : null,
        order,
        aiSuggested: aiSuggested || false,
        aiGuidance
      }
    });

    console.log(`✅ Created milestone: ${milestone.id} for goal: ${goalId}`);

    res.status(HTTP_STATUS_CREATED).json({
      success: true,
      data: { milestone }
    });
  } catch (error) {
    console.error('❌ Error creating milestone:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to create milestone',
      details: error.message
    });
  }
};

// Get milestones
exports.getMilestones = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId } = req.params;
    const { status } = req.query;

    // Verify goal ownership
    await verifyGoalOwnership(goalId, userId);

    const where = { goalId };
    if (status) {
      where.status = status;
    }

    const milestones = await prisma.milestone.findMany({
      where,
      orderBy: { order: 'asc' }
    });

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { milestones }
    });
  } catch (error) {
    console.error('❌ Error fetching milestones:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to fetch milestones',
      details: error.message
    });
  }
};

// Update milestone
exports.updateMilestone = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId, milestoneId } = req.params;

    // Verify goal ownership
    await verifyGoalOwnership(goalId, userId);

    const updateData = { ...req.body };

    const milestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: updateData
    });

    // Recalculate goal progress
    const newProgress = await calculateGoalProgress(goalId);
    await prisma.careerGoal.update({
      where: { id: goalId },
      data: { progress: newProgress }
    });

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { milestone }
    });
  } catch (error) {
    console.error('❌ Error updating milestone:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to update milestone',
      details: error.message
    });
  }
};

// Complete milestone
exports.completeMilestone = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId, milestoneId } = req.params;
    const { evidence } = req.body;

    // Verify goal ownership
    await verifyGoalOwnership(goalId, userId);

    const milestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        completedAt: new Date(),
        evidence
      }
    });

    // Recalculate goal progress
    const newProgress = await calculateGoalProgress(goalId);
    await prisma.careerGoal.update({
      where: { id: goalId },
      data: { progress: newProgress }
    });

    console.log(`✅ Completed milestone: ${milestoneId}`);

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { milestone }
    });
  } catch (error) {
    console.error('❌ Error completing milestone:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to complete milestone',
      details: error.message
    });
  }
};

// Update milestone progress
exports.updateMilestoneProgress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId, milestoneId } = req.params;
    const { progress } = req.body;

    // Verify goal ownership
    await verifyGoalOwnership(goalId, userId);

    const progressValue = parseInt(progress);
    if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
      return res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: 'Progress must be between 0 and 100'
      });
    }

    const updateData = { progress: progressValue };
    
    // Update status based on progress
    if (progressValue === 0) {
      updateData.status = 'NOT_STARTED';
    } else if (progressValue > 0 && progressValue < 100) {
      updateData.status = 'IN_PROGRESS';
    } else if (progressValue === 100) {
      updateData.status = 'COMPLETED';
      updateData.completedAt = new Date();
    }

    const milestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: updateData
    });

    // Recalculate goal progress
    const newProgress = await calculateGoalProgress(goalId);
    await prisma.careerGoal.update({
      where: { id: goalId },
      data: { progress: newProgress }
    });

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { milestone }
    });
  } catch (error) {
    console.error('❌ Error updating milestone progress:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to update progress',
      details: error.message
    });
  }
};

// Delete milestone
exports.deleteMilestone = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId, milestoneId } = req.params;

    // Verify goal ownership
    await verifyGoalOwnership(goalId, userId);

    await prisma.milestone.delete({
      where: { id: milestoneId }
    });

    // Recalculate goal progress
    const newProgress = await calculateGoalProgress(goalId);
    await prisma.careerGoal.update({
      where: { id: goalId },
      data: { progress: newProgress }
    });

    console.log(`✅ Deleted milestone: ${milestoneId}`);

    res.status(HTTP_STATUS_OK).json({
      success: true,
      message: 'Milestone deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting milestone:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to delete milestone',
      details: error.message
    });
  }
};

// ========================================
// SKILL GAPS CONTROLLERS
// ========================================

// Get skill gaps
exports.getSkillGaps = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId } = req.params;

    // Verify goal ownership
    await verifyGoalOwnership(goalId, userId);

    const skillGaps = await prisma.skillGap.findMany({
      where: { goalId },
      orderBy: [
        { priority: 'desc' },
        { gap: 'desc' }
      ]
    });

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { skillGaps }
    });
  } catch (error) {
    console.error('❌ Error fetching skill gaps:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to fetch skill gaps',
      details: error.message
    });
  }
};

// Create skill gap
exports.createSkillGap = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId } = req.params;
    const {
      skillName,
      category,
      currentLevel,
      targetLevel,
      priority,
      estimatedWeeks,
      learningStrategy
    } = req.body;

    // Verify goal ownership
    await verifyGoalOwnership(goalId, userId);

    // Validate required fields
    if (!skillName || !category || targetLevel === undefined) {
      return res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: 'Skill name, category, and target level are required'
      });
    }

    const currentLevelValue = currentLevel !== undefined ? parseInt(currentLevel) : 0;
    const targetLevelValue = parseInt(targetLevel);
    const gap = targetLevelValue - currentLevelValue;

    const skillGap = await prisma.skillGap.create({
      data: {
        goalId,
        skillName,
        category,
        currentLevel: currentLevelValue,
        targetLevel: targetLevelValue,
        gap,
        priority: priority || 'MEDIUM',
        estimatedWeeks: estimatedWeeks ? parseInt(estimatedWeeks) : null,
        learningStrategy
      }
    });

    console.log(`✅ Created skill gap: ${skillGap.id} for goal: ${goalId}`);

    res.status(HTTP_STATUS_CREATED).json({
      success: true,
      data: { skillGap }
    });
  } catch (error) {
    console.error('❌ Error creating skill gap:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to create skill gap',
      details: error.message
    });
  }
};

// Update skill gap
exports.updateSkillGap = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId, skillId } = req.params;

    // Verify goal ownership
    await verifyGoalOwnership(goalId, userId);

    const updateData = { ...req.body };
    
    // Recalculate gap if levels changed
    if (updateData.currentLevel !== undefined || updateData.targetLevel !== undefined) {
      const skill = await prisma.skillGap.findUnique({
        where: { id: skillId }
      });
      
      const currentLevel = updateData.currentLevel !== undefined 
        ? parseInt(updateData.currentLevel) 
        : skill.currentLevel;
      const targetLevel = updateData.targetLevel !== undefined 
        ? parseInt(updateData.targetLevel) 
        : skill.targetLevel;
      
      updateData.gap = targetLevel - currentLevel;
    }

    const skillGap = await prisma.skillGap.update({
      where: { id: skillId },
      data: updateData
    });

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { skillGap }
    });
  } catch (error) {
    console.error('❌ Error updating skill gap:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to update skill gap',
      details: error.message
    });
  }
};

// Update skill progress
exports.updateSkillProgress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId, skillId } = req.params;
    const { progress, currentLevel } = req.body;

    // Verify goal ownership
    await verifyGoalOwnership(goalId, userId);

    const updateData = { lastPracticed: new Date() };
    
    if (progress !== undefined) {
      const progressValue = parseInt(progress);
      if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
        return res.status(HTTP_STATUS_BAD_REQUEST).json({
          success: false,
          error: 'Progress must be between 0 and 100'
        });
      }
      updateData.progress = progressValue;
      
      // Update status based on progress
      if (progressValue >= 90) {
        updateData.status = 'PROFICIENT';
      } else if (progressValue > 0) {
        updateData.status = 'LEARNING';
      }
    }

    if (currentLevel !== undefined) {
      const skill = await prisma.skillGap.findUnique({
        where: { id: skillId }
      });
      
      updateData.currentLevel = parseInt(currentLevel);
      updateData.gap = skill.targetLevel - parseInt(currentLevel);
    }

    const skillGap = await prisma.skillGap.update({
      where: { id: skillId },
      data: updateData
    });

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { skillGap }
    });
  } catch (error) {
    console.error('❌ Error updating skill progress:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to update skill progress',
      details: error.message
    });
  }
};

// Delete skill gap
exports.deleteSkillGap = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId, skillId } = req.params;

    // Verify goal ownership
    await verifyGoalOwnership(goalId, userId);

    await prisma.skillGap.delete({
      where: { id: skillId }
    });

    console.log(`✅ Deleted skill gap: ${skillId}`);

    res.status(HTTP_STATUS_OK).json({
      success: true,
      message: 'Skill gap deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting skill gap:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to delete skill gap',
      details: error.message
    });
  }
};

// ========================================
// LEARNING RESOURCES CONTROLLERS
// ========================================

// Get learning resources
exports.getLearningResources = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId } = req.params;
    const { status, type } = req.query;

    // Verify goal ownership
    await verifyGoalOwnership(goalId, userId);

    const where = { goalId };
    if (status) where.status = status;
    if (type) where.type = type;

    const resources = await prisma.learningResource.findMany({
      where,
      orderBy: [
        { relevanceScore: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { resources }
    });
  } catch (error) {
    console.error('❌ Error fetching resources:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to fetch learning resources',
      details: error.message
    });
  }
};

// Create learning resource
exports.createLearningResource = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId } = req.params;
    const {
      title,
      type,
      url,
      platform,
      duration,
      cost,
      difficulty,
      rating,
      skillGapId,
      aiRecommended,
      relevanceScore
    } = req.body;

    // Verify goal ownership
    await verifyGoalOwnership(goalId, userId);

    // Validate required fields
    if (!title || !type) {
      return res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: 'Title and type are required'
      });
    }

    const resource = await prisma.learningResource.create({
      data: {
        goalId,
        skillGapId,
        title,
        type,
        url,
        platform,
        duration,
        cost: cost ? parseFloat(cost) : null,
        difficulty,
        rating: rating ? parseFloat(rating) : null,
        aiRecommended: aiRecommended || false,
        relevanceScore: relevanceScore ? parseFloat(relevanceScore) : null
      }
    });

    console.log(`✅ Created learning resource: ${resource.id}`);

    res.status(HTTP_STATUS_CREATED).json({
      success: true,
      data: { resource }
    });
  } catch (error) {
    console.error('❌ Error creating resource:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to create learning resource',
      details: error.message
    });
  }
};

// Update learning resource
exports.updateLearningResource = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId, resourceId } = req.params;

    // Verify goal ownership
    await verifyGoalOwnership(goalId, userId);

    const resource = await prisma.learningResource.update({
      where: { id: resourceId },
      data: req.body
    });

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { resource }
    });
  } catch (error) {
    console.error('❌ Error updating resource:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to update learning resource',
      details: error.message
    });
  }
};

// Update resource status
exports.updateResourceStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId, resourceId } = req.params;
    const { status } = req.body;

    // Verify goal ownership
    await verifyGoalOwnership(goalId, userId);

    const updateData = { status };
    
    // Set timestamps based on status
    if (status === 'IN_PROGRESS' && !await prisma.learningResource.findFirst({
      where: { id: resourceId, startedAt: { not: null } }
    })) {
      updateData.startedAt = new Date();
    } else if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const resource = await prisma.learningResource.update({
      where: { id: resourceId },
      data: updateData
    });

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { resource }
    });
  } catch (error) {
    console.error('❌ Error updating resource status:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to update resource status',
      details: error.message
    });
  }
};

// Delete learning resource
exports.deleteLearningResource = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId, resourceId } = req.params;

    // Verify goal ownership
    await verifyGoalOwnership(goalId, userId);

    await prisma.learningResource.delete({
      where: { id: resourceId }
    });

    console.log(`✅ Deleted learning resource: ${resourceId}`);

    res.status(HTTP_STATUS_OK).json({
      success: true,
      message: 'Learning resource deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting resource:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to delete learning resource',
      details: error.message
    });
  }
};

// Generate learning resources for a specific skill
exports.generateSkillResources = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId } = req.params;
    const { skillName, skillNames } = req.body;

    console.log(`🎯 Generating resources for skill: ${skillName || skillNames}`);

    // Verify goal ownership
    const goal = await verifyGoalOwnership(goalId, userId);

    // Get the skills to generate resources for
    const skills = skillNames || (skillName ? [skillName] : []);
    
    if (skills.length === 0) {
      return res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: 'skillName or skillNames is required'
      });
    }

    // Call AI service to generate resources
    const careerAnalysisService = require('../services/careerAnalysisService');
    const resources = await careerAnalysisService.recommendLearningResources({
      skills,
      targetRole: goal.targetRole,
      budget: 'free'
    });

    console.log(`✅ Generated ${resources.length} resources for skills: ${skills.join(', ')}`);

    // Save resources to database
    const savedResources = [];
    for (const resource of resources) {
      try {
        // Check if resource already exists (by URL)
        const existing = await prisma.learningResource.findFirst({
          where: {
            goalId,
            url: resource.url
          }
        });

        if (existing) {
          console.log(`⚠️ Resource already exists: ${resource.title}`);
          savedResources.push(existing);
          continue;
        }

        const saved = await prisma.learningResource.create({
          data: {
            goalId,
            title: resource.title,
            type: resource.type || 'COURSE',
            url: resource.url,
            platform: resource.platform,
            duration: resource.duration,
            cost: resource.cost !== undefined ? parseFloat(resource.cost) : null,
            difficulty: resource.difficulty,
            rating: resource.rating,
            status: 'RECOMMENDED',
            aiRecommended: true,
            relevanceScore: resource.relevanceScore,
            relatedSkills: resource.relatedSkills || skills
          }
        });

        savedResources.push(saved);
        console.log(`✅ Saved resource: ${saved.title}`);
      } catch (saveError) {
        console.error(`❌ Failed to save resource: ${resource.title}`, saveError);
      }
    }

    console.log(`✅ Successfully saved ${savedResources.length} resources to database`);

    res.status(HTTP_STATUS_CREATED).json({
      success: true,
      message: `Generated ${savedResources.length} learning resources for ${skills.join(', ')}`,
      resources: savedResources,
      count: savedResources.length
    });

  } catch (error) {
    console.error('❌ Error generating skill resources:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to generate learning resources',
      details: error.message
    });
  }
};

// ========================================
// AI ANALYSIS CONTROLLERS
// ========================================

// AI-powered career path analysis
exports.analyzeCareerPath = async (req, res) => {
  try {
    const { currentRole, targetRole, yearsExperience, timeframeMonths } = req.body;

    if (!currentRole || !targetRole) {
      return res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: 'Current role and target role are required'
      });
    }

    console.log('🤖 Analyzing career path with AI...');

    const analysis = await careerAnalysisService.analyzeCareerPath({
      currentRole,
      targetRole,
      yearsExperience: yearsExperience || 0,
      timeframeMonths: timeframeMonths || 12
    });

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { analysis }
    });
  } catch (error) {
    console.error('❌ Error analyzing career path:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to analyze career path',
      details: error.message
    });
  }
};

// Get AI suggestions for goal
exports.getAISuggestions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId } = req.params;

    // Verify goal ownership and get goal with relations
    const goal = await prisma.careerGoal.findFirst({
      where: { id: goalId, userId },
      include: {
        milestones: true,
        skillGaps: true
      }
    });

    if (!goal) {
      return res.status(HTTP_STATUS_NOT_FOUND).json({
        success: false,
        error: 'Goal not found'
      });
    }

    console.log('🤖 Getting AI suggestions for goal...');

    const suggestions = await careerAnalysisService.getGoalSuggestions(goal);

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    console.error('❌ Error getting AI suggestions:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to get AI suggestions',
      details: error.message
    });
  }
};

// Generate complete trajectory
exports.generateTrajectory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goalId } = req.params;

    // Verify goal ownership
    const goal = await verifyGoalOwnership(goalId, userId);

    console.log('🤖 Generating complete trajectory with AI...');

    const trajectory = await careerAnalysisService.generateCompleteTrajectory(goal);

    // Save AI-generated milestones and skills
    if (trajectory.milestones && trajectory.milestones.length > 0) {
      await Promise.all(trajectory.milestones.map((milestone, index) => 
        prisma.milestone.create({
          data: {
            goalId,
            title: milestone.title,
            description: milestone.description,
            category: milestone.category,
            targetDate: new Date(milestone.targetDate),
            priority: milestone.priority || 'MEDIUM',
            order: index,
            aiSuggested: true,
            aiGuidance: JSON.stringify(milestone.guidance || {})
          }
        })
      ));
    }

    if (trajectory.skillGaps && trajectory.skillGaps.length > 0) {
      await Promise.all(trajectory.skillGaps.map(skill => 
        prisma.skillGap.create({
          data: {
            goalId,
            skillName: skill.skillName,
            category: skill.category,
            currentLevel: skill.currentLevel || 0,
            targetLevel: skill.targetLevel,
            gap: (skill.targetLevel - (skill.currentLevel || 0)),
            priority: skill.priority || 'MEDIUM',
            estimatedWeeks: skill.estimatedWeeks
          }
        })
      ));
    }

    // Save AI-generated learning resources
    if (trajectory.learningResources && trajectory.learningResources.length > 0) {
      await Promise.all(trajectory.learningResources.map(resource => 
        prisma.learningResource.create({
          data: {
            goalId,
            title: resource.title,
            type: resource.type || 'COURSE',
            url: resource.url,
            platform: resource.platform,
            duration: resource.duration,
            cost: resource.cost !== undefined ? parseFloat(resource.cost) : null,
            difficulty: resource.difficulty,
            rating: resource.rating,
            status: 'RECOMMENDED',
            aiRecommended: true,
            relevanceScore: resource.relevanceScore
          }
        })
      ));
      console.log(`✅ Saved ${trajectory.learningResources.length} learning resources to database`);
    }

    // Update goal with AI analysis
    await prisma.careerGoal.update({
      where: { id: goalId },
      data: {
        aiGenerated: true,
        aiAnalysis: JSON.stringify(trajectory.analysis || {})
      }
    });

    console.log('✅ Trajectory generated successfully');

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { trajectory }
    });
  } catch (error) {
    console.error('❌ Error generating trajectory:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to generate trajectory',
      details: error.message
    });
  }
};

// ========================================
// STATISTICS & OVERVIEW CONTROLLERS
// ========================================

// Get career overview
exports.getCareerOverview = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [activeGoals, totalMilestones, completedMilestones, skillsLearning] = await Promise.all([
      prisma.careerGoal.count({
        where: { userId, status: 'ACTIVE' }
      }),
      prisma.milestone.count({
        where: {
          goal: { userId }
        }
      }),
      prisma.milestone.count({
        where: {
          goal: { userId },
          status: 'COMPLETED'
        }
      }),
      prisma.skillGap.count({
        where: {
          goal: { userId },
          status: 'LEARNING'
        }
      })
    ]);

    const overview = {
      activeGoals,
      totalMilestones,
      completedMilestones,
      skillsLearning,
      completionRate: totalMilestones > 0 
        ? Math.round((completedMilestones / totalMilestones) * 100) 
        : 0
    };

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { overview }
    });
  } catch (error) {
    console.error('❌ Error fetching career overview:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to fetch career overview',
      details: error.message
    });
  }
};

// Get career statistics
exports.getCareerStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const goals = await prisma.careerGoal.findMany({
      where: { userId },
      include: {
        milestones: true,
        skillGaps: true,
        learningResources: true
      }
    });

    const stats = {
      totalGoals: goals.length,
      activeGoals: goals.filter(g => g.status === 'ACTIVE').length,
      achievedGoals: goals.filter(g => g.status === 'ACHIEVED').length,
      totalProgress: goals.length > 0 
        ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) 
        : 0,
      milestones: {
        total: goals.reduce((sum, g) => sum + g.milestones.length, 0),
        completed: goals.reduce((sum, g) => 
          sum + g.milestones.filter(m => m.status === 'COMPLETED').length, 0
        ),
        inProgress: goals.reduce((sum, g) => 
          sum + g.milestones.filter(m => m.status === 'IN_PROGRESS').length, 0
        )
      },
      skills: {
        total: goals.reduce((sum, g) => sum + g.skillGaps.length, 0),
        proficient: goals.reduce((sum, g) => 
          sum + g.skillGaps.filter(s => s.status === 'PROFICIENT').length, 0
        ),
        learning: goals.reduce((sum, g) => 
          sum + g.skillGaps.filter(s => s.status === 'LEARNING').length, 0
        )
      },
      resources: {
        total: goals.reduce((sum, g) => sum + g.learningResources.length, 0),
        completed: goals.reduce((sum, g) => 
          sum + g.learningResources.filter(r => r.status === 'COMPLETED').length, 0
        ),
        inProgress: goals.reduce((sum, g) => 
          sum + g.learningResources.filter(r => r.status === 'IN_PROGRESS').length, 0
        )
      }
    };

    res.status(HTTP_STATUS_OK).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('❌ Error fetching career stats:', error);
    res.status(HTTP_STATUS_ERROR).json({
      success: false,
      error: 'Failed to fetch career statistics',
      details: error.message
    });
  }
};
