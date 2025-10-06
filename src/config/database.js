const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
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

// Test database connection
async function connectDB() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
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
