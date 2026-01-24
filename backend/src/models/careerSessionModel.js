const { prisma } = require('../config/database');

const careerSessionModel = {
  // Create a new career session
  create: async (userId, title = null) => {
    const defaultTitle = title || `Career Chat - ${new Date().toLocaleDateString()}`;
    
    return await prisma.careerSession.create({
      data: {
        userId,
        title: defaultTitle,
        messages: [],
      },
    });
  },

  // Find active session for user
  findActiveSession: async (userId) => {
    return await prisma.careerSession.findFirst({
      where: {
        userId,
        endedAt: null,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  },

  // Update session with new messages
  updateMessages: async (sessionId, messages) => {
    return await prisma.careerSession.update({
      where: { id: sessionId },
      data: {
        messages,
        updatedAt: new Date(),
      },
    });
  },

  // Get session by ID
  findById: async (sessionId) => {
    return await prisma.careerSession.findUnique({
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
      },
    });
  },

  // Get all sessions for a user
  findByUser: async (userId, limit = 10) => {
    return await prisma.careerSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        endedAt: true,
      },
    });
  },

  // End a session
  endSession: async (sessionId) => {
    return await prisma.careerSession.update({
      where: { id: sessionId },
      data: {
        endedAt: new Date(),
      },
    });
  },

  // Get session statistics
  getSessionStats: async (userId) => {
    const stats = await prisma.careerSession.aggregate({
      where: { userId },
      _count: {
        id: true,
      },
    });

    const activeCount = await prisma.careerSession.count({
      where: {
        userId,
        endedAt: null,
      },
    });

    return {
      totalSessions: stats._count.id,
      activeSessions: activeCount,
      completedSessions: stats._count.id - activeCount,
    };
  },

  // Add message to session
  addMessage: async (sessionId, message) => {
    const session = await prisma.careerSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const currentMessages = Array.isArray(session.messages) ? session.messages : [];
    currentMessages.push(message);

    return await prisma.careerSession.update({
      where: { id: sessionId },
      data: {
        messages: currentMessages,
        updatedAt: new Date(),
      },
    });
  },

  // Generate session summary
  generateSummary: async (sessionId) => {
    const session = await prisma.careerSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || !session.messages) {
      return null;
    }

    const messages = Array.isArray(session.messages) ? session.messages : [];
    const messageCount = messages.length;
    const userMessages = messages.filter(m => m.role === 'user').length;
    const assistantMessages = messages.filter(m => m.role === 'assistant').length;

    return {
      messageCount,
      userMessages,
      assistantMessages,
      duration: session.updatedAt - session.createdAt,
      topics: [], // Could be enhanced with AI topic extraction
    };
  },
};

module.exports = careerSessionModel;
