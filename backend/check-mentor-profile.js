const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMentorProfile() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'vamsikiran198@gmail.com' },
      include: { mentorProfile: true }
    });
    
    console.log('User:', JSON.stringify(user, null, 2));
    
    if (user.mentorProfile) {
      console.log('\n✅ User has a mentor profile!');
      console.log('Status:', user.mentorProfile.status);
    } else {
      console.log('\n❌ User does NOT have a mentor profile');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMentorProfile();
