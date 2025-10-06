export interface CareerTemplate {
  id: string;
  title: string;
  category: 'resume' | 'interview' | 'salary' | 'career-transition' | 'skill-development' | 'networking';
  description: string;
  initialPrompt: string;
  followUpQuestions: string[];
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  tags: string[];
}

export const careerTemplates: CareerTemplate[] = [
  // Resume Templates
  {
    id: 'resume-review-comprehensive',
    title: 'Comprehensive Resume Review',
    category: 'resume',
    description: 'Get detailed feedback on your resume structure, content, and formatting with specific improvement recommendations.',
    initialPrompt: "I'd like you to review my resume comprehensively. Please analyze the structure, content quality, formatting, and provide specific suggestions for improvement. I'll share my resume details with you.",
    followUpQuestions: [
      "What are the strongest aspects of my resume?",
      "Which sections need the most improvement?",
      "How can I better highlight my achievements?",
      "Are there any red flags or gaps I should address?",
      "What keywords should I add for my target industry?"
    ],
    icon: '📄',
    difficulty: 'beginner',
    estimatedTime: '15-20 minutes',
    tags: ['resume', 'review', 'feedback', 'improvement']
  },
  {
    id: 'resume-ats-optimization',
    title: 'ATS Resume Optimization',
    category: 'resume',
    description: 'Optimize your resume to pass through Applicant Tracking Systems (ATS) and increase your chances of getting noticed.',
    initialPrompt: "Help me optimize my resume for Applicant Tracking Systems (ATS). I want to ensure it passes automated screening while maintaining readability for human reviewers. Please analyze my resume for ATS compatibility.",
    followUpQuestions: [
      "Which keywords am I missing for my target role?",
      "Is my formatting ATS-friendly?",
      "How should I structure my work experience for ATS?",
      "What file format should I use for applications?",
      "How can I quantify my achievements better?"
    ],
    icon: '🤖',
    difficulty: 'intermediate',
    estimatedTime: '20-25 minutes',
    tags: ['ATS', 'keywords', 'optimization', 'applicant-tracking']
  },
  {
    id: 'resume-career-change',
    title: 'Career Change Resume Strategy',
    category: 'resume',
    description: 'Craft a compelling resume for career transition, highlighting transferable skills and relevant experience.',
    initialPrompt: "I'm planning a career change and need help crafting a resume that showcases my transferable skills effectively. My current field is [CURRENT FIELD] and I want to transition to [TARGET FIELD]. Help me create a strategic resume approach.",
    followUpQuestions: [
      "Which of my current skills are most transferable?",
      "How should I address the career gap or change?",
      "What additional skills should I highlight or develop?",
      "How can I position my experience as relevant?",
      "Should I consider a functional or hybrid resume format?"
    ],
    icon: '🔄',
    difficulty: 'advanced',
    estimatedTime: '25-30 minutes',
    tags: ['career-change', 'transferable-skills', 'strategy', 'transition']
  },

  // Interview Templates
  {
    id: 'behavioral-interview-prep',
    title: 'Behavioral Interview Preparation',
    category: 'interview',
    description: 'Practice behavioral interview questions using the STAR method and prepare compelling stories from your experience.',
    initialPrompt: "I have an upcoming behavioral interview and need help preparing strong responses using the STAR method (Situation, Task, Action, Result). Let's practice common behavioral questions and develop compelling stories from my experience.",
    followUpQuestions: [
      "Can you give me more behavioral questions to practice?",
      "How can I improve my STAR method responses?",
      "What stories from my experience would be most compelling?",
      "How do I handle questions about failures or weaknesses?",
      "What questions should I ask the interviewer?"
    ],
    icon: '🎯',
    difficulty: 'intermediate',
    estimatedTime: '30-40 minutes',
    tags: ['behavioral', 'STAR-method', 'interview-prep', 'storytelling']
  },
  {
    id: 'technical-interview-strategy',
    title: 'Technical Interview Strategy',
    category: 'interview',
    description: 'Prepare for technical interviews with coding challenges, system design, and problem-solving strategies.',
    initialPrompt: "I'm preparing for technical interviews in [FIELD/ROLE] and need help with coding challenges, system design questions, and technical problem-solving strategies. What should I focus on?",
    followUpQuestions: [
      "What are the most common technical questions for my role?",
      "How should I approach coding challenges during interviews?",
      "Can you help me with system design interview prep?",
      "What's the best way to communicate my thought process?",
      "How do I handle questions I don't know the answer to?"
    ],
    icon: '💻',
    difficulty: 'advanced',
    estimatedTime: '45-60 minutes',
    tags: ['technical', 'coding', 'system-design', 'problem-solving']
  },
  {
    id: 'executive-interview-prep',
    title: 'Executive/Leadership Interview Prep',
    category: 'interview',
    description: 'Prepare for senior-level interviews focusing on leadership, strategic thinking, and executive presence.',
    initialPrompt: "I'm interviewing for an executive/senior leadership position and need help preparing for high-level strategic questions, leadership scenarios, and demonstrating executive presence. The role is [POSITION] at [COMPANY TYPE].",
    followUpQuestions: [
      "How do I demonstrate strategic thinking in interviews?",
      "What leadership scenarios should I prepare for?",
      "How can I show my impact on business outcomes?",
      "What questions show my executive-level thinking?",
      "How do I address challenges or failures at a senior level?"
    ],
    icon: '👔',
    difficulty: 'advanced',
    estimatedTime: '40-50 minutes',
    tags: ['executive', 'leadership', 'strategic-thinking', 'senior-level']
  },

  // Salary Negotiation Templates
  {
    id: 'salary-research-strategy',
    title: 'Salary Research & Benchmarking',
    category: 'salary',
    description: 'Learn how to research market rates and build a data-driven case for your salary expectations.',
    initialPrompt: "I need help researching and benchmarking salary for [ROLE] in [LOCATION/INDUSTRY]. Help me understand market rates and build a strong case for my salary expectations.",
    followUpQuestions: [
      "Where can I find reliable salary data?",
      "How do I account for location and industry differences?",
      "What factors beyond base salary should I consider?",
      "How do I benchmark my experience level?",
      "What questions should I ask about compensation packages?"
    ],
    icon: '🔍',
    difficulty: 'beginner',
    estimatedTime: '15-20 minutes',
    tags: ['salary-research', 'benchmarking', 'market-rates', 'compensation']
  },
  {
    id: 'negotiation-tactics',
    title: 'Salary Negotiation Tactics',
    category: 'salary',
    description: 'Master negotiation strategies and scripts for discussing salary increases, job offers, and benefits.',
    initialPrompt: "I have a [JOB OFFER / PERFORMANCE REVIEW / PROMOTION OPPORTUNITY] and need help with salary negotiation tactics. Help me prepare negotiation strategies and practice conversation scripts.",
    followUpQuestions: [
      "What's the best timing for salary negotiations?",
      "How do I handle counteroffers or rejections?",
      "What negotiation tactics work best?",
      "How do I negotiate non-salary benefits?",
      "What should I avoid saying during negotiations?"
    ],
    icon: '💰',
    difficulty: 'intermediate',
    estimatedTime: '25-30 minutes',
    tags: ['negotiation', 'tactics', 'scripts', 'offers']
  },
  {
    id: 'promotion-case-building',
    title: 'Building Your Promotion Case',
    category: 'salary',
    description: 'Create a compelling case for promotion or raise based on your achievements and market value.',
    initialPrompt: "I want to build a strong case for a promotion/raise in my current role. Help me document my achievements, quantify my impact, and prepare a compelling presentation for my manager.",
    followUpQuestions: [
      "How do I quantify my achievements effectively?",
      "What evidence makes the strongest case?",
      "How should I present my case to management?",
      "What's the best timing for promotion discussions?",
      "How do I handle objections or delays?"
    ],
    icon: '📈',
    difficulty: 'intermediate',
    estimatedTime: '30-35 minutes',
    tags: ['promotion', 'case-building', 'achievements', 'raise']
  },

  // Career Transition Templates
  {
    id: 'career-transition-planning',
    title: 'Strategic Career Transition Planning',
    category: 'career-transition',
    description: 'Create a comprehensive plan for changing careers, industries, or roles with actionable steps.',
    initialPrompt: "I'm planning a career transition from [CURRENT FIELD/ROLE] to [TARGET FIELD/ROLE]. Help me create a strategic plan with timeline, skill development, and actionable steps for making this transition successfully.",
    followUpQuestions: [
      "What skills do I need to develop for my target field?",
      "How can I gain relevant experience during the transition?",
      "What's a realistic timeline for this career change?",
      "How do I build a network in my target industry?",
      "What are the potential challenges and how can I address them?"
    ],
    icon: '🚀',
    difficulty: 'advanced',
    estimatedTime: '40-50 minutes',
    tags: ['career-change', 'transition-planning', 'strategy', 'timeline']
  },
  {
    id: 'industry-switch-guide',
    title: 'Industry Switching Strategy',
    category: 'career-transition',
    description: 'Navigate switching industries while leveraging your existing skills and experience.',
    initialPrompt: "I want to switch from [CURRENT INDUSTRY] to [TARGET INDUSTRY] while staying in a similar role. Help me understand the industry landscape, identify transferable skills, and plan my transition strategy.",
    followUpQuestions: [
      "What are the key differences between these industries?",
      "Which of my skills are most valuable in the target industry?",
      "How do I learn about the new industry quickly?",
      "What industry-specific knowledge should I develop?",
      "How do I position myself as a viable candidate?"
    ],
    icon: '🔀',
    difficulty: 'intermediate',
    estimatedTime: '35-40 minutes',
    tags: ['industry-switch', 'transferable-skills', 'market-analysis']
  },

  // Skill Development Templates
  {
    id: 'skill-gap-analysis',
    title: 'Personal Skill Gap Analysis',
    category: 'skill-development',
    description: 'Identify skill gaps and create a targeted learning plan for your career goals.',
    initialPrompt: "I want to advance to [TARGET ROLE/LEVEL] and need to identify my skill gaps. Help me analyze what skills I currently have, what I need to develop, and create a learning plan to bridge these gaps.",
    followUpQuestions: [
      "What are the most critical skills for my target role?",
      "Which skills should I prioritize first?",
      "What learning resources would be most effective?",
      "How can I practice and demonstrate these new skills?",
      "What's a realistic timeline for skill development?"
    ],
    icon: '🎯',
    difficulty: 'intermediate',
    estimatedTime: '25-30 minutes',
    tags: ['skill-gap', 'learning-plan', 'career-development', 'analysis']
  },
  {
    id: 'upskilling-strategy',
    title: 'Strategic Upskilling Plan',
    category: 'skill-development',
    description: 'Create a systematic approach to learning new technologies and staying current in your field.',
    initialPrompt: "I need to stay current and advance in [FIELD/TECHNOLOGY]. Help me create a strategic upskilling plan that balances learning new technologies with deepening existing expertise.",
    followUpQuestions: [
      "Which emerging technologies should I focus on?",
      "How do I balance breadth vs. depth in learning?",
      "What's the best way to stay updated with industry trends?",
      "How can I get hands-on experience with new technologies?",
      "How do I demonstrate my new skills to employers?"
    ],
    icon: '📚',
    difficulty: 'intermediate',
    estimatedTime: '30-35 minutes',
    tags: ['upskilling', 'technology', 'continuous-learning', 'strategy']
  },

  // Networking Templates
  {
    id: 'networking-strategy-plan',
    title: 'Professional Networking Strategy',
    category: 'networking',
    description: 'Build a systematic approach to professional networking and relationship building.',
    initialPrompt: "I want to improve my professional networking and build meaningful relationships in [INDUSTRY/FIELD]. Help me create a networking strategy that feels authentic and leads to valuable connections.",
    followUpQuestions: [
      "Where should I focus my networking efforts?",
      "How do I start conversations with new contacts?",
      "What's the best way to maintain professional relationships?",
      "How can I provide value to my network?",
      "What networking events or platforms should I use?"
    ],
    icon: '🤝',
    difficulty: 'beginner',
    estimatedTime: '20-25 minutes',
    tags: ['networking', 'relationship-building', 'professional-growth']
  },
  {
    id: 'linkedin-optimization',
    title: 'LinkedIn Profile & Strategy',
    category: 'networking',
    description: 'Optimize your LinkedIn presence and develop a content strategy for professional visibility.',
    initialPrompt: "Help me optimize my LinkedIn profile and develop a strategy for building my professional brand online. I want to increase my visibility and attract the right opportunities in [FIELD/INDUSTRY].",
    followUpQuestions: [
      "How can I make my LinkedIn headline more compelling?",
      "What should I include in my LinkedIn summary?",
      "How often should I post and what type of content?",
      "How do I engage effectively with others' content?",
      "What LinkedIn features should I be using more?"
    ],
    icon: '💼',
    difficulty: 'beginner',
    estimatedTime: '25-30 minutes',
    tags: ['LinkedIn', 'personal-brand', 'online-presence', 'content-strategy']
  }
];

