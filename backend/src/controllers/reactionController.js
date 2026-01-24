const { asyncHandler, createResponse } = require('../utils/helpers');
const { prisma } = require('../config/database');

const reactionController = {
  // POST /api/v1/reactions - Add or update a reaction to a message
  addReaction: asyncHandler(async (req, res) => {
    const { sessionId, messageId, reactionType, feedback } = req.body;
    const userEmail = req.user.email || req.user.userEmail;

    // Validate reaction type
    const validReactionTypes = ['THUMBS_UP', 'THUMBS_DOWN', 'BOOKMARK', 'STAR'];
    if (!validReactionTypes.includes(reactionType)) {
      return res.status(400).json(
        createResponse('error', 'Invalid reaction type')
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

    // Check if session exists and belongs to user
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

    try {
      // Use upsert to create or update reaction
      const reaction = await prisma.messageReaction.upsert({
        where: {
          userId_sessionId_messageId_reactionType: {
            userId: user.id,
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
          userId: user.id,
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
    const userEmail = req.user.email || req.user.userEmail;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return res.status(404).json(
        createResponse('error', 'User not found')
      );
    }

    // Find reaction and verify ownership
    const reaction = await prisma.messageReaction.findFirst({
      where: {
        id: reactionId,
        userId: user.id,
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
    const userEmail = req.user.email || req.user.userEmail;

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

    // Get all reactions for the session
    const reactions = await prisma.messageReaction.findMany({
      where: {
        sessionId,
        userId: user.id,
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