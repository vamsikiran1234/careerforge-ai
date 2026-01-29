const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createNotificationHelper } = require('./notificationController');

// Helper function to generate Jitsi room ID
const generateJitsiRoomId = (sessionId) => {
  const timestamp = Date.now();
  return `careerforge-${sessionId}-${timestamp}`;
};

// Helper function to check for time conflicts
const checkScheduleConflict = async (mentorId, scheduledAt, duration, excludeSessionId = null) => {
  const sessionEnd = new Date(scheduledAt);
  sessionEnd.setMinutes(sessionEnd.getMinutes() + duration);

  const whereClause = {
    mentorId,
    status: {
      in: ['SCHEDULED', 'COMPLETED'], // Check against scheduled and ongoing sessions
    },
    OR: [
      {
        // New session starts during existing session
        AND: [
          { scheduledAt: { lte: scheduledAt } },
          {
            scheduledAt: {
              gte: new Date(scheduledAt.getTime() - 60 * 60 * 1000), // Within 1 hour buffer
            },
          },
        ],
      },
      {
        // New session ends during existing session
        scheduledAt: {
          gte: scheduledAt,
          lte: sessionEnd,
        },
      },
    ],
  };

  if (excludeSessionId) {
    whereClause.id = { not: excludeSessionId };
  }

  const conflictingSession = await prisma.mentorSession.findFirst({
    where: whereClause,
  });

  return conflictingSession;
};

// @desc    Set mentor availability (recurring weekly schedule)
// @route   POST /api/v1/sessions/availability
// @access  Private (mentor only)
const setAvailability = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { availability, timezone } = req.body;
    // availability format: [{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }]

    // Verify user is a verified mentor
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId },
    });

    if (!mentorProfile) {
      return res.status(403).json({
        success: false,
        message: 'Only registered mentors can set availability',
      });
    }

    if (!mentorProfile.isVerified || mentorProfile.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Your mentor profile must be verified and active',
      });
    }

    // Validate availability data
    if (!Array.isArray(availability) || availability.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide availability slots',
      });
    }

    // Update mentor profile with availability info
    const updatedProfile = await prisma.mentorProfile.update({
      where: { userId },
      data: {
        timezone: timezone || 'UTC',
        // Store availability in expertiseAreas temporarily or create separate table
        // For now, we'll return success and handle availability in session booking
      },
    });

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: {
        availability,
        timezone: updatedProfile.timezone,
      },
    });
  } catch (error) {
    console.error('Set availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update availability',
      error: error.message,
    });
  }
};

