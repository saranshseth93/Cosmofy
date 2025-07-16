# Cosmofy - Local Setup Guide

## Overview
This guide provides complete instructions for setting up the Cosmofy space exploration platform locally. The application includes 13 comprehensive space-themed features with real-time NASA data integration.

## Prerequisites

### Required Software
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)

### Optional but Recommended
- **VS Code** with TypeScript extension
- **PostgreSQL** (for database storage - optional, uses in-memory storage by default)

## Installation Steps

### 1. Clone and Install Dependencies
```bash
# Clone the repository
git clone <repository-url>
cd cosmofy

# Install all dependencies
npm install

# Or using yarn
yarn install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:

```env
# Required for NASA API features
NASA_API_KEY=your_nasa_api_key_here

# Optional - Database (uses in-memory storage if not provided)
DATABASE_URL=postgresql://username:password@localhost:5432/cosmofy

# Development mode
NODE_ENV=development

# Session secret (auto-generated if not provided)
SESSION_SECRET=your_session_secret_here
```

### 3. API Key Setup

#### NASA API Key (Required)
1. Visit [NASA API Portal](https://api.nasa.gov/)
2. Click "Get Started" and sign up for a free API key
3. Add your API key to the `.env` file as `NASA_API_KEY`

**Features that require NASA API:**
- Astronomy Picture of the Day Gallery
- ISS Real-time Tracking
- Near-Earth Object (Asteroid) Tracking
- Space Weather Data (when available)

#### Optional API Integrations
The application will gracefully handle missing API keys by showing informative error messages instead of breaking.

### 4. Database Setup (Optional)
By default, the application uses in-memory storage. For persistent data:

```bash
# Install PostgreSQL locally
# Then create a database
createdb cosmofy

# Update DATABASE_URL in .env file
DATABASE_URL=postgresql://username:password@localhost:5432/cosmofy
```

### 5. Start the Application
```bash
# Development mode with hot reload
npm run dev

# Or using yarn
yarn dev
```

The application will be available at `http://localhost:5000`

## Project Structure

```
cosmofy/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   └── lib/            # Utilities and configurations
├── server/                 # Express backend
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── services/           # External API services
│   └── storage.ts          # Data storage interface
├── shared/                 # Shared types and schemas
└── attached_assets/        # Static assets
```

## Available Features

### 1. Home Dashboard
- **Path**: `/`
- **Description**: Main landing page with feature overview
- **Requirements**: None

### 2. Astronomy Gallery
- **Path**: `/gallery`
- **Description**: NASA's Astronomy Picture of the Day collection
- **Requirements**: NASA_API_KEY
- **Features**: Filtering, search, high-resolution images

### 3. ISS Tracker
- **Path**: `/iss-tracker`
- **Description**: Real-time International Space Station tracking
- **Requirements**: NASA_API_KEY
- **Features**: Live position, crew info, pass predictions

### 4. Aurora Forecast
- **Path**: `/aurora`
- **Description**: Northern/Southern Lights visibility predictions
- **Requirements**: Location access
- **Features**: Geomagnetic activity, viewing tips

### 5. Asteroid Tracker
- **Path**: `/asteroids`
- **Description**: Near-Earth Object monitoring
- **Requirements**: NASA_API_KEY
- **Features**: Upcoming approaches, size estimates

### 6. Space Missions
- **Path**: `/missions`
- **Description**: Active space missions and launches
- **Requirements**: Launch Library API (automatic)
- **Features**: Mission details, launch schedules

### 7. Space News
- **Path**: `/news`
- **Description**: Latest space exploration news
- **Requirements**: Spaceflight News API (automatic)
- **Features**: Latest articles, search functionality

### 8. Space Weather
- **Path**: `/space-weather`
- **Description**: Solar activity and space weather monitoring
- **Requirements**: NOAA API (automatic)
- **Features**: Solar wind, magnetic field, radiation levels

### 9. Virtual Telescope
- **Path**: `/telescope`
- **Description**: Virtual access to space telescopes
- **Requirements**: Various telescope APIs
- **Features**: Hubble, Webb, and ground-based observations

### 10. Cosmic Events
- **Path**: `/events`
- **Description**: Upcoming astronomical events calendar
- **Requirements**: Launch Library API (automatic)
- **Features**: Eclipses, meteor showers, rocket launches

### 11. Constellation Guide
- **Path**: `/constellations`
- **Description**: Interactive constellation storyteller
- **Requirements**: Location access
- **Features**: Mythology, star patterns, visibility

### 12. Satellite Tracker
- **Path**: `/satellites`
- **Description**: Real-time satellite tracking
- **Requirements**: Location access
- **Features**: Flyover predictions, orbital data

### 13. Solar System Explorer
- **Path**: `/solar-system`
- **Description**: Interactive solar system exploration
- **Requirements**: Solar System API (automatic)
- **Features**: Planetary data, orbital mechanics

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in package.json
```

#### 2. NASA API Rate Limits
- Free tier: 1000 requests/hour
- Consider upgrading for heavy usage
- Application includes caching to minimize requests

#### 3. Location Access Denied
- Enable location services in browser
- Application provides manual coordinate input as fallback

#### 4. Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Application falls back to in-memory storage

### Performance Optimization

#### 1. Enable Caching
```bash
# Set longer cache durations for production
NODE_ENV=production npm run dev
```

#### 2. API Response Caching
- NASA APOD: 24 hours
- ISS Position: 5 minutes
- Space Weather: 1 hour
- Constellations: 30 days

#### 3. Image Optimization
- Images are loaded on-demand
- High-resolution images only loaded when requested
- Thumbnail generation for gallery views

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests (if available)
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## API Documentation

### Internal API Endpoints

#### NASA Integration
- `GET /api/apod` - Astronomy Picture of the Day
- `GET /api/iss-position` - ISS current position
- `GET /api/asteroids` - Near-Earth Objects

#### Space Data
- `GET /api/space-weather` - Current space weather
- `GET /api/cosmic-events` - Upcoming astronomical events
- `GET /api/rocket-launches` - Rocket launch schedule

#### Utilities
- `GET /api/location` - Geolocation services
- `GET /api/constellations` - Constellation data
- `GET /api/satellites` - Satellite tracking

## Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
NASA_API_KEY=your_production_api_key
DATABASE_URL=your_production_database_url
SESSION_SECRET=strong_random_secret
```

### Build and Deploy
```bash
# Build application
npm run build

# Start production server
npm start
```

## Security Considerations

### API Key Protection
- Never commit API keys to version control
- Use environment variables for all secrets
- Implement rate limiting for production

### CORS Configuration
- Currently configured for development
- Update CORS settings for production domains

### Session Security
- Strong session secrets in production
- HTTPS recommended for production
- Secure cookie settings

## Support and Maintenance

### Regular Updates
- Check for NASA API changes
- Update dependencies monthly
- Monitor API rate limits

### Backup Considerations
- Database backups if using PostgreSQL
- Environment configuration backup
- Regular dependency updates

## License and Attribution

This project uses data from:
- NASA Open Data Portal
- Launch Library API
- Spaceflight News API
- NOAA Space Weather Prediction Center
- Various astronomical databases

Ensure compliance with respective API terms of service.

## Contact and Support

For technical issues or questions:
1. Check this documentation first
2. Review error logs in browser console
3. Verify API key configuration
4. Check network connectivity

The application is designed to be resilient and will display informative error messages when external services are unavailable.