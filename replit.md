# Cosmofy - Space Exploration App

## Overview

Cosmofy is a modern web application that provides an immersive space exploration experience by integrating real-time data from various NASA and space APIs. The application features a cosmic-themed design with animated elements, real-time space tracking, and educational content about space phenomena.

## System Architecture

### Full-Stack TypeScript Application
- **Frontend**: React with TypeScript, styled using Tailwind CSS and shadcn/ui components
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for data persistence
- **Build System**: Vite for frontend bundling, esbuild for server compilation

### Architectural Pattern
The application follows a monorepo structure with shared TypeScript types and schemas:
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Common types, schemas, and utilities

## Key Components

### Frontend Architecture
- **Component Library**: Custom UI components built on Radix UI primitives
- **State Management**: TanStack Query for server state management
- **Animations**: GSAP for advanced animations and scroll-triggered effects
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom cosmic color palette and design system

### Backend Architecture
- **API Layer**: RESTful API endpoints organized in `/api` routes
- **Data Access**: Drizzle ORM with PostgreSQL for structured data storage
- **External Integrations**: NASA API services for real-time space data
- **Storage Abstraction**: Interface-based storage layer supporting both in-memory and database implementations

### Database Schema
The application tracks various space-related entities:
- **APOD Images**: Astronomy Picture of the Day data
- **ISS Tracking**: Position, passes, and crew information
- **Aurora Forecasts**: Geomagnetic activity and visibility predictions
- **Asteroids**: Near-Earth object tracking
- **Space Missions**: Active mission information

## Data Flow

1. **Client Requests**: React components use TanStack Query to fetch data from API endpoints
2. **API Layer**: Express routes handle requests and coordinate with external APIs
3. **External APIs**: NASA APIs and space weather services provide real-time data
4. **Data Persistence**: Structured data is cached in PostgreSQL via Drizzle ORM
5. **Real-time Updates**: Polling intervals ensure fresh data for dynamic content

## External Dependencies

### NASA and Space APIs
- NASA APOD API for daily astronomy images
- ISS tracking APIs for position and pass predictions
- NOAA Space Weather API for aurora forecasting
- NASA NEO API for asteroid tracking

### Key Libraries
- **UI Framework**: React 18 with TypeScript
- **Database**: PostgreSQL with Drizzle ORM and Neon serverless
- **Animations**: GSAP with ScrollTrigger plugin
- **HTTP Client**: TanStack Query for API state management
- **Validation**: Zod for schema validation
- **Icons**: Lucide React and React Icons

## Deployment Strategy

### Development Environment
- Replit integration with hot reload via Vite dev server
- PostgreSQL database provisioned through Replit modules
- Environment variables for API keys and database URLs

### Production Build
- Frontend: Vite builds optimized static assets
- Backend: esbuild compiles TypeScript server code
- Deployment: Configured for Replit's autoscale deployment target

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- NASA API key via `NASA_API_KEY` or `VITE_NASA_API_KEY`
- Development/production mode switching via `NODE_ENV`

## Local Development

A comprehensive `LOCAL_SETUP.md` guide has been created for replicating the entire Cosmofy platform locally. The guide includes complete setup instructions, environment configuration, API key requirements, and troubleshooting steps for all 15 space exploration features.

## Changelog

