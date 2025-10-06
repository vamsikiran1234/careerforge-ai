/**
 * Intelligent Chat Title Generation System
 * Automatically generates meaningful titles for chat conversations
 */

export interface TitleGenerationOptions {
  maxLength?: number;
  fallbackPrefix?: string;
  useAI?: boolean;
}

/**
 * Generate a smart title from the first user message
 */
export const generateTitleFromMessage = (
  message: string, 
  options: TitleGenerationOptions = {}
): string => {
  const { maxLength = 45, fallbackPrefix = 'New Career Session' } = options;
  
  if (!message || message.trim().length === 0) {
    return `${fallbackPrefix}`;
  }

  // Clean and normalize the message
  let title = message.trim();
  
  // Remove common conversation starters
  title = title.replace(/^(hi|hello|hey|hi there|hello there|good morning|good afternoon|good evening),?\s*/i, '');
  title = title.replace(/^(can you|could you|please|would you|will you)\s+/i, '');
  title = title.replace(/^(help me|assist me|i need help|i want help)\s+(with|to|on)?\s*/i, '');
  title = title.replace(/^(i (would like|want|need) to)\s+/i, '');
  title = title.replace(/^(let's|let us)\s+/i, '');
  
  // Extract key topics from career-related questions
  const topicExtractions = [
    { pattern: /resume|cv|curriculum vitae/i, title: 'Resume Review & Enhancement' },
    { pattern: /interview\s*(prep|preparation|practice|questions)/i, title: 'Interview Preparation' },
    { pattern: /salary\s*(negotiation|negotiating|discussion)/i, title: 'Salary Negotiation Strategy' },
    { pattern: /job\s*(search|hunt|hunting|application|applications)/i, title: 'Job Search Optimization' },
    { pattern: /career\s*(change|transition|switch|pivot)/i, title: 'Career Transition Planning' },
    { pattern: /linkedin\s*(profile|optimization|strategy)/i, title: 'LinkedIn Profile Optimization' },
    { pattern: /networking\s*(strategy|tips|advice)/i, title: 'Professional Networking' },
    { pattern: /skills?\s*(development|building|improvement|gap)/i, title: 'Skill Development Strategy' },
    { pattern: /portfolio\s*(building|creation|review)/i, title: 'Portfolio Development' },
    { pattern: /personal\s*brand/i, title: 'Personal Branding Strategy' },
    { pattern: /cover\s*letter/i, title: 'Cover Letter Optimization' },
    { pattern: /promotion\s*(strategy|path|planning)/i, title: 'Career Advancement Planning' },
    { pattern: /work.?life\s*balance/i, title: 'Work-Life Balance Optimization' },
    { pattern: /remote\s*work/i, title: 'Remote Work Strategy' },
    { pattern: /startup\s*(career|job|opportunity)/i, title: 'Startup Career Guidance' },
    { pattern: /freelanc(e|ing)/i, title: 'Freelancing Career Path' },
    { pattern: /leadership\s*(development|skills)/i, title: 'Leadership Development' },
    { pattern: /industry\s*(insights|analysis|trends)/i, title: 'Industry Career Insights' },
    { pattern: /career\s*(goals|planning|roadmap)/i, title: 'Career Planning & Goals' },
  ];
  
  // Check for specific career topics
  for (const { pattern, title: topicTitle } of topicExtractions) {
    if (pattern.test(title)) {
      return topicTitle;
    }
  }
  
  // Clean up remaining question words and extract key phrases
  title = title.replace(/^(what|how|why|when|where|which|who)\s+(is|are|can|should|would|do|does|did)\s*/i, '');
  title = title.replace(/^(tell me about|explain|describe|discuss)\s+/i, '');
  
  // Extract meaningful keywords for title generation
  const meaningfulWords = title
    .split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => !isStopWord(word.toLowerCase()))
    .slice(0, 6); // Take first 6 meaningful words
  
  if (meaningfulWords.length > 0) {
    title = meaningfulWords.join(' ');
    title = toTitleCase(title);
    
    // Truncate if too long
    if (title.length > maxLength) {
      title = title.substring(0, maxLength - 3).trim() + '...';
    }
    
    // Ensure it ends properly
    title = title.replace(/[.!?]+$/, '');
    
    return title;
  }
  
  return `${fallbackPrefix}`;
};

/**
 * Generate title from conversation context (multiple messages)
 */
export const generateTitleFromConversation = (
  messages: Array<{ role: string; content: string }>,
  options: TitleGenerationOptions = {}
): string => {
  const { maxLength = 45 } = options;
  
  // Find the first substantial user message
  const firstUserMessage = messages.find(
    msg => msg.role === 'user' && msg.content.trim().length > 10
  );
  
  if (firstUserMessage) {
    return generateTitleFromMessage(firstUserMessage.content, options);
  }
  
  // Analyze conversation themes if no good first message
  const userMessages = messages
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content.toLowerCase());
  
  const themes = detectConversationThemes(userMessages);
  
  if (themes.length > 0) {
    return themes[0].substring(0, maxLength);
  }
  
  // Analyze AI responses for context clues
  const aiMessages = messages
    .filter(msg => msg.role === 'assistant')
    .map(msg => msg.content.toLowerCase());
  
  const aiThemes = detectConversationThemes(aiMessages);
  
  if (aiThemes.length > 0) {
    return `${aiThemes[0]} Discussion`.substring(0, maxLength);
  }
  
  return 'New Career Session';
};

