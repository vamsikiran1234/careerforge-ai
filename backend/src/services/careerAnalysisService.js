const { OpenAI } = require('openai');
const Groq = require('groq-sdk');
const { withCache } = require('./cacheService');

// Initialize OmniRoute client if enabled
const omniroute = (process.env.USE_OMNIROUTE === 'true' || process.env.OMNIROUTE_API_KEY) ? new OpenAI({
  baseURL: process.env.OMNIROUTE_URL || 'http://localhost:20128/v1',
  apiKey: process.env.OMNIROUTE_API_KEY || 'omniroute-key',
  timeout: 3000, // 3-second timeout to prevent hanging when OmniRoute gateway is offline
  maxRetries: 0,
}) : null;

// Initialize Groq client
const groq = process.env.GROQ_API_KEY ? new Groq({
  apiKey: process.env.GROQ_API_KEY
}) : null;

/**
 * Get AI completion using OmniRoute (with Groq fallback)
 */
async function getAICompletion(messages, options = {}) {
  // Try OmniRoute first if enabled
  if (omniroute && process.env.USE_OMNIROUTE === 'true') {
    try {
      console.log('🤖 Using OmniRoute AI for analysis');
      const response = await omniroute.chat.completions.create({
        model: options.model || process.env.OMNIROUTE_MODEL || 'auto',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000
      });
      return response.choices[0].message.content;
    } catch (omniError) {
      console.warn('⚠️ OmniRoute analysis failed, attempting Groq fallback:', omniError.message);
      if (!groq) throw omniError;
    }
  }

  try {
    if (!groq) {
      throw new Error('No AI provider configured. Please check your OmniRoute or Groq API keys in .env');
    }

    console.log('🤖 Using Groq AI for analysis');
    const response = await groq.chat.completions.create({
      model: options.model || 'llama-3.3-70b-versatile',
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 2000
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('❌ AI completion error:', error.message);
    throw error;
  }
}

/**
 * Autonomous Career Analysis Fallback Builders
 */
function buildFallbackCareerAnalysis(currentRole, targetRole, yearsExperience = 0, timeframeMonths = 6) {
  const targetLower = (targetRole || '').toLowerCase();
  
  let keyRequirements = [
    "Core programming proficiency and clean software design patterns",
    "Hands-on expertise with target domain frameworks and toolchains",
    "Portfolio of deployed, production-grade applications with public code",
    "Effective technical communication and problem-solving methodology"
  ];
  let majorChallenges = [
    "Bridging conceptual theory with real-world production engineering practices",
    "Building portfolio credibility without prior direct commercial experience in this specific stack",
    "Navigating technical coding challenges and architectural interview rounds"
  ];
  let quickWins = [
    "Build and deploy a signature portfolio project with comprehensive documentation",
    "Establish a consistent daily technical practice routine targeting high-priority skill gaps",
    "Revamp your resume and GitHub profile to showcase measurable project impact"
  ];

  if (/ai|machine learning|deep learning|data scientist/i.test(targetLower)) {
    keyRequirements = [
      "Strong Python mastery, linear algebra, calculus, and probability foundations",
      "Proficiency in PyTorch or TensorFlow for training and fine-tuning neural architectures",
      "Hands-on experience with modern LLM workflows (Transformers, RAG, Vector DBs, LangChain/LlamaIndex)",
      "Production deployment and inference optimization using FastAPI, Docker, and ONNX/Quantization"
    ];
    majorChallenges = [
      "Keeping pace with rapidly evolving GenAI and LLM tooling",
      "Managing compute resources, memory limits, and inference latency under budget constraints",
      "Evaluating model hallucinations, drift, and accuracy with quantitative metrics"
    ];
    quickWins = [
      "Deploy an end-to-end RAG application with hybrid search, source citations, and a clean UI",
      "Fine-tune an open-source model using LoRA/QLoRA and document benchmark results",
      "Containerize an inference API with Docker and deploy to a cloud endpoint (Hugging Face / AWS)"
    ];
  } else if (/web|frontend|fullstack|react/i.test(targetLower)) {
    keyRequirements = [
      "Deep understanding of modern JavaScript (ES6+), TypeScript, and React / Next.js",
      "Experience with state management (TanStack Query, Zustand) and responsive CSS (Tailwind)",
      "RESTful and GraphQL API integration, server actions, and authentication workflows",
      "Testing (Vitest, React Testing Library, Playwright) and Core Web Vitals optimization"
    ];
    majorChallenges = [
      "Rapidly changing JavaScript tooling and meta-framework ecosystem",
      "Balancing client-side interactivity with server-rendered SEO and performance",
      "Managing state consistency and optimistic updates in complex multi-view apps"
    ];
    quickWins = [
      "Build a signature fullstack SaaS project with authentication and Stripe payments",
      "Convert existing vanilla JavaScript code to strict TypeScript with zero any types",
      "Audit Core Web Vitals using Chrome DevTools Lighthouse to achieve 90+ scores"
    ];
  } else if (/backend|systems|java|golang|\.net|microservice/i.test(targetLower)) {
    keyRequirements = [
      "Backend language mastery (Node.js/TypeScript, Java/Spring, Go, or Python/FastAPI)",
      "Advanced database engineering (PostgreSQL, schema design, indexing, transaction isolation)",
      "Distributed systems patterns: Redis caching, message queues (Kafka/RabbitMQ), and microservices",
      "API security: JWT, OAuth2, RBAC, input sanitization, and rate limiting"
    ];
    majorChallenges = [
      "Debugging race conditions, connection pool exhaustion, and memory leaks under load",
      "Designing resilient distributed transactions without causing database lock contention",
      "Balancing clean architecture separation with fast feature delivery"
    ];
    quickWins = [
      "Implement Redis caching on slow database endpoints with cache-invalidation strategies",
      "Containerize your backend service with multi-stage Dockerfiles and health checks",
      "Write comprehensive automated integration tests with high code coverage"
    ];
  } else if (/devops|cloud|sre/i.test(targetLower)) {
    keyRequirements = [
      "Linux administration, Bash scripting, and TCP/IP networking fundamentals",
      "Containerization with Docker and orchestration with Kubernetes (Pods, Services, Helm)",
      "Infrastructure as Code using Terraform and CI/CD automation with GitHub Actions",
      "Observability and monitoring with Prometheus, Grafana, and distributed tracing"
    ];
  }

  return {
    feasibility: (timeframeMonths >= 4) ? "HIGH" : "MEDIUM",
    successProbability: (timeframeMonths >= 6) ? 0.85 : 0.72,
    recommendedTimeframe: Math.max(timeframeMonths, 6),
    keyRequirements,
    majorChallenges,
    quickWins,
    suggestedAdjustments: [
      "Commit to 10-15 focused weekly hours of active hands-on building rather than passive video consumption",
      "Prioritize shipping 1 complete, polished, and tested application over starting multiple unfinished projects"
    ],
    marketDemand: "HIGH",
    salaryIncreasePotential: "35-50%",
    summary: `Targeting a transition from ${currentRole || 'current position'} to ${targetRole} is a high-viability trajectory with exceptional market demand. A structured milestone roadmap and hands-on project portfolio will ensure you stand out to top engineering teams.`
  };
}

function buildFallbackMilestones(currentRole, targetRole, timeframeMonths = 6) {
  const targetLower = (targetRole || '').toLowerCase();
  const startDate = new Date();
  const months = Math.max(timeframeMonths, 3);

  let milestoneBlueprints = [];

  if (/ai|machine learning|deep learning|data scientist/i.test(targetLower)) {
    milestoneBlueprints = [
      {
        title: "Python, Mathematics & Version Control Foundations",
        description: "Master advanced Python idioms, linear algebra, calculus, statistical distributions, and GitHub collaboration workflows.",
        category: "SKILL_DEVELOPMENT",
        priority: "HIGH",
        estimatedHours: 40,
        guidance: {
          actionSteps: ["Complete Python OOP and async modules", "Study 3Blue1Brown Linear Algebra series", "Build an automated data parsing script"],
          resources: ["Fast.ai Practical Deep Learning", "Khan Academy Linear Algebra", "Official Python Docs"],
          successCriteria: "Able to write clean, vectorized code and navigate git branching independently"
        }
      },
      {
        title: "Classical Machine Learning & Data Pipeline Mastery",
        description: "Build end-to-end data pipelines using Pandas, NumPy, and train supervised/unsupervised models using Scikit-Learn.",
        category: "SKILL_DEVELOPMENT",
        priority: "HIGH",
        estimatedHours: 45,
        guidance: {
          actionSteps: ["Perform EDA on 3 Kaggle datasets", "Train regression and classification models with cross-validation", "Evaluate precision, recall, and ROC-AUC"],
          resources: ["Hands-On Machine Learning (Aurélien Géron)", "Scikit-Learn Documentation"],
          successCriteria: "Predictive model pipeline benchmarked with zero data leakage"
        }
      },
      {
        title: "Deep Learning & Neural Architectures with PyTorch",
        description: "Deep dive into PyTorch tensors, autograd, custom neural network modules, transfer learning, and attention mechanisms.",
        category: "SKILL_DEVELOPMENT",
        priority: "HIGH",
        estimatedHours: 50,
        guidance: {
          actionSteps: ["Implement custom PyTorch Dataset and DataLoader", "Train a CNN classifier with transfer learning", "Build a text transformer model from scratch"],
          resources: ["PyTorch Official Tutorials", "Andrej Karpathy's Neural Networks Zero-to-Hero"],
          successCriteria: "Trained and evaluated a deep learning model with custom loss functions"
        }
      },
      {
        title: "Modern LLM Engineering & Production RAG System",
        description: "Architect and implement an enterprise-grade Retrieval-Augmented Generation (RAG) system with hybrid search and vector databases.",
        category: "PROJECT",
        priority: "HIGH",
        estimatedHours: 55,
        guidance: {
          actionSteps: ["Set up ChromaDB/Pinecone vector storage", "Implement hybrid dense/sparse search with reranking", "Build a clean web interface with FastAPI and React"],
          resources: ["LangChain & LlamaIndex Documentation", "Hugging Face NLP Course"],
          successCriteria: "Live RAG pipeline answering domain queries with source citations"
        }
      },
      {
        title: "MLOps, Containerization & Cloud Deployment",
        description: "Package the AI system into optimized Docker containers, build CI/CD pipelines, and deploy inference APIs to cloud infrastructure.",
        category: "PROJECT",
        priority: "HIGH",
        estimatedHours: 40,
        guidance: {
          actionSteps: ["Write multi-stage Dockerfiles optimized for GPU/CPU", "Set up GitHub Actions automated tests", "Deploy inference API on AWS or Hugging Face Spaces"],
          resources: ["Full Stack Deep Learning MLOps", "Docker Official Guides"],
          successCriteria: "Production API serving predictions with sub-200ms latency"
        }
      },
      {
        title: "Portfolio Polish, Technical Interviews & Job Applications",
        description: "Finalize GitHub documentation, polish resume with quantifiable achievements, practice LeetCode and System Design rounds.",
        category: "JOB_SEARCH",
        priority: "HIGH",
        estimatedHours: 35,
        guidance: {
          actionSteps: ["Write comprehensive READMEs with architecture diagrams", "Practice 50 essential coding patterns (LeetCode/NeetCode)", "Conduct mock behavioral and technical interviews"],
          resources: ["NeetCode 150", "Tech Interview Handbook"],
          successCriteria: "Submitting 10+ tailored applications weekly with a stellar portfolio"
        }
      }
    ];
  } else if (/web|frontend|fullstack|react/i.test(targetLower)) {
    milestoneBlueprints = [
      {
        title: "Modern TypeScript & Component Architecture",
        description: "Master TypeScript, React hooks, component modularity, and responsive Tailwind styling.",
        category: "SKILL_DEVELOPMENT",
        priority: "HIGH",
        estimatedHours: 40,
        guidance: {
          actionSteps: ["Refactor legacy JS projects to strict TypeScript", "Build reusable accessible UI components", "Master React Server Components"],
          resources: ["Total TypeScript", "React.dev"],
          successCriteria: "Zero type errors and clean modular component library"
        }
      },
      {
        title: "Full-Stack API & Database Integration",
        description: "Connect Next.js frontend with PostgreSQL via Prisma ORM and implement JWT/OAuth authentication.",
        category: "PROJECT",
        priority: "HIGH",
        estimatedHours: 45,
        guidance: {
          actionSteps: ["Design relational schemas and migrations", "Implement secure authentication workflows", "Build server actions with Zod validation"],
          resources: ["Prisma Docs", "Next.js App Router Documentation"],
          successCriteria: "Full-stack CRUD workflow operational with database persistence"
        }
      },
      {
        title: "State Management & Real-Time Performance",
        description: "Optimize client rendering with TanStack Query, Zustand, and implement WebSocket real-time updates.",
        category: "SKILL_DEVELOPMENT",
        priority: "HIGH",
        estimatedHours: 40,
        guidance: {
          actionSteps: ["Eliminate unnecessary re-renders using DevTools", "Implement optimistic mutations", "Add live WebSocket notifications"],
          resources: ["TanStack Query Documentation", "Web.dev Performance Guides"],
          successCriteria: "Lighthouse performance score exceeding 90 on all pages"
        }
      },
      {
        title: "Signature Full-Stack Production SaaS Project",
        description: "Architect and deploy an end-to-end web application with payment processing, role permissions, and user onboarding.",
        category: "PROJECT",
        priority: "HIGH",
        estimatedHours: 55,
        guidance: {
          actionSteps: ["Integrate Stripe subscription payments", "Implement automated email notifications", "Deploy to Vercel/Render with continuous delivery"],
          resources: ["Stripe Developer Docs", "Vercel Deployment Guides"],
          successCriteria: "Live web application actively handling real user accounts"
        }
      },
      {
        title: "Testing, Automated CI/CD & Career Readiness",
        description: "Write end-to-end Playwright tests, set up GitHub Actions CI, and prepare for frontend coding rounds.",
        category: "JOB_SEARCH",
        priority: "HIGH",
        estimatedHours: 35,
        guidance: {
          actionSteps: ["Write automated user journey tests", "Configure automated CI checks on PRs", "Practice JavaScript coding and DOM manipulation questions"],
          resources: ["Playwright Documentation", "GreatFrontEnd Interview Prep"],
          successCriteria: "Portfolio live with passing test suites and resume optimized"
        }
      }
    ];
  } else {
    milestoneBlueprints = [
      {
        title: "Core Language & Programming Foundations",
        description: `Strengthen core programming language fundamentals, data structures, and algorithms for ${targetRole}.`,
        category: "SKILL_DEVELOPMENT",
        priority: "HIGH",
        estimatedHours: 40,
        guidance: {
          actionSteps: ["Master language-specific idioms and best practices", "Practice data structure implementations", "Adopt version control git standards"],
          resources: ["Official Documentation", "FreeCodeCamp"],
          successCriteria: "Able to write clean, modular, and tested code independently"
        }
      },
      {
        title: "Domain Framework & Tooling Mastery",
        description: `Deep dive into essential industry frameworks, libraries, and architectural patterns required for ${targetRole}.`,
        category: "SKILL_DEVELOPMENT",
        priority: "HIGH",
        estimatedHours: 45,
        guidance: {
          actionSteps: ["Build 2 guided applications using primary domain frameworks", "Study industry design patterns", "Implement error handling and logging"],
          resources: ["Industry Documentation", "GitHub Reference Repositories"],
          successCriteria: "Proficient in primary domain toolchain without copy-pasting"
        }
      },
      {
        title: "Database Engineering & API Integration",
        description: "Design relational/document schemas, write optimized queries, and connect frontend/backend services.",
        category: "PROJECT",
        priority: "HIGH",
        estimatedHours: 45,
        guidance: {
          actionSteps: ["Design normalized database tables with indexes", "Build secure RESTful endpoints", "Implement automated data validation"],
          resources: ["PostgreSQL Tutorial", "REST API Design Guidelines"],
          successCriteria: "Complete database persistence layer verified under load"
        }
      },
      {
        title: "Signature Production-Grade Capstone Project",
        description: `Build and deploy an original signature application showcasing your ${targetRole} capabilities.`,
        category: "PROJECT",
        priority: "HIGH",
        estimatedHours: 55,
        guidance: {
          actionSteps: ["Draft product requirements and system architecture", "Implement core feature flows with automated tests", "Deploy to cloud infrastructure with a live URL"],
          resources: ["GitHub Actions Guides", "Cloud Deployment Docs"],
          successCriteria: "Fully functional live project deployed with public source code"
        }
      },
      {
        title: "Portfolio Deployment, Networking & Interview Preparation",
        description: "Polish GitHub portfolio, optimize resume for ATS keywords, and practice technical and behavioral interview rounds.",
        category: "JOB_SEARCH",
        priority: "HIGH",
        estimatedHours: 35,
        guidance: {
          actionSteps: ["Optimize resume bullet points using the Google XYZ formula", "Practice behavioral STAR stories", "Submit targeted job applications and connect with recruiters"],
          resources: ["Tech Interview Handbook", "LeetCode Essential Patterns"],
          successCriteria: "Active interviews scheduled with a standout engineering portfolio"
        }
      }
    ];
  }

  // Calculate proportional target dates
  const intervalMonths = months / milestoneBlueprints.length;
  return milestoneBlueprints.map((milestone, index) => {
    const targetDate = new Date(startDate);
    targetDate.setMonth(targetDate.getMonth() + Math.round(intervalMonths * (index + 1)));
    return {
      ...milestone,
      targetDate: targetDate.toISOString().split('T')[0]
    };
  });
}

function buildFallbackSkillGaps(currentRole, targetRole) {
  const targetLower = (targetRole || '').toLowerCase();

  if (/ai|machine learning|deep learning|data scientist/i.test(targetLower)) {
    return [
      {
        skillName: "Python & Advanced Scripting",
        category: "TECHNICAL",
        currentLevel: 4,
        targetLevel: 9,
        gap: 5,
        priority: "HIGH",
        estimatedWeeks: 4,
        learningStrategy: {
          approach: "Master OOP, generators, decorators, and asynchronous Python programming through hands-on project builds."
        }
      },
      {
        skillName: "PyTorch & Deep Learning",
        category: "TECHNICAL",
        currentLevel: 2,
        targetLevel: 8,
        gap: 6,
        priority: "HIGH",
        estimatedWeeks: 6,
        learningStrategy: {
          approach: "Build neural network architectures from scratch using PyTorch tensors, autograd, and custom DataLoader pipelines."
        }
      },
      {
        skillName: "Generative AI, Transformers & RAG",
        category: "TECHNICAL",
        currentLevel: 2,
        targetLevel: 8,
        gap: 6,
        priority: "HIGH",
        estimatedWeeks: 5,
        learningStrategy: {
          approach: "Implement retrieval-augmented generation with vector databases (Chroma/Pinecone), hybrid search, and LangChain/LlamaIndex."
        }
      },
      {
        skillName: "Classical Machine Learning (Scikit-Learn)",
        category: "TECHNICAL",
        currentLevel: 3,
        targetLevel: 8,
        gap: 5,
        priority: "HIGH",
        estimatedWeeks: 4,
        learningStrategy: {
          approach: "Train supervised and unsupervised algorithms, tune hyperparameters with cross-validation, and avoid data leakage."
        }
      },
      {
        skillName: "SQL & Data Pipeline Engineering",
        category: "TECHNICAL",
        currentLevel: 3,
        targetLevel: 7,
        gap: 4,
        priority: "MEDIUM",
        estimatedWeeks: 3,
        learningStrategy: {
          approach: "Write complex analytical SQL queries with Window functions, CTEs, and automated Pandas data transformations."
        }
      },
      {
        skillName: "FastAPI, Docker & Model Deployment",
        category: "TECHNICAL",
        currentLevel: 2,
        targetLevel: 7,
        gap: 5,
        priority: "MEDIUM",
        estimatedWeeks: 4,
        learningStrategy: {
          approach: "Package AI models into multi-stage Docker containers and serve low-latency inference endpoints via FastAPI."
        }
      }
    ];
  } else if (/web|frontend|fullstack|react/i.test(targetLower)) {
    return [
      {
        skillName: "TypeScript & Strict Type Systems",
        category: "TECHNICAL",
        currentLevel: 3,
        targetLevel: 9,
        gap: 6,
        priority: "HIGH",
        estimatedWeeks: 4,
        learningStrategy: {
          approach: "Master advanced generics, utility types, and compiler configurations in large-scale React codebases."
        }
      },
      {
        skillName: "React & Next.js App Router",
        category: "TECHNICAL",
        currentLevel: 4,
        targetLevel: 9,
        gap: 5,
        priority: "HIGH",
        estimatedWeeks: 5,
        learningStrategy: {
          approach: "Build modular components with React Server Components, Server Actions, and dynamic routing."
        }
      },
      {
        skillName: "State Management & Server Cache (TanStack Query)",
        category: "TECHNICAL",
        currentLevel: 3,
        targetLevel: 8,
        gap: 5,
        priority: "HIGH",
        estimatedWeeks: 3,
        learningStrategy: {
          approach: "Implement optimistic mutations, automated background refetching, and normalized client state with Zustand."
        }
      },
      {
        skillName: "PostgreSQL & Database Modeling (Prisma ORM)",
        category: "TECHNICAL",
        currentLevel: 3,
        targetLevel: 8,
        gap: 5,
        priority: "MEDIUM",
        estimatedWeeks: 4,
        learningStrategy: {
          approach: "Design relational database schemas, write migrations, and optimize queries with proper indexes."
        }
      },
      {
        skillName: "Automated Testing & Web Performance (Playwright)",
        category: "TECHNICAL",
        currentLevel: 2,
        targetLevel: 7,
        gap: 5,
        priority: "MEDIUM",
        estimatedWeeks: 3,
        learningStrategy: {
          approach: "Write unit and end-to-end integration tests, audit Core Web Vitals, and eliminate client bundle bloat."
        }
      }
    ];
  } else {
    return [
      {
        skillName: "Core Programming Language Mastery",
        category: "TECHNICAL",
        currentLevel: 4,
        targetLevel: 8,
        gap: 4,
        priority: "HIGH",
        estimatedWeeks: 4,
        learningStrategy: {
          approach: "Master language design patterns, memory management, and asynchronous control flows."
        }
      },
      {
        skillName: "System Architecture & API Design",
        category: "TECHNICAL",
        currentLevel: 3,
        targetLevel: 8,
        gap: 5,
        priority: "HIGH",
        estimatedWeeks: 5,
        learningStrategy: {
          approach: "Design clean RESTful/gRPC interfaces with separation of concerns and modular service layers."
        }
      },
      {
        skillName: "Database Engineering & Indexing",
        category: "TECHNICAL",
        currentLevel: 3,
        targetLevel: 7,
        gap: 4,
        priority: "MEDIUM",
        estimatedWeeks: 3,
        learningStrategy: {
          approach: "Write optimized SQL queries, manage transactions with ACID guarantees, and configure connection pools."
        }
      },
      {
        skillName: "Docker Containerization & CI/CD",
        category: "TECHNICAL",
        currentLevel: 2,
        targetLevel: 7,
        gap: 5,
        priority: "MEDIUM",
        estimatedWeeks: 3,
        learningStrategy: {
          approach: "Containerize applications with multi-stage Dockerfiles and automate tests using GitHub Actions."
        }
      }
    ];
  }
}

function buildFallbackLearningResources(skillsList = [], targetRole = '') {
  const targetLower = (targetRole || '').toLowerCase();

  if (/ai|machine learning|deep learning|data scientist/i.test(targetLower)) {
    return [
      {
        title: "Deep Learning Specialization by Andrew Ng",
        type: "COURSE",
        url: "https://www.coursera.org/specializations/deep-learning",
        platform: "Coursera",
        duration: "16 weeks",
        cost: 0,
        difficulty: "INTERMEDIATE",
        rating: 4.9,
        relevanceScore: 0.98,
        relatedSkills: ["Deep Learning", "PyTorch", "Neural Networks"]
      },
      {
        title: "Practical Deep Learning for Coders",
        type: "COURSE",
        url: "https://course.fast.ai",
        platform: "Fast.ai",
        duration: "8 weeks",
        cost: 0,
        difficulty: "BEGINNER",
        rating: 4.8,
        relevanceScore: 0.95,
        relatedSkills: ["Python", "PyTorch", "Computer Vision"]
      },
      {
        title: "Hugging Face NLP Course",
        type: "COURSE",
        url: "https://huggingface.co/learn/nlp-course",
        platform: "Hugging Face",
        duration: "6 weeks",
        cost: 0,
        difficulty: "INTERMEDIATE",
        rating: 4.9,
        relevanceScore: 0.96,
        relatedSkills: ["Transformers", "NLP", "LLMs"]
      },
      {
        title: "Generative AI with Large Language Models (AWS & DeepLearning.AI)",
        type: "COURSE",
        url: "https://www.coursera.org/learn/generative-ai-with-llms",
        platform: "Coursera",
        duration: "3 weeks",
        cost: 0,
        difficulty: "INTERMEDIATE",
        rating: 4.8,
        relevanceScore: 0.94,
        relatedSkills: ["RAG", "LLMs", "Fine-Tuning"]
      },
      {
        title: "Full Stack Deep Learning (Production MLOps)",
        type: "COURSE",
        url: "https://fullstackdeeplearning.com",
        platform: "Full Stack Deep Learning",
        duration: "5 weeks",
        cost: 0,
        difficulty: "ADVANCED",
        rating: 4.9,
        relevanceScore: 0.92,
        relatedSkills: ["FastAPI", "Docker", "MLOps"]
      }
    ];
  } else if (/web|frontend|fullstack|react/i.test(targetLower)) {
    return [
      {
        title: "The Full Stack Open (University of Helsinki)",
        type: "COURSE",
        url: "https://fullstackopen.com/en",
        platform: "University of Helsinki",
        duration: "12 weeks",
        cost: 0,
        difficulty: "INTERMEDIATE",
        rating: 4.9,
        relevanceScore: 0.97,
        relatedSkills: ["React", "TypeScript", "Node.js"]
      },
      {
        title: "Next.js Official Interactive Learning Course",
        type: "COURSE",
        url: "https://nextjs.org/learn",
        platform: "Next.js",
        duration: "2 weeks",
        cost: 0,
        difficulty: "BEGINNER",
        rating: 4.9,
        relevanceScore: 0.96,
        relatedSkills: ["Next.js", "React", "Server Components"]
      },
      {
        title: "Total TypeScript Essentials",
        type: "COURSE",
        url: "https://www.totaltypescript.com/tutorials",
        platform: "Total TypeScript",
        duration: "3 weeks",
        cost: 0,
        difficulty: "INTERMEDIATE",
        rating: 4.9,
        relevanceScore: 0.95,
        relatedSkills: ["TypeScript", "Generics"]
      },
      {
        title: "Prisma ORM & PostgreSQL Mastery",
        type: "ARTICLE",
        url: "https://www.prisma.io/docs/getting-started",
        platform: "Prisma",
        duration: "1 week",
        cost: 0,
        difficulty: "BEGINNER",
        rating: 4.8,
        relevanceScore: 0.91,
        relatedSkills: ["PostgreSQL", "Database Design"]
      }
    ];
  } else {
    return [
      {
        title: "CS50: Introduction to Computer Science (Harvard)",
        type: "COURSE",
        url: "https://cs50.harvard.edu/x",
        platform: "Harvard edX",
        duration: "10 weeks",
        cost: 0,
        difficulty: "BEGINNER",
        rating: 4.9,
        relevanceScore: 0.95,
        relatedSkills: ["Algorithms", "Data Structures", "C/Python"]
      },
      {
        title: "NeetCode 150 - Essential Coding Patterns",
        type: "PROJECT",
        url: "https://neetcode.io/practice",
        platform: "NeetCode",
        duration: "8 weeks",
        cost: 0,
        difficulty: "INTERMEDIATE",
        rating: 4.9,
        relevanceScore: 0.94,
        relatedSkills: ["Algorithms", "Problem Solving"]
      },
      {
        title: "Docker Curriculum: A Getting Started Guide",
        type: "TUTORIAL",
        url: "https://docker-curriculum.com",
        platform: "Docker Curriculum",
        duration: "1 week",
        cost: 0,
        difficulty: "BEGINNER",
        rating: 4.8,
        relevanceScore: 0.9,
        relatedSkills: ["Docker", "Containerization"]
      }
    ];
  }
}

/**
 * Analyze career path from current role to target role
 */
async function analyzeCareerPath({ currentRole, targetRole, yearsExperience, timeframeMonths }) {
  // Wrap with 30-minute cache (warm tier) - analysis results are stable
  return withCache(
    'career_analysis',
    'warm',
    { currentRole, targetRole, yearsExperience, timeframeMonths },
    async () => {
      const messages = [
        {
          role: 'system',
          content: `You are a career advisor AI for CareerForge platform. Analyze career transitions and provide actionable insights. Always respond in JSON format.`
        },
        {
          role: 'user',
          content: `Analyze this career transition:
- Current Role: ${currentRole}
- Target Role: ${targetRole}
- Years of Experience: ${yearsExperience}
- Target Timeframe: ${timeframeMonths} months

Provide a detailed analysis in JSON format with:
{
  "feasibility": "HIGH/MEDIUM/LOW",
  "successProbability": 0.0 to 1.0,
  "recommendedTimeframe": number (in months),
  "keyRequirements": ["req1", "req2", ...],
  "majorChallenges": ["challenge1", "challenge2", ...],
  "quickWins": ["win1", "win2", ...],
  "suggestedAdjustments": ["adjustment1", "adjustment2", ...],
  "marketDemand": "HIGH/MEDIUM/LOW",
  "salaryIncreasePotential": "percentage estimate",
  "summary": "brief overview"
}

Be realistic but encouraging. Focus on actionable insights.`
        }
      ];

      try {
        const response = await getAICompletion(messages);
        
        // Parse JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed && typeof parsed === 'object') {
            return parsed;
          }
        }
        
        return buildFallbackCareerAnalysis(currentRole, targetRole, yearsExperience, timeframeMonths);
      } catch (error) {
        console.warn('⚠️ Career path analysis AI failed, using intelligent fallback:', error.message);
        return buildFallbackCareerAnalysis(currentRole, targetRole, yearsExperience, timeframeMonths);
      }
    }
  );
}

