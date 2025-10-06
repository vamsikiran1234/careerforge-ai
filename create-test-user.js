const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@careerforge.ai' }
    });

    if (existingUser) {
      console.log('✅ Test user already exists!');
      console.log('📧 Email: test@careerforge.ai');
      console.log('🔑 Password: TestPassword123!');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('TestPassword123!', 12);

    // Create test user
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@careerforge.ai',
        password: hashedPassword,
        role: 'STUDENT',
      },
    });

    console.log('🎉 Test user created successfully!');
    console.log('📧 Email: test@careerforge.ai');
    console.log('🔑 Password: TestPassword123!');
    console.log('👤 User ID:', user.id);
    console.log('');
    console.log('🚀 You can now sign in with these credentials!');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();