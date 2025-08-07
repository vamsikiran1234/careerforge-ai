const OpenAI = require('openai');
require('dotenv').config();

async function testOpenAI() {
  try {
    console.log('API Key format check:');
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('Starts with sk-:', apiKey.startsWith('sk-'));
    console.log('Length:', apiKey.length);
    console.log('First 10 chars:', apiKey.substring(0, 10));
    
    // Test with different initialization
    const openai = new OpenAI({
      apiKey: apiKey,
      // Try without any additional options
    });

    console.log('\nTesting with minimal request...');
    
    const response = await openai.models.list();
    console.log('✅ API connection works! Available models:', response.data.length);
    
    // Try a simple chat completion
    console.log('\nTesting chat completion...');
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ 
        role: 'user', 
        content: 'Hi' 
      }],
      max_tokens: 5,
    });

    console.log('✅ Chat completion successful!');
    console.log('Response:', chatResponse.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ Error details:');
    console.error('Message:', error.message);
    console.error('Status:', error.status);
    console.error('Code:', error.code);
    console.error('Type:', error.type);
    
    if (error.response) {
      console.error('Response headers:', error.response.headers);
    }
  }
}

testOpenAI();