/**
 * Generate milestones for career goal
 */
async function generateMilestones({ currentRole, targetRole, timeframeMonths, currentSkills = [] }) {
  // Wrap with 30-minute cache (warm tier)
  return withCache(
    'generate_milestones',
    'warm',
    { currentRole, targetRole, timeframeMonths, currentSkills: currentSkills.sort() },
    async () => {
      const messages = [
        {
          role: 'system',
          content: `You are a career advisor AI. Generate realistic, achievable milestones for career transitions. Always respond in JSON format.`
        },
        {
          role: 'user',
          content: `Generate 5-7 key milestones for this career journey:
- Current Role: ${currentRole}
- Target Role: ${targetRole}
- Timeframe: ${timeframeMonths} months
- Current Skills: ${currentSkills.join(', ') || 'Not specified'}

Return JSON array of milestones:
[
  {
    "title": "milestone title",
    "description": "detailed description",
    "category": "SKILL_DEVELOPMENT/NETWORKING/PROJECT/CERTIFICATION/JOB_SEARCH",
    "targetDate": "YYYY-MM-DD",
    "priority": "HIGH/MEDIUM/LOW",
    "estimatedHours": number,
    "guidance": {
      "actionSteps": ["step1", "step2"],
      "resources": ["resource1", "resource2"],
      "successCriteria": "how to know it's complete"
    }
  }
]

Make milestones specific, measurable, and time-bound. Distribute evenly across the timeframe.`
        }
      ];

      try {
        const response = await getAICompletion(messages);
        
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const milestones = JSON.parse(jsonMatch[0]);
          if (Array.isArray(milestones) && milestones.length > 0) {
            // Add calculated target dates based on timeframe
            const startDate = new Date();
            const intervalMonths = timeframeMonths / milestones.length;
            
            return milestones.map((milestone, index) => {
              const targetDate = new Date(startDate);
              targetDate.setMonth(targetDate.getMonth() + Math.round(intervalMonths * (index + 1)));
              
              return {
                ...milestone,
                targetDate: targetDate.toISOString().split('T')[0]
              };
            });
          }
        }
        
        return buildFallbackMilestones(currentRole, targetRole, timeframeMonths);
      } catch (error) {
        console.warn('⚠️ Milestone generation AI failed, using intelligent fallback:', error.message);
        return buildFallbackMilestones(currentRole, targetRole, timeframeMonths);
      }
    }
  );
}

