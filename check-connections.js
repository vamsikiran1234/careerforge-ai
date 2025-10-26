const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkConnections() {
  try {
    console.log('\n=== Checking Mentor Connections ===\n');
    
    // Get all connections
    const connections = await prisma.mentorConnection.findMany({
      include: {
        mentor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        chatRoom: true
      }
    });
    
    console.log(`Total Connections: ${connections.length}\n`);
    
    connections.forEach((conn, index) => {
      console.log(`Connection ${index + 1}:`);
      console.log(`  ID: ${conn.id}`);
      console.log(`  Mentor: ${conn.mentor.user.name} (${conn.mentor.user.email})`);
      console.log(`  Student ID: ${conn.studentId}`);
      console.log(`  Status: ${conn.status}`);
      console.log(`  Has Chat Room: ${conn.chatRoom ? 'Yes (ID: ' + conn.chatRoom.id + ')' : 'No'}`);
      console.log(`  Created: ${conn.createdAt}`);
      console.log('');
    });
    
    // Get student details
    const studentIds = connections.map(c => c.studentId);
    if (studentIds.length > 0) {
      const students = await prisma.user.findMany({
        where: { id: { in: studentIds } },
        select: { id: true, name: true, email: true }
      });
      
      console.log('=== Students in Connections ===\n');
      students.forEach(s => {
        console.log(`  ${s.name} (${s.email}) - ID: ${s.id}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnections();
