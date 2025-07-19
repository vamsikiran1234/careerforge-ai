const { asyncHandler, createResponse } = require('../utils/helpers');
const { prisma } = require('../config/database');
const aiService = require('../services/aiService');

const mentorController = {
  // POST /api/v1/mentors/query - Submit question for mentor matching
  submitQuery: asyncHandler(async (req, res) => {
    const { question, userId } = req.body;

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json(
        createResponse('error', 'User not found')
      );
    }

    // Classify question domain using AI
    const domain = await aiService.classifyDomain(question);

    // Save student question
    const studentQuestion = await prisma.studentQuestion.create({
      data: {
        userId,
        question,
        domain,
        isActive: true,
      },
    });

    res.status(201).json(
      createResponse('success', 'Question submitted successfully', {
        questionId: studentQuestion.id,
        domain,
        question: studentQuestion.question,
        createdAt: studentQuestion.createdAt,
        matchingStatus: 'pending',
      })
    );
  }),

  // GET /api/v1/mentors/:questionId/match - Find matching mentors
  findMatches: asyncHandler(async (req, res) => {
    const { questionId } = req.params;
    const { limit = 10, minRating = 0 } = req.query;

    // Get student question
    const studentQuestion = await prisma.studentQuestion.findUnique({
      where: { id: questionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!studentQuestion) {
      return res.status(404).json(
        createResponse('error', 'Question not found')
      );
    }

    if (!studentQuestion.isActive) {
      return res.status(400).json(
        createResponse('error', 'Question is no longer active')
      );
    }

    // Find mentors with matching domain expertise
    const matchingMentors = await prisma.mentor.findMany({
      where: {
        AND: [
          {
            expertiseTags: {
              has: studentQuestion.domain,
            },
          },
          {
            isVerified: true,
          },
          {
            rating: {
              gte: parseFloat(minRating),
            },
          },
        ],
      },
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
      orderBy: [
        { rating: 'desc' },
        { totalSessions: 'desc' },
        { experience: 'desc' },
      ],
      take: parseInt(limit),
    });

    // Calculate match scores and enhance mentor data
    const enhancedMatches = matchingMentors.map(mentor => {
      // Calculate match score based on multiple factors
      let matchScore = 0;

      // Domain expertise match (40%)
      const domainMatch = mentor.expertiseTags.includes(studentQuestion.domain) ? 40 : 0;
      matchScore += domainMatch;

      // Rating factor (30%)
      const ratingScore = (mentor.rating || 0) * 6; // Convert 5-star to 30 points
      matchScore += ratingScore;

      // Experience factor (20%)
      const experienceScore = Math.min(mentor.experience * 2, 20); // Cap at 20 points
      matchScore += experienceScore;

      // Session count factor (10%)
      const sessionScore = Math.min(mentor.totalSessions * 0.1, 10); // Cap at 10 points
      matchScore += sessionScore;

      return {
        mentorId: mentor.id,
        userId: mentor.userId,
        matchScore: Math.round(Math.min(matchScore, 100)), // Cap at 100%
        mentor: {
          name: mentor.user.name,
          email: mentor.user.email,
          avatar: mentor.user.avatar,
          bio: mentor.user.bio,
          expertiseTags: mentor.expertiseTags,
          experience: mentor.experience,
          rating: mentor.rating,
          totalSessions: mentor.totalSessions,
          hourlyRate: mentor.hourlyRate,
          availability: mentor.availability,
          linkedinUrl: mentor.linkedinUrl,
          portfolioUrl: mentor.portfolioUrl,
          isVerified: mentor.isVerified,
        },
      };
    });

    // Sort by match score
    enhancedMatches.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json(
      createResponse('success', 'Mentors matched successfully', {
        questionId,
        question: studentQuestion.question,
        domain: studentQuestion.domain,
        student: studentQuestion.user,
        matches: enhancedMatches,
        totalMatches: enhancedMatches.length,
        searchCriteria: {
          domain: studentQuestion.domain,
          minRating: parseFloat(minRating),
          limit: parseInt(limit),
        },
      })
    );
  }),

  // GET /api/v1/mentors/domains - Get available mentor domains
  getAvailableDomains: asyncHandler(async (req, res) => {
    const domainStats = await prisma.mentor.groupBy({
      by: ['expertiseTags'],
      where: {
        isVerified: true,
      },
      _count: {
        id: true,
      },
    });

    // Flatten expertise tags and count mentors per domain
    const domainCounts = {};
    domainStats.forEach(stat => {
      stat.expertiseTags.forEach(domain => {
        domainCounts[domain] = (domainCounts[domain] || 0) + stat._count.id;
      });
    });

    // Get domain details
    const domains = Object.entries(domainCounts).map(([domain, count]) => ({
      domain,
      mentorCount: count,
      displayName: domain.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    }));

    domains.sort((a, b) => b.mentorCount - a.mentorCount);

    res.status(200).json(
      createResponse('success', 'Available domains retrieved successfully', {
        domains,
        totalDomains: domains.length,
        totalMentors: Object.values(domainCounts).reduce((sum, count) => sum + count, 0),
      })
    );
  }),

  // GET /api/v1/mentors/user/:userId/questions - Get user's questions
  getUserQuestions: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { includeInactive = false } = req.query;

    const where = { userId };
    if (!includeInactive) {
      where.isActive = true;
    }

    const questions = await prisma.studentQuestion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        question: true,
        domain: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const stats = {
      totalQuestions: questions.length,
      activeQuestions: questions.filter(q => q.isActive).length,
      inactiveQuestions: questions.filter(q => !q.isActive).length,
      domainBreakdown: {},
    };

    questions.forEach(q => {
      stats.domainBreakdown[q.domain] = (stats.domainBreakdown[q.domain] || 0) + 1;
    });

    res.status(200).json(
      createResponse('success', 'User questions retrieved successfully', {
        questions,
        statistics: stats,
      })
    );
  }),

  // PUT /api/v1/mentors/question/:questionId/deactivate - Deactivate question
  deactivateQuestion: asyncHandler(async (req, res) => {
    const { questionId } = req.params;

    const question = await prisma.studentQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return res.status(404).json(
        createResponse('error', 'Question not found')
      );
    }

    const updatedQuestion = await prisma.studentQuestion.update({
      where: { id: questionId },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    res.status(200).json(
      createResponse('success', 'Question deactivated successfully', {
        questionId: updatedQuestion.id,
        isActive: updatedQuestion.isActive,
        updatedAt: updatedQuestion.updatedAt,
      })
    );
  }),

  // GET /api/v1/mentors/search - Advanced mentor search
  searchMentors: asyncHandler(async (req, res) => {
    const { 
      domain, 
      minRating = 0, 
      maxHourlyRate, 
      minExperience = 0, 
      limit = 20,
      sortBy = 'rating' 
    } = req.query;

    // Build where clause
    const where = {
      isVerified: true,
      rating: { gte: parseFloat(minRating) },
      experience: { gte: parseInt(minExperience) },
    };

    if (domain) {
      where.expertiseTags = { has: domain };
    }

    if (maxHourlyRate) {
      where.hourlyRate = { lte: parseFloat(maxHourlyRate) };
    }

    // Build orderBy clause
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

    const mentors = await prisma.mentor.findMany({
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
      orderBy,
      take: parseInt(limit),
    });

    const searchResults = mentors.map(mentor => ({
      mentorId: mentor.id,
      userId: mentor.userId,
      name: mentor.user.name,
      avatar: mentor.user.avatar,
      bio: mentor.user.bio,
      expertiseTags: mentor.expertiseTags,
      experience: mentor.experience,
      rating: mentor.rating,
      totalSessions: mentor.totalSessions,
      hourlyRate: mentor.hourlyRate,
      isVerified: mentor.isVerified,
    }));

    res.status(200).json(
      createResponse('success', 'Mentor search completed successfully', {
        mentors: searchResults,
        totalResults: searchResults.length,
        searchCriteria: {
          domain,
          minRating: parseFloat(minRating),
          maxHourlyRate: maxHourlyRate ? parseFloat(maxHourlyRate) : null,
          minExperience: parseInt(minExperience),
          sortBy,
          limit: parseInt(limit),
        },
      })
    );
  }),

  // GET /api/v1/mentors - Get all mentors with filtering and pagination
  getAllMentors: asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      domain,
      skills,
      experienceLevel,
      minRating = 0,
      maxPrice,
      sortBy = 'rating',
      location
    } = req.query;

    // Build where clause
    const where = {};

    if (domain) {
      where.careerDomain = domain;
    }

    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      where.expertise = {
        hasSome: skillsArray
      };
    }

    if (experienceLevel) {
      switch (experienceLevel.toLowerCase()) {
        case 'junior':
          where.experience = { lt: 3 };
          break;
        case 'mid':
          where.experience = { gte: 3, lt: 7 };
          break;
        case 'senior':
          where.experience = { gte: 7 };
          break;
      }
    }

    if (minRating) {
      where.rating = { gte: parseFloat(minRating) };
    }

    if (maxPrice) {
      where.pricePerHour = { lte: parseFloat(maxPrice) };
    }

    if (location && location !== 'remote') {
      where.location = { contains: location, mode: 'insensitive' };
    }

    // Build orderBy clause
    let orderBy;
    switch (sortBy) {
      case 'experience':
        orderBy = { experience: 'desc' };
        break;
      case 'price':
        orderBy = { pricePerHour: 'asc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      default:
        orderBy = { rating: 'desc' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const mentors = await prisma.mentor.findMany({
      where,
      skip,
      take,
      orderBy,
    });

    const total = await prisma.mentor.count({ where });

    res.status(200).json(
      createResponse('success', 'Mentors retrieved successfully', {
        mentors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      })
    );
  }),

  // GET /api/v1/mentors/:id - Get specific mentor by ID
  getMentorById: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const mentor = await prisma.mentor.findUnique({
      where: { id },
    });

    if (!mentor) {
      return res.status(404).json(
        createResponse('error', 'Mentor not found')
      );
    }

    res.status(200).json(
      createResponse('success', 'Mentor retrieved successfully', {
        mentor
      })
    );
  }),

  // POST /api/v1/mentors - Create new mentor
  createMentor: asyncHandler(async (req, res) => {
    const {
      name,
      email,
      expertise,
      bio,
      experience,
      pricePerHour,
      location,
      careerDomain,
      available = true,
      linkedin,
      github,
      portfolio,
      education,
      certifications,
      languages,
      timezone
    } = req.body;

    // Check if mentor with email already exists
    const existingMentor = await prisma.mentor.findUnique({
      where: { email },
    });

    if (existingMentor) {
      return res.status(400).json(
        createResponse('error', 'Mentor with this email already exists')
      );
    }

    // Create new mentor
    const newMentor = await prisma.mentor.create({
      data: {
        name,
        email,
        expertise,
        bio,
        experience,
        pricePerHour,
        location,
        careerDomain,
        available,
        linkedin,
        github,
        portfolio,
        education,
        certifications,
        languages,
        timezone,
        rating: 0, // Default rating
      },
    });

    res.status(201).json(
      createResponse('success', 'Mentor created successfully', {
        mentor: newMentor
      })
    );
  }),

  // PUT /api/v1/mentors/:id - Update existing mentor
  updateMentor: asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if mentor exists
    const existingMentor = await prisma.mentor.findUnique({
      where: { id },
    });

    if (!existingMentor) {
      return res.status(404).json(
        createResponse('error', 'Mentor not found')
      );
    }

    // Update mentor
    const updatedMentor = await prisma.mentor.update({
      where: { id },
      data: req.body,
    });

    res.status(200).json(
      createResponse('success', 'Mentor updated successfully', {
        mentor: updatedMentor
      })
    );
  }),

  // DELETE /api/v1/mentors/:id - Delete mentor
  deleteMentor: asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if mentor exists
    const existingMentor = await prisma.mentor.findUnique({
      where: { id },
    });

    if (!existingMentor) {
      return res.status(404).json(
        createResponse('error', 'Mentor not found')
      );
    }

    // Delete mentor
    await prisma.mentor.delete({
      where: { id },
    });

    res.status(200).json(
      createResponse('success', 'Mentor deleted successfully')
    );
  }),

  // POST /api/v1/mentors/match - Find mentor matches based on criteria
  findMentorMatches: asyncHandler(async (req, res) => {
    const {
      skills = [],
      careerGoal,
      experienceLevel,
      domain,
      budget,
      location,
      learningStyle
    } = req.body;

    // Validate required fields
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json(
        createResponse('error', 'Skills are required and must be an array')
      );
    }

    // Build search criteria
    const where = {
      available: true,
    };

    if (domain) {
      where.careerDomain = domain;
    }

    if (budget) {
      where.pricePerHour = { lte: parseFloat(budget) };
    }

    if (location && location !== 'remote') {
      where.OR = [
        { location: { contains: location, mode: 'insensitive' } },
        { location: { contains: 'remote', mode: 'insensitive' } }
      ];
    }

    // Find mentors
    const mentors = await prisma.mentor.findMany({
      where,
      orderBy: { rating: 'desc' },
    });

    // Calculate match scores
    const matches = mentors.map(mentor => {
      let matchScore = 0;
      const matchReasons = [];

      // Skills matching (40% weight)
      const skillMatches = skills.filter(skill => 
        mentor.expertise.some(exp => 
          exp.toLowerCase().includes(skill.toLowerCase())
        )
      );
      const skillScore = (skillMatches.length / skills.length) * 40;
      matchScore += skillScore;
      
      if (skillMatches.length > 0) {
        matchReasons.push(`Matches ${skillMatches.length}/${skills.length} required skills`);
      }

      // Experience level matching (30% weight)
      if (experienceLevel) {
        let experienceMatch = false;
        switch (experienceLevel.toLowerCase()) {
          case 'junior':
            experienceMatch = mentor.experience >= 2;
            break;
          case 'mid':
            experienceMatch = mentor.experience >= 4;
            break;
          case 'senior':
            experienceMatch = mentor.experience >= 7;
            break;
        }
        if (experienceMatch) {
          matchScore += 30;
          matchReasons.push(`Suitable for ${experienceLevel} level`);
        }
      }

      // Rating bonus (20% weight)
      const ratingScore = (mentor.rating || 0) * 4; // Convert 5-star to 20 points
      matchScore += ratingScore;

      // Budget compatibility (10% weight)
      if (budget && mentor.pricePerHour <= budget) {
        matchScore += 10;
        matchReasons.push('Within budget range');
      }

      return {
        mentor,
        matchScore: Math.round(Math.min(matchScore, 100)),
        matchReasons
      };
    });

    // Sort by match score and filter
    const sortedMatches = matches
      .filter(match => match.matchScore > 20) // Minimum 20% match
      .sort((a, b) => b.matchScore - a.matchScore);

    if (sortedMatches.length === 0) {
      return res.status(200).json(
        createResponse('success', 'No mentors found matching your criteria', {
          matches: [],
          suggestions: [
            'Consider expanding your budget range',
            'Try searching in nearby locations',
            'Broaden your skill requirements'
          ],
          searchCriteria: req.body
        })
      );
    }

    res.status(200).json(
      createResponse('success', 'Mentor matches found successfully', {
        matches: sortedMatches,
        searchCriteria: req.body
      })
    );
  }),
};

module.exports = mentorController;