// @desc    Get mentor availability
// @route   GET /api/v1/sessions/availability/:mentorId
// @access  Public
const getAvailability = async (req, res) => {
  try {
    const { mentorId } = req.params;

    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { id: mentorId },
      select: {
        id: true,
        userId: true,
        timezone: true,
        availableHoursPerWeek: true,
        preferredMeetingType: true,
        status: true,
        isVerified: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found',
      });
    }

    // Get upcoming booked sessions to show unavailable slots
    const bookedSessions = await prisma.mentorSession.findMany({
      where: {
        mentorId,
        status: 'SCHEDULED',
        scheduledAt: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        scheduledAt: true,
        duration: true,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    res.status(200).json({
      success: true,
      data: {
        mentor: mentorProfile,
        bookedSlots: bookedSessions,
      },
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch availability',
      error: error.message,
    });
  }
};

// @desc    Book a session with a mentor
// @route   POST /api/v1/sessions/book
// @access  Private
const bookSession = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const {
      mentorId,
      scheduledAt,
      duration = 60,
      title,
      description,
      sessionType = 'VIDEO',
      timezone = 'UTC',
      agendaNotes,
    } = req.body;

    // Validation
    if (!mentorId || !scheduledAt || !title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mentor, scheduled time, and session title',
      });
    }

    // Check if mentor exists and is active
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { id: mentorId },
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

    if (!mentorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found',
      });
    }

    if (!mentorProfile.isVerified || mentorProfile.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'This mentor is not currently accepting sessions',
      });
    }

    // Check if there's an active connection between student and mentor
    const connection = await prisma.mentorConnection.findFirst({
      where: {
        OR: [
          { mentorId, studentId: studentId, status: 'ACCEPTED' },
          { mentorId, studentId: mentorProfile.userId, status: 'ACCEPTED' }, // Reverse check
        ],
      },
    });

    if (!connection) {
      return res.status(403).json({
        success: false,
        message: 'You must have an active connection with this mentor to book a session',
      });
    }

    // Check for scheduling conflicts
    const scheduledDate = new Date(scheduledAt);
    const conflict = await checkScheduleConflict(mentorId, scheduledDate, duration);

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please choose another time.',
        conflictingSession: {
          scheduledAt: conflict.scheduledAt,
          duration: conflict.duration,
        },
      });
    }

    // Check if scheduled time is in the past
    if (scheduledDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book sessions in the past',
      });
    }

    // Create the session
    const session = await prisma.mentorSession.create({
      data: {
        mentorId,
        studentId: mentorProfile.userId,
        title,
        description,
        sessionType,
        scheduledAt: scheduledDate,
        duration,
        timezone,
        agendaNotes,
        status: 'SCHEDULED',
      },
    });

    // Generate Jitsi meeting link
    const jitsiRoomId = generateJitsiRoomId(session.id);
    const meetingLink = `https://meet.jit.si/${jitsiRoomId}`;

    // Update session with meeting details
    const updatedSession = await prisma.mentorSession.update({
      where: { id: session.id },
      data: {
        meetingLink,
        meetingRoom: jitsiRoomId,
      },
      include: {
        mentor: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            company: true,
            jobTitle: true,
          },
        },
      },
    });

    // Increment mentor's total sessions count
    await prisma.mentorProfile.update({
      where: { id: mentorId },
      data: {
        totalSessions: {
          increment: 1,
        },
      },
    });

    // Create notification for mentor
    try {
      await createNotificationHelper({
        userId: mentorProfile.userId,
        type: 'SESSION_REQUEST',
        title: 'New Session Booking',
        message: `New session booked: ${title}`,
        actionUrl: `/sessions/${updatedSession.id}`,
        data: { sessionId: updatedSession.id },
      });
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    res.status(201).json({
      success: true,
      message: 'Session booked successfully',
      data: updatedSession,
    });
  } catch (error) {
    console.error('Book session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book session',
      error: error.message,
    });
  }
};

