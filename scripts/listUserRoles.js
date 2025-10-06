/**
 * List User Roles Script
 * 
 * Lists all roles for a user or all users with their roles
 * 
 * Usage: 
 *   node scripts/listUserRoles.js                     # List all users and roles
 *   node scripts/listUserRoles.js <email>             # List specific user's roles
 * 
 * Examples:
 *   node scripts/listUserRoles.js
 *   node scripts/listUserRoles.js vamsikiran198@gmail.com
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUserRoles(email = null) {
  try {
    if (email) {
      // List specific user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        console.error(`\n❌ User not found: ${email}\n`);
        return;
      }

      const roles = JSON.parse(user.roles);
      console.log(`\n👤 User: ${user.name}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🎭 Roles: ${roles.join(', ')}`);
      console.log(`🆔 ID: ${user.id}`);
      console.log(`📅 Created: ${user.createdAt.toLocaleDateString()}\n`);

    } else {
      // List all users
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
      });

      if (users.length === 0) {
        console.log('\n⚠️  No users found in database.\n');
        return;
      }

      console.log(`\n📊 All Users and Their Roles (${users.length} total):\n`);
      
      users.forEach((user, index) => {
        const roles = JSON.parse(user.roles);
        console.log(`${index + 1}. ${user.name} (${user.email})`);
        console.log(`   Roles: ${roles.join(', ')}`);
        console.log(`   ID: ${user.id}`);
        console.log('');
      });

      // Show role statistics
      const roleStats = {};
      users.forEach(user => {
        const roles = JSON.parse(user.roles);
        roles.forEach(role => {
          roleStats[role] = (roleStats[role] || 0) + 1;
        });
      });

      console.log('📈 Role Statistics:');
      Object.entries(roleStats).forEach(([role, count]) => {
        console.log(`   ${role}: ${count} user(s)`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('\n❌ Error listing roles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const email = args[0] || null;

listUserRoles(email)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
