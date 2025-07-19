const { prisma } = require('../config/database');

const mentorModel = {
  // Create a new mentor profile
  create: async (mentorData) => {
    return await prisma.mentor.create({
      data: {
        userId: mentorData.userId,
        expertiseTags: mentorData.expertiseTags || [],
        experience: mentorData.experience || 0,
        hourlyRate: mentorData.hourlyRate || null,
        availability: mentorData.availability || null,
        rating: 0.0,
        totalSessions: 0,
        isVerified: false,
        linkedinUrl: mentorData.linkedinUrl || null,
        portfolioUrl: mentorData.portfolioUrl || null,
      },
    });
  },

  // Find mentor by ID with user details
  findByIdWithUser: async (mentorId) => {
    return await prisma.mentor.findUnique({
      where: { id: mentorId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
            createdAt: true,
          },
        },
      },
    });
  },

  // Find mentor by user ID
  findByUserId: async (userId) => {
    return await prisma.mentor.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
          },
        },
      },
    });
  },

  // Find mentors by expertise domain
  findByDomain: async (domain, options = {}) => {
    const {
      minRating = 0,
      maxHourlyRate = null,
      minExperience = 0,
      isVerified = true,
      limit = 20,
      sortBy = 'rating',
    } = options;

    const where = {
      expertiseTags: { has: domain },
      isVerified,
      rating: { gte: minRating },
      experience: { gte: minExperience },
    };

    if (maxHourlyRate) {
      where.hourlyRate = { lte: maxHourlyRate };
    }

    let orderBy;
    switch (sortBy) {
      case 'experience':
        orderBy = { experience: 'desc' };
        break;
      case 'rate':
        orderBy = { hourlyRate: 'asc' };
        break;
      case 'sessions':
        orderBy = { totalSessions: 'desc' };
        break;
      default:
        orderBy = { rating: 'desc' };
    }

    return await prisma.mentor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
          },
        },
      },
      orderBy,
      take: limit,
    });
  },

  // Update mentor profile
  update: async (mentorId, updateData) => {
    return await prisma.mentor.update({
      where: { id: mentorId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });
  },

  // Update mentor rating
  updateRating: async (mentorId, newRating) => {
    // Get current rating and session count
    const mentor = await prisma.mentor.findUnique({
      where: { id: mentorId },
      select: { rating: true, totalSessions: true },
    });

    if (!mentor) {
      throw new Error('Mentor not found');
    }

    // Calculate new average rating
    const currentRating = mentor.rating || 0;
    const sessionCount = mentor.totalSessions;
    const newAverageRating = ((currentRating * sessionCount) + newRating) / (sessionCount + 1);

    return await prisma.mentor.update({
      where: { id: mentorId },
      data: {
        rating: Math.round(newAverageRating * 100) / 100, // Round to 2 decimal places
        totalSessions: sessionCount + 1,
        updatedAt: new Date(),
      },
    });
  },

  // Verify mentor
  verify: async (mentorId, isVerified = true) => {
    return await prisma.mentor.update({
      where: { id: mentorId },
      data: {
        isVerified,
        updatedAt: new Date(),
      },
    });
  },

  // Get mentor statistics
  getStats: async (mentorId) => {
    const mentor = await prisma.mentor.findUnique({
      where: { id: mentorId },
    });

    if (!mentor) {
      return null;
    }

    // Additional stats could be calculated here
    return {
      totalSessions: mentor.totalSessions,
      averageRating: mentor.rating,
      experience: mentor.experience,
      expertiseDomains: mentor.expertiseTags.length,
      isVerified: mentor.isVerified,
      joinedDate: mentor.createdAt,
      lastUpdated: mentor.updatedAt,
    };
  },

  // Get all mentors with pagination
  findAll: async (page = 1, limit = 20, filters = {}) => {
    const skip = (page - 1) * limit;
    const where = { isVerified: true, ...filters };

    const [mentors, totalCount] = await Promise.all([
      prisma.mentor.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              bio: true,
            },
          },
        },
        orderBy: { rating: 'desc' },
      }),
      prisma.mentor.count({ where }),
    ]);

    return {
      mentors,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPrevPage: page > 1,
    };
  },

  // Search mentors
  search: async (searchTerm, options = {}) => {
    const {
      domains = [],
      minRating = 0,
      maxHourlyRate = null,
      limit = 20,
    } = options;

    const where = {
      AND: [
        { isVerified: true },
        { rating: { gte: minRating } },
        domains.length > 0 ? {
          expertiseTags: {
            hasSome: domains,
          },
        } : {},
        maxHourlyRate ? { hourlyRate: { lte: maxHourlyRate } } : {},
        searchTerm ? {
          OR: [
            {
              user: {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
            },
            {
              user: {
                bio: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
            },
          ],
        } : {},
      ].filter(condition => Object.keys(condition).length > 0),
    };

    return await prisma.mentor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
      },
      orderBy: { rating: 'desc' },
      take: limit,
    });
  },

  // Delete mentor profile
  delete: async (mentorId) => {
    return await prisma.mentor.delete({
      where: { id: mentorId },
    });
  },

  // Get domain statistics
  getDomainStats: async () => {
    const mentors = await prisma.mentor.findMany({
      where: { isVerified: true },
      select: { expertiseTags: true },
    });

    const domainCounts = {};
    mentors.forEach(mentor => {
      mentor.expertiseTags.forEach(domain => {
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      });
    });

    return Object.entries(domainCounts)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count);
  },
};

module.exports = mentorModel;
