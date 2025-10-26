const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function acceptConnectionAndCreateChatRoom() {
  try {
    const connectionId = 'cmgovj2760005uiqsx8w5wf2e';
    
    console.log('\n=== Accepting Connection and Creating Chat Room ===\n');
    
    // Update connection status
    const connection = await prisma.mentorConnection.update({
      where: { id: connectionId },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date()
      },
      include: {
        mentor: {
          include: {
            user: true
          }
        }
      }
    });
    
    console.log(`✅ Connection accepted`);
    console.log(`   Mentor: ${connection.mentor.user.name}`);
    console.log(`   Student ID: ${connection.studentId}`);
    
    // Create chat room
    const chatRoom = await prisma.chatRoom.create({
      data: {
        connectionId: connection.id,
        mentorId: connection.mentorId,
        studentId: connection.studentId,
        isActive: true,
        unreadCountStudent: 0,
        unreadCountMentor: 0,
        lastActivity: new Date()
      }
    });
    
    console.log(`\n✅ Chat room created`);
    console.log(`   Room ID: ${chatRoom.id}`);
    console.log(`   Connection ID: ${chatRoom.connectionId}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

acceptConnectionAndCreateChatRoom();
