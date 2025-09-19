const config = require('../config');
const { prisma } = require('../config/database');
const { getRandomResponse } = require('./mockAI');
const Groq = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const aiService = {
  // Career Chat AI Service with Groq
  chatReply: async (userId, message, messageHistory = []) => {
    try {
      console.log('🚀 Starting AI chat reply with Groq service...');
      
      // Get user information for personalized responses
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          role: true,
          bio: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Build conversation history
      const conversationHistory = messageHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Enhanced Career Chat System Prompt for Groq
      const systemPrompt = `You are CareerForge AI, a senior career mentor with 15+ years of experience guiding B.Tech students and tech professionals. You provide personalized, actionable career guidance with industry expertise.

## USER CONTEXT
- Name: ${user.name}
- Role: ${user.role}
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

      // Call Groq API
      console.log('🤖 Calling Groq API with llama-3.1-8b-instant...');
      const response = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages,
        max_tokens: 800,
        temperature: 0.7,
        top_p: 1,
        stream: false,
      });

      const aiReply = response.choices[0]?.message?.content;

      if (!aiReply) {
        throw new Error('Empty response from Groq AI service');
      }

      console.log('✅ Groq AI response generated successfully');
      return aiReply;
      
    } catch (error) {
      console.error('Groq AI Service Error:', error);
      
      // Enhanced error handling for Groq API
      if (error.error?.code === 'invalid_api_key' || error.status === 401) {
        console.log('🔑 Invalid Groq API key, using mock response');
        const mockResponse = getRandomResponse('careerAdvice');
        return `${mockResponse}\n\n*Note: This is a demo response. Please check your Groq API key configuration.*`;
      }
      
      if (error.status === 429) {
        console.log('⏰ Groq rate limit hit, using mock response');
        const mockResponse = getRandomResponse('careerAdvice');
        return `${mockResponse}\n\n*Note: This is a demo response due to rate limiting.*`;
      }
      
      // Final fallback to mock response
      console.log('🔄 Using final fallback mock response');
      const mockResponse = getRandomResponse('careerAdvice');
      return `${mockResponse}\n\n*Note: This is a demo response as AI services are temporarily unavailable.*`;
    }
  },

  // Legacy OpenAI implementation (kept for reference)
  chatReplyOpenAI: async (userId, message, messageHistory = []) => {
    try {
      // Get user information for personalized responses
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          role: true,
          bio: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Build conversation history for OpenAI
      const conversationHistory = messageHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Enhanced Career Chat System Prompt
      const systemPrompt = `You are CareerForge AI, a senior career mentor with 15+ years of experience guiding B.Tech students and tech professionals. You provide personalized, actionable career guidance with industry expertise.

## USER CONTEXT
- Name: ${user.name}
- Role: ${user.role}
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

      // Prepare messages for OpenAI
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: message },
      ];

      // Call OpenAI API
      const response = await config.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 800,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
        stream: false,
      });

      const aiReply = response.choices[0].message.content;

      if (!aiReply) {
        throw new Error('Empty response from AI service');
      }

      return aiReply;
    } catch (error) {
      console.error('AI Service Error:', error);

      // Enhanced error handling with specific error types
      const { handleAIServiceError } = require('../middlewares/enhancedErrorHandling');
      
      // Handle specific OpenAI errors - Use mock responses for quota/auth issues
      if (error.code === 'insufficient_quota' || error.code === 'invalid_api_key' || error.code === 'model_not_found') {
        console.log('OpenAI unavailable, using mock response for:', { userId, message: message.substring(0, 50) });
        const mockResponse = getRandomResponse('careerAdvice');
        return `${mockResponse}\n\n*Note: This is a demo response as OpenAI is temporarily unavailable.*`;
      }

      if (error.code === 'rate_limit_exceeded') {
        console.log('Rate limit hit, using mock response');
        const mockResponse = getRandomResponse('careerAdvice');
        return `${mockResponse}\n\n*Note: This is a demo response due to rate limiting.*`;
      }

      if (error.code === 'context_length_exceeded') {
        const contextError = new Error('Your message is too long for AI processing. Please shorten it and try again.');
        contextError.code = 'context_length_exceeded';
        contextError.name = 'APIError';
        throw contextError;
      }

      // Handle network/timeout errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        const networkError = new Error('AI service temporarily unreachable. Please try again later.');
        networkError.code = 'network_error';
        networkError.name = 'APIError';
        throw networkError;
      }

      if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
        const timeoutError = new Error('AI service request timed out. Please try again.');
        timeoutError.code = 'timeout_error';
        timeoutError.name = 'APIError';
        throw timeoutError;
      }

      // Handle JSON parsing errors in AI responses
      if (error.message.includes('JSON') || error.name === 'SyntaxError') {
        const parseError = new Error('AI service returned invalid response. Please try again.');
        parseError.code = 'parse_error';
        parseError.name = 'APIError';
        throw parseError;
      }

      // Generic fallback with helpful message
      const genericError = new Error('AI service temporarily unavailable. Please try again later.');
      genericError.code = 'ai_service_error';
      genericError.name = 'APIError';
      throw genericError;
    }
  },

  // Quiz AI Service - Enhanced implementation
  quizNext: async (sessionId, userAnswer) => {
    try {
      // Get quiz session with complete context
      const session = await prisma.quizSession.findUnique({
        where: { id: sessionId },
        include: {
          user: {
            select: {
              name: true,
              role: true,
              bio: true,
            },
          },
          quizQuestions: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });

      if (!session) {
        throw new Error('Quiz session not found');
      }

      const currentAnswers = session.answers || {};
      const currentStage = session.currentStage;
      const questionCount = session.quizQuestions.length;

      // Stage progression logic
      const stageOrder = ['SKILLS_ASSESSMENT', 'CAREER_INTERESTS', 'PERSONALITY_TRAITS', 'LEARNING_STYLE', 'CAREER_GOALS'];
      const currentStageIndex = stageOrder.indexOf(currentStage);
      
      // Questions per stage configuration
      const questionsPerStage = {
        'SKILLS_ASSESSMENT': 4,
        'CAREER_INTERESTS': 3,
        'PERSONALITY_TRAITS': 3,
        'LEARNING_STYLE': 2,
        'CAREER_GOALS': 3,
      };

      // Update answers if this is a response to a question
      if (userAnswer && currentStage !== 'COMPLETED') {
        if (!currentAnswers[currentStage]) {
          currentAnswers[currentStage] = [];
        }
        currentAnswers[currentStage].push({
          question: session.quizQuestions[questionCount - 1]?.questionText || 'Previous question',
          answer: userAnswer,
          timestamp: new Date().toISOString(),
        });
      }

      // Check if current stage is complete
      const currentStageAnswers = currentAnswers[currentStage] || [];
      const isCurrentStageComplete = currentStageAnswers.length >= questionsPerStage[currentStage];

      // Determine next stage or completion
      let nextStage = currentStage;
      if (isCurrentStageComplete && currentStageIndex < stageOrder.length - 1) {
        nextStage = stageOrder[currentStageIndex + 1];
      } else if (isCurrentStageComplete && currentStageIndex === stageOrder.length - 1) {
        nextStage = 'COMPLETED';
      }

      // Generate context for AI
      const answerHistory = Object.entries(currentAnswers)
        .map(([stage, answers]) => `${stage}: ${JSON.stringify(answers)}`)
        .join('\n');

      // Enhanced Quiz System Prompt
      const systemPrompt = `You are CareerForge AI's Expert Career Assessment Specialist. You conduct scientific career assessments through a progressive 5-stage evaluation system.

## USER CONTEXT
- Name: ${session.user.name}
- Role: ${session.user.role}
- Current Stage: ${nextStage}
- Question #: ${questionCount + 1}
- Bio: ${session.user.bio || 'No bio provided'}

## ASSESSMENT FRAMEWORK

### STAGE DEFINITIONS & OBJECTIVES
1. **SKILLS_ASSESSMENT** (4 questions): Technical proficiency, programming experience, tool familiarity
2. **CAREER_INTERESTS** (3 questions): Industry preferences, work environment, company culture fit
3. **PERSONALITY_TRAITS** (3 questions): Work style, collaboration preferences, leadership aptitude
4. **LEARNING_STYLE** (2 questions): Knowledge acquisition, skill development approach
5. **CAREER_GOALS** (3 questions): Short/long-term objectives, success metrics, growth aspirations

### CURRENT TASK
${nextStage === 'COMPLETED' ? 'Generate comprehensive career recommendations' : `Create question ${(currentAnswers[nextStage] || []).length + 1} for ${nextStage} stage`}

## PREVIOUS RESPONSES
${answerHistory}

${nextStage === 'COMPLETED' ? `
## FINAL RECOMMENDATIONS FORMAT

Generate comprehensive career guidance based on all assessment data:

\`\`\`json
{
  "type": "recommendations",
  "stage": "COMPLETED",
  "recommendations": {
    "topCareers": [
      {
        "title": "Frontend Developer",
        "description": "Perfect match based on your JavaScript skills and UI/UX interest",
        "match_percentage": 95,
        "skills_required": ["React", "TypeScript", "CSS", "Testing"],
        "salary_range": "$75,000 - $120,000",
        "growth_potential": "High - 22% projected growth",
        "learning_timeline": "6-9 months to job-ready",
        "why_match": "Your strong problem-solving skills align perfectly with frontend development"
      }
    ],
    "skillsToFocus": [
      {
        "skill": "React Development",
        "priority": "High",
        "timeline": "2-3 months",
        "resources": ["React Official Docs", "Frontend Masters", "Build 3 portfolio projects"],
        "certification": "React Developer Certification"
      }
    ],
    "learningPath": {
      "phase1": "0-3 months: Master JavaScript fundamentals, HTML/CSS, Git",
      "phase2": "3-6 months: React ecosystem, state management, API integration",
      "phase3": "6-9 months: Advanced patterns, testing, performance optimization",
      "phase4": "9-12 months: TypeScript, Next.js, deployment, job applications"
    },
    "nextSteps": [
      "Enroll in React fundamentals course this week",
      "Set up GitHub portfolio with 1 project monthly",
      "Join frontend developer communities",
      "Schedule mock interviews in month 6",
      "Apply to junior positions in month 8"
    ],
    "marketInsights": {
      "demand": "Very High - 50,000+ open positions",
      "growth": "22% over next 5 years",
      "locations": "Remote-friendly, major tech hubs",
      "companies": "Startups to FAANG, high demand across all sectors"
    }
  },
  "isComplete": true
}
\`\`\`
` : `
## QUESTION GENERATION GUIDELINES

Create engaging, relevant questions that:
- **Progressive Difficulty**: Build on previous responses
- **Industry Relevance**: Reflect current tech market demands
- **Scenario-Based**: Use realistic work situations
- **Personalized**: Reference user's background when appropriate

### RESPONSE FORMAT
\`\`\`json
{
  "type": "question",
  "stage": "${nextStage}",
  "question": "You're tasked with building a user dashboard that displays real-time data. Which approach would you choose?",
  "options": [
    "Use React with state management and WebSocket connections",
    "Build a simple HTML/CSS/JavaScript solution",
    "Use a low-code platform like Bubble or Webflow",
    "I would need significant guidance to approach this"
  ],
  "isComplete": false
}
\`\`\`
`}

Always return valid JSON. Ensure questions are clear, scenario-based, and options reveal different career inclinations.`;

      const response = await config.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: userAnswer ? 
              `User answered: "${userAnswer}". Please provide the next step.` : 
              'Please start the quiz with the first question.'
          },
        ],
        max_tokens: 1200,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content);

      // Update session answers in database
      await prisma.quizSession.update({
        where: { id: sessionId },
        data: {
          answers: currentAnswers,
          currentStage: nextStage,
        },
      });

      return result;
    } catch (error) {
      console.error('Enhanced Quiz AI Service Error:', error);
      
      const { handleAIServiceError } = require('../middlewares/enhancedErrorHandling');
      
      // Handle JSON parsing errors specifically for quiz responses
      if (error.message.includes('JSON') || error.name === 'SyntaxError') {
        console.warn('Quiz AI returned invalid JSON, using fallback question');
        
        // Return appropriate fallback based on current stage
        const fallbackQuestions = {
          'SKILLS_ASSESSMENT': {
            type: 'question',
            stage: 'SKILLS_ASSESSMENT',
            question: 'What programming languages are you most comfortable working with?',
            options: ['JavaScript/TypeScript', 'Python', 'Java/C#', 'Other/No experience'],
            isComplete: false,
          },
          'CAREER_INTERESTS': {
            type: 'question',
            stage: 'CAREER_INTERESTS', 
            question: 'Which work environment appeals to you most?',
            options: ['Fast-paced startup', 'Established enterprise', 'Remote freelancing', 'Research institution'],
            isComplete: false,
          },
          'PERSONALITY_TRAITS': {
            type: 'question',
            stage: 'PERSONALITY_TRAITS',
            question: 'How do you prefer to approach new challenges?',
            options: ['Research thoroughly first', 'Jump in and learn by doing', 'Collaborate with others', 'Break it into smaller steps'],
            isComplete: false,
          },
          'LEARNING_STYLE': {
            type: 'question',
            stage: 'LEARNING_STYLE',
            question: 'How do you learn new skills most effectively?',
            options: ['Online courses and tutorials', 'Books and documentation', 'Hands-on projects', 'Mentorship and guidance'],
            isComplete: false,
          },
          'CAREER_GOALS': {
            type: 'question',
            stage: 'CAREER_GOALS',
            question: 'What is your primary career goal for the next 2 years?',
            options: ['Land a job at a top tech company', 'Start my own business', 'Become a domain expert', 'Achieve work-life balance'],
            isComplete: false,
          }
        };
        
        const fallback = fallbackQuestions[currentStage] || fallbackQuestions['SKILLS_ASSESSMENT'];
        
        // Update session with fallback answer if we have one
        if (userAnswer && currentStage !== 'COMPLETED') {
          await prisma.quizSession.update({
            where: { id: sessionId },
            data: {
              answers: currentAnswers,
              currentStage: nextStage,
            },
          });
        }
        
        return fallback;
      }
      
      // Handle OpenAI quota/auth errors with mock responses
      if (error.code === 'insufficient_quota' || error.code === 'invalid_api_key' || error.code === 'model_not_found') {
        console.log('OpenAI unavailable, using mock quiz response');
        const { getMockQuizQuestion } = require('./mockAI');
        return getMockQuizQuestion(currentStage);
      }
      
      // Handle other AI service errors
      if (error.code) {
        throw handleAIServiceError(error);
      }
      
      // Final fallback for quiz service
      const fallbackError = new Error('Quiz service temporarily unavailable. Please try again later.');
      fallbackError.code = 'quiz_service_error';
      fallbackError.name = 'APIError';
      throw fallbackError;
    }
  },

  // Domain Classification AI Service - Enhanced implementation
  classifyDomain: async (question) => {
    try {
      const systemPrompt = `You are CareerForge AI's Expert Domain Classification Engine. You analyze student questions using advanced pattern recognition to classify them into precise career domains.

## CLASSIFICATION DOMAINS

### 🌐 WEB_DEVELOPMENT
**Keywords**: React, Vue, Angular, JavaScript, TypeScript, HTML, CSS, Node.js, Express, Django, Flask, frontend, backend, full-stack, web applications, websites, REST API, GraphQL

### 📊 DATA_SCIENCE
**Keywords**: data analysis, statistics, machine learning, pandas, numpy, Python data, R programming, SQL, Tableau, Power BI, data visualization, predictive modeling, analytics, big data

### 📱 MOBILE_DEVELOPMENT  
**Keywords**: iOS, Android, Swift, Kotlin, Java mobile, React Native, Flutter, Xamarin, mobile apps, app development, smartphone, tablet applications

### ☁️ DEVOPS
**Keywords**: AWS, Azure, GCP, Docker, Kubernetes, Jenkins, CI/CD, cloud computing, infrastructure, deployment, automation, server management, monitoring

### 🔒 CYBERSECURITY
**Keywords**: security, ethical hacking, penetration testing, network security, cybersecurity, information security, CISSP, security protocols, vulnerability assessment

### 🤖 AI_ML
**Keywords**: artificial intelligence, machine learning, deep learning, neural networks, TensorFlow, PyTorch, computer vision, natural language processing, AI models

### ⛓️ BLOCKCHAIN
**Keywords**: blockchain, cryptocurrency, Bitcoin, Ethereum, smart contracts, Solidity, DeFi, Web3, crypto, distributed ledger

### 🎮 GAME_DEVELOPMENT
**Keywords**: game development, Unity, Unreal Engine, game design, C# games, game mechanics, mobile games, VR, AR, gaming

### 🎨 UI_UX_DESIGN
**Keywords**: UI design, UX design, user interface, user experience, Figma, Adobe XD, Sketch, prototyping, design systems, wireframes

### 📋 PRODUCT_MANAGEMENT
**Keywords**: product manager, product management, product strategy, roadmap, requirements, stakeholder management, agile, product analytics

### 💰 FINANCE
**Keywords**: finance, financial analysis, banking, fintech, investment, trading, financial modeling, CFA, financial planning, economics

### 📢 MARKETING
**Keywords**: marketing, digital marketing, SEO, social media, content marketing, brand management, growth hacking, marketing analytics

### 💼 CONSULTING
**Keywords**: consulting, business consulting, strategy consulting, management consulting, operations consulting, client engagement

### 🚀 ENTREPRENEURSHIP
**Keywords**: startup, entrepreneurship, business development, venture capital, funding, innovation, business planning, scaling

### ❓ OTHER
**Keywords**: general career, confused about direction, broad career questions, non-specific domain questions

## FEW-SHOT EXAMPLES

**Example 1:** "I want to build responsive websites using React and Node.js"
**Output:** WEB_DEVELOPMENT

**Example 2:** "How do I analyze customer data to predict sales trends using Python?"
**Output:** DATA_SCIENCE

**Example 3:** "Should I learn Swift or Flutter for mobile app development?"
**Output:** MOBILE_DEVELOPMENT

**Example 4:** "I want to deploy apps to AWS using Docker and CI/CD"
**Output:** DEVOPS

**Example 5:** "How do I learn ethical hacking and cybersecurity?"
**Output:** CYBERSECURITY

**Example 6:** "I want to build neural networks using TensorFlow"
**Output:** AI_ML

**Example 7:** "How do I create smart contracts on Ethereum?"
**Output:** BLOCKCHAIN

**Example 8:** "I want to design user-friendly app interfaces"
**Output:** UI_UX_DESIGN

**Example 9:** "What skills do I need to become a product manager?"
**Output:** PRODUCT_MANAGEMENT

**Example 10:** "I'm confused about my career direction after B.Tech"
**Output:** OTHER

## CLASSIFICATION RULES
1. If question mentions specific technologies, map to their primary domain
2. If question spans multiple domains, choose the most emphasized one
3. If question is too general without domain indicators, use OTHER
4. Consider context and underlying career intent

## OUTPUT FORMAT
Respond with ONLY the domain name in uppercase (e.g., "WEB_DEVELOPMENT")

## QUESTION TO CLASSIFY: "${question}"

Analyze keywords, technologies, context, and intent to classify into the most appropriate domain.`;

      const response = await config.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Classify this question: "${question}"` },
        ],
        max_tokens: 20,
        temperature: 0.1, // Low temperature for consistent classification
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const domain = response.choices[0].message.content.trim().toUpperCase();
      
      // Validate domain against our schema
      const validDomains = [
        'WEB_DEVELOPMENT', 'DATA_SCIENCE', 'MOBILE_DEVELOPMENT', 'DEVOPS',
        'CYBERSECURITY', 'AI_ML', 'BLOCKCHAIN', 'GAME_DEVELOPMENT',
        'UI_UX_DESIGN', 'PRODUCT_MANAGEMENT', 'FINANCE', 'MARKETING',
        'CONSULTING', 'ENTREPRENEURSHIP', 'OTHER'
      ];

      if (!validDomains.includes(domain)) {
        console.warn(`Invalid domain classification: ${domain}. Using fallback classification.`);
        return classifyDomainFallback(question);
      }

      return domain;
    } catch (error) {
      console.error('Domain Classification Error:', error);
      
      const { handleAIServiceError } = require('../middlewares/enhancedErrorHandling');
      
      // Handle AI service errors
      if (error.code) {
        const aiError = handleAIServiceError(error);
        console.warn('AI classification failed, using fallback classification');
        return classifyDomainFallback(question);
      }
      
      // For any other errors, use fallback classification
      console.warn('Classification error, using keyword-based fallback');
      return classifyDomainFallback(question);
    }
  },

  // General AI helper function
  generateResponse: async (systemPrompt, userMessage, options = {}) => {
    try {
      const defaultOptions = {
        model: 'gpt-3.5-turbo',
        max_tokens: 500,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      };

      const apiOptions = { ...defaultOptions, ...options };

      const response = await config.openai.chat.completions.create({
        ...apiOptions,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('General AI Service Error:', error);
      throw new Error('AI service temporarily unavailable. Please try again later.');
    }
  },

  // Validate OpenAI API key
  validateApiKey: async () => {
    try {
      const response = await config.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
      });

      return !!response.choices[0].message.content;
    } catch (error) {
      console.error('API Key Validation Error:', error);
      return false;
    }
  },
};

