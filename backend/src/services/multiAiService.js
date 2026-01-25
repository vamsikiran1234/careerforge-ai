// Multi-provider AI service supporting various free AI models
const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize AI providers
const providers = {
  groq: null,
  gemini: null,
  // Add more providers as needed
};

// Initialize Groq if API key is available
if (process.env.GROQ_API_KEY) {
  providers.groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });
  console.log('✅ Groq AI provider initialized');
}

// Initialize Gemini if API key is available
if (process.env.GEMINI_API_KEY) {
  providers.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('✅ Gemini AI provider initialized');
}

// Available models configuration - Updated with current working models
const models = {
  groq: {
    'llama-3.1-8b-instant': {
      name: 'Llama 3.1 8B Instant',
      provider: 'groq',
      tokenLimit: 8000,
      description: 'Fast and efficient, great for general conversations',
      free: true,
      priority: 1
    },
    'llama-3.2-1b-preview': {
      name: 'Llama 3.2 1B Preview',
      provider: 'groq',
      tokenLimit: 8000,
      description: 'Lightweight model for quick responses',
      free: true,
      priority: 3
    },
    'llama-3.2-3b-preview': {
      name: 'Llama 3.2 3B Preview',
      provider: 'groq',
      tokenLimit: 8000,
      description: 'Balanced performance and speed',
      free: true,
      priority: 2
    },
    'gemma2-9b-it': {
      name: 'Gemma2 9B IT',
      provider: 'groq',
      tokenLimit: 8000,
      description: 'Google\'s Gemma model, good for instruction following',
      free: true,
      priority: 4
    }
  },
  gemini: {
    'gemini-1.5-flash': {
      name: 'Gemini 1.5 Flash',
      provider: 'gemini',
      tokenLimit: 32000,
      description: 'Google\'s fast multimodal model, 15 RPM / 1M RPD',
      free: true,
      priority: 1,
      rateLimit: { requestsPerMinute: 15, requestsPerDay: 1000000 }
    },
    'gemini-1.5-flash-8b': {
      name: 'Gemini 1.5 Flash 8B',
      provider: 'gemini',
      tokenLimit: 32000,
      description: 'Smaller, faster Gemini model, 15 RPM / 1M RPD',
      free: true,
      priority: 2,
      rateLimit: { requestsPerMinute: 15, requestsPerDay: 1000000 }
    },
    'gemini-1.5-pro': {
      name: 'Gemini 1.5 Pro',
      provider: 'gemini',
      tokenLimit: 1000000,
      description: 'Most capable Gemini model, 2 RPM / 50 RPD',
      free: true,
      priority: 3,
      rateLimit: { requestsPerMinute: 2, requestsPerDay: 50 }
    }
  },
  // Future: Add OpenRouter, Together AI, etc.
  openrouter: {
    // Free models available through OpenRouter
    'microsoft/wizardlm-2-8x22b': {
      name: 'WizardLM 2 8x22B',
      provider: 'openrouter',
      tokenLimit: 65536,
      description: 'Microsoft\'s powerful reasoning model',
      free: true
    },
    'meta-llama/llama-3.1-8b-instruct:free': {
      name: 'Llama 3.1 8B (Free)',
      provider: 'openrouter',
      tokenLimit: 131072,
      description: 'Meta\'s instruction-tuned model',
      free: true
    }
  }
};

/**
 * Get available free AI models
 */
const getAvailableModels = () => {
  const availableModels = [];
  
  for (const [provider, providerModels] of Object.entries(models)) {
    for (const [modelId, modelInfo] of Object.entries(providerModels)) {
      if (modelInfo.free && providers[provider]) {
        availableModels.push({
          id: modelId,
          ...modelInfo
        });
      }
    }
  }
  
  return availableModels;
};

/**
 * Get the best model for a given task
 */
