// Mock AI responses for development/testing when OpenAI quota is exhausted
const mockAIResponses = {
  careerAdvice: [
    "Great question! For data science, I'd recommend focusing on Python, SQL, and statistics. Start with libraries like pandas, numpy, and scikit-learn. Practice on datasets from Kaggle to build your portfolio.",
    
    "Frontend development is exciting! I suggest learning React or Vue.js, along with modern CSS frameworks. Build projects that showcase responsive design and API integration.",
    
    "To transition into AI/ML, start with mathematics (linear algebra, statistics), then Python programming. Take courses on machine learning fundamentals and work on projects that solve real problems.",
    
    "The job market for tech professionals is strong, especially in cloud computing, cybersecurity, and AI. Focus on building a strong portfolio and contributing to open source projects.",
    
    "For interview preparation, practice coding problems daily, understand system design basics, and prepare behavioral questions using the STAR method. Mock interviews help build confidence.",
  ],
  
  quizQuestions: {
    skillsAssessment: {
      question: "Which programming language are you most comfortable with?",
      options: ["Python", "JavaScript", "Java", "C++", "Other"],
      stage: "SKILLS_ASSESSMENT"
    },
    careerInterests: {
      question: "What type of technology work interests you most?",
      options: ["Web Development", "Data Science", "Mobile Apps", "AI/ML", "Cybersecurity"],
      stage: "CAREER_INTERESTS"
    }
  }
};

function getRandomResponse(category) {
  const responses = mockAIResponses[category];
  return responses[Math.floor(Math.random() * responses.length)];
}

function getMockQuizQuestion(stage) {
  const questions = mockAIResponses.quizQuestions;
  const questionKey = stage.toLowerCase().replace('_', '');
  
  if (questions[questionKey]) {
    return {
      question: questions[questionKey].question,
      options: questions[questionKey].options,
      stage: questions[questionKey].stage,
      isComplete: false
    };
  }
  
  // Fallback for completion
  return {
    isComplete: true,
    recommendations: {
      careerPath: "Technology Professional",
      skills: ["Programming", "Problem Solving", "Communication"],
      resources: ["Online courses", "Portfolio projects", "Networking"]
    }
  };
}

module.exports = {
  mockAIResponses,
  getRandomResponse,
  getMockQuizQuestion
};
