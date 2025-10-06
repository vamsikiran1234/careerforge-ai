const { prisma } = require('../src/config/database');

async function clearAllSessions() {
  try {
    console.log('🗑️  Clearing all chat sessions...');
    
    const result = await prisma.careerSession.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.count} chat session(s)`);
    console.log('Database is now clean!');
  } catch (error) {
    console.error('❌ Error clearing sessions:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

clearAllSessions();
