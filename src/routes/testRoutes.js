// Test endpoint to create a sample shared conversation
const express = require('express');
const { prisma } = require('../config/database');
const { createResponse } = require('../utils/helpers');
const crypto = require('crypto');

const router = express.Router();

// Generate a unique share code
const generateShareCode = () => {
  return crypto.randomBytes(10).toString('hex');
};

// POST /api/v1/test/create-share - Create a test share
router.post('/create-share', async (req, res) => {
  try {
    // First, get or create a test user
    let testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'hashedpassword123'
        }
      });
    }

    // Get or create a test session
    let testSession = await prisma.careerSession.findFirst({
      where: { userId: testUser.id }
    });

    if (!testSession) {
      testSession = await prisma.careerSession.create({
        data: {
          userId: testUser.id,
          title: 'Test Career Chat',
          messages: JSON.stringify([
            {
              role: 'user',
              content: 'I need help with my career path in software development.',
              timestamp: new Date().toISOString(),
              id: '1'
            },
            {
              role: 'assistant',
              content: 'I\'d be happy to help you with your career path in software development! Here are some key areas to focus on:\n\n1. **Technical Skills**: Master programming languages relevant to your interests\n2. **Build Projects**: Create a portfolio showcasing your abilities\n3. **Network**: Connect with other developers and attend tech events\n4. **Continuous Learning**: Stay updated with industry trends\n\nWhat specific area of software development interests you most?',
              timestamp: new Date().toISOString(),
              id: '2'
            }
          ])
        }
      });
    }

    // Create shared conversation
    const shareCode = generateShareCode();
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const shareLink = `${baseUrl}/share/${shareCode}`;

    const sharedConversation = await prisma.sharedConversation.create({
      data: {
        sessionId: testSession.id,
        shareCode,
        shareUrl: shareLink,
        title: testSession.title,
        isPublic: true,
        allowComments: false,
        allowScroll: true,
        viewCount: 0,
        createdById: testUser.id,
      },
    });

    res.status(201).json(
      createResponse('success', 'Test share created', {
        shareLink,
        shareCode,
        sharedConversationId: sharedConversation.id
      })
    );
  } catch (error) {
    console.error('Create test share error:', error);
    res.status(500).json(
      createResponse('error', 'Failed to create test share')
    );
  }
});

module.exports = router;