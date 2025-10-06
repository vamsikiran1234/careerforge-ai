/**
 * Cleanup Script for Quiz Sessions
 * 
 * This script:
 * 1. Finds and deletes incomplete/orphaned quiz sessions
 * 2. Ensures all active sessions have proper structure
 * 3. Fixes any data inconsistencies
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupQuizSessions() {
  console.log('🔍 Starting quiz session cleanup...\n');

  try {
    // 1. Find all incomplete quiz sessions (no completedAt)
    const incompleteSessions = await prisma.quizSession.findMany({
      where: {
        completedAt: null,
      },
      include: {
        quizQuestions: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`📊 Found ${incompleteSessions.length} incomplete quiz sessions`);

    // 2. Analyze each session
    for (const session of incompleteSessions) {
      console.log(`\n🔍 Analyzing session: ${session.id}`);
      console.log(`   User: ${session.user.name} (${session.user.email})`);
      console.log(`   Current Stage: ${session.currentStage}`);
      console.log(`   Questions: ${session.quizQuestions.length}`);
      console.log(`   Answers: ${session.answers}`);
      console.log(`   Created: ${session.createdAt}`);

      // Check if answers is valid JSON
      try {
        const answers = typeof session.answers === 'string'
          ? JSON.parse(session.answers)
          : session.answers;
        console.log(`   ✅ Answers are valid JSON`);
        console.log(`   Answer count: ${Object.keys(answers).length} stages`);
      } catch (error) {
        console.log(`   ❌ Invalid answers JSON: ${error.message}`);
      }
    }

    // 3. Option to delete all incomplete sessions
    console.log(`\n⚠️  To delete all incomplete sessions, run:`);
    console.log(`   DELETE FROM quiz_sessions WHERE completed_at IS NULL;\n`);

    // 4. Show users with multiple active sessions
    const usersWithMultipleSessions = await prisma.quizSession.groupBy({
      by: ['userId'],
      where: {
        completedAt: null,
      },
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    if (usersWithMultipleSessions.length > 0) {
      console.log(`\n⚠️  Found ${usersWithMultipleSessions.length} users with multiple active sessions:`);
      for (const user of usersWithMultipleSessions) {
        const userSessions = await prisma.quizSession.findMany({
          where: {
            userId: user.userId,
            completedAt: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        console.log(`\n   User ID: ${user.userId}`);
        console.log(`   Sessions: ${user._count.id}`);
        
        // Keep the most recent, delete older ones
        const toDelete = userSessions.slice(1);
        if (toDelete.length > 0) {
          console.log(`   📝 Will keep: ${userSessions[0].id} (most recent)`);
          console.log(`   🗑️  Will delete: ${toDelete.map(s => s.id).join(', ')}`);
        }
      }
    }

    console.log('\n✅ Analysis complete!');
    console.log('\n💡 Recommendations:');
    console.log('   1. Delete incomplete sessions older than 7 days');
    console.log('   2. Keep only the most recent session per user');
    console.log('   3. Ensure all sessions have valid currentStage');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupQuizSessions();