const selectBestModel = (taskType = 'general', contentLength = 0) => {
  const availableModels = getAvailableModels();
  
  if (availableModels.length === 0) {
    throw new Error('No AI models available. Please check your API keys.');
  }
  
  // For document analysis or long content, prefer 70B or 90B models
  if (taskType === 'document' || contentLength > 4000) {
    const capableModels = availableModels.filter(m => 
      m.name.includes('70B') || m.name.includes('90B') || m.tokenLimit > 6000
    );
    if (capableModels.length > 0) {
      return capableModels[0]; // Return the first capable model
    }
  }
  
  // For general chat, prefer fast models
  if (taskType === 'general') {
    const fastModels = availableModels.filter(m => m.name.includes('Instant') || m.name.includes('8B'));
    if (fastModels.length > 0) {
      return fastModels[0];
    }
  }
  
  // Default to first available model
  return availableModels[0];
};

/**
 * Make AI request using Groq
 */
const makeGroqRequest = async (modelId, messages, systemPrompt) => {
  if (!providers.groq) {
    throw new Error('Groq API key not configured');
  }
  
  const completion = await providers.groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    model: modelId,
    max_tokens: 1000,
    temperature: 0.7,
    stream: false,
  });

  return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
};

/**
 * Make AI request using Google Gemini
 */
const makeGeminiRequest = async (modelId, messages, systemPrompt) => {
  if (!providers.gemini) {
    throw new Error('Gemini API key not configured');
  }
  
  try {
    const model = providers.gemini.getGenerativeModel({ model: modelId });
    
    // Combine system prompt and messages into a single prompt
    const fullPrompt = `${systemPrompt}\n\n${messages.map(msg => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      return `${role}: ${msg.content}`;
    }).join('\n\n')}`;
    
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    
    return response.text() || 'Sorry, I could not generate a response.';
  } catch (error) {
    // Handle specific Gemini errors
    if (error.message && error.message.includes('429')) {
      throw new Error('rate_limit_exceeded');
    }
    throw error;
  }
};

/**
 * Make AI request using OpenRouter (future implementation)
 */
// const makeOpenRouterRequest = async (modelId, messages, systemPrompt) => {
//   // TODO: Implement OpenRouter API calls
//   throw new Error('OpenRouter provider not yet implemented');
// };

/**
 * Generic AI chat function with automatic model selection
 */
const chatWithAI = async (userMessage, messageHistory = [], options = {}) => {
  const {
    systemPrompt = 'You are a helpful AI assistant.'
  } = options;
  
  try {
    // Get all available models sorted by priority
    const availableModels = getAvailableModels().sort((a, b) => (a.priority || 99) - (b.priority || 99));
    
    if (availableModels.length === 0) {
      throw new Error('No AI models available. Please check your API keys.');
    }
    
    // Prepare messages for API
    const messages = [
      ...messageHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];
    
    // Try models in order of priority with automatic fallback
    let lastError = null;
    
    for (let i = 0; i < availableModels.length; i++) {
      const selectedModel = availableModels[i];
      
      try {
        console.log(`🤖 Attempting model: ${selectedModel.name} (${selectedModel.id})`);
      
      // Make request based on provider
      let response;
      switch (selectedModel.provider) {
        case 'groq':
          response = await makeGroqRequest(selectedModel.id, messages, systemPrompt);
          break;
        case 'gemini':
          response = await makeGeminiRequest(selectedModel.id, messages, systemPrompt);
          break;
        case 'openrouter':
          // OpenRouter not yet implemented, skip to next model
          throw new Error('OpenRouter provider not yet implemented');
        default:
          throw new Error(`Unsupported provider: ${selectedModel.provider}`);
      }
      
      // If we get here, the request was successful
      console.log(`✅ Success with model: ${selectedModel.name}`);
      return {
        response,
        modelUsed: selectedModel.name,
        provider: selectedModel.provider
      };
      
    } catch (error) {
      console.error(`❌ Model ${selectedModel.name} failed:`, error.message);
      lastError = error;
      
      // Check if it's a model decommissioned error and skip to next model
      if (error.message && error.message.includes('decommissioned')) {
        console.log(`🔄 Model ${selectedModel.name} decommissioned, trying next...`);
        continue;
      }
      
      // Check if it's a rate limit error
      if (error.status === 429 || error.message.includes('rate_limit')) {
        console.log(`⏰ Rate limit hit for ${selectedModel.name}, trying next...`);
        continue;
      }
      
      // For other errors, also try the next model
      console.log(`🔄 Error with ${selectedModel.name}, trying next model...`);
      continue;
    }
  }
  
  // If all models failed
  console.error('❌ All models failed. Last error:', lastError?.message);
  throw new Error(`AI service unavailable: ${lastError?.message || 'All models failed'}`);
  
  } catch (error) {
    console.error('❌ Unexpected error in chatWithAI:', error);
    throw new Error(`AI service error: ${error.message}`);
  }
};

