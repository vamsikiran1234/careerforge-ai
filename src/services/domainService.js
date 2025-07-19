const aiService = require('../services/aiService');

const domainService = {
  // Classify question with detailed analysis
  classifyWithAnalysis: async (question) => {
    try {
      const startTime = Date.now();
      
      // Get AI classification
      const aiDomain = await aiService.classifyDomain(question);
      
      // Get fallback classification
      const fallbackDomain = classifyDomainFallback(question);
      
      // Calculate confidence
      const confidence = aiDomain === fallbackDomain ? 'high' : 
                        aiDomain !== 'OTHER' ? 'medium' : 'low';
      
      // Get domain information
      const domainInfo = getDomainInfo(aiDomain);
      
      const processingTime = Date.now() - startTime;
      
      return {
        classification: {
          domain: aiDomain,
          fallbackDomain,
          confidence,
          processingTime: `${processingTime}ms`,
        },
        domainInfo,
        analysis: {
          question: question.substring(0, 200) + (question.length > 200 ? '...' : ''),
          keywords: extractKeywords(question),
          length: question.length,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        classification: {
          domain: 'OTHER',
          fallbackDomain: 'OTHER',
          confidence: 'low',
          error: error.message,
        },
        domainInfo: getDomainInfo('OTHER'),
        analysis: {
          question: question.substring(0, 200) + (question.length > 200 ? '...' : ''),
          keywords: [],
          length: question.length,
          timestamp: new Date().toISOString(),
        },
      };
    }
  },

  // Batch classify multiple questions
  batchClassify: async (questions) => {
    const results = await Promise.allSettled(
      questions.map(async (question, index) => {
        const result = await domainService.classifyWithAnalysis(question);
        return { index, question, ...result };
      })
    );

    const successful = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    const failed = results
      .filter(result => result.status === 'rejected')
      .map((result, index) => ({ index, error: result.reason }));

    return {
      successful,
      failed,
      total: questions.length,
      successRate: `${Math.round((successful.length / questions.length) * 100)}%`,
    };
  },

  // Get domain statistics
  getDomainStatistics: () => {
    const domains = [
      'WEB_DEVELOPMENT', 'DATA_SCIENCE', 'MOBILE_DEVELOPMENT', 'DEVOPS',
      'CYBERSECURITY', 'AI_ML', 'BLOCKCHAIN', 'GAME_DEVELOPMENT',
      'UI_UX_DESIGN', 'PRODUCT_MANAGEMENT', 'FINANCE', 'MARKETING',
      'CONSULTING', 'ENTREPRENEURSHIP', 'OTHER'
    ];

    return domains.map(domain => ({
      domain,
      ...getDomainInfo(domain),
    }));
  },

  // Validate domain
  isValidDomain: (domain) => {
    const validDomains = [
      'WEB_DEVELOPMENT', 'DATA_SCIENCE', 'MOBILE_DEVELOPMENT', 'DEVOPS',
      'CYBERSECURITY', 'AI_ML', 'BLOCKCHAIN', 'GAME_DEVELOPMENT',
      'UI_UX_DESIGN', 'PRODUCT_MANAGEMENT', 'FINANCE', 'MARKETING',
      'CONSULTING', 'ENTREPRENEURSHIP', 'OTHER'
    ];
    return validDomains.includes(domain);
  },

  // Get related domains
  getRelatedDomains: (domain) => {
    const relationMap = {
      WEB_DEVELOPMENT: ['UI_UX_DESIGN', 'MOBILE_DEVELOPMENT', 'DEVOPS'],
      DATA_SCIENCE: ['AI_ML', 'WEB_DEVELOPMENT', 'FINANCE'],
      MOBILE_DEVELOPMENT: ['WEB_DEVELOPMENT', 'UI_UX_DESIGN', 'GAME_DEVELOPMENT'],
      DEVOPS: ['WEB_DEVELOPMENT', 'CYBERSECURITY', 'DATA_SCIENCE'],
      CYBERSECURITY: ['DEVOPS', 'BLOCKCHAIN', 'WEB_DEVELOPMENT'],
      AI_ML: ['DATA_SCIENCE', 'WEB_DEVELOPMENT', 'BLOCKCHAIN'],
      BLOCKCHAIN: ['WEB_DEVELOPMENT', 'CYBERSECURITY', 'AI_ML'],
      GAME_DEVELOPMENT: ['MOBILE_DEVELOPMENT', 'UI_UX_DESIGN', 'WEB_DEVELOPMENT'],
      UI_UX_DESIGN: ['WEB_DEVELOPMENT', 'MOBILE_DEVELOPMENT', 'PRODUCT_MANAGEMENT'],
      PRODUCT_MANAGEMENT: ['MARKETING', 'UI_UX_DESIGN', 'CONSULTING'],
      FINANCE: ['DATA_SCIENCE', 'CONSULTING', 'ENTREPRENEURSHIP'],
      MARKETING: ['PRODUCT_MANAGEMENT', 'UI_UX_DESIGN', 'ENTREPRENEURSHIP'],
      CONSULTING: ['PRODUCT_MANAGEMENT', 'FINANCE', 'ENTREPRENEURSHIP'],
      ENTREPRENEURSHIP: ['PRODUCT_MANAGEMENT', 'MARKETING', 'FINANCE'],
      OTHER: [],
    };

    return relationMap[domain] || [];
  },

  // Suggest career transition paths
  suggestTransitions: (fromDomain, interests = []) => {
    const transitionPaths = {
      WEB_DEVELOPMENT: {
        'Full-Stack to Mobile': 'MOBILE_DEVELOPMENT',
        'Frontend to UI/UX': 'UI_UX_DESIGN',
        'Backend to DevOps': 'DEVOPS',
        'Tech to Product': 'PRODUCT_MANAGEMENT',
      },
      DATA_SCIENCE: {
        'Data to AI/ML': 'AI_ML',
        'Analytics to Product': 'PRODUCT_MANAGEMENT',
        'Data to Finance': 'FINANCE',
        'Science to Consulting': 'CONSULTING',
      },
      UI_UX_DESIGN: {
        'Design to Frontend': 'WEB_DEVELOPMENT',
        'UX to Product': 'PRODUCT_MANAGEMENT',
        'Design to Mobile': 'MOBILE_DEVELOPMENT',
        'Creative to Marketing': 'MARKETING',
      },
      // Add more transition paths as needed
    };

    const paths = transitionPaths[fromDomain] || {};
    
    return Object.entries(paths).map(([path, toDomain]) => ({
      path,
      fromDomain,
      toDomain,
      domainInfo: getDomainInfo(toDomain),
      difficulty: calculateTransitionDifficulty(fromDomain, toDomain),
    }));
  },
};

// Helper functions
function extractKeywords(question) {
  const keywords = question
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 10);
  
  return [...new Set(keywords)]; // Remove duplicates
}

