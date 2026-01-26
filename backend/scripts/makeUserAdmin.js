const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeUserAdmin() {
  try {
    const email = 'vamsikiran198@gmail.com';
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found.`);
      console.log('💡 Please register with this email first.');
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`);
    console.log(`📋 Current roles: ${user.roles}`);

    // Update roles to include both STUDENT and ADMIN
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        roles: '["STUDENT","ADMIN"]'
      }
    });

    console.log(`✅ Updated roles: ${updatedUser.roles}`);
    console.log(`🎉 ${email} is now an ADMIN!`);
    console.log('');
    console.log('🔄 Please logout and login again for changes to take effect.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

makeUserAdmin();
