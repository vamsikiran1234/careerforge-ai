require('dotenv').config();
const { prisma } = require('./src/config/database');
const emailService = require('./src/services/emailService');
const crypto = require('crypto');

async function testFullResetFlow() {
  console.log('🧪 Testing complete password reset flow...\n');

  try {
    // 1. Check if user exists
    const email = 'vamsikiran198@gmail.com';
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ User not found in database. Please register first.');
      return;
    }

    console.log('✅ User found:', user.name);

    // 2. Generate reset token (same as forgot-password endpoint)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    console.log('✅ Generated reset token:', resetToken.substring(0, 10) + '...');

    // 3. Update user with reset token
    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry,
      }
    });

    console.log('✅ Database updated with reset token');

    // 4. Generate reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    console.log('✅ Reset URL generated:', resetUrl);

    // 5. Send email
    const emailResult = await emailService.sendPasswordResetEmail(
      email,
      resetToken,
      user.name
    );

    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', emailResult.messageId);

    // 6. Test URL accessibility
    console.log('\n📋 TESTING INSTRUCTIONS:');
    console.log('1. Check your Gmail inbox for the password reset email');
    console.log('2. Make sure your frontend is running on: http://localhost:5173');
    console.log('3. Click the "Reset My Password" button in the email');
    console.log('4. OR copy this URL and paste in browser:');
    console.log('   ', resetUrl);
    console.log('5. The reset page should load with the token pre-filled');

    // 7. Verify token in database
    const updatedUser = await prisma.user.findUnique({
      where: { email },
      select: {
        resetPasswordToken: true,
        resetPasswordExpires: true
      }
    });

    console.log('\n🔍 Database verification:');
    console.log('   Token stored:', updatedUser?.resetPasswordToken?.substring(0, 10) + '...');
    console.log('   Expires at:', updatedUser?.resetPasswordExpires);
    console.log('   Time remaining:', Math.round((updatedUser?.resetPasswordExpires?.getTime() - Date.now()) / 60000), 'minutes');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testFullResetFlow();