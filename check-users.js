const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
    
    console.log('📊 Users in database:', users.length);
    
    if (users.length > 0) {
      console.log('👥 Existing users:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - Created: ${user.createdAt}`);
      });
    } else {
      console.log('❌ No users found in database');
      console.log('💡 You need to create a new account via registration');
    }
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();