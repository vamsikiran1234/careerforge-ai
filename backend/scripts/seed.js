const bcrypt = require('bcryptjs');
const { prisma } = require('../src/config/database');

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    const demoAccounts = [
      {
        email: 'demo.user@careerforge.ai',
        password: 'CareerForge@Demo2026',
        name: 'Demo Student',
        roles: '["STUDENT"]',
        bio: 'CareerForge AI Demo Account for exploring career pathways and AI mentorship.',
      },
      {
        email: 'test@example.com',
        password: 'TestPass123!',
        name: 'Test User',
        roles: '["STUDENT"]',
        bio: 'Platform Test Account.',
      },
      {
        email: 'admin@careerforge.ai',
        password: 'CareerForge@Admin2026',
        name: 'Platform Admin',
        roles: '["STUDENT","ADMIN"]',
        bio: 'System Administrator account.',
      },
    ];

    for (const account of demoAccounts) {
      const hashedPassword = await bcrypt.hash(account.password, 10);

      const user = await prisma.user.upsert({
        where: { email: account.email },
        update: {
          name: account.name,
          password: hashedPassword,
          roles: account.roles,
          bio: account.bio,
        },
        create: {
          email: account.email,
          name: account.name,
          password: hashedPassword,
          roles: account.roles,
          bio: account.bio,
        },
      });

      console.log(`✅ Seeded account: ${user.email} (${user.name})`);
    }

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
