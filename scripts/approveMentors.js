/**
 * Script to approve pending mentor profiles
 * Usage: node scripts/approveMentors.js
 * 
 * This will:
 * 1. List all pending mentors (isVerified=true, status=PENDING)
 * 2. Allow you to approve them (set status=ACTIVE)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function listPendingMentors() {
  const mentors = await prisma.mentorProfile.findMany({
    where: {
      isVerified: true,
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return mentors;
}

async function approveMentor(mentorId) {
  const updatedMentor = await prisma.mentorProfile.update({
    where: { id: mentorId },
    data: {
      status: 'ACTIVE',
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  console.log(`✅ Approved mentor: ${updatedMentor.user.name} (${updatedMentor.user.email})`);
  return updatedMentor;
}

async function approveAllMentors() {
  const result = await prisma.mentorProfile.updateMany({
    where: {
      isVerified: true,
      status: 'PENDING',
    },
    data: {
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Approved ${result.count} mentor(s)`);
  return result.count;
}

async function main() {
  try {
    console.log('🔍 Fetching pending mentors...\n');

    const pendingMentors = await listPendingMentors();

    if (pendingMentors.length === 0) {
      console.log('✅ No pending mentors found. All mentors are already approved!');
      process.exit(0);
    }

    console.log(`📋 Found ${pendingMentors.length} pending mentor(s):\n`);
    
    pendingMentors.forEach((mentor, index) => {
      const expertiseAreas = JSON.parse(mentor.expertiseAreas || '[]');
      console.log(`${index + 1}. ${mentor.user.name}`);
      console.log(`   Email: ${mentor.user.email}`);
      console.log(`   Company: ${mentor.company}`);
      console.log(`   Job Title: ${mentor.jobTitle}`);
      console.log(`   Experience: ${mentor.yearsOfExperience} years`);
      console.log(`   Expertise: ${expertiseAreas.join(', ')}`);
      console.log(`   College: ${mentor.collegeName} (${mentor.graduationYear})`);
      console.log(`   Verified: ${mentor.isVerified ? '✅' : '❌'}`);
      console.log(`   Status: ${mentor.status}`);
      console.log(`   Mentor ID: ${mentor.id}`);
      console.log('');
    });

    const action = await question(
      '\nWhat would you like to do?\n' +
      '1. Approve ALL pending mentors\n' +
      '2. Approve specific mentor by number\n' +
      '3. Exit\n' +
      'Enter your choice (1-3): '
    );

    switch (action.trim()) {
      case '1':
        const confirmAll = await question(
          `\n⚠️  Are you sure you want to approve ALL ${pendingMentors.length} mentor(s)? (yes/no): `
        );
        
        if (confirmAll.toLowerCase() === 'yes') {
          await approveAllMentors();
          console.log('\n🎉 All mentors have been approved!');
        } else {
          console.log('❌ Action cancelled.');
        }
        break;

      case '2':
        const mentorNumber = await question('\nEnter the mentor number to approve: ');
        const index = parseInt(mentorNumber) - 1;

        if (index >= 0 && index < pendingMentors.length) {
          const mentor = pendingMentors[index];
          const confirm = await question(
            `\n⚠️  Approve mentor "${mentor.user.name}" (${mentor.user.email})? (yes/no): `
          );

          if (confirm.toLowerCase() === 'yes') {
            await approveMentor(mentor.id);
            console.log('\n🎉 Mentor approved successfully!');
          } else {
            console.log('❌ Action cancelled.');
          }
        } else {
          console.log('❌ Invalid mentor number.');
        }
        break;

      case '3':
        console.log('👋 Goodbye!');
        break;

      default:
        console.log('❌ Invalid choice. Please run the script again.');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();
