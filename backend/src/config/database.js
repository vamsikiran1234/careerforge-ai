const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.DEBUG_QUERIES === 'true' ? ['query', 'error'] : ['error'],
});

// Logger utility
const logger = {
  info: (message) => {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.log(message);
    }
  },
  error: (message, error) => {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.error(message, error);
    }
  }
};

// Ensure high-performance indexes exist for <300ms query latency
async function ensurePerformanceIndexes() {
  const indexStatements = [
    `CREATE INDEX IF NOT EXISTS idx_career_sessions_user_id ON career_sessions("userId")`,
    `CREATE INDEX IF NOT EXISTS idx_career_sessions_user_updated ON career_sessions("userId", "updatedAt" DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions("userId")`,
    `CREATE INDEX IF NOT EXISTS idx_quiz_questions_session_id ON quiz_questions("quizSessionId")`,
    `CREATE INDEX IF NOT EXISTS idx_student_questions_user_id ON student_questions("userId")`,
    `CREATE INDEX IF NOT EXISTS idx_conversation_branches_session_id ON conversation_branches("sessionId")`,
    `CREATE INDEX IF NOT EXISTS idx_message_reactions_session_id ON message_reactions("sessionId")`,
    `CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions("userId")`,
    `CREATE INDEX IF NOT EXISTS idx_shared_conversations_session_id ON shared_conversations("sessionId")`,
    `CREATE INDEX IF NOT EXISTS idx_shared_conversations_created_by ON shared_conversations("createdById")`,
  ];

  for (const statement of indexStatements) {
    try {
      await prisma.$executeRawUnsafe(statement);
    } catch {
      // Silently skip if table doesn't exist yet or driver doesn't support
    }
  }
}

// Ensure default demo account exists for seamless one-click demo login
async function ensureDemoAccount() {
  try {
    const bcrypt = require('bcryptjs');
    const email = 'demo.user@careerforge.ai';
    const existing = await prisma.user.findUnique({ where: { email } });
    const hashedPassword = await bcrypt.hash('CareerForge@Demo2026', 10);
    const candidateBio = 'Full-Stack Software Engineer & Applied AI Developer specializing in TypeScript, React, Node.js, Python, and Production RAG architectures. Experienced in building high-throughput microservices, scalable distributed systems, and LLM-powered applications.';

    if (!existing) {
      await prisma.user.create({
        data: {
          email,
          name: 'Vamsi Kiran',
          password: hashedPassword,
          roles: '["STUDENT"]',
          bio: candidateBio,
        },
      });
      logger.info('👤 Demo account auto-initialized: ' + email);
    } else {
      await prisma.user.update({
        where: { email },
        data: {
          name: 'Vamsi Kiran',
          bio: candidateBio,
        },
      });
    }
  } catch {
    // Non-fatal if tables do not exist yet
  }
}

// Test database connection
async function connectDB() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
    ensurePerformanceIndexes().catch(() => {});
    ensureDemoAccount().catch(() => {});
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

// Graceful shutdown
async function disconnectDB() {
  await prisma.$disconnect();
  logger.info('🔌 Database disconnected');
}

process.on('beforeExit', disconnectDB);
process.on('SIGINT', disconnectDB);
process.on('SIGTERM', disconnectDB);

module.exports = { prisma, connectDB, disconnectDB };
