require('dotenv').config();
const config = require('./src/config');

async function testOpenAIConfig() {
  console.log('🔍 Testing OpenAI Configuration...\n');
  
  // Test API key format
  const apiKey = process.env.OPENAI_API_KEY;
  console.log('✅ API Key format:', apiKey ? `${apiKey.substring(0, 20)}...` : 'NOT SET');
  console.log('✅ Organization ID:', process.env.OPENAI_ORGANIZATION_ID || 'NOT SET');
  console.log('✅ Project ID:', process.env.OPENAI_PROJECT_ID || 'NOT SET');
  
  try {
    // Test list models (this should work even with quota issues)
    console.log('\n🔍 Testing model access...');
    const models = await config.openai.models.list();
    console.log('✅ Successfully connected to OpenAI');
    console.log('✅ Available models:', models.data.slice(0, 3).map(m => m.id).join(', '), '...');
    
    // Test chat completion (this might fail with quota)
    console.log('\n🔍 Testing chat completion...');
    const response = await config.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say "test successful"' }],
      max_tokens: 10
    });
    
    console.log('✅ Chat completion successful:', response.choices[0].message.content);
    console.log('🎉 ALL TESTS PASSED - OpenAI is working correctly!');
    
  } catch (error) {
    console.log('\n❌ Error details:');
    console.log('Status:', error.status);
    console.log('Type:', error.type);
    console.log('Code:', error.code);
    console.log('Message:', error.message);
    
    if (error.status === 429) {
      console.log('\n💡 QUOTA ISSUE - Follow these steps:');
      console.log('1. Check billing: https://platform.openai.com/settings/organization/billing');
      console.log('2. Add payment method if not added');
      console.log('3. Check usage limits');
      console.log('4. Contact OpenAI support if billing looks correct');
    } else if (error.status === 401) {
      console.log('\n💡 AUTHENTICATION ISSUE - Check:');
      console.log('1. API key is correct');
      console.log('2. Organization ID is correct');
      console.log('3. Project ID is correct (if using projects)');
    } else if (error.status === 404) {
      console.log('\n💡 MODEL ACCESS ISSUE - Check:');
      console.log('1. Your plan includes access to gpt-3.5-turbo');
      console.log('2. Try gpt-4o-mini instead');
    }
  }
}

testOpenAIConfig().then(() => {
  console.log('\n🔚 Test completed');
  process.exit(0);
}).catch(console.error);