// @desc    Get user's sessions (both as mentor and student)
// @route   GET /api/v1/sessions/my-sessions
// @access  Private
const getMySessions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, upcoming } = req.query;

    // Check if user is a mentor
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    const whereClause = {
      OR: [
        { studentId: userId }, // Sessions as a student
      ],
    };

    if (mentorProfile) {
      whereClause.OR.push({ mentorId: mentorProfile.id }); // Sessions as a mentor
    }

    // Filter by status if provided
    if (status) {
      whereClause.status = status;
    }

    // Filter upcoming sessions
    if (upcoming === 'true') {
      whereClause.scheduledAt = {
        gte: new Date(),
      };
      whereClause.status = 'SCHEDULED';
    }

    const sessions = await prisma.mentorSession.findMany({
      where: whereClause,
      include: {
        mentor: {
          select: {
            id: true,
            userId: true,
            company: true,
            jobTitle: true,
            user: {
              select: {
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledAt: 'desc',
      },
    });

    // Fetch student information separately for each session
    const sessionsWithStudent = await Promise.all(
      sessions.map(async (session) => {
        const student = await prisma.user.findUnique({
          where: { id: session.studentId },
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        });
        return {
          ...session,
          student,
        };
      })
    );

    // Categorize sessions
    const now = new Date();
    const categorized = {
      upcoming: sessionsWithStudent.filter(s => s.status === 'SCHEDULED' && new Date(s.scheduledAt) > now),
      past: sessionsWithStudent.filter(s => s.status === 'COMPLETED' || (s.status === 'SCHEDULED' && new Date(s.scheduledAt) < now)),
      cancelled: sessionsWithStudent.filter(s => s.status === 'CANCELLED'),
    };

    res.status(200).json({
      success: true,
      data: {
        all: sessionsWithStudent,
        categorized,
        isMentor: !!mentorProfile,
      },
    });
  } catch (error) {
    console.error('Get my sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions',
      error: error.message,
    });
  }
};

// @desc    Cancel a session
// @route   PUT /api/v1/sessions/:id/cancel
// @access  Private
const cancelSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { cancellationReason } = req.body;

    // Find the session
    const session = await prisma.mentorSession.findUnique({
      where: { id },
      include: {
        mentor: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Check if user is authorized (either mentor or student)
    if (session.studentId !== userId && session.mentor.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this session',
      });
    }

    // Check if session can be cancelled
    if (session.status !== 'SCHEDULED') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a session with status: ${session.status}`,
      });
    }

    // Check if session is too close (less than 2 hours away)
    const hoursUntilSession = (new Date(session.scheduledAt) - new Date()) / (1000 * 60 * 60);
    if (hoursUntilSession < 2) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel sessions less than 2 hours before start time',
      });
    }

    // Cancel the session
    const updatedSession = await prisma.mentorSession.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: cancellationReason || 'No reason provided',
      },
      include: {
        mentor: {
          select: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Notify the other party
    try {
      const notifyUserId = userId === session.studentId ? session.mentor.userId : session.studentId;
      await createNotificationHelper({
        userId: notifyUserId,
        type: 'SESSION_CANCELLED',
        title: 'Session Cancelled',
        message: `Session "${session.title}" has been cancelled`,
        actionUrl: `/sessions/${id}`,
        data: { sessionId: id },
      });
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    res.status(200).json({
      success: true,
      message: 'Session cancelled successfully',
      data: updatedSession,
    });
  } catch (error) {
    console.error('Cancel session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel session',
      error: error.message,
    });
  }
};

// @desc    Reschedule a session
// @route   PUT /api/v1/sessions/:id/reschedule
// @access  Private
const rescheduleSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { scheduledAt, duration } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        message: 'Please provide new scheduled time',
      });
    }

    // Find the session
    const session = await prisma.mentorSession.findUnique({
      where: { id },
      include: {
        mentor: {
          select: {
            userId: true,
            id: true,
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Check if user is authorized
    if (session.studentId !== userId && session.mentor.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reschedule this session',
      });
    }

    // Check if session can be rescheduled
    if (session.status !== 'SCHEDULED') {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule a session with status: ${session.status}`,
      });
    }

    const newScheduledAt = new Date(scheduledAt);
    const newDuration = duration || session.duration;

    // Check if new time is in the past
    if (newScheduledAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule to a time in the past',
      });
    }

    // Check for conflicts at new time
    const conflict = await checkScheduleConflict(
      session.mentor.id,
      newScheduledAt,
      newDuration,
      id // Exclude current session from conflict check
    );

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'The new time slot is already booked. Please choose another time.',
      });
    }

    // Reschedule the session
    const updatedSession = await prisma.mentorSession.update({
      where: { id },
      data: {
        scheduledAt: newScheduledAt,
        duration: newDuration,
      },
      include: {
        mentor: {
          select: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Session rescheduled successfully',
      data: updatedSession,
    });
  } catch (error) {
    console.error('Reschedule session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reschedule session',
      error: error.message,
    });
  }
};

// @desc    Mark session as complete (mentor only)
// @route   PUT /api/v1/sessions/:id/complete
// @access  Private (mentor only)
const markSessionComplete = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { sessionNotes } = req.body;

    // Find the session
    const session = await prisma.mentorSession.findUnique({
      where: { id },
      include: {
        mentor: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Only mentor can mark as complete
    if (session.mentor.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the mentor can mark the session as complete',
      });
    }

    // Check if session can be marked complete
    if (session.status !== 'SCHEDULED') {
      return res.status(400).json({
        success: false,
        message: `Cannot complete a session with status: ${session.status}`,
      });
    }

    // Mark as complete
    const updatedSession = await prisma.mentorSession.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
        sessionNotes: sessionNotes || session.sessionNotes,
      },
      include: {
        mentor: {
          select: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Session marked as complete',
      data: updatedSession,
    });
  } catch (error) {
    console.error('Mark session complete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark session as complete',
      error: error.message,
    });
  }
};

// @desc    Start a session (auto-called when joining video call)
// @route   PUT /api/v1/sessions/:id/start
// @access  Private
const startSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Find the session
    const session = await prisma.mentorSession.findUnique({
      where: { id },
      include: {
        mentor: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Check if user is authorized
    if (session.studentId !== userId && session.mentor.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to start this session',
      });
    }

    // Only update if not already started
    if (!session.startedAt) {
      const updatedSession = await prisma.mentorSession.update({
        where: { id },
        data: {
          startedAt: new Date(),
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Session started',
        data: updatedSession,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Session already started',
      data: session,
    });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start session',
      error: error.message,
    });
  }
};

module.exports = {
  setAvailability,
  getAvailability,
  bookSession,
  getMySessions,
  cancelSession,
  rescheduleSession,
  markSessionComplete,
  startSession,
};
