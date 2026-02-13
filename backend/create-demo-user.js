const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDemoUser() {
  try {
    // Hash password: DemoCareerForge2026!
    const hashedPassword = await bcrypt.hash('DemoCareerForge2026!', 12);

    // Create demo user
    const user = await prisma.user.create({
      data: {
        name: 'Demo User',
        email: 'demo@careerforge.ai',
        password: hashedPassword,
        roles: JSON.stringify(['STUDENT']),
        bio: 'This is a demo account for testing CareerForge AI platform features.',
      },
    });

    console.log('✅ Demo user created successfully!');
    console.log('');
    console.log('📧 Email: demo@careerforge.ai');
    console.log('🔑 Password: DemoCareerForge2026!');
    console.log('');
    console.log('🎯 You can use these credentials to test the platform.');
    console.log('');
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('✅ Demo user already exists!');
      console.log('');
      console.log('📧 Email: demo@careerforge.ai');
      console.log('🔑 Password: DemoCareerForge2026!');
      console.log('');
    } else {
      console.error('❌ Error creating demo user:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUser();
