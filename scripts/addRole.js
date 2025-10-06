/**
 * Add Role Script
 * 
 * Adds a role to a user's roles array
 * 
 * Usage: node scripts/addRole.js <email> <role>
 * Example: node scripts/addRole.js vamsikiran198@gmail.com ADMIN
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const VALID_ROLES = ['STUDENT', 'MENTOR', 'ADMIN'];

async function addRole(email, roleToAdd) {
  try {
    // Validate role
    if (!VALID_ROLES.includes(roleToAdd)) {
      console.error(`\n❌ Invalid role: ${roleToAdd}`);
      console.log(`Valid roles are: ${VALID_ROLES.join(', ')}\n`);
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`\n❌ User not found: ${email}\n`);
      return;
    }

    // Parse current roles
    const currentRoles = JSON.parse(user.roles);
    console.log(`\n📋 User: ${user.name} (${user.email})`);
    console.log(`Current roles: ${currentRoles.join(', ')}`);

    // Check if role already exists
    if (currentRoles.includes(roleToAdd)) {
      console.log(`\n⚠️  User already has ${roleToAdd} role. No changes made.\n`);
      return;
    }

    // Add new role
    const newRoles = [...currentRoles, roleToAdd];
    const newRolesJSON = JSON.stringify(newRoles);

    // Update user
    await prisma.user.update({
      where: { email },
      data: { roles: newRolesJSON }
    });

    console.log(`\n✅ Successfully added ${roleToAdd} role!`);
    console.log(`New roles: ${newRoles.join(', ')}`);
    console.log(`\n⚠️  IMPORTANT: User must logout and login again to see new permissions!\n`);

  } catch (error) {
    console.error('\n❌ Error adding role:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('\n📖 Usage: node scripts/addRole.js <email> <role>');
  console.log('\nExample: node scripts/addRole.js vamsikiran198@gmail.com ADMIN');
  console.log(`\nValid roles: ${VALID_ROLES.join(', ')}\n`);
  process.exit(1);
}

const [email, role] = args;
const roleUpper = role.toUpperCase();

addRole(email, roleUpper)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
