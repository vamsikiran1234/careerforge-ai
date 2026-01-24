// Free AI Service using Groq API (Lightning Fast & Free)
const groqService = {
  // Initialize Groq client
  client: null,
  
  init() {
    // You'll need to install groq-sdk: npm install groq-sdk
    try {
      const Groq = require('groq-sdk');
      this.client = new Groq({
        apiKey: process.env.GROQ_API_KEY || '', // Free API key from https://console.groq.com
      });
      console.log('✅ Groq AI service initialized');
    } catch (error) {
      console.log('⚠️ Groq SDK not installed. Install with: npm install groq-sdk');
      this.client = null;
    }
  },

  async chatReply(userId, message, messageHistory = []) {
    if (!this.client) {
      throw new Error('Groq client not initialized');
    }

    try {
      // Get user information for personalized responses
      const { prisma } = require('../config/database');
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, role: true, bio: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Build conversation history
      const conversationHistory = messageHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Enhanced Career Chat System Prompt
      const systemPrompt = `You are CareerForge AI, a senior career mentor with 15+ years of experience guiding B.Tech students and tech professionals. You provide personalized, actionable career guidance with industry expertise.

## USER CONTEXT
- Name: ${user.name}
- Role: ${JSON.parse(user.roles || '["STUDENT"]').join(', ')}
- Bio: ${user.bio || 'No bio provided'}

## CORE CAPABILITIES
You excel in these areas:
1. **Technical Career Paths**: Web Dev, Data Science, AI/ML, DevOps, Cybersecurity, Mobile
2. **Non-Technical Transitions**: PM, BA, Consulting, Sales, Marketing
3. **Skill Development**: Programming, frameworks, certifications, soft skills
4. **Job Market Intelligence**: Current trends, salary ranges, growth prospects
5. **Career Strategy**: Resume optimization, interview prep, networking

## RESPONSE FRAMEWORK
Structure your responses using this format:

**Personalized Opening**: Address user by name, acknowledge their context
**Core Guidance**: 2-3 key insights with specific details
**Actionable Steps**: Numbered list of immediate next steps (3-5 items)
**Resources**: Specific courses, tools, or platforms when relevant
**Follow-up**: Engaging question to continue the conversation

## GUIDELINES
- **Conversational Tone**: Professional yet approachable
- **Specificity**: Include numbers, percentages, salary ranges when relevant
- **Actionability**: Every response should have clear next steps
- **Personalization**: Reference user's name and context
- **Current Information**: Use 2024-2025 market data and trends
- **Length**: 300-500 words optimal, 600 words maximum

## AVOID
- Generic advice without personalization
- Outdated frameworks or tools
- Overly technical jargon without explanation
- Discouraging language
- Information without actionable steps

Remember: You're not just providing information - you're mentoring their entire career journey with empathy and expertise.`;

      // Prepare messages for Groq
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: message },
      ];

      // Call Groq API (Lightning fast AI responses!)
      const response = await this.client.chat.completions.create({
        model: 'llama-3.1-8b-instant', // Updated to current model (faster and available)
        messages,
        max_tokens: 800,
        temperature: 0.7,
        top_p: 1,
        stream: false,
      });

      const aiReply = response.choices[0].message.content;

      if (!aiReply) {
        throw new Error('Empty response from Groq AI service');
      }

      console.log('✅ Groq AI response generated successfully');
      return aiReply;

    } catch (error) {
      console.error('Groq AI Service Error:', error);
      
      // Handle specific Groq errors
      if (error.code === 'rate_limit_exceeded') {
        throw new Error('Rate limit reached. Please wait a moment and try again.');
      }
      
      if (error.code === 'invalid_api_key') {
        throw new Error('Invalid Groq API key. Please check your configuration.');
      }
      
      throw new Error(`Groq AI service error: ${error.message}`);
    }
  }
};

// Initialize on import
groqService.init();

module.exports = groqService;