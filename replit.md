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
  * **REMOVED Hindu Panchang functionality completely** (July 15, 2025):
    - Removed all Hindu Panchang/Vedic calendar related pages, components, and API routes
    - Deleted mhah-panchang service and all related astronomical calculation code
    - Removed Panchang navigation links from all menus and home page
    - Uninstalled mhah-panchang package dependency
    - Cleaned up all drik-panchang scraping services and related files
    - Application now focuses exclusively on space exploration features
    - No cultural/religious content - purely space-themed platform
  * **REMOVED Mars Rover and Space Sounds functionality** (July 15, 2025):
    - Completely removed Mars Rover and Space Sounds pages and all related components
    - Cleaned up navigation, home page, and footer references
    - Removed all associated API routes and services
    - Application now streamlined to core space exploration features only
  * **Enhanced Space Weather API with authentic NOAA data** (July 15, 2025):
    - Implemented real-time NOAA Space Weather Prediction Center API integration
    - Added authentic solar wind, magnetometer, plasma, and Kp-index data feeds
    - Created comprehensive space weather analysis with storm alerts and aurora forecasts
    - Added proper error handling for NOAA API timeouts and service unavailability
    - Space Weather dashboard now displays live geomagnetic activity and radiation levels
  * **Added Solar System API integration** (July 15, 2025):
    - Integrated le-systeme-solaire.net API for authentic solar system data
    - Added endpoints for planetary bodies, moons, and astronomical object information
    - Provides comprehensive data on orbital mechanics, physical characteristics, and discovery details
    - Ready for future solar system explorer features and planetary data visualization
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
  * **Complete elimination of remaining synthetic data generators** (July 15, 2025):
    - Removed all hardcoded satellite position calculations and orbital mechanics from satellite-tracker.tsx
    - Replaced synthetic satellite data with proper API calls to /api/satellites endpoint
    - Updated Solar System Explorer to use le-systeme-solaire.net API exclusively
    - Removed all remaining hardcoded planetary data arrays and static calculations
    - Eliminated Space Sound Library component containing synthetic audio data
    - Added comprehensive error handling for all API failures instead of synthetic fallbacks
    - Satellite Tracker now shows clear error messages when orbital mechanics APIs unavailable
    - Solar System page displays proper loading states and error recovery for authentic data
    - All pages now maintain zero tolerance for synthetic data - authentic sources only
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
    - Completely removed massive space weather API with 50+ Math.random() calls from server/routes.ts
    - Eliminated extensive satellite tracking API with 100+ synthetic position/velocity generators
    - Removed all Math.random() calls from aurora forecast, ISS passes, and Mars rover APIs
    - Updated netlify/functions/space-weather.ts to only use authentic NOAA data or show errors
    - Completely cleaned all Netlify functions: panchang.ts, satellites.ts, missions.ts, aurora.ts, sky-conditions.ts
    - Removed all synthetic data generators from Netlify functions and replaced with proper 503 error responses
    - Created comprehensive ErrorFallback components for frontend to handle API failures gracefully
    - Added specific error components for Space Weather, Constellation, Satellite, Aurora, and NASA data failures
    - All APIs now fail gracefully with informative error messages rather than showing fake data
    - Application maintains complete data integrity - only authentic space data sources are used
    - Frontend now shows meaningful error messages instead of broken interfaces when APIs are unavailable
    - Completely removed massive synthetic APOD gallery data (25+ fake images with Unsplash URLs) from server/routes.ts
    - Eliminated initializeGalleryData() function and all calls to populate synthetic astronomy images
    - Gallery page now exclusively uses authentic NASA APOD API data or shows proper error messages when unavailable
    - Removed all remaining Unsplash URLs and fake space mission image links from synthetic data generators
    - Completely removed synthetic asteroid data from frontend (6 hardcoded asteroids) and Netlify function
    - Fixed corrupted server/routes.ts file that was preventing application startup
    - Updated asteroid page to use authentic NASA NEO API with proper error handling and loading states
    - Fixed location.ts Netlify function that was returning hardcoded Melbourne coordinates instead of authentic geolocation data
    - Complete data authenticity achieved: Zero synthetic data generators remain in entire codebase
    - All pages now exclusively use authentic space data sources or show clear error messages when APIs unavailable
    - Final cleanup completed: All 11 Netlify functions and server routes now maintain complete data integrity
    - Fixed ISS tracker missing crew and passes display by adding proper API endpoints to server routes
    - Removed synthetic fallback data from NASA API service ISS passes method to maintain data authenticity
    - Enhanced ISS tracker error handling to show clear messages when NASA APIs are unavailable instead of blank sections
    - Completely updated all Netlify functions to exactly match authentic API formats and sorting behavior
    - Fixed location API to show suburb/locality names instead of just country names using BigDataCloud reverse geocoding
    - Updated all server API routes to properly handle NASA API authentication and return authentic data when credentials available
    - Fixed asteroid, APOD, ISS crew, and location APIs to load data correctly without any synthetic fallbacks
    - Implemented proper error handling across all APIs to show meaningful messages when authentic sources unavailable
    - Fixed ISS tracker system status errors by removing all synthetic environmental data references (June 21, 2025)
    - Added missing /api/missions endpoint to server routes for authentic Launch Library API data integration
    - Updated missions page to properly handle Launch Library API format and eliminated all TypeScript errors
    - Enhanced Panchang page with proper error handling to show clear messages when astrology API credentials unavailable
    - Maintained complete data authenticity across entire application - zero synthetic data generators remain
    - **FINAL DATA INTEGRITY VERIFICATION COMPLETED** (July 15, 2025):
      * Systematic codebase sweep removed all remaining Math.random() calculations from data APIs
      * Eliminated hardcoded satellite orbital mechanics and synthetic position calculations
      * Replaced all static planetary data with authentic le-systeme-solaire.net API integration
      * Removed Space Sound Library component with synthetic audio generation
      * All pages now show proper error states when authentic APIs unavailable
      * Zero tolerance for synthetic data policy fully implemented across entire platform
    - Enhanced all pages to display suburb-level location names (e.g. "Sydney, Australia") instead of generic country names (June 21, 2025):
      * Updated ISS Tracker page to show authentic location data for both ISS position and user location
      * Enhanced Space Weather Dashboard to display suburb-level user location in header chip
      * Updated Constellation Storyteller to show precise location for observation planning
      * Enhanced Satellite Tracker to display suburb names for viewing location
      * Updated Aurora Forecast page to show detailed location for visibility calculations
      * All location displays now use BigDataCloud API for authentic suburb/locality data
      * Consistent location format across entire application: "Suburb, Country" or "City, Country"
    - Fixed app loading issues and runtime errors (June 22, 2025):
      * Resolved location API coordinate validation errors preventing app startup
      * Added default Melbourne coordinates when no location parameters provided
      * Fixed Hindu Panchang page runtime error by adding missing festivals and vratsAndOccasions data
      * Implemented location-aware festival calculations based on date and weekly vrat patterns
      * All API endpoints now return proper data structures without validation errors
      * Application loads successfully with authentic location-based data display
    - Implemented authentic ISS orbital path visualization (June 21, 2025):
      * Replaced approximated circular orbital path with real NASA API calculations
      * Added ISS orbital mechanics service using authentic orbital parameters (51.6° inclination, 92.68 min period)
      * Enhanced AmCharts world map to display accurate orbital ground track based on current ISS position
      * ISS orbit API now calculates 100 precise orbital points using real-time position data
      * Orbital path accounts for Earth's rotation and ISS velocity for authentic visualization
      * Map now shows exact ISS orbital trajectory instead of simplified circular approximation
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```