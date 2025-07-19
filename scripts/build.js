#!/usr/bin/env node

/**
 * Build script for CareerForge AI
 * Creates optimized production build
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`[${step}] ${message}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Build configuration
const buildConfig = {
  distDir: 'dist',
  sourceDir: 'src',
  excludeFiles: [
    '*.test.js',
    '*.spec.js',
    '__tests__',
    '*.dev.js'
  ]
};

// Clean previous build
function cleanBuild() {
  logStep('1/6', 'Cleaning previous build...');
  
  if (fs.existsSync(buildConfig.distDir)) {
    fs.rmSync(buildConfig.distDir, { recursive: true, force: true });
    logSuccess('Previous build cleaned');
  } else {
    log('No previous build found', 'yellow');
  }
}

// Create build directory structure
function createBuildStructure() {
  logStep('2/6', 'Creating build directory structure...');
  
  if (!fs.existsSync(buildConfig.distDir)) {
    fs.mkdirSync(buildConfig.distDir, { recursive: true });
  }
  
  logSuccess('Build directory structure created');
}

// Copy source files (excluding test files)
function copySourceFiles() {
  logStep('3/6', 'Copying source files...');
  
  function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      // Skip test files and dev files
      const shouldSkip = buildConfig.excludeFiles.some(pattern => {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace('*', '.*'));
          return regex.test(entry.name);
        }
        return entry.name.includes(pattern);
      });
      
      if (shouldSkip) {
        log(`Skipping: ${srcPath}`, 'yellow');
        continue;
      }
      
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  
  copyDir(buildConfig.sourceDir, path.join(buildConfig.distDir, buildConfig.sourceDir));
  logSuccess('Source files copied');
}

// Generate optimized package.json for production
function generateProductionPackageJson() {
  logStep('4/6', 'Generating production package.json...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Create production package.json
  const productionPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    main: packageJson.main,
    scripts: {
      start: packageJson.scripts.start,
      'db:generate': packageJson.scripts['db:generate']
    },
    dependencies: packageJson.dependencies,
    keywords: packageJson.keywords,
    author: packageJson.author,
    license: packageJson.license
  };
  
  fs.writeFileSync(
    path.join(buildConfig.distDir, 'package.json'),
    JSON.stringify(productionPackageJson, null, 2)
  );
  
  logSuccess('Production package.json generated');
}

// Copy essential files
function copyEssentialFiles() {
  logStep('5/6', 'Copying essential files...');
  
  const essentialFiles = [
    'prisma',
    '.env.example',
    'README.md'
  ];
  
  essentialFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const destPath = path.join(buildConfig.distDir, file);
      
      if (fs.statSync(file).isDirectory()) {
        // Copy directory recursively
        function copyDirRecursive(src, dest) {
          if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
          }
          
          const entries = fs.readdirSync(src, { withFileTypes: true });
          
          for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (entry.isDirectory()) {
              copyDirRecursive(srcPath, destPath);
            } else {
              fs.copyFileSync(srcPath, destPath);
            }
          }
        }
        
        copyDirRecursive(file, destPath);
      } else {
        // Copy file
        fs.copyFileSync(file, destPath);
      }
      
      log(`Copied: ${file}`, 'cyan');
    } else {
      logWarning(`File not found: ${file}`);
    }
  });
  
  logSuccess('Essential files copied');
}

// Generate build info
function generateBuildInfo() {
  logStep('6/6', 'Generating build information...');
  
  const buildInfo = {
    buildTime: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    environment: 'production',
    version: JSON.parse(fs.readFileSync('package.json', 'utf8')).version
  };
  
  fs.writeFileSync(
    path.join(buildConfig.distDir, 'build-info.json'),
    JSON.stringify(buildInfo, null, 2)
  );
  
  logSuccess('Build information generated');
}

// Validate build
function validateBuild() {
  log('\n📋 Build Validation:', 'cyan');
  
  const requiredFiles = [
    'package.json',
    'src/server.js',
    'prisma/schema.prisma',
    'build-info.json'
  ];
  
  const missingFiles = [];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(buildConfig.distDir, file);
    if (fs.existsSync(filePath)) {
      log(`✅ ${file}`, 'green');
    } else {
      log(`❌ ${file}`, 'red');
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length > 0) {
    logError(`Build validation failed. Missing files: ${missingFiles.join(', ')}`);
    process.exit(1);
  }
  
  // Calculate build size
  const getBuildSize = (dir) => {
    let totalSize = 0;
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    files.forEach(file => {
      const filePath = path.join(dir, file.name);
      if (file.isDirectory()) {
        totalSize += getBuildSize(filePath);
      } else {
        totalSize += fs.statSync(filePath).size;
      }
    });
    
    return totalSize;
  };
  
  const buildSize = getBuildSize(buildConfig.distDir);
  const buildSizeMB = (buildSize / (1024 * 1024)).toFixed(2);
  
  log(`\n📊 Build Statistics:`, 'cyan');
  log(`   Size: ${buildSizeMB} MB`, 'blue');
  log(`   Location: ${path.resolve(buildConfig.distDir)}`, 'blue');
  
  logSuccess('Build validation passed');
}

// Main build function
function main() {
  console.log();
  log('🏗️  CareerForge AI Production Build', 'bright');
  log('====================================', 'bright');
  console.log();
  
  const startTime = Date.now();
  
  try {
    cleanBuild();
    createBuildStructure();
    copySourceFiles();
    generateProductionPackageJson();
    copyEssentialFiles();
    generateBuildInfo();
    validateBuild();
    
    const buildTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log();
    log('🎉 Build completed successfully!', 'green');
    log(`⏱️  Build time: ${buildTime} seconds`, 'blue');
    log(`📁 Output: ${path.resolve(buildConfig.distDir)}`, 'blue');
    console.log();
    log('Next steps:', 'cyan');
    log('1. cd dist', 'blue');
    log('2. npm install --production', 'blue');
    log('3. npm start', 'blue');
    console.log();
    
  } catch (error) {
    logError(`Build failed: ${error.message}`);
    process.exit(1);
  }
}

// Execute build
if (require.main === module) {
  main();
}

module.exports = { main };