/**
 * Detect themes from conversation content
 */
const detectConversationThemes = (messages: string[]): string[] => {
  const themes: string[] = [];
  const content = messages.join(' ').toLowerCase();
  
  // Enhanced career-specific theme detection
  const themePatterns = [
    { pattern: /resume|cv|curriculum vitae|resume review/i, theme: 'Resume Optimization' },
    { pattern: /interview\s*(prep|preparation|practice|questions|tips|advice)/i, theme: 'Interview Preparation' },
    { pattern: /salary\s*(negotiation|negotiating|discussion|increase|raise)/i, theme: 'Salary Negotiation' },
    { pattern: /job\s*(search|hunt|hunting|application|applications|board)/i, theme: 'Job Search Strategy' },
    { pattern: /career\s*(change|transition|switch|pivot|shift)/i, theme: 'Career Transition' },
    { pattern: /linkedin\s*(profile|optimization|strategy|networking)/i, theme: 'LinkedIn Strategy' },
    { pattern: /networking\s*(strategy|tips|advice|events|professional)/i, theme: 'Professional Networking' },
    { pattern: /skills?\s*(development|building|improvement|gap|assessment)/i, theme: 'Skill Development' },
    { pattern: /portfolio\s*(building|creation|review|development|website)/i, theme: 'Portfolio Development' },
    { pattern: /personal\s*brand(ing)?/i, theme: 'Personal Branding' },
    { pattern: /cover\s*letter\s*(writing|tips|examples)/i, theme: 'Cover Letter Writing' },
    { pattern: /promotion\s*(strategy|path|planning|opportunities)/i, theme: 'Career Advancement' },
    { pattern: /work.?life\s*balance/i, theme: 'Work-Life Balance' },
    { pattern: /remote\s*work\s*(opportunities|jobs|transition)/i, theme: 'Remote Work Strategy' },
    { pattern: /startup\s*(career|job|opportunity|culture)/i, theme: 'Startup Careers' },
    { pattern: /freelanc(e|ing)\s*(career|transition|tips)/i, theme: 'Freelancing Career' },
    { pattern: /leadership\s*(development|skills|training|style)/i, theme: 'Leadership Development' },
    { pattern: /industry\s*(insights|analysis|trends|research)/i, theme: 'Industry Analysis' },
    { pattern: /career\s*(goals|planning|roadmap|path)/i, theme: 'Career Planning' },
    { pattern: /education\s*(planning|degree|certification|courses)/i, theme: 'Education Strategy' },
    { pattern: /job\s*(market|trends|outlook|prospects)/i, theme: 'Job Market Analysis' },
    { pattern: /soft\s*skills\s*(development|importance|training)/i, theme: 'Soft Skills Development' },
    { pattern: /technical\s*skills\s*(development|learning|upgrading)/i, theme: 'Technical Skills' },
    { pattern: /career\s*(coach|coaching|mentorship|guidance)/i, theme: 'Career Coaching' },
    { pattern: /workplace\s*(culture|environment|dynamics)/i, theme: 'Workplace Culture' },
    { pattern: /professional\s*(development|growth|improvement)/i, theme: 'Professional Development' },
    { pattern: /job\s*(satisfaction|fulfillment|happiness)/i, theme: 'Job Satisfaction' },
    { pattern: /career\s*(assessment|evaluation|review)/i, theme: 'Career Assessment' },
    { pattern: /education|degree|certification|course/i, theme: 'Education Planning' },
    { pattern: /freelance|consulting|contractor/i, theme: 'Freelancing Guidance' },
  ];
  
  for (const { pattern, theme } of themePatterns) {
    if (pattern.test(content)) {
      themes.push(theme);
    }
  }
  
  return themes;
};

