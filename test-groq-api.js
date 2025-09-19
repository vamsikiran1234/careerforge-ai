// Test Groq API Integration
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const aiService = require('./src/services/aiService');

const prisma = new PrismaClient();

async function testGroqAPI() {
  console.log('🧪 Testing Groq AI Service...\n');
  
  // Check environment
  console.log('📋 Environment Check:');
  console.log('- GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'SET ✅' : 'NOT SET ❌');
  console.log('');
  
  try {
    // Create or get test user
    let testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    });
    
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'test123',
          role: 'B.Tech Student',
          bio: 'Computer Science student looking for career guidance'
        }
      });
      console.log('👤 Created test user:', testUser.name);
    } else {
      console.log('👤 Using existing test user:', testUser.name);
    }
    
    // Test AI chat
    console.log('\n🤖 Testing AI Chat...');
    const testMessage = "I'm a final year CS student. What are the best career paths in tech right now?";
    
    console.log('📨 Sending message:', testMessage);
    console.log('⏳ Waiting for Groq AI response...\n');
    
    const response = await aiService.chatReply(testUser.id, testMessage, []);
    
    console.log('✅ AI Response:');
    console.log('━'.repeat(60));
    console.log(response);
    console.log('━'.repeat(60));
    
    // Check if it's a real response or mock
    if (response.includes('*Note: This is a demo response')) {
      console.log('\n⚠️  Received mock response - check your Groq API key');
    } else {
      console.log('\n🎉 Success! Groq AI is working perfectly!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGroqAPI().catch(console.error);