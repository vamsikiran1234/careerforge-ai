const { PrismaClient } = require('@prisma/client');
const { createResponse } = require('../utils/helpers');
const prisma = new PrismaClient();

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_UNAUTHORIZED = 401;
const HTTP_STATUS_ERROR = 500;
const DAYS_IN_WEEK = 7;

// Progress score calculation weights
const WEIGHT_CHAT_SESSIONS = 0.3;
const WEIGHT_QUIZZES_TAKEN = 0.4;
const WEIGHT_MENTOR_CONNECTIONS = 0.2;
const WEIGHT_COMPLETED_QUIZZES = 0.1;

// Max values for progress normalization
const MAX_CHAT_SESSIONS = 20;
const MAX_QUIZZES_TAKEN = 10;
const MAX_MENTOR_CONNECTIONS = 5;
const MAX_COMPLETED_QUIZZES = 10;

/**
 * Get user-specific dashboard statistics
 * @route GET /api/v1/dashboard/stats
 * @access Private (authenticated users)
 */
const getUserDashboardStats = async (req, res) => {
  try {
    // eslint-disable-next-line no-console
    console.log('🔍 Dashboard Stats - Full req.user:', JSON.stringify(req.user, null, 2));
    
    // JWT token uses 'userId' field, not 'id'
    if (!req.user || !req.user.userId) {
      // eslint-disable-next-line no-console
      console.error('❌ No user ID found in request');
      return res.status(HTTP_STATUS_UNAUTHORIZED).json(
        createResponse('error', 'User not authenticated')
      );
    }
    
    const userId = req.user.userId;
    // eslint-disable-next-line no-console
    console.log('✅ Using userId:', userId);

    // Calculate date for "this week" (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - DAYS_IN_WEEK);

    // Get all data in parallel for better performance
    const [
      totalChatSessions,
      weekChatSessions,
      totalQuizzesTaken,
      weekQuizzesTaken,
      mentorConnections,
      upcomingMeetings,
      completedQuizzes,
      userQuizResults
    ] = await Promise.all([
      // Total chat sessions (CareerSession model)
      prisma.careerSession.count({
        where: { userId }
      }),
      
      // Chat sessions this week
      prisma.careerSession.count({
        where: {
          userId,
          createdAt: { gte: weekAgo }
        }
      }),
      
      // Total quizzes taken (unique quiz sessions)
      prisma.quizSession.count({
        where: { userId }
      }),
      
      // Quizzes taken this week
      prisma.quizSession.count({
        where: {
          userId,
          createdAt: { gte: weekAgo }
        }
      }),
      
      // Mentor connections count
      prisma.mentorConnection.count({
        where: {
          OR: [
            { studentId: userId, status: 'ACCEPTED' },
            { mentorId: userId, status: 'ACCEPTED' }
          ]
        }
      }),
      
      // Upcoming mentor sessions
      prisma.mentorSession.count({
        where: {
          OR: [
            { studentId: userId },
            { mentorId: userId }
          ],
          status: 'SCHEDULED',
          scheduledAt: {
            gte: new Date()
          }
        }
      }),
      
      // Completed quizzes (use completedAt field)
      prisma.quizSession.count({
        where: {
          userId,
          completedAt: {
            not: null
          }
        }
      }),
      
      // Get quiz results for career interests and skills (use completedAt)
      prisma.quizSession.findMany({
        where: {
          userId,
          completedAt: {
            not: null
          }
        },
        select: {
          results: true,
          updatedAt: true
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: 5
      })
    ]);

    // Calculate progress score (0-100%)
    const progressScore = calculateProgressScore({
      chatSessions: totalChatSessions,
      quizzesTaken: totalQuizzesTaken,
      mentorConnections,
      completedQuizzes
    });

    // Get weekly activity data (last 7 days)
    const activityData = await getWeeklyActivity(userId);

    // Extract skills and career interests from quiz results
    const { skillsData, careerInterests } = parseQuizResults(userQuizResults);

    // Get recent achievements
    const achievements = generateAchievements({
      totalChatSessions,
      totalQuizzesTaken,
      mentorConnections,
      completedQuizzes
    });

    return res.status(HTTP_STATUS_OK).json(
      createResponse('success', 'Dashboard statistics retrieved successfully', {
        quickStats: {
          chatSessions: {
            total: totalChatSessions,
            thisWeek: weekChatSessions
          },
          quizzesTaken: {
            total: totalQuizzesTaken,
            thisWeek: weekQuizzesTaken
          },
          mentorConnections: {
            total: mentorConnections,
            upcomingMeetings
          },
          progressScore: Math.round(progressScore)
        },
        weeklyActivity: activityData,
        skills: skillsData,
        careerInterests,
        achievements
      })
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error fetching user dashboard stats:');
    // eslint-disable-next-line no-console
    console.error('Error message:', error.message);
    // eslint-disable-next-line no-console
    console.error('Error stack:', error.stack);
    // eslint-disable-next-line no-console
    console.error('User ID:', req.user?.id);
    
    return res.status(HTTP_STATUS_ERROR).json(
      createResponse('error', 'Failed to fetch dashboard statistics')
    );
  }
};

/**
 * Calculate user progress score based on activity
 */
function calculateProgressScore(data) {
  const { chatSessions, quizzesTaken, mentorConnections, completedQuizzes } = data;
  
  // Weighted scoring system
  const weights = {
    chatSessions: WEIGHT_CHAT_SESSIONS,
    quizzesTaken: WEIGHT_QUIZZES_TAKEN,
    mentorConnections: WEIGHT_MENTOR_CONNECTIONS,
    completedQuizzes: WEIGHT_COMPLETED_QUIZZES
  };
  
  // Max values for normalization
  const maxValues = {
    chatSessions: MAX_CHAT_SESSIONS,
    quizzesTaken: MAX_QUIZZES_TAKEN,
    mentorConnections: MAX_MENTOR_CONNECTIONS,
    completedQuizzes: MAX_COMPLETED_QUIZZES
  };
  
  // Calculate weighted score
  const score = (
    (Math.min(chatSessions, maxValues.chatSessions) / maxValues.chatSessions) * weights.chatSessions +
    (Math.min(quizzesTaken, maxValues.quizzesTaken) / maxValues.quizzesTaken) * weights.quizzesTaken +
    (Math.min(mentorConnections, maxValues.mentorConnections) / maxValues.mentorConnections) * weights.mentorConnections +
    (Math.min(completedQuizzes, maxValues.completedQuizzes) / maxValues.completedQuizzes) * weights.completedQuizzes
  );
  
  return score * 100; // Convert to percentage
}

/**
 * Get weekly activity data for the last 7 days
 */
async function getWeeklyActivity(userId) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const activityData = [];

  // Calculate which day of week today is (0 = Sunday, 1 = Monday, etc.)
  const todayDayOfWeek = today.getDay();
  
  // Adjust to make Monday = 0
  const adjustedToday = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;

  for (let i = 0; i < DAYS_IN_WEEK; i++) {
    const dayIndex = (adjustedToday - (DAYS_IN_WEEK - 1 - i) + DAYS_IN_WEEK) % DAYS_IN_WEEK;
    const date = new Date(today);
    date.setDate(date.getDate() - (DAYS_IN_WEEK - 1 - i));
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get sessions and quizzes for this day
    const [sessions, quizzes] = await Promise.all([
      prisma.careerSession.count({
        where: {
          userId,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      }),
      prisma.quizSession.count({
        where: {
          userId,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      })
    ]);

    activityData.push({
      name: days[dayIndex],
      sessions,
      quizzes
    });
  }

  return activityData;
}

/**
 * Parse quiz results to extract skills and career interests
 */
function parseQuizResults(quizResults) {
  if (!quizResults || quizResults.length === 0) {
    return {
      skillsData: getDefaultSkills(),
      careerInterests: getDefaultCareerInterests()
    };
  }

  // Get the most recent quiz result
  const latestResult = quizResults[0];
  
  if (!latestResult.results) {
    return {
      skillsData: getDefaultSkills(),
      careerInterests: getDefaultCareerInterests()
    };
  }

  let results;
  try {
    results = typeof latestResult.results === 'string' 
      ? JSON.parse(latestResult.results) 
      : latestResult.results;
  } catch {
    return {
      skillsData: getDefaultSkills(),
      careerInterests: getDefaultCareerInterests()
    };
  }

  // Extract skills if available
  const skillsData = [];
  
  // Try multiple possible locations for skill data
  if (results.skillLevels) {
    // Structure: { skillLevels: { "Technical Skills": 75, "Soft Skills": 80, ... } }
    Object.entries(results.skillLevels).forEach(([skill, level]) => {
      skillsData.push({
        name: skill,
        value: typeof level === 'number' ? Math.round(level) : 0
      });
    });
  } else if (results.skills) {
    // Structure: { skills: [{ name: "Technical Skills", level: 75 }, ...] }
    if (Array.isArray(results.skills)) {
      results.skills.forEach(skill => {
        if (typeof skill === 'object' && skill !== null) {
          skillsData.push({
            name: skill.name || skill.skill || 'Unknown Skill',
            value: typeof skill.value === 'number' ? Math.round(skill.value) : 
                   typeof skill.level === 'number' ? Math.round(skill.level) : 
                   typeof skill.score === 'number' ? Math.round(skill.score) : 0
          });
        }
      });
    }
  } else if (results.assessment && results.assessment.skills) {
    // Structure: { assessment: { skills: {...} } }
    Object.entries(results.assessment.skills).forEach(([skill, level]) => {
      skillsData.push({
        name: skill,
        value: typeof level === 'number' ? Math.round(level) : 0
      });
    });
  }
  
  // If we found skills with career recommendations, infer some skill levels from them
  if (skillsData.length === 0 && results.recommendations && Array.isArray(results.recommendations)) {
    // Generate estimated skills based on career recommendations
    const hasRecommendations = results.recommendations.length > 0;
    if (hasRecommendations) {
      skillsData.push(
        { name: 'Technical Skills', value: 65 },
        { name: 'Soft Skills', value: 70 },
        { name: 'Leadership', value: 55 },
        { name: 'Communication', value: 60 }
      );
    }
  }

  // Extract career recommendations
  const careerInterests = [];
  if (results.recommendations && Array.isArray(results.recommendations)) {
    results.recommendations.forEach((rec, index) => {
      if (index < 4) { // Top 4 careers
        // Handle different recommendation structures
        let careerName = 'Unknown Career';
        let matchValue = 100 - index * 10; // Default descending values
        
        if (typeof rec === 'string') {
          careerName = rec;
        } else if (typeof rec === 'object' && rec !== null) {
          // Extract title from various possible fields
          careerName = rec.title || rec.career || rec.name || 'Career Option';
          // Extract match score from various possible fields
          matchValue = rec.match_percentage || rec.matchScore || rec.score || (100 - index * 10);
        }
        
        careerInterests.push({
          name: careerName,
          value: typeof matchValue === 'number' ? Math.round(matchValue) : (100 - index * 10)
        });
      }
    });
  } else if (results.topCareers && Array.isArray(results.topCareers)) {
    results.topCareers.forEach((career, index) => {
      if (index < 4) {
        const careerName = typeof career === 'string' ? career : (career.name || career.title || 'Career Option');
        const careerScore = typeof career === 'object' ? (career.score || career.match_percentage || (100 - index * 10)) : (100 - index * 10);
        
        careerInterests.push({
          name: careerName,
          value: typeof careerScore === 'number' ? Math.round(careerScore) : (100 - index * 10)
        });
      }
    });
  }

  return {
    skillsData: skillsData.length > 0 ? skillsData : getDefaultSkills(),
    careerInterests: careerInterests.length > 0 ? careerInterests : getDefaultCareerInterests()
  };
}

/**
 * Default skills when no quiz data available
 */
function getDefaultSkills() {
  return [
    { name: 'Technical Skills', value: 0 },
    { name: 'Soft Skills', value: 0 },
    { name: 'Leadership', value: 0 },
    { name: 'Communication', value: 0 }
  ];
}

/**
 * Default career interests when no quiz data available
 */
function getDefaultCareerInterests() {
  return [
    { name: 'Take a quiz to discover your interests', value: 0 }
  ];
}

/**
 * Generate achievements based on user activity
 */
function generateAchievements(data) {
  const achievements = [];

  // First Quiz Completed
  achievements.push({
    title: 'First Quiz Completed',
    description: 'Completed your first career assessment',
    icon: 'Award',
    date: data.completedQuizzes > 0 ? 'Completed' : 'Not yet completed',
    completed: data.completedQuizzes > 0
  });

  // Chat Expert (10+ conversations)
  achievements.push({
    title: 'Chat Expert',
    description: 'Had 10 conversations with AI assistant',
    icon: 'MessageSquare',
    date: data.totalChatSessions >= 10 ? 'Completed' : `${data.totalChatSessions}/10`,
    completed: data.totalChatSessions >= 10
  });

  // Profile Complete (assuming always complete for registered users)
  achievements.push({
    title: 'Profile Complete',
    description: 'Added all profile information',
    icon: 'Target',
    date: 'Completed',
    completed: true
  });

  // Mentor Connection
  if (data.mentorConnections > 0) {
    achievements.push({
      title: 'Mentor Connected',
      description: `Connected with ${data.mentorConnections} mentor${data.mentorConnections > 1 ? 's' : ''}`,
      icon: 'Users',
      date: 'Completed',
      completed: true
    });
  }

  return achievements;
}

module.exports = {
  getUserDashboardStats
};