/**
 * Identify skill gaps between current and target role
 */
async function identifySkillGaps({ currentRole, targetRole, currentSkills = [] }) {
  // Wrap with 30-minute cache (warm tier)
  return withCache(
    'skill_gaps',
    'warm',
    { currentRole, targetRole, currentSkills: currentSkills.sort() },
    async () => {
      const messages = [
        {
          role: 'system',
          content: `You are a career advisor AI specializing in skill assessment. Identify skill gaps for career transitions. Always respond in JSON format.`
        },
        {
          role: 'user',
          content: `Identify skill gaps for this transition:
- Current Role: ${currentRole}
- Target Role: ${targetRole}
- Current Skills: ${currentSkills.join(', ') || 'Not specified'}

Return JSON array of 5-10 most important skills:
[
  {
    "skillName": "skill name",
    "category": "TECHNICAL/SOFT_SKILL/DOMAIN_KNOWLEDGE",
    "currentLevel": 0-10,
    "targetLevel": 0-10,
    "priority": "HIGH/MEDIUM/LOW",
    "estimatedWeeks": number,
    "learningStrategy": {
      "approach": "recommended learning approach",
      "resources": ["resource1", "resource2"],
      "practiceIdeas": ["practice1", "practice2"]
    }
  }
]

Prioritize by importance for the target role. Be realistic about current levels.`
        }
      ];

      try {
        const response = await getAICompletion(messages);
        
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const gaps = JSON.parse(jsonMatch[0]);
          if (Array.isArray(gaps) && gaps.length > 0) {
            return gaps;
          }
        }
        
        return buildFallbackSkillGaps(currentRole, targetRole);
      } catch (error) {
        console.warn('⚠️ Skill gap identification AI failed, using intelligent fallback:', error.message);
        return buildFallbackSkillGaps(currentRole, targetRole);
      }
    }
  );
}

