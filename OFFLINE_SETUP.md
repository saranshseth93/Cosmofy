# Cosmofy - Offline Setup Guide

## Complete Local Development Setup

This guide ensures the Cosmofy application runs perfectly offline with all features functional.

## Prerequisites

### System Requirements
- **Node.js 18+** (LTS recommended)
- **npm 8+** or **yarn 1.22+**
- **Git** for version control
- **Modern web browser** (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

### Optional
- **PostgreSQL 13+** (for persistent data storage)
- **VS Code** with recommended extensions

## Quick Setup

### 1. Download and Extract
```bash
# If you have the zip file
unzip cosmofy.zip
cd cosmofy

# Or clone from repository
git clone <repository-url>
cd cosmofy
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy example environment file
cp .env.example .env

# Edit .env file with your settings
```

### 4. Get NASA API Key
1. Visit https://api.nasa.gov/
2. Click "Get Started" 
3. Sign up for free API key
4. Add to .env file: `NASA_API_KEY=your_actual_key_here`

### 5. Start Application
```bash
npm run dev
```

Visit `http://localhost:5000` - Your space exploration platform is ready!

## Detailed Configuration

### Environment Variables (.env)
```env
# Required - Get from https://api.nasa.gov/
NASA_API_KEY=your_nasa_api_key_here

# Optional - For persistent data storage
DATABASE_URL=postgresql://user:password@localhost:5432/cosmofy

# Security - Generate secure random string
SESSION_SECRET=your_secure_session_secret_here

# Development settings
NODE_ENV=development
PORT=5000
```

### Database Setup (Optional)
```bash
# Install PostgreSQL locally
# On macOS with Homebrew:
brew install postgresql
brew services start postgresql

# On Ubuntu/Debian:
sudo apt-get install postgresql postgresql-contrib

# Create database
createdb cosmofy

# Update .env with connection string
DATABASE_URL=postgresql://username:password@localhost:5432/cosmofy
```

## Feature Verification

### Test Each Feature
1. **Home Page** - Should load with feature overview
2. **Gallery** - NASA images should load (requires API key)
3. **ISS Tracker** - Real-time ISS position (requires API key)
4. **Aurora Forecast** - Northern lights predictions
5. **Asteroids** - Near-Earth objects (requires API key)
6. **Missions** - Space missions and launches
7. **News** - Space news articles
8. **Space Weather** - Solar activity monitoring
9. **Telescope** - Virtual telescope access
10. **Events** - Cosmic events calendar
11. **Constellations** - Interactive star maps
12. **Satellites** - Satellite tracking
13. **Solar System** - Planetary exploration

### API Status Check
```bash
# Check if NASA API is working
curl "https://api.nasa.gov/planetary/apod?api_key=YOUR_API_KEY"

# Test local API endpoints
curl "http://localhost:5000/api/apod"
curl "http://localhost:5000/api/iss-position"
```

## Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check Node.js version
node --version  # Should be 18+

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check port availability
lsof -i :5000
```

#### 2. NASA API Errors
- Verify API key is correct
- Check rate limits (1000 requests/hour for free tier)
- Ensure .env file is properly formatted

#### 3. Database Connection Issues
```bash
# Test PostgreSQL connection
psql -d cosmofy -c "SELECT version();"

# Check if database exists
psql -l | grep cosmofy
```

#### 4. Missing Dependencies
```bash
# Verify all packages installed
npm ls --depth=0

# Check for vulnerabilities
npm audit
```

## Development Tools

### Recommended VS Code Extensions
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint

### Browser Developer Tools
- Enable developer mode
- Check console for errors
- Monitor network requests
- Use React Developer Tools

## Production Build

### Build for Production
```bash
# Create optimized build
npm run build

# Start production server
npm start
```

### Performance Optimization
- Images are loaded on-demand
- API responses are cached
- Database queries are optimized
- Static assets are compressed

## Offline Capabilities

### What Works Offline
- Basic navigation
- Previously loaded content
- Cached API responses
- Local storage data

### What Requires Internet
- NASA API data
- Real-time ISS position
- Live space weather
- Current news articles

## Security Considerations

### API Key Security
```bash
# Never commit API keys to version control
echo ".env" >> .gitignore

# Use environment variables
export NASA_API_KEY=your_key_here
```

### Database Security
- Use strong passwords
- Enable SSL connections
- Regular backups
- Limit database access

## Performance Monitoring

### Check Application Health
```bash
# Memory usage
ps aux | grep node

# CPU usage
top -p $(pgrep -f "node.*server")

# Database connections
psql -c "SELECT * FROM pg_stat_activity;"
```

### Optimize Performance
- Enable caching
- Compress images
- Minify assets
- Use CDN for static files

## Backup and Recovery

### Important Files to Backup
- `.env` - Configuration
- `package.json` - Dependencies
- `src/` - Source code
- Database dumps

### Create Backup
```bash
# Database backup
pg_dump cosmofy > backup.sql

# Application backup
tar -czf cosmofy-backup.tar.gz .env src/ package.json
```

## Support Resources

### Documentation
- README.md - Project overview
- LOCAL_SETUP.md - Setup instructions
- DEPLOYMENT_GUIDE.md - Production deployment

### External Resources
- [NASA API Documentation](https://api.nasa.gov/)
- [React Documentation](https://reactjs.org/)
- [Node.js Documentation](https://nodejs.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/)

### Community
- GitHub Issues for bug reports
- Stack Overflow for technical questions
- NASA API community forums

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Check for security vulnerabilities
- Monitor API usage
- Review error logs

### Update Process
```bash
# Check for updates
npm outdated

# Update packages
npm update

# Security audit
npm audit fix
```

---

This guide ensures your Cosmofy application runs flawlessly offline with all features operational. For additional help, check the troubleshooting section or consult the support resources.