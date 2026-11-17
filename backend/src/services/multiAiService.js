// Multi-provider AI service supporting various free AI models
const { OpenAI } = require('openai');
const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const {
  TRACKS,
  inferUserTrack,
  getSessionSeed,
  selectAdaptiveQuestion,
} = require('./adaptiveQuizEngine');
const { generateCareerAdvisorResponse } = require('./careerKnowledgeService');

// Initialize AI providers
const providers = {
  omniroute: null,
  groq: null,
  gemini: null,
  // Add more providers as needed
};

// Initialize OmniRoute if enabled
if (process.env.USE_OMNIROUTE === 'true' || process.env.OMNIROUTE_API_KEY) {
  try {
    providers.omniroute = new OpenAI({
      baseURL: process.env.OMNIROUTE_URL || 'http://localhost:20128/v1',
      apiKey: process.env.OMNIROUTE_API_KEY || 'omniroute-key',
      timeout: 4000, // 4-second timeout to prevent hanging when OmniRoute gateway is offline
      maxRetries: 0,
    });
    console.log('✅ OmniRoute AI provider initialized');
  } catch (err) {
    console.warn('⚠️ OmniRoute initialization warning:', err.message);
  }
}

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
  omniroute: {
    'omniroute-auto': {
      name: 'OmniRoute Gateway (Auto)',
      provider: 'omniroute',
      tokenLimit: 128000,
      description: 'OmniRoute intelligent multi-model routing & fallback',
      free: true,
      priority: 0
    }
  },
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
 * Make AI request using OmniRoute
 */