/**
 * Recommend learning resources for skills
 */
async function recommendLearningResources({ skills, targetRole, budget = 'free' }) {
  const skillsList = Array.isArray(skills) ? skills : [skills];
  
  // Wrap with cache to prevent duplicate resource lookups
  return withCache(
    'learning_resources',
    'warm', // 30-minute cache
    { skills: skillsList.sort(), targetRole, budget },
    async () => {
      // Define high-quality learning platforms with real URLs
      const platforms = {
    flutter: [
      {
        title: "Flutter Framework Tutorial",
        type: "COURSE",
        url: "https://flutter.dev/learn",
        platform: "Flutter Website",
        duration: "Self-paced",
        cost: 0,
        difficulty: "BEGINNER",
        rating: 9.5,
        relevanceScore: 1.0,
        relatedSkills: ['Flutter', 'Dart', 'Mobile Development']
      },
      {
        title: "Dart Programming Language Tutorial", 
        type: "COURSE",
        url: "https://dart.dev/tutorials",
        platform: "Dart Website",
        duration: "2-3 hours",
        cost: 0,
        difficulty: "BEGINNER",
        rating: 9.0,
        relevanceScore: 0.95,
        relatedSkills: ['Dart', 'Flutter', 'Programming']
      },
      {
        title: "Flutter Project: Todo List App",
        type: "PROJECT",
        url: "https://github.com/flutter/samples",
        platform: "GitHub",
        duration: "4-6 hours",
        cost: 0,
        difficulty: "INTERMEDIATE",
        rating: 8.5,
        relevanceScore: 0.9,
        relatedSkills: ['Flutter', 'Dart', 'Mobile Apps']
      },
      {
        title: "Flutter State Management",
        type: "COURSE",
        url: "https://www.youtube.com/watch?v=d_m5csmrf7I",
        platform: "YouTube",
        duration: "1 hour",
        cost: 0,
        difficulty: "INTERMEDIATE",
        rating: 9.0,
        relevanceScore: 0.85,
        relatedSkills: ['Flutter', 'State Management', 'Bloc']
      },
      {
        title: "Flutter Certification",
        type: "CERTIFICATION",
        url: "https://developers.google.com/certification",
        platform: "Google",
        duration: "Varies",
        cost: 0,
        difficulty: "ADVANCED",
        rating: 9.5,
        relevanceScore: 0.9,
        relatedSkills: ['Flutter', 'Mobile Development', 'Certification']
      }
    ],
    general: [
      {
        title: "Problem-Solving Strategies",
        type: "COURSE",
        url: "https://www.freecodecamp.org/learn",
        platform: "FreeCodeCamp",
        duration: "Self-paced",
        cost: 0,
        difficulty: "BEGINNER",
        rating: 9.0,
        relevanceScore: 0.8,
        relatedSkills: ['Problem Solving', 'Algorithms', 'Logic']
      },
      {
        title: "Adaptive Learning: How to Learn New Skills Quickly",
        type: "ARTICLE",
        url: "https://www.coursera.org/learn/learning-how-to-learn",
        platform: "Coursera",
        duration: "30 minutes",
        cost: 0,
        difficulty: "BEGINNER",
        rating: 8.5,
        relevanceScore: 0.75,
        relatedSkills: ['Learning', 'Meta-learning', 'Study Skills']
      },
      {
        title: "The Power of Continuous Learning",
        type: "ARTICLE",
        url: "https://www.linkedin.com/learning",
        platform: "LinkedIn",
        duration: "20 minutes",
        cost: 0,
        difficulty: "BEGINNER",
        rating: 8.0,
        relevanceScore: 0.7,
        relatedSkills: ['Professional Development', 'Career Growth']
      }
    ]
  };

  const messages = [
    {
      role: 'system',
      content: `You are a learning resource curator for career development. Recommend high-quality, relevant learning resources with REAL, WORKING URLs. Always respond in JSON format.`
    },
    {
      role: 'user',
      content: `Recommend learning resources for:
- Skills to learn: ${skillsList.join(', ')}
- Target Role: ${targetRole}
- Budget Preference: ${budget}

Return JSON array of 3-5 resources per skill (max 20 total):
[
  {
    "title": "resource title",
    "type": "COURSE/BOOK/ARTICLE/VIDEO/PROJECT/CERTIFICATION",
    "url": "MUST be a real, working URL - use these platforms: https://www.udemy.com, https://www.coursera.org, https://www.youtube.com, https://github.com, https://www.freecodecamp.org, https://www.linkedin.com/learning, https://flutter.dev, https://dart.dev",
    "platform": "platform name (Udemy, Coursera, YouTube, GitHub, etc.)",
    "duration": "time estimate",
    "cost": 0 or price,
    "difficulty": "BEGINNER/INTERMEDIATE/ADVANCED",
    "rating": 7-10 (realistic ratings only),
    "relevanceScore": 0.7-1.0,
    "relatedSkills": ["skill1", "skill2", "skill3"]
  }
]

CRITICAL: Every URL must be a real, accessible URL. Do not use placeholder URLs or "Search: [query]". 
Prioritize free resources if budget is 'free'. Include mix of resource types.`
    }
  ];

  try {
    const response = await getAICompletion(messages);
    
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const resources = JSON.parse(jsonMatch[0]);
      
      // Validate and fix URLs
      return resources.map((resource, index) => {
        // Check if URL is valid
        if (!resource.url || !resource.url.startsWith('http') || resource.url.includes('Search:')) {
          // Use fallback resources based on skill
          const skillLower = skillsList[0]?.toLowerCase() || 'general';
          
          if (skillLower.includes('flutter') || skillLower.includes('dart')) {
            return platforms.flutter[index % platforms.flutter.length];
          }
          
          return platforms.general[index % platforms.general.length];
        }
        
        // Ensure relatedSkills exists
        if (!resource.relatedSkills) {
          resource.relatedSkills = skillsList.slice(0, 3);
        }
        
        return resource;
      });
    }
    
    // Fallback: return predefined resources
    return buildFallbackLearningResources(skillsList, targetRole);
    
  } catch (error) {
    console.warn('⚠️ Resource recommendation AI failed, using intelligent fallback:', error.message);
    return buildFallbackLearningResources(skillsList, targetRole);
  }
    } // End of withCache async function
  ); // End of withCache wrapper
}

