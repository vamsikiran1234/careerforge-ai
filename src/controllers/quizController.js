const { asyncHandler, createResponse } = require('../utils/helpers');
const { prisma } = require('../config/database');
const aiService = require('../services/aiService');

const quizController = {
  // POST /api/v1/quiz/start
  startQuiz: asyncHandler(async (req, res) => {
    // Get user from JWT token instead of request body
    const userEmail = req.user.email || req.user.userEmail;
    
    if (!userEmail) {
      return res.status(401).json(
        createResponse('error', 'Authentication required')
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

    const userId = user.id;

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
        let lastQuestion = existingSession.quizQuestions && existingSession.quizQuestions.length > 0 
          ? existingSession.quizQuestions[0]
          : null;
        
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
      
        // Calculate progress based on current stage
        const stageOrder = ['SKILLS_ASSESSMENT', 'INTEREST_ANALYSIS', 'PERSONALITY_TEST', 'VALUES_ALIGNMENT', 'CAREER_MATCHING'];
        const currentStageIndex = stageOrder.indexOf(existingSession.currentStage);
        const percentage = Math.round(((currentStageIndex) / stageOrder.length) * 100);
        
        // Parse options safely
        let questionOptions;
        try {
          questionOptions = typeof lastQuestion.options === 'string' 
            ? JSON.parse(lastQuestion.options) 
            : lastQuestion.options || [];
        } catch (parseError) {
          questionOptions = [];
        }

        return res.status(200).json(
          createResponse('success', 'Resuming existing quiz session', {
            sessionId: existingSession.id,
            currentStage: existingSession.currentStage,
            question: {
              text: lastQuestion.questionText,
              options: questionOptions,
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
        console.log('Deleting failed session and creating new one...');
        
        // Delete the failed session and create a new one
        try {
          await prisma.quizQuestion.deleteMany({
            where: { quizSessionId: existingSession.id }
          });
          await prisma.quizSession.delete({
            where: { id: existingSession.id }
          });
          console.log('Deleted failed session, will create new one');
        } catch (deleteError) {
          console.error('Error deleting failed session:', deleteError);
        }
        // Continue to create new session below
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
      let firstQuestion;
      try {
        firstQuestion = await aiService.quizNext(session.id, null);
      } catch (aiError) {
        console.error('AI service error:', aiError);
        // Provide a fallback question if AI service fails
        firstQuestion = {
          question: "What is your primary area of interest in technology?",
          options: [
            "Web Development (Frontend/Backend)",
            "Mobile App Development",
            "Data Science & Analytics",
            "Artificial Intelligence & Machine Learning",
            "Cybersecurity",
            "Cloud Computing & DevOps",
            "Other"
          ],
          stage: "SKILLS_ASSESSMENT"
        };
      }

      if (!firstQuestion || !firstQuestion.question) {
        throw new Error('Failed to generate first question');
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

  // POST /api/v1/quiz/:quizId/answer OR POST /api/v1/quiz/submit
  submitAnswer: asyncHandler(async (req, res) => {
    // Support both URL param and body for quizId (frontend compatibility)
    const quizId = req.params.quizId || req.body.quizId || req.body.sessionId;
    const { answer, questionId } = req.body;

    if (!quizId) {
      return res.status(400).json(
        createResponse('error', 'Quiz session ID is required')
      );
    }

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
    // The aiService has built-in error handling and fallback mechanisms
    // so we don't need to catch errors here - let it handle fallbacks internally
    const nextStep = await aiService.quizNext(session.id, answer);

    if (nextStep.isComplete) {
      // Quiz is complete, save final results - store as JSON strings
      await prisma.quizSession.update({
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
      
      // Only create question if we have question text (not a completion message)
      if (nextStep.question) {
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
      }

      // Update session - store answers as JSON string
      await prisma.quizSession.update({
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
    // Accept both quizId and sessionId for compatibility
    const quizId = req.params.quizId || req.params.sessionId;

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
