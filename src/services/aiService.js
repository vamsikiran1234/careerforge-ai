const config = require('../config');
const { prisma } = require('../config/database');

const aiService = {
  // Career Chat AI Service
  chatReply: async (userId, message, messageHistory = []) => {
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

      // Create system prompt for career mentoring
      const systemPrompt = `You are CareerForge AI, an expert career mentor with 15+ years of experience helping B.Tech students and young professionals navigate their career paths. Your role is to provide personalized, actionable career guidance.

USER CONTEXT:
- Name: ${user.name}
- Role: ${user.role}
- Bio: ${user.bio || 'No bio provided'}

GUIDELINES:
1. **Personalized Advice**: Always address the user by name and reference their context
2. **Comprehensive Guidance**: Cover both technical skills and soft skills development
3. **Industry Insights**: Provide current market trends and demands
4. **Actionable Steps**: Give specific, measurable next steps
5. **Supportive Tone**: Be encouraging, professional, and empathetic

EXPERTISE AREAS:
- Technical Career Paths: Web Dev, Data Science, AI/ML, DevOps, Cybersecurity, Mobile Dev
- Non-Technical Paths: Product Management, Business Analysis, Consulting, Sales
- Skills Development: Programming languages, frameworks, certifications
- Job Search: Resume building, interview preparation, networking strategies
- Career Transitions: Switching domains, upskilling, career pivots

RESPONSE FORMAT:
- Start with a personalized greeting if it's the first message
- Provide clear, structured advice with bullet points when appropriate
- Include relevant resources, courses, or tools when helpful
- End with a follow-up question to continue the conversation
- Keep responses conversational but professional (300-500 words max)

AVOID:
- Generic advice without personalization
- Overly technical jargon without explanation
- Discouraging or negative language
- Outdated information or tools
- One-size-fits-all solutions

Remember: You're not just providing information, you're mentoring and guiding their career journey with empathy and expertise.`;

      // Prepare messages for OpenAI
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: message },
      ];

      // Call OpenAI API
      const response = await config.openai.chat.completions.create({
        model: 'gpt-4',
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

      // Handle specific OpenAI errors
      if (error.code === 'insufficient_quota') {
        throw new Error('AI service quota exceeded. Please try again later.');
      }

      if (error.code === 'model_not_found') {
        throw new Error('AI model temporarily unavailable. Please try again later.');
      }

      if (error.code === 'invalid_api_key') {
        throw new Error('AI service configuration error. Please contact support.');
      }

      if (error.code === 'rate_limit_exceeded') {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }

      // Generic fallback response
      throw new Error('AI service temporarily unavailable. Please try again later.');
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

      // System prompt for quiz progression
      const systemPrompt = `You are CareerForge AI's Advanced Quiz Assistant. You conduct comprehensive career assessments through a 5-stage quiz system.

USER CONTEXT:
- Name: ${session.user.name}
- Role: ${session.user.role}
- Bio: ${session.user.bio || 'No bio provided'}
- Current Stage: ${nextStage}
- Question Count: ${questionCount + 1}
- Previous Answers: ${answerHistory}

STAGE DEFINITIONS:
1. SKILLS_ASSESSMENT (4 questions): Technical skills, programming languages, tools, experience level
2. CAREER_INTERESTS (3 questions): Industry preferences, work environment, company size, values
3. PERSONALITY_TRAITS (3 questions): Work style, team dynamics, leadership, communication
4. LEARNING_STYLE (2 questions): Learning preferences, growth mindset, skill acquisition
5. CAREER_GOALS (3 questions): Short-term goals, long-term vision, success metrics

CURRENT TASK: ${nextStage === 'COMPLETED' ? 'Generate final career recommendations' : `Generate question ${(currentAnswers[nextStage] || []).length + 1} for ${nextStage} stage`}

INSTRUCTIONS:
${nextStage === 'COMPLETED' ? `
Based on all quiz responses, provide comprehensive career recommendations including:
- Top 3 career paths with detailed explanations
- Key skills to focus on for each path
- Specific learning roadmap with resources
- Timeline and next steps
- Salary expectations and growth potential

Return JSON format:
{
  "type": "recommendations",
  "stage": "COMPLETED",
  "recommendations": {
    "topCareers": [
      {
        "title": "Career Title",
        "description": "Why this fits the user",
        "match_percentage": 95,
        "skills_required": ["Skill 1", "Skill 2"],
        "salary_range": "$XX,XXX - $XXX,XXX",
        "growth_potential": "High/Medium/Low"
      }
    ],
    "skillsToFocus": [
      {
        "skill": "Skill Name",
        "priority": "High/Medium/Low",
        "resources": ["Resource 1", "Resource 2"]
      }
    ],
    "learningPath": {
      "phase1": "0-3 months: Foundation skills",
      "phase2": "3-6 months: Intermediate skills", 
      "phase3": "6-12 months: Advanced skills"
    },
    "nextSteps": [
      "Immediate action 1",
      "Short-term goal 2",
      "Long-term objective 3"
    ]
  },
  "isComplete": true
}` : `
Generate an engaging, relevant question for the ${nextStage} stage. Consider:
- User's previous answers for personalization
- Progressive difficulty based on responses
- Industry-relevant scenarios
- Clear, actionable options

Return JSON format:
{
  "type": "question",
  "stage": "${nextStage}",
  "question": "Engaging question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "isComplete": false
}`}

Make responses personalized, insightful, and actionable. Consider current tech industry trends and career market demands.`;

      const response = await config.openai.chat.completions.create({
        model: 'gpt-4',
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
      
      // Fallback question generation
      if (error.message.includes('JSON')) {
        return {
          type: 'question',
          stage: 'SKILLS_ASSESSMENT',
          question: 'What programming languages are you most comfortable working with?',
          options: ['JavaScript/TypeScript', 'Python', 'Java/C#', 'Other/No experience'],
          isComplete: false,
        };
      }
      
      throw new Error('Quiz service temporarily unavailable. Please try again later.');
    }
  },

  // Domain Classification AI Service - Enhanced implementation
  classifyDomain: async (question) => {
    try {
      const systemPrompt = `You are CareerForge AI's Expert Domain Classification Assistant. Analyze student questions and classify them into the most relevant domain category.

AVAILABLE DOMAINS WITH DESCRIPTIONS:

🌐 WEB_DEVELOPMENT
- Frontend: React, Vue, Angular, HTML, CSS, JavaScript
- Backend: Node.js, Express, Django, Flask, PHP, Ruby on Rails
- Full-stack development, web applications, websites

📊 DATA_SCIENCE  
- Data analysis, statistics, data visualization
- Machine learning, predictive modeling
- Python (pandas, numpy), R, SQL, Tableau, Power BI

📱 MOBILE_DEVELOPMENT
- iOS development (Swift, Objective-C)
- Android development (Java, Kotlin)
- Cross-platform (React Native, Flutter, Xamarin)

☁️ DEVOPS
- Cloud computing (AWS, Azure, GCP)
- Infrastructure, deployment, CI/CD pipelines
- Docker, Kubernetes, Jenkins, DevOps practices

🔒 CYBERSECURITY
- Information security, ethical hacking
- Network security, penetration testing
- Compliance, security protocols, CISSP

🤖 AI_ML
- Artificial intelligence, machine learning
- Deep learning, neural networks, NLP
- TensorFlow, PyTorch, computer vision

⛓️ BLOCKCHAIN
- Cryptocurrency, smart contracts
- Ethereum, Solidity, DeFi, Web3
- Blockchain development, crypto trading

🎮 GAME_DEVELOPMENT
- Game design, game mechanics
- Unity, Unreal Engine, C# for games
- Mobile games, PC games, VR/AR

🎨 UI_UX_DESIGN
- User interface design, user experience
- Figma, Adobe XD, Sketch, design systems
- Prototyping, user research, design thinking

📋 PRODUCT_MANAGEMENT
- Product strategy, roadmaps, requirements
- Stakeholder management, agile methodologies
- Market research, product analytics

💰 FINANCE
- Financial analysis, investment strategies
- Banking, fintech, financial modeling
- CFA, trading, financial planning

📢 MARKETING
- Digital marketing, content marketing
- SEO, social media, brand management
- Marketing analytics, growth hacking

💼 CONSULTING
- Business consulting, strategy consulting
- Operations, management consulting
- Problem-solving, client engagement

🚀 ENTREPRENEURSHIP
- Startups, business development
- Innovation, venture capital, funding
- Business planning, scaling businesses

❓ OTHER
- Questions that don't clearly fit above categories
- General career advice without specific domain focus

CLASSIFICATION EXAMPLES:

Question: "How do I learn React and build modern web applications?"
Domain: WEB_DEVELOPMENT
Reason: Mentions React (frontend framework) and web applications

Question: "I want to analyze customer data and predict sales trends"
Domain: DATA_SCIENCE  
Reason: Involves data analysis and predictive modeling

Question: "Should I learn Swift or React Native for mobile apps?"
Domain: MOBILE_DEVELOPMENT
Reason: Mentions mobile app development technologies

Question: "How do I deploy applications to AWS and set up CI/CD?"
Domain: DEVOPS
Reason: Focuses on deployment and cloud infrastructure

Question: "I want to learn ethical hacking and cybersecurity"
Domain: CYBERSECURITY
Reason: Explicitly mentions cybersecurity and ethical hacking

Question: "How do I build neural networks for image recognition?"
Domain: AI_ML
Reason: Involves machine learning and computer vision

Question: "I want to create smart contracts on Ethereum"
Domain: BLOCKCHAIN
Reason: Mentions blockchain technology and smart contracts

Question: "How do I design user-friendly mobile app interfaces?"
Domain: UI_UX_DESIGN
Reason: Focuses on user interface and experience design

Question: "What skills do I need to become a product manager?"
Domain: PRODUCT_MANAGEMENT
Reason: Directly asks about product management career

Question: "How do I start a tech startup and get funding?"
Domain: ENTREPRENEURSHIP
Reason: About starting a business and entrepreneurship

Question: "I'm confused about my career direction after B.Tech"
Domain: OTHER
Reason: General career question without specific domain focus

INSTRUCTIONS:
1. Analyze the question for keywords, technologies, and career intent
2. Consider the context and underlying goals
3. Match to the most specific relevant domain
4. If the question spans multiple domains, choose the primary focus
5. Use OTHER only when the question is too general or doesn't fit any specific domain
6. Respond with ONLY the domain name (e.g., "WEB_DEVELOPMENT")

QUESTION TO CLASSIFY: "${question}"

Based on the keywords, technologies mentioned, and career intent, classify this question into the most appropriate domain.`;

      const response = await config.openai.chat.completions.create({
        model: 'gpt-4',
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
      
      // Fallback to keyword-based classification
      return classifyDomainFallback(question);
    }
  },

  // General AI helper function
  generateResponse: async (systemPrompt, userMessage, options = {}) => {
    try {
      const defaultOptions = {
        model: 'gpt-4',
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
        model: 'gpt-4',
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
