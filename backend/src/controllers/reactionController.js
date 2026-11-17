const { asyncHandler, createResponse } = require('../utils/helpers');
const { prisma } = require('../config/database');

// Fast user resolution: reuse req.user id from JWT, fallback to DB only if missing
const getUserIdFromReq = async (req) => {
  if (req.user && (req.user.id || req.user.userId)) {
    return req.user.id || req.user.userId;
  }
  const userEmail = req.user?.email || req.user?.userEmail;
  if (!userEmail) return null;
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true },
  });
  return user?.id || null;
};

const reactionController = {
  // POST /api/v1/reactions - Add or update a reaction to a message
  addReaction: asyncHandler(async (req, res) => {
    const { sessionId, messageId, reactionType, feedback } = req.body;

    // Validate reaction type
    const validReactionTypes = ['THUMBS_UP', 'THUMBS_DOWN', 'BOOKMARK', 'STAR'];
    if (!validReactionTypes.includes(reactionType)) {
      return res.status(400).json(
        createResponse('error', 'Invalid reaction type')
      );
    }

    const userId = await getUserIdFromReq(req);
    if (!userId) {
      return res.status(404).json(
        createResponse('error', 'User not found')
      );
    }

    try {
      // Use upsert to create or update reaction directly
      const reaction = await prisma.messageReaction.upsert({
        where: {
          userId_sessionId_messageId_reactionType: {
            userId,
            sessionId,
            messageId,
            reactionType,
          },
        },
        update: {
          feedback,
          updatedAt: new Date(),
        },
        create: {
          sessionId,
          messageId,
          userId,
          reactionType,
          feedback,
        },
      });

      res.status(200).json(
        createResponse('success', 'Reaction added successfully', {
          reaction: {
            id: reaction.id,
            reactionType: reaction.reactionType,
            feedback: reaction.feedback,
            createdAt: reaction.createdAt,
          }
        })
      );
    } catch (error) {
      console.error('Add reaction error:', error);
      res.status(500).json(
        createResponse('error', 'Failed to add reaction')
      );
    }
  }),

  // DELETE /api/v1/reactions/:reactionId - Remove a reaction
  removeReaction: asyncHandler(async (req, res) => {
    const { reactionId } = req.params;
    const userId = await getUserIdFromReq(req);

    if (!userId) {
      return res.status(404).json(
        createResponse('error', 'User not found')
      );
    }

    // Find reaction and verify ownership
    const reaction = await prisma.messageReaction.findFirst({
      where: {
        id: reactionId,
        userId,
      },
    });

    if (!reaction) {
      return res.status(404).json(
        createResponse('error', 'Reaction not found or access denied')
      );
    }

    // Delete the reaction
    await prisma.messageReaction.delete({
      where: { id: reactionId },
    });

    res.status(200).json(
      createResponse('success', 'Reaction removed successfully')
    );
  }),

  // GET /api/v1/reactions/session/:sessionId - Get all reactions for a session
  getSessionReactions: asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    // Fast-path: temporary client-side session IDs have no reactions
    if (sessionId && sessionId.startsWith('temp-')) {
      return res.status(200).json(
        createResponse('success', 'Reactions retrieved successfully', {
          reactions: {},
          totalReactions: 0,
        })
      );
    }

    const userId = await getUserIdFromReq(req);
    if (!userId) {
      return res.status(404).json(
        createResponse('error', 'User not found')
      );
    }

    // Direct indexed query for session reactions
    const reactions = await prisma.messageReaction.findMany({
      where: {
        sessionId,
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group reactions by messageId
    const reactionsByMessage = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.messageId]) {
        acc[reaction.messageId] = [];
      }
      acc[reaction.messageId].push({
        id: reaction.id,
        reactionType: reaction.reactionType,
        feedback: reaction.feedback,
        createdAt: reaction.createdAt,
      });
      return acc;
    }, {});

    res.status(200).json(
      createResponse('success', 'Session reactions retrieved successfully', {
        reactions: reactionsByMessage,
        totalReactions: reactions.length,
      })
    );
  }),

  // GET /api/v1/reactions/message/:messageId - Get reactions for specific message
  getMessageReactions: asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const { sessionId } = req.query;
    const userEmail = req.user.email || req.user.userEmail;

    if (!sessionId) {
      return res.status(400).json(
        createResponse('error', 'Session ID is required')
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return res.status(404).json(
        createResponse('error', 'User not found')
      );
    }

    // Verify session access
    const session = await prisma.careerSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
      },
    });

    if (!session) {
      return res.status(404).json(
        createResponse('error', 'Session not found or access denied')
      );
    }

    // Get reactions for the specific message
    const reactions = await prisma.messageReaction.findMany({
      where: {
        messageId,
        sessionId,
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(
      createResponse('success', 'Message reactions retrieved successfully', {
        reactions: reactions.map(reaction => ({
          id: reaction.id,
          reactionType: reaction.reactionType,
          feedback: reaction.feedback,
          createdAt: reaction.createdAt,
        })),
        totalReactions: reactions.length,
      })
    );
  }),
};

module.exports = reactionController;