function classifyDomainFallback(question) {
  // This function is duplicated from aiService for standalone use
  const lowerQuestion = question.toLowerCase();
  
  const domainKeywords = {
    WEB_DEVELOPMENT: ['react', 'vue', 'angular', 'javascript', 'html', 'css', 'node.js', 'web'],
    DATA_SCIENCE: ['data', 'machine learning', 'python', 'analytics', 'statistics'],
    MOBILE_DEVELOPMENT: ['mobile', 'ios', 'android', 'swift', 'kotlin', 'app'],
    DEVOPS: ['devops', 'aws', 'cloud', 'docker', 'kubernetes', 'deployment'],
    CYBERSECURITY: ['security', 'hacking', 'cybersecurity', 'penetration'],
    AI_ML: ['ai', 'artificial intelligence', 'machine learning', 'neural'],
    BLOCKCHAIN: ['blockchain', 'crypto', 'ethereum', 'smart contracts'],
    GAME_DEVELOPMENT: ['game', 'unity', 'unreal', 'gaming'],
    UI_UX_DESIGN: ['design', 'ui', 'ux', 'figma', 'user interface'],
    PRODUCT_MANAGEMENT: ['product manager', 'product management', 'roadmap'],
    FINANCE: ['finance', 'financial', 'investment', 'banking'],
    MARKETING: ['marketing', 'seo', 'social media', 'digital marketing'],
    CONSULTING: ['consulting', 'consultant', 'strategy'],
    ENTREPRENEURSHIP: ['startup', 'entrepreneur', 'business'],
  };

  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    if (keywords.some(keyword => lowerQuestion.includes(keyword))) {
      return domain;
    }
  }

  return 'OTHER';
}

function getDomainInfo(domain) {
  const domainDetails = {
    WEB_DEVELOPMENT: {
      name: 'Web Development',
      description: 'Frontend, backend, and full-stack web development',
      icon: '🌐',
      averageSalary: '$70,000 - $150,000',
      growthRate: 'High',
    },
    DATA_SCIENCE: {
      name: 'Data Science',
      description: 'Data analysis, machine learning, and statistical modeling',
      icon: '📊',
      averageSalary: '$80,000 - $160,000',
      growthRate: 'Very High',
    },
    // Add other domains as needed...
    OTHER: {
      name: 'Other',
      description: 'General career guidance',
      icon: '❓',
      averageSalary: 'Variable',
      growthRate: 'Variable',
    },
  };

  return domainDetails[domain] || domainDetails.OTHER;
}

function calculateTransitionDifficulty(fromDomain, toDomain) {
  // Simple difficulty calculation - can be enhanced
  const relatedDomains = {
    WEB_DEVELOPMENT: ['UI_UX_DESIGN', 'MOBILE_DEVELOPMENT', 'DEVOPS'],
    DATA_SCIENCE: ['AI_ML', 'FINANCE'],
    // Add more relationships
  };

  if (fromDomain === toDomain) return 'Easy';
  if (relatedDomains[fromDomain]?.includes(toDomain)) return 'Medium';
  return 'Hard';
}

module.exports = domainService;
