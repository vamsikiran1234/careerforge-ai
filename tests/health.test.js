const request = require('supertest');
const app = require('../src/app');
const { generateTestToken } = require('./testUtils');

// Get mock prisma from global setup
const mockPrisma = global.mockPrisma;

// Mock AI service
const aiService = require('../src/services/aiService');

describe('Chat API Endpoints', () => {
  let authToken;

  beforeAll(() => {
    // Generate auth token for tests
    authToken = generateTestToken();
  });

  describe('POST /api/v1/chat', () => {
    const validChatRequest = {
      userId: 'user123',
      message: 'I want to become a software engineer',
    };

    beforeEach(() => {
      // Reset mocks
      jest.clearAllMocks();
    });

    test('should create chat session successfully', async () => {
      // Mock user exists
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'STUDENT',
      });

      // Mock no existing session
      mockPrisma.careerSession.findFirst.mockResolvedValue(null);

      // Mock session creation
      mockPrisma.careerSession.create.mockResolvedValue({
        id: 'session123',
        userId: 'user123',
        title: 'Career Chat - 7/19/2025',
        messages: [],
        createdAt: new Date(),
      });

      // Mock AI response
      aiService.chatReply.mockResolvedValue('Great question! Software engineering is an excellent career choice...');

      // Mock session update
      mockPrisma.careerSession.update.mockResolvedValue({
        id: 'session123',
        userId: 'user123',
        messages: [
          {
            id: '1',
            role: 'user',
            content: 'I want to become a software engineer',
            timestamp: new Date().toISOString(),
          },
          {
            id: '2',
            role: 'assistant',
            content: 'Great question! Software engineering is an excellent career choice...',
            timestamp: new Date().toISOString(),
          },
        ],
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validChatRequest)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Chat message processed successfully');
      expect(response.body.data).toHaveProperty('sessionId');
      expect(response.body.data).toHaveProperty('reply');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data).toHaveProperty('messageCount');

      // Verify database calls
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user123' },
      });
      expect(aiService.chatReply).toHaveBeenCalledWith(
        'user123',
        'I want to become a software engineer',
        expect.any(Array)
      );
    });

    test('should return 404 if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validChatRequest)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User not found');
    });

    test('should return 400 for missing userId', async () => {
      const response = await request(app)
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: 'Test message' })
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('User ID is required');
    });

    test('should return 400 for missing message', async () => {
      const response = await request(app)
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ userId: 'user123' })
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Message is required');
    });

    test('should return 400 for message too long', async () => {
      const longMessage = 'a'.repeat(50001);
      
      const response = await request(app)
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ userId: 'user123', message: longMessage })
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('cannot exceed 50,000 characters');
    });

    test('should continue existing session', async () => {
      // Mock user exists
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
      });

      // Mock existing session
      mockPrisma.careerSession.findFirst.mockResolvedValue({
        id: 'existing-session',
        userId: 'user123',
        messages: [
          {
            id: '1',
            role: 'user',
            content: 'Previous message',
            timestamp: new Date().toISOString(),
          },
        ],
      });

      aiService.chatReply.mockResolvedValue('Following up on your previous question...');

      mockPrisma.careerSession.update.mockResolvedValue({
        id: 'existing-session',
        messages: [
          {
            id: '1',
            role: 'user',
            content: 'Previous message',
            timestamp: new Date().toISOString(),
          },
          {
            id: '2',
            role: 'user',
            content: 'Follow up question',
            timestamp: new Date().toISOString(),
          },
          {
            id: '3',
            role: 'assistant',
            content: 'Following up on your previous question...',
            timestamp: new Date().toISOString(),
          },
        ],
      });

      const response = await request(app)
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ userId: 'user123', message: 'Follow up question' })
        .expect(200);

      expect(response.body.data.sessionId).toBe('existing-session');
      expect(response.body.data.messageCount).toBe(3);
      expect(mockPrisma.careerSession.create).not.toHaveBeenCalled();
    });

    test('should handle AI service errors', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
      });

      mockPrisma.careerSession.findFirst.mockResolvedValue(null);
      mockPrisma.careerSession.create.mockResolvedValue({
        id: 'session123',
        userId: 'user123',
        messages: [],
      });

      aiService.chatReply.mockRejectedValue(new Error('AI service unavailable'));

      const response = await request(app)
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validChatRequest)
        .expect(500);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('AI service unavailable');
    });
  });

  describe('GET /api/v1/chat/sessions/:userId', () => {
    test('should get user sessions successfully', async () => {
      const mockSessions = [
        {
          id: 'session1',
          title: 'Career Chat - Session 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          endedAt: null,
        },
        {
          id: 'session2',
          title: 'Career Chat - Session 2',
          createdAt: new Date(),
          updatedAt: new Date(),
          endedAt: new Date(),
        },
      ];

      mockPrisma.careerSession.findMany.mockResolvedValue(mockSessions);

      const response = await request(app)
        .get('/api/v1/chat/sessions/user123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.sessions).toHaveLength(2);
      expect(response.body.data.totalSessions).toBe(2);
    });
  });

  describe('GET /api/v1/chat/session/:sessionId', () => {
    test('should get session messages successfully', async () => {
      const mockSession = {
        id: 'session123',
        title: 'Career Chat Session',
        messages: [
          {
            id: '1',
            role: 'user',
            content: 'Hello',
            timestamp: new Date().toISOString(),
          },
          {
            id: '2',
            role: 'assistant',
            content: 'Hi there! How can I help?',
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      mockPrisma.careerSession.findUnique.mockResolvedValue(mockSession);

      const response = await request(app)
        .get('/api/v1/chat/session/session123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.session.messages).toHaveLength(2);
      expect(response.body.data.session.user.name).toBe('John Doe');
    });

    test('should return 404 for non-existent session', async () => {
      mockPrisma.careerSession.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/chat/session/nonexistent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Session not found');
    });
  });

  describe('PUT /api/v1/chat/session/:sessionId/end', () => {
    test('should end session successfully', async () => {
      const mockSession = {
        id: 'session123',
        endedAt: new Date(),
      };

      mockPrisma.careerSession.update.mockResolvedValue(mockSession);

      const response = await request(app)
        .put('/api/v1/chat/session/session123/end')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.sessionId).toBe('session123');
      expect(response.body.data).toHaveProperty('endedAt');
    });
  });
});

describe('API Health Check', () => {
  test('should return 200 for health endpoint', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('CareerForge AI API is running');
    expect(response.body.environment).toBe('test');
  });
});
