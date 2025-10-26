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

module.exports = {
  chatWithAI,
  getAvailableModels,
  selectBestModel,
  models
};