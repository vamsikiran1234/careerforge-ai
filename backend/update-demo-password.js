const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateDemoPassword() {
  try {
    // Hash new password: DemoCareerForge2026!
    const hashedPassword = await bcrypt.hash('DemoCareerForge2026!', 12);

    // Update existing demo user password
    const user = await prisma.user.update({
      where: { email: 'demo@careerforge.ai' },
      data: { password: hashedPassword },
    });

    console.log('✅ Demo user password updated successfully!');
    console.log('');
    console.log('📧 Email: demo@careerforge.ai');
    console.log('🔑 New Password: DemoCareerForge2026!');
    console.log('');
    console.log('🎯 Updated to a stronger password that won\'t trigger browser warnings.');
    console.log('');
  } catch (error) {
    if (error.code === 'P2025') {
      console.log('⚠️  Demo user not found. Creating new one...');
      console.log('Run: node create-demo-user.js');
      console.log('');
    } else {
      console.error('❌ Error updating demo user:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

updateDemoPassword();
