# Getting Started with Cosmofy

## 🚀 Quick Start (1-2-3 Setup)

### 1. Prerequisites
- Node.js 18+ installed
- Web browser (Chrome, Firefox, Safari, Edge)

### 2. Launch
```bash
# One command setup and launch
node launch.js

# Or manual setup
npm install
node setup.js
npm run dev
```

### 3. Access
Open `http://localhost:5000` in your browser

## 🎯 What You Get

### 13 Space Exploration Features
1. **Home Dashboard** - Feature overview and navigation
2. **Astronomy Gallery** - NASA's daily space images
3. **ISS Tracker** - Real-time space station tracking
4. **Aurora Forecast** - Northern lights predictions
5. **Asteroid Tracker** - Near-Earth object monitoring
6. **Space Missions** - Active missions and launches
7. **Space News** - Latest space exploration news
8. **Space Weather** - Solar activity monitoring
9. **Virtual Telescope** - Space telescope access
10. **Cosmic Events** - Astronomical event calendar
11. **Constellation Guide** - Interactive star maps
12. **Satellite Tracker** - Real-time satellite positions
13. **Solar System** - Interactive planetary explorer

### Key Capabilities
- Real-time NASA data integration
- Interactive 3D visualizations
- Mobile-responsive design
- Offline-ready architecture
- Educational content and tips

## 🔧 Configuration

### Required Setup
1. **NASA API Key** (Free)
   - Visit: https://api.nasa.gov/
   - Sign up for free API key
   - Add to `.env` file: `NASA_API_KEY=your_key_here`

### Optional Setup
- **Database**: PostgreSQL for data persistence
- **Location**: Enable location access for astronomy features

## 📚 Documentation

Choose your path:

### Quick Setup
- `README.md` - Project overview and basic setup
- `launch.js` - One-command launch script

### Comprehensive Setup
- `LOCAL_SETUP.md` - Detailed local development guide
- `OFFLINE_SETUP.md` - Complete offline setup instructions
- `DEPLOYMENT_GUIDE.md` - Production deployment guide

### Verification
- `verify-setup.js` - Check all components are working
- `setup.js` - Automated setup script

## 🛠️ Available Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run setup verification
node verify-setup.js

# Quick launch (setup + start)
node launch.js
```

## 🌟 Features by API Key

### With NASA API Key
- ✅ Full astronomy gallery
- ✅ Real-time ISS tracking
- ✅ Asteroid monitoring
- ✅ Space weather data
- ✅ All 13 features fully functional

### Without NASA API Key
- ✅ Basic navigation and UI
- ✅ News and mission data
- ✅ Constellation guide
- ✅ Satellite tracking
- ⚠️ Limited space data features

## 🔍 Troubleshooting

### Common Issues
1. **Port 5000 in use**: Change PORT in .env or stop conflicting process
2. **NASA API errors**: Verify API key in .env file
3. **Dependencies missing**: Run `npm install`
4. **Node.js version**: Ensure version 18+

### Quick Fixes
```bash
# Reset everything
rm -rf node_modules package-lock.json
npm install

# Check configuration
node verify-setup.js

# View logs
npm run dev | head -50
```

## 📞 Support

### Self-Help
1. Run `node verify-setup.js` to check configuration
2. Check browser console for errors
3. Review documentation files

### Documentation Priority
1. **GETTING_STARTED.md** (this file) - Quick start
2. **README.md** - Project overview
3. **OFFLINE_SETUP.md** - Comprehensive setup
4. **LOCAL_SETUP.md** - Development details
5. **DEPLOYMENT_GUIDE.md** - Production deployment

---

**🌌 Ready to explore the cosmos? Run `node launch.js` to begin your space journey!**