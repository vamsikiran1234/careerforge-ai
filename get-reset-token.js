const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getResetToken() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'vamsikiran198@gmail.com' },
      select: { name: true, email: true, resetPasswordToken: true, resetPasswordExpires: true }
    });
    
    console.log('🔍 Password Reset Info for vamsikiran198@gmail.com:');
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Reset Token:', user.resetPasswordToken);
    console.log('   Token Expires:', user.resetPasswordExpires);
    console.log('\n🔗 Reset URL:');
    console.log('   http://localhost:5173/reset-password?token=' + user.resetPasswordToken);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getResetToken();