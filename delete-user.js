// 🗑️ Delete User by Email
// Usage: node delete-user.js EMAIL

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteUser() {
  try {
    // Get email from command line argument
    const email = process.argv[2];
    
    if (!email) {
      console.log('❌ Please provide an email address');
      console.log('Usage: node delete-user.js EMAIL');
      console.log('Example: node delete-user.js vamsikiran198@gmail.com');
      process.exit(1);
    }

    console.log(`\n🔍 Searching for user: ${email}`);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`\n✅ User found:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Roles: ${user.roles}`);
    console.log(`   Created: ${user.createdAt}`);

    // Delete related records first (if any)
    console.log(`\n🧹 Checking for related records...`);

    // Count related records
    const [mentorProfile, careerSessions, quizSessions, studentQuestions, messageReactions, sharedConversations, careerGoals] = await Promise.all([
      prisma.mentorProfile.count({ where: { userId: user.id } }),
      prisma.careerSession.count({ where: { userId: user.id } }),
      prisma.quizSession.count({ where: { userId: user.id } }),
      prisma.studentQuestion.count({ where: { userId: user.id } }),
      prisma.messageReaction.count({ where: { userId: user.id } }),
      prisma.sharedConversation.count({ where: { createdById: user.id } }),
      prisma.careerGoal.count({ where: { userId: user.id } }),
    ]);

    const totalRelated = mentorProfile + careerSessions + quizSessions + studentQuestions + messageReactions + sharedConversations + careerGoals;

    if (totalRelated > 0) {
      console.log(`   Found ${totalRelated} related records:`);
      if (mentorProfile > 0) console.log(`   - Mentor Profiles: ${mentorProfile}`);
      if (careerSessions > 0) console.log(`   - Career Sessions: ${careerSessions}`);
      if (quizSessions > 0) console.log(`   - Quiz Sessions: ${quizSessions}`);
      if (studentQuestions > 0) console.log(`   - Student Questions: ${studentQuestions}`);
      if (messageReactions > 0) console.log(`   - Message Reactions: ${messageReactions}`);
      if (sharedConversations > 0) console.log(`   - Shared Conversations: ${sharedConversations}`);
      if (careerGoals > 0) console.log(`   - Career Goals: ${careerGoals}`);
      
      console.log(`\n🗑️  Deleting related records...`);
      
      // Delete related records
      await Promise.all([
        prisma.mentorProfile.deleteMany({ where: { userId: user.id } }),
        prisma.careerSession.deleteMany({ where: { userId: user.id } }),
        prisma.quizSession.deleteMany({ where: { userId: user.id } }),
        prisma.studentQuestion.deleteMany({ where: { userId: user.id } }),
        prisma.messageReaction.deleteMany({ where: { userId: user.id } }),
        prisma.sharedConversation.deleteMany({ where: { createdById: user.id } }),
        prisma.careerGoal.deleteMany({ where: { userId: user.id } }),
      ]);
      
      console.log(`   ✅ Deleted ${totalRelated} related records`);
    } else {
      console.log(`   ✅ No related records found`);
    }

    // Delete the user
    console.log(`\n🗑️  Deleting user...`);
    await prisma.user.delete({
      where: { email }
    });

    console.log(`✅ User deleted successfully: ${email}`);
    console.log(`\n💡 You can now register again with:`);
    console.log(`   POST /api/v1/auth/register`);
    console.log(`   Body: { "name": "Your Name", "email": "${email}", "password": "YourPassword" }`);
    console.log(`\n📝 With the recent fix, ${email} will automatically get STUDENT+ADMIN roles!`);

  } catch (error) {
    console.error('\n❌ Error deleting user:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser();
