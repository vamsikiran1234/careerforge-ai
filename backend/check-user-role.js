const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'vamsikiran198@gmail.com' },
      select: { email: true, name: true, roles: true }
    });
    
    console.log('\n📋 Current User Details:');
    console.log(JSON.stringify(user, null, 2));
    
    if (user) {
      const roles = JSON.parse(user.roles);
      console.log('\n🎭 Parsed Roles:', roles);
      console.log('✅ Is Admin:', roles.includes('ADMIN'));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