/**
 * Provide career guidance for a milestone
 */
async function provideCareerGuidance({ milestone, goalContext }) {
  const messages = [
    {
      role: 'system',
      content: `You are a career coach providing specific guidance for achieving milestones. Be encouraging and practical.`
    },
    {
      role: 'user',
      content: `Provide guidance for this milestone:
- Milestone: ${milestone.title}
- Description: ${milestone.description || 'Not specified'}
- Goal Context: ${goalContext.currentRole} → ${goalContext.targetRole}
- Target Date: ${milestone.targetDate}

Give practical advice in JSON format:
{
  "motivationalMessage": "encouraging message",
  "actionPlan": ["step1", "step2", "step3"],
  "potentialObstacles": ["obstacle1", "obstacle2"],
  "overcomingStrategies": ["strategy1", "strategy2"],
  "successMetrics": ["metric1", "metric2"],
  "estimatedEffort": "time estimate",
  "proTips": ["tip1", "tip2"]
}

Be specific and actionable.`
    }
  ];

  try {
    const response = await getAICompletion(messages);
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return { motivationalMessage: response };
  } catch (error) {
    console.error('❌ Career guidance failed:', error);
    return {
      motivationalMessage: 'Stay focused on your goal and take it one step at a time!',
      actionPlan: []
    };
  }
}

