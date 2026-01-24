const { prisma } = require('../config/database');

const quizUtils = {
  // Calculate quiz completion percentage
  calculateProgress: (currentStage, questionsAnswered = 0) => {
    const stageOrder = ['SKILLS_ASSESSMENT', 'CAREER_INTERESTS', 'PERSONALITY_TRAITS', 'LEARNING_STYLE', 'CAREER_GOALS'];
    const questionsPerStage = { SKILLS_ASSESSMENT: 4, CAREER_INTERESTS: 3, PERSONALITY_TRAITS: 3, LEARNING_STYLE: 2, CAREER_GOALS: 3 };
    
    const currentStageIndex = stageOrder.indexOf(currentStage);
    if (currentStageIndex === -1) return 0;
    
    let totalQuestions = 0;
    let completedQuestions = 0;
    
    // Add completed stages
    for (let i = 0; i < currentStageIndex; i++) {
      totalQuestions += questionsPerStage[stageOrder[i]];
      completedQuestions += questionsPerStage[stageOrder[i]];
    }
    
    // Add current stage
    totalQuestions += questionsPerStage[currentStage] || 0;
    completedQuestions += Math.min(questionsAnswered, questionsPerStage[currentStage] || 0);
    
    // Add remaining stages
    for (let i = currentStageIndex + 1; i < stageOrder.length; i++) {
      totalQuestions += questionsPerStage[stageOrder[i]];
    }
    
    return Math.round((completedQuestions / totalQuestions) * 100);
  },

  // Get stage information
  getStageInfo: (stage) => {
    const stageDetails = {
      'SKILLS_ASSESSMENT': {
        name: 'Skills Assessment',
        description: 'Evaluate your technical and soft skills',
        icon: '🛠️',
        order: 1,
        totalQuestions: 4,
      },
      'CAREER_INTERESTS': {
        name: 'Career Interests',
        description: 'Discover your professional interests and values',
        icon: '💼',
        order: 2,
        totalQuestions: 3,
      },
      'PERSONALITY_TRAITS': {
        name: 'Personality Traits',
        description: 'Understand your work style and preferences',
        icon: '🧠',
        order: 3,
        totalQuestions: 3,
      },
      'LEARNING_STYLE': {
        name: 'Learning Style',
        description: 'Identify how you learn and grow best',
        icon: '📚',
        order: 4,
        totalQuestions: 2,
      },
      'CAREER_GOALS': {
        name: 'Career Goals',
        description: 'Define your professional aspirations',
        icon: '🎯',
        order: 5,
        totalQuestions: 3,
      },
      'COMPLETED': {
        name: 'Completed',
        description: 'Quiz completed successfully',
        icon: '✅',
        order: 6,
        totalQuestions: 0,
      },
    };

    return stageDetails[stage] || null;
  },

  // Validate quiz answer
  validateAnswer: (answer, options = []) => {
    if (!answer || typeof answer !== 'string') {
      return { valid: false, error: 'Answer must be a non-empty string' };
    }

    if (answer.length > 500) {
      return { valid: false, error: 'Answer is too long (max 500 characters)' };
    }

    if (options.length > 0 && !options.includes(answer)) {
      return { valid: false, error: 'Answer must be one of the provided options' };
    }

    return { valid: true };
  },

  // Generate quiz summary
  generateQuizSummary: async (sessionId) => {
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        quizQuestions: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    // Parse answers from JSON string
    const answers = typeof session.answers === 'string' 
      ? JSON.parse(session.answers || '{}')
      : (session.answers || {});
    const totalAnswers = Object.values(answers).flat().length;
    const expectedAnswers = 15; // Total questions across all stages

    const stageProgress = Object.keys(answers).map(stage => ({
      stage,
      ...quizUtils.getStageInfo(stage),
      answersGiven: answers[stage]?.length || 0,
      isComplete: answers[stage]?.length >= (quizUtils.getStageInfo(stage)?.totalQuestions || 0),
    }));

    return {
      sessionId,
      user: session.user,
      startedAt: session.createdAt,
      completedAt: session.completedAt,
      isComplete: !!session.completedAt,
      currentStage: session.currentStage,
      totalAnswers,
      expectedAnswers,
      completionPercentage: Math.round((totalAnswers / expectedAnswers) * 100),
      stageProgress,
      results: session.results,
      duration: session.completedAt ? 
        Math.round((new Date(session.completedAt) - new Date(session.createdAt)) / 1000 / 60) : 
        null, // Duration in minutes
    };
  },

  // Career matching algorithm
  calculateCareerMatch: (userAnswers, careerProfile) => {
    // Simple matching algorithm - can be enhanced with ML
    let matchScore = 0;
    let totalCriteria = 0;

    // Skills assessment weight: 40%
    if (userAnswers.SKILLS_ASSESSMENT && careerProfile.requiredSkills) {
      const userSkills = userAnswers.SKILLS_ASSESSMENT.map(a => a.answer.toLowerCase());
      const requiredSkills = careerProfile.requiredSkills.map(s => s.toLowerCase());
      
      const skillMatches = userSkills.filter(skill => 
        requiredSkills.some(required => required.includes(skill) || skill.includes(required))
      ).length;
      
      matchScore += (skillMatches / requiredSkills.length) * 40;
      totalCriteria += 40;
    }

    // Career interests weight: 30%
    if (userAnswers.CAREER_INTERESTS && careerProfile.industry) {
      const userInterests = userAnswers.CAREER_INTERESTS.map(a => a.answer.toLowerCase());
      const careerIndustry = careerProfile.industry.toLowerCase();
      
      const interestMatch = userInterests.some(interest => 
        interest.includes(careerIndustry) || careerIndustry.includes(interest)
      );
      
      matchScore += interestMatch ? 30 : 0;
      totalCriteria += 30;
    }

    // Personality traits weight: 20%
    if (userAnswers.PERSONALITY_TRAITS && careerProfile.workStyle) {
      const userTraits = userAnswers.PERSONALITY_TRAITS.map(a => a.answer.toLowerCase());
      const careerWorkStyle = careerProfile.workStyle.toLowerCase();
      
      const traitMatch = userTraits.some(trait => 
        trait.includes(careerWorkStyle) || careerWorkStyle.includes(trait)
      );
      
      matchScore += traitMatch ? 20 : 0;
      totalCriteria += 20;
    }

    // Learning style weight: 10%
    if (userAnswers.LEARNING_STYLE && careerProfile.learningRequirements) {
      const userLearning = userAnswers.LEARNING_STYLE.map(a => a.answer.toLowerCase());
      const careerLearning = careerProfile.learningRequirements.toLowerCase();
      
      const learningMatch = userLearning.some(style => 
        style.includes(careerLearning) || careerLearning.includes(style)
      );
      
      matchScore += learningMatch ? 10 : 0;
      totalCriteria += 10;
    }

    return totalCriteria > 0 ? Math.round((matchScore / totalCriteria) * 100) : 0;
  },

  // Get next stage in progression
  getNextStage: (currentStage, questionsAnswered = 0) => {
    const stageOrder = ['SKILLS_ASSESSMENT', 'CAREER_INTERESTS', 'PERSONALITY_TRAITS', 'LEARNING_STYLE', 'CAREER_GOALS'];
    const questionsPerStage = { SKILLS_ASSESSMENT: 4, CAREER_INTERESTS: 3, PERSONALITY_TRAITS: 3, LEARNING_STYLE: 2, CAREER_GOALS: 3 };
    
    const currentStageIndex = stageOrder.indexOf(currentStage);
    const maxQuestionsForStage = questionsPerStage[currentStage] || 0;
    
    // If current stage is complete, move to next
    if (questionsAnswered >= maxQuestionsForStage) {
      if (currentStageIndex < stageOrder.length - 1) {
        return stageOrder[currentStageIndex + 1];
      } else {
        return 'COMPLETED';
      }
    }
    
    // Stay in current stage
    return currentStage;
  },
};

module.exports = quizUtils;
