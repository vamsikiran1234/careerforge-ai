const { asyncHandler, createResponse } = require('../utils/helpers');
const { prisma } = require('../config/database');
const aiService = require('../services/aiService');

const quizController = {
  // POST /api/v1/quiz/start
  startQuiz: asyncHandler(async (req, res) => {
    const { userId } = req.body;

    // Validate userId is provided
    if (!userId) {
      return res.status(400).json(
        createResponse('error', 'User ID is required')
      );
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json(
        createResponse('error', 'User not found')
      );
    }

    // Check if user has an active quiz session
    const existingSession = await prisma.quizSession.findFirst({
      where: {
        userId,
        completedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        quizQuestions: {
          orderBy: {
            order: 'desc',
          },
          take: 1,
        },
      },
    });

    if (existingSession) {
      try {
        // Return the existing session instead of error
        let lastQuestion = existingSession.quizQuestions[0];
        
        // If there's no question yet, generate one
        if (!lastQuestion) {
          console.log('No existing question found, generating new one...');
          const firstQuestion = await aiService.quizNext(existingSession.id, null);
          
          if (!firstQuestion || !firstQuestion.question) {
            throw new Error('Failed to generate question from AI service');
          }
          
          // Create first quiz question in database
          lastQuestion = await prisma.quizQuestion.create({
            data: {
              quizSessionId: existingSession.id,
              questionText: firstQuestion.question,
              options: JSON.stringify(firstQuestion.options || []),
              stage: firstQuestion.stage || existingSession.currentStage,
              order: 1,
            },
          });
        }
      
        // Parse answers to calculate progress
        const answers = JSON.parse(existingSession.answers || '{}');
        const answeredCount = Object.keys(answers).length;
        const stageOrder = ['SKILLS_ASSESSMENT', 'INTEREST_ANALYSIS', 'PERSONALITY_TEST', 'VALUES_ALIGNMENT', 'CAREER_MATCHING'];
        const currentStageIndex = stageOrder.indexOf(existingSession.currentStage);
        const percentage = Math.round(((currentStageIndex) / stageOrder.length) * 100);
        
        return res.status(200).json(
          createResponse('success', 'Resuming existing quiz session', {
            sessionId: existingSession.id,
            currentStage: existingSession.currentStage,
            question: {
              text: lastQuestion.questionText,
              options: JSON.parse(lastQuestion.options),
              stage: lastQuestion.stage,
            },
            progress: {
              currentStage: currentStageIndex + 1,
              totalStages: stageOrder.length,
              percentage,
            },
          })
        );
      } catch (error) {
        console.error('Error resuming existing session:', error);
        return res.status(500).json(
          createResponse('error', `Failed to resume quiz session: ${error.message}`)
        );
      }
    }

    // Create new quiz session
    try {
      const session = await prisma.quizSession.create({
        data: {
          userId,
          currentStage: 'SKILLS_ASSESSMENT',
          answers: JSON.stringify({}),
        },
      });

      console.log('Created new quiz session:', session.id);

      // Generate first question using AI
      const firstQuestion = await aiService.quizNext(session.id, null);

      if (!firstQuestion || !firstQuestion.question) {
        throw new Error('Failed to generate first question from AI service');
      }

      console.log('Generated first question:', firstQuestion.question.substring(0, 50) + '...');

      // Create first quiz question in database
      await prisma.quizQuestion.create({
        data: {
          quizSessionId: session.id,
          questionText: firstQuestion.question,
          options: JSON.stringify(firstQuestion.options || []), // Store as JSON string
          stage: firstQuestion.stage || 'SKILLS_ASSESSMENT',
          order: 1,
        },
      });

      res.status(201).json(
        createResponse('success', 'Quiz session started successfully', {
          sessionId: session.id,
          currentStage: session.currentStage,
          question: {
            text: firstQuestion.question,
            options: firstQuestion.options,
            stage: firstQuestion.stage,
          },
          progress: {
            currentStage: 1,
            totalStages: 5,
            percentage: 20,
          },
        })
      );
    } catch (error) {
      console.error('Error creating new quiz session:', error);
      return res.status(500).json(
        createResponse('error', `Failed to start quiz: ${error.message}`)
      );
    }
  }),

  // POST /api/v1/quiz/:quizId/answer
  submitAnswer: asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const { answer, questionId } = req.body;

    // Get quiz session
    const session = await prisma.quizSession.findUnique({
      where: { id: quizId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        quizQuestions: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json(
        createResponse('error', 'Quiz session not found')
      );
    }

    if (session.completedAt) {
      return res.status(400).json(
        createResponse('error', 'Quiz session has already been completed')
      );
    }

    // Update the specific question with user's answer
    if (questionId) {
      await prisma.quizQuestion.update({
        where: { id: questionId },
        data: { userAnswer: answer },
      });
    }

    // Update session answers - parse from JSON string
    const currentAnswers = typeof session.answers === 'string' 
      ? JSON.parse(session.answers || '{}') 
      : (session.answers || {});
    const currentStage = session.currentStage;
    
    if (!currentAnswers[currentStage]) {
      currentAnswers[currentStage] = [];
    }
    currentAnswers[currentStage].push(answer);

    // Get next question or recommendations from AI
    const nextStep = await aiService.quizNext(session.id, answer);

    let updatedSession;

    if (nextStep.isComplete) {
      // Quiz is complete, save final results - store as JSON strings
      updatedSession = await prisma.quizSession.update({
        where: { id: quizId },
        data: {
          answers: JSON.stringify(currentAnswers),
          results: JSON.stringify(nextStep.recommendations),
          completedAt: new Date(),
          currentStage: 'COMPLETED',
        },
      });

      res.status(200).json(
        createResponse('success', 'Quiz completed successfully!', {
          sessionId: quizId,
          isComplete: true,
          results: nextStep.recommendations,
          progress: {
            currentStage: 5,
            totalStages: 5,
            percentage: 100,
          },
        })
      );
    } else {
      // More questions to go
      const stageOrder = ['SKILLS_ASSESSMENT', 'CAREER_INTERESTS', 'PERSONALITY_TRAITS', 'LEARNING_STYLE', 'CAREER_GOALS'];
      const currentStageIndex = stageOrder.indexOf(nextStep.stage);
      
      // Create next question in database
      const questionCount = await prisma.quizQuestion.count({
        where: { quizSessionId: quizId },
      });

      await prisma.quizQuestion.create({
        data: {
          quizSessionId: quizId,
          questionText: nextStep.question,
          options: JSON.stringify(nextStep.options), // Store as JSON string
          stage: nextStep.stage,
          order: questionCount + 1,
        },
      });

      // Update session - store answers as JSON string
      updatedSession = await prisma.quizSession.update({
        where: { id: quizId },
        data: {
          answers: JSON.stringify(currentAnswers),
          currentStage: nextStep.stage,
        },
      });

      res.status(200).json(
        createResponse('success', 'Answer submitted successfully', {
          sessionId: quizId,
          isComplete: false,
          nextQuestion: {
            text: nextStep.question,
            options: nextStep.options,
            stage: nextStep.stage,
          },
          progress: {
            currentStage: currentStageIndex + 1,
            totalStages: 5,
            percentage: ((currentStageIndex + 1) / 5) * 100,
          },
        })
      );
    }
  }),

  // GET /api/v1/quiz/session/:quizId
  getQuizSession: asyncHandler(async (req, res) => {
    const { quizId } = req.params;

    const session = await prisma.quizSession.findUnique({
      where: { id: quizId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        quizQuestions: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json(
        createResponse('error', 'Quiz session not found')
      );
    }

    const stageOrder = ['SKILLS_ASSESSMENT', 'CAREER_INTERESTS', 'PERSONALITY_TRAITS', 'LEARNING_STYLE', 'CAREER_GOALS'];
    const currentStageIndex = stageOrder.indexOf(session.currentStage);

    res.status(200).json(
      createResponse('success', 'Quiz session retrieved successfully', {
        session: {
          id: session.id,
          currentStage: session.currentStage,
          answers: typeof session.answers === 'string' 
            ? JSON.parse(session.answers || '{}') 
            : (session.answers || {}),
          results: typeof session.results === 'string' 
            ? JSON.parse(session.results || 'null') 
            : session.results,
          createdAt: session.createdAt,
          completedAt: session.completedAt,
          isComplete: !!session.completedAt,
          user: session.user,
          questions: session.quizQuestions.map(q => ({
            ...q,
            options: typeof q.options === 'string' 
              ? JSON.parse(q.options || '[]') 
              : (q.options || [])
          })),
          progress: {
            currentStage: currentStageIndex + 1,
            totalStages: 5,
            percentage: session.completedAt ? 100 : ((currentStageIndex + 1) / 5) * 100,
          },
        },
      })
    );
  }),

  // GET /api/v1/quiz/sessions/:userId
  getUserQuizSessions: asyncHandler(async (req, res) => {
    const { userId } = req.params;

    console.log('📊 Fetching quiz sessions for user:', userId);

    try {
      const sessions = await prisma.quizSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          currentStage: true,
          createdAt: true,
          completedAt: true,
          results: true,
        },
      });

      console.log('✅ Found', sessions.length, 'sessions for user:', userId);

      const completedSessions = sessions.filter(s => s.completedAt).length;
      const activeSessions = sessions.filter(s => !s.completedAt).length;

      res.status(200).json(
        createResponse('success', 'User quiz sessions retrieved successfully', {
          sessions: sessions.map(session => ({
            ...session,
            results: typeof session.results === 'string' 
              ? JSON.parse(session.results || 'null') 
              : session.results
          })),
          statistics: {
            totalSessions: sessions.length,
            completedSessions,
            activeSessions,
          },
        })
      );
    } catch (error) {
      console.error('❌ Error fetching quiz sessions:', error);
      throw error;
    }
  }),

  // DELETE /api/v1/quiz/:quizId
  deleteQuizSession: asyncHandler(async (req, res) => {
    const { quizId } = req.params;

    // Check if session exists
    const session = await prisma.quizSession.findUnique({
      where: { id: quizId },
    });

    if (!session) {
      return res.status(404).json(
        createResponse('error', 'Quiz session not found')
      );
    }

    // Delete session (will cascade delete questions)
    await prisma.quizSession.delete({
      where: { id: quizId },
    });

    res.status(200).json(
      createResponse('success', 'Quiz session deleted successfully')
    );
  }),
};

module.exports = quizController;