/**
 * Get AI suggestions for improving an existing goal
 */
async function getGoalSuggestions(goal) {
  const completedMilestones = goal.milestones.filter(m => m.status === 'COMPLETED').length;
  const totalMilestones = goal.milestones.length;
  // Calculate progress rate for potential future use
  // const progressRate = totalMilestones > 0 ? completedMilestones / totalMilestones : 0;
  
  const messages = [
    {
      role: 'system',
      content: `You are a career advisor AI providing personalized suggestions for career goals. Always respond in JSON format.`
    },
    {
      role: 'user',
      content: `Analyze this career goal and provide suggestions:
- Current Role: ${goal.currentRole}
- Target Role: ${goal.targetRole}
- Timeframe: ${goal.timeframeMonths} months
- Progress: ${goal.progress}%
- Milestones: ${totalMilestones} (${completedMilestones} completed)
- Skills tracked: ${goal.skillGaps.length}
- Status: ${goal.status}

Provide suggestions in JSON format:
{
  "overallAssessment": "brief assessment of progress",
  "onTrack": true/false,
  "suggestedAdjustments": [
    {
      "type": "TIMELINE/MILESTONE/SKILL/FOCUS",
      "suggestion": "specific suggestion",
      "reason": "why this helps",
      "priority": "HIGH/MEDIUM/LOW"
    }
  ],
  "nextBestActions": ["action1", "action2", "action3"],
  "motivationalInsight": "encouraging message",
  "warningFlags": ["warning1", "warning2"] or [],
  "celebrationPoints": ["achievement1", "achievement2"] or []
}

Be honest but encouraging. Focus on actionable improvements.`
    }
  ];

  try {
    const response = await getAICompletion(messages);
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      overallAssessment: response,
      onTrack: true,
      suggestedAdjustments: [],
      nextBestActions: []
    };
  } catch (error) {
    console.error('❌ Goal suggestions failed:', error);
    return {
      overallAssessment: 'Keep making progress on your milestones!',
      onTrack: true,
      suggestedAdjustments: [],
      nextBestActions: []
    };
  }
}

