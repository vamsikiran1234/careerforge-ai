#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix unused variables and other ESLint issues
const fixes = [
  // Remove unused variables in careerAnalysisService.js
  {
    file: 'src/services/careerAnalysisService.js',
    search: /const progressRate = .*?;/g,
    replace: '// const progressRate = ... // Removed unused variable'
  },
  
  // Remove unused variables in aiService.js
  {
    file: 'src/services/aiService.js',
    search: /const attemptNumber = .*?;/g,
    replace: '// const attemptNumber = ... // Removed unused variable'
  },
  {
    file: 'src/services/aiService.js',
    search: /const modelUsed = .*?;/g,
    replace: '// const modelUsed = ... // Removed unused variable'
  },
  
  // Remove unused variables in quizRoutes.js
  {
    file: 'src/routes/quizRoutes.js',
    search: /const userIdSchema = .*?;/g,
    replace: '// const userIdSchema = ... // Removed unused variable'
  },
  
  // Remove unused variables in careerController.js
  {
    file: 'src/controllers/careerController.js',
    search: /const userId = .*?;/g,
    replace: '// const userId = ... // Removed unused variable'
  }
];

console.log('🔧 Fixing ESLint issues...');

fixes.forEach(fix => {
  const filePath = path.join(__dirname, fix.file);
  
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      if (fix.search.test(content)) {
        content = content.replace(fix.search, fix.replace);
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed ${fix.file}`);
      } else {
        console.log(`ℹ️  No issues found in ${fix.file}`);
      }
    } catch (error) {
      console.error(`❌ Error fixing ${fix.file}:`, error.message);
    }
  } else {
    console.log(`⚠️  File not found: ${fix.file}`);
  }
});

console.log('🎉 ESLint fixes completed!');