const makeOmniRouteRequest = async (modelId, messages, systemPrompt) => {
  if (!providers.omniroute) {
    throw new Error('OmniRoute provider not configured');
  }
  
  const model = process.env.OMNIROUTE_MODEL || 'auto';
  const chatMessages = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    ...messages
  ];

  const completion = await providers.omniroute.chat.completions.create({
    messages: chatMessages,
    model,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
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
    
    // If no models available or configured, fall back to CareerForge Advisor Engine immediately
    if (availableModels.length === 0) {
      console.warn('⚠️ No external AI models available. Using CareerForge Advisor Engine fallback.');
      return {
        response: generateCareerAdvisorResponse(userMessage, messageHistory, options),
        modelUsed: 'CareerForge Advisor Engine',
        provider: 'careerforge-knowledge-base'
      };
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
          case 'omniroute':
            response = await makeOmniRouteRequest(selectedModel.id, messages, systemPrompt);
            break;
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
    
    // If all models failed (e.g. OmniRoute local gateway is down or network unavailable)
    console.warn('⚠️ All external AI models failed. Using CareerForge Advisor Engine fallback. Reason:', lastError?.message);
    return {
      response: generateCareerAdvisorResponse(userMessage, messageHistory, options),
      modelUsed: 'CareerForge Advisor Engine (Offline Fallback)',
      provider: 'careerforge-knowledge-base'
    };
    
  } catch (error) {
    console.error('❌ Unexpected error in chatWithAI:', error);
    return {
      response: generateCareerAdvisorResponse(userMessage, messageHistory, options),
      modelUsed: 'CareerForge Advisor Engine (Emergency Fallback)',
      provider: 'careerforge-knowledge-base'
    };
  }
};

// Curated high-performance career assessment question bank (Simple to Medium level, 5 stages x 5 questions = 25 questions as specified in PROJECT.md)
const QUIZ_QUESTION_BANK = {
  SKILLS_ASSESSMENT: [
    {
      question: "Which programming language or technology are you most comfortable using?",
      options: [
        "JavaScript / TypeScript (React, Node.js, Web development)",
        "Python (Data analysis, scripting, AI basics)",
        "Java / C# (Object-oriented programming, enterprise apps)",
        "HTML / CSS / Basic scripting (Web layouts, styling, front-end basics)"
      ]
    },
    {
      question: "When you encounter an error or bug in your code, what is your first step to solve it?",
      options: [
        "Read the error message carefully and check the specific file and line number",
        "Use console.log or print statements to check variable values step-by-step",
        "Search the exact error message on Google or developer forums",
        "Ask a mentor, colleague, or AI tool to explain the issue and suggest fixes"
      ]
    },
    {
      question: "How would you describe your current experience with databases?",
      options: [
        "Basic: I can write simple SELECT, INSERT, UPDATE, and DELETE queries in SQL",
        "Intermediate: I can design relational tables, set keys, and write JOINs",
        "Document/NoSQL: I prefer using MongoDB or similar databases to store JSON documents",
        "Beginner: I understand what databases do, but I am still learning how to connect them"
      ]
    },
    {
      question: "How do you usually test your code before considering a feature complete?",
      options: [
        "Manual testing: clicking through the app and testing different user actions",
        "Writing automated unit tests using frameworks like Jest, PyTest, or JUnit",
        "Testing boundary cases (empty inputs, long text, wrong data types)",
        "Asking a friend or teammate to try using the feature to spot problems"
      ]
    },
    {
      question: "What version control (Git) workflow are you comfortable with?",
      options: [
        "Daily commands: git add, commit, push, pull, and clone",
        "Branching: creating feature branches and opening pull requests for review",
        "Collaboration: handling merge conflicts and reviewing commit history",
        "Beginner: I understand the basics of Git repositories and am learning the CLI"
      ]
    }
  ],
  CAREER_INTERESTS: [
    {
      question: "What kind of software projects do you enjoy building the most?",
      options: [
        "User interfaces, websites, and interactive web apps that people can see and use",
        "Backend services, REST APIs, and server logic that handle application data",
        "Mobile apps for iOS or Android smartphones and tablets",
        "Data dashboards, automation scripts, and machine learning models"
      ]
    },
    {
      question: "Which industry or domain sounds most exciting for your future career?",
      options: [
        "Consumer Tech & SaaS (productivity tools, web apps, social platforms)",
        "FinTech & E-commerce (payments, online stores, digital finance)",
        "HealthTech & Education (healthcare apps, learning platforms, social good)",
        "Gaming & Digital Media (interactive experiences, streaming, creative tools)"
      ]
    },
    {
      question: "What type of work environment do you think fits you best?",
      options: [
        "A fast-paced startup where I can wear multiple hats and learn rapidly",
        "An established company with structured mentorship and clear career paths",
        "A remote-first team with flexibility to work from anywhere",
        "A collaborative in-person team with daily brainstorming and shared office energy"
      ]
    },
    {
      question: "What aspect of technology excites you the most right now?",
      options: [
        "Building beautiful, intuitive, and accessible user experiences",
        "Integrating AI assistants, chatbots, and automation into everyday workflows",
        "Deploying apps to the cloud (Vercel, AWS, Docker) so anyone can access them",
        "Solving algorithmic problems and making code run faster and cleaner"
      ]
    },
    {
      question: "If you had a free weekend to build any project, what would you choose?",
      options: [
        "A complete full-stack web application to showcase in my portfolio",
        "A helpful bot or tool powered by an AI API (like Gemini or OpenAI)",
        "A useful mobile or web utility that solves a problem in my everyday life",
        "An open-source tool, template, or library to share with other developers"
      ]
    }
  ],
  PERSONALITY_TRAITS: [
    {
      question: "How do you prefer to collaborate on team projects?",
      options: [
        "Pair programming and actively bouncing ideas back and forth in real time",
        "Working independently on my assigned part, then checking in with regular updates",
        "Taking end-to-end ownership of an entire feature and delivering it",
        "Helping teammates unblock problems, reviewing code, and coordinating tasks"
      ]
    },
    {
      question: "When you receive constructive feedback on your code, what is your initial reaction?",
      options: [
        "Appreciative: feedback is the fastest way to learn industry-standard practices",
        "Curious: I like discussing trade-offs and understanding alternative solutions",
        "Action-oriented: I immediately apply the suggested improvements to my code",
        "Reflective: I take time to understand why the changes make the code better"
      ]
    },
    {
      question: "When a deadline is approaching and some tasks are unfinished, what do you do?",
      options: [
        "Prioritize the core essential features and postpone nice-to-have additions",
        "Break down the remaining tasks into quick 20-30 minute steps to stay focused",
        "Communicate early with my team or mentor to agree on what can be delivered",
        "Stay calm and work through the remaining checklist in order of importance"
      ]
    },
    {
      question: "What gives you the greatest sense of accomplishment in a project?",
      options: [
        "Seeing real users successfully interact with something I built",
        "Fixing a difficult bug or figuring out a concept that had me stuck",
        "Writing clean, readable code that any teammate can easily understand",
        "Helping a teammate or classmate overcome a roadblock and succeed"
      ]
    },
    {
      question: "When working in a group, which role feels most natural to you?",
      options: [
        "The Builder: diving straight into the code and getting working features done",
        "The Planner: organizing tasks, keeping track of deadlines, and structuring goals",
        "The Researcher: finding the right libraries, documentation, and best approaches",
        "The Polisher: testing edge cases, improving UI styling, and refining details"
      ]
    }
  ],
  LEARNING_STYLE: [
    {
      question: "When learning a brand-new framework or library, how do you like to start?",
      options: [
        "Building a small practice project right away and learning through hands-on trial",
        "Watching a step-by-step video tutorial or following a structured online course",
        "Reading the official 'Getting Started' docs and reviewing sample code snippets",
        "Looking at existing example projects on GitHub and exploring how they work"
      ]
    },
    {
      question: "How much time per week can you realistically dedicate to career upskilling?",
      options: [
        "2 to 4 hours per week (steady, manageable progress on weekends)",
        "5 to 9 hours per week (about 1 hour every day after studies or work)",
        "10 to 15 hours per week (consistent dedicated practice and project building)",
        "15+ hours per week (intensive, accelerated learning or bootcamp pace)"
      ]
    },
    {
      question: "What type of study resources helps you learn best?",
      options: [
        "Interactive coding platforms with instant feedback (e.g., freeCodeCamp, LeetCode)",
        "Video tutorials with clear instructor explanations (e.g., YouTube, Udemy)",
        "Written guides, official documentation, and technical walkthrough articles",
        "Building personal projects with occasional guidance from a mentor or community"
      ]
    },
    {
      question: "How do you ensure you retain concepts after learning them?",
      options: [
        "Immediately building an original mini-project without following a guide",
        "Writing summary notes, cheatsheets, or explaining the concept to someone else",
        "Revisiting past code and refactoring it with the new techniques I learned",
        "Practicing code challenges and quizzes related to the topic regularly"
      ]
    },
    {
      question: "What kind of mentorship support would be most helpful for you right now?",
      options: [
        "Resume and portfolio reviews from an experienced industry professional",
        "Mock interviews with actionable tips on both technical and behavioral questions",
        "Clear guidance on what skills and tech stack to prioritize for job hunting",
        "Code reviews and advice on how to write production-ready, clean code"
      ]
    }
  ],
  CAREER_GOALS: [
    {
      question: "What is your primary career target for the next 6 to 12 months?",
      options: [
        "Landing my first software engineering internship or entry-level developer role",
        "Transitioning from another field or major into a professional tech career",
        "Advancing from a junior position into a mid-level role with more responsibility",
        "Building an impressive portfolio of projects to start applying for jobs"
      ]
    },
    {
      question: "Which job role aligns closest with what you want to achieve?",
      options: [
        "Frontend Developer (specializing in React/Vue, web UI, and responsive design)",
        "Backend Developer (specializing in Node.js, Python/Java, databases, and APIs)",
        "Full-Stack Developer (comfortable with both client-side and server-side engineering)",
        "Data Analyst / Junior AI Specialist (specializing in Python, SQL, and data insights)"
      ]
    },
    {
      question: "What factor matters most to you in your next position?",
      options: [
        "A strong learning environment with supportive seniors to learn from",
        "A fair and competitive compensation package to build financial independence",
        "Work-life balance with flexible hours and remote/hybrid work options",
        "Working on a product that has a positive, meaningful impact on users"
      ]
    },
    {
      question: "What do you feel is currently the biggest hurdle in reaching your career goal?",
      options: [
        "Preparing for coding challenges and technical interview rounds",
        "Gaining practical experience and building strong, credible projects",
        "Confidence: feeling ready and knowing when I meet job requirements",
        "Networking and getting recruiter responses on job applications"
      ]
    },
    {
      question: "Where do you envision yourself in 3 years?",
      options: [
        "A confident developer contributing to key features and mentoring newcomers",
        "A technical lead guiding project architecture and helping the team succeed",
        "Specialized in high-demand domains like Cloud, AI integration, or Security",
        "Working remotely for a global tech company or building my own startup venture"
      ]
    }
  ]
};

// Comprehensive domain career templates with rich, verified industry profiles
const CAREER_TEMPLATES = {
  BACKEND: {
    title: "Backend Engineer / API Developer",
    description: "Architect and develop high-performance server logic, RESTful/GraphQL APIs, microservices, and database systems that form the backbone of scalable software applications.",
    salary_range: "$85,000 - $140,000",
    growth_potential: "Very High",
    learning_timeline: "4-8 months",
    skills_required: ["Node.js / Python / Java", "RESTful & GraphQL APIs", "PostgreSQL / SQL & Indexing", "System Architecture & Caching", "Docker & Container Basics", "Git & CI/CD Workflows"],
    skillsToFocus: [
      {
        skill: "RESTful & GraphQL API Architecture",
        priority: "High",
        description: "Design clean, robust API contracts with error handling, rate limiting, and structured validation.",
        timeline: "1-2 months",
        certification: "AWS Certified Developer - Associate",
        resources: ["Designing Data-Intensive Applications", "Node.js & Express Best Practices", "Postman API Design Guidelines"]
      },
      {
        skill: "Database Modeling & Query Optimization (PostgreSQL / NoSQL)",
        priority: "High",
        description: "Master relational schema design, primary/foreign keys, indexing strategies, and ORM query optimization.",
        timeline: "1-2 months",
        certification: "PostgreSQL Associate / MongoDB Certified Developer",
        resources: ["Use The Index, Luke (SQL Indexing Guide)", "Prisma ORM Documentation & Best Practices", "Database Performance Tuning"]
      },
      {
        skill: "Docker & Containerized Microservices",
        priority: "Medium",
        description: "Containerize server applications, manage multi-container environments with Docker Compose, and configure CI/CD.",
        timeline: "3-4 weeks",
        certification: "Docker Certified Associate",
        resources: ["Docker Official Mastery Labs", "Containerizing Web APIs", "Twelve-Factor App Methodology"]
      },
      {
        skill: "Caching Strategies & Message Queues (Redis / RabbitMQ)",
        priority: "Medium",
        description: "Implement high-speed distributed in-memory caching and asynchronous message queues to handle bursty traffic.",
        timeline: "3-4 weeks",
        certification: "Redis Certified Developer",
        resources: ["Redis University Online", "System Design Primer by Donne Martin", "Event-Driven Microservices Patterns"]
      }
    ],
    learningPath: {
      phases: [
        {
          phase: "Foundation: Server Runtimes & Relational Databases",
          duration: "2-3 months",
          topics: ["Node.js/Python server runtimes", "HTTP/HTTPS protocols and REST standards", "Relational database schema modeling and SQL queries", "Git version control and automated unit testing"],
          resources: ["Node.js Official Documentation", "The Odin Project (Node.js Track)", "PostgreSQL Tutorial"]
        },
        {
          phase: "Skill Development: Advanced APIs & Production Data",
          duration: "3-4 months",
          topics: ["Database connection pooling, migrations, and Prisma ORM", "JWT authentication, refresh tokens, and RBAC", "API security headers (Helmet, rate limiting)", "Docker containerization and integration test suites"],
          resources: ["FullStackOpen (University of Helsinki)", "Docker & Docker Compose Guides", "OWASP API Security Top 10"]
        },
        {
          phase: "Professional Growth: Scalable Architecture & System Design",
          duration: "2-3 months",
          topics: ["High-throughput caching with Redis", "Message queues and asynchronous worker queues", "Microservices vs Modular Monolith trade-offs", "Mock system design interviews and resume polish"],
          resources: ["System Design Primer on GitHub", "ByteByteGo System Design Course", "CareerForge Mentor Mock Technical Interviews"]
        }
      ]
    },
    marketInsights: {
      demand: "Very High - Sustained hiring across FinTech, enterprise SaaS, cloud services, and AI backends.",
      competition: "Moderate - High demand for developers who demonstrate solid database and system design fundamentals.",
      trends: [
        "Widespread adoption of type-safe APIs and schema-driven contracts",
        "Shift towards serverless and edge compute runtimes",
        "Increasing expectation of Docker and containerization knowledge",
        "Heavy focus on automated integration testing and observability"
      ]
    }
  },
  FRONTEND: {
    title: "Frontend Engineer / Web Applications Developer",
    description: "Craft dynamic, responsive, and accessible client-side user experiences using modern component architectures, state management patterns, and web optimization practices.",
    salary_range: "$80,000 - $130,000",
    growth_potential: "High",
    learning_timeline: "4-6 months",
    skills_required: ["React / Next.js", "TypeScript & Modern JS (ES6+)", "Tailwind CSS & Responsive Layouts", "Client State Management", "Web Performance & Lighthouse", "API Integration & Async Handling"],
    skillsToFocus: [
      {
        skill: "Advanced React Patterns & State Management",
        priority: "High",
        description: "Master component lifecycles, hooks, memoization, and lightweight global state management with Zustand or TanStack Query.",
        timeline: "1-2 months",
        certification: "Meta Front-End Developer Professional",
        resources: ["Epic React by Kent C. Dodds", "React 19 Official Documentation", "Zustand & TanStack Query Guides"]
      },
      {
        skill: "TypeScript for Modern Web Applications",
        priority: "High",
        description: "Author type-safe component props, generic data fetching hooks, and strict interface models.",
        timeline: "3-4 weeks",
        certification: "Microsoft TypeScript Specialist",
        resources: ["TypeScript Handbook", "Total TypeScript by Matt Pocock", "Type-Driven Development Best Practices"]
      },
      {
        skill: "Web Performance & Core Web Vitals",
        priority: "Medium",
        description: "Diagnose rendering bottlenecks, code-split bundle sizes, optimize image assets, and achieve 90+ Lighthouse performance scores.",
        timeline: "3-4 weeks",
        certification: "Google Mobile Web Specialist",
        resources: ["web.dev Performance Guide", "Lighthouse Audit Mastery", "Bundle Optimization & Code Splitting"]
      },
      {
        skill: "Accessible Component Systems (Tailwind & Radix UI)",
        priority: "Medium",
        description: "Implement accessible keyboard navigation, ARIA roles, and responsive layouts across all mobile and desktop viewports.",
        timeline: "2-3 weeks",
        certification: "W3C Accessibility Fundamentals",
        resources: ["Tailwind CSS Documentation", "Radix UI Primitives", "A11y Project Accessibility Checklist"]
      }
    ],
    learningPath: {
      phases: [
        {
          phase: "Foundation: Modern JavaScript, React & Responsive UI",
          duration: "2-3 months",
          topics: ["ES6+ syntax, async/await, and DOM APIs", "React component architecture, state, and effects", "Tailwind CSS utility classes and responsive grids", "Consuming REST APIs and handling loading/error states"],
          resources: ["React Official Documentation (react.dev)", "freeCodeCamp Frontend Development", "Tailwind CSS Tutorial by Kevin Powell"]
        },
        {
          phase: "Skill Development: TypeScript, Next.js & Application State",
          duration: "3-4 months",
          topics: ["TypeScript integration across components and custom hooks", "Next.js App Router and server/client component boundaries", "Global client state management (Zustand) and caching (React Query)", "Component testing with Vitest and React Testing Library"],
          resources: ["Total TypeScript Course", "Next.js Learn Interactive Course", "Testing JavaScript by Kent C. Dodds"]
        },
        {
          phase: "Professional Growth: Production Polish & Portfolio",
          duration: "2-3 months",
          topics: ["Core Web Vitals optimization and bundle analysis", "Accessibility compliance (WCAG 2.1)", "Building 2 signature production web applications", "Mock frontend coding challenges and portfolio presentation"],
          resources: ["web.dev Learn Performance", "FrontEnd Mentor Advanced Projects", "CareerForge Frontend Mentor Code Reviews"]
        }
      ]
    },
    marketInsights: {
      demand: "High - Strong market demand for frontend specialists skilled in modern React/Next.js and performance optimization.",
      competition: "Moderate to High - Candidates with strong TypeScript, component architecture, and accessibility stand out.",
      trends: [
        "Rise of React Server Components and Next.js App Router",
        "Growing priority on Core Web Vitals and Lighthouse performance",
        "Integration of AI chat interfaces and streaming responses in web apps",
        "Adoption of headless UI and design system primitives"
      ]
    }
  },
  FULLSTACK: {
    title: "Full-Stack Software Engineer",
    description: "Design and deliver complete end-to-end features across both client interfaces and server-side infrastructures, ensuring cohesive system behavior, clean APIs, and solid data persistence.",
    salary_range: "$90,000 - $145,000",
    growth_potential: "Very High",
    learning_timeline: "6-10 months",
    skills_required: ["TypeScript (End-to-End)", "React / Next.js", "Node.js / Express or Python", "PostgreSQL / MongoDB & Prisma ORM", "REST / GraphQL APIs", "Docker & Cloud Deployment"],
    skillsToFocus: [
      {
        skill: "End-to-End Type Safety (TypeScript, Prisma, Zod)",
        priority: "High",
        description: "Eliminate runtime boundary bugs by sharing types from database schema through server routes to frontend UI components.",
        timeline: "1-2 months",
        certification: "Full-Stack Engineering Professional",
        resources: ["Prisma Schema & Relations Guide", "Zod Validation & Type Inference", "Full-Stack Open (University of Helsinki)"]
      },
      {
        skill: "Scalable Web Application Architecture (Next.js / Express)",
        priority: "High",
        description: "Structure modular full-stack projects with clear separation of business logic, controller endpoints, and client view layers.",
        timeline: "1-2 months",
        certification: "AWS Certified Solutions Architect - Associate",
        resources: ["Next.js App Router Documentation", "Building Production Microservices", "REST & GraphQL Integration Patterns"]
      },
      {
        skill: "Containerization & Cloud CI/CD",
        priority: "Medium",
        description: "Package full-stack apps into multi-stage Docker builds and automate testing and deployment through GitHub Actions.",
        timeline: "3-4 weeks",
        certification: "GitHub Actions Certification",
        resources: ["GitHub Actions Workflow Mastery", "Docker & Compose for Full-Stack Apps", "Vercel & Railway Deployment Guides"]
      },
      {
        skill: "Authentication, RBAC & Security Best Practices",
        priority: "Medium",
        description: "Implement secure session tokens, password hashing, role-based access control, and sanitization against XSS and injection.",
        timeline: "2-3 weeks",
        certification: "OWASP Application Security Basics",
        resources: ["JWT & Refresh Token Architecture", "OWASP Security Cheatsheets", "Helmet & Express Security Patterns"]
      }
    ],
    learningPath: {
      phases: [
        {
          phase: "Foundation: Core Full-Stack Mechanics",
          duration: "2-3 months",
          topics: ["Full-stack JavaScript/TypeScript runtime fundamentals", "Express.js REST APIs and Prisma/PostgreSQL CRUD operations", "React component architecture and state management", "Git collaborative workflows and environment configuration"],
          resources: ["FullStackOpen by University of Helsinki", "The Odin Project Full-Stack JavaScript", "MDN Web Docs"]
        },
        {
          phase: "Skill Development: Production-Grade Systems & Security",
          duration: "3-4 months",
          topics: ["End-to-end data validation with Zod and TypeScript", "Secure authentication (JWT, cookies, RBAC)", "Docker containerization for frontend and backend services", "WebSocket integration for real-time bidirectional features"],
          resources: ["Prisma Documentation", "Socket.io Production Guide", "Docker for Developers Course"]
        },
        {
          phase: "Professional Growth: Architecture, Deployment & Portfolio",
          duration: "2-3 months",
          topics: ["Automated CI/CD pipelines with GitHub Actions", "Deploying scalable apps to cloud providers (AWS, Railway, Vercel)", "Building a capstone enterprise-grade full-stack application", "Mock technical interviews covering full-stack system design"],
          resources: ["AWS Cloud Practitioner Essentials", "GitHub Actions Mastery", "CareerForge Full-Stack Mentorship Program"]
        }
      ]
    },
    marketInsights: {
      demand: "Very High - High demand at startups and scale-ups seeking versatile engineers capable of shipping complete features.",
      competition: "Moderate - Strong portfolio projects with clean full-stack architecture give candidates a distinct advantage.",
      trends: [
        "End-to-end type safety spanning database to frontend (TypeScript, Prisma, Zod)",
        "Cloud platforms (Vercel, AWS) enabling rapid developer velocity",
        "Full-stack AI integration and API-driven application architectures",
        "Containerized deployment pipelines becoming standard"
      ]
    }
  },
  AI_ML: {
    title: "AI & Machine Learning Engineer",
    description: "Build, train, and deploy intelligent machine learning systems, LLM-powered applications, Retrieval-Augmented Generation (RAG) pipelines, and autonomous agent workflows.",
    salary_range: "$95,000 - $160,000",
    growth_potential: "Extremely High",
    learning_timeline: "6-12 months",
    skills_required: ["Python & Scientific Stack", "PyTorch / TensorFlow", "LLM APIs & Prompt Engineering", "Vector Databases (Pinecone/Chroma)", "Data Preprocessing & Pandas", "API Integration & Deployment"],
    skillsToFocus: [
      {
        skill: "Python Data Stack & Machine Learning Foundations",
        priority: "High",
        description: "Master Python data science libraries (NumPy, Pandas, Scikit-Learn) and supervised/unsupervised model training.",
        timeline: "2-3 months",
        certification: "Google Machine Learning Engineer",
        resources: ["Fast.ai Practical Deep Learning", "Hands-On Machine Learning with Scikit-Learn & PyTorch", "Pandas & NumPy Data Wrangling"]
      },
      {
        skill: "LLM Integration, Prompt Engineering & RAG Pipelines",
        priority: "High",
        description: "Build production Retrieval-Augmented Generation pipelines combining embedding models, chunking, and vector stores.",
        timeline: "1-2 months",
        certification: "DeepLearning.AI Generative AI Specialist",
        resources: ["LangChain & LlamaIndex Documentation", "Vector Databases (Pinecone/Chroma) Guides", "HuggingFace Transformers Course"]
      },
      {
        skill: "Vector Databases & Semantic Search",
        priority: "Medium",
        description: "Design vector indexing, cosine similarity metrics, and hybrid keyword-semantic search architectures.",
        timeline: "3-4 weeks",
        certification: "Pinecone Vector Specialist",
        resources: ["Pinecone Architecture Guides", "Embedding Models & Cosine Similarity", "Semantic Caching & Retrieval Patterns"]
      },
      {
        skill: "AI Model Deployment & FastAPI Production Services",
        priority: "Medium",
        description: "Wrap models and AI pipelines in high-speed asynchronous FastAPI services with streaming support and Docker containerization.",
        timeline: "3-4 weeks",
        certification: "MLOps Fundamentals",
        resources: ["FastAPI Official Guides", "Dockerizing AI Inference Services", "HuggingFace Spaces & Cloud Deployments"]
      }
    ],
    learningPath: {
      phases: [
        {
          phase: "Foundation: Python Data Science & Classical ML",
          duration: "2-3 months",
          topics: ["Advanced Python, NumPy matrix operations, and Pandas data wrangling", "Statistical concepts, distributions, and hypothesis testing", "Scikit-Learn algorithms (linear regression, decision trees, clustering)", "Data visualization with Matplotlib and Seaborn"],
          resources: ["Python Data Science Handbook", "Coursera Machine Learning Specialization", "Kaggle Micro-Courses"]
        },
        {
          phase: "Skill Development: Deep Learning & Generative AI",
          duration: "3-4 months",
          topics: ["Neural networks and backpropagation with PyTorch", "Transformer architecture and self-attention mechanisms", "Building RAG applications with vector databases (Pinecone, Chroma)", "Prompt engineering, function calling, and structured JSON output"],
          resources: ["DeepLearning.AI Generative AI with LLMs", "Hugging Face NLP Course", "LangChain & LlamaIndex Tutorials"]
        },
        {
          phase: "Professional Growth: Production AI Systems & Agents",
          duration: "2-3 months",
          topics: ["Autonomous multi-agent architectures and tool use", "FastAPI microservices for model inference and streaming", "MLOps, model evaluation metrics, and latency optimization", "Publishing an end-to-end AI project on GitHub with live demo"],
          resources: ["Full Stack Deep Learning Course", "FastAPI Documentation", "CareerForge AI Mentorship & Portfolio Reviews"]
        }
      ]
    },
    marketInsights: {
      demand: "Extremely High - Unprecedented growth across generative AI, autonomous agent tooling, and enterprise automation.",
      competition: "Moderate - High shortage of practitioners who can reliably integrate and deploy models into production.",
      trends: [
        "Transition from research models to production RAG and agentic workflows",
        "Massive adoption of vector databases and semantic search",
        "Optimization of local small language models (SLMs)",
        "High demand for Python data engineering and API deployment skills"
      ]
    }
  },
  DATA_ANALYTICS: {
    title: "Data Analyst / Analytics Engineer",
    description: "Extract, clean, and model complex datasets to discover key trends, construct automated KPI dashboards, and deliver data-driven intelligence for technical and business decisions.",
    salary_range: "$75,000 - $115,000",
    growth_potential: "High",
    learning_timeline: "3-6 months",
    skills_required: ["SQL & Complex Joins/Aggregations", "Python for Data Analysis (Pandas)", "Data Visualization (Tableau/PowerBI)", "Statistical Modeling", "Data Warehousing", "Metric Definition & Reporting"],
    skillsToFocus: [
      {
        skill: "Advanced SQL, CTEs & Window Functions",
        priority: "High",
        description: "Write complex analytical SQL queries using Common Table Expressions, window functions, and multi-table joins.",
        timeline: "1-2 months",
        certification: "Google Data Analytics Professional Certificate",
        resources: ["Mode Analytics SQL Tutorial", "LeetCode Database Challenges", "PostgreSQL Advanced Queries"]
      },
      {
        skill: "Data Wrangling & Statistical Analysis with Python",
        priority: "High",
        description: "Clean messy tabular data, handle nulls and outliers, and extract statistical distributions with Pandas.",
        timeline: "1-2 months",
        certification: "IBM Data Science Professional",
        resources: ["Python for Data Analysis (Wes McKinney)", "Exploratory Data Analysis Labs", "Scipy & Statsmodels Guides"]
      },
      {
        skill: "Interactive BI Dashboarding (Tableau / PowerBI)",
        priority: "Medium",
        description: "Design executive dashboards that communicate trends clearly and support interactive drill-downs.",
        timeline: "3-4 weeks",
        certification: "Tableau Desktop Specialist",
        resources: ["Tableau Public Portfolio Projects", "PowerBI Dashboard Design", "Storytelling with Data (Cole Nussbaumer)"]
      },
      {
        skill: "Data Modeling & Data Warehousing (Snowflake / BigQuery)",
        priority: "Medium",
        description: "Understand star schemas, dimensional modeling, and modern ELT transformations with dbt.",
        timeline: "3-4 weeks",
        certification: "Snowflake SnowPro Core",
        resources: ["Star Schema & Dimensional Modeling Guide", "dbt Fundamentals Course", "BigQuery Public Datasets"]
      }
    ],
    learningPath: {
      phases: [
        {
          phase: "Foundation: SQL Mastery & Data Exploration",
          duration: "2-3 months",
          topics: ["Relational algebra, SELECT, WHERE, GROUP BY, and aggregations", "Subqueries, Common Table Expressions (CTEs), and window functions", "Data cleaning and validation techniques", "Spreadsheet modeling and pivot tables"],
          resources: ["Mode Analytics SQL School", "SQL for Data Analysis by Cathy Tanimura", "freeCodeCamp Relational Database"]
        },
        {
          phase: "Skill Development: Python Analysis & BI Dashboards",
          duration: "2-3 months",
          topics: ["Pandas data frames, filtering, grouping, and merging", "Descriptive statistics, correlations, and hypothesis tests", "Building production dashboards in Tableau or PowerBI", "Creating automated reporting scripts"],
          resources: ["Python for Data Analysis by Wes McKinney", "Storytelling with Data by Cole Knaflic", "Tableau Public Learning Videos"]
        },
        {
          phase: "Professional Growth: Analytics Engineering & Case Studies",
          duration: "2-3 months",
          topics: ["Dimensional data modeling (facts, dimensions, star schemas)", "Data transformation workflows using dbt", "Creating 3 published data case studies with GitHub and Tableau Public", "Mock behavioral and analytical technical interviews"],
          resources: ["dbt Fundamentals", "Alex The Analyst Portfolio Project Series", "CareerForge Mentor Data Reviews"]
        }
      ]
    },
    marketInsights: {
      demand: "High - Expanding demand as companies prioritize data-informed decision making and business intelligence.",
      competition: "Moderate - Candidates who combine SQL mastery with clear business communication stand out.",
      trends: [
        "Convergence of traditional analytics with predictive AI modeling",
        "Automated data pipelines and modern data stack (dbt, Snowflake)",
        "Self-service business intelligence dashboards",
        "Greater emphasis on data quality and statistical rigor"
      ]
    }
  },
  CLOUD_DEVOPS: {
    title: "Cloud & DevOps Engineer",
    description: "Automate deployment lifecycles, manage scalable cloud infrastructure (AWS/GCP), containerize distributed systems with Docker and Kubernetes, and enforce reliable CI/CD pipelines.",
    salary_range: "$90,000 - $150,000",
    growth_potential: "Very High",
    learning_timeline: "5-9 months",
    skills_required: ["Docker & Containerization", "Kubernetes & Pod Management", "CI/CD Pipelines (GitHub Actions)", "AWS / Cloud Infrastructure", "Linux Systems & Bash Scripting", "Infrastructure as Code (Terraform)"],
    skillsToFocus: [
      {
        skill: "Docker Containerization & Kubernetes Fundamentals",
        priority: "High",
        description: "Build minimal, secure container images, write multi-stage Dockerfiles, and orchestrate pods and services in Kubernetes.",
        timeline: "2-3 months",
        certification: "CKA (Certified Kubernetes Administrator)",
        resources: ["Kubernetes Up & Running (O'Reilly)", "Docker Deep Dive (Nigel Poulton)", "Katacoda Interactive K8s Scenarios"]
      },
      {
        skill: "CI/CD Pipeline Automation (GitHub Actions)",
        priority: "High",
        description: "Author automated GitHub Actions workflows for continuous integration, linting, testing, and cloud deployments.",
        timeline: "1-2 months",
        certification: "GitHub Actions Certification",
        resources: ["GitHub Actions Documentation", "Automated Testing & Release Workflows", "GitOps with ArgoCD"]
      },
      {
        skill: "Infrastructure as Code (Terraform)",
        priority: "Medium",
        description: "Provision reproducible cloud VPCs, compute instances, security groups, and databases using declarative Terraform code.",
        timeline: "1-2 months",
        certification: "HashiCorp Certified Terraform Associate",
        resources: ["Terraform Up & Running", "HashiCorp Learn Tutorials", "AWS CloudFormation & CDK Guides"]
      },
      {
        skill: "Cloud Monitoring, Logging & Observability",
        priority: "Medium",
        description: "Configure metrics dashboards with Prometheus and Grafana, set up structured logging, and monitor system alerts.",
        timeline: "3-4 weeks",
        certification: "AWS Certified SysOps Administrator",
        resources: ["Prometheus & Grafana Setup Guides", "Structured Logging with Winston/ELK", "Sentry Error Monitoring"]
      }
    ],
    learningPath: {
      phases: [
        {
          phase: "Foundation: Linux Systems & Docker Containers",
          duration: "2-3 months",
          topics: ["Linux terminal commands, permissions, and shell scripting", "Networking fundamentals (DNS, TCP/IP, reverse proxies)", "Docker container architecture and multi-stage Dockerfiles", "Docker Compose for local multi-service orchestration"],
          resources: ["The Linux Command Line by William Shotts", "Docker Mastery by Bret Fisher", "DevOps Roadmap on roadmap.sh"]
        },
        {
          phase: "Skill Development: CI/CD & Cloud Infrastructure",
          duration: "3-4 months",
          topics: ["AWS core services (EC2, S3, RDS, IAM, VPC)", "GitHub Actions workflows for automated build/test/deploy", "Infrastructure as Code using Terraform", "Security scanning and secret management in CI/CD"],
          resources: ["AWS Certified Solutions Architect Course (Stephane Maarek)", "Terraform in Action", "GitHub Actions Documentation"]
        },
        {
          phase: "Professional Growth: Kubernetes & Production Observability",
          duration: "2-3 months",
          topics: ["Kubernetes deployments, services, ingress, and configmaps", "Monitoring infrastructure with Prometheus and Grafana", "Zero-downtime rolling updates and blue-green deployments", "Building a public GitHub portfolio with automated deployment pipelines"],
          resources: ["Mumshad Mannambeth CKA Course", "Prometheus & Grafana Official Documentation", "CareerForge Cloud Mentorship"]
        }
      ]
    },
    marketInsights: {
      demand: "Very High - Critical role in modern tech organizations as infrastructure complexity increases.",
      competition: "Moderate - High barrier to entry creates excellent opportunities for candidates with hands-on skills.",
      trends: [
        "Kubernetes and container orchestration as default standard",
        "Infrastructure as Code (Terraform) replacing manual cloud console management",
        "GitOps and automated CI/CD deployment pipelines",
        "Focus on cloud cost optimization (FinOps) and platform engineering"
      ]
    }
  },
  MOBILE: {
    title: "Mobile Application Developer",
    description: "Design, build, and publish performant mobile applications for iOS and Android platforms, emphasizing smooth touch interfaces, offline state persistence, and native device capabilities.",
    salary_range: "$85,000 - $135,000",
    growth_potential: "High",
    learning_timeline: "4-8 months",
    skills_required: ["React Native / Flutter", "Mobile UI/UX Patterns", "State Management (Redux/Zustand)", "REST & WebSocket Integration", "Native Device APIs & Permissions", "App Store & Play Store Deployment"],
    skillsToFocus: [
      {
        skill: "React Native & Expo Ecosystem",
        priority: "High",
        description: "Develop cross-platform apps using React Native and modern Expo Application Services (EAS) for build and deployment.",
        timeline: "2-3 months",
        certification: "Meta React Native Specialization",
        resources: ["React Native Official Documentation", "Expo Application Services (EAS)", "React Navigation Architecture"]
      },
      {
        skill: "Mobile State Management & Offline-First Persistence",
        priority: "High",
        description: "Manage global state, cache remote responses, and sync offline user actions gracefully with local storage.",
        timeline: "1-2 months",
        certification: "Mobile Architecture Specialist",
        resources: ["Zustand / Redux Toolkit for Mobile", "AsyncStorage & WatermelonDB", "Optimistic UI Updates on Slow Networks"]
      },
      {
        skill: "Native Device APIs & Animations",
        priority: "Medium",
        description: "Integrate hardware sensors, push notifications, camera, and author fluid 60fps animations with Reanimated.",
        timeline: "3-4 weeks",
        certification: "Mobile UX Foundations",
        resources: ["React Native Reanimated 3 Guides", "Camera, Geolocation & Push Notifications", "Gestures & Touch Handling"]
      },
      {
        skill: "App Store & Google Play Publishing Automation",
        priority: "Medium",
        description: "Configure app icons, splash screens, certificates, and release tracks across iOS App Store and Google Play Console.",
        timeline: "2-3 weeks",
        certification: "App Store Optimization Specialist",
        resources: ["Fastlane Deployment Pipelines", "Google Play Console Guidelines", "Apple App Store Review Guidelines"]
      }
    ],
    learningPath: {
      phases: [
        {
          phase: "Foundation: JavaScript/TypeScript & React Basics",
          duration: "2-3 months",
          topics: ["Core JavaScript ES6+ and TypeScript types", "React component architecture, state, and props", "Mobile layouts with Flexbox and responsive touch areas", "React Navigation (stacks, tabs, modals)"],
          resources: ["React Native Official Tutorial", "TypeScript Handbook", "Expo Getting Started"]
        },
        {
          phase: "Skill Development: Device Features & Backend Sync",
          duration: "2-3 months",
          topics: ["Integrating REST and GraphQL APIs with optimistic updates", "Local offline storage and device authentication (biometrics)", "Camera, maps, push notifications, and permissions", "Automating builds using Expo Application Services (EAS)"],
          resources: ["React Native by Example", "Expo Documentation", "TanStack Query for Mobile"]
        },
        {
          phase: "Professional Growth: Publishing & Performance Polish",
          duration: "2-3 months",
          topics: ["Profiling mobile app memory, frame rates, and render cycles", "App Store and Google Play publishing workflow and compliance", "Publishing 1 complete mobile app with public reviews", "Mobile technical interview prep and portfolio presentation"],
          resources: ["React Native Performance Guide", "Fastlane Documentation", "CareerForge Mobile Mentorship"]
        }
      ]
    },
    marketInsights: {
      demand: "High - Consistent global demand for cross-platform mobile apps across consumer and enterprise markets.",
      competition: "Moderate - Candidates with published App Store / Play Store apps have high hiring success.",
      trends: [
        "Dominance of React Native and Flutter for unified cross-platform development",
        "Offline-first mobile architecture with local caching",
        "Integration of on-device AI and biometric authentication",
        "Strict app performance benchmarks and micro-interactions"
      ]
    }
  },
  UI_UX: {
    title: "UI/UX Engineer & Product Designer",
    description: "Design intuitive user journeys, wireframes, and design systems in Figma, and bridge design with code by authoring polished, accessible frontend components.",
    salary_range: "$75,000 - $120,000",
    growth_potential: "High",
    learning_timeline: "4-8 months",
    skills_required: ["Figma & Wireframing", "User Research & Usability Testing", "Design Systems & Tokenization", "HTML5 & Tailwind CSS", "Interactive Prototyping", "Accessibility (WCAG)"],
    skillsToFocus: [
      {
        skill: "Figma Design Systems & Responsive Auto-Layout",
        priority: "High",
        description: "Master modern Figma auto-layout, component variants, design tokens, and interactive clickable prototypes.",
        timeline: "1-2 months",
        certification: "Google UX Design Certificate",
        resources: ["Figma Interactive Tutorials", "Design Systems Handbook", "Component Tokenization in Figma"]
      },
      {
        skill: "User Research, Journey Mapping & Usability Testing",
        priority: "High",
        description: "Conduct user interviews, map user flows, identify friction points, and iterate designs based on feedback.",
        timeline: "1-2 months",
        certification: "Nielsen Norman Group UX Certification",
        resources: ["Don't Make Me Think by Steve Krug", "The Design of Everyday Things by Don Norman", "Usability Testing Scripting"]
      },
      {
        skill: "Modern Semantic HTML & Tailwind CSS Prototyping",
        priority: "Medium",
        description: "Turn Figma mockups into pixel-perfect, responsive HTML and Tailwind CSS code components.",
        timeline: "3-4 weeks",
        certification: "W3C Web Design Specialist",
        resources: ["Refactoring UI by Adam Wathan & Steve Schoger", "Tailwind CSS Mastery", "Interactive Prototype Crafting"]
      },
      {
        skill: "Accessibility & Universal Design (WCAG 2.2)",
        priority: "Medium",
        description: "Ensure color contrast ratios, screen reader support, keyboard navigability, and accessible touch targets.",
        timeline: "2-3 weeks",
        certification: "CPACC (Accessibility Credential)",
        resources: ["A11y Project Guidelines", "Screen Reader Testing (NVDA/VoiceOver)", "Color Contrast & Keyboard Navigation"]
      }
    ],
    learningPath: {
      phases: [
        {
          phase: "Foundation: Design Principles & Figma Mastery",
          duration: "2-3 months",
          topics: ["Color theory, typography scales, spacing, and visual hierarchy", "Figma auto-layout, components, variants, and interactive prototypes", "User-centered design thinking and wireframing user journeys", "Conducting lightweight usability tests with real users"],
          resources: ["Google UX Design Professional Certificate", "Figma YouTube Channel", "Refactoring UI by Adam Wathan"]
        },
        {
          phase: "Skill Development: Design Systems & Code Prototyping",
          duration: "2-3 months",
          topics: ["Building comprehensive component design systems in Figma", "Translating Figma designs into responsive HTML and Tailwind CSS", "Micro-interactions, state changes, and animation timing", "Accessibility auditing with axe DevTools and WCAG 2.2 standards"],
          resources: ["Design Systems Repo", "Tailwind CSS Documentation", "A11y Project Checklist"]
        },
        {
          phase: "Professional Growth: Portfolio Case Studies & Review",
          duration: "2-3 months",
          topics: ["Writing 2 in-depth UX case studies documenting problem, research, and outcome", "Designing an impressive personal design portfolio website", "Design critique presentation skills and stakeholder communication", "Mock design challenge and app critique interview prep"],
          resources: ["Case Study Club", "Nielsen Norman Group Articles", "CareerForge UI/UX Mentor Critiques"]
        }
      ]
    },
    marketInsights: {
      demand: "High - Growing recognition that user experience and design systems directly impact product retention.",
      competition: "Moderate to High - Strong case-study portfolios showcasing real user research outperform generic mockups.",
      trends: [
        "Integration of Figma variables and advanced design tokens",
        "Component-driven design systems mapped directly to code",
        "Design for AI interfaces and dynamic conversational flows",
        "Accessibility (WCAG) compliance becoming a legal and user priority"
      ]
    }
  },
  CYBERSECURITY: {
    title: "Cybersecurity & Application Security Analyst",
    description: "Identify system vulnerabilities, conduct penetration tests, implement secure authentication/authorization, and ensure robust network and application protection against emerging threats.",
    salary_range: "$85,000 - $140,000",
    growth_potential: "Extremely High",
    learning_timeline: "6-12 months",
    skills_required: ["OWASP Top 10 & AppSec", "Network Protocols & Traffic Analysis", "Vulnerability Assessment & Pen Testing", "Linux & Systems Security", "IAM & Authentication Protocols", "Incident Response"],
    skillsToFocus: [
      {
        skill: "Web Application Security & OWASP Top 10",
        priority: "High",
        description: "Understand, exploit, and remediate common web vulnerabilities including SQLi, XSS, CSRF, and broken access control.",
        timeline: "2-3 months",
        certification: "CompTIA Security+",
        resources: ["PortSwigger Web Security Academy", "OWASP Testing Guide", "The Web Application Hacker's Handbook"]
      },
      {
        skill: "Network Protocols & Traffic Analysis (Wireshark)",
        priority: "High",
        description: "Analyze network packets, identify suspicious traffic anomalies, and understand TCP/IP security fundamentals.",
        timeline: "1-2 months",
        certification: "Cisco Certified CyberOps Associate",
        resources: ["Practical Packet Analysis by Chris Sanders", "Wireshark University Labs", "TCP/IP Illustrated"]
      },
      {
        skill: "Linux Systems Security & Hardening",
        priority: "Medium",
        description: "Harden server configurations, manage user permissions, audit system logs, and write security bash scripts.",
        timeline: "3-4 weeks",
        certification: "Linux Professional Institute Security",
        resources: ["Linux Hardening Best Practices", "SELinux & AppArmor Configuration", "Bash Security Auditing Scripts"]
      },
      {
        skill: "Identity & Access Management (OAuth2, OIDC, JWT)",
        priority: "Medium",
        description: "Configure secure authentication flows, token verification, secret management, and zero-trust policies.",
        timeline: "3-4 weeks",
        certification: "Certified Information Systems Security Officer",
        resources: ["OAuth 2.0 in Action (Manning)", "Zero-Trust Architecture Principles", "Secret Management with Vault"]
      }
    ],
    learningPath: {
      phases: [
        {
          phase: "Foundation: Networking, Linux & Security Fundamentals",
          duration: "2-3 months",
          topics: ["TCP/IP, DNS, HTTP/S, and network packet capture with Wireshark", "Linux command line, file permissions, and system administration", "Cryptographic basics (symmetric, asymmetric, hashing, certificates)", "CompTIA Security+ core domains and security terminologies"],
          resources: ["Professor Messer CompTIA Security+ Course", "OverTheWire Wargames (Bandit)", "Practical Packet Analysis"]
        },
        {
          phase: "Skill Development: Web Application Penetration Testing",
          duration: "3-4 months",
          topics: ["OWASP Top 10 hands-on exploitation and remediation", "Web proxy testing using Burp Suite Community", "Authentication flaws, privilege escalation, and session hijacking", "Defensive coding practices, input validation, and secure headers"],
          resources: ["PortSwigger Web Security Academy (Free)", "TryHackMe Web Fundamentals Path", "OWASP Juice Shop Labs"]
        },
        {
          phase: "Professional Growth: Vulnerability Management & Blue Team",
          duration: "2-3 months",
          topics: ["Vulnerability scanning tools and vulnerability disclosure reporting", "Security information and event monitoring (SIEM) basics", "Building a GitHub portfolio of security tools and lab write-ups", "Technical interview prep for SOC Analyst and AppSec positions"],
          resources: ["TryHackMe SOC Level 1 Path", "Hack The Box Starting Point", "CareerForge Security Mentorship"]
        }
      ]
    },
    marketInsights: {
      demand: "Extremely High - Zero-unemployment sector with severe talent shortages worldwide.",
      competition: "Low to Moderate - Exceptionally high demand for verified skills and practical security auditing ability.",
      trends: [
        "Zero-trust architecture replacing traditional perimeter defenses",
        "Application security (DevSecOps) integrated directly into CI/CD pipelines",
        "Surge in cloud security posture management (CSPM)",
        "AI-augmented threat detection and vulnerability remediation"
      ]
    }
  }
};

const COMPLEMENTARY_DOMAINS = {
  BACKEND: ['FULLSTACK', 'CLOUD_DEVOPS', 'DATA_ANALYTICS'],
  FRONTEND: ['FULLSTACK', 'MOBILE', 'UI_UX'],
  FULLSTACK: ['BACKEND', 'FRONTEND', 'CLOUD_DEVOPS'],
  AI_ML: ['DATA_ANALYTICS', 'BACKEND', 'FULLSTACK'],
  DATA_ANALYTICS: ['AI_ML', 'BACKEND', 'FULLSTACK'],
  CLOUD_DEVOPS: ['BACKEND', 'FULLSTACK', 'CYBERSECURITY'],
  MOBILE: ['FRONTEND', 'FULLSTACK', 'BACKEND'],
  UI_UX: ['FRONTEND', 'FULLSTACK', 'MOBILE'],
  CYBERSECURITY: ['BACKEND', 'CLOUD_DEVOPS', 'FULLSTACK']
};

/**
 * Generate deeply personalized recommendations dynamically derived from user's actual answers
 * @param {object} answers - Quiz answers by stage
 * @param {string|null} sessionUserId - User ID
 */
const generatePersonalizedRecommendations = async (answers, sessionUserId = null) => {
  const parsedAnswers = typeof answers === 'string' ? JSON.parse(answers || '{}') : (answers || {});

  const skillsAnswers = Array.isArray(parsedAnswers.SKILLS_ASSESSMENT) ? parsedAnswers.SKILLS_ASSESSMENT : [];
  const interestsAnswers = Array.isArray(parsedAnswers.CAREER_INTERESTS) ? parsedAnswers.CAREER_INTERESTS : [];
  const personalityAnswers = Array.isArray(parsedAnswers.PERSONALITY_TRAITS) ? parsedAnswers.PERSONALITY_TRAITS : [];
  const learningAnswers = Array.isArray(parsedAnswers.LEARNING_STYLE) ? parsedAnswers.LEARNING_STYLE : [];
  const goalsAnswers = Array.isArray(parsedAnswers.CAREER_GOALS) ? parsedAnswers.CAREER_GOALS : [];

  const allText = [
    ...skillsAnswers,
    ...interestsAnswers,
    ...personalityAnswers,
    ...learningAnswers,
    ...goalsAnswers
  ].join(' ').toLowerCase();

  const domainScores = {
    BACKEND: 0,
    FRONTEND: 0,
    FULLSTACK: 0,
    AI_ML: 0,
    DATA_ANALYTICS: 0,
    CLOUD_DEVOPS: 0,
    MOBILE: 0,
    UI_UX: 0,
    CYBERSECURITY: 0
  };

  const chosenLanguage = skillsAnswers[0] || '';
  const chosenDatabase = skillsAnswers[2] || '';
  const chosenTesting = skillsAnswers[3] || '';
  const chosenGit = skillsAnswers[4] || '';

  const chosenProjectType = interestsAnswers[0] || '';
  const chosenIndustry = interestsAnswers[1] || '';
  const chosenExcitement = interestsAnswers[3] || '';
  const chosenWeekendBuild = interestsAnswers[4] || '';

  const chosenRoleInTeam = personalityAnswers[4] || '';
  const chosenTargetRole = goalsAnswers[1] || '';
  const chosenObstacle = goalsAnswers[3] || '';
  const chosenVision3Y = goalsAnswers[4] || '';

  // 0. Adaptive Track Signal
  const userTrack = inferUserTrack(parsedAnswers);
  if (userTrack === 'DATA_AI') {
    domainScores.AI_ML += 45;
    domainScores.DATA_ANALYTICS += 45;
  } else if (userTrack === 'WEB_FRONTEND') {
    domainScores.FRONTEND += 45;
    domainScores.FULLSTACK += 25;
  } else if (userTrack === 'BACKEND_SYSTEMS') {
    domainScores.BACKEND += 50;
    domainScores.FULLSTACK += 25;
  } else if (userTrack === 'CLOUD_DEVOPS') {
    domainScores.CLOUD_DEVOPS += 55;
    domainScores.BACKEND += 20;
  } else if (userTrack === 'UI_UX') {
    domainScores.UI_UX += 55;
    domainScores.FRONTEND += 20;
  } else if (userTrack === 'MOBILE') {
    domainScores.MOBILE += 55;
    domainScores.FRONTEND += 15;
  } else if (userTrack === 'CYBERSECURITY') {
    domainScores.CYBERSECURITY += 55;
    domainScores.BACKEND += 20;
  }

  // 1. Target Role (Stage 5 Q2) - Primary indicator (Weight: 45)
  if (/backend/i.test(chosenTargetRole)) {
    domainScores.BACKEND += 45;
    domainScores.FULLSTACK += 20;
    domainScores.CLOUD_DEVOPS += 10;
  } else if (/frontend/i.test(chosenTargetRole)) {
    domainScores.FRONTEND += 45;
    domainScores.FULLSTACK += 20;
  } else if (/full-stack|full stack/i.test(chosenTargetRole)) {
    domainScores.FULLSTACK += 45;
    domainScores.BACKEND += 20;
    domainScores.FRONTEND += 20;
  } else if (/data analyst|ai|data insights/i.test(chosenTargetRole)) {
    domainScores.DATA_ANALYTICS += 35;
    domainScores.AI_ML += 35;
  }

  // 2. Project Type (Stage 2 Q1) - (Weight: 35)
  if (/backend services|rest apis|server logic/i.test(chosenProjectType)) {
    domainScores.BACKEND += 35;
    domainScores.FULLSTACK += 15;
    domainScores.CLOUD_DEVOPS += 10;
  } else if (/user interfaces|websites|interactive web apps/i.test(chosenProjectType)) {
    domainScores.FRONTEND += 35;
    domainScores.FULLSTACK += 15;
  } else if (/mobile apps|ios|android/i.test(chosenProjectType)) {
    domainScores.MOBILE += 45;
    domainScores.FRONTEND += 15;
    domainScores.FULLSTACK += 10;
  } else if (/data dashboards|automation scripts|machine learning/i.test(chosenProjectType)) {
    domainScores.DATA_ANALYTICS += 30;
    domainScores.AI_ML += 30;
  }

  // 3. Tech Excitement (Stage 2 Q4) - (Weight: 30)
  if (/beautiful.*intuitive.*accessible user experiences/i.test(chosenExcitement)) {
    domainScores.FRONTEND += 25;
    domainScores.UI_UX += 35;
  } else if (/ai assistants.*chatbots.*automation/i.test(chosenExcitement)) {
    domainScores.AI_ML += 35;
    domainScores.FULLSTACK += 10;
  } else if (/deploying apps to the cloud|docker|aws|vercel/i.test(chosenExcitement)) {
    domainScores.CLOUD_DEVOPS += 35;
    domainScores.BACKEND += 15;
  } else if (/algorithmic problems.*faster and cleaner/i.test(chosenExcitement)) {
    domainScores.BACKEND += 30;
    domainScores.AI_ML += 10;
  }

  // 4. Weekend Project (Stage 2 Q5) - (Weight: 25)
  if (/full-stack web application/i.test(chosenWeekendBuild)) {
    domainScores.FULLSTACK += 30;
    domainScores.BACKEND += 10;
    domainScores.FRONTEND += 10;
  } else if (/bot or tool powered by an ai api/i.test(chosenWeekendBuild)) {
    domainScores.AI_ML += 30;
    domainScores.FULLSTACK += 10;
  } else if (/mobile or web utility/i.test(chosenWeekendBuild)) {
    domainScores.MOBILE += 25;
    domainScores.FRONTEND += 15;
  } else if (/open-source tool.*template.*library/i.test(chosenWeekendBuild)) {
    domainScores.BACKEND += 20;
    domainScores.CLOUD_DEVOPS += 20;
  }

  // 5. Programming Language (Stage 1 Q1) - (Weight: 25)
  if (/javascript.*typescript/i.test(chosenLanguage)) {
    domainScores.FULLSTACK += 20;
    domainScores.FRONTEND += 20;
    domainScores.BACKEND += 15;
  } else if (/python/i.test(chosenLanguage)) {
    domainScores.AI_ML += 25;
    domainScores.DATA_ANALYTICS += 25;
    domainScores.BACKEND += 15;
  } else if (/java.*c#/i.test(chosenLanguage)) {
    domainScores.BACKEND += 30;
    domainScores.FULLSTACK += 10;
  } else if (/html.*css/i.test(chosenLanguage)) {
    domainScores.FRONTEND += 25;
    domainScores.UI_UX += 25;
  }

  // 6. Database (Stage 1 Q3) - (Weight: 15)
  if (/relational tables|joins/i.test(chosenDatabase)) {
    domainScores.BACKEND += 20;
    domainScores.DATA_ANALYTICS += 15;
  } else if (/mongodb|nosql/i.test(chosenDatabase)) {
    domainScores.FULLSTACK += 20;
    domainScores.BACKEND += 15;
  }

  // 7. Testing & Role (Stage 1 Q4 & Stage 3 Q5) - (Weight: 15)
  if (/automated unit tests/i.test(chosenTesting)) {
    domainScores.BACKEND += 15;
    domainScores.CLOUD_DEVOPS += 15;
  } else if (/boundary cases/i.test(chosenTesting)) {
    domainScores.CYBERSECURITY += 25;
    domainScores.BACKEND += 15;
  }
  if (/polisher.*styling/i.test(chosenRoleInTeam)) {
    domainScores.UI_UX += 25;
    domainScores.FRONTEND += 15;
  } else if (/researcher/i.test(chosenRoleInTeam)) {
    domainScores.AI_ML += 15;
    domainScores.DATA_ANALYTICS += 15;
  } else if (/builder/i.test(chosenRoleInTeam)) {
    domainScores.FULLSTACK += 15;
    domainScores.BACKEND += 10;
  }

  // 8. 3-Year Vision (Stage 5 Q5) - (Weight: 20)
  if (/cloud.*ai.*security/i.test(chosenVision3Y)) {
    domainScores.CLOUD_DEVOPS += 20;
    domainScores.AI_ML += 20;
    domainScores.CYBERSECURITY += 20;
  } else if (/technical lead.*architecture/i.test(chosenVision3Y)) {
    domainScores.BACKEND += 20;
    domainScores.FULLSTACK += 15;
  }

  // Strict UI/UX validation: user must have explicitly chosen visual design / styling / user experiences
  const hasExplicitUiUxInterest = /beautiful.*user experiences|html.*css|polisher.*styling/i.test(allText);

  // Sort domains by score descending
  const sortedDomains = Object.entries(domainScores).sort((a, b) => b[1] - a[1]);
  const topScore = Math.max(sortedDomains[0][1], 1);

  // Select top 3 domains strictly avoiding unrelated fields
  const selectedDomains = [];
  for (const [dom, score] of sortedDomains) {
    if (dom === 'UI_UX' && (!hasExplicitUiUxInterest || score < 45)) continue;
    if (dom === 'DATA_ANALYTICS' && score < 35) continue;
    if (dom === 'MOBILE' && score < 35) continue;
    if (dom === 'CYBERSECURITY' && score < 30) continue;
    if (score >= Math.max(topScore * 0.3, 20)) {
      selectedDomains.push(dom);
    }
    if (selectedDomains.length === 3) break;
  }

  // Complementary fallback if fewer than 3 domains qualified
  if (selectedDomains.length < 3) {
    const primaryDom = selectedDomains[0] || 'FULLSTACK';
    const fallbacks = COMPLEMENTARY_DOMAINS[primaryDom] || ['FULLSTACK', 'BACKEND', 'FRONTEND'];
    for (const fb of fallbacks) {
      if (fb === 'UI_UX' && !hasExplicitUiUxInterest) continue;
      if (!selectedDomains.includes(fb)) {
        selectedDomains.push(fb);
      }
      if (selectedDomains.length === 3) break;
    }
  }

  const primaryDomain = selectedDomains[0] || 'FULLSTACK';
  const primaryTemplate = CAREER_TEMPLATES[primaryDomain] || CAREER_TEMPLATES.FULLSTACK;

  // Construct dynamic why_match strings
  const buildWhyMatch = (domain, rank) => {
    const lang = chosenLanguage ? chosenLanguage.split('(')[0].trim() : 'technical skills';
    const project = chosenProjectType ? chosenProjectType.split('(')[0].toLowerCase().trim() : 'preferred project domain';
    const role = chosenTargetRole ? chosenTargetRole.split('(')[0].trim() : 'target career direction';
    const excitement = chosenExcitement ? chosenExcitement.toLowerCase().trim() : 'technology interests';

    if (rank === 0) {
      return `Your primary strength in ${lang} and your interest in ${project} directly match this career path. Furthermore, your enthusiasm for ${excitement} and goal of becoming a ${role} make this your highest-leverage career path with strong market trajectory.`;
    } else if (rank === 1) {
      return `This career closely complements your background with strong overlap in ${lang} and your ambition of ${role}. Your problem-solving methodology and technical foundation provide a seamless transition into this high-demand role.`;
    } else {
      return `An adjacent high-upside career trajectory that leverages your technical fundamentals in ${lang} while expanding your market versatility across modern cross-functional teams.`;
    }
  };

  // Construct dynamic nextSteps tailored to user's stated obstacle
  const buildNextSteps = (obstacleText, targetTitle) => {
    const steps = [];
    if (/coding challenges|interviews/i.test(obstacleText)) {
      steps.push({
        step: "Establish a daily 45-minute coding challenge habit (LeetCode / HackerRank) focusing on arrays, hashing, and recursion",
        timeline: "Next 2 weeks",
        priority: "High"
      });
      steps.push({
        step: "Practice behavioral and technical explanations using the STAR method (Situation, Task, Action, Result)",
        timeline: "Weeks 3-4",
        priority: "High"
      });
    } else if (/project experience|resume/i.test(obstacleText)) {
      steps.push({
        step: `Build and deploy 1 signature end-to-end portfolio project specifically showcasing your ${targetTitle} capabilities`,
        timeline: "Next 3 weeks",
        priority: "High"
      });
      steps.push({
        step: "Author a comprehensive project README with architecture diagrams, setup instructions, and a live deployment demo link",
        timeline: "Week 4",
        priority: "High"
      });
    } else if (/confidence|ready/i.test(obstacleText)) {
      steps.push({
        step: `Perform an objective skill gap audit comparing your current projects against 5 active job descriptions for ${targetTitle}`,
        timeline: "This week",
        priority: "High"
      });
      steps.push({
        step: "Schedule an objective 1-on-1 code and portfolio review with a verified industry mentor on CareerForge",
        timeline: "Next 2 weeks",
        priority: "High"
      });
    } else if (/networking|recruiter/i.test(obstacleText)) {
      steps.push({
        step: `Optimize your LinkedIn headline, summary, and skills section specifically targeting ${targetTitle} recruiter searches`,
        timeline: "This week",
        priority: "High"
      });
      steps.push({
        step: "Connect with 5 active engineers and alumni weekly on CareerForge and LinkedIn for advice and coffee chats",
        timeline: "Ongoing",
        priority: "High"
      });
    } else {
      steps.push({
        step: `Set measurable learning milestones for the next 90 days focused on ${targetTitle} core competencies`,
        timeline: "This week",
        priority: "High"
      });
      steps.push({
        step: "Complete 1 full-scope project and commit your progress daily to an open GitHub repository",
        timeline: "Next 3 weeks",
        priority: "High"
      });
    }

    steps.push({
      step: `Enroll in the recommended foundation course for your primary skill to focus on (${primaryTemplate.skillsToFocus[0]?.skill || 'Core Development'})`,
      timeline: "Next 1-2 weeks",
      priority: "High"
    });
    steps.push({
      step: "Participate in code reviews and study production open-source repositories in your target stack",
      timeline: "Weeks 3-5",
      priority: "Medium"
    });
    steps.push({
      step: "Schedule a simulated behavioral and technical mock interview on CareerForge to validate your interview readiness",
      timeline: "Month 2",
      priority: "Medium"
    });
    steps.push({
      step: "Update your resume with quantifiable metrics and targeted keywords matching your assessment results",
      timeline: "Month 2",
      priority: "Medium"
    });

    return steps;
  };

  // Distinct, realistic match percentages
  const matchPercentages = [94, 87, 79];

  const topCareers = selectedDomains.map((dom, index) => {
    const tmpl = CAREER_TEMPLATES[dom] || CAREER_TEMPLATES.FULLSTACK;
    return {
      title: tmpl.title,
      match_percentage: matchPercentages[index] || 75,
      description: tmpl.description,
      why_match: buildWhyMatch(dom, index),
      salary_range: tmpl.salary_range,
      growth_potential: tmpl.growth_potential,
      learning_timeline: tmpl.learning_timeline,
      skills_required: tmpl.skills_required
    };
  });

  const synthesizedRecommendations = {
    topCareers,
    skillsToFocus: primaryTemplate.skillsToFocus,
    learningPath: primaryTemplate.learningPath,
    nextSteps: buildNextSteps(chosenObstacle, primaryTemplate.title),
    marketInsights: primaryTemplate.marketInsights
  };

  // Optional AI enrichment: If an AI provider is active, ask for tailored prose enrichment
  // If AI is offline, times out, or fails, the synthesized recommendation is returned immediately
  const availableModels = getAvailableModels();
  if (availableModels.length > 0) {
    try {
      const prompt = `You are an executive career advisor. Based on the user's assessment quiz responses, review and enrich the following personalized recommendations JSON:
Responses summary:
- Skills: ${skillsAnswers.join('; ')}
- Interests: ${interestsAnswers.join('; ')}
- Goals: ${goalsAnswers.join('; ')}

Current matched careers: ${topCareers.map(c => c.title).join(', ')}

Please return valid JSON with the EXACT same keys ("topCareers", "skillsToFocus", "learningPath", "nextSteps", "marketInsights") maintaining these exact top career titles:
${JSON.stringify(synthesizedRecommendations, null, 2)}`;

      const aiPromise = chatWithAI(prompt, [], {
        userId: sessionUserId || 'quiz-user',
        userName: 'Quiz User',
        userRole: 'Professional',
        taskType: 'quiz_completion'
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI synthesis timeout')), 2500)
      );

      const response = await Promise.race([aiPromise, timeoutPromise]);
      const jsonMatch = response.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedAi = JSON.parse(jsonMatch[0]);
        if (parsedAi.topCareers && Array.isArray(parsedAi.topCareers) && parsedAi.topCareers.length > 0) {
          return parsedAi;
        }
      }
    } catch (aiErr) {
      // Expected when offline or under timeout; return the deterministic personalized recommendations
    }
  }

  return synthesizedRecommendations;
};

const STAGE_ORDER = ['SKILLS_ASSESSMENT', 'CAREER_INTERESTS', 'PERSONALITY_TRAITS', 'LEARNING_STYLE', 'CAREER_GOALS'];
const QUESTIONS_PER_STAGE = 5; // 5 questions per stage across 5 stages = 25 questions total as defined in docs/PROJECT.md
const TOTAL_QUESTIONS = STAGE_ORDER.length * QUESTIONS_PER_STAGE;

/**
 * Generate next quiz question or complete quiz with instant response time
 * @param {string} sessionId - Quiz session ID
 * @param {object|null} currentAnswers - Updated answers map if already parsed in caller
 * @param {string|null} currentStageParam - Current stage if known
 */
const quizNext = async (sessionId, currentAnswers = null, currentStageParam = null) => {
  const { prisma } = require('../config/database');
  
  try {
    let answers = currentAnswers;
    let currentStage = currentStageParam;
    let sessionUserId = null;
    let alreadyAskedQuestions = new Set();
    let userAttemptCount = 0;

    if (sessionId) {
      try {
        const session = await prisma.quizSession.findUnique({
          where: { id: sessionId },
          select: {
            answers: true,
            currentStage: true,
            userId: true,
            quizQuestions: {
              select: { questionText: true }
            }
          },
        });
        if (session) {
          sessionUserId = session.userId;
          if (!answers) {
            answers = typeof session.answers === 'string' 
              ? JSON.parse(session.answers || '{}') 
              : (session.answers || {});
          }
          currentStage = currentStage || session.currentStage;
          if (session.quizQuestions && Array.isArray(session.quizQuestions)) {
            session.quizQuestions.forEach(q => alreadyAskedQuestions.add(q.questionText));
          }
          if (session.userId) {
            try {
              userAttemptCount = await prisma.quizSession.count({
                where: { userId: session.userId }
              });
            } catch (countErr) {
              // Non-fatal
            }
          }
        }
      } catch (dbErr) {
        console.warn('quizNext session lookup warning:', dbErr.message);
      }
    }
    answers = answers || {};

    if (!currentStage || !STAGE_ORDER.includes(currentStage)) {
      currentStage = STAGE_ORDER[0];
    }

    const currentStageIndex = STAGE_ORDER.indexOf(currentStage);
    const questionsInCurrentStage = answers[currentStage]?.length || 0;

    // Determine if we should move to next stage (2 questions per stage)
    const shouldMoveToNextStage = questionsInCurrentStage >= QUESTIONS_PER_STAGE;
    const isLastStage = currentStageIndex === STAGE_ORDER.length - 1;

    // If completed all stages, generate personalized recommendations based on actual user answers
    if (shouldMoveToNextStage && isLastStage) {
      const recommendations = await generatePersonalizedRecommendations(answers, sessionUserId);

      return {
        isComplete: true,
        recommendations,
        progress: {
          currentQuestion: TOTAL_QUESTIONS,
          totalQuestions: TOTAL_QUESTIONS,
          stageQuestion: QUESTIONS_PER_STAGE,
          stageTotalQuestions: QUESTIONS_PER_STAGE,
          currentStage: STAGE_ORDER.length,
          totalStages: STAGE_ORDER.length,
          percentage: 100,
        }
      };
    }

    // Determine target stage and question index
    let nextStage = currentStage;
    let questionIndexInStage = questionsInCurrentStage;

    if (shouldMoveToNextStage && !isLastStage) {
      nextStage = STAGE_ORDER[currentStageIndex + 1];
      questionIndexInStage = 0;
    }

    // Select adaptive question based on user's previous answers, track branching, and session attempt count
    const sessionSeed = getSessionSeed(sessionId, userAttemptCount);
    const selectedQuestion = selectAdaptiveQuestion(
      nextStage,
      questionIndexInStage,
      answers,
      sessionSeed,
      alreadyAskedQuestions
    );

    // Compute exact question number based on all answers logged
    let totalAnswered = 0;
    for (const stage of STAGE_ORDER) {
      totalAnswered += (answers[stage]?.length || 0);
    }
    const currentQuestionNumber = Math.min(totalAnswered + 1, TOTAL_QUESTIONS);
    const nextStageIndex = STAGE_ORDER.indexOf(nextStage);
    const percentage = Math.round(((currentQuestionNumber - 1) / TOTAL_QUESTIONS) * 100);

    return {
      question: selectedQuestion.question,
      options: selectedQuestion.options,
      stage: nextStage,
      isComplete: false,
      progress: {
        currentQuestion: currentQuestionNumber,
        totalQuestions: TOTAL_QUESTIONS,
        stageQuestion: ((currentQuestionNumber - 1) % QUESTIONS_PER_STAGE) + 1,
        stageTotalQuestions: QUESTIONS_PER_STAGE,
        currentStage: nextStageIndex + 1,
        totalStages: STAGE_ORDER.length,
        percentage,
      }
    };

  } catch (error) {
    console.error('Error in quizNext:', error);
    const fallbackSeed = getSessionSeed(sessionId);
    const fallbackQ = selectAdaptiveQuestion(
      currentStageParam || 'SKILLS_ASSESSMENT',
      0,
      currentAnswers || {},
      fallbackSeed
    );
    return {
      question: fallbackQ.question,
      options: fallbackQ.options,
      stage: currentStageParam || 'SKILLS_ASSESSMENT',
      isComplete: false,
      progress: {
        currentQuestion: 1,
        totalQuestions: TOTAL_QUESTIONS,
        stageQuestion: 1,
        stageTotalQuestions: 5,
        currentStage: 1,
        totalStages: 5,
        percentage: 0,
      }
    };
  }
};


/**
 * Classify a career question into a domain
 * @param {string} question - Question to classify
 * @returns {Promise<string>} Classified domain
 */
const classifyDomain = async (question) => {
  try {
    const prompt = `Classify the following question into ONE of these career domains:
- WEB_DEVELOPMENT
- MOBILE_DEVELOPMENT
- DATA_SCIENCE
- ARTIFICIAL_INTELLIGENCE
- CLOUD_DEVOPS
- CYBERSECURITY
- PRODUCT_MANAGEMENT
- UI_UX_DESIGN
- OTHER

Question: "${question}"

Reply ONLY with the domain name, nothing else.`;

    const result = await chatWithAI(prompt, [], { taskType: 'classification' });
    const domain = (result.response || '').trim().toUpperCase().replace(/[^A-Z_]/g, '');
    const validDomains = [
      'WEB_DEVELOPMENT', 'MOBILE_DEVELOPMENT', 'DATA_SCIENCE',
      'ARTIFICIAL_INTELLIGENCE', 'CLOUD_DEVOPS', 'CYBERSECURITY',
      'PRODUCT_MANAGEMENT', 'UI_UX_DESIGN', 'OTHER'
    ];
    return validDomains.includes(domain) ? domain : 'OTHER';
  } catch (error) {
    console.error('Domain classification error:', error);
    return 'OTHER';
  }
};

module.exports = {
  classifyDomain,
  chatWithAI,
  generateCareerAdvisorResponse,
  getAvailableModels,
  selectBestModel,
  quizNext,
  models,
  STAGE_ORDER,
  QUESTIONS_PER_STAGE,
  TOTAL_QUESTIONS
};