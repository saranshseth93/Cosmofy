#!/usr/bin/env node

/**
 * Cosmofy Setup Script
 * Automated setup for local development environment
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

console.log('🚀 Cosmofy Setup Script');
console.log('========================');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error('❌ Node.js 18+ is required. Current version:', nodeVersion);
  process.exit(1);
}

console.log('✅ Node.js version:', nodeVersion);

// Check if .env file exists
if (!existsSync('.env')) {
  console.log('📝 Creating .env file...');
  
  if (existsSync('.env.example')) {
    try {
      const exampleContent = readFileSync('.env.example', 'utf8');
      writeFileSync('.env', exampleContent);
      console.log('✅ .env file created from .env.example');
    } catch (error) {
      console.error('❌ Error creating .env file:', error.message);
    }
  } else {
    // Create basic .env file
    const envContent = `# NASA API Configuration
NASA_API_KEY=your_nasa_api_key_here

# Database Configuration (Optional)
# DATABASE_URL=postgresql://username:password@localhost:5432/cosmofy

# Session Security
SESSION_SECRET=your_secure_session_secret_here

# Development Configuration
NODE_ENV=development
PORT=5000
`;
    
    writeFileSync('.env', envContent);
    console.log('✅ Basic .env file created');
  }
} else {
  console.log('✅ .env file already exists');
}

// Check dependencies
console.log('📦 Checking dependencies...');
try {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  
  // Check for required dependencies
  const requiredDeps = [
    'react',
    'express',
    'typescript',
    'vite',
    '@tanstack/react-query',
    'drizzle-orm',
    'tailwindcss'
  ];
  
  const missingDeps = requiredDeps.filter(dep => 
    !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
  );
  
  if (missingDeps.length > 0) {
    console.log('❌ Missing dependencies:', missingDeps.join(', '));
    console.log('Run: npm install');
  } else {
    console.log('✅ All required dependencies present');
  }
} catch (error) {
  console.error('❌ Error checking dependencies:', error.message);
}

// Database setup check
console.log('🗄️ Database setup...');
const envContent = readFileSync('.env', 'utf8');
const hasDbUrl = envContent.includes('DATABASE_URL=') && 
                 !envContent.includes('DATABASE_URL=postgresql://username:password@localhost:5432/cosmofy');

if (hasDbUrl) {
  console.log('✅ Database URL configured');
} else {
  console.log('ℹ️  Using in-memory storage (DATABASE_URL not configured)');
}

// API key check
const hasNasaKey = envContent.includes('NASA_API_KEY=') && 
                   !envContent.includes('NASA_API_KEY=your_nasa_api_key_here');

if (hasNasaKey) {
  console.log('✅ NASA API key configured');
} else {
  console.log('⚠️  NASA API key not configured');
  console.log('   Get your free key at: https://api.nasa.gov/');
  console.log('   Update NASA_API_KEY in .env file');
}

// Port check
console.log('🔌 Checking port availability...');
try {
  const net = require('net');
  const port = 5000;
  
  const server = net.createServer();
  server.listen(port, () => {
    console.log('✅ Port 5000 is available');
    server.close();
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log('⚠️  Port 5000 is in use');
      console.log('   Stop any running processes or change PORT in .env');
    } else {
      console.log('✅ Port 5000 is available');
    }
  });
} catch (error) {
  console.log('ℹ️  Could not check port availability');
}

// Final instructions
console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Get NASA API key: https://api.nasa.gov/');
console.log('2. Update .env file with your API key');
console.log('3. Run: npm run dev');
console.log('4. Open: http://localhost:5000');

console.log('\n📚 Documentation:');
console.log('- README.md - Project overview');
console.log('- LOCAL_SETUP.md - Detailed setup guide');
console.log('- DEPLOYMENT_GUIDE.md - Production deployment');

console.log('\n✨ Enjoy exploring the cosmos!');