# Cosmofy Deployment Guide

## Frontend-Only Deployment (Netlify/Vercel)

### Build Command
```bash
vite build
```

### Publish Directory
```
dist
```

### Environment Variables Required
```
VITE_NASA_API_KEY=your_nasa_api_key_here
```

### Netlify Configuration
The `netlify.toml` file is configured for:
- Build command: `vite build`
- Publish directory: `dist`
- SPA routing with redirects to `index.html`

### Deployment Steps
1. Connect your repository to Netlify
2. Set build command: `vite build`
3. Set publish directory: `dist`
4. Add environment variable: `VITE_NASA_API_KEY`
5. Deploy

### Notes
- This is a frontend-only deployment
- Backend API calls will fail without a running server
- Some features may require backend integration for full functionality
- Images use object-contain to show full constellation images
- All constellation data is scraped from go-astronomy.com with fallback systems