/**
 * Generate complete trajectory with milestones, skills, and resources
 */
async function generateCompleteTrajectory(goal) {
  try {
    console.log('🤖 Starting complete trajectory generation...');
    
    // Step 1: Analyze career path
    let analysis;
    try {
      analysis = await analyzeCareerPath({
        currentRole: goal.currentRole,
        targetRole: goal.targetRole,
        yearsExperience: goal.yearsExperience || 0,
        timeframeMonths: goal.timeframeMonths
      });
    } catch (e) {
      console.warn('⚠️ analyzeCareerPath failed, falling back:', e.message);
      analysis = buildFallbackCareerAnalysis(goal.currentRole, goal.targetRole, goal.yearsExperience || 0, goal.timeframeMonths);
    }
    
    console.log('✅ Career path analyzed');
    
    // Step 2: Generate milestones
    let milestones;
    try {
      milestones = await generateMilestones({
        currentRole: goal.currentRole,
        targetRole: goal.targetRole,
        timeframeMonths: goal.timeframeMonths
      });
      if (!Array.isArray(milestones) || milestones.length === 0) {
        milestones = buildFallbackMilestones(goal.currentRole, goal.targetRole, goal.timeframeMonths);
      }
    } catch (e) {
      console.warn('⚠️ generateMilestones failed, falling back:', e.message);
      milestones = buildFallbackMilestones(goal.currentRole, goal.targetRole, goal.timeframeMonths);
    }
    
    console.log(`✅ Generated ${milestones.length} milestones`);
    
    // Step 3: Identify skill gaps
    let skillGaps;
    try {
      skillGaps = await identifySkillGaps({
        currentRole: goal.currentRole,
        targetRole: goal.targetRole
      });
      if (!Array.isArray(skillGaps) || skillGaps.length === 0) {
        skillGaps = buildFallbackSkillGaps(goal.currentRole, goal.targetRole);
      }
    } catch (e) {
      console.warn('⚠️ identifySkillGaps failed, falling back:', e.message);
      skillGaps = buildFallbackSkillGaps(goal.currentRole, goal.targetRole);
    }
    
    console.log(`✅ Identified ${skillGaps.length} skill gaps`);
    
    // Step 4: Recommend learning resources (for top 5 skills)
    const topSkills = (skillGaps || [])
      .filter(s => s.priority === 'HIGH')
      .slice(0, 5)
      .map(s => s.skillName);
    
    let learningResources = [];
    try {
      learningResources = await recommendLearningResources({
        skills: topSkills.length > 0 ? topSkills : ['Core Skills'],
        targetRole: goal.targetRole,
        budget: 'free'
      });
      if (!Array.isArray(learningResources) || learningResources.length === 0) {
        learningResources = buildFallbackLearningResources(topSkills, goal.targetRole);
      }
    } catch (e) {
      console.warn('⚠️ recommendLearningResources failed, falling back:', e.message);
      learningResources = buildFallbackLearningResources(topSkills, goal.targetRole);
    }
    
    console.log(`✅ Recommended ${learningResources.length} learning resources`);
    
    return {
      analysis,
      milestones,
      skillGaps,
      learningResources,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Complete trajectory generation failed, producing full fallback:', error);
    return {
      analysis: buildFallbackCareerAnalysis(goal.currentRole, goal.targetRole, goal.yearsExperience || 0, goal.timeframeMonths),
      milestones: buildFallbackMilestones(goal.currentRole, goal.targetRole, goal.timeframeMonths),
      skillGaps: buildFallbackSkillGaps(goal.currentRole, goal.targetRole),
      learningResources: buildFallbackLearningResources([], goal.targetRole),
      generatedAt: new Date().toISOString()
    };
  }
}

module.exports = {
  analyzeCareerPath,
  generateMilestones,
  identifySkillGaps,
  recommendLearningResources,
  provideCareerGuidance,
  getGoalSuggestions,
  generateCompleteTrajectory
};