// Fallback domain classification using keyword matching
function classifyDomainFallback(question) {
  const lowerQuestion = question.toLowerCase();
  
  // Define keyword patterns for each domain
  const domainKeywords = {
    WEB_DEVELOPMENT: [
      'react', 'vue', 'angular', 'javascript', 'html', 'css', 'node.js', 'express',
      'frontend', 'backend', 'fullstack', 'web app', 'website', 'django', 'flask',
      'php', 'ruby on rails', 'typescript', 'next.js', 'gatsby', 'webpack'
    ],
    DATA_SCIENCE: [
      'data science', 'machine learning', 'data analysis', 'python', 'pandas',
      'numpy', 'sql', 'tableau', 'power bi', 'statistics', 'data visualization',
      'predictive modeling', 'analytics', 'big data', 'jupyter', 'matplotlib'
    ],
    MOBILE_DEVELOPMENT: [
      'mobile app', 'ios', 'android', 'swift', 'kotlin', 'java', 'react native',
      'flutter', 'xamarin', 'mobile development', 'app store', 'play store'
    ],
    DEVOPS: [
      'devops', 'aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes',
      'ci/cd', 'jenkins', 'deployment', 'infrastructure', 'terraform'
    ],
    CYBERSECURITY: [
      'cybersecurity', 'security', 'ethical hacking', 'penetration testing',
      'network security', 'cissp', 'security protocols', 'compliance'
    ],
    AI_ML: [
      'artificial intelligence', 'machine learning', 'deep learning',
      'neural networks', 'tensorflow', 'pytorch', 'nlp', 'computer vision'
    ],
    BLOCKCHAIN: [
      'blockchain', 'cryptocurrency', 'smart contracts', 'ethereum',
      'solidity', 'defi', 'web3', 'bitcoin', 'crypto'
    ],
    GAME_DEVELOPMENT: [
      'game development', 'unity', 'unreal engine', 'game design',
      'c# for games', 'mobile games', 'pc games', 'vr', 'ar'
    ],
    UI_UX_DESIGN: [
      'ui design', 'ux design', 'user interface', 'user experience',
      'figma', 'adobe xd', 'sketch', 'prototyping', 'design thinking'
    ],
    PRODUCT_MANAGEMENT: [
      'product manager', 'product management', 'product strategy',
      'roadmap', 'stakeholder', 'agile', 'scrum', 'requirements'
    ],
    FINANCE: [
      'finance', 'financial analysis', 'investment', 'banking',
      'fintech', 'trading', 'cfa', 'financial modeling'
    ],
    MARKETING: [
      'marketing', 'digital marketing', 'seo', 'social media',
      'content marketing', 'brand management', 'growth hacking'
    ],
    CONSULTING: [
      'consulting', 'business consulting', 'strategy consulting',
      'management consulting', 'operations'
    ],
    ENTREPRENEURSHIP: [
      'startup', 'entrepreneur', 'business development', 'funding',
      'venture capital', 'innovation', 'business plan'
    ]
  };

  // Score each domain based on keyword matches
  const domainScores = {};
  
  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerQuestion.includes(keyword)) {
        // Give higher score for exact matches and compound keywords
        score += keyword.includes(' ') ? 2 : 1;
      }
    }
    domainScores[domain] = score;
  }

  // Find domain with highest score
  const bestMatch = Object.entries(domainScores)
    .sort(([,a], [,b]) => b - a)[0];

  // Return best match if score > 0, otherwise OTHER
  return bestMatch && bestMatch[1] > 0 ? bestMatch[0] : 'OTHER';
}

