const { prisma } = require('../config/database');
const { createResponse } = require('../utils/helpers');
const crypto = require('crypto');
const { chatWithAI } = require('../services/multiAiService');

// Generate a unique share code
const generateShareCode = () => {
  return crypto.randomBytes(10).toString('hex');
};

// POST /api/v1/share - Create a share link for a session
const createShareLink = async (req, res) => {
  try {
    console.log('=== CREATE SHARE LINK DEBUG ===');
    console.log('Request body:', req.body);
    console.log('User from request:', req.user);
    
    const { sessionId, title, description, allowComments, expirationDays, isPublic, password, allowScroll } = req.body;
    const userId = req.user?.userId;

    console.log('Extracted sessionId:', sessionId);
    console.log('Extracted userId:', userId);

    if (!userId) {
      console.log('ERROR: No userId found');
      return res.status(401).json(
        createResponse('error', 'Authentication required')
      );
    }

    // Verify the session belongs to the user
    console.log('Looking for session with ID:', sessionId, 'for user:', userId);
    const session = await prisma.careerSession.findFirst({
      where: {
        id: sessionId,
        userId: userId,
      },
    });

    console.log('Found session:', session);

    if (!session) {
      console.log('ERROR: Session not found or access denied');
      console.log('Available sessions for user:', await prisma.careerSession.findMany({
        where: { userId: userId },
        select: { id: true, title: true, createdAt: true },
        take: 5
      }));
      return res.status(404).json(
        createResponse('error', `Session not found or access denied. Session ID: ${sessionId}`)
      );
    }

    // Generate share code and calculate expiry
    const shareCode = generateShareCode();
    const expiresAt = expirationDays ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000) : null;

    // Generate share link
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const shareLink = `${baseUrl}/share/${shareCode}`;

    // Create shared conversation record
    console.log('Creating shared conversation with data:', {
      sessionId,
      shareCode,
      shareUrl: shareLink,
      title: title || session.title || 'Career Chat Session',
      description: description || null,
      isPublic: isPublic !== undefined ? isPublic : true,
      allowComments: allowComments !== undefined ? allowComments : false,
      allowScroll: allowScroll !== undefined ? allowScroll : false,
      password: password || null,
      expiresAt,
      viewCount: 0,
      createdById: userId,
    });

    const sharedConversation = await prisma.sharedConversation.create({
      data: {
        sessionId,
        shareCode,
        shareUrl: shareLink,
        title: title || session.title || 'Career Chat Session',
        description: description || null,
        isPublic: isPublic !== undefined ? isPublic : true,
        allowComments: allowComments !== undefined ? allowComments : false,
        allowScroll: allowScroll !== undefined ? allowScroll : false,
        password: password || null,
        expiresAt,
        viewCount: 0,
        createdById: userId,
      },
    });

    console.log('Created shared conversation:', sharedConversation);

    const shareSettings = {
      id: sharedConversation.id,
      shareLink,
      shareCode,
      title: sharedConversation.title,
      description: sharedConversation.description,
      allowComments: sharedConversation.allowComments,
      allowScroll: sharedConversation.allowScroll,
      isPublic: sharedConversation.isPublic,
      expiresAt: sharedConversation.expiresAt,
      createdAt: sharedConversation.createdAt,
      viewCount: sharedConversation.viewCount,
    };

    res.status(201).json(
      createResponse('success', 'Share link created successfully', shareSettings)
    );
  } catch (error) {
    console.error('=== CREATE SHARE LINK ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', error);
    res.status(500).json(
      createResponse('error', 'Failed to create share link', {
        errorCode: 'SHARE_CREATION_FAILED',
        details: error.message
      })
    );
  }
};

// GET /api/v1/share/:shareCode - Get shared conversation
const getSharedConversation = async (req, res) => {
  try {
    const { shareCode } = req.params;
    console.log('Looking for share with code:', shareCode);

    const sharedConversation = await prisma.sharedConversation.findFirst({
      where: {
        shareCode,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        careerSession: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              }
            }
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        }
      }
    });

    if (!sharedConversation) {
      console.log('No shared conversation found for code:', shareCode);
      return res.status(404).json(
        createResponse('error', 'Shared conversation not found or expired')
      );
    }

    console.log('Found shared conversation:', sharedConversation.id, sharedConversation.title);

    // Increment view count
    await prisma.sharedConversation.update({
      where: { id: sharedConversation.id },
      data: { viewCount: { increment: 1 } },
    });

    // Parse messages
    const messages = JSON.parse(sharedConversation.careerSession.messages);
    console.log('Parsed messages:', messages);
    console.log('Messages length:', messages.length);

    const responseData = {
      id: sharedConversation.id,
      title: sharedConversation.title,
      messages,
      createdBy: {
        name: sharedConversation.createdBy.name,
        avatar: sharedConversation.createdBy.avatar,
      },
      createdAt: sharedConversation.careerSession.createdAt,
      sharedAt: sharedConversation.createdAt,
      viewCount: sharedConversation.viewCount + 1,
      allowComments: sharedConversation.allowComments,
      allowScroll: sharedConversation.allowScroll,
      isPublic: sharedConversation.isPublic,
      expiresAt: sharedConversation.expiresAt,
    };

    res.status(200).json(
      createResponse('success', 'Shared conversation retrieved', responseData)
    );
  } catch (error) {
    console.error('Get shared conversation error:', error);
    res.status(500).json(
      createResponse('error', 'Failed to retrieve shared conversation')
    );
  }
};

