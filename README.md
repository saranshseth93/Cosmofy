# Cosmofy - Space Exploration Platform

A comprehensive web application for space exploration featuring real-time NASA data, interactive visualizations, and educational content about space phenomena.

## 🚀 Features

- **Astronomy Gallery** - NASA's daily astronomy images with filtering and search
- **ISS Tracker** - Real-time International Space Station tracking with crew info
- **Aurora Forecast** - Northern/Southern Lights visibility predictions
- **Asteroid Tracker** - Near-Earth Object monitoring and approach predictions
- **Space Missions** - Active missions and rocket launch schedules
- **Space News** - Latest space exploration news and updates
- **Space Weather** - Solar activity and geomagnetic storm monitoring
- **Virtual Telescope** - Access to space telescope observations
- **Cosmic Events** - Upcoming eclipses, meteor showers, and astronomical events
- **Constellation Guide** - Interactive star patterns with mythology
- **Satellite Tracker** - Real-time satellite tracking with flyover predictions
- **Solar System Explorer** - Interactive planetary data and orbital mechanics

## 🛠️ Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (in-memory fallback)
- **APIs**: NASA, Launch Library, Spaceflight News, NOAA Space Weather
- **Build Tools**: Vite, esbuild
- **Deployment**: Replit-optimized with auto-scaling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cosmofy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your NASA API key:
   ```env
   NASA_API_KEY=your_nasa_api_key_here
   ```
   
   Get your free NASA API key at: https://api.nasa.gov/

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

## 📖 Detailed Setup

For comprehensive setup instructions, troubleshooting, and deployment options, see:
- [LOCAL_SETUP.md](LOCAL_SETUP.md) - Complete local development guide
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Production deployment instructions

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run code linting
- `npm run type-check` - Run TypeScript type checking

## 🌟 Key Features

### Real-time Data Integration
- Live ISS position updates every 30 seconds
- Current space weather conditions
- Upcoming rocket launches
- Near-Earth asteroid tracking

### Interactive Visualizations
- 3D Earth visualization for ISS tracking
- Interactive constellation maps
- Satellite orbital tracking
- Aurora visibility predictions

### Educational Content
- Constellation mythology and stories
- Space mission details and objectives
- Astronomical event explanations
- Space photography tips

### Responsive Design
- Mobile-optimized interface
- Touch-friendly interactions
- Adaptive layouts for all screen sizes
- Progressive web app features

## 🔑 API Requirements

### Required
- **NASA API Key** - Free at https://api.nasa.gov/
  - Enables: Gallery, ISS tracking, asteroid data, space weather

### Optional (Auto-configured)
- Launch Library API - Rocket launch data
- Spaceflight News API - Space news articles
- NOAA Space Weather API - Geomagnetic data
- BigDataCloud API - Location services

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🔒 Privacy & Security

- No user data storage
- Optional location access for astronomy features
- Secure API key handling
- CORS protection enabled

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- NASA for providing free access to space data
- Launch Library for rocket launch information
- Spaceflight News for space news aggregation
- NOAA for space weather data
- The open-source community for excellent libraries and tools

## 🆘 Support

- Check [LOCAL_SETUP.md](LOCAL_SETUP.md) for troubleshooting
- Review [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for deployment issues
- Open an issue for bug reports or feature requests

---

**Built with ❤️ for space exploration enthusiasts**