/**
 * Check if a word is a stop word (common words to filter out)
 */
const isStopWord = (word: string): boolean => {
  const stopWords = [
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has',
    'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was',
    'were', 'will', 'with', 'the', 'this', 'but', 'they', 'have', 'had',
    'what', 'said', 'each', 'which', 'she', 'do', 'how', 'their', 'if',
    'up', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her',
    'would', 'make', 'like', 'into', 'him', 'time', 'two', 'more', 'very',
    'after', 'words', 'first', 'been', 'who', 'oil', 'sit', 'now', 'find',
    'long', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part'
  ];
  
  return stopWords.includes(word.toLowerCase());
};

/**
 * Convert string to title case
 */
const toTitleCase = (str: string): string => {
  const articles = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'of', 'in', 'with'];
  
  return str
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      // Always capitalize first and last words
      if (index === 0 || index === str.split(' ').length - 1) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      // Don't capitalize articles unless they're the first word
      if (articles.includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

/**
 * Generate title using AI service (for advanced cases)
 */
export const generateTitleWithAI = async (
  messages: Array<{ role: string; content: string }>,
  options: TitleGenerationOptions = {}
): Promise<string> => {
  const { maxLength = 50 } = options;
  
  try {
    // Prepare conversation context for AI
    const context = messages
      .slice(0, 4) // Use first few messages for context
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
    
    const response = await fetch('/api/v1/chat/generate-title', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({
        context,
        maxLength,
      }),
    });
    
    if (response.ok) {
      const { title } = await response.json();
      return title || generateTitleFromConversation(messages, options);
    }
  } catch (error) {
    console.warn('AI title generation failed, using fallback:', error);
  }
  
  // Fallback to rule-based generation
  return generateTitleFromConversation(messages, options);
};

/**
 * Smart title updater - updates title as conversation progresses
 */
export const shouldUpdateTitle = (
  currentTitle: string,
  messageCount: number
): boolean => {
  // Update if it's still the default title
  if (currentTitle === 'New Chat' || currentTitle === 'New Career Session') {
    return true;
  }
  
  // Update if title contains date (old default format)
  if (currentTitle.includes('/') || (currentTitle.includes('-') && currentTitle.includes('20'))) {
    return true;
  }
  
  // Update after 2-3 messages when we have more context for better titling
  if (messageCount === 3 && currentTitle.length < 15) {
    return true;
  }
  
  return false;
};

export default {
  generateTitleFromMessage,
  generateTitleFromConversation,
  generateTitleWithAI,
  shouldUpdateTitle,
};