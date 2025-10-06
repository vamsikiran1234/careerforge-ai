export interface SlashCommand {
  id: string;
  command: string;
  title: string;
  description: string;
  category: 'career' | 'resume' | 'interview' | 'salary' | 'skills' | 'networking' | 'general';
  prompt: string;
  icon: string;
  keywords: string[];
}

export const slashCommands: SlashCommand[] = [
  // Resume Commands
  {
    id: 'resume-review',
    command: '/resume',
    title: 'Resume Review',
    description: 'Get comprehensive feedback on your resume',
    category: 'resume',
    prompt: "I'd like you to review my resume comprehensively. Please analyze the structure, content quality, formatting, and provide specific suggestions for improvement.",
    icon: '📄',
    keywords: ['resume', 'cv', 'review', 'feedback', 'optimize']
  },
  {
    id: 'resume-ats',
    command: '/ats',
    title: 'ATS Optimization',
    description: 'Optimize resume for Applicant Tracking Systems',
    category: 'resume',
    prompt: "Help me optimize my resume for Applicant Tracking Systems (ATS). I want to ensure it passes automated screening while maintaining readability for human reviewers.",
    icon: '🤖',
    keywords: ['ats', 'applicant', 'tracking', 'system', 'keywords', 'optimize']
  },
  {
    id: 'resume-rewrite',
    command: '/rewrite',
    title: 'Resume Rewrite',
    description: 'Completely rewrite sections of your resume',
    category: 'resume',
    prompt: "Please help me rewrite specific sections of my resume to make them more impactful and aligned with my target role. I'll share the sections that need improvement.",
    icon: '✏️',
    keywords: ['rewrite', 'improve', 'enhance', 'revise', 'update']
  },

  // Interview Commands
  {
    id: 'interview-prep',
    command: '/interview',
    title: 'Interview Preparation',
    description: 'Prepare for upcoming interviews with practice questions',
    category: 'interview',
    prompt: "I have an upcoming interview and need help preparing. Let's practice common interview questions and develop strong responses using the STAR method.",
    icon: '🎯',
    keywords: ['interview', 'preparation', 'practice', 'questions', 'behavioral']
  },
  {
    id: 'behavioral-prep',
    command: '/behavioral',
    title: 'Behavioral Questions',
    description: 'Practice behavioral interview questions',
    category: 'interview',
    prompt: "Let's practice behavioral interview questions using the STAR method (Situation, Task, Action, Result). Help me prepare compelling stories from my experience.",
    icon: '🗣️',
    keywords: ['behavioral', 'star', 'method', 'stories', 'experience']
  },
  {
    id: 'technical-prep',
    command: '/technical',
    title: 'Technical Interview',
    description: 'Prepare for technical interviews and coding challenges',
    category: 'interview',
    prompt: "I'm preparing for technical interviews and need help with coding challenges, system design questions, and technical problem-solving strategies.",
    icon: '💻',
    keywords: ['technical', 'coding', 'programming', 'system', 'design']
  },

  // Salary Commands
  {
    id: 'salary-research',
    command: '/salary',
    title: 'Salary Research',
    description: 'Research market rates and salary benchmarking',
    category: 'salary',
    prompt: "I need help researching and benchmarking salary for my role and location. Help me understand market rates and build a strong case for my salary expectations.",
    icon: '💰',
    keywords: ['salary', 'compensation', 'research', 'benchmark', 'market']
  },
  {
    id: 'negotiate',
    command: '/negotiate',
    title: 'Salary Negotiation',
    description: 'Learn negotiation strategies and practice scripts',
    category: 'salary',
    prompt: "I need help with salary negotiation tactics and want to practice conversation scripts for discussing compensation with my employer or potential employer.",
    icon: '🤝',
    keywords: ['negotiate', 'negotiation', 'tactics', 'scripts', 'offer']
  },
  {
    id: 'promotion',
    command: '/promotion',
    title: 'Promotion Strategy',
    description: 'Build a case for promotion or raise',
    category: 'salary',
    prompt: "I want to build a strong case for a promotion or raise. Help me document my achievements, quantify my impact, and prepare a compelling presentation.",
    icon: '📈',
    keywords: ['promotion', 'raise', 'advancement', 'achievements', 'case']
  },

  // Career Development Commands
  {
    id: 'career-goals',
    command: '/goals',
    title: 'Career Goals',
    description: 'Set and plan your career objectives',
    category: 'career',
    prompt: "Help me set clear career goals and create a strategic plan to achieve them. I want to define my career vision and actionable steps.",
    icon: '🎯',
    keywords: ['goals', 'objectives', 'planning', 'vision', 'strategy']
  },
  {
    id: 'career-transition',
    command: '/transition',
    title: 'Career Transition',
    description: 'Plan a strategic career change',
    category: 'career',
    prompt: "I'm planning a career transition and need help creating a comprehensive plan with timeline, skill development, and actionable steps.",
    icon: '🚀',
    keywords: ['transition', 'career change', 'switch', 'pivot', 'plan']
  },
  {
    id: 'industry-switch',
    command: '/industry',
    title: 'Industry Switch',
    description: 'Navigate switching to a new industry',
    category: 'career',
    prompt: "I want to switch industries and need guidance on understanding the new landscape, identifying transferable skills, and planning my transition strategy.",
    icon: '🔀',
    keywords: ['industry', 'switch', 'change', 'transfer', 'sector']
  },

  // Skills Development Commands
  {
    id: 'skill-gap',
    command: '/skills',
    title: 'Skill Gap Analysis',
    description: 'Identify and address skill gaps',
    category: 'skills',
    prompt: "I want to advance in my career and need to identify skill gaps. Help me analyze what skills I need to develop and create a targeted learning plan.",
    icon: '🧠',
    keywords: ['skills', 'gap', 'analysis', 'learning', 'development']
  },
  {
    id: 'upskill',
    command: '/upskill',
    title: 'Upskilling Plan',
    description: 'Create a systematic learning strategy',
    category: 'skills',
    prompt: "Help me create a strategic upskilling plan to stay current in my field and learn new technologies or methodologies.",
    icon: '📚',
    keywords: ['upskill', 'learning', 'education', 'training', 'development']
  },
  {
    id: 'certifications',
    command: '/certs',
    title: 'Certification Guidance',
    description: 'Choose the right certifications for your career',
    category: 'skills',
    prompt: "I'm considering getting professional certifications to advance my career. Help me understand which certifications would be most valuable for my goals.",
    icon: '🏆',
    keywords: ['certification', 'credentials', 'professional', 'training', 'qualify']
  },

  // Networking Commands
  {
    id: 'networking',
    command: '/network',
    title: 'Networking Strategy',
    description: 'Build professional relationships effectively',
    category: 'networking',
    prompt: "I want to improve my professional networking and build meaningful relationships in my industry. Help me create a networking strategy that feels authentic.",
    icon: '🤝',
    keywords: ['networking', 'relationships', 'connections', 'professional', 'contacts']
  },
  {
    id: 'linkedin',
    command: '/linkedin',
    title: 'LinkedIn Optimization',
    description: 'Optimize your LinkedIn profile and strategy',
    category: 'networking',
    prompt: "Help me optimize my LinkedIn profile and develop a strategy for building my professional brand online to increase visibility and attract opportunities.",
    icon: '💼',
    keywords: ['linkedin', 'profile', 'optimization', 'brand', 'online presence']
  },

  // General Commands
  {
    id: 'help',
    command: '/help',
    title: 'Help & Commands',
    description: 'Show available commands and features',
    category: 'general',
    prompt: "Show me all available slash commands and explain how to use the different features of CareerForge AI to maximize my career development.",
    icon: '❓',
    keywords: ['help', 'commands', 'features', 'guide', 'tutorial']
  },
  {
    id: 'feedback',
    command: '/feedback',
    title: 'Provide Feedback',
    description: 'Share feedback about CareerForge AI',
    category: 'general',
    prompt: "I'd like to provide feedback about my experience with CareerForge AI. What aspects are working well and what could be improved?",
    icon: '💬',
    keywords: ['feedback', 'suggestions', 'improvement', 'experience', 'review']
  }
];

