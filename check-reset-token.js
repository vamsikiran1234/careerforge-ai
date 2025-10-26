// Debug script to check user's reset token status
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkResetToken() {
  try {
    const email = 'vamsikiran198@gmail.com';
    
    console.log('🔍 Checking reset token for:', email);
    console.log('Current time:', new Date());
    console.log('---');
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        resetPasswordToken: true,
        resetPasswordExpires: true,
      }
    });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('✅ User found:');
    console.log('  - ID:', user.id);
    console.log('  - Email:', user.email);
    console.log('  - Name:', user.name);
    console.log('');
    
    if (!user.resetPasswordToken) {
      console.log('⚠️  No reset token found');
      console.log('');
      console.log('📝 Action needed: Request a new password reset via Postman');
      console.log('   POST http://localhost:3000/api/v1/auth/forgot-password');
      console.log('   Body: { "email": "vamsikiran198@gmail.com" }');
    } else {
      console.log('✅ Reset token exists:');
      console.log('  - Token:', user.resetPasswordToken);
      console.log('  - Expires:', user.resetPasswordExpires);
      console.log('');
      
      const now = new Date();
      const expiry = new Date(user.resetPasswordExpires);
      const isExpired = expiry < now;
      
      if (isExpired) {
        console.log('❌ Token is EXPIRED');
        console.log('  - Expired:', Math.abs(now - expiry) / 1000 / 60, 'minutes ago');
        console.log('');
        console.log('📝 Action needed: Request a NEW password reset');
      } else {
        console.log('✅ Token is VALID');
        console.log('  - Time remaining:', (expiry - now) / 1000 / 60, 'minutes');
        console.log('');
        console.log('📝 Use this token in Postman:');
        console.log('   POST http://localhost:3000/api/v1/auth/reset-password');
        console.log('   Body:');
        console.log('   {');
        console.log('     "token": "' + user.resetPasswordToken + '",');
        console.log('     "password": "Naga$93525"');
        console.log('   }');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkResetToken();