/**
 * Generate next quiz question or complete quiz
 * @param {string} sessionId - Quiz session ID
 * @param {string|null} previousAnswer - User's previous answer (null for first question)
 * @returns {Promise<{question: string, options: string[], stage: string, isComplete: boolean, recommendations?: object}>}
 */
const quizNext = async (sessionId, previousAnswer) => {
  const { prisma } = require('../config/database');
  
  try {
    // Get quiz session with all questions and answers
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        quizQuestions: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!session) {
      throw new Error('Quiz session not found');
    }

    // Parse answers
    const answers = typeof session.answers === 'string' 
      ? JSON.parse(session.answers || '{}') 
      : (session.answers || {});

    const currentStage = session.currentStage;
    const stageOrder = ['SKILLS_ASSESSMENT', 'CAREER_INTERESTS', 'PERSONALITY_TRAITS', 'LEARNING_STYLE', 'CAREER_GOALS'];
    const currentStageIndex = stageOrder.indexOf(currentStage);
    const questionsInStage = answers[currentStage]?.length || 0;

    // Determine if we should move to next stage (5 questions per stage)
    const shouldMoveToNextStage = questionsInStage >= 5;
    const isLastStage = currentStageIndex === stageOrder.length - 1;

    // If completed all stages, generate recommendations
    if (shouldMoveToNextStage && isLastStage) {
      const prompt = `Based on the following career assessment quiz responses, provide personalized career recommendations:

${JSON.stringify(answers, null, 2)}

Analyze the responses and provide detailed career recommendations in JSON format with this EXACT structure:
{
  "topCareers": [
    {
      "title": "Career Title",
      "match_percentage": 90,
      "description": "Detailed description of the career",
      "why_match": "Why this career matches their skills and interests",
      "salary_range": "$80,000 - $120,000",
      "growth_potential": "High",
      "learning_timeline": "6-12 months",
      "skills_required": ["Skill 1", "Skill 2", "Skill 3"]
    }
  ],
  "skillsToFocus": [
    {
      "skill": "Skill Name",
      "priority": "High",
      "description": "Why this skill is important",
      "resources": ["Resource 1", "Resource 2"]
    }
  ],
  "learningPath": {
    "phases": [
      {
        "phase": "Foundation",
        "duration": "2-3 months",
        "topics": ["Topic 1", "Topic 2"],
        "resources": ["Resource 1", "Resource 2"]
      }
    ]
  },
  "nextSteps": [
    {
      "step": "Step description",
      "timeline": "1-2 weeks",
      "priority": "High"
    }
  ],
  "marketInsights": {
    "demand": "High",
    "competition": "Moderate",
    "trends": ["Trend 1", "Trend 2"]
  }
}

Provide 3-5 top career matches, 4-6 skills to focus on, and 5-7 next steps.`;

      const response = await chatWithAI(prompt, [], {
        userId: session.userId,
        userName: 'Quiz User',
        userRole: 'Professional',
        taskType: 'quiz_completion'
      });

      // Try to parse JSON from response
      let recommendations;
      try {
        const jsonMatch = response.response.match(/\{[\s\S]*\}/);
        recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch {
        recommendations = null;
      }

      // Provide detailed fallback if parsing fails
      if (!recommendations || !recommendations.topCareers) {
        recommendations = {
          topCareers: [
            {
              title: "Software Developer",
              match_percentage: 85,
              description: "Design, develop, and maintain software applications. Work with various programming languages and frameworks to create innovative solutions.",
              why_match: "Your technical skills and problem-solving abilities align well with software development. Your interest in continuous learning is essential in this rapidly evolving field.",
              salary_range: "$70,000 - $130,000",
              growth_potential: "Very High",
              learning_timeline: "6-12 months",
              skills_required: ["Programming", "Problem Solving", "System Design", "Version Control"]
            },
            {
              title: "Data Analyst",
              match_percentage: 80,
              description: "Analyze complex data sets to help organizations make informed business decisions. Use statistical tools and visualization techniques.",
              why_match: "Your analytical thinking and attention to detail make you well-suited for data analysis. This career offers strong growth opportunities.",
              salary_range: "$60,000 - $100,000",
              growth_potential: "High",
              learning_timeline: "4-8 months",
              skills_required: ["Data Analysis", "SQL", "Excel", "Statistical Thinking"]
            },
            {
              title: "UX/UI Designer",
              match_percentage: 75,
              description: "Create intuitive and engaging user experiences for digital products. Combine creativity with user research and design principles.",
              why_match: "Your creative mindset and user-centric thinking align with UX/UI design. This role offers a blend of art and technology.",
              salary_range: "$65,000 - $110,000",
              growth_potential: "High",
              learning_timeline: "4-10 months",
              skills_required: ["Design Tools", "User Research", "Prototyping", "Visual Design"]
            }
          ],
          skillsToFocus: [
            {
              skill: "Technical Proficiency",
              priority: "High",
              description: "Develop strong technical skills in your chosen field through hands-on practice and projects.",
              resources: ["Online Courses (Coursera, Udemy)", "Practice Projects", "Coding Bootcamps"]
            },
            {
              skill: "Communication",
              priority: "High",
              description: "Effective communication is crucial for collaborating with teams and explaining technical concepts.",
              resources: ["Public Speaking Courses", "Technical Writing Guides", "Team Collaboration Tools"]
            },
            {
              skill: "Problem Solving",
              priority: "Medium",
              description: "Strengthen your ability to break down complex problems and find creative solutions.",
              resources: ["LeetCode", "HackerRank", "Project Euler", "Case Study Practice"]
            },
            {
              skill: "Continuous Learning",
              priority: "Medium",
              description: "Stay updated with industry trends and emerging technologies in your field.",
              resources: ["Tech Blogs", "Industry Newsletters", "Professional Networks", "Conferences"]
            }
          ],
          learningPath: {
            phases: [
              {
                phase: "Foundation Building",
                duration: "2-3 months",
                topics: ["Core concepts", "Fundamental tools", "Basic projects"],
                resources: ["FreeCodeCamp", "Codecademy", "YouTube tutorials"]
              },
              {
                phase: "Skill Development",
                duration: "3-4 months",
                topics: ["Advanced concepts", "Real-world projects", "Portfolio building"],
                resources: ["Udemy", "Coursera", "GitHub", "Personal projects"]
              },
              {
                phase: "Professional Growth",
                duration: "2-3 months",
                topics: ["Industry practices", "Networking", "Job preparation"],
                resources: ["LinkedIn Learning", "Professional communities", "Mock interviews"]
              }
            ]
          },
          nextSteps: [
            {
              step: "Set clear, measurable learning goals for the next 3 months",
              timeline: "This week",
              priority: "High"
            },
            {
              step: "Enroll in a foundational course for your chosen career path",
              timeline: "1-2 weeks",
              priority: "High"
            },
            {
              step: "Start building a portfolio with small projects",
              timeline: "2-4 weeks",
              priority: "High"
            },
            {
              step: "Join professional communities and networking groups",
              timeline: "2-3 weeks",
              priority: "Medium"
            },
            {
              step: "Connect with mentors or professionals in your target field",
              timeline: "3-4 weeks",
              priority: "Medium"
            },
            {
              step: "Practice daily with coding challenges or design exercises",
              timeline: "Ongoing",
              priority: "Medium"
            },
            {
              step: "Update your resume and LinkedIn profile to reflect your learning journey",
              timeline: "1 month",
              priority: "Medium"
            }
          ],
          marketInsights: {
            demand: "High - Growing demand across industries",
            competition: "Moderate - Competitive but many opportunities available",
            trends: [
              "Remote work opportunities expanding",
              "AI and automation creating new roles",
              "Continuous upskilling becoming essential",
              "Cross-functional skills increasingly valued"
            ]
          }
        };
      }

      return {
        isComplete: true,
        recommendations
      };
    }

    // Move to next stage if needed
    let nextStage = currentStage;
    if (shouldMoveToNextStage && !isLastStage) {
      nextStage = stageOrder[currentStageIndex + 1];
    }

    // Generate next question using AI
    const stageDescriptions = {
      'SKILLS_ASSESSMENT': 'technical and professional skills',
      'CAREER_INTERESTS': 'career interests and industry preferences',
      'PERSONALITY_TRAITS': 'personality traits and work style',
      'LEARNING_STYLE': 'learning preferences and development approach',
      'CAREER_GOALS': 'career goals and aspirations'
    };

    const prompt = `Generate a career assessment quiz question for ${stageDescriptions[nextStage]}.
Previous answers in this stage: ${JSON.stringify(answers[nextStage] || [])}
Question number: ${(answers[nextStage]?.length || 0) + 1}

Create ONE multiple choice question with 4 options.
Format as JSON:
{
  "question": "Question text here?",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
}`;

    const response = await chatWithAI(prompt, [], {
      userId: session.userId,
      userName: 'Quiz User',
      userRole: 'Professional',
      taskType: 'quiz_generation'
    });

    // Parse question from AI response
    let questionData;
    try {
      const jsonMatch = response.response.match(/\{[\s\S]*\}/);
      questionData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      questionData = null;
    }

    // Fallback questions if parsing fails
    if (!questionData || !questionData.question) {
      const fallbacks = {
        'SKILLS_ASSESSMENT': {
          question: "Which technical skill are you most proficient in?",
          options: ["Programming/Development", "Data Analysis", "Design/Creative", "Project Management"]
        },
        'CAREER_INTERESTS': {
          question: "Which industry excites you the most?",
          options: ["Technology", "Healthcare", "Finance", "Education"]
        },
        'PERSONALITY_TRAITS': {
          question: "How do you prefer to work?",
          options: ["Independently", "In small teams", "In large groups", "Flexible mix"]
        },
        'LEARNING_STYLE': {
          question: "How do you learn best?",
          options: ["Hands-on practice", "Reading documentation", "Video tutorials", "Mentorship"]
        },
        'CAREER_GOALS': {
          question: "What is your primary career goal?",
          options: ["Leadership role", "Technical expertise", "Entrepreneurship", "Work-life balance"]
        }
      };
      questionData = fallbacks[nextStage] || fallbacks['SKILLS_ASSESSMENT'];
    }

    return {
      question: questionData.question,
      options: questionData.options,
      stage: nextStage,
      isComplete: false
    };

  } catch (error) {
    console.error('Error in quizNext:', error);
    // Return fallback question on error
    return {
      question: "What aspect of your career is most important to you?",
      options: ["Growth opportunities", "Work environment", "Compensation", "Impact and purpose"],
      stage: session?.currentStage || 'SKILLS_ASSESSMENT',
      isComplete: false
    };
  }
};

module.exports = {
  chatWithAI,
  getAvailableModels,
  selectBestModel,
  quizNext,
  models
};