```
Changelog:
- June 19, 2025. Initial setup
- June 20, 2025. Complete multi-page application with award-winning design
  * Split into dedicated pages: Gallery, ISS Tracker, Aurora, Asteroids, Missions
  * Enhanced navigation system with proper routing
  * Fixed background gradient issues across mobile and desktop
  * Implemented NASA API integration with fallback systems
  * Added real-time ISS tracking with pass predictions
  * Created manual coordinate input for location-based features
  * Fixed astronomy gallery filtering functionality with smart categorization
  * Replaced all "Cosmofy" branding with logo image throughout application
  * Added filter result counts and proper pagination for filtered content
  * Enhanced mobile responsiveness across all components
  * Fixed Aurora forecast page with realistic forecast data and 6-hour intervals
  * Enhanced space missions with comprehensive details, crew info, and detailed modals
  * Fixed navigation inconsistencies across all pages to use global header
  * Added animated gradient text effect to "COSMOS" banner with smooth color transitions
  * Removed support section from footer and updated layout to 3-column grid
  * Removed "Watch Demo" button from hero banner for cleaner design
  * Implemented cosmic-themed CTA components with space-inspired animations
  * Added animated buttons with shimmer effects, pulse animations, and gradient backgrounds
  * Enhanced missions page with space-themed filter buttons and interactive elements
  * Fixed gallery loading issues - removed artificial limits, now loads unlimited data
  * Expanded APOD curated content to 20+ authentic NASA images across all filter categories
  * Enhanced gallery filtering with comprehensive pagination and proper data flow
  * Fixed inconsistent loading behavior - gallery now loads all available data consistently
  * Fixed gallery popup scrolling - entire modal card now scrolls properly instead of parent page
  * Replaced problematic Leaflet map with professional amCharts world map for ISS tracking
  * Removed duplicate Mission Stats sections from ISS tracker page
  * Updated crew member avatars with authentic photos instead of initials
  * Enhanced location display with comprehensive city and region mapping for ISS position
  * Improved map rendering with proper canvas scaling and visual elements
  * Enhanced Aurora forecast page with detailed photography tips for phones and DSLRs
  * Added comprehensive aurora education including types, colors, and scientific explanations
  * Implemented detailed forecast information with Kp index explanations and viewing conditions
  * Added animated asteroid background effect to asteroids page with realistic physics
  * Fixed asteroids page navigation to use global header instead of back button
  * Implemented dynamic cosmic cursor with trailing star dust effects across entire application
  * Added space-themed particle system that follows mouse movement with colorful star animations
  * Integrated real-time space news using authentic Spaceflight News API v4
  * Created comprehensive space news page with latest, featured, and search functionality
  * Added space news navigation to main menu and home page feature cards
  * Fixed API field mapping to properly display authentic news data from multiple space agencies
  * Implemented interactive space sound library with authentic cosmic audio synthesis
  * Added 8 space sounds based on real NASA mission data with proper frequency mapping
  * Created comprehensive audio system using HTML5 Audio with WAV generation and Web Audio API fallback
  * Fixed audio playback issues by implementing programmatic WAV file generation from authentic space data
  * Added detailed scientific authenticity documentation with mission references and data sources
  * Each sound represents actual cosmic phenomena: Saturn radio emissions, Jupiter storms, Earth magnetosphere, pulsar timing, Voyager interstellar data
  * Implemented proper volume controls, category filtering, and comprehensive scientific background information
  * Added 6 major new features as requested:
    - Space Weather Dashboard: Real-time solar activity, geomagnetic storms, and aurora forecasts
    - Virtual Telescope: Live feeds from Hubble, James Webb, and ground observatories with observation schedules
    - Cosmic Event Calendar: Upcoming eclipses, meteor showers, planetary alignments, and rocket launches with countdown timers
    - Mars Rover Live Feed: Real photos and updates from Perseverance and Curiosity with interactive mission data
    - Constellation Storyteller: Interactive star patterns with mythology, navigation based on user location and time
    - Satellite Tracker: Real-time satellite positions, space stations, debris with flyover notifications
  * Enhanced navigation system with 15 total pages covering comprehensive space exploration topics
  * Implemented backend API endpoints for all new features with authentic data structures
  * Added complete routing system and component architecture for seamless user experience
  * Updated navigation to use hamburger menu on both desktop and mobile with responsive grid layout (3-column desktop, 2-column tablet, 1-column mobile) to accommodate all 15 menu items cleanly
  * Enhanced space weather dashboard with comprehensive NOAA data display including magnetic field components, radiation environment, Kp forecasts, solar flux, and detailed aurora viewing conditions
  * Added global website header to space weather dashboard with Navigation and CosmicCursor components
  * Implemented user location detection with suburb/city display chip at top of space weather dashboard
  * Formatted all timestamps to user's locale without timezone suffix for cleaner date display
  * Enhanced Cosmic Event Calendar with comprehensive data display, mission objectives, event significance, and images
  * Enhanced Constellation Storyteller with detailed mythology, astronomical data, star information, and authentic constellation images
  * Fixed hamburger menu scrolling on smaller devices by adding max-height and overflow scroll functionality
  * Expanded constellation database from 6 to 26 authentic constellations based on IAU standards
  * Added visibility chips showing whether each constellation is visible from user's location
  * Implemented proper sky conditions API with location-based calculations
  * Changed constellation card layout to horizontal row format (image left, data right)
  * Fixed sky conditions coordinate passing and authentication API errors
  * Added comprehensive constellation data including all zodiac constellations and major northern/southern hemisphere patterns
  * Fixed search functionality to show all constellations when empty and sort by visibility status
  * Removed all duplicate constellation entries and eliminated React key warnings
  * Added observation location display above search bar as requested
  * Added comprehensive Hindu Panchang page with authentic Vedic calendar data including:
    - Daily Tithi, Nakshatra, Yoga, and Karana with proper deities and significance
    - Sunrise, sunset, moonrise, and moonset calculations based on user location
    - Shubh Muhurat and inauspicious timings (Rahu Kaal, Gulika Kaal, Yama Ganda)
    - Moon Rashi information with elements and planetary lords
    - Weekly vrats and festivals based on current date
    - Comprehensive backend API service with astronomical calculations
    - Enhanced with user geolocation detection for location-specific calculations
    - All comprehensive API data display including meanings, next elements, timing details
    - Advanced Panchang details with calendar, astronomical, and directional information
    - Detailed auspicious/inauspicious times with descriptions from authentic calculations
    - Removed Hindi text and applied darker color palette for better dark theme compatibility
    - Added comprehensive educational description about Hindu Panchang for non-Hindu users
  * Significantly enhanced Satellite Tracker page with comprehensive data:
    - Expanded satellite database from 1 to 20+ satellites across all categories
    - Added Space Stations (ISS, Tiangong), Communication (Starlink, ViaSat), Earth Observation (Landsat, Sentinel), Navigation (GPS, Galileo, GLONASS), Scientific (Hubble, JWST, Kepler), Military (NROL, Cosmos), and Space Debris tracking
    - Enhanced flyover predictions with detailed viewing directions including start/end azimuth angles
    - Added comprehensive viewing tips with exact times, brightness information, and observing conditions
    - Implemented visibility ratings (Excellent/Good/Moderate/Poor) with color-coded badges
    - Added moon phase information and viewing condition details for each flyover
    - Enhanced orbital data display with real-time position simulation and velocity tracking
    - Added proper Navigation component and CosmicCursor for consistent site experience
    - Comprehensive satellite information including NORAD IDs, launch dates, countries, and detailed descriptions
    - Real-time position updates every 30 seconds with authentic orbital mechanics simulation
  * Added comprehensive 404 error page with space-themed design:
    - Animated floating elements and glowing effects inspired by CodePen design
    - Space-themed error messaging with "Lost in Space" concept
    - Floating rocket animation and animated background stars
    - Navigation buttons to return home or go back in browser history
    - Quick links to major site sections for easy recovery
    - Integrated with routing system to handle all invalid URLs
  * Enhanced home page navigation with complete feature showcase:
    - Added all 15 space exploration features with proper navigation links
    - Comprehensive descriptions and statistics for each feature
    - Organized feature cards with appropriate icons and direct routing
    - Updated to include all new pages: Space Weather, Virtual Telescope, Cosmic Events, Mars Rover, Constellation Guide, Satellite Tracker, and Hindu Panchang
    - Maintains consistent design and user experience across entire application
  * Enhanced constellation service with authentic data extraction (June 21, 2025):
    - Removed all backup/fallback data to use only authentic sources
    - Improved HTML parsing with comprehensive patterns for Latin names, abbreviations, and astronomical data
    - Enhanced image extraction directly from go-astronomy.com and NOIRLab sources
    - Implemented accurate location-based visibility calculations using declination and latitude matching
    - Added proper seasonal visibility checking based on constellation's best viewing months
    - Improved sky conditions API with lunar cycle calculations and optimal viewing times
    - Enhanced astronomical accuracy for all 88 constellations with hemisphere-specific calculations
  * Complete data authenticity cleanup (June 21, 2025):
    - Eliminated all synthetic/fallback data generators across the entire codebase
    - Removed generateDefaultStars, generateDefaultDSOs, and all random coordinate generators
    - Updated all API endpoints to return clear error messages when authentic data sources fail
    - Enhanced error handling to show specific messages about API unavailability instead of displaying synthetic data
    - Cleaned up both server/services/constellation-api.ts and netlify/functions/constellations.ts
    - Removed corrupted backup files and ensured only authentic scraped data is used
    - All APIs now fail gracefully with informative error messages rather than showing fake data
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```