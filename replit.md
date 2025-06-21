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
  * Added comprehensive 404 error page with space-themed design and navigation recovery
  * Enhanced home page navigation with complete feature showcase for all core pages
  * Implemented location-based satellite tracking with real orbital mechanics responding to user's actual coordinates
  * Fixed browser geolocation API to detect user's actual location instead of defaulting to fallback coordinates
  * Enhanced satellite position calculations and flyover predictions based on user's hemisphere and latitude
  * Cleaned up project structure by removing duplicate files, backup components, and unused assets
- June 21, 2025. Streamlined application architecture and integrated user's local changes
  * Integrated user's local changes that streamlined the application by removing several pages while preserving core functionality
  * Removed Virtual Telescope, Mars Rover, and other secondary pages to focus on core space exploration features
  * Preserved location-based satellite tracking functionality during integration
  * Updated navigation to reflect streamlined 13-page structure with core space features
  * Fixed asset import issues by using inline SVG logos instead of external image files
  * Updated App.tsx routing to match streamlined page structure
  * Enhanced navigation with hamburger menu supporting responsive grid layout for all remaining features
  * Updated home page to showcase 13 core interactive features with proper navigation links
  * Fixed CSS styling issues by removing jsx prop from style tags
  * Maintained all core space exploration features: Gallery, ISS Tracker, Solar System, Aurora, Asteroids, Missions, News, Sounds, Space Weather, Events, Constellations, Satellite Tracker, Hindu Panchang
  * Preserved location-based satellite tracking with real orbital mechanics and user coordinate detection
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```