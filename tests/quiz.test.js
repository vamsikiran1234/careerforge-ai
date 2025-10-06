const request = require('supertest');
const app = require('../src/app');

// Get mock prisma from global setup
const mockPrisma = global.mockPrisma;

// Mock AI service
const aiService = require('../src/services/aiService');

describe('Quiz API Endpoints', () => {
  describe('POST /api/v1/quiz/start', () => {
    const validStartRequest = {
      userId: 'user123',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should start quiz session successfully', async () => {
      // Mock user exists
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'STUDENT',
      });

      // Mock no existing active session
      mockPrisma.quizSession.findFirst.mockResolvedValue(null);

      // Mock quiz session creation
      mockPrisma.quizSession.create.mockResolvedValue({
        id: 'quiz123',
        userId: 'user123',
        currentStage: 'SKILLS_ASSESSMENT',
        answers: {},
        createdAt: new Date(),
      });

      // Mock AI question generation
      aiService.quizNext.mockResolvedValue({
        type: 'question',
        stage: 'SKILLS_ASSESSMENT',
        question: 'What programming languages are you most comfortable with?',
        options: ['JavaScript', 'Python', 'Java', 'C++'],
        isComplete: false,
      });

      // Mock question creation
      mockPrisma.quizQuestion.create.mockResolvedValue({
        id: 'question1',
        quizSessionId: 'quiz123',
        questionText: 'What programming languages are you most comfortable with?',
        options: ['JavaScript', 'Python', 'Java', 'C++'],
        stage: 'SKILLS_ASSESSMENT',
        order: 1,
      });

      const response = await request(app)
        .post('/api/v1/quiz/start')
        .send(validStartRequest)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Quiz session started successfully');
      expect(response.body.data).toHaveProperty('sessionId');
      expect(response.body.data).toHaveProperty('currentStage');
      expect(response.body.data.currentStage).toBe('SKILLS_ASSESSMENT');
      expect(response.body.data.question).toHaveProperty('text');
      expect(response.body.data.question).toHaveProperty('options');
      expect(response.body.data.progress.currentStage).toBe(1);
      expect(response.body.data.progress.totalStages).toBe(5);
      expect(response.body.data.progress.percentage).toBe(20);

      // Verify service calls
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user123' },
      });
      expect(aiService.quizNext).toHaveBeenCalled();
    });

    test('should return 404 if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/quiz/start')
        .send(validStartRequest)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User not found');
    });

    test('should return 200 and resume if active session exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user123',
        name: 'John Doe',
      });

      mockPrisma.quizSession.findFirst.mockResolvedValue({
        id: 'existing-quiz',
        userId: 'user123',
        currentStage: 'INTEREST_ANALYSIS',
        completedAt: null,
        quizQuestions: [
          {
            id: 'q1',
            questionText: 'What interests you most?',
            options: JSON.stringify(['Option A', 'Option B']),
            stage: 'INTEREST_ANALYSIS',
          },
        ],
      });

      const response = await request(app)
        .post('/api/v1/quiz/start')
        .send(validStartRequest)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('Resuming existing quiz session');
      expect(response.body.data.sessionId).toBe('existing-quiz');
    });

    test('should return 400 for missing userId', async () => {
      const response = await request(app)
        .post('/api/v1/quiz/start')
        .send({})
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('User ID is required');
    });
  });

  describe('POST /api/v1/quiz/:quizId/answer', () => {
    const validAnswerRequest = {
      answer: 'JavaScript',
      questionId: 'question1',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should submit answer and get next question', async () => {
      // Mock quiz session
      mockPrisma.quizSession.findUnique.mockResolvedValue({
        id: 'quiz123',
        userId: 'user123',
        currentStage: 'SKILLS_ASSESSMENT',
        answers: {},
        completedAt: null,
        user: {
          id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
        },
        quizQuestions: [
          {
            id: 'question1',
            questionText: 'Previous question',
            order: 1,
          },
        ],
      });

      // Mock question update
      mockPrisma.quizQuestion.update.mockResolvedValue({
        id: 'question1',
        userAnswer: 'JavaScript',
      });

      // Mock AI next question
      aiService.quizNext.mockResolvedValue({
        type: 'question',
        stage: 'SKILLS_ASSESSMENT',
        question: 'How many years of programming experience do you have?',
        options: ['0-1 years', '1-3 years', '3-5 years', '5+ years'],
        isComplete: false,
      });

      // Mock question count
      mockPrisma.quizQuestion.count.mockResolvedValue(1);

      // Mock new question creation
      mockPrisma.quizQuestion.create.mockResolvedValue({
        id: 'question2',
        questionText: 'How many years of programming experience do you have?',
        options: ['0-1 years', '1-3 years', '3-5 years', '5+ years'],
        order: 2,
      });

      // Mock session update
      mockPrisma.quizSession.update.mockResolvedValue({
        id: 'quiz123',
        currentStage: 'SKILLS_ASSESSMENT',
        answers: {
          SKILLS_ASSESSMENT: ['JavaScript'],
        },
      });

      const response = await request(app)
        .post('/api/v1/quiz/quiz123/answer')
        .send(validAnswerRequest)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Answer submitted successfully');
      expect(response.body.data.isComplete).toBe(false);
      expect(response.body.data.nextQuestion).toHaveProperty('text');
      expect(response.body.data.nextQuestion).toHaveProperty('options');
      expect(response.body.data.progress).toHaveProperty('currentStage');

      // Verify service calls
      expect(aiService.quizNext).toHaveBeenCalledWith('quiz123', 'JavaScript');
    });

    test('should complete quiz and return recommendations', async () => {
      // Mock completed quiz session
      mockPrisma.quizSession.findUnique.mockResolvedValue({
        id: 'quiz123',
        userId: 'user123',
        currentStage: 'CAREER_GOALS',
        answers: {
          SKILLS_ASSESSMENT: ['JavaScript', 'React'],
          CAREER_INTERESTS: ['Web Development'],
          PERSONALITY_TRAITS: ['Team Player'],
          LEARNING_STYLE: ['Hands-on'],
          CAREER_GOALS: ['Senior Developer'],
        },
        completedAt: null,
        user: {
          id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
        },
        quizQuestions: [],
      });

      // Mock AI recommendations
      aiService.quizNext.mockResolvedValue({
        type: 'recommendations',
        stage: 'COMPLETED',
        recommendations: {
          topCareers: [
            {
              title: 'Frontend Developer',
              match_percentage: 95,
              description: 'Perfect fit based on your JavaScript skills',
              skills_required: ['React', 'CSS', 'TypeScript'],
              salary_range: '$70,000 - $120,000',
            },
          ],
          skillsToFocus: [
            {
              skill: 'React',
              priority: 'High',
              resources: ['React Documentation', 'Frontend Masters'],
            },
          ],
          learningPath: {
            phase1: '0-3 months: Master React fundamentals',
            phase2: '3-6 months: Learn TypeScript and testing',
            phase3: '6-12 months: Advanced patterns and frameworks',
          },
          nextSteps: [
            'Build 3 React projects for portfolio',
            'Complete a full-stack application',
            'Start applying for junior frontend roles',
          ],
        },
        isComplete: true,
      });

      // Mock session completion
      mockPrisma.quizSession.update.mockResolvedValue({
        id: 'quiz123',
        currentStage: 'COMPLETED',
        completedAt: new Date(),
        results: {
          topCareers: ['Frontend Developer'],
        },
      });

      const response = await request(app)
        .post('/api/v1/quiz/quiz123/answer')
        .send({ answer: 'Build amazing products' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Quiz completed successfully!');
      expect(response.body.data.isComplete).toBe(true);
      expect(response.body.data.results).toHaveProperty('topCareers');
      expect(response.body.data.results).toHaveProperty('skillsToFocus');
      expect(response.body.data.results).toHaveProperty('learningPath');
      expect(response.body.data.progress.percentage).toBe(100);
    });

    test('should return 404 for non-existent quiz session', async () => {
      mockPrisma.quizSession.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/quiz/nonexistent/answer')
        .send(validAnswerRequest)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Quiz session not found');
    });

    test('should return 400 for already completed quiz', async () => {
      mockPrisma.quizSession.findUnique.mockResolvedValue({
        id: 'quiz123',
        completedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/v1/quiz/quiz123/answer')
        .send(validAnswerRequest)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Quiz session has already been completed');
    });

    test('should return 400 for missing answer', async () => {
      const response = await request(app)
        .post('/api/v1/quiz/quiz123/answer')
        .send({})
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Answer is required');
    });
  });

  describe('GET /api/v1/quiz/session/:quizId', () => {
    test('should get quiz session details successfully', async () => {
      const mockSession = {
        id: 'quiz123',
        currentStage: 'CAREER_INTERESTS',
        answers: {
          SKILLS_ASSESSMENT: ['JavaScript', 'React'],
        },
        results: null,
        createdAt: new Date(),
        completedAt: null,
        user: {
          id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
        },
        quizQuestions: [
          {
            id: 'q1',
            questionText: 'Question 1',
            options: ['A', 'B', 'C'],
            userAnswer: 'A',
            order: 1,
          },
        ],
      };

      mockPrisma.quizSession.findUnique.mockResolvedValue(mockSession);

      const response = await request(app)
        .get('/api/v1/quiz/session/quiz123')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.session.id).toBe('quiz123');
      expect(response.body.data.session.currentStage).toBe('CAREER_INTERESTS');
      expect(response.body.data.session.user.name).toBe('John Doe');
      expect(response.body.data.session.questions).toHaveLength(1);
      expect(response.body.data.session.progress.currentStage).toBe(2);
    });

    test('should return 404 for non-existent quiz session', async () => {
      mockPrisma.quizSession.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/quiz/session/nonexistent')
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Quiz session not found');
    });
  });

  describe('GET /api/v1/quiz/sessions/:userId', () => {
    test('should get user quiz sessions successfully', async () => {
      const mockSessions = [
        {
          id: 'quiz1',
          currentStage: 'COMPLETED',
          createdAt: new Date(),
          completedAt: new Date(),
          results: { topCareers: ['Developer'] },
        },
        {
          id: 'quiz2',
          currentStage: 'SKILLS_ASSESSMENT',
          createdAt: new Date(),
          completedAt: null,
          results: null,
        },
      ];

      mockPrisma.quizSession.findMany.mockResolvedValue(mockSessions);

      const response = await request(app)
        .get('/api/v1/quiz/sessions/user123')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.sessions).toHaveLength(2);
      expect(response.body.data.statistics.totalSessions).toBe(2);
      expect(response.body.data.statistics.completedSessions).toBe(1);
      expect(response.body.data.statistics.activeSessions).toBe(1);
    });
  });

  describe('DELETE /api/v1/quiz/:quizId', () => {
    test('should delete quiz session successfully', async () => {
      mockPrisma.quizSession.findUnique.mockResolvedValue({
        id: 'quiz123',
        userId: 'user123',
      });

      mockPrisma.quizSession.delete.mockResolvedValue({
        id: 'quiz123',
      });

      const response = await request(app)
        .delete('/api/v1/quiz/quiz123')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Quiz session deleted successfully');
    });

    test('should return 404 for non-existent quiz session', async () => {
      mockPrisma.quizSession.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/v1/quiz/nonexistent')
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Quiz session not found');
    });
  });
});