// Domain classification with confidence score
async function classifyDomainWithConfidence(question) {
  try {
    const domain = await aiService.classifyDomain(question);
    const fallbackDomain = classifyDomainFallback(question);
    
    // Calculate confidence based on AI and fallback agreement
    const confidence = domain === fallbackDomain ? 'high' : 
                     domain !== 'OTHER' ? 'medium' : 'low';
    
    return {
      domain,
      fallbackDomain,
      confidence,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      domain: classifyDomainFallback(question),
      fallbackDomain: classifyDomainFallback(question),
      confidence: 'low',
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

// Get domain information
function getDomainInfo(domain) {
  const domainDetails = {
    WEB_DEVELOPMENT: {
      name: 'Web Development',
      description: 'Frontend, backend, and full-stack web development',
      icon: '🌐',
      averageSalary: '$70,000 - $150,000',
      growthRate: 'High',
      skills: ['JavaScript', 'React', 'Node.js', 'HTML/CSS', 'Python', 'SQL'],
    },
    DATA_SCIENCE: {
      name: 'Data Science',
      description: 'Data analysis, machine learning, and statistical modeling',
      icon: '📊',
      averageSalary: '$80,000 - $160,000',
      growthRate: 'Very High',
      skills: ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Tableau', 'R'],
    },
    MOBILE_DEVELOPMENT: {
      name: 'Mobile Development',
      description: 'iOS, Android, and cross-platform mobile applications',
      icon: '📱',
      averageSalary: '$75,000 - $140,000',
      growthRate: 'High',
      skills: ['Swift', 'Kotlin', 'React Native', 'Flutter', 'UI/UX', 'APIs'],
    },
    DEVOPS: {
      name: 'DevOps',
      description: 'Cloud infrastructure, deployment, and automation',
      icon: '☁️',
      averageSalary: '$85,000 - $170,000',
      growthRate: 'Very High',
      skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform'],
    },
    CYBERSECURITY: {
      name: 'Cybersecurity',
      description: 'Information security and ethical hacking',
      icon: '🔒',
      averageSalary: '$80,000 - $160,000',
      growthRate: 'Very High',
      skills: ['Network Security', 'Penetration Testing', 'CISSP', 'Python', 'Linux'],
    },
    AI_ML: {
      name: 'AI & Machine Learning',
      description: 'Artificial intelligence and machine learning systems',
      icon: '🤖',
      averageSalary: '$90,000 - $180,000',
      growthRate: 'Extremely High',
      skills: ['Python', 'TensorFlow', 'PyTorch', 'Mathematics', 'Deep Learning'],
    },
    BLOCKCHAIN: {
      name: 'Blockchain',
      description: 'Cryptocurrency and decentralized applications',
      icon: '⛓️',
      averageSalary: '$85,000 - $170,000',
      growthRate: 'High',
      skills: ['Solidity', 'Ethereum', 'Web3', 'Smart Contracts', 'Cryptography'],
    },
    GAME_DEVELOPMENT: {
      name: 'Game Development',
      description: 'Video game design and development',
      icon: '🎮',
      averageSalary: '$60,000 - $130,000',
      growthRate: 'Medium',
      skills: ['Unity', 'Unreal Engine', 'C#', 'C++', 'Game Design', '3D Modeling'],
    },
    UI_UX_DESIGN: {
      name: 'UI/UX Design',
      description: 'User interface and user experience design',
      icon: '🎨',
      averageSalary: '$65,000 - $125,000',
      growthRate: 'High',
      skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Design Systems'],
    },
    PRODUCT_MANAGEMENT: {
      name: 'Product Management',
      description: 'Product strategy and development leadership',
      icon: '📋',
      averageSalary: '$90,000 - $180,000',
      growthRate: 'High',
      skills: ['Strategy', 'Analytics', 'Agile', 'Communication', 'Market Research'],
    },
    FINANCE: {
      name: 'Finance',
      description: 'Financial analysis and investment management',
      icon: '💰',
      averageSalary: '$70,000 - $150,000',
      growthRate: 'Medium',
      skills: ['Financial Modeling', 'Excel', 'CFA', 'Analytics', 'Investment Strategy'],
    },
    MARKETING: {
      name: 'Marketing',
      description: 'Digital marketing and brand management',
      icon: '📢',
      averageSalary: '$55,000 - $120,000',
      growthRate: 'Medium',
      skills: ['SEO', 'Social Media', 'Analytics', 'Content Marketing', 'Ad Campaigns'],
    },
    CONSULTING: {
      name: 'Consulting',
      description: 'Business and strategy consulting',
      icon: '💼',
      averageSalary: '$80,000 - $160,000',
      growthRate: 'Medium',
      skills: ['Problem Solving', 'Communication', 'Analysis', 'Strategy', 'Client Management'],
    },
    ENTREPRENEURSHIP: {
      name: 'Entrepreneurship',
      description: 'Starting and scaling businesses',
      icon: '🚀',
      averageSalary: 'Variable',
      growthRate: 'High',
      skills: ['Business Development', 'Leadership', 'Innovation', 'Networking', 'Finance'],
    },
    OTHER: {
      name: 'Other',
      description: 'General career guidance and other domains',
      icon: '❓',
      averageSalary: 'Variable',
      growthRate: 'Variable',
      skills: ['Communication', 'Problem Solving', 'Adaptability', 'Learning'],
    },
  };

  return domainDetails[domain] || domainDetails.OTHER;
}

module.exports = aiService;
