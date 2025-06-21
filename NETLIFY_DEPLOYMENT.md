# Netlify Deployment Guide for Cosmofy

## Overview
This guide explains how to deploy Cosmofy to Netlify with full constellation scraping functionality.

## Deployment Steps

### 1. Build Configuration
The project is configured with:
- **Static Files**: Frontend built to `dist/` directory
- **Serverless Functions**: API endpoints in `netlify/functions/`
- **Redirects**: All API calls routed to serverless functions

### 2. Environment Variables
Set these in Netlify dashboard under Site Settings > Environment Variables:

```
NASA_API_KEY=your_nasa_api_key_here
NODE_ENV=production
```

### 3. Build Settings
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

### 4. API Endpoints
All API endpoints work through Netlify Functions:

- `/api/constellations` - Returns all 88 constellations with authentic scraped data
- `/api/sky-conditions?lat=X&lon=Y` - Location-based visibility calculations
- `/api/location` - User location detection
- `/api/apod` - NASA Astronomy Picture of the Day

### 5. Key Features Working on Netlify
- ✅ Constellation data scraping from go-astronomy.com and NOIRLab
- ✅ Location-based constellation visibility
- ✅ Authentic astronomical data extraction
- ✅ Image scraping from authentic sources
- ✅ All 88 IAU constellations with accurate data

### 6. Performance Optimizations
- Constellation data cached for 30 days
- Batch processing for faster scraping
- Parallel image extraction
- Optimized for serverless execution

### 7. Troubleshooting
If APIs don't load:
1. Check Netlify Functions logs in dashboard
2. Verify environment variables are set
3. Ensure build completed successfully
4. Check Network tab for CORS errors

## Manual Deployment Process
1. Run `npm run build` locally
2. Deploy `dist/` folder to Netlify
3. Copy `netlify/functions/` to deployment
4. Set environment variables
5. Test all API endpoints

The deployment will have full constellation functionality with authentic data scraping.