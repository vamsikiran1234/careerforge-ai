const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Constants
const DAYS_IN_ANALYTICS_PERIOD = 30; // Days to look back for growth metrics
const HTTP_STATUS_OK = 200;
const PERCENTAGE_MULTIPLIER = 100;

/**
 * Get platform overview statistics
 * @route GET /api/v1/analytics/platform
 * @access Admin only
 */
const getPlatformStats = async (req, res) => {
  try {
    // Get counts in parallel
    const [
      totalUsers,
      totalMentors,
      activeMentors,
      pendingMentors,
      totalSessions,
      completedSessions,
      totalReviews,
      totalMessages,
      activeConnections
    ] = await Promise.all([
      prisma.user.count(),
      // Count only mentors who have verified their email (PENDING or ACTIVE status)
      prisma.mentorProfile.count({ 
        where: { 
          isVerified: true 
        } 
      }),
      // Active mentors (approved by admin)
      prisma.mentorProfile.count({ 
        where: { 
          status: 'ACTIVE',
          isVerified: true 
        } 
      }),
      // Pending mentors (verified email, waiting for admin approval)
      prisma.mentorProfile.count({ 
        where: { 
          status: 'PENDING',
          isVerified: true 
        } 
      }),
      prisma.mentorSession.count(),
      prisma.mentorSession.count({ where: { status: 'COMPLETED' } }),
      prisma.mentorReview.count(),
      prisma.chatMessage.count(),
      prisma.mentorConnection.count({ where: { status: 'ACCEPTED' } })
    ]);

    // Calculate average rating
    const avgRatingResult = await prisma.mentorReview.aggregate({
      _avg: {
        overallRating: true
      },
      where: {
        isPublic: true
      }
    });

    // Get user growth over last 30 days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - DAYS_IN_ANALYTICS_PERIOD);

    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: daysAgo
        }
      }
    });

    const newMentors = await prisma.mentorProfile.count({
      where: {
        isVerified: true, // Only count verified mentors
        createdAt: {
          gte: daysAgo
        }
      }
    });

    // Get session status distribution
    const sessionsByStatus = await prisma.mentorSession.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    // Calculate completion rate
    const completionRate = totalSessions > 0 
      ? ((completedSessions / totalSessions) * PERCENTAGE_MULTIPLIER).toFixed(1) 
      : 0;

    return res.status(HTTP_STATUS_OK).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          newLast30Days: newUsers,
          growth: totalUsers > 0 ? ((newUsers / totalUsers) * PERCENTAGE_MULTIPLIER).toFixed(1) : 0
        },
        mentors: {
          total: totalMentors,
          active: activeMentors,
          pending: pendingMentors,
          newLast30Days: newMentors
        },
        sessions: {
          total: totalSessions,
          completed: completedSessions,
          completionRate: `${completionRate}%`,
          byStatus: sessionsByStatus.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
          }, {})
        },
        engagement: {
          totalReviews,
          totalMessages,
          activeConnections,
          averageRating: avgRatingResult._avg.overallRating?.toFixed(1) || 'N/A'
        }
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching platform stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch platform statistics',
      error: error.message
    });
  }
};

/**
 * Get mentor statistics
 * @route GET /api/v1/analytics/mentors
 * @access Admin only
 */
