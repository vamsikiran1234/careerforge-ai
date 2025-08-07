const { asyncHandler, createResponse } = require('../utils/helpers');
const { prisma } = require('../config/database');
const aiService = require('../services/aiService');

const chatController = {
  // POST /api/v1/chat
  createChatSession: asyncHandler(async (req, res) => {
    const { message } = req.body;
    const userEmail = req.user.email || req.user.userEmail; // Get email from JWT

    console.log('Chat request - User:', req.user, 'Email:', userEmail);

    // Find user by email since in-memory auth uses different ID format
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return res.status(404).json(
        createResponse('error', 'User not found in database')
      );
    }

    console.log('Found user in database:', user.id);

    // Get or create active career session
    let session = await prisma.careerSession.findFirst({
      where: {
        userId: user.id,
        endedAt: null,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!session) {
      session = await prisma.careerSession.create({
        data: {
          userId: user.id,
          title: `Career Chat - ${new Date().toLocaleDateString()}`,
          messages: JSON.stringify([]),
        },
      });
    }

    // Get current messages - parse from JSON string
    const currentMessages = Array.isArray(session.messages) 
      ? session.messages 
      : JSON.parse(session.messages || '[]');

    // Add user message to history
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    currentMessages.push(userMessage);

    // Get AI response
    const aiReply = await aiService.chatReply(user.id, message, currentMessages);

    // Add AI response to history
    const assistantMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiReply,
      timestamp: new Date().toISOString(),
    };

    currentMessages.push(assistantMessage);

    // Update session with new messages - store as JSON string
    const updatedSession = await prisma.careerSession.update({
      where: { id: session.id },
      data: {
        messages: JSON.stringify(currentMessages),
        updatedAt: new Date(),
      },
    });

    res.status(200).json(
      createResponse('success', 'Chat message processed successfully', {
        sessionId: updatedSession.id,
        reply: aiReply,
        timestamp: assistantMessage.timestamp,
        messageCount: currentMessages.length,
      })
    );
  }),

  // GET /api/v1/chat/sessions
  getUserSessions: asyncHandler(async (req, res) => {
    const userEmail = req.user.email || req.user.userEmail; // Get email from JWT

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return res.status(404).json(
        createResponse('error', 'User not found in database')
      );
    }

    const sessions = await prisma.careerSession.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        endedAt: true,
      },
    });

    res.status(200).json(
      createResponse('success', 'User sessions retrieved successfully', {
        sessions,
        totalSessions: sessions.length,
      })
    );
  }),

  // GET /api/v1/chat/session/:sessionId
  getSessionMessages: asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const session = await prisma.careerSession.findUnique({
      where: { id: sessionId },
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

    if (!session) {
      return res.status(404).json(
        createResponse('error', 'Session not found')
      );
    }

    res.status(200).json(
      createResponse('success', 'Session messages retrieved successfully', {
        session: {
          id: session.id,
          title: session.title,
          messages: JSON.parse(session.messages || '[]'), // Parse JSON string
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          user: session.user,
        },
      })
    );
  }),

  // PUT /api/v1/chat/session/:sessionId/end
  endSession: asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const session = await prisma.careerSession.update({
      where: { id: sessionId },
      data: {
        endedAt: new Date(),
      },
    });

    res.status(200).json(
      createResponse('success', 'Session ended successfully', {
        sessionId: session.id,
        endedAt: session.endedAt,
      })
    );
  }),
};

module.exports = chatController;
