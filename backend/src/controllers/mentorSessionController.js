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

    // Validate each availability slot
    for (const slot of availability) {
      if (
        typeof slot.dayOfWeek !== 'number' ||
        slot.dayOfWeek < 0 ||
        slot.dayOfWeek > 6
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid day of week. Must be 0-6 (Sunday-Saturday)',
        });
      }

      if (!slot.startTime || !slot.endTime) {
        return res.status(400).json({
          success: false,
          message: 'Start time and end time are required',
        });
      }

      // Validate time format (HH:mm)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid time format. Use HH:mm (24-hour format)',
        });
      }

      // Validate end time is after start time
      const [startHour, startMin] = slot.startTime.split(':').map(Number);
      const [endHour, endMin] = slot.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time',
        });
      }
    }

    // Delete existing availability for this mentor
    await prisma.mentorAvailability.deleteMany({
      where: { mentorId: mentorProfile.id },
    });

    // Create new availability slots
    await prisma.mentorAvailability.createMany({
      data: availability.map(slot => ({
        mentorId: mentorProfile.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        timezone: timezone || 'UTC',
        isActive: true,
      })),
    });

    // Update mentor profile timezone
    await prisma.mentorProfile.update({
      where: { userId },
      data: { timezone: timezone || 'UTC' },
    });

    // Fetch the created availability to return
    const savedAvailability = await prisma.mentorAvailability.findMany({
      where: { mentorId: mentorProfile.id },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: {
        availability: savedAvailability,
        timezone: timezone || 'UTC',
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
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatar: true,
          },
        },
        availability: {
          where: { isActive: true },
          orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' },
          ],
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const bookedSessions = await prisma.mentorSession.findMany({
      where: {
        mentorId,
        status: 'SCHEDULED',
        scheduledAt: {
          gte: today,
        },
      },
      select: {
        id: true,
        scheduledAt: true,
        duration: true,
        status: true,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    // Calculate available time slots for next 30 days
    const availableSlots = generateAvailableSlots(
      mentorProfile.availability,
      bookedSessions,
      mentorProfile.timezone,
      30 // days to look ahead
    );

    res.status(200).json({
      success: true,
      data: {
        mentor: {
          id: mentorProfile.id,
          name: mentorProfile.user.name,
          email: mentorProfile.user.email,
          avatar: mentorProfile.user.avatar,
          company: mentorProfile.company,
          jobTitle: mentorProfile.jobTitle,
          timezone: mentorProfile.timezone,
          availableHoursPerWeek: mentorProfile.availableHoursPerWeek,
          preferredMeetingType: mentorProfile.preferredMeetingType,
        },
        weeklySchedule: mentorProfile.availability,
        bookedSlots: bookedSessions,
        availableSlots: availableSlots,
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

// Helper function to generate available time slots
const generateAvailableSlots = (weeklyAvailability, bookedSessions, timezone, daysAhead) => {
  const slots = [];
  const now = new Date();
  
  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    date.setHours(0, 0, 0, 0);
    
    const dayOfWeek = date.getDay(); // 0-6
    
    // Find availability for this day of week
    const dayAvailability = weeklyAvailability.filter(
      slot => slot.dayOfWeek === dayOfWeek && slot.isActive
    );
    
    for (const availSlot of dayAvailability) {
      const [startHour, startMin] = availSlot.startTime.split(':').map(Number);
      const [endHour, endMin] = availSlot.endTime.split(':').map(Number);
      
      // Generate 30-minute slots
      let currentHour = startHour;
      let currentMin = startMin;
      
      while (
        currentHour < endHour ||
        (currentHour === endHour && currentMin < endMin)
      ) {
        const slotStart = new Date(date);
        slotStart.setHours(currentHour, currentMin, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + 30); // 30-minute slots
        
        // Check if slot is in the past
        if (slotStart <= now) {
          currentMin += 30;
          if (currentMin >= 60) {
            currentHour += 1;
            currentMin = 0;
          }
          continue;
        }
        
        // Check if slot overlaps with booked sessions
        const isBooked = bookedSessions.some(session => {
          const sessionStart = new Date(session.scheduledAt);
          const sessionEnd = new Date(sessionStart);
          sessionEnd.setMinutes(sessionEnd.getMinutes() + session.duration);
          
          return (
            (slotStart >= sessionStart && slotStart < sessionEnd) ||
            (slotEnd > sessionStart && slotEnd <= sessionEnd) ||
            (slotStart <= sessionStart && slotEnd >= sessionEnd)
          );
        });
        
        if (!isBooked) {
          slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            dayOfWeek: dayOfWeek,
            displayTime: `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`,
          });
        }
        
        currentMin += 30;
        if (currentMin >= 60) {
          currentHour += 1;
          currentMin = 0;
        }
      }
    }
  }
  
  return slots;
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
        studentId: studentId,
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

// @desc    Get mentor's own availability slots
// @route   GET /api/v1/sessions/my-availability
// @access  Private (mentor only)
const getMyAvailability = async (req, res) => {
  try {
    const userId = req.user.userId;

    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId },
      include: {
        availability: {
          where: { isActive: true },
          orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' },
          ],
        },
      },
    });

    if (!mentorProfile) {
      return res.status(403).json({
        success: false,
        message: 'Only registered mentors can view availability',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        availability: mentorProfile.availability,
        timezone: mentorProfile.timezone,
      },
    });
  } catch (error) {
    console.error('Get my availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch availability',
      error: error.message,
    });
  }
};

