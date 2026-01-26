const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const { createNotificationHelper } = require('./notificationController');
const emailService = require('../services/emailService');

const prisma = new PrismaClient();

// @desc    Register as a mentor (alumni only)
// @route   POST /api/v1/mentorship/register
// @access  Private (authenticated users)
const registerMentor = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      company,
      jobTitle,
      industry,
      yearsOfExperience,
      collegeName,
      degree,
      graduationYear,
      major,
      expertiseAreas, // Array: ["Web Development", "AI/ML", etc.]
      bio,
      linkedinUrl,
      portfolioUrl,
      availableHoursPerWeek,
      preferredMeetingType,
      timezone,
    } = req.body;

    // Validation
    if (!company || !jobTitle || !industry || yearsOfExperience === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required professional information',
      });
    }

    if (!collegeName || !degree || !graduationYear) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required educational information',
      });
    }

    if (!expertiseAreas || expertiseAreas.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one expertise area',
      });
    }

    if (!bio || bio.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Bio is required and must be under 500 characters',
      });
    }

    // Check if user already has a mentor profile
    const existingProfile = await prisma.mentorProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      // Allow re-registration if previous verification expired or profile is inactive
      if (existingProfile.isVerified && existingProfile.status === 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: 'You already have an active mentor profile',
          profileId: existingProfile.id,
        });
      }
      
      // If verification expired or profile is pending, allow re-registration
      // Delete the old profile and create a new one
      console.log('⚠️  Deleting expired/inactive profile for user:', userId);
      await prisma.mentorProfile.delete({
        where: { id: existingProfile.id },
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create mentor profile
    const mentorProfile = await prisma.mentorProfile.create({
      data: {
        userId,
        company,
        jobTitle,
        industry,
        yearsOfExperience: parseInt(yearsOfExperience),
        collegeName,
        degree,
        graduationYear: parseInt(graduationYear),
        major,
        expertiseAreas: JSON.stringify(expertiseAreas),
        bio,
        linkedinUrl,
        portfolioUrl,
        availableHoursPerWeek: availableHoursPerWeek || 5,
        preferredMeetingType: preferredMeetingType || 'VIDEO',
        timezone: timezone || 'UTC',
        verificationToken,
        verificationExpiry,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Send verification email using email service
    try {
      await emailService.sendMentorVerificationEmail(
        req.user.email,
        verificationToken,
        req.user.name
      );
      console.log('✅ Verification email sent to:', req.user.email);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/mentorship/verify/${verificationToken}`;
      console.warn('⚠️  For development, use this URL:', verificationUrl);
      // Don't fail the registration if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Mentor profile created successfully. Please check your email to verify your account.',
      data: {
        ...mentorProfile,
        expertiseAreas: JSON.parse(mentorProfile.expertiseAreas),
      },
    });
  } catch (error) {
    console.error('Error registering mentor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register as mentor',
      error: error.message,
    });
  }
};

// @desc    Verify mentor email with token
// @route   GET /api/v1/mentorship/verify/:token
// @access  Public
const verifyMentorEmail = async (req, res) => {
  try {
    const { token } = req.params;

    console.log('📧 Email verification request received');
    console.log('   Token:', token);
    console.log('   Token length:', token?.length);

    if (!token) {
      console.error('❌ No token provided');
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
    }

    // Find mentor profile with this token
    console.log('🔍 Looking for mentor profile with token...');
    
    const mentorProfile = await prisma.mentorProfile.findFirst({
      where: {
        verificationToken: token,
        verificationExpiry: {
          gt: new Date(),
        },
      },
    });

    console.log('   Mentor profile found:', mentorProfile ? 'YES' : 'NO');
    
    if (mentorProfile) {
      console.log('   Profile ID:', mentorProfile.id);
      console.log('   Current status:', mentorProfile.status);
      console.log('   Is verified:', mentorProfile.isVerified);
      console.log('   Token expiry:', mentorProfile.verificationExpiry);
    } else {
      // Check if token exists but is expired
      const expiredProfile = await prisma.mentorProfile.findFirst({
        where: { verificationToken: token }
      });
      
      if (expiredProfile) {
        console.warn('⚠️  Token found but expired');
        console.log('   Expiry was:', expiredProfile.verificationExpiry);
        console.log('   Current time:', new Date());
        return res.status(400).json({
          success: false,
          message: 'Verification link has expired. Please register again or contact support.',
        });
      }
      
      // Check if email was already verified
      const alreadyVerifiedProfile = await prisma.mentorProfile.findFirst({
        where: {
          verificationToken: null, // Token cleared after verification
          isVerified: true,
        },
      });
      
      if (alreadyVerifiedProfile) {
        console.log('✅ Email already verified for profile:', alreadyVerifiedProfile.id);
        return res.json({
          success: true,
          message: 'Email already verified! Your profile is pending admin approval.',
          alreadyVerified: true,
        });
      }
      
      console.warn('⚠️  Token not found in database');
    }

    if (!mentorProfile) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
    }

    // Update mentor profile - Keep status as PENDING until admin approval
    console.log('✅ Updating mentor profile...');
    
    await prisma.mentorProfile.update({
      where: { id: mentorProfile.id },
      data: {
        isVerified: true,
        status: 'PENDING', // Changed from 'ACTIVE' - requires admin approval
        verificationToken: null,
        verificationExpiry: null,
      },
    });

    console.log('✅ Email verified successfully for mentor profile:', mentorProfile.id);
    console.log('   New status: PENDING (awaiting admin approval)');

    res.json({
      success: true,
      message: 'Email verified successfully! Your profile is pending admin approval.',
    });
  } catch (error) {
    console.error('❌ Error verifying email:', error);
    console.error('   Error name:', error.name);
    console.error('   Error message:', error.message);
    console.error('   Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to verify email',
      error: error.message,
    });
  }
};

// @desc    Get current user's mentor profile
// @route   GET /api/v1/mentorship/profile
// @access  Private
const getMyMentorProfile = async (req, res) => {
  try {
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId: req.user.userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found',
      });
    }

    res.json({
      success: true,
      data: {
        ...mentorProfile,
        expertiseAreas: JSON.parse(mentorProfile.expertiseAreas),
      },
    });
  } catch (error) {
    console.error('Error fetching mentor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentor profile',
      error: error.message,
    });
  }
};

// @desc    Update mentor profile
// @route   PUT /api/v1/mentorship/profile
// @access  Private (mentor only)
const updateMentorProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;

    // Find mentor profile
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId },
    });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found',
      });
    }

    // Prepare update data
    const dataToUpdate = {};
    
    // Professional info
    if (updateData.company) dataToUpdate.company = updateData.company;
    if (updateData.jobTitle) dataToUpdate.jobTitle = updateData.jobTitle;
    if (updateData.industry) dataToUpdate.industry = updateData.industry;
    if (updateData.yearsOfExperience !== undefined) {
      dataToUpdate.yearsOfExperience = parseInt(updateData.yearsOfExperience);
    }

    // Educational info
    if (updateData.collegeName) dataToUpdate.collegeName = updateData.collegeName;
    if (updateData.degree) dataToUpdate.degree = updateData.degree;
    if (updateData.graduationYear) {
      dataToUpdate.graduationYear = parseInt(updateData.graduationYear);
    }
    if (updateData.major) dataToUpdate.major = updateData.major;

    // Mentorship details
    if (updateData.expertiseAreas) {
      dataToUpdate.expertiseAreas = JSON.stringify(updateData.expertiseAreas);
    }
    if (updateData.bio) {
      if (updateData.bio.length > 500) {
        return res.status(400).json({
          success: false,
          message: 'Bio must be under 500 characters',
        });
      }
      dataToUpdate.bio = updateData.bio;
    }
    if (updateData.linkedinUrl !== undefined) dataToUpdate.linkedinUrl = updateData.linkedinUrl;
    if (updateData.portfolioUrl !== undefined) dataToUpdate.portfolioUrl = updateData.portfolioUrl;

    // Availability
    if (updateData.availableHoursPerWeek) {
      dataToUpdate.availableHoursPerWeek = parseInt(updateData.availableHoursPerWeek);
    }
    if (updateData.preferredMeetingType) {
      dataToUpdate.preferredMeetingType = updateData.preferredMeetingType;
    }
    if (updateData.timezone) dataToUpdate.timezone = updateData.timezone;

    // Update profile
    const updatedProfile = await prisma.mentorProfile.update({
      where: { id: mentorProfile.id },
      data: dataToUpdate,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Mentor profile updated successfully',
      data: {
        ...updatedProfile,
        expertiseAreas: JSON.parse(updatedProfile.expertiseAreas),
      },
    });
  } catch (error) {
    console.error('Error updating mentor profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update mentor profile',
      error: error.message,
    });
  }
};

// @desc    Get all verified mentors (for discovery)
// @route   GET /api/v1/mentorship/mentors
// @access  Private
const getAllMentors = async (req, res) => {
  try {
    const {
      expertise,
      industry,
      company,
      minExperience,
      maxExperience,
      page = 1,
      limit = 12,
    } = req.query;

    // Build filter conditions
    const where = {
      isVerified: true,
      status: 'ACTIVE',
    };

    if (expertise) {
      // Search in JSON array (expertise areas)
      where.expertiseAreas = {
        contains: expertise,
      };
    }

    if (industry) {
      where.industry = {
        contains: industry,
        mode: 'insensitive',
      };
    }

    if (company) {
      where.company = {
        contains: company,
        mode: 'insensitive',
      };
    }

    if (minExperience || maxExperience) {
      where.yearsOfExperience = {};
      if (minExperience) where.yearsOfExperience.gte = parseInt(minExperience);
      if (maxExperience) where.yearsOfExperience.lte = parseInt(maxExperience);
    }

    // Get total count
    const total = await prisma.mentorProfile.count({ where });

    // Get mentors with pagination
    const mentors = await prisma.mentorProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: [
        { averageRating: 'desc' },
        { totalSessions: 'desc' },
      ],
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    });

    // Parse JSON fields
    const mentorsWithParsedData = mentors.map((mentor) => ({
      ...mentor,
      expertiseAreas: JSON.parse(mentor.expertiseAreas),
    }));

    res.json({
      success: true,
      data: mentorsWithParsedData,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentors',
      error: error.message,
    });
  }
};

// @desc    Get mentor by ID
// @route   GET /api/v1/mentorship/mentors/:id
// @access  Private
const getMentorById = async (req, res) => {
  try {
    const { id } = req.params;

    const mentor = await prisma.mentorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        receivedReviews: {
          where: { isPublic: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found',
      });
    }

    if (!mentor.isVerified || mentor.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'This mentor profile is not available',
      });
    }

    res.json({
      success: true,
      data: {
        ...mentor,
        expertiseAreas: JSON.parse(mentor.expertiseAreas),
      },
    });
  } catch (error) {
    console.error('Error fetching mentor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mentor details',
      error: error.message,
    });
  }
};

// ========================================
// CONNECTION REQUEST FUNCTIONS
// ========================================

// @desc    Send a connection request to a mentor
// @route   POST /api/v1/mentorship/connections/request
// @access  Private (Students)
const sendConnectionRequest = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { mentorId, message } = req.body;

    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: 'Mentor ID is required',
      });
    }

    // Check if mentor exists and is active
    const mentor = await prisma.mentorProfile.findUnique({
      where: { id: mentorId },
      include: {
        user: true,
      },
    });

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found',
      });
    }

    if (!mentor.isVerified || mentor.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'This mentor is not available for connections',
      });
    }

    // Check if mentor has reached max capacity (3 active connections)
    if (mentor.activeConnections >= 3) {
      return res.status(400).json({
        success: false,
        message: 'This mentor has reached maximum capacity. Please choose another mentor.',
      });
    }

    // Check if connection already exists
    const existingConnection = await prisma.mentorConnection.findUnique({
      where: {
        mentorId_studentId: {
          mentorId,
          studentId,
        },
      },
    });

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: 'You already have a connection request with this mentor',
        connectionStatus: existingConnection.status,
      });
    }

    // Create connection request
    const connection = await prisma.mentorConnection.create({
      data: {
        mentorId,
        studentId,
        message: message || null,
        status: 'PENDING',
      },
      include: {
        mentor: {
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
        },
      },
    });

    // Send email notification to mentor
    try {
      const student = await prisma.user.findUnique({
        where: { id: studentId },
        select: { name: true, email: true },
      });

      await emailService.sendConnectionRequestEmail(
        mentor.user.email,
        mentor.user.name,
        student.name,
        message
      );
    } catch (emailError) {
      console.error('Failed to send connection request email:', emailError);
    }

    // Create notification for mentor
    try {
      await createNotificationHelper({
        userId: mentor.userId,
        type: 'CONNECTION_REQUEST',
        title: 'New Connection Request',
        message: `${connection.mentor.user.name} wants to connect with you`,
        actionUrl: '/connections',
        data: { connectionId: connection.id },
      });
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    res.status(201).json({
      success: true,
      message: 'Connection request sent successfully',
      data: connection,
    });
  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send connection request',
      error: error.message,
    });
  }
};

// @desc    Get all connections for the authenticated user (mentor or student)
// @route   GET /api/v1/mentorship/connections
// @access  Private
const getMyConnections = async (req, res) => {
  try {
    const userId = req.user.userId; // Changed from req.user.userId to req.user.userId
    const { status } = req.query;

    // Check if user is a mentor
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId },
    });

    let connections = [];

    if (mentorProfile) {
      // User is a mentor, get connections where they are the mentor
      const whereClause = {
        mentorId: mentorProfile.id,
      };

      if (status) {
        whereClause.status = status.toUpperCase();
      }

      connections = await prisma.mentorConnection.findMany({
        where: whereClause,
        include: {
          mentor: {
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
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Add student info and parse expertiseAreas
      for (const connection of connections) {
        const student = await prisma.user.findUnique({
          where: { id: connection.studentId },
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        });
        connection.student = student;
        // Parse expertiseAreas from JSON string
        connection.mentor.expertiseAreas = JSON.parse(connection.mentor.expertiseAreas);
      }
    } else {
      // User is a student, get connections where they are the student
      const whereClause = {
        studentId: userId,
      };

      if (status) {
        whereClause.status = status.toUpperCase();
      }

      connections = await prisma.mentorConnection.findMany({
        where: whereClause,
        include: {
          mentor: {
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
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Parse expertise areas
      connections = connections.map(conn => ({
        ...conn,
        mentor: {
          ...conn.mentor,
          expertiseAreas: JSON.parse(conn.mentor.expertiseAreas),
        },
      }));
    }

    res.json({
      success: true,
      data: connections,
      count: connections.length,
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch connections',
      error: error.message,
    });
  }
};

// @desc    Accept a connection request (mentor only)
// @route   POST /api/v1/mentorship/connections/:id/accept
// @access  Private (Mentors)
const acceptConnectionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Get mentor profile
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId },
    });

    if (!mentorProfile) {
      return res.status(403).json({
        success: false,
        message: 'Only mentors can accept connection requests',
      });
    }

    // Find the connection
    const connection = await prisma.mentorConnection.findUnique({
      where: { id },
      include: {
        mentor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found',
      });
    }

    // Verify this connection belongs to the mentor
    if (connection.mentorId !== mentorProfile.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only accept your own connection requests',
      });
    }

    if (connection.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Only pending connections can be accepted',
      });
    }

    // Check if mentor has capacity
    if (mentorProfile.activeConnections >= 3) {
      return res.status(400).json({
        success: false,
        message: 'You have reached maximum capacity (3 active connections)',
      });
    }

    // Update connection status and create chat room
    const [updatedConnection, chatRoom] = await prisma.$transaction([
      prisma.mentorConnection.update({
        where: { id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        },
      }),
      prisma.chatRoom.create({
        data: {
          connectionId: id,
          mentorId: mentorProfile.id,
          studentId: connection.studentId,
        },
      }),
      prisma.mentorProfile.update({
        where: { id: mentorProfile.id },
        data: {
          activeConnections: { increment: 1 },
          totalConnections: { increment: 1 },
        },
      }),
    ]);

    // Send email notification to student
    try {
      const student = await prisma.user.findUnique({
        where: { id: connection.studentId },
        select: { name: true, email: true },
      });

      await emailService.sendConnectionAcceptedEmail(
        student.email,
        student.name,
        connection.mentor.user.name
      );
    } catch (emailError) {
      console.error('Failed to send connection accepted email:', emailError);
    }

    // Create notification for student
    try {
      await createNotificationHelper({
        userId: connection.studentId,
        type: 'CONNECTION_ACCEPTED',
        title: 'Connection Request Accepted',
        message: `${connection.mentor.user.name} accepted your connection request`,
        actionUrl: '/connections',
        data: { connectionId: connection.id },
      });
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Connection request accepted successfully',
      data: {
        connection: updatedConnection,
        chatRoomId: chatRoom.id,
      },
    });
  } catch (error) {
    console.error('Error accepting connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept connection request',
      error: error.message,
    });
  }
};

// @desc    Decline a connection request (mentor only)
// @route   POST /api/v1/mentorship/connections/:id/decline
// @access  Private (Mentors)
const declineConnectionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.userId;

    // Get mentor profile
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId },
    });

    if (!mentorProfile) {
      return res.status(403).json({
        success: false,
        message: 'Only mentors can decline connection requests',
      });
    }

    // Find the connection
    const connection = await prisma.mentorConnection.findUnique({
      where: { id },
      include: {
        mentor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found',
      });
    }

    // Verify this connection belongs to the mentor
    if (connection.mentorId !== mentorProfile.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only decline your own connection requests',
      });
    }

    if (connection.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Only pending connections can be declined',
      });
    }

    // Update connection status
    const updatedConnection = await prisma.mentorConnection.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
      },
    });

    // Send email notification to student (optional, with reason)
    try {
      const student = await prisma.user.findUnique({
        where: { id: connection.studentId },
        select: { name: true, email: true },
      });

      await emailService.sendConnectionRejectedEmail(
        student.email,
        student.name,
        connection.mentor.user.name
      );
    } catch (emailError) {
      console.error('Failed to send connection declined email:', emailError);
    }

    // Create notification for student
    try {
      await createNotificationHelper({
        userId: connection.studentId,
        type: 'CONNECTION_REJECTED',
        title: 'Connection Request Declined',
        message: `${connection.mentor.user.name} declined your connection request`,
        actionUrl: '/mentors',
      });
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Connection request declined',
      data: updatedConnection,
    });
  } catch (error) {
    console.error('Error declining connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to decline connection request',
      error: error.message,
    });
  }
};

// @desc    Delete/Archive a connection
// @route   DELETE /api/v1/mentorship/connections/:id
// @access  Private
const deleteConnection = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Find the connection
    const connection = await prisma.mentorConnection.findUnique({
      where: { id },
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found',
      });
    }

    // Check if user is part of this connection
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId },
    });

    const isMentor = mentorProfile && connection.mentorId === mentorProfile.id;
    const isStudent = connection.studentId === userId;

    if (!isMentor && !isStudent) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this connection',
      });
    }

    // If connection is active, update mentor's activeConnections count
    if (connection.status === 'ACCEPTED' && isMentor) {
      await prisma.mentorProfile.update({
        where: { id: connection.mentorId },
        data: {
          activeConnections: { decrement: 1 },
        },
      });
    }

    // Delete the connection (cascade will delete chat room and messages)
    await prisma.mentorConnection.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Connection deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete connection',
      error: error.message,
    });
  }
};

// ========================================
// ADMIN FUNCTIONS
// ========================================

// @desc    Get all pending mentor applications
// @route   GET /api/v1/admin/mentors/pending
// @access  Private/Admin
const getPendingMentors = async (req, res) => {
  try {
    console.log('📋 Fetching pending mentor applications...');
    
    const pendingMentors = await prisma.mentorProfile.findMany({
      where: {
        status: 'PENDING',
        isVerified: true, // ✅ Must be verified to appear in admin panel
      },
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
      orderBy: {
        createdAt: 'asc', // Oldest first
      },
    });

    console.log(`   Found ${pendingMentors.length} pending mentor(s)`);
    
    if (pendingMentors.length > 0) {
      console.log('   Pending mentors:');
      pendingMentors.forEach((m, i) => {
        console.log(`   ${i + 1}. ${m.user.name} (${m.user.email})`);
      });
    }

    // Parse expertise areas for each mentor
    const formattedMentors = pendingMentors.map(mentor => ({
      ...mentor,
      expertiseAreas: JSON.parse(mentor.expertiseAreas),
    }));

    res.json({
      success: true,
      data: formattedMentors,
      count: formattedMentors.length,
    });
  } catch (error) {
    console.error('❌ Error fetching pending mentors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending mentor applications',
      error: error.message,
    });
  }
};

// @desc    Approve a mentor application
// @route   POST /api/v1/admin/mentors/:id/approve
// @access  Private/Admin
const approveMentor = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the mentor profile
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found',
      });
    }

    if (mentorProfile.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Only pending applications can be approved',
      });
    }

    // Update mentor profile status to ACTIVE
    const updatedMentor = await prisma.mentorProfile.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        verificationToken: null,
        verificationExpiry: null,
      },
    });

    // Send approval email
    try {
      await emailService.sendMentorApprovalEmail(
        mentorProfile.user.email,
        mentorProfile.user.name
      );
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'Mentor application approved successfully',
      data: updatedMentor,
    });
  } catch (error) {
    console.error('Error approving mentor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve mentor application',
      error: error.message,
    });
  }
};

// @desc    Reject a mentor application
// @route   POST /api/v1/admin/mentors/:id/reject
// @access  Private/Admin
const rejectMentor = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }

    // Find the mentor profile
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor profile not found',
      });
    }

    if (mentorProfile.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Only pending applications can be rejected',
      });
    }

    // Delete the mentor profile (rejecting means removing the application)
    await prisma.mentorProfile.delete({
      where: { id },
    });

    // Send rejection email
    try {
      await emailService.sendMentorRejectionEmail(
        mentorProfile.user.email,
        mentorProfile.user.name,
        reason
      );
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'Mentor application rejected successfully',
    });
  } catch (error) {
    console.error('Error rejecting mentor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject mentor application',
      error: error.message,
    });
  }
};

module.exports = {
  registerMentor,
  verifyMentorEmail,
  getMyMentorProfile,
  updateMentorProfile,
  getAllMentors,
  getMentorById,
  // Connection functions
  sendConnectionRequest,
  getMyConnections,
  acceptConnectionRequest,
  declineConnectionRequest,
  deleteConnection,
  // Admin functions
  getPendingMentors,
  approveMentor,
  rejectMentor,
};
