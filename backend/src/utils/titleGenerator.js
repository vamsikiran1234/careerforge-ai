/**
 * Generate intelligent, concise titles from user messages
 * Mimics the frontend titleGenerator logic
 */

const generateTitleFromMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return 'New Career Session';
  }

  const text = message.trim().toLowerCase();

  // Career-specific keyword patterns
  const patterns = {
    'resume': ['Resume Review', 'Resume Optimization'],
    'cv': ['CV Review', 'CV Enhancement'],
    'interview': ['Interview Prep', 'Interview Practice'],
    'salary': ['Salary Negotiation', 'Compensation Discussion'],
    'job search': ['Job Search Strategy', 'Job Hunt Planning'],
    'career goal': ['Career Goals', 'Career Planning'],
    'skill': ['Skill Development', 'Skills Assessment'],
    'linkedin': ['LinkedIn Profile', 'Professional Networking'],
    'networking': ['Professional Networking', 'Network Building'],
    'cover letter': ['Cover Letter Review', 'Application Materials'],
    'portfolio': ['Portfolio Review', 'Portfolio Development'],
    'career change': ['Career Transition', 'Career Change Planning'],
    'promotion': ['Career Advancement', 'Promotion Strategy'],
    'leadership': ['Leadership Development', 'Management Skills'],
    'mentor': ['Mentorship Guidance', 'Career Mentoring'],
  };

  // Check for keyword matches
  for (const [keyword, titles] of Object.entries(patterns)) {
    if (text.includes(keyword)) {
      return titles[0];
    }
  }

  // Extract key action words for title generation
  const actionWords = {
    'help': 'Career Assistance',
    'need': 'Career Support',
    'want': 'Career Goals',
    'looking': 'Career Search',
    'seeking': 'Career Guidance',
    'prepare': 'Career Preparation',
    'improve': 'Career Development',
    'learn': 'Skill Learning',
    'develop': 'Professional Development',
    'achieve': 'Goal Achievement',
    'transition': 'Career Transition',
    'advance': 'Career Advancement',
  };

  for (const [word, title] of Object.entries(actionWords)) {
    if (text.includes(word)) {
      return title;
    }
  }

  // Fallback: Use first meaningful words (max 4 words)
  const words = message
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 2)
    .slice(0, 4);

  if (words.length > 0) {
    const title = words.join(' ');
    // Capitalize first letter of each word
    return title
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  return 'New Career Session';
};

module.exports = { generateTitleFromMessage };
