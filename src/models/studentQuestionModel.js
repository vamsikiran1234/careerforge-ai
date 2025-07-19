const { prisma } = require('../config/database');

const studentQuestionModel = {
  // Create a new student question
  create: async (questionData) => {
    return await prisma.studentQuestion.create({
      data: {
        userId: questionData.userId,
        question: questionData.question,
        domain: questionData.domain || 'OTHER',
        isActive: true,
      },
    });
  },

  // Find question by ID with user details
  findByIdWithUser: async (questionId) => {
    return await prisma.studentQuestion.findUnique({
      where: { id: questionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  },

  // Find all questions by user
  findByUserId: async (userId, options = {}) => {
    const {
      includeInactive = false,
      domain = null,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const where = { userId };
    
    if (!includeInactive) {
      where.isActive = true;
    }
    
    if (domain) {
      where.domain = domain;
    }

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    return await prisma.studentQuestion.findMany({
      where,
      orderBy,
      take: limit,
    });
  },

  // Find questions by domain
  findByDomain: async (domain, options = {}) => {
    const {
      isActive = true,
      limit = 100,
      includeUser = false,
    } = options;

    const where = { domain };
    if (isActive !== null) {
      where.isActive = isActive;
    }

    const include = includeUser ? {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    } : undefined;

    return await prisma.studentQuestion.findMany({
      where,
      include,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  // Update question
  update: async (questionId, updateData) => {
    return await prisma.studentQuestion.update({
      where: { id: questionId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });
  },

  // Deactivate question
  deactivate: async (questionId) => {
    return await prisma.studentQuestion.update({
      where: { id: questionId },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
  },

  // Reactivate question
  reactivate: async (questionId) => {
    return await prisma.studentQuestion.update({
      where: { id: questionId },
      data: {
        isActive: true,
        updatedAt: new Date(),
      },
    });
  },

  // Delete question
  delete: async (questionId) => {
    return await prisma.studentQuestion.delete({
      where: { id: questionId },
    });
  },

  // Get question statistics for a user
  getUserStats: async (userId) => {
    const totalQuestions = await prisma.studentQuestion.count({
      where: { userId },
    });

    const activeQuestions = await prisma.studentQuestion.count({
      where: { userId, isActive: true },
    });

    const domainBreakdown = await prisma.studentQuestion.groupBy({
      by: ['domain'],
      where: { userId },
      _count: { id: true },
    });

    const recentQuestions = await prisma.studentQuestion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        question: true,
        domain: true,
        createdAt: true,
        isActive: true,
      },
    });

    return {
      totalQuestions,
      activeQuestions,
      inactiveQuestions: totalQuestions - activeQuestions,
      domainBreakdown: domainBreakdown.reduce((acc, item) => {
        acc[item.domain] = item._count.id;
        return acc;
      }, {}),
      recentQuestions,
    };
  },

  // Get questions with matching mentors count
  findWithMentorCounts: async (userId, options = {}) => {
    const { limit = 20 } = options;

    const questions = await prisma.studentQuestion.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Get mentor counts for each domain
    const questionsWithCounts = await Promise.all(
      questions.map(async (question) => {
        const mentorCount = await prisma.mentor.count({
          where: {
            expertiseTags: { has: question.domain },
            isVerified: true,
          },
        });

        return {
          ...question,
          availableMentors: mentorCount,
        };
      })
    );

    return questionsWithCounts;
  },

  // Search questions
  search: async (searchTerm, options = {}) => {
    const {
      domain = null,
      isActive = true,
      limit = 50,
      includeUser = false,
    } = options;

    const where = {
      AND: [
        {
          question: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        isActive !== null ? { isActive } : {},
        domain ? { domain } : {},
      ].filter(condition => Object.keys(condition).length > 0),
    };

    const include = includeUser ? {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    } : undefined;

    return await prisma.studentQuestion.findMany({
      where,
      include,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  // Get all questions with pagination
  findAll: async (page = 1, limit = 20, filters = {}) => {
    const skip = (page - 1) * limit;
    const where = { isActive: true, ...filters };

    const [questions, totalCount] = await Promise.all([
      prisma.studentQuestion.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.studentQuestion.count({ where }),
    ]);

    return {
      questions,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPrevPage: page > 1,
    };
  },

  // Get domain statistics
  getDomainStats: async () => {
    const domainStats = await prisma.studentQuestion.groupBy({
      by: ['domain'],
      where: { isActive: true },
      _count: { id: true },
    });

    return domainStats
      .map(stat => ({
        domain: stat.domain,
        count: stat._count.id,
        displayName: stat.domain.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      }))
      .sort((a, b) => b.count - a.count);
  },

  // Get trending questions
  getTrending: async (days = 7, limit = 10) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await prisma.studentQuestion.findMany({
      where: {
        isActive: true,
        createdAt: { gte: startDate },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },
};

module.exports = studentQuestionModel;
