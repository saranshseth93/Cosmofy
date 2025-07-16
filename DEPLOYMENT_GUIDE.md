# Cosmofy - Deployment Guide

## Quick Start for Local Development

### 1. Prerequisites Check
```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Check Git installation
git --version
```

### 2. Installation
```bash
# Clone repository
git clone <your-repo-url>
cd cosmofy

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 3. Environment Setup
Edit `.env` file with your configuration:
```env
# Required for core functionality
NASA_API_KEY=your_nasa_api_key_from_api.nasa.gov

# Optional - uses in-memory storage if not provided
DATABASE_URL=postgresql://user:password@localhost:5432/cosmofy

# Development settings
NODE_ENV=development
SESSION_SECRET=your_secure_session_secret
```

### 4. Start Development Server
```bash
npm run dev
```

Application will be available at `http://localhost:5000`

## Production Deployment

### Replit Deployment (Recommended)
1. Import repository to Replit
2. Set environment variables in Replit Secrets
3. Click "Deploy" button
4. Application will be available at your-repl-name.replit.app

### Manual Server Deployment

#### 1. Prepare Production Environment
```bash
# Build application
npm run build

# Set production environment
export NODE_ENV=production
export NASA_API_KEY=your_production_api_key
export DATABASE_URL=your_production_database_url
```

#### 2. Start Production Server
```bash
npm start
```

#### 3. Process Management (PM2)
```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start npm --name "cosmofy" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

### Docker Deployment

#### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production

# Start application
CMD ["npm", "start"]
```

#### 2. Build and Run
```bash
# Build Docker image
docker build -t cosmofy .

# Run container
docker run -p 5000:5000 \
  -e NASA_API_KEY=your_api_key \
  -e DATABASE_URL=your_db_url \
  cosmofy
```

## Environment Variables Reference

### Required Variables
```env
NASA_API_KEY=your_nasa_api_key
```

### Optional Variables
```env
# Database (uses in-memory storage if not provided)
DATABASE_URL=postgresql://user:password@localhost:5432/cosmofy

# Security
SESSION_SECRET=your_secure_random_secret

# Development
NODE_ENV=development
PORT=5000
```

## Health Checks and Monitoring

### Application Health
```bash
# Check application status
curl http://localhost:5000/api/health

# Check NASA API connectivity
curl http://localhost:5000/api/apod
```

### Monitoring Endpoints
- `/api/health` - Application health status
- `/api/apod` - NASA API connectivity
- `/api/location` - Geolocation services

## Troubleshooting Common Issues

### 1. Application Won't Start
```bash
# Check Node.js version
node --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules
npm install
```

### 2. API Errors
```bash
# Check NASA API key
curl "https://api.nasa.gov/planetary/apod?api_key=YOUR_API_KEY"

# Verify environment variables
echo $NASA_API_KEY
```

### 3. Database Connection Issues
```bash
# Test database connection
psql $DATABASE_URL

# Check database exists
createdb cosmofy
```

### 4. Port Conflicts
```bash
# Find process using port 5000
lsof -ti:5000

# Kill process
kill -9 $(lsof -ti:5000)
```

## Performance Optimization

### 1. API Caching
- NASA APOD: 24 hours
- ISS Position: 5 minutes
- Space Weather: 1 hour
- Constellation data: 30 days

### 2. Image Optimization
- Images loaded on-demand
- Thumbnail generation for galleries
- Progressive loading for large images

### 3. Database Optimization
- Connection pooling enabled
- Query result caching
- Efficient data structures

## Security Best Practices

### 1. API Key Security
```bash
# Never commit API keys
git log --grep="API_KEY" --oneline

# Use environment variables
echo "NASA_API_KEY=your_key" >> .env
```

### 2. Session Security
```bash
# Generate secure session secret
openssl rand -base64 32
```

### 3. CORS Configuration
```javascript
// Update for production domains
const corsOptions = {
  origin: ['https://your-domain.com'],
  credentials: true
};
```

## Backup and Recovery

### 1. Database Backup
```bash
# PostgreSQL backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### 2. Configuration Backup
```bash
# Backup environment variables
cp .env .env.backup

# Backup application configuration
tar -czf config-backup.tar.gz .env package.json
```

## Updates and Maintenance

### 1. Dependency Updates
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Security audit
npm audit
```

### 2. API Changes
- Monitor NASA API announcements
- Check Launch Library API updates
- Verify third-party service status

### 3. Performance Monitoring
```bash
# Check application logs
tail -f logs/application.log

# Monitor resource usage
top -p $(pgrep -f "node.*server")
```

## Support and Resources

### Documentation
- [NASA API Documentation](https://api.nasa.gov/)
- [Launch Library API](https://ll.thespacedevs.com/2.2.0/swagger)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Community
- GitHub Issues for bug reports
- Stack Overflow for technical questions
- NASA API community forum

### Emergency Contacts
- NASA API Support: https://api.nasa.gov/contact
- Application maintainer: [Your contact info]

---

This deployment guide ensures your Cosmofy application runs smoothly in any environment. For additional help, refer to the LOCAL_SETUP.md file or check the troubleshooting section.