// @desc    Update a specific availability slot
// @route   PUT /api/v1/sessions/availability/:slotId
// @access  Private (mentor only)
const updateAvailabilitySlot = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { slotId } = req.params;
    const { dayOfWeek, startTime, endTime, isActive } = req.body;

    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId },
    });

    if (!mentorProfile) {
      return res.status(403).json({
        success: false,
        message: 'Only registered mentors can update availability',
      });
    }

    // Verify the slot belongs to this mentor
    const slot = await prisma.mentorAvailability.findUnique({
      where: { id: slotId },
    });

    if (!slot || slot.mentorId !== mentorProfile.id) {
      return res.status(404).json({
        success: false,
        message: 'Availability slot not found',
      });
    }

    // Validate if provided
    if (dayOfWeek !== undefined && (dayOfWeek < 0 || dayOfWeek > 6)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid day of week. Must be 0-6',
      });
    }

    const updateData = {};
    if (dayOfWeek !== undefined) updateData.dayOfWeek = dayOfWeek;
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedSlot = await prisma.mentorAvailability.update({
      where: { id: slotId },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: 'Availability slot updated successfully',
      data: updatedSlot,
    });
  } catch (error) {
    console.error('Update availability slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update availability slot',
      error: error.message,
    });
  }
};

// @desc    Delete an availability slot
// @route   DELETE /api/v1/sessions/availability/:slotId
// @access  Private (mentor only)
const deleteAvailabilitySlot = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { slotId } = req.params;

    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId },
    });

    if (!mentorProfile) {
      return res.status(403).json({
        success: false,
        message: 'Only registered mentors can delete availability',
      });
    }

    // Verify the slot belongs to this mentor
    const slot = await prisma.mentorAvailability.findUnique({
      where: { id: slotId },
    });

    if (!slot || slot.mentorId !== mentorProfile.id) {
      return res.status(404).json({
        success: false,
        message: 'Availability slot not found',
      });
    }

    await prisma.mentorAvailability.delete({
      where: { id: slotId },
    });

    res.status(200).json({
      success: true,
      message: 'Availability slot deleted successfully',
    });
  } catch (error) {
    console.error('Delete availability slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete availability slot',
      error: error.message,
    });
  }
};

module.exports = {
  setAvailability,
  getAvailability,
  getMyAvailability,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
  bookSession,
  getMySessions,
  cancelSession,
  rescheduleSession,
  markSessionComplete,
  startSession,
};
