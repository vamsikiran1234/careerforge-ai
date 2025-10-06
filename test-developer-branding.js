// Test Developer Branding
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const aiService = require('./src/services/aiService');

const prisma = new PrismaClient();

async function testDeveloperBranding() {
  console.log('🧪 Testing Developer Branding...\n');
  
  try {
    // Get test user
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
          bio: 'Computer Science student'
        }
      });
    }
    
    // Test developer branding question
    console.log('🤖 Testing developer branding question...');
    const testMessage = "Who developed you? Who created CareerForge AI?";
    
    console.log('📨 Sending message:', testMessage);
    console.log('⏳ Waiting for AI response with developer branding...\n');
    
    const response = await aiService.chatReply(testUser.id, testMessage, []);
    
    console.log('✅ AI Response with Developer Branding:');
    console.log('━'.repeat(80));
    console.log(response);
    console.log('━'.repeat(80));
    
    // Check if it mentions Vamsi Kiran
    if (response.includes('Vamsi Kiran') || response.includes('Vamsi')) {
      console.log('\n🎉 Success! Developer branding is working - Vamsi Kiran mentioned!');
    } else {
      console.log('\n⚠️  Developer branding might need adjustment - Vamsi Kiran not found in response');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDeveloperBranding().catch(console.error);