// POST /api/v1/share/:shareCode/message - Send message in shared conversation
const sendMessageInSharedConversation = async (req, res) => {
  try {
    const { shareCode } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json(
        createResponse('error', 'Message is required')
      );
    }

    // Find the shared conversation
    const sharedConversation = await prisma.sharedConversation.findFirst({
      where: {
        shareCode,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        careerSession: true
      }
    });

    if (!sharedConversation) {
      return res.status(404).json(
        createResponse('error', 'Shared conversation not found or expired')
      );
    }

    // Parse existing messages
    const existingMessages = JSON.parse(sharedConversation.careerSession.messages);
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message to current messages array for AI context
    const currentMessages = [...existingMessages, userMessage];

    // Get user information for the original session creator
    const sessionUser = await prisma.user.findUnique({
      where: { id: sharedConversation.careerSession.userId },
      select: {
        id: true,
        name: true,
        role: true,
        bio: true,
      },
    });

    // Get AI response using the same multi-AI service as main chat
    const result = await chatWithAI(
      message.trim(),
      currentMessages,
      {
        userId: sessionUser?.id || 'shared-user',
        userName: sessionUser?.name || 'Guest',
        userRole: sessionUser?.role || 'Professional',
        userBio: sessionUser?.bio || 'Continuing a shared career conversation',
        taskType: 'general'
      }
    );

    // Create AI response message
    const aiMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: result.response,
      timestamp: new Date().toISOString(),
    };

    // Update messages array
    const updatedMessages = [...currentMessages, aiMessage];

    // Update the career session with new messages
    await prisma.careerSession.update({
      where: { id: sharedConversation.careerSession.id },
      data: { 
        messages: JSON.stringify(updatedMessages),
        updatedAt: new Date()
      },
    });

    res.status(200).json(
      createResponse('success', 'Message sent successfully', {
        reply: aiMessage.content,
        timestamp: aiMessage.timestamp,
        sessionId: sharedConversation.careerSession.id
      })
    );
  } catch (error) {
    console.error('Send message in shared conversation error:', error);
    res.status(500).json(
      createResponse('error', 'Failed to send message')
    );
  }
};

// GET /api/v1/share/session/:sessionId - Get all shares for a session
const getSessionShares = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json(
        createResponse('error', 'Authentication required')
      );
    }

    const shares = await prisma.sharedConversation.findMany({
      where: {
        sessionId,
        createdById: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const sharesList = shares.map(share => ({
      id: share.id,
      shareLink: share.shareUrl,
      shareCode: share.shareCode,
      title: share.title,
      allowComments: share.allowComments,
      isPublic: share.isPublic,
      expiresAt: share.expiresAt,
      createdAt: share.createdAt,
      viewCount: share.viewCount,
    }));

    res.status(200).json(
      createResponse('success', 'Session shares retrieved', { shares: sharesList })
    );
  } catch (error) {
    console.error('Get session shares error:', error);
    res.status(500).json(
      createResponse('error', 'Failed to retrieve session shares')
    );
  }
};

// DELETE /api/v1/share/:shareId - Delete/revoke a share
const revokeShare = async (req, res) => {
  try {
    const { shareId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json(
        createResponse('error', 'Authentication required')
      );
    }

    const share = await prisma.sharedConversation.findFirst({
      where: {
        id: shareId,
        createdById: userId,
      },
    });

    if (!share) {
      return res.status(404).json(
        createResponse('error', 'Share not found or access denied')
      );
    }

    await prisma.sharedConversation.delete({
      where: { id: shareId },
    });

    res.status(200).json(
      createResponse('success', 'Share revoked successfully')
    );
  } catch (error) {
    console.error('Revoke share error:', error);
    res.status(500).json(
      createResponse('error', 'Failed to revoke share')
    );
  }
};

module.exports = {
  createShareLink,
  getSharedConversation,
  sendMessageInSharedConversation,
  getSessionShares,
  revokeShare,
};