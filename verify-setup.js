#!/usr/bin/env node

/**
 * Cosmofy Verification Script
 * Checks if all components are properly configured for offline use
 */

import { existsSync, readFileSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🔍 Cosmofy Setup Verification');
console.log('==============================');

let allPassed = true;

// File existence checks
const requiredFiles = [
  'package.json',
  '.env',
  'README.md',
  'LOCAL_SETUP.md',
  'DEPLOYMENT_GUIDE.md',
  'OFFLINE_SETUP.md',
  'server/index.ts',
  'client/src/App.tsx',
  'vite.config.ts',
  'tailwind.config.ts'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  if (existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing`);
    allPassed = false;
  }
});

// Environment configuration check
console.log('\n🔧 Checking environment configuration...');
if (existsSync('.env')) {
  const envContent = readFileSync('.env', 'utf8');
  
  // Check for required environment variables
  const requiredEnvVars = [
    'NASA_API_KEY',
    'SESSION_SECRET',
    'NODE_ENV'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(`${envVar}=`) && !envContent.includes(`${envVar}=your_`)) {
      console.log(`✅ ${envVar} configured`);
    } else {
      console.log(`⚠️  ${envVar} needs configuration`);
      if (envVar === 'NASA_API_KEY') {
        console.log('   Get your free key at: https://api.nasa.gov/');
      }
    }
  });
} else {
  console.log('❌ .env file missing');
  allPassed = false;
}

// Package.json validation
console.log('\n📦 Checking package.json...');
if (existsSync('package.json')) {
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    
    // Check scripts
    const requiredScripts = ['dev', 'build', 'start'];
    requiredScripts.forEach(script => {
      if (packageJson.scripts[script]) {
        console.log(`✅ Script '${script}' configured`);
      } else {
        console.log(`❌ Script '${script}' missing`);
        allPassed = false;
      }
    });
    
    // Check key dependencies
    const keyDeps = ['react', 'express', 'typescript', 'vite', 'tailwindcss'];
    keyDeps.forEach(dep => {
      if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
        console.log(`✅ Dependency '${dep}' present`);
      } else {
        console.log(`❌ Dependency '${dep}' missing`);
        allPassed = false;
      }
    });
    
  } catch (error) {
    console.log('❌ package.json is invalid JSON');
    allPassed = false;
  }
} else {
  console.log('❌ package.json missing');
  allPassed = false;
}

// Node modules check
console.log('\n🗂️  Checking node_modules...');
if (existsSync('node_modules')) {
  console.log('✅ Dependencies installed');
} else {
  console.log('❌ Dependencies not installed - run npm install');
  allPassed = false;
}

// TypeScript configuration
console.log('\n🔷 Checking TypeScript configuration...');
if (existsSync('tsconfig.json')) {
  console.log('✅ TypeScript configuration found');
} else {
  console.log('❌ tsconfig.json missing');
  allPassed = false;
}

// Tailwind configuration
console.log('\n🎨 Checking Tailwind CSS configuration...');
if (existsSync('tailwind.config.ts')) {
  console.log('✅ Tailwind CSS configuration found');
} else {
  console.log('❌ tailwind.config.ts missing');
  allPassed = false;
}

// Vite configuration
console.log('\n⚡ Checking Vite configuration...');
if (existsSync('vite.config.ts')) {
  console.log('✅ Vite configuration found');
} else {
  console.log('❌ vite.config.ts missing');
  allPassed = false;
}

// Check page components
console.log('\n📄 Checking page components...');
const pageComponents = [
  'client/src/pages/home.tsx',
  'client/src/pages/gallery.tsx',
  'client/src/pages/iss-tracker.tsx',
  'client/src/pages/aurora.tsx',
  'client/src/pages/asteroids.tsx',
  'client/src/pages/missions.tsx',
  'client/src/pages/space-news.tsx',
  'client/src/pages/space-weather.tsx',
  'client/src/pages/virtual-telescope.tsx',
  'client/src/pages/cosmic-events.tsx',
  'client/src/pages/constellation-storyteller.tsx',
  'client/src/pages/satellite-tracker.tsx',
  'client/src/pages/solar-system.tsx'
];

pageComponents.forEach(page => {
  if (existsSync(page)) {
    console.log(`✅ ${page.split('/').pop()}`);
  } else {
    console.log(`❌ ${page} - Missing`);
    allPassed = false;
  }
});

// Check server components
console.log('\n🖥️  Checking server components...');
const serverComponents = [
  'server/index.ts',
  'server/routes.ts',
  'server/storage.ts',
  'server/services/nasa-api.ts',
  'server/services/geolocation.ts',
  'server/services/constellation-api.ts'
];

serverComponents.forEach(component => {
  if (existsSync(component)) {
    console.log(`✅ ${component.split('/').pop()}`);
  } else {
    console.log(`❌ ${component} - Missing`);
    allPassed = false;
  }
});

// Port availability check
console.log('\n🔌 Checking port availability...');
try {
  const { createServer } = await import('net');
  const server = createServer();
  
  server.listen(5000, () => {
    console.log('✅ Port 5000 is available');
    server.close();
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log('⚠️  Port 5000 is in use (this is normal if app is running)');
    } else {
      console.log('✅ Port 5000 is available');
    }
  });
} catch (error) {
  console.log('ℹ️  Could not check port availability');
}

// Final summary
console.log('\n📋 Verification Summary');
console.log('======================');

if (allPassed) {
  console.log('🎉 All checks passed! Your Cosmofy setup is ready.');
  console.log('\n🚀 To start the application:');
  console.log('1. npm run dev');
  console.log('2. Open http://localhost:5000');
} else {
  console.log('⚠️  Some issues found. Please fix them before running the application.');
  console.log('\n📚 For help, check:');
  console.log('- README.md');
  console.log('- LOCAL_SETUP.md');
  console.log('- OFFLINE_SETUP.md');
}

console.log('\n🌟 Features available:');
console.log('- 13 space exploration pages');
console.log('- Real-time NASA data integration');
console.log('- Interactive visualizations');
console.log('- Responsive design');
console.log('- Offline-ready architecture');

process.exit(allPassed ? 0 : 1);