const getMentorStats = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Top rated mentors
    const topRatedMentors = await prisma.mentorProfile.findMany({
      where: {
        isVerified: true,
        averageRating: {
          not: null
        }
      },
      orderBy: {
        averageRating: 'desc'
      },
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Most active mentors (by session count)
    const mostActiveMentors = await prisma.mentorProfile.findMany({
      where: {
        isVerified: true
      },
      orderBy: {
        totalSessions: 'desc'
      },
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Mentors by expertise area
    const allMentors = await prisma.mentorProfile.findMany({
      where: {
        isVerified: true
      },
      select: {
        expertiseAreas: true
      }
    });

    // Count expertise areas - Parse JSON strings first
    const expertiseDistribution = {};
    allMentors.forEach(mentor => {
      const areas = JSON.parse(mentor.expertiseAreas);
      areas.forEach(area => {
        expertiseDistribution[area] = (expertiseDistribution[area] || 0) + 1;
      });
    });

    // Sort expertise by count
    const topExpertiseAreas = Object.entries(expertiseDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([area, count]) => ({ area, count }));

    // Mentor availability distribution
    const availabilityDistribution = await prisma.mentorProfile.groupBy({
      by: ['availableHoursPerWeek'],
      where: {
        isVerified: true
      },
      _count: {
        availableHoursPerWeek: true
      }
    });

    return res.status(200).json({
      success: true,
      topRatedMentors: topRatedMentors.map(m => ({
        id: m.id,
        name: m.user.name,
        email: m.user.email,
        jobTitle: m.jobTitle,
        company: m.company,
        averageRating: m.averageRating,
        totalSessions: m.totalSessions,
        expertiseAreas: JSON.parse(m.expertiseAreas)
      })),
      mostActiveMentors: mostActiveMentors.map(m => ({
        id: m.id,
        name: m.user.name,
        email: m.user.email,
        jobTitle: m.jobTitle,
        company: m.company,
        totalSessions: m.totalSessions,
        averageRating: m.averageRating
      })),
      expertiseDistribution: topExpertiseAreas,
      availabilityDistribution: availabilityDistribution.map(item => ({
        hoursPerWeek: item.availableHoursPerWeek,
        count: item._count.availableHoursPerWeek
      }))
    });
  } catch (error) {
    console.error('Error fetching mentor stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch mentor statistics',
      error: error.message
    });
  }
};

/**
 * Get session statistics with time series data
 * @route GET /api/v1/analytics/sessions
 * @access Admin only
 */
const getSessionStats = async (req, res) => {
  try {
    const period = req.query.period || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Sessions over time (grouped by day)
    const sessionsOverTime = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        status
      FROM mentorship_sessions
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at), status
      ORDER BY date ASC
    `;

    // Average session duration (for completed sessions)
    const completedSessions = await prisma.mentorSession.findMany({
      where: {
        status: 'COMPLETED',
        startTime: {
          not: null
        },
        endTime: {
          not: null
        }
      },
      select: {
        startTime: true,
        endTime: true
      }
    });

    const avgDuration = completedSessions.length > 0
      ? completedSessions.reduce((acc, session) => {
          const duration = (new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60); // minutes
          return acc + duration;
        }, 0) / completedSessions.length
      : 0;

    // Sessions by meeting type
    const sessionsByType = await prisma.mentorSession.groupBy({
      by: ['meetingType'],
      _count: {
        meetingType: true
      }
    });

    // Peak booking times (hour of day)
    const bookingsByHour = await prisma.$queryRaw`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
      FROM mentorship_sessions
      WHERE created_at >= ${startDate}
      GROUP BY hour
      ORDER BY hour ASC
    `;

    // Cancellation rate
    const totalBookings = await prisma.mentorSession.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    });

    const cancelledBookings = await prisma.mentorSession.count({
      where: {
        status: 'CANCELLED',
        createdAt: {
          gte: startDate
        }
      }
    });

    const cancellationRate = totalBookings > 0
      ? ((cancelledBookings / totalBookings) * 100).toFixed(1)
      : 0;

    return res.status(200).json({
      success: true,
      sessionsOverTime,
      metrics: {
        avgDuration: Math.round(avgDuration),
        totalBookings,
        cancelledBookings,
        cancellationRate: `${cancellationRate}%`
      },
      sessionsByType: sessionsByType.map(item => ({
        type: item.meetingType,
        count: item._count.meetingType
      })),
      bookingsByHour: bookingsByHour.map(item => ({
        hour: Number(item.hour),
        count: Number(item.count)
      }))
    });
  } catch (error) {
    console.error('Error fetching session stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch session statistics',
      error: error.message
    });
  }
};

/**
 * Get user statistics
 * @route GET /api/v1/analytics/users
 * @access Admin only
 */
const getUserStats = async (req, res) => {
  try {
    const period = req.query.period || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // User growth over time
    const userGrowth = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // User roles distribution (Note: roles is now a JSON array string)
    // Since we can't groupBy on JSON fields in SQLite, we'll fetch all users and count manually
    const allUsers = await prisma.user.findMany({
      select: {
        roles: true
      }
    });

    // Count roles manually
    const roleCount = {};
    allUsers.forEach(user => {
      try {
        const userRoles = JSON.parse(user.roles);
        userRoles.forEach(role => {
          roleCount[role] = (roleCount[role] || 0) + 1;
        });
      } catch (e) {
        console.error('Error parsing user roles:', e);
      }
    });

    const usersByRole = Object.entries(roleCount).map(([role, count]) => ({
      role,
      _count: { roles: count }
    }));

    // Most active users (by message count)
    const mostActiveUsers = await prisma.user.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        roles: true, // Changed from role to roles
        createdAt: true,
        _count: {
          select: {
            careerSessions: true,
            quizSessions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // User engagement metrics
    const usersWithSessions = await prisma.user.count({
      where: {
        careerSessions: {
          some: {}
        }
      }
    });

    const usersWithQuizzes = await prisma.user.count({
      where: {
        quizSessions: {
          some: {}
        }
      }
    });

    const totalUsers = await prisma.user.count();

    return res.status(200).json({
      success: true,
      userGrowth,
      distribution: {
        byRole: usersByRole.map(item => ({
          role: item.role,
          count: item._count.roles
        })),
        engagement: {
          withSessions: usersWithSessions,
          withQuizzes: usersWithQuizzes,
          engagementRate: totalUsers > 0 
            ? `${((usersWithSessions / totalUsers) * 100).toFixed(1)}%`
            : '0%'
        }
      },
      mostActiveUsers: mostActiveUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        roles: JSON.parse(user.roles),
        joinedAt: user.createdAt,
        stats: {
          sessions: user._count.careerSessions,
          quizzes: user._count.quizSessions
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
};

/**
 * Get review statistics
 * @route GET /api/v1/analytics/reviews
 * @access Admin only
 */
const getReviewStats = async (req, res) => {
  try {
    const period = req.query.period || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Reviews over time
    const reviewsOverTime = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        AVG(overall_rating) as avg_rating
      FROM mentor_reviews
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Rating distribution
    const ratingDistribution = await prisma.mentorReview.groupBy({
      by: ['overallRating'],
      _count: {
        overallRating: true
      },
      where: {
        isPublic: true
      }
    });

    // Reviews with responses
    const totalReviews = await prisma.mentorReview.count();
    const reviewsWithResponse = await prisma.mentorReview.count({
      where: {
        mentorResponse: {
          not: null
        }
      }
    });

    const responseRate = totalReviews > 0
      ? ((reviewsWithResponse / totalReviews) * 100).toFixed(1)
      : 0;

    return res.status(200).json({
      success: true,
      reviewsOverTime,
      ratingDistribution: ratingDistribution.map(item => ({
        rating: item.overallRating,
        count: item._count.overallRating
      })).sort((a, b) => b.rating - a.rating),
      metrics: {
        totalReviews,
        reviewsWithResponse,
        responseRate: `${responseRate}%`
      }
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch review statistics',
      error: error.message
    });
  }
};

module.exports = {
  getPlatformStats,
  getMentorStats,
  getSessionStats,
  getUserStats,
  getReviewStats
};
