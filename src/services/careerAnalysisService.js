const OpenAI = require('openai');
const Groq = require('groq-sdk');
const { withCache } = require('./cacheService');

// Initialize AI clients
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

const groq = process.env.GROQ_API_KEY ? new Groq({
  apiKey: process.env.GROQ_API_KEY
}) : null;

// Use Groq for speed, fallback to OpenAI for quality
const AI_PROVIDER = process.env.AI_PROVIDER || 'groq';

/**
 * Get AI completion with fallback
 */
async function getAICompletion(messages, options = {}) {
  try {
    if (AI_PROVIDER === 'groq' && groq) {
      console.log('🤖 Using Groq for AI analysis');
      const response = await groq.chat.completions.create({
        model: options.model || 'llama-3.3-70b-versatile',  // Updated to supported model
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000
      });
      return response.choices[0].message.content;
    } else if (openai) {
      console.log('🤖 Using OpenAI for AI analysis');
      const response = await openai.chat.completions.create({
        model: options.model || 'gpt-4',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000
      });
      return response.choices[0].message.content;
    } else {
      throw new Error('No AI provider configured');
    }
  } catch (error) {
    console.error('❌ AI completion error:', error.message);
    
    // Try fallback provider
    if (AI_PROVIDER === 'groq' && openai) {
      console.log('🔄 Falling back to OpenAI');
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 2000
      });
      return response.choices[0].message.content;
    }
    
    throw error;
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
          return JSON.parse(jsonMatch[0]);
        }
        
        // Fallback if not JSON
        return {
          feasibility: 'MEDIUM',
          successProbability: 0.7,
          summary: response,
          keyRequirements: [],
          majorChallenges: [],
          quickWins: []
        };
      } catch (error) {
        console.error('❌ Career path analysis failed:', error);
        throw new Error('Failed to analyze career path');
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
        
        return [];
      } catch (error) {
        console.error('❌ Milestone generation failed:', error);
        return [];
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
          return JSON.parse(jsonMatch[0]);
        }
        
        return [];
      } catch (error) {
        console.error('❌ Skill gap identification failed:', error);
        return [];
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
    const skillLower = skillsList[0]?.toLowerCase() || 'general';
    if (skillLower.includes('flutter') || skillLower.includes('dart')) {
      return platforms.flutter;
    }
    return platforms.general;
    
  } catch (error) {
    console.error('❌ Resource recommendation failed:', error);
    // Return fallback resources instead of empty array
    return platforms.general;
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
    const analysis = await analyzeCareerPath({
      currentRole: goal.currentRole,
      targetRole: goal.targetRole,
      yearsExperience: goal.yearsExperience || 0,
      timeframeMonths: goal.timeframeMonths
    });
    
    console.log('✅ Career path analyzed');
    
    // Step 2: Generate milestones
    const milestones = await generateMilestones({
      currentRole: goal.currentRole,
      targetRole: goal.targetRole,
      timeframeMonths: goal.timeframeMonths
    });
    
    console.log(`✅ Generated ${milestones.length} milestones`);
    
    // Step 3: Identify skill gaps
    const skillGaps = await identifySkillGaps({
      currentRole: goal.currentRole,
      targetRole: goal.targetRole
    });
    
    console.log(`✅ Identified ${skillGaps.length} skill gaps`);
    
    // Step 4: Recommend learning resources (for top 5 skills)
    const topSkills = skillGaps
      .filter(s => s.priority === 'HIGH')
      .slice(0, 5)
      .map(s => s.skillName);
    
    const learningResources = topSkills.length > 0 
      ? await recommendLearningResources({
          skills: topSkills,
          targetRole: goal.targetRole,
          budget: 'free'
        })
      : [];
    
    console.log(`✅ Recommended ${learningResources.length} learning resources`);
    
    return {
      analysis,
      milestones,
      skillGaps,
      learningResources,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Complete trajectory generation failed:', error);
    throw new Error('Failed to generate complete trajectory');
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
