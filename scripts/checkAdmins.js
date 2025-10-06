/**
 * Script to check admin users
 * Usage: node scripts/checkAdmins.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmins() {
  try {
    console.log('\n🔍 Checking for admin users...\n');
    
    // Find all admin users
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (admins.length === 0) {
      console.log('❌ No admin users found.\n');
      console.log('💡 Run: node scripts/makeAdmin.js\n');
      process.exit(0);
    }

    console.log(`✅ Found ${admins.length} admin user(s):\n`);
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Created: ${new Date(admin.createdAt).toLocaleDateString()}\n`);
    });

    console.log('🎉 You can access admin features at:\n');
    console.log('   📊 Admin Dashboard: http://localhost:5173/admin');
    console.log('   ✓ Verify Mentors: http://localhost:5173/admin/mentors\n');
    console.log('⚠️  Remember: Logout and login again to see admin sidebar links!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmins();
