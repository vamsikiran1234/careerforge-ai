/**
 * Remove Role Script
 * 
 * Removes a role from a user's roles array
 * 
 * Usage: node scripts/removeRole.js <email> <role>
 * Example: node scripts/removeRole.js vamsikiran198@gmail.com MENTOR
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const VALID_ROLES = ['STUDENT', 'MENTOR', 'ADMIN'];

async function removeRole(email, roleToRemove) {
  try {
    // Validate role
    if (!VALID_ROLES.includes(roleToRemove)) {
      console.error(`\n❌ Invalid role: ${roleToRemove}`);
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

    // Check if role exists
    if (!currentRoles.includes(roleToRemove)) {
      console.log(`\n⚠️  User doesn't have ${roleToRemove} role. No changes made.\n`);
      return;
    }

    // Check if it's the last role
    if (currentRoles.length === 1) {
      console.error(`\n❌ Cannot remove last role. User must have at least one role.`);
      console.log(`Tip: Add another role first, then remove this one.\n`);
      return;
    }

    // Remove role
    const newRoles = currentRoles.filter(role => role !== roleToRemove);
    const newRolesJSON = JSON.stringify(newRoles);

    // Update user
    await prisma.user.update({
      where: { email },
      data: { roles: newRolesJSON }
    });

    console.log(`\n✅ Successfully removed ${roleToRemove} role!`);
    console.log(`New roles: ${newRoles.join(', ')}`);
    console.log(`\n⚠️  IMPORTANT: User must logout and login again for changes to take effect!\n`);

  } catch (error) {
    console.error('\n❌ Error removing role:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('\n📖 Usage: node scripts/removeRole.js <email> <role>');
  console.log('\nExample: node scripts/removeRole.js vamsikiran198@gmail.com MENTOR');
  console.log(`\nValid roles: ${VALID_ROLES.join(', ')}\n`);
  process.exit(1);
}

const [email, role] = args;
const roleUpper = role.toUpperCase();

removeRole(email, roleUpper)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
