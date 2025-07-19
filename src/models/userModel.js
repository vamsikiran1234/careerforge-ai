const { prisma } = require('../config/database');

const userModel = {
  // Create a new user
  create: async (userData) => {
    return await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        role: userData.role || 'STUDENT',
        bio: userData.bio || null,
        avatar: userData.avatar || null,
      },
    });
  },

  // Find user by ID
  findById: async (id) => {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        mentor: true,
        _count: {
          select: {
            careerSessions: true,
            quizSessions: true,
            studentQuestions: true,
          },
        },
      },
    });
  },

  // Find user by email
  findByEmail: async (email) => {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        mentor: true,
      },
    });
  },

  // Update user profile
  update: async (id, userData) => {
    return await prisma.user.update({
      where: { id },
      data: {
        ...userData,
        updatedAt: new Date(),
      },
    });
  },

  // Delete user and all related data
  delete: async (id) => {
    return await prisma.user.delete({
      where: { id },
    });
  },

  // Get all users with pagination
  findAll: async (page = 1, limit = 10, role = null) => {
    const skip = (page - 1) * limit;
    
    const where = role ? { role } : {};
    
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  },

  // Validate user exists
  exists: async (id) => {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!user;
  },

  // Get user statistics
  getUserStats: async (id) => {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            careerSessions: true,
            quizSessions: true,
            studentQuestions: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      totalCareerSessions: user._count.careerSessions,
      totalQuizSessions: user._count.quizSessions,
      totalQuestions: user._count.studentQuestions,
      joinedDate: user.createdAt,
      lastActive: user.updatedAt,
    };
  },

  // Check if email is already taken
  isEmailTaken: async (email, excludeId = null) => {
    const where = { email };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const user = await prisma.user.findUnique({
      where,
      select: { id: true },
    });

    return !!user;
  },
};

module.exports = userModel;
