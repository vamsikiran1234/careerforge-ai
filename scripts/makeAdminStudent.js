/**
 * Make User Admin + Student
 * 
 * Quick script to give a user both ADMIN and STUDENT roles
 * This allows the user to access admin features while still being able to test student features
 * 
 * Usage: node scripts/makeAdminStudent.js <email>
 * Example: node scripts/makeAdminStudent.js vamsikiran198@gmail.com
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdminStudent(email) {
  try {
    console.log(`\n🔄 Setting up ${email} with ADMIN + STUDENT roles...\n`);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`❌ User not found: ${email}\n`);
      return;
    }

    console.log(`✅ Found user: ${user.name}`);

    // Parse current roles
    const currentRoles = JSON.parse(user.roles);
    console.log(`Current roles: ${currentRoles.join(', ')}`);

    // Create new roles array with both ADMIN and STUDENT
    const desiredRoles = ['STUDENT', 'ADMIN'];
    const newRoles = Array.from(new Set([...currentRoles, ...desiredRoles])); // Remove duplicates
    const newRolesJSON = JSON.stringify(newRoles);

    // Check if update is needed
    const currentRolesSet = new Set(currentRoles);
    const newRolesSet = new Set(newRoles);
    const needsUpdate = currentRolesSet.size !== newRolesSet.size || 
                        ![...currentRolesSet].every(role => newRolesSet.has(role));

    if (!needsUpdate) {
      console.log(`\n✅ User already has both ADMIN and STUDENT roles!`);
      console.log(`Current roles: ${currentRoles.join(', ')}\n`);
      return;
    }

    // Update user
    await prisma.user.update({
      where: { email },
      data: { roles: newRolesJSON }
    });

    console.log(`\n✅ Successfully updated roles!`);
    console.log(`New roles: ${newRoles.join(', ')}`);
    console.log(`\n🎉 ${user.name} can now:`);
    console.log(`   ✓ Access admin dashboard and verify mentors (ADMIN)`);
    console.log(`   ✓ Use AI Chat and Career Quiz (STUDENT)`);
    console.log(`   ✓ Find mentors and request connections (STUDENT)`);
    console.log(`\n⚠️  IMPORTANT: ${user.name} must logout and login again to see all features!\n`);

    console.log(`📊 Admin URLs:`);
    console.log(`   • Dashboard: http://localhost:5173/admin`);
    console.log(`   • Verify Mentors: http://localhost:5173/admin/mentors\n`);

  } catch (error) {
    console.error('\n❌ Error updating roles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('\n📖 Usage: node scripts/makeAdminStudent.js <email>');
  console.log('\nExample: node scripts/makeAdminStudent.js vamsikiran198@gmail.com');
  console.log('\nThis will give the user both ADMIN and STUDENT roles.\n');
  process.exit(1);
}

const email = args[0];

makeAdminStudent(email)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
