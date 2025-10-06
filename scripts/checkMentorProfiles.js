/**
 * Check Mentor Profiles Status
 * 
 * This script checks all mentor profiles in the database and shows their verification status
 * 
 * Usage: node scripts/checkMentorProfiles.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMentorProfiles() {
  console.log('\n🔍 Checking Mentor Profiles Status\n');
  console.log('=' .repeat(80));

  try {
    // Get all mentor profiles
    const allProfiles = await prisma.mentorProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`\n📊 Total Mentor Profiles: ${allProfiles.length}\n`);

    if (allProfiles.length === 0) {
      console.log('✅ No mentor profiles found in database');
      console.log('   This is correct if no one has registered as a mentor yet.\n');
      return;
    }

    // Group by status
    const byStatus = {
      UNVERIFIED: [],
      PENDING: [],
      ACTIVE: [],
      REJECTED: [],
    };

    allProfiles.forEach(profile => {
      if (!profile.isVerified) {
        byStatus.UNVERIFIED.push(profile);
      } else {
        byStatus[profile.status]?.push(profile);
      }
    });

    // Display counts
    console.log('📈 Breakdown by Status:\n');
    console.log(`   UNVERIFIED (email not verified): ${byStatus.UNVERIFIED.length}`);
    console.log(`   PENDING (verified, awaiting admin): ${byStatus.PENDING.length}`);
    console.log(`   ACTIVE (approved by admin): ${byStatus.ACTIVE.length}`);
    console.log(`   REJECTED (rejected by admin): ${byStatus.REJECTED.length}`);

    // Show unverified profiles (these shouldn't count in analytics)
    if (byStatus.UNVERIFIED.length > 0) {
      console.log('\n⚠️  UNVERIFIED Profiles (Email Not Verified):');
      console.log('   These should NOT appear in admin dashboard counts\n');
      
      byStatus.UNVERIFIED.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.user.name} (${profile.user.email})`);
        console.log(`      Profile ID: ${profile.id}`);
        console.log(`      Created: ${profile.createdAt.toLocaleString()}`);
        console.log(`      Has Token: ${profile.verificationToken ? 'YES' : 'NO'}`);
        
        if (profile.verificationToken) {
          const isExpired = new Date() > new Date(profile.verificationExpiry);
          console.log(`      Token Expired: ${isExpired ? 'YES ⚠️' : 'NO ✅'}`);
          if (isExpired) {
            console.log(`      Expired at: ${profile.verificationExpiry.toLocaleString()}`);
          }
        }
        console.log('');
      });
    }

    // Show pending profiles (should appear in admin dashboard)
    if (byStatus.PENDING.length > 0) {
      console.log('⏳ PENDING Profiles (Awaiting Admin Approval):');
      console.log('   These SHOULD appear in admin dashboard\n');
      
      byStatus.PENDING.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.user.name} (${profile.user.email})`);
        console.log(`      Profile ID: ${profile.id}`);
        console.log(`      Verified Email: ${profile.isVerified ? 'YES ✅' : 'NO ❌'}`);
        console.log(`      Created: ${profile.createdAt.toLocaleString()}`);
        console.log('');
      });
    }

    // Show active profiles
    if (byStatus.ACTIVE.length > 0) {
      console.log('✅ ACTIVE Profiles (Approved Mentors):\n');
      
      byStatus.ACTIVE.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.user.name} (${profile.user.email})`);
        console.log(`      Profile ID: ${profile.id}`);
        console.log(`      Expertise: ${profile.jobTitle || 'N/A'}`);
        console.log('');
      });
    }

    // Show rejected profiles
    if (byStatus.REJECTED.length > 0) {
      console.log('❌ REJECTED Profiles:\n');
      
      byStatus.REJECTED.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.user.name} (${profile.user.email})`);
        console.log(`      Profile ID: ${profile.id}`);
        console.log('');
      });
    }

    console.log('=' .repeat(80));
    console.log('\n💡 Expected Admin Dashboard Counts:');
    console.log(`   Total Mentors: ${byStatus.PENDING.length + byStatus.ACTIVE.length}`);
    console.log(`   Pending: ${byStatus.PENDING.length}`);
    console.log(`   Active: ${byStatus.ACTIVE.length}`);
    console.log('\n✅ Check complete!\n');

  } catch (error) {
    console.error('\n❌ Error checking mentor profiles:', error);
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkMentorProfiles();
