const { PrismaClient } = require('@prisma/client');

async function createUser() {
  const prisma = new PrismaClient();
  
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'vamsikiran198@gmail.com' }
    });
    
    if (existingUser) {
      console.log('User already exists:', existingUser);
      return;
    }
    
    const user = await prisma.user.create({
      data: {
        email: 'vamsikiran198@gmail.com',
        name: 'Vamsi',
        role: 'STUDENT'
      }
    });
    
    console.log('User created:', user);
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