// Template categories for easy filtering
export const templateCategories = {
  'resume': {
    label: 'Resume & Applications',
    description: 'Optimize your resume and application materials',
    color: 'blue'
  },
  'interview': {
    label: 'Interview Preparation',
    description: 'Ace your interviews with strategic preparation',
    color: 'green'
  },
  'salary': {
    label: 'Salary & Negotiation',
    description: 'Maximize your compensation and negotiate effectively',
    color: 'purple'
  },
  'career-transition': {
    label: 'Career Transitions',
    description: 'Navigate career changes and new opportunities',
    color: 'orange'
  },
  'skill-development': {
    label: 'Skill Development',
    description: 'Grow your expertise and stay competitive',
    color: 'teal'
  },
  'networking': {
    label: 'Networking & Branding',
    description: 'Build relationships and professional presence',
    color: 'indigo'
  }
} as const;

// Helper function to get templates by category
export function getTemplatesByCategory(category: CareerTemplate['category']): CareerTemplate[] {
  return careerTemplates.filter(template => template.category === category);
}

// Helper function to get template by ID
export function getTemplateById(id: string): CareerTemplate | undefined {
  return careerTemplates.find(template => template.id === id);
}

// Helper function to search templates
export function searchTemplates(query: string): CareerTemplate[] {
  const lowercaseQuery = query.toLowerCase();
  return careerTemplates.filter(template => 
    template.title.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}