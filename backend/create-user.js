const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUser() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: 'Vamsi Kiran',
        email: 'vamsikiran198@gmail.com',
        password: hashedPassword,
        roles: JSON.stringify(['STUDENT']),
      },
    });

    console.log('✅ User created successfully!');
    console.log('Email:', user.email);
    console.log('Password: Password123!');
    console.log('');
    console.log('You can now login with these credentials.');
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  User already exists with this email');
      console.log('Email: vamsikiran198@gmail.com');
      console.log('Password: Password123!');
    } else {
      console.error('Error creating user:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
