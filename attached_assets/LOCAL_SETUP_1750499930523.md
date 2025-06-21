# Cosmofy - Local Development Setup

This guide will help you replicate the Cosmofy space exploration app on your local machine.

## Prerequisites

### Required Software

- **Node.js**: Version 20.18.1 or higher
- **npm**: Version 10+ (comes with Node.js)
- **PostgreSQL**: Version 16+ (optional, uses in-memory storage by default)
- **Git**: For version control

### Get Required API Keys

1. **NASA API Key** (Required):
   - Visit: https://api.nasa.gov/
   - Sign up for a free account
   - Generate your API key
   - Keep this key handy for environment setup

## Project Setup

### 1. Clone or Download Project Files

```bash
# If using git (recommended)
git clone <your-repository-url>
cd cosmofy

# Or create a new directory and copy all files
mkdir cosmofy
cd cosmofy
# Copy all project files here
```

### 2. Install Dependencies

```bash
# Install all project dependencies
npm install

# This will install:
# - React 18 with TypeScript
# - Express.js server
# - Tailwind CSS + shadcn/ui components
# - NASA API integration libraries
# - Animation libraries (GSAP, Framer Motion)
# - Database tools (Drizzle ORM)
# - All other space exploration dependencies
```

### 3. Environment Configuration

Generate secure environment configuration automatically:

```bash
# Generate .env file with secure session secret
node generate-env.js

# This creates:
# - Secure random SESSION_SECRET (cryptographically generated)
# - Proper .env structure with NASA API placeholders
# - All required environment variables
```

Then edit `.env` to add your NASA API key:

```env
# Replace DEMO_KEY with your actual NASA API key
NASA_API_KEY=your_actual_nasa_api_key_from_api_nasa_gov
VITE_NASA_API_KEY=your_actual_nasa_api_key_from_api_nasa_gov
```

**What is SESSION_SECRET?**

- Encrypts user session data stored in cookies
- Prevents session tampering and security attacks
- Auto-generated as 128-character secure random string
- Must be kept secret and never shared publicly

### 4. Database Setup (Optional)

The app uses in-memory storage by default. For persistent data:

```bash
# Install PostgreSQL locally
# macOS:
brew install postgresql
brew services start postgresql

# Ubuntu/Debian:
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Create database
createdb cosmofy

# Update DATABASE_URL in .env file
```

### 5. Development Server

```bash
# Start the development server
npm run dev

# This will:
# - Start Express.js backend on port 5000
# - Start Vite frontend development server
# - Enable hot reload for both frontend and backend
# - Automatically open browser to http://localhost:5000
```

## Project Structure

```
cosmofy/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # All 15 space exploration pages
│   │   ├── lib/           # Utilities and configurations
│   │   └── App.tsx        # Main application router
├── server/                # Express.js backend
│   ├── routes.ts          # API endpoints
│   ├── services/          # External API integrations
│   └── storage.ts         # Data storage abstraction
├── shared/                # Common TypeScript types
│   └── schema.ts          # Database schemas and types
├── attached_assets/       # Images and media files
├── package.json           # Dependencies and scripts
└── vite.config.ts         # Build configuration
```

## Available Features

Once running locally, you'll have access to all 15 space exploration features:

### Core Features

- **APOD Gallery**: NASA Astronomy Picture of the Day
- **ISS Tracker**: Real-time International Space Station tracking
- **Solar System**: Interactive planetary explorer
- **Aurora Forecast**: Northern/Southern lights predictions
- **Asteroid Watch**: Near-Earth object tracking
- **Space Missions**: Active mission monitoring

### Advanced Features

- **Space Weather**: Real-time solar activity dashboard
- **Cosmic Events**: Upcoming astronomical events calendar
- **Constellation Guide**: Interactive star pattern stories
- **Satellite Tracker**: Real-time satellite position tracking

### Additional Features

- **Space News**: Latest space exploration news
- **Space Sounds**: Authentic cosmic audio library
- **Hindu Panchang**: Traditional Vedic calendar

## Development Commands

```bash
# Development server (recommended)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## API Integration

### NASA APIs Used

- **APOD API**: Daily astronomy images
- **ISS Location API**: Real-time station tracking
- **Near Earth Object API**: Asteroid data

### External APIs

- **Spaceflight News API**: Latest space news
- **NOAA Space Weather API**: Solar activity data
- **Geolocation APIs**: User location services

## Troubleshooting

### Common Issues

1. **NASA API Key Not Working**

   - Verify your API key at https://api.nasa.gov/
   - Check both `NASA_API_KEY` and `VITE_NASA_API_KEY` in .env
   - Restart development server after changing .env

2. **Port Already in Use**

   ```bash
   # Find process using port 5000
   lsof -ti:5000
   # Kill the process
   kill -9 <process_id>
   ```

3. **Dependencies Not Installing**

   ```bash
   # Clear npm cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Build Errors**
   ```bash
   # Check TypeScript errors
   npm run type-check
   # Fix any type issues before building
   ```

### Performance Optimization

1. **For slower connections**: The app caches API responses locally
2. **For limited API calls**: Most APIs have generous free tiers
3. **For mobile devices**: Fully responsive design works on all screen sizes

## Deployment Options

### Local Network Access

To access from other devices on your network:

```bash
# Find your local IP
ipconfig getifaddr en0  # macOS
ip route get 1.1.1.1 | awk '{print $7}'  # Linux

# Access via: http://YOUR_LOCAL_IP:5000
```

### Production Deployment

- **Vercel**: `npm run build` then deploy dist folder
- **Netlify**: Connect GitHub repo for automatic deploys
- **Docker**: Use provided Dockerfile for containerization
- **VPS**: Any Linux server with Node.js support

## Contributing

1. Fork the project
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Support

- Check console logs for API errors
- Verify all environment variables are set
- Ensure internet connection for external APIs
- Review browser developer tools for client-side issues

---

**Note**: This is an educational project showcasing space exploration data. Not affiliated with NASA or other space agencies. All data comes from public APIs.
