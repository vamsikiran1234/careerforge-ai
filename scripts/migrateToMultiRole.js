/**
 * Migration Script: Single Role to Multi-Role System
 * 
 * This script migrates the User model from a single 'role' field
 * to a 'roles' array field, enabling users to have multiple roles.
 * 
 * Migration: role (String) → roles (String containing JSON array)
 * Example: "STUDENT" → '["STUDENT"]'
 * Example: "ADMIN" → '["ADMIN"]'
 * 
 * Usage: node scripts/migrateToMultiRole.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateRoles() {
  console.log('🚀 Starting role migration...\n');

  try {
    // Step 1: Check if migration is needed
    console.log('📋 Step 1: Checking current database schema...');
    
    // Get all users
    const users = await prisma.$queryRaw`SELECT id, email, name, role FROM users`;
    
    if (users.length === 0) {
      console.log('⚠️  No users found in database. Migration not needed.');
      return;
    }

    console.log(`✅ Found ${users.length} user(s) to migrate\n`);

    // Step 2: Check if 'role' column exists (old schema)
    let hasOldRoleColumn = false;
    try {
      await prisma.$queryRaw`SELECT role FROM users LIMIT 1`;
      hasOldRoleColumn = true;
      console.log('📋 Old schema detected: "role" column exists');
    } catch (error) {
      console.log('📋 New schema detected: "role" column not found');
    }

    // Step 3: Check if 'roles' column exists (new schema)
    let hasNewRolesColumn = false;
    try {
      await prisma.$queryRaw`SELECT roles FROM users LIMIT 1`;
      hasNewRolesColumn = true;
      console.log('📋 New schema detected: "roles" column exists');
    } catch (error) {
      console.log('📋 "roles" column not found yet');
    }

    // Step 4: Perform migration based on schema state
    if (hasOldRoleColumn && !hasNewRolesColumn) {
      console.log('\n🔄 Migration needed: role → roles');
      console.log('⚠️  Please run: npx prisma migrate dev --name multi_role_support');
      console.log('⚠️  Then run this script again.');
      return;
    }

    if (!hasOldRoleColumn && hasNewRolesColumn) {
      console.log('\n✅ Schema already updated to use "roles" column');
      console.log('🔄 Checking if data migration is needed...\n');

      // Check if any user has invalid roles format
      let needsDataMigration = false;
      for (const user of users) {
        try {
          const rolesValue = await prisma.$queryRaw`SELECT roles FROM users WHERE id = ${user.id}`;
          const rolesString = rolesValue[0].roles;
          
          // Check if it's a valid JSON array
          if (!rolesString.startsWith('[') || !rolesString.endsWith(']')) {
            needsDataMigration = true;
            break;
          }
        } catch (error) {
          needsDataMigration = true;
          break;
        }
      }

      if (!needsDataMigration) {
        console.log('✅ All users already have proper roles format. No migration needed!\n');
        
        // Show current state
        console.log('📊 Current user roles:');
        for (const user of users) {
          const rolesData = await prisma.$queryRaw`SELECT roles FROM users WHERE id = ${user.id}`;
          const roles = JSON.parse(rolesData[0].roles);
          console.log(`   - ${user.name} (${user.email}): ${roles.join(', ')}`);
        }
        return;
      }
    }

    if (hasOldRoleColumn && hasNewRolesColumn) {
      console.log('\n🔄 Both columns exist. Migrating data from role → roles...\n');

      let migratedCount = 0;
      let skippedCount = 0;

      for (const user of users) {
        try {
          // Get current role value
          const roleData = await prisma.$queryRaw`SELECT role FROM users WHERE id = ${user.id}`;
          const currentRole = roleData[0].role;

          // Convert single role to array format
          const rolesArray = [currentRole];
          const rolesJSON = JSON.stringify(rolesArray);

          // Update roles column
          await prisma.$executeRaw`
            UPDATE users 
            SET roles = ${rolesJSON}
            WHERE id = ${user.id}
          `;

          console.log(`✅ Migrated: ${user.name} (${user.email})`);
          console.log(`   role: "${currentRole}" → roles: ${rolesJSON}`);
          migratedCount++;
        } catch (error) {
          console.error(`❌ Failed to migrate user ${user.email}:`, error.message);
          skippedCount++;
        }
      }

      console.log(`\n📊 Migration Summary:`);
      console.log(`   ✅ Successfully migrated: ${migratedCount}`);
      if (skippedCount > 0) {
        console.log(`   ⚠️  Skipped (errors): ${skippedCount}`);
      }

      console.log('\n✅ Data migration complete!');
      console.log('\n⚠️  IMPORTANT NEXT STEPS:');
      console.log('   1. Test the application thoroughly');
      console.log('   2. If everything works, you can drop the old "role" column:');
      console.log('      Run: npx prisma migrate dev --name remove_old_role_column');
      console.log('   3. Update the schema to remove the old "role" field');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\n🔄 Rolling back...');
    console.error('   To rollback: cp prisma/dev.db.backup prisma/dev.db');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateRoles()
  .then(() => {
    console.log('\n✨ Migration script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
  });
