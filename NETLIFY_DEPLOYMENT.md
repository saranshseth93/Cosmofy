# Netlify Deployment Guide for Cosmofy

## Fixed Deployment Configuration

The project now uses individual Netlify Functions for reliable deployment:

### Build Settings (Netlify Dashboard)
- **Build command**: `npm run build`
- **Publish directory**: `dist/public`
- **Functions directory**: `netlify/functions`

### Working API Functions
Each endpoint has its own dedicated function:

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