const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  try {
    console.log('Testing OpenAI connection...');
    console.log('API Key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ 
        role: 'user', 
        content: 'Hello, just testing the connection!' 
      }],
      max_tokens: 10,
    });

    console.log('✅ OpenAI connection successful!');
    console.log('Response:', response.choices[0].message.content);
  } catch (error) {
    console.error('❌ OpenAI connection failed:');
    console.error('Error:', error.message);
    console.error('Status:', error.status);
    console.error('Code:', error.code);
    console.error('Type:', error.type);
  }
}

testOpenAI();
