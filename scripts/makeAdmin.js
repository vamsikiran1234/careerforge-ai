/**
 * Script to make a user an admin
 * Usage: node scripts/makeAdmin.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin() {
  try {
    const email = 'vamsikiran198@gmail.com'; // Your email
    
    console.log(`\n🔍 Looking for user with email: ${email}\n`);
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      console.log(`❌ User not found with email: ${email}`);
      console.log(`\n💡 Make sure you have an account registered with this email.`);
      console.log(`   Register at: http://localhost:5173/register\n`);
      process.exit(1);
    }

    console.log('📋 Current user details:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Role: ${user.role}\n`);

    if (user.role === 'ADMIN') {
      console.log('✅ User is already an ADMIN!\n');
      process.exit(0);
    }

    // Update to admin
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    console.log('✅ Successfully updated user to ADMIN!\n');
    console.log('📋 Updated user details:');
    console.log(`   Name: ${updatedUser.name}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   New Role: ${updatedUser.role}\n`);
    
    console.log('🎉 You are now an admin!\n');
    console.log('⚠️  IMPORTANT: Logout and login again to see admin features in the sidebar.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
