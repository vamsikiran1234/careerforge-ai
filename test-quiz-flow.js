const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';
let authToken = '';
let quizSessionId = '';

// Test credentials - Using existing user (john@example.com)
// If this fails, create user: POST /api/v1/auth/register
const TEST_USER = {
  email: 'john@example.com',
  password: 'John@1234',
};

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}🔹 ${msg}${colors.reset}`),
  question: (msg) => console.log(`${colors.yellow}❓ ${msg}${colors.reset}`),
};

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      data,
    };
    return await axios(config);
  } catch (error) {
    if (error.response) {
      throw new Error(`${error.response.status}: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
};

// Test 1: Login
async function testLogin() {
  log.step('Step 1: Logging in...');
  try {
    const response = await makeRequest('POST', '/auth/login', TEST_USER);
    authToken = response.data.token;
    log.success(`Login successful! Token: ${authToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    log.error(`Login failed: ${error.message}`);
    return false;
  }
}

// Test 2: Start Quiz
async function testStartQuiz() {
  log.step('Step 2: Starting quiz assessment...');
  try {
    const response = await makeRequest('POST', '/quiz/start');
    quizSessionId = response.data.data.sessionId;
    const firstQuestion = response.data.data.question;
    
    log.success('Quiz started successfully!');
    log.info(`Session ID: ${quizSessionId}`);
    log.question(`First Question: ${firstQuestion.question}`);
    log.info(`Stage: ${firstQuestion.stage}`);
    log.info(`Options: ${JSON.stringify(firstQuestion.options, null, 2)}`);
    
    return { success: true, question: firstQuestion };
  } catch (error) {
    log.error(`Start quiz failed: ${error.message}`);
    return { success: false };
  }
}

// Test 3: Submit Multiple Answers
async function testSubmitAnswers() {
  log.step('Step 3: Submitting answers to test full quiz flow...');
  
  const testAnswers = [
    'JavaScript/TypeScript - intermediate level',
    'Fast-paced startup environment',
    'I prefer collaborative problem-solving',
    'Hands-on projects work best for me',
    'I want to become a full-stack developer',
  ];
  
  let questionCount = 1; // We already have question 1 from start
  let isComplete = false;
  
  for (let i = 0; i < testAnswers.length && !isComplete; i++) {
    try {
      log.step(`Submitting answer ${i + 1}: "${testAnswers[i]}"`);
      
      const response = await makeRequest('POST', `/quiz/${quizSessionId}/answer`, {
        answer: testAnswers[i],
      });
      
      questionCount++;
      isComplete = response.data.data.isComplete;
      
      if (isComplete) {
        log.success(`Quiz completed after ${questionCount} questions!`);
        log.info('Results received:');
        console.log(JSON.stringify(response.data.data.results, null, 2));
        break;
      } else {
        const nextQuestion = response.data.data.question;
        log.success(`Answer submitted! Next question received.`);
        log.question(`Question ${questionCount}: ${nextQuestion.question}`);
        log.info(`Stage: ${nextQuestion.stage}`);
        log.info(`Progress: ${response.data.data.progress?.percentage || 'N/A'}%`);
      }
      
      // Small delay between submissions
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      log.error(`Submit answer failed: ${error.message}`);
      return { success: false, questionCount, error: error.message };
    }
  }
  
  return { success: true, questionCount, isComplete };
}

// Test 4: Verify Quiz Was Not Prematurely Completed
async function verifyQuizFlow(result) {
  log.step('Step 4: Verifying quiz flow...');
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 QUIZ FLOW TEST RESULTS');
  console.log('='.repeat(60));
  
  if (result.questionCount < 3) {
    log.error(`BUG STILL EXISTS: Only ${result.questionCount} questions shown`);
    log.error('Expected: Multiple questions across 5 stages');
    log.error('The quiz completed prematurely after first answer!');
    return false;
  }
  
  if (result.questionCount >= 5) {
    log.success(`FIX VERIFIED: ${result.questionCount} questions shown`);
    log.success('Quiz progressed through multiple stages correctly!');
    log.success('The premature completion bug is FIXED! ✨');
    return true;
  }
  
  log.info(`PARTIAL SUCCESS: ${result.questionCount} questions shown`);
  log.info('Better than before, but should show more questions');
  return true;
}

// Main test runner
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 QUIZ BUG FIX VERIFICATION TEST');
  console.log('Testing: Quiz should NOT complete after just 1 question');
  console.log('='.repeat(60) + '\n');
  
  // Test 1: Login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    log.error('Cannot proceed without login. Exiting...');
    return;
  }
  
  console.log('');
  
  // Test 2: Start Quiz
  const startResult = await testStartQuiz();
  if (!startResult.success) {
    log.error('Cannot proceed without starting quiz. Exiting...');
    return;
  }
  
  console.log('');
  
  // Test 3: Submit Multiple Answers
  const submitResult = await testSubmitAnswers();
  
  console.log('');
  
  // Test 4: Verify
  const isFixed = await verifyQuizFlow(submitResult);
  
  console.log('\n' + '='.repeat(60));
  if (isFixed) {
    log.success('✨ BUG FIX VERIFIED - Quiz works correctly now! ✨');
  } else {
    log.error('❌ BUG STILL EXISTS - Quiz completes too early');
  }
  console.log('='.repeat(60) + '\n');
}

// Run the tests
runTests().catch(console.error);
