/**
 * Script to clean up all mentor-related data
 * WARNING: This will DELETE all mentor profiles, connections, sessions, and reviews
 * Use this to start fresh with mentor testing
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function cleanupMentorData() {
  console.log('\n⚠️  WARNING: This will DELETE ALL mentor-related data!\n');
  console.log('This includes:');
  console.log('  - All mentor profiles');
  console.log('  - All mentor connections');
  console.log('  - All mentor sessions');
  console.log('  - All mentor reviews');
  console.log('  - All mentor chat rooms');
  console.log('  - All mentor notifications\n');

  const confirm = await question('Are you sure you want to continue? Type "DELETE ALL" to confirm: ');

  if (confirm !== 'DELETE ALL') {
    console.log('❌ Action cancelled. No data was deleted.');
    return;
  }

  try {
    console.log('\n🗑️  Starting cleanup...\n');

    // Delete in correct order to respect foreign key constraints

    // 1. Delete message reactions in mentor chat rooms
    console.log('1. Deleting message reactions...');
    const chatRoomIds = await prisma.chatRoom.findMany({
      select: { id: true }
    });
    const roomIds = chatRoomIds.map(room => room.id);
    
    if (roomIds.length > 0) {
      const messageReactionsCount = await prisma.messageReaction.deleteMany({
        where: {
          message: {
            roomId: {
              in: roomIds
            }
          }
        }
      });
      console.log(`   ✓ Deleted ${messageReactionsCount.count} message reactions`);
    } else {
      console.log(`   ✓ No message reactions to delete`);
    }

    // 2. Delete chat messages
    console.log('2. Deleting chat messages...');
    const messagesCount = await prisma.chatMessage.deleteMany({});
    console.log(`   ✓ Deleted ${messagesCount.count} chat messages`);

    // 3. Delete chat rooms
    console.log('3. Deleting chat rooms...');
    const chatRooms = await prisma.chatRoom.deleteMany({});
    console.log(`   ✓ Deleted ${chatRooms.count} chat rooms`);

    // 4. Delete mentor reviews
    console.log('4. Deleting mentor reviews...');
    const reviews = await prisma.mentorReview.deleteMany({});
    console.log(`   ✓ Deleted ${reviews.count} reviews`);

    // 5. Delete mentor sessions
    console.log('5. Deleting mentor sessions...');
    const sessions = await prisma.mentorSession.deleteMany({});
    console.log(`   ✓ Deleted ${sessions.count} sessions`);

    // 6. Delete mentor connections
    console.log('6. Deleting mentor connections...');
    const connections = await prisma.mentorConnection.deleteMany({});
    console.log(`   ✓ Deleted ${connections.count} connections`);

    // 7. Delete notifications related to mentorship
    console.log('7. Deleting mentor notifications...');
    const notifications = await prisma.notification.deleteMany({
      where: {
        OR: [
          { type: 'CONNECTION_REQUEST' },
          { type: 'CONNECTION_ACCEPTED' },
          { type: 'CONNECTION_REJECTED' },
          { type: 'SESSION_BOOKED' },
          { type: 'SESSION_REMINDER' },
          { type: 'REVIEW_RECEIVED' },
          { type: 'MENTOR_MESSAGE' }
        ]
      }
    });
    console.log(`   ✓ Deleted ${notifications.count} notifications`);

    // 8. Finally, delete mentor profiles
    console.log('8. Deleting mentor profiles...');
    const mentorProfiles = await prisma.mentorProfile.deleteMany({});
    console.log(`   ✓ Deleted ${mentorProfiles.count} mentor profiles`);

    console.log('\n✅ All mentor data has been deleted successfully!\n');
    console.log('You can now start fresh with mentor registration testing.\n');

  } catch (error) {
    console.error('\n❌ Error during cleanup:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await cleanupMentorData();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();