// Helper functions
export function getCommandsByCategory(category: SlashCommand['category']): SlashCommand[] {
  return slashCommands.filter(cmd => cmd.category === category);
}

export function searchCommands(query: string): SlashCommand[] {
  const lowercaseQuery = query.toLowerCase();
  return slashCommands.filter(cmd => 
    cmd.command.toLowerCase().includes(lowercaseQuery) ||
    cmd.title.toLowerCase().includes(lowercaseQuery) ||
    cmd.description.toLowerCase().includes(lowercaseQuery) ||
    cmd.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
  );
}

export function getCommandBySlash(commandText: string): SlashCommand | undefined {
  const cleanCommand = commandText.toLowerCase().trim();
  return slashCommands.find(cmd => cmd.command.toLowerCase() === cleanCommand);
}

// Keyboard shortcuts
export const keyboardShortcuts = [
  {
    key: 'Ctrl + Enter',
    description: 'Send message',
    action: 'send'
  },
  {
    key: 'Ctrl + N',
    description: 'New conversation',
    action: 'new-chat'
  },
  {
    key: 'Ctrl + K',
    description: 'Search conversations',
    action: 'search'
  },
  {
    key: 'Ctrl + T',
    description: 'Open templates',
    action: 'templates'
  },
  {
    key: 'Ctrl + E',
    description: 'Export conversations',
    action: 'export'
  },
  {
    key: 'Escape',
    description: 'Close dialogs',
    action: 'escape'
  },
  {
    key: '/',
    description: 'Start slash command',
    action: 'slash-command'
  }
] as const;