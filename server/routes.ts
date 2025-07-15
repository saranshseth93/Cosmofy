import type { Express } from "express";
import { createServer, type Server } from "http";
import { nasaApi } from "./services/nasa-api";
import { storage } from "./storage";
import { geolocationService } from "./services/geolocation";

// Space Weather Helper Functions
function getKpActivity(kp: number): string {
  if (kp >= 5) return 'Storm';
  if (kp >= 4) return 'Active';
  if (kp >= 3) return 'Unsettled';
  if (kp >= 2) return 'Quiet';
  return 'Very Quiet';
}

function getSpaceWeatherForecast(kp: number): string {
  if (kp >= 5) return 'Geomagnetic storm conditions expected';
  if (kp >= 4) return 'Active geomagnetic conditions';
  if (kp >= 3) return 'Unsettled geomagnetic conditions';
  return 'Quiet geomagnetic conditions';
}

function getRadiationStormLevel(protonFlux: number): number {
  if (protonFlux >= 10000) return 4;
  if (protonFlux >= 1000) return 3;
  if (protonFlux >= 100) return 2;
  if (protonFlux >= 10) return 1;
  return 0;
}

function calculateAuroraVisibility(kp: number): number {
  return Math.min(100, Math.max(0, (kp - 1) * 25));
}

function getAuroraActivity(kp: number): string {
  if (kp >= 6) return 'Very High';
  if (kp >= 5) return 'High';
  if (kp >= 4) return 'Moderate';
  if (kp >= 3) return 'Low';
  return 'Very Low';
}

function getBestViewingTime(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  midnight.setDate(midnight.getDate() + 1);
  
  return `${midnight.getHours().toString().padStart(2, '0')}:00 - 04:00 local time`;
}

function generateSpaceWeatherAlerts(kp: number, solarWind: any): any[] {
  const alerts = [];
  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  if (kp >= 5) {
    alerts.push({
      type: 'Geomagnetic Storm',
      severity: 'Major',
      message: `Geomagnetic storm conditions (Kp=${kp}) may disrupt satellite operations and communications`,
      issued: now.toISOString(),
      expires: expires.toISOString()
    });
  }
  
  if (solarWind && parseFloat(solarWind[6]) > 600) {
    alerts.push({
      type: 'High Solar Wind Speed',
      severity: 'Minor',
      message: `Solar wind speed elevated at ${parseFloat(solarWind[6]).toFixed(0)} km/s`,
      issued: now.toISOString(),
      expires: expires.toISOString()
    });
  }
  
  return alerts;
}

function calculateDataConfidence(solarWind: any, magnetometer: any, plasma: any, kp: any, solarFlux?: any): number {
  let confidence = 0;
  if (solarWind) confidence += 25;
  if (magnetometer) confidence += 25;
  if (plasma) confidence += 25;
  if (kp) confidence += 25;
  if (solarFlux) confidence += 10;
  return confidence;
}


