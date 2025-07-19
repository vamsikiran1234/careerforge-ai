const { prisma } = require('../config/database');

const quizSessionModel = {
  // Create a new quiz session
  create: async (userId, stage = 'SKILLS_ASSESSMENT') => {
    return await prisma.quizSession.create({
      data: {
        userId,
        currentStage: stage,
        answers: {},
      },
    });
  },

  // Find quiz session by ID with questions
  findByIdWithQuestions: async (sessionId) => {
    return await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        quizQuestions: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  },

  // Find active session for user
  findActiveSession: async (userId) => {
    return await prisma.quizSession.findFirst({
      where: {
        userId,
        completedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  // Update session answers and stage
  updateSession: async (sessionId, data) => {
    return await prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  },

  // Complete quiz session
  completeSession: async (sessionId, results) => {
    return await prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        results,
        completedAt: new Date(),
        currentStage: 'COMPLETED',
      },
    });
  },

  // Get all sessions for a user
  findByUser: async (userId, includeQuestions = false) => {
    const include = includeQuestions ? {
      quizQuestions: {
        orderBy: {
          order: 'asc',
        },
      },
    } : undefined;

    return await prisma.quizSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include,
    });
  },

  // Get session statistics
  getSessionStats: async (userId) => {
    const totalSessions = await prisma.quizSession.count({
      where: { userId },
    });

    const completedSessions = await prisma.quizSession.count({
      where: {
        userId,
        completedAt: { not: null },
      },
    });

    const averageScore = await prisma.quizSession.aggregate({
      where: {
        userId,
        score: { not: null },
      },
      _avg: {
        score: true,
      },
    });

    return {
      totalSessions,
      completedSessions,
      activeSessions: totalSessions - completedSessions,
      averageScore: averageScore._avg.score || 0,
    };
  },

  // Delete session and all related questions
  delete: async (sessionId) => {
    return await prisma.quizSession.delete({
      where: { id: sessionId },
    });
  },

  // Get quiz progress
  getProgress: async (sessionId) => {
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        quizQuestions: true,
      },
    });

    if (!session) {
      return null;
    }

    const stageOrder = ['SKILLS_ASSESSMENT', 'CAREER_INTERESTS', 'PERSONALITY_TRAITS', 'LEARNING_STYLE', 'CAREER_GOALS'];
    const currentStageIndex = stageOrder.indexOf(session.currentStage);
    const totalQuestions = session.quizQuestions.length;
    const answeredQuestions = session.quizQuestions.filter(q => q.userAnswer).length;

    return {
      currentStage: session.currentStage,
      currentStageIndex: currentStageIndex + 1,
      totalStages: stageOrder.length,
      stageProgress: ((currentStageIndex + 1) / stageOrder.length) * 100,
      questionsProgress: totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0,
      totalQuestions,
      answeredQuestions,
      isComplete: !!session.completedAt,
    };
  },

  // Get recommendations from completed session
  getRecommendations: async (sessionId) => {
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      select: {
        results: true,
        completedAt: true,
      },
    });

    if (!session || !session.completedAt) {
      return null;
    }

    return session.results;
  },

  // Add question to session
  addQuestion: async (sessionId, questionData) => {
    const questionCount = await prisma.quizQuestion.count({
      where: { quizSessionId: sessionId },
    });

    return await prisma.quizQuestion.create({
      data: {
        quizSessionId: sessionId,
        questionText: questionData.question,
        options: questionData.options,
        stage: questionData.stage,
        order: questionCount + 1,
      },
    });
  },

  // Update question with user answer
  updateQuestionAnswer: async (questionId, answer) => {
    return await prisma.quizQuestion.update({
      where: { id: questionId },
      data: { userAnswer: answer },
    });
  },

  // Get latest question for session
  getLatestQuestion: async (sessionId) => {
    return await prisma.quizQuestion.findFirst({
      where: { quizSessionId: sessionId },
      orderBy: { order: 'desc' },
    });
  },
};

module.exports = quizSessionModel;
