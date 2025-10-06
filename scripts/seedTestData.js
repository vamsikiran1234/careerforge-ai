/**
 * SEED TEST DATA SCRIPT
 * 
 * This script populates the database with sample test data for testing purposes.
 * 
 * Usage: node scripts/seedTestData.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding with test data...\n');

  try {
    // Clean up existing test data
    console.log('🧹 Cleaning up existing test data...');
    await prisma.user.deleteMany({
      where: { email: { contains: '@test.com' } }
    });
    console.log('✅ Cleanup complete\n');

    // Hash password for all test users
    const hashedPassword = await bcrypt.hash('Test123!@#', 10);

    // Create User 1: Student + Admin
    console.log('👤 Creating User 1: Student + Admin...');
    const user1 = await prisma.user.create({
      data: {
        email: 'student-admin@test.com',
        password: hashedPassword,
        name: 'Admin Student',
        roles: '["STUDENT","ADMIN"]'
      }
    });
    console.log(`✅ Created: ${user1.email} (Roles: STUDENT, ADMIN)\n`);

    // Create User 2: Student Only
    console.log('👤 Creating User 2: Student...');
    const user2 = await prisma.user.create({
      data: {
        email: 'student-only@test.com',
        password: hashedPassword,
        name: 'John Student',
        roles: '["STUDENT"]'
      }
    });
    console.log(`✅ Created: ${user2.email} (Roles: STUDENT)\n`);

    // Create User 3: Mentor
    console.log('👤 Creating User 3: Verified Mentor...');
    const user3 = await prisma.user.create({
      data: {
        email: 'mentor-user@test.com',
        password: hashedPassword,
        name: 'Sarah Mentor',
        roles: '["STUDENT"]'
      }
    });

    // Create mentor profile for User 3
    const mentorProfile = await prisma.mentorProfile.create({
      data: {
        userId: user3.id,
        company: 'Tech Corp',
        jobTitle: 'Senior Software Engineer',
        industry: 'Technology',
        yearsOfExperience: 10,
        collegeName: 'MIT',
        degree: 'BS Computer Science',
        graduationYear: 2013,
        major: 'Computer Science',
        expertiseAreas: '["JavaScript","React","Node.js","System Design"]',
        bio: 'Experienced software engineer helping students transition into tech careers.',
        linkedinUrl: 'https://linkedin.com/in/sarah-mentor',
        portfolioUrl: 'https://github.com/sarah-mentor',
        availableHoursPerWeek: 5,
        preferredMeetingType: 'VIDEO',
        timezone: 'UTC',
        isVerified: true,
        status: 'ACTIVE'
      }
    });
    console.log(`✅ Created: ${user3.email} (Mentor Profile: ACTIVE)\n`);

    // Create Connection
    console.log('🔗 Creating connection...');
    const connection = await prisma.mentorConnection.create({
      data: {
        mentorId: mentorProfile.id,
        studentId: user2.id,
        status: 'ACCEPTED',
        message: 'Hi Sarah! I would love to learn from you!',
        acceptedAt: new Date()
      }
    });
    console.log(`✅ Connection created (Status: ACCEPTED)\n`);

    // Create Chat Room
    console.log('💬 Creating chat room...');
    const chatRoom = await prisma.chatRoom.create({
      data: {
        mentorId: mentorProfile.id,
        studentId: user2.id,
        connectionId: connection.id,
        lastActivity: new Date()
      }
    });

    // Create Chat Messages
    await prisma.chatMessage.create({
      data: {
        roomId: chatRoom.id,
        senderId: user2.id,
        content: 'Hi Sarah! Thank you for accepting!'
      }
    });
    
    await prisma.chatMessage.create({
      data: {
        roomId: chatRoom.id,
        senderId: user3.id,
        content: 'Happy to help!'
      }
    });
    
    console.log(`✅ Created chat room with 2 messages\n`);

    // Create Sessions
    console.log('📅 Creating sessions...');
    const session1 = await prisma.mentorSession.create({
      data: {
        mentorId: mentorProfile.id,
        studentId: user2.id,
        title: 'Career Planning',
        description: 'Discuss career goals.',
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        duration: 60,
        timezone: 'UTC',
        status: 'SCHEDULED',
        meetingLink: 'https://meet.google.com/abc-defg-hij'
      }
    });

    const session2 = await prisma.mentorSession.create({
      data: {
        mentorId: mentorProfile.id,
        studentId: user2.id,
        title: 'Mock Interview',
        description: 'Practice interview questions.',
        scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        duration: 90,
        timezone: 'UTC',
        status: 'COMPLETED',
        meetingLink: 'https://meet.google.com/xyz-abcd-efg'
      }
    });
    console.log(`✅ Created 2 sessions\n`);

    // Create Review
    console.log('⭐ Creating review...');
    await prisma.mentorReview.create({
      data: {
        mentorId: mentorProfile.id,
        studentId: user2.id,
        sessionId: session2.id,
        overallRating: 5,
        communicationRating: 5,
        knowledgeRating: 5,
        helpfulnessRating: 5,
        comment: 'Amazing session! Very helpful!',
        isPublic: true
      }
    });
    console.log(`✅ Review created (5 stars)\n`);

    // Summary
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✨ TEST DATA SEEDING COMPLETED SUCCESSFULLY! ✨');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    console.log('📋 TEST USERS:');
    console.log('───────────────────────────────────────────────────────────────');
    console.log(`1. ${user1.email} - Password: Test123!@#`);
    console.log(`   Roles: STUDENT, ADMIN\n`);
    
    console.log(`2. ${user2.email} - Password: Test123!@#`);
    console.log(`   Roles: STUDENT\n`);
    
    console.log(`3. ${user3.email} - Password: Test123!@#`);
    console.log(`   Roles: STUDENT (with ACTIVE mentor profile)\n`);
    
    console.log('📊 DATA CREATED:');
    console.log('───────────────────────────────────────────────────────────────');
    console.log('✅ 1 connection (ACCEPTED)');
    console.log('✅ 2 sessions (1 scheduled, 1 completed)');
    console.log('✅ 1 review (5 stars)');
    console.log('✅ 1 chat room with 2 messages');
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.error('Error details:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