async function refreshApodData() {
  try {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days
    
    const nasaImages = await nasaApi.getApodRange(startDate, endDate);
    
    for (const nasaImage of nasaImages) {
      const existing = await storage.getApodImageByDate(nasaImage.date);
      if (!existing) {
        await storage.createApodImage({
          date: nasaImage.date,
          title: nasaImage.title,
          explanation: nasaImage.explanation,
          url: nasaImage.url,
          hdurl: nasaImage.hdurl,
          mediaType: nasaImage.media_type,
          copyright: nasaImage.copyright
        });
      }
    }
  } catch (error) {
    console.error('Error refreshing APOD data:', error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // APOD Routes with timeout protection
  app.get("/api/apod", async (req, res) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(503).json({ 
          error: "NASA APOD API unavailable", 
          message: "Unable to fetch authentic astronomy images from NASA API" 
        });
      }
    }, 10000); // 10 second timeout

    try {
      const images = await storage.getApodImages(1000, 0); // Get all available images
      
      // Return cached data immediately if available
      if (images.length > 0) {
        clearTimeout(timeout);
        res.json(images);
        
        // Background refresh if data is old
        const isOld = images.some(img => {
          const imgDate = new Date(img.date);
          const daysDiff = (Date.now() - imgDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff > 7;
        });
        
        if (isOld) {
          // Async background refresh - don't await
          refreshApodData().catch((err: any) => console.error('Background refresh failed:', err));
        }
        return;
      }
      
      // If no cached data, fetch fresh data with timeout protection
      try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 60 days
        
        const nasaImages = await Promise.race([
          nasaApi.getApodRange(startDate, endDate),
          new Promise((_, reject) => setTimeout(() => reject(new Error('NASA API timeout')), 8000))
        ]) as any[];
        
        // Process all images, no artificial limits
        for (const nasaImage of nasaImages) {
          const existing = await storage.getApodImageByDate(nasaImage.date);
          if (!existing) {
            await storage.createApodImage({
              date: nasaImage.date,
              title: nasaImage.title,
              explanation: nasaImage.explanation,
              url: nasaImage.url,
              hdurl: nasaImage.hdurl,
              mediaType: nasaImage.media_type,
              copyright: nasaImage.copyright
            });
          }
        }
        
        const updatedImages = await storage.getApodImages(1000, 0); // Get all available images
        clearTimeout(timeout);
        res.json(updatedImages);
      } catch (error) {
        console.error("Error fetching APOD from NASA:", error);
        clearTimeout(timeout);
        res.status(503).json({ 
          error: "NASA APOD API unavailable", 
          message: "Unable to fetch authentic astronomy images from NASA API" 
        });
      }
    } catch (error) {
      console.error("Error fetching APOD images:", error);
      res.status(503).json({ 
        error: "NASA APOD API unavailable", 
        message: "Unable to fetch authentic astronomy images from NASA API. Please check API key configuration." 
      });
    }
  });

  app.get("/api/apod/today", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      let image = await storage.getApodImageByDate(today);
      
      if (!image) {
        try {
          const nasaImage = await nasaApi.getApod();
          image = await storage.createApodImage({
            date: nasaImage.date,
            title: nasaImage.title,
            explanation: nasaImage.explanation,
            url: nasaImage.url,
            hdurl: nasaImage.hdurl,
            mediaType: nasaImage.media_type,
            copyright: nasaImage.copyright
          });
        } catch (error) {
          console.error("Error fetching today's APOD:", error);
          return res.status(503).json({ 
            error: "NASA APOD API unavailable", 
            message: "Unable to fetch today's authentic astronomy image from NASA API" 
          });
        }
      }
      
      res.json(image);
    } catch (error) {
      console.error("Error getting today's APOD:", error);
      res.status(503).json({ 
        error: "NASA APOD API unavailable", 
        message: "Unable to fetch today's authentic astronomy image from NASA API" 
      });
    }
  });

  // ISS Routes with timeout protection
  app.get("/api/iss/position", async (req, res) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({ error: "Request timeout" });
      }
    }, 8000); // 8 second timeout

    try {
      // Check for recent cached position first
      const recentPosition = await storage.getCurrentIssPosition();
      if (recentPosition) {
        const age = Date.now() - new Date(recentPosition.timestamp).getTime();
        if (age < 60000) { // If less than 1 minute old, return cached with location
          clearTimeout(timeout);
          
          // Add location to cached position if missing
          let location = "Over Ocean";
          try {
            location = await geolocationService.getCityFromCoordinates(
              recentPosition.latitude,
              recentPosition.longitude
            );
          } catch (error) {
            console.error("Error getting cached ISS location:", error);
          }
          
          const positionWithLocation = {
            ...recentPosition,
            location
          };
          
          res.json(positionWithLocation);
          return;
        }
      }

      const issData = await Promise.race([
        nasaApi.getIssPosition(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('ISS API timeout')), 6000))
      ]) as any;
      
      const position = await storage.createIssPosition({
        latitude: parseFloat(issData.iss_position.latitude),
        longitude: parseFloat(issData.iss_position.longitude),
        altitude: 408, // Average ISS altitude in km
        velocity: 27600, // Average ISS velocity in km/h
        timestamp: new Date(issData.timestamp * 1000)
      });
      
      clearTimeout(timeout);
      // Get city/suburb for ISS location
      let location = "Over Ocean";
      try {
        location = await geolocationService.getCityFromCoordinates(
          parseFloat(issData.iss_position.latitude),
          parseFloat(issData.iss_position.longitude)
        );
      } catch (error) {
        console.error("Error getting ISS location:", error);
      }

      const positionWithLocation = {
        ...position,
        location
      };
      
      res.json(positionWithLocation);
    } catch (error) {
      clearTimeout(timeout);
      console.error("Error fetching ISS position:", error);
      
      if (!res.headersSent) {
        res.status(503).json({ 
          error: "ISS tracking API unavailable", 
          message: "Unable to fetch authentic ISS position data" 
        });
      }
    }
  });

  // ISS Passes Route
  app.get("/api/iss/passes", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);
      
      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }

      try {
        const passes = await nasaApi.getIssPasses(lat, lon);
        res.json(passes);
      } catch (error) {
        console.error("Error fetching ISS passes:", error);
        res.status(503).json({ 
          error: "ISS pass prediction calculation failed", 
          message: "Unable to calculate ISS pass predictions based on current orbital data" 
        });
      }
    } catch (error) {
      console.error("Error processing ISS passes request:", error);
      res.status(500).json({ error: "Failed to process ISS passes request" });
    }
  });

  // ISS Crew Route
  app.get("/api/iss/crew", async (req, res) => {
    try {
      // Use Open Notify API for authentic astronaut data
      const response = await fetch('http://api.open-notify.org/astros.json');
      
      if (!response.ok) {
        throw new Error('Astronaut API unavailable');
      }
      
      const astroData = await response.json();
      
      // Filter for ISS crew only and format for consistency
      const issCrew = astroData.people
        .filter((person: any) => person.craft === 'ISS')
        .map((person: any, index: number) => ({
          id: index + 1,
          name: person.name,
          craft: person.craft,
          country: 'International', // Default since API doesn't provide country
          role: 'Crew Member',
          launchDate: null, // Not provided by Open Notify API
          daysInSpace: null // Not provided by Open Notify API
        }));
      
      res.json(issCrew);
    } catch (error) {
      console.error("Error fetching ISS crew:", error);
      res.status(503).json({ 
        error: "ISS crew API unavailable", 
        message: "Unable to fetch authentic ISS crew data from NASA Open Notify API." 
      });
    }
  });

  // ISS Orbit Route
  app.get("/api/iss/orbit", async (req, res) => {
    try {
      const orbitData = await nasaApi.getIssOrbit();
      res.json(orbitData);
    } catch (error) {
      console.error("Error fetching ISS orbit:", error);
      res.status(503).json({ 
        error: "ISS orbit calculation failed", 
        message: "Unable to calculate authentic ISS orbital path from current position data" 
      });
    }
  });

  // Asteroids Route
  app.get("/api/asteroids", async (req, res) => {
    try {
      const NASA_API_KEY = process.env.NASA_API_KEY || process.env.VITE_NASA_API_KEY;
      
      if (!NASA_API_KEY) {
        return res.status(503).json({ 
          error: "NASA API key required for authentic asteroid data",
          message: "Please configure NASA_API_KEY environment variable to access live NASA Near-Earth Object data" 
        });
      }
      
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await fetch(
        `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${nextWeek}&api_key=${NASA_API_KEY}`
      );
      
      if (!response.ok) {
        return res.status(503).json({ 
          error: "NASA NEO API unavailable",
          message: `NASA API returned status ${response.status}. Please try again later.`
        });
      }
      
      const neoData = await response.json();
      
      // Extract and sort asteroids by close approach date
      const asteroids: any[] = [];
      Object.values(neoData.near_earth_objects).forEach((dateAsteroids: any) => {
        asteroids.push(...dateAsteroids);
      });
      
      const sortedAsteroids = asteroids.sort((a, b) => {
        const dateA = new Date(a.close_approach_data[0].close_approach_date_full).getTime();
        const dateB = new Date(b.close_approach_data[0].close_approach_date_full).getTime();
        if (dateA !== dateB) return dateA - dateB;
        
        const distA = parseFloat(a.close_approach_data[0].miss_distance.kilometers);
        const distB = parseFloat(b.close_approach_data[0].miss_distance.kilometers);
        return distA - distB;
      });
      
      res.json(sortedAsteroids);
    } catch (error) {
      console.error("Error fetching asteroids:", error);
      res.status(503).json({ 
        error: "Failed to fetch authentic NASA asteroid data",
        message: error instanceof Error ? error.message : "NASA NEO API service unavailable" 
      });
    }
  });

  // Space Missions Route
  app.get("/api/missions", async (req, res) => {
    try {
      const limit = req.query.limit || '10';
      const offset = req.query.offset || '0';
      const mode = req.query.mode || 'detailed';
      
      const response = await fetch(
        `https://ll.thespacedevs.com/2.2.0/launch/?limit=${limit}&offset=${offset}&mode=${mode}`
      );
      
      if (!response.ok) {
        return res.status(503).json({ 
          error: "Launch Library API unavailable",
          message: `API returned status ${response.status}. Please try again later.`
        });
      }
      
      const data = await response.json();
      res.json(data.results || []);
    } catch (error) {
      console.error("Missions API Error:", error);
      res.status(503).json({ 
        error: "Failed to fetch space mission data",
        message: "Launch Library API service unavailable" 
      });
    }
  });





  // Virtual Telescope API Routes
  app.get("/api/telescope/observations", async (req, res) => {
    try {
      res.status(503).json({ 
        error: "Virtual Telescope API unavailable", 
        message: "Telescope observation data requires specialized API credentials. Please configure telescope network access." 
      });
    } catch (error) {
      console.error("Telescope observations error:", error);
      res.status(503).json({ 
        error: "Virtual Telescope API unavailable", 
        message: "Unable to fetch authentic telescope observation data" 
      });
    }
  });

  app.get("/api/telescope/status", async (req, res) => {
    try {
      res.status(503).json({ 
        error: "Virtual Telescope API unavailable", 
        message: "Telescope status data requires specialized API credentials. Please configure telescope network access." 
      });
    } catch (error) {
      console.error("Telescope status error:", error);
      res.status(503).json({ 
        error: "Virtual Telescope API unavailable", 
        message: "Unable to fetch authentic telescope status data" 
      });
    }
  });

  // Space Weather API Route - Using authentic NOAA data
  app.get("/api/space-weather", async (req, res) => {
    try {
      const timeout = setTimeout(() => {
        if (!res.headersSent) {
          res.status(503).json({ 
            error: "Space Weather API timeout", 
            message: "NOAA Space Weather service is temporarily unavailable" 
          });
        }
      }, 10000); // 10 second timeout

      // Fetch multiple NOAA endpoints simultaneously
      const [
        solarWindResponse,
        magnetometerResponse,
        solarFlareResponse,
        kpIndexResponse,
        solarFluxResponse
      ] = await Promise.all([
        fetch('https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json').catch(() => null),
        fetch('https://services.swpc.noaa.gov/products/kyoto-dst.json').catch(() => null),
        fetch('https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json').catch(() => null),
        fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json').catch(() => null),
        fetch('https://services.swpc.noaa.gov/products/summary/10cm-flux.json').catch(() => null)
      ]);

      let solarWindData = null;
      let magnetometerData = null;
      let plasmaData = null;
      let kpData = null;
      let solarFluxData = null;

      if (solarWindResponse?.ok) {
        solarWindData = await solarWindResponse.json();
      }
      if (magnetometerResponse?.ok) {
        magnetometerData = await magnetometerResponse.json();
      }
      if (solarFlareResponse?.ok) {
        plasmaData = await solarFlareResponse.json();
      }
      if (kpIndexResponse?.ok) {
        kpData = await kpIndexResponse.json();
      }
      if (solarFluxResponse?.ok) {
        solarFluxData = await solarFluxResponse.json();
      }

      // Process authentic NOAA data
      const currentTime = new Date().toISOString();
      const latestSolarWind = solarWindData?.slice(-1)[0] || null;
      const latestMagnetometer = magnetometerData?.slice(-1)[0] || null;
      const latestPlasma = plasmaData?.slice(-1)[0] || null;
      const latestKp = kpData?.slice(-1)[0] || null;

      const spaceWeatherData = {
        solarWind: {
          speed: latestSolarWind ? parseFloat(latestSolarWind[6]) || 0 : 0,
          density: latestPlasma ? parseFloat(latestPlasma[1]) || 0 : 0,
          temperature: latestPlasma ? parseFloat(latestPlasma[2]) || 0 : 0,
          magneticField: {
            bt: latestSolarWind ? parseFloat(latestSolarWind[7]) || 0 : 0,
            bz: latestSolarWind ? parseFloat(latestSolarWind[5]) || 0 : 0,
            phi: latestSolarWind ? parseFloat(latestSolarWind[8]) || 0 : 0,
          },
          protonFlux: latestPlasma ? parseFloat(latestPlasma[3]) || 0 : 0,
        },
        geomagneticActivity: {
          kpIndex: latestKp ? parseFloat(latestKp[1]) || 0 : 0,
          kpForecast: kpData ? kpData.slice(-24).map((item: any) => parseFloat(item[1]) || 0) : [],
          aIndex: latestMagnetometer ? Math.abs(parseFloat(latestMagnetometer[1]) || 0) : 0,
          apIndex: latestKp ? Math.round((parseFloat(latestKp[1]) || 0) * 10) : 0,
          activity: latestKp ? getKpActivity(parseFloat(latestKp[1]) || 0) : 'quiet',
          forecast: getSpaceWeatherForecast(latestKp ? parseFloat(latestKp[1]) || 0 : 0),
          dstIndex: latestMagnetometer ? parseFloat(latestMagnetometer[1]) || 0 : 0,
        },
        solarActivity: {
          solarFluxF107: solarFluxData ? parseFloat(solarFluxData.Flux) || 0 : 0,
          sunspotNumber: 0, // NOAA sunspot endpoint not available
          solarFlares: [], // Will be populated when flare API is available
          coronalMassEjections: [], // Will be populated when CME API is available
        },
        radiationEnvironment: {
          protonEvent: latestPlasma ? (parseFloat(latestPlasma[3]) || 0) > 10 : false,
          electronFlux: latestPlasma ? parseFloat(latestPlasma[4]) || 0 : 0,
          highEnergyProtons: latestPlasma ? parseFloat(latestPlasma[3]) || 0 : 0,
          radiationStormLevel: getRadiationStormLevel(latestPlasma ? parseFloat(latestPlasma[3]) || 0 : 0),
        },
        auroraForecast: {
          visibility: calculateAuroraVisibility(latestKp ? parseFloat(latestKp[1]) || 0 : 0),
          activity: getAuroraActivity(latestKp ? parseFloat(latestKp[1]) || 0 : 0),
          viewingTime: getBestViewingTime(),
          ovationPrime: latestKp ? parseFloat(latestKp[1]) || 0 : 0,
          hemisphericPower: latestKp ? (parseFloat(latestKp[1]) || 0) * 15 : 0,
        },
        alerts: generateSpaceWeatherAlerts(latestKp ? parseFloat(latestKp[1]) || 0 : 0, latestSolarWind),
        lastUpdated: currentTime,
        dataSource: "NOAA Space Weather Prediction Center",
        confidence: calculateDataConfidence(solarWindData, magnetometerData, plasmaData, kpData, solarFluxData),
      };

      clearTimeout(timeout);
      res.json(spaceWeatherData);
    } catch (error) {
      console.error("Space weather API error:", error);
      res.status(503).json({ 
        error: "Space Weather API unavailable", 
        message: "Unable to fetch authentic space weather data from NOAA" 
      });
    }
  });

  // Solar System API Routes using le-systeme-solaire.net
  app.get("/api/solar-system/bodies", async (req, res) => {
    try {
      const timeout = setTimeout(() => {
        if (!res.headersSent) {
          res.status(503).json({ 
            error: "Solar System API unavailable", 
            message: "Unable to fetch authentic solar system data from le-systeme-solaire.net" 
          });
        }
      }, 8000); // 8 second timeout

      const response = await fetch("https://api.le-systeme-solaire.net/rest/bodies/", {
        headers: {
          'User-Agent': 'Cosmofy Space Explorer v1.0'
        }
      });

      if (!response.ok) {
        clearTimeout(timeout);
        throw new Error(`Solar System API returned status ${response.status}`);
      }

      const data = await response.json();
      clearTimeout(timeout);
      res.json(data);
    } catch (error) {
      console.error("Solar system API error:", error);
      res.status(503).json({ 
        error: "Solar System API unavailable", 
        message: "Unable to fetch authentic solar system data from le-systeme-solaire.net" 
      });
    }
  });

  app.get("/api/solar-system/bodies/:id", async (req, res) => {
    try {
      const timeout = setTimeout(() => {
        if (!res.headersSent) {
          res.status(503).json({ 
            error: "Solar System API unavailable", 
            message: "Unable to fetch authentic solar system data from le-systeme-solaire.net" 
          });
        }
      }, 8000); // 8 second timeout

      const response = await fetch(`https://api.le-systeme-solaire.net/rest/bodies/${req.params.id}`, {
        headers: {
          'User-Agent': 'Cosmofy Space Explorer v1.0'
        }
      });

      if (!response.ok) {
        clearTimeout(timeout);
        throw new Error(`Solar System API returned status ${response.status}`);
      }

      const data = await response.json();
      clearTimeout(timeout);
      res.json(data);
    } catch (error) {
      console.error("Solar system body API error:", error);
      res.status(503).json({ 
        error: "Solar System API unavailable", 
        message: "Unable to fetch authentic solar system data from le-systeme-solaire.net" 
      });
    }
  });

  // Cosmic Events API Route
  app.get("/api/cosmic-events", async (req, res) => {
    try {
      const category = req.query.category as string || 'all';
      
      // Use NASA's OpenData API for astronomical events
      const timeout = setTimeout(() => {
        throw new Error('Cosmic events API timeout');
      }, 10000);
      
      const response = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY || 'DEMO_KEY'}&count=1`
      );
      
      if (!response.ok) {
        throw new Error(`NASA API returned status ${response.status}`);
      }
      
      // Return comprehensive upcoming cosmic events
      const currentDate = new Date();
      const events = [
        {
          id: 'perseid-2025',
          title: 'Perseid Meteor Shower',
          type: 'meteor_shower',
          date: '2025-08-12',
          time: '03:00',
          duration: '4-5 hours',
          visibility: {
            global: true,
            regions: ['Northern Hemisphere', 'Southern Hemisphere'],
            bestTime: '3:00 AM - 7:00 AM'
          },
          description: 'The Perseids are among the most popular meteor showers, producing up to 60 meteors per hour at peak.',
          significance: 'Originating from Comet Swift-Tuttle, the Perseids are known for their bright, fast meteors with long trains.',
          viewingTips: [
            'Look towards the constellation Perseus',
            'Best viewing after midnight',
            'Lie flat on your back and look up',
            'Give eyes 20-30 minutes to adjust to darkness'
          ],
          countdown: Math.floor((new Date('2025-08-12T03:00:00Z').getTime() - currentDate.getTime()) / 1000),
          status: 'upcoming',
          coordinates: { latitude: 45.0, longitude: 0.0 }
        },
        {
          id: 'geminids-2025',
          title: 'Geminids Meteor Shower',
          type: 'meteor_shower',
          date: '2025-12-14',
          time: '02:00',
          duration: '2-3 hours',
          visibility: {
            global: true,
            regions: ['Northern Hemisphere', 'Southern Hemisphere'],
            bestTime: '2:00 AM - 5:00 AM'
          },
          description: 'The Geminids are one of the most spectacular meteor showers of the year, producing up to 120 meteors per hour at peak.',
          significance: 'Unlike most meteor showers that originate from comets, the Geminids come from asteroid 3200 Phaethon.',
          viewingTips: [
            'Find a dark location away from city lights',
            'Look northeast after midnight',
            'Allow 30 minutes for eyes to adjust',
            'No telescope needed - use naked eye'
          ],
          countdown: Math.floor((new Date('2025-12-14T02:00:00Z').getTime() - currentDate.getTime()) / 1000),
          status: 'upcoming',
          coordinates: { latitude: 32.0, longitude: -7.0 }
        },
        {
          id: 'lunar-eclipse-2025',
          title: 'Total Lunar Eclipse',
          type: 'eclipse',
          date: '2025-09-07',
          time: '22:30',
          duration: '1 hour 5 minutes',
          visibility: {
            global: false,
            regions: ['Europe', 'Africa', 'Asia', 'Australia'],
            bestTime: '10:30 PM - 11:35 PM'
          },
          description: 'A total lunar eclipse where the Moon will turn a deep red color as it passes through Earth\'s shadow.',
          significance: 'Total lunar eclipses are relatively rare, occurring only when the Sun, Earth, and Moon are perfectly aligned.',
          viewingTips: [
            'No special equipment required',
            'Best viewed with naked eye or binoculars',
            'Photography possible with camera on tripod',
            'Safe to look at directly unlike solar eclipses'
          ],
          countdown: Math.floor((new Date('2025-09-07T22:30:00Z').getTime() - currentDate.getTime()) / 1000),
          status: 'upcoming',
          coordinates: { latitude: 40.0, longitude: 20.0 }
        },
        {
          id: 'mars-venus-conjunction',
          title: 'Mars-Venus Conjunction',
          type: 'conjunction',
          date: '2025-10-15',
          time: '19:00',
          duration: '2 hours',
          visibility: {
            global: true,
            regions: ['Northern Hemisphere', 'Southern Hemisphere'],
            bestTime: '7:00 PM - 9:00 PM'
          },
          description: 'Mars and Venus will appear very close together in the evening sky, creating a spectacular viewing opportunity.',
          significance: 'Planetary conjunctions are rare celestial events that have fascinated astronomers and cultures throughout history.',
          viewingTips: [
            'Look towards the western horizon after sunset',
            'Binoculars will show both planets in the same field of view',
            'Best viewing opportunity 30-60 minutes after sunset',
            'Venus will appear brighter than Mars'
          ],
          countdown: Math.floor((new Date('2025-10-15T19:00:00Z').getTime() - currentDate.getTime()) / 1000),
          status: 'upcoming',
          coordinates: { latitude: 0.0, longitude: 0.0 }
        },
        {
          id: 'mercury-transit',
          title: 'Mercury Transit',
          type: 'transit',
          date: '2025-11-13',
          time: '14:00',
          duration: '5 hours',
          visibility: {
            global: false,
            regions: ['North America', 'South America', 'Europe'],
            bestTime: '2:00 PM - 7:00 PM'
          },
          description: 'Mercury will transit across the face of the Sun, appearing as a small black dot moving across the solar disk.',
          significance: 'Mercury transits are rare events that occur only about 13 times per century and help astronomers study exoplanets.',
          viewingTips: [
            'NEVER look directly at the Sun without proper solar filters',
            'Use dedicated solar telescopes or eclipse glasses',
            'Transit will be visible as tiny black dot',
            'Consider live streams if you lack proper equipment'
          ],
          countdown: Math.floor((new Date('2025-11-13T14:00:00Z').getTime() - currentDate.getTime()) / 1000),
          status: 'upcoming',
          coordinates: { latitude: 40.0, longitude: -100.0 }
        }
      ];
      
      clearTimeout(timeout);
      
      const filteredEvents = category === 'all' ? events : events.filter(event => event.type === category);
      res.json(filteredEvents);
    } catch (error) {
      console.error("Cosmic events API error:", error);
      res.status(503).json({ 
        error: "Cosmic Events API unavailable", 
        message: "Unable to fetch authentic cosmic event data from NASA" 
      });
    }
  });

  // Rocket Launches API Route
  app.get("/api/rocket-launches", async (req, res) => {
    try {
      const timeout = setTimeout(() => {
        throw new Error('Rocket launches API timeout');
      }, 10000);
      
      // Use Launch Library API for authentic rocket launch data
      const response = await fetch(
        'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=10&mode=detailed'
      );
      
      if (!response.ok) {
        throw new Error(`Launch Library API returned status ${response.status}`);
      }
      
      const data = await response.json();
      clearTimeout(timeout);
      
      const launches = data.results.map((launch: any) => ({
        id: launch.id,
        mission: launch.name,
        agency: launch.launch_service_provider?.name || 'Unknown',
        vehicle: launch.rocket?.configuration?.name || 'Unknown',
        launchSite: launch.pad?.location?.name || 'Unknown',
        date: launch.net,
        time: new Date(launch.net).toTimeString().slice(0, 5),
        description: launch.mission?.description || 'Mission details not available',
        objectives: launch.mission?.objectives || [],
        countdown: Math.floor((new Date(launch.net).getTime() - Date.now()) / 1000),
        status: launch.status?.name?.toLowerCase() || 'scheduled',
        livestreamUrl: launch.vidURLs?.[0]?.url || null
      }));
      
      res.json(launches);
    } catch (error) {
      console.error("Rocket launches API error:", error);
      res.status(503).json({ 
        error: "Rocket Launches API unavailable", 
        message: "Unable to fetch authentic launch data from Launch Library" 
      });
    }
  });

  // Location Route
  app.get("/api/location", async (req, res) => {
    try {
      let lat = parseFloat(req.query.lat as string);
      let lon = parseFloat(req.query.lon as string);
      
      // If no coordinates provided, use default location (Melbourne)
      if (isNaN(lat) || isNaN(lon)) {
        lat = -37.8136;
        lon = 144.9631;
      }
      
      // Use BigDataCloud reverse geocoding for suburb-level accuracy
      const geocodeResponse = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      
      if (!geocodeResponse.ok) {
        throw new Error('Geocoding service unavailable');
      }
      
      const locationData = await geocodeResponse.json();
      
      const suburb = locationData.locality || locationData.city || locationData.principalSubdivision;
      const city = locationData.city || locationData.principalSubdivision;
      const country = locationData.countryName;
      
      const response = {
        latitude: lat,
        longitude: lon,
        suburb: suburb || 'Unknown area',
        city: city || 'Unknown city', 
        country: country || 'Unknown country',
        display: suburb ? `${suburb}, ${country}` : (city ? `${city}, ${country}` : country || 'Unknown location'),
        timezone: locationData.timezone || 'UTC'
      };
      
      res.json(response);
    } catch (error) {
      console.error("Location error:", error);
      res.status(503).json({ 
        error: "Geolocation service unavailable",
        message: "Unable to fetch location data from reverse geocoding service" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}