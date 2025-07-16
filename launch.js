#!/usr/bin/env node

/**
 * Cosmofy Launch Script
 * One-command setup and launch for offline development
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';

console.log('🚀 Cosmofy Launch Script');
console.log('=========================');

// Check if setup is needed
const needsSetup = !existsSync('.env') || !existsSync('node_modules');

if (needsSetup) {
  console.log('📋 Running initial setup...');
  
  try {
    // Run setup script
    execSync('node setup.js', { stdio: 'inherit' });
    
    // Install dependencies if needed
    if (!existsSync('node_modules')) {
      console.log('📦 Installing dependencies...');
      execSync('npm install', { stdio: 'inherit' });
    }
    
    console.log('✅ Setup completed successfully!');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Verify configuration
console.log('🔍 Verifying configuration...');
if (existsSync('.env')) {
  const envContent = readFileSync('.env', 'utf8');
  const hasApiKey = envContent.includes('NASA_API_KEY=') && 
                    !envContent.includes('NASA_API_KEY=your_nasa_api_key_here');
  
  if (!hasApiKey) {
    console.log('⚠️  NASA API key not configured');
    console.log('📝 Please update NASA_API_KEY in .env file');
    console.log('🔗 Get your free key at: https://api.nasa.gov/');
    console.log('');
    console.log('The application will still work with limited functionality.');
  }
}

// Launch application
console.log('🚀 Starting Cosmofy...');
console.log('📍 Application will be available at: http://localhost:5000');
console.log('🌟 Features: 13 space exploration pages with real-time data');
console.log('⏹️  Press Ctrl+C to stop the application');
console.log('');

try {
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  if (error.signal === 'SIGINT') {
    console.log('\n👋 Cosmofy stopped. Thanks for exploring space!');
  } else {
    console.error('❌ Application failed to start:', error.message);
    console.log('📚 Check README.md or OFFLINE_SETUP.md for troubleshooting');
    process.exit(1);
  }
}