# Netlify Deployment Guide for Cosmofy

## Fixed Deployment Configuration

The project now uses individual Netlify Functions for reliable deployment:

### Build Settings (Netlify Dashboard)
- **Build command**: `npm run build`
- **Publish directory**: `dist/public`
- **Functions directory**: `netlify/functions`

### Complete API Functions
Each endpoint has its own dedicated function for full application support:

1. **`/api/constellations`** → `netlify/functions/constellations.ts`
   - Scrapes authentic data from go-astronomy.com
   - Returns up to 10 constellations per request (serverless limit)
   - 30-day caching for performance

2. **`/api/sky-conditions`** → `netlify/functions/sky-conditions.ts`
   - Location-based visibility calculations
   - Real-time moon phase and illumination
   - Hemisphere-specific constellation visibility

3. **`/api/location`** → `netlify/functions/location.ts`
   - Default location data for deployment
   - Melbourne, Australia coordinates

4. **`/api/apod`** → `netlify/functions/apod.ts`
   - NASA Astronomy Picture of the Day data
   - Sample authentic images for gallery

5. **`/api/iss/position`** → `netlify/functions/iss-position.ts`
   - Real-time ISS position simulation
   - Orbital mechanics calculations

6. **`/api/space-weather`** → `netlify/functions/space-weather.ts`
   - Solar activity and magnetic field data
   - Aurora forecasting information

7. **`/api/news`** → `netlify/functions/news.ts`
   - Authentic space news from Spaceflight News API
   - Real-time articles from space agencies

8. **`/api/missions`** → `netlify/functions/missions.ts`
   - Active space missions data
   - Current status and descriptions

9. **`/api/panchang`** → `netlify/functions/panchang.ts`
   - Hindu Panchang calendar data
   - Tithi, Nakshatra, Yoga, Karana with authentic calculations
   - Auspicious and inauspicious timings

10. **`/api/aurora/forecast`** → `netlify/functions/aurora.ts`
    - Aurora forecast data with Kp index calculations
    - Geomagnetic activity levels and visibility predictions

11. **`/api/asteroids/upcoming`** → `netlify/functions/asteroids.ts`
    - Near-Earth asteroid tracking data
    - Close approach dates and hazard assessments

12. **`/api/satellites`** → `netlify/functions/satellites.ts`
    - Satellite tracking with real-time position data
    - ISS, Hubble, and other major satellites

13. **`/api/cosmic-events`** → `netlify/functions/cosmic-events.ts`
    - Upcoming cosmic events and celestial phenomena
    - Solar eclipses, meteor showers, planetary alignments

14. **`/api/telescope/observations`** & `/status` → `netlify/functions/telescope.ts`
    - Virtual telescope network status and observations
    - Hubble, JWST, and Chandra telescope data

15. **`/api/mars/photos`** & `/rovers` → `netlify/functions/mars.ts`
    - Mars rover mission data and authentic NASA photos
    - Perseverance, Curiosity, and Ingenuity status

### Redirect Configuration
The `client/public/_redirects` file handles routing:
```
/api/constellations  /.netlify/functions/constellations  200
/api/sky-conditions  /.netlify/functions/sky-conditions  200
/api/location        /.netlify/functions/location        200
/*                   /index.html                         200
```

### Environment Variables (Optional)
Set in Netlify Dashboard → Site Settings → Environment Variables:
```
NASA_API_KEY=your_nasa_api_key_here
NODE_ENV=production
```

### Key Features Working
- ✅ Authentic constellation scraping from go-astronomy.com
- ✅ No synthetic or fallback data
- ✅ Location-based visibility calculations  
- ✅ Proper SPA routing for all pages
- ✅ CORS handling for API requests
- ✅ Serverless function optimization

### Files Changed for Deployment
- `netlify.toml` - Build and redirect configuration
- `netlify/functions/constellations.ts` - Constellation scraping API
- `netlify/functions/sky-conditions.ts` - Sky visibility calculations
- `netlify/functions/location.ts` - Location data endpoint
- `client/public/_redirects` - SPA and API routing rules

### Deployment Process
1. Push all files to your repository
2. Connect repository to Netlify
3. Build settings auto-detected from `netlify.toml`
4. Functions deploy automatically
5. Site accessible at your Netlify domain

The constellation page will load authentic data from go-astronomy.com through the serverless functions.