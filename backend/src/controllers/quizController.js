const { asyncHandler, createResponse } = require('../utils/helpers');
const { prisma } = require('../config/database');
const aiService = require('../services/multiAiService');
const STAGE_ORDER = aiService.STAGE_ORDER || ['SKILLS_ASSESSMENT', 'CAREER_INTERESTS', 'PERSONALITY_TRAITS', 'LEARNING_STYLE', 'CAREER_GOALS'];
const TOTAL_QUESTIONS = aiService.TOTAL_QUESTIONS || 25;

const quizController = {
  // POST /api/v1/quiz/start
  startQuiz: asyncHandler(async (req, res) => {
    let userId = req.user?.id || req.user?.userId;
    
    if (!userId) {
      const userEmail = req.user?.email || req.user?.userEmail;
      if (!userEmail) {
        return res.status(401).json(
          createResponse('error', 'Authentication required')
        );
      }

      const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true },
      });

      if (!user) {
        return res.status(404).json(
          createResponse('error', 'User not found')
        );
      }
      userId = user.id;
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
        const STAGE_ORDER = ['SKILLS_ASSESSMENT', 'CAREER_INTERESTS', 'PERSONALITY_TRAITS', 'LEARNING_STYLE', 'CAREER_GOALS'];
        const existingAnswers = typeof existingSession.answers === 'string'
          ? JSON.parse(existingSession.answers || '{}')
          : (existingSession.answers || {});

        let totalAnswered = 0;
        for (const s of STAGE_ORDER) {
          totalAnswered += (existingAnswers[s]?.length || 0);
        }

        let lastQuestion = existingSession.quizQuestions && existingSession.quizQuestions.length > 0 
          ? existingSession.quizQuestions[0]
          : null;

        // If last question was already answered, get the next question instead of repeating the answered one
        if (!lastQuestion || lastQuestion.userAnswer != null) {
          const nextStep = await aiService.quizNext(existingSession.id, existingAnswers, existingSession.currentStage);
          
          if (nextStep.isComplete) {
            return res.status(200).json(
              createResponse('success', 'Quiz completed', {
                sessionId: existingSession.id,
                isComplete: true,
                results: nextStep.recommendations,
                progress: nextStep.progress,
              })
            );
          }

          const questionCount = await prisma.quizQuestion.count({
            where: { quizSessionId: existingSession.id },
          });

          lastQuestion = await prisma.quizQuestion.create({
            data: {
              quizSessionId: existingSession.id,
              questionText: nextStep.question,
              options: JSON.stringify(nextStep.options || []),
              stage: nextStep.stage || existingSession.currentStage,
              order: questionCount + 1,
            },
          });

          await prisma.quizSession.update({
            where: { id: existingSession.id },
            data: { currentStage: nextStep.stage },
          });
        }
      
        // Parse options safely
        let questionOptions;
        try {
          questionOptions = typeof lastQuestion.options === 'string' 
            ? JSON.parse(lastQuestion.options) 
            : lastQuestion.options || [];
        } catch (parseError) {
          questionOptions = [];
        }

        const currentStageIndex = Math.max(0, STAGE_ORDER.indexOf(lastQuestion.stage || existingSession.currentStage));
        const currentQuestionNumber = Math.min(totalAnswered + 1, TOTAL_QUESTIONS);
        const percentage = Math.round(((currentQuestionNumber - 1) / TOTAL_QUESTIONS) * 100);

        return res.status(200).json(
          createResponse('success', 'Resuming existing quiz session', {
            sessionId: existingSession.id,
            currentStage: existingSession.currentStage,
            question: {
              id: lastQuestion.id,
              text: lastQuestion.questionText,
              options: questionOptions,
              stage: lastQuestion.stage,
            },
            progress: {
              currentQuestion: currentQuestionNumber,
              totalQuestions: TOTAL_QUESTIONS,
              stageQuestion: ((currentQuestionNumber - 1) % 5) + 1,
              stageTotalQuestions: 5,
              currentStage: currentStageIndex + 1,
              totalStages: STAGE_ORDER.length,
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
        firstQuestion = await aiService.quizNext(session.id, {}, 'SKILLS_ASSESSMENT');
      } catch (aiError) {
        console.error('AI service error:', aiError);
        // Provide a calibrated fallback question matching the 4 options format
        firstQuestion = {
          question: "Which programming language or technology stack are you most comfortable using?",
          options: [
            "JavaScript / TypeScript (React, Node.js, Web development)",
            "Python (Data analysis, scripting, AI basics)",
            "Java / C# / Go (Object-oriented programming, enterprise apps)",
            "Cloud, DevOps & Systems (Linux, Docker, AWS, Infrastructure)"
          ],
          stage: "SKILLS_ASSESSMENT"
        };
      }

      if (!firstQuestion || !firstQuestion.question) {
        throw new Error('Failed to generate first question');
      }

      console.log('Generated first question:', firstQuestion.question.substring(0, 50) + '...');

      // Create first quiz question in database
      const createdFirstQuestion = await prisma.quizQuestion.create({
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
            id: createdFirstQuestion.id,
            text: firstQuestion.question,
            options: firstQuestion.options,
            stage: firstQuestion.stage,
          },
          progress: {
            currentQuestion: 1,
            totalQuestions: TOTAL_QUESTIONS,
            stageQuestion: 1,
            stageTotalQuestions: 5,
            currentStage: 1,
            totalStages: STAGE_ORDER.length,
            percentage: 0,
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

    // Save answers to database immediately so state is strictly consistent
    await prisma.quizSession.update({
      where: { id: quizId },
      data: {
        answers: JSON.stringify(currentAnswers),
      },
    });

    // Get next question or recommendations with up-to-date answers map
    const nextStep = await aiService.quizNext(session.id, currentAnswers, currentStage);

    if (nextStep.isComplete) {
      // Quiz is complete, save final results
      await prisma.quizSession.update({
        where: { id: quizId },
        data: {
          results: JSON.stringify(nextStep.recommendations),
          completedAt: new Date(),
          currentStage: 'COMPLETED',
        },
      });

      return res.status(200).json(
        createResponse('success', 'Quiz completed successfully!', {
          sessionId: quizId,
          isComplete: true,
          results: nextStep.recommendations,
          progress: nextStep.progress || {
            currentQuestion: TOTAL_QUESTIONS,
            totalQuestions: TOTAL_QUESTIONS,
            stageQuestion: 5,
            stageTotalQuestions: 5,
            currentStage: STAGE_ORDER.length,
            totalStages: STAGE_ORDER.length,
            percentage: 100,
          },
        })
      );
    } else {
      let createdNextQuestion = null;
      if (nextStep.question) {
        // Create next question in database
        const questionCount = await prisma.quizQuestion.count({
          where: { quizSessionId: quizId },
        });

        createdNextQuestion = await prisma.quizQuestion.create({
          data: {
            quizSessionId: quizId,
            questionText: nextStep.question,
            options: JSON.stringify(nextStep.options),
            stage: nextStep.stage,
            order: questionCount + 1,
          },
        });
      }

      // Update session with new stage
      await prisma.quizSession.update({
        where: { id: quizId },
        data: {
          currentStage: nextStep.stage,
        },
      });

      return res.status(200).json(
        createResponse('success', 'Answer submitted successfully', {
          sessionId: quizId,
          isComplete: false,
          nextQuestion: {
            id: createdNextQuestion ? createdNextQuestion.id : undefined,
            text: nextStep.question,
            options: nextStep.options,
            stage: nextStep.stage,
          },
          progress: nextStep.progress,
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

    const stageOrder = STAGE_ORDER;
    const currentStageIndex = stageOrder.indexOf(session.currentStage);

    const parsedAnswers = typeof session.answers === 'string' 
      ? JSON.parse(session.answers || '{}') 
      : (session.answers || {});

    let totalAnswered = 0;
    for (const stage of stageOrder) {
      totalAnswered += (parsedAnswers[stage]?.length || 0);
    }
    const currentQuestionNumber = Math.min(totalAnswered + 1, TOTAL_QUESTIONS);
    const percentage = session.completedAt ? 100 : Math.round(((currentQuestionNumber - 1) / TOTAL_QUESTIONS) * 100);

    res.status(200).json(
      createResponse('success', 'Quiz session retrieved successfully', {
        session: {
          id: session.id,
          currentStage: session.currentStage,
          answers: parsedAnswers,
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
            currentQuestion: session.completedAt ? TOTAL_QUESTIONS : currentQuestionNumber,
            totalQuestions: TOTAL_QUESTIONS,
            stageQuestion: session.completedAt ? 5 : (((currentQuestionNumber - 1) % 5) + 1),
            stageTotalQuestions: 5,
            currentStage: Math.min(Math.max(currentStageIndex + 1, 1), stageOrder.length),
            totalStages: stageOrder.length,
            percentage,
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
