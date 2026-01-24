const { asyncHandler, createResponse } = require('../utils/helpers');
const { prisma } = require('../config/database');
const aiService = require('../services/multiAiService');
const { processUploadedFiles, createFileContext } = require('../services/fileService');
const { generateTitleFromMessage } = require('../utils/titleGenerator');

// Constants
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_BAD_REQUEST = 400;
const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_ERROR = 500;

const chatController = {
  // POST /api/v1/chat
  createChatSession: asyncHandler(async (req, res) => {
    const { message, sessionId } = req.body; // Accept sessionId from frontend
    const userEmail = req.user.email || req.user.userEmail; // Get email from JWT

    // eslint-disable-next-line no-console
    console.log('Chat request - User:', req.user, 'Email:', userEmail, 'SessionId:', sessionId);

    // Find user by email since in-memory auth uses different ID format
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return res.status(HTTP_STATUS_NOT_FOUND).json(
        createResponse('error', 'User not found in database')
      );
    }

    // eslint-disable-next-line no-console
    console.log('Found user in database:', user.id);

    let session = null;
    
    // If sessionId is provided, try to find that specific session
    if (sessionId && !sessionId.startsWith('temp-')) {
      // eslint-disable-next-line no-console
      console.log('Looking for specific session:', sessionId);
      session = await prisma.careerSession.findFirst({
        where: {
          id: sessionId,
          userId: user.id,
        },
      });
      // eslint-disable-next-line no-console
      console.log('Found specific session:', session?.id);
    }
    
    // If no specific session found, create a new one
    if (!session) {
      // eslint-disable-next-line no-console
      console.log('Creating new session for user:', user.id);
      
      // Generate intelligent title from the first message
      const smartTitle = generateTitleFromMessage(message);
      
      session = await prisma.careerSession.create({
        data: {
          userId: user.id,
          title: smartTitle,
          messages: JSON.stringify([]),
        },
      });
      // eslint-disable-next-line no-console
      console.log('Created new session:', session.id, 'with title:', smartTitle);
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

    // Get AI response using multi-AI service with automatic fallback
    const { chatWithAI } = require('../services/multiAiService');
    const result = await chatWithAI(
      message,
      currentMessages,
      {
        userId: user.id,
        userName: user.name,
        userRole: JSON.parse(user.roles || '["STUDENT"]').join(', '),
        userBio: user.bio,
        taskType: 'general'
      }
    );
    
    const aiReply = result.response;

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

    return res.status(HTTP_STATUS_OK).json(
      createResponse('success', 'Chat message processed successfully', {
        sessionId: updatedSession.id,
        title: updatedSession.title, // Include the session title
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
      return res.status(HTTP_STATUS_NOT_FOUND).json(
        createResponse('error', 'User not found in database')
      );
    }

    const sessions = await prisma.careerSession.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        messages: true, // Include messages to show session count in sidebar
        createdAt: true,
        updatedAt: true,
        endedAt: true,
      },
    });

    // Parse messages JSON string for each session
    const parsedSessions = sessions.map(session => ({
      ...session,
      messages: JSON.parse(session.messages || '[]'),
    }));

    return res.status(HTTP_STATUS_OK).json(
      createResponse('success', 'User sessions retrieved successfully', {
        sessions: parsedSessions,
        totalSessions: parsedSessions.length,
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
      return res.status(HTTP_STATUS_NOT_FOUND).json(
        createResponse('error', 'Session not found')
      );
    }

    return res.status(HTTP_STATUS_OK).json(
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

    return res.status(HTTP_STATUS_OK).json(
      createResponse('success', 'Session ended successfully', {
        sessionId: session.id,
        endedAt: session.endedAt,
      })
    );
  }),

  // DELETE /api/v1/chat/session/:sessionId
  deleteSession: asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const userEmail = req.user.email || req.user.userEmail;

    // eslint-disable-next-line no-console
    console.log('Delete session request:', { sessionId, userEmail });

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return res.status(HTTP_STATUS_NOT_FOUND).json(
        createResponse('error', 'User not found in database')
      );
    }

    // Verify the session belongs to the user before deleting
    const session = await prisma.careerSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
      },
    });

    if (!session) {
      return res.status(HTTP_STATUS_NOT_FOUND).json(
        createResponse('error', 'Session not found or you do not have permission to delete it')
      );
    }

    // Delete the session from database
    await prisma.careerSession.delete({
      where: { id: sessionId },
    });

    // eslint-disable-next-line no-console
    console.log('Session deleted successfully:', sessionId);

    return res.status(HTTP_STATUS_OK).json(
      createResponse('success', 'Session deleted successfully', {
        sessionId: sessionId,
      })
    );
  }),

  // POST /api/v1/chat/upload
  uploadAndAnalyze: asyncHandler(async (req, res) => {
    const { message, sessionId } = req.body; // Accept sessionId from frontend
    const files = req.files;
    const userEmail = req.user.email || req.user.userEmail;

    // eslint-disable-next-line no-console
    console.log('File upload request - User:', userEmail, 'Files:', files?.length || 0, 'SessionId:', sessionId);

    if (!files || files.length === 0) {
      return res.status(HTTP_STATUS_BAD_REQUEST).json(
        createResponse('error', 'No files uploaded')
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return res.status(HTTP_STATUS_NOT_FOUND).json(
        createResponse('error', 'User not found in database')
      );
    }

    // Process uploaded files
    const processedFiles = await processUploadedFiles(files);
    
    if (processedFiles.length === 0) {
      return res.status(HTTP_STATUS_BAD_REQUEST).json(
        createResponse('error', 'No files could be processed successfully')
      );
    }

    let session = null;
    
    // If sessionId is provided, try to find that specific session
    if (sessionId && !sessionId.startsWith('temp-')) {
      console.log('Looking for specific session:', sessionId);
      session = await prisma.careerSession.findFirst({
        where: {
          id: sessionId,
          userId: user.id,
        },
      });
      console.log('Found specific session:', session?.id);
    }
    
    // If no specific session found, create a new one
    if (!session) {
      console.log('Creating new session for file upload');
      session = await prisma.careerSession.create({
        data: {
          userId: user.id,
          title: `File Analysis - ${new Date().toLocaleDateString()}`,
          messages: JSON.stringify([]),
        },
      });
      console.log('Created new session:', session.id);
    }

    // Get current messages
    const currentMessages = Array.isArray(session.messages) 
      ? session.messages 
      : JSON.parse(session.messages || '[]');

    // Create file context for AI analysis
    const fileContext = createFileContext(processedFiles);
    
    // Create user message with file information
    const fileInfo = processedFiles.map(f => `📎 ${f.filename} (${f.type})`).join(', ');
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message || `I've uploaded the following documents: ${fileInfo}. Please analyze them and let me know what questions I can ask.`,
      files: processedFiles.map(f => ({
        name: f.filename,
        type: f.type,
        size: f.size,
        pages: f.pages
      })),
      timestamp: new Date().toISOString(),
    };

    currentMessages.push(userMessage);

    // Get AI response with file context - use higher token limit model for file analysis
    const messageWithContext = `${message || 'Please analyze these documents:'}\n${fileContext}`;
    
    // Use multi-AI service with automatic model selection and fallback
    const { chatWithAI } = require('../services/multiAiService');
    const result = await chatWithAI(
      messageWithContext,
      currentMessages,
      {
        userId: user.id,
        userName: user.name,
        userRole: JSON.parse(user.roles || '["STUDENT"]').join(', '),
        userBio: user.bio,
        taskType: 'document' // Indicate this is for document analysis
      }
    );
    
    const aiReply = result.response;

    // Add AI response to history
    const assistantMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiReply,
      timestamp: new Date().toISOString(),
    };

    currentMessages.push(assistantMessage);

    // Update session with new messages
    const updatedSession = await prisma.careerSession.update({
      where: { id: session.id },
      data: {
        messages: JSON.stringify(currentMessages),
        updatedAt: new Date(),
      },
    });

    return res.status(HTTP_STATUS_OK).json(
      createResponse('success', 'Files uploaded and analyzed successfully', {
        sessionId: updatedSession.id,
        reply: aiReply,
        timestamp: assistantMessage.timestamp,
        messageCount: currentMessages.length,
        processedFiles: processedFiles.map(f => ({
          name: f.filename,
          type: f.type,
          size: f.size,
          pages: f.pages
        }))
      })
    );
  }),

  // GET /api/v1/chat/models - Get available AI models
  getAvailableModels: asyncHandler(async (req, res) => {
    try {
      const models = aiService.getAvailableAIModels();
      
      return res.status(HTTP_STATUS_OK).json(
        createResponse('success', 'Available AI models retrieved successfully', {
          models: models,
          count: models.length,
          defaultModel: models.length > 0 ? models[0].id : null
        })
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Get models error:', error);
      return res.status(HTTP_STATUS_ERROR).json(
        createResponse('error', 'Failed to retrieve available models')
      );
    }
  }),
};

module.exports = chatController;
