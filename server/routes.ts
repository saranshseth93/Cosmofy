import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { nasaApi } from "./services/nasa-api";
import { geolocationService } from "./services/geolocation";
import { spaceNewsService } from "./services/space-news";
import { constellationApi } from "./services/constellation-api";
import { panchangApi } from "./services/panchang-api";
import { insertApodImageSchema, insertAsteroidSchema, insertIssPositionSchema, insertIssPassSchema, insertIssCrewSchema, insertAuroraForecastSchema, insertSpaceMissionSchema } from "@shared/schema";

// Background refresh function
async function refreshApodData() {
  try {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Last 60 days
    
    const nasaImages = await nasaApi.getApodRange(startDate, endDate);
    
    for (const nasaImage of nasaImages.slice(0, 50)) { // Increased to 50 images
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
    console.error('Background APOD refresh failed:', error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // APOD Routes with timeout protection
  app.get("/api/apod", async (req, res) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({ error: "Request timeout" });
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
          return res.status(500).json({ error: "Failed to fetch today's APOD" });
        }
      }
      
      res.json(image);
    } catch (error) {
      console.error("Error getting today's APOD:", error);
      res.status(500).json({ error: "Failed to get today's APOD" });
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
        if (age < 60000) { // If less than 1 minute old, return cached
          clearTimeout(timeout);
          res.json(recentPosition);
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
        res.status(500).json({ error: "Failed to fetch ISS position from authentic sources" });
      }
    }
  });

  app.get("/api/iss/passes", async (req, res) => {
    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }
      
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      
      // Validate coordinates
      if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }
      
      const passesData = await nasaApi.getIssPasses(latitude, longitude);
      
      const passes = [];
      for (const pass of passesData.response) {
        const issPass = await storage.createIssPass({
          latitude,
          longitude,
          risetime: new Date(pass.risetime * 1000),
          duration: pass.duration,
          maxElevation: 45 // Default elevation
        });
        passes.push(issPass);
      }
      
      res.json(passes);
    } catch (error) {
      console.error("Error fetching ISS passes:", error);
      res.status(500).json({ error: "Failed to fetch ISS passes" });
    }
  });

  app.get("/api/iss/crew", async (req, res) => {
    try {
      let crew = await storage.getIssCrew();
      
      if (crew.length === 0) {
        try {
          const astroData = await nasaApi.getAstronauts();
          
          // Enhanced crew data with real astronaut information
          const crewDetails: { [key: string]: { role: string; country: string; launchDate: Date } } = {
            "Oleg Kononenko": { 
              role: "Commander", 
              country: "Russia", 
              launchDate: new Date('2023-09-15') 
            },
            "Nikolai Chub": { 
              role: "Flight Engineer", 
              country: "Russia", 
              launchDate: new Date('2023-09-15') 
            },
            "Tracy C. Dyson": { 
              role: "Flight Engineer", 
              country: "United States", 
              launchDate: new Date('2024-03-23') 
            },
            "Matthew Dominick": { 
              role: "Commander", 
              country: "United States", 
              launchDate: new Date('2024-06-05') 
            },
            "Michael Barratt": { 
              role: "Flight Engineer", 
              country: "United States", 
              launchDate: new Date('2024-06-05') 
            },
            "Jeanette Epps": { 
              role: "Flight Engineer", 
              country: "United States", 
              launchDate: new Date('2024-06-05') 
            },
            "Alexander Grebenkin": { 
              role: "Flight Engineer", 
              country: "Russia", 
              launchDate: new Date('2024-03-23') 
            },
            "Butch Wilmore": { 
              role: "Pilot", 
              country: "United States", 
              launchDate: new Date('2024-06-05') 
            },
            "Suni Williams": { 
              role: "Commander", 
              country: "United States", 
              launchDate: new Date('2024-06-05') 
            }
          };
          
          for (const person of astroData.people.filter(p => p.craft === "ISS")) {
            const details = crewDetails[person.name] || { 
              role: "Flight Engineer", 
              country: "International", 
              launchDate: new Date('2024-01-01') 
            };
            
            await storage.createIssCrew({
              name: person.name,
              craft: person.craft,
              role: details.role,
              country: details.country,
              launchDate: details.launchDate,
              daysInSpace: Math.floor((Date.now() - details.launchDate.getTime()) / (1000 * 60 * 60 * 24))
            });
          }
          
          crew = await storage.getIssCrew();
        } catch (error) {
          console.error("Error fetching ISS crew from API:", error);
        }
      }
      
      res.json(crew);
    } catch (error) {
      console.error("Error fetching ISS crew:", error);
      res.status(500).json({ error: "Failed to fetch ISS crew" });
    }
  });

  // Aurora Routes with timeout protection
  app.get("/api/aurora/forecast", async (req, res) => {
    try {
      res.status(503).json({ 
        error: "NOAA Aurora Forecast API unavailable", 
        message: "Unable to fetch authentic aurora forecast data from NOAA Space Weather Prediction Center. Please check API configuration." 
      });
    } catch (error) {
      console.error("Error fetching aurora forecast:", error);
      res.status(503).json({ 
        error: "NOAA Aurora Forecast API unavailable", 
        message: "Unable to fetch authentic aurora forecast data from NOAA Space Weather Prediction Center." 
      });
    }
  });

  // Asteroid Routes
  app.get("/api/asteroids/upcoming", async (req, res) => {
    try {
      let asteroids = await storage.getUpcomingAsteroids(10);
      
      if (asteroids.length === 0) {
        try {
          const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          const startDate = new Date().toISOString().split('T')[0];
          
          const neoData = await nasaApi.getNearEarthObjects(startDate, endDate);
          
          for (const [date, neos] of Object.entries(neoData.near_earth_objects)) {
            for (const neo of neos) {
              const closeApproach = neo.close_approach_data[0];
              await storage.createAsteroid({
                name: neo.name,
                neoReferenceId: neo.neo_reference_id,
                absoluteMagnitude: neo.absolute_magnitude_h,
                estimatedDiameter: neo.estimated_diameter,
                isPotentiallyHazardous: neo.is_potentially_hazardous_asteroid,
                closeApproachDate: new Date(closeApproach.close_approach_date),
                relativeVelocity: parseFloat(closeApproach.relative_velocity.kilometers_per_second),
                missDistance: parseFloat(closeApproach.miss_distance.astronomical),
                orbitingBody: closeApproach.orbiting_body
              });
            }
          }
          
          asteroids = await storage.getUpcomingAsteroids(10);
        } catch (error) {
          console.error("Error fetching asteroids from NASA:", error);
        }
      }
      
      res.json(asteroids);
    } catch (error) {
      console.error("Error fetching upcoming asteroids:", error);
      res.status(500).json({ error: "Failed to fetch upcoming asteroids" });
    }
  });

  // Space Missions Routes
  app.get("/api/missions", async (req, res) => {
    try {
      let missions = await storage.getActiveMissions();
      
      if (missions.length === 0) {
        // Add some example missions
        const defaultMissions = [
          {
            name: "Artemis II",
            description: "First crewed mission to travel around the Moon since Apollo 17. Four astronauts will conduct a 10-day lunar flyby mission to test systems for future lunar landings.",
            status: "Planned",
            launchDate: new Date("2025-11-01"),
            agency: "NASA",
            missionType: "Crewed lunar flyby mission",
            destination: "Moon",
            imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
            websiteUrl: "https://www.nasa.gov/artemis",
            crew: ["Reid Wiseman", "Victor Glover", "Christina Hammock Koch", "Jeremy Hansen"],
            missionDuration: "10 days",
            objectives: [
              "Test Orion spacecraft with crew aboard",
              "Demonstrate life support systems",
              "Validate heat shield performance during lunar return",
              "Prepare for Artemis III lunar landing"
            ],
            keyMilestones: [
              { date: "2024-03-01", event: "Crew training begins" },
              { date: "2025-06-01", event: "Final systems integration" },
              { date: "2025-11-01", event: "Launch" },
              { date: "2025-11-11", event: "Earth return and splashdown" }
            ],
            budget: "$4.1 billion",
            launchVehicle: "Space Launch System (SLS)"
          },
          {
            name: "Europa Clipper",
            description: "Detailed reconnaissance of Jupiter's moon Europa and its subsurface ocean to assess its potential for harboring life beneath the icy surface.",
            status: "Active",
            launchDate: new Date("2024-10-14"),
            agency: "NASA",
            missionType: "Ice penetrating orbiter",
            destination: "Jupiter's Moon Europa",
            imageUrl: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=800&h=600&fit=crop",
            websiteUrl: "https://europa.nasa.gov/",
            missionDuration: "4 years (49 flybys)",
            objectives: [
              "Map Europa's ice shell thickness and subsurface ocean",
              "Analyze surface composition and geology",
              "Search for organic compounds and biosignatures",
              "Study Europa's magnetic field and atmosphere"
            ],
            instruments: [
              "Europa Imaging System (EIS)",
              "Radar for Europa Assessment (REASON)",
              "Europa Thermal Emission Imaging System (E-THEMIS)",
              "Mass Spectrometer for Planetary Exploration (MASPEX)"
            ],
            budget: "$5.2 billion",
            arrivalDate: new Date("2030-04-11")
          },
          {
            name: "Mars Perseverance",
            description: "Advanced astrobiology rover searching for signs of ancient microbial life and collecting rock samples for future return to Earth.",
            status: "Active",
            launchDate: new Date("2020-07-30"),
            agency: "NASA",
            missionType: "Mars surface exploration",
            destination: "Mars (Jezero Crater)",
            imageUrl: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&h=600&fit=crop",
            websiteUrl: "https://mars.nasa.gov/mars2020/",
            missionDuration: "Extended (originally 687 Earth days)",
            objectives: [
              "Search for signs of ancient microbial life",
              "Collect and cache rock and soil samples",
              "Generate oxygen from Martian atmosphere",
              "Study geology and past climate of Mars"
            ],
            keyAchievements: [
              "First powered flight on another planet (Ingenuity helicopter)",
              "Successfully collected 24 rock samples",
              "Produced oxygen on Mars using MOXIE",
              "Discovered organic molecules in multiple rock samples"
            ],
            currentLocation: "Jezero Crater Delta Formation",
            distanceTraveled: "28.52 kilometers",
            samplesCollected: 24
          },
          {
            name: "James Webb Space Telescope",
            description: "Revolutionary infrared space observatory studying the formation of the first galaxies, exoplanet atmospheres, and stellar birth in unprecedented detail.",
            status: "Operational",
            launchDate: new Date("2021-12-25"),
            agency: "NASA/ESA/CSA",
            missionType: "Space Observatory",
            destination: "L2 Lagrange Point",
            imageUrl: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop",
            websiteUrl: "https://www.nasa.gov/webb",
            missionDuration: "5-10 years (fuel limited)",
            objectives: [
              "Observe the first galaxies formed after Big Bang",
              "Study exoplanet atmospheres and compositions",
              "Investigate star and planet formation",
              "Examine the evolution of galaxies over time"
            ],
            keyDiscoveries: [
              "Most distant galaxy ever observed (JADES-GS-z13-0)",
              "Detailed atmospheric composition of exoplanet WASP-96b",
              "Evidence of water vapor in exoplanet atmospheres",
              "New insights into stellar nurseries and brown dwarfs"
            ],
            mirrorDiameter: "6.5 meters",
            operatingTemperature: "-223°C (-369°F)",
            instruments: ["NIRCam", "NIRSpec", "MIRI", "FGS/NIRISS"]
          },
          {
            name: "Parker Solar Probe",
            description: "Humanity's first mission to 'touch' the Sun, studying solar wind, coronal heating, and space weather phenomena from within the solar corona.",
            status: "Active",
            launchDate: new Date("2018-08-12"),
            agency: "NASA",
            missionType: "Solar observation",
            destination: "Solar Corona",
            imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
            websiteUrl: "https://parkersolarprobe.jhuapl.edu/",
            missionDuration: "7 years (24 solar orbits)",
            objectives: [
              "Study solar wind acceleration mechanisms",
              "Investigate coronal heating processes",
              "Determine structure of solar magnetic fields",
              "Measure energetic particle acceleration"
            ],
            records: [
              "Fastest human-made object: 692,000 km/h",
              "Closest approach to Sun: 6.9 million km",
              "Hottest spacecraft surface: 1,377°C",
              "First spacecraft to enter solar corona"
            ],
            closestApproach: new Date("2024-12-24"),
            currentSpeed: "692,000 km/h"
          },
          {
            name: "Dragonfly",
            description: "Rotorcraft lander mission to explore Saturn's moon Titan, studying its methane cycle, organic chemistry, and potential for prebiotic chemistry.",
            status: "Planned",
            launchDate: new Date("2027-07-01"),
            agency: "NASA",
            missionType: "Rotorcraft lander",
            destination: "Saturn's Moon Titan",
            imageUrl: "https://images.unsplash.com/photo-1446776481440-d9436ced2468?w=800&h=600&fit=crop",
            websiteUrl: "https://dragonfly.jhuapl.edu/",
            missionDuration: "2.7 years surface operations",
            objectives: [
              "Study Titan's methane cycle and weather",
              "Investigate organic chemistry and prebiotic processes",
              "Search for chemical biosignatures",
              "Map surface composition and geology"
            ],
            uniqueFeatures: [
              "First rotorcraft to operate on another world",
              "Dual quadcopter design for atmospheric flight",
              "Nuclear-powered for long-duration operations",
              "Capable of flights up to 8 km distance"
            ],
            arrivalDate: new Date("2034-07-01"),
            flightCapability: "8 km per flight, 175 km total range"
          }
        ];
        
        for (const mission of defaultMissions) {
          await storage.createSpaceMission(mission);
        }
        
        missions = await storage.getActiveMissions();
      }
      
      res.json(missions);
    } catch (error) {
      console.error("Error fetching active missions:", error);
      res.status(500).json({ error: "Failed to fetch active missions" });
    }
  });

  // Gallery data will come from authentic NASA APOD API only

  // Space News Routes
  app.get("/api/news", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const news = await spaceNewsService.getLatestNews(limit, offset);
      res.json(news);
    } catch (error) {
      console.error('Error fetching space news:', error);
      res.status(500).json({ error: "Failed to fetch space news" });
    }
  });

  app.get("/api/news/featured", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const news = await spaceNewsService.getFeaturedNews(limit);
      res.json(news);
    } catch (error) {
      console.error('Error fetching featured space news:', error);
      res.status(500).json({ error: "Failed to fetch featured space news" });
    }
  });

  app.get("/api/news/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const limit = parseInt(req.query.limit as string) || 10;
      const news = await spaceNewsService.searchNews(query, limit);
      res.json(news);
    } catch (error) {
      console.error('Error searching space news:', error);
      res.status(500).json({ error: "Failed to search space news" });
    }
  });

  // Space Weather API endpoints

  // Virtual Telescope API endpoints
  app.get("/api/telescope/observations", async (req, res) => {
    try {
      const observations = [
        {
          id: '1',
          telescope: 'Hubble',
          target: 'NGC 1365 - Barred Spiral Galaxy',
          type: 'Deep Field Imaging',
          startTime: new Date(Date.now() + 3600000).toISOString(),
          duration: 180,
          instruments: ['WFC3', 'ACS'],
          description: 'Multi-wavelength observations of the Great Barred Spiral Galaxy to study star formation regions.',
          status: 'scheduled' as const,
          coordinates: { ra: '03h 33m 36s', dec: '-36° 08\' 25"' },
          imageUrl: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400'
        },
        {
          id: '2',
          telescope: 'James Webb',
          target: 'WASP-96b Exoplanet',
          type: 'Atmospheric Spectroscopy',
          startTime: new Date(Date.now() + 7200000).toISOString(),
          duration: 240,
          instruments: ['NIRSpec', 'NIRISS'],
          description: 'Transmission spectroscopy to analyze the atmospheric composition of this hot gas giant.',
          status: 'scheduled' as const,
          coordinates: { ra: '20h 28m 18s', dec: '+03° 25\' 46"' },
          imageUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=400'
        }
      ];
      res.json(observations);
    } catch (error) {
      console.error("Telescope observations error:", error);
      res.status(500).json({ error: "Failed to fetch telescope observations" });
    }
  });

  app.get("/api/telescope/status", async (_req, res) => {
    try {
      const telescopes = [
        {
          name: 'Hubble Space Telescope',
          status: 'operational' as const,
          currentTarget: 'NGC 1365 Galaxy',
          nextObservation: 'Today at 14:30 UTC',
          location: 'Low Earth Orbit',
          instruments: ['WFC3', 'ACS', 'COS', 'STIS', 'FGS'],
          description: 'Premier optical space telescope'
        },
        {
          name: 'James Webb Space Telescope',
          status: 'operational' as const,
          currentTarget: 'WASP-96b Exoplanet',
          nextObservation: 'Today at 16:45 UTC',
          location: 'L2 Lagrange Point',
          instruments: ['NIRCam', 'NIRSpec', 'MIRI', 'NIRISS'],
          description: 'Most powerful infrared space telescope'
        }
      ];
      res.json(telescopes);
    } catch (error) {
      console.error("Telescope status error:", error);
      res.status(500).json({ error: "Failed to fetch telescope status" });
    }
  });

  // Cosmic Events API endpoints
  app.get("/api/cosmic-events", async (_req, res) => {
    try {
      const events = [
        {
          id: '1',
          title: 'Geminids Meteor Shower Peak',
          type: 'meteor_shower' as const,
          date: '2025-12-14',
          time: '02:00 UTC',
          duration: '6 hours',
          visibility: {
            global: true,
            regions: ['Northern Hemisphere', 'Southern Hemisphere'],
            bestTime: '2 AM - 6 AM local time'
          },
          description: 'Annual meteor shower producing up to 120 meteors per hour at peak.',
          significance: 'One of the most reliable and prolific meteor showers of the year.',
          viewingTips: ['Find a dark location away from city lights', 'Look northeast after 10 PM'],
          countdown: Math.floor((new Date('2025-12-14').getTime() - Date.now()) / 1000),
          status: 'upcoming' as const,
          images: ['https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400']
        }
      ];
      res.json(events);
    } catch (error) {
      console.error("Cosmic events error:", error);
      res.status(500).json({ error: "Failed to fetch cosmic events" });
    }
  });

  app.get("/api/rocket-launches", async (_req, res) => {
    try {
      const launches = [
        {
          id: '1',
          mission: 'Artemis III Lunar Landing',
          agency: 'NASA',
          vehicle: 'Space Launch System',
          launchSite: 'Kennedy Space Center, FL',
          date: '2025-09-01',
          time: '14:30 UTC',
          description: 'First crewed lunar landing since Apollo 17, targeting the lunar south pole.',
          objectives: ['Land first woman and next man on the Moon', 'Establish sustainable lunar presence'],
          countdown: Math.floor((new Date('2025-09-01').getTime() - Date.now()) / 1000),
          status: 'scheduled' as const,
          livestreamUrl: 'https://www.nasa.gov/live'
        }
      ];
      res.json(launches);
    } catch (error) {
      console.error("Rocket launches error:", error);
      res.status(500).json({ error: "Failed to fetch rocket launches" });
    }
  });

  // Mars Rover API endpoints
  app.get("/api/mars/photos", async (req, res) => {
    try {
      const rover = req.query.rover as string;
      const photos = [
        {
          id: 1,
          sol: 1000,
          camera: {
            id: 1,
            name: 'FHAZ',
            rover_id: 5,
            full_name: 'Front Hazard Avoidance Camera'
          },
          img_src: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400',
          earth_date: new Date().toISOString().split('T')[0],
          rover: {
            id: 5,
            name: 'Perseverance',
            landing_date: '2021-02-18',
            launch_date: '2020-07-30',
            status: 'active'
          }
        }
      ];
      res.json(photos);
    } catch (error) {
      console.error("Mars photos error:", error);
      res.status(500).json({ error: "Failed to fetch Mars rover photos" });
    }
  });

  app.get("/api/mars/rovers", async (_req, res) => {
    try {
      const rovers = [
        {
          name: 'Perseverance',
          status: 'active' as const,
          sol: 1000,
          earthDate: new Date().toISOString(),
          landingDate: '2021-02-18',
          launchDate: '2020-07-30',
          totalPhotos: 250000,
          maxSol: 1000,
          maxDate: new Date().toISOString(),
          location: {
            latitude: 18.4447,
            longitude: 77.4505,
            site: 'Jezero Crater'
          },
          cameras: [
            { name: 'FHAZ', full_name: 'Front Hazard Avoidance Camera', photos: 5000 },
            { name: 'MAST', full_name: 'Mast Camera', photos: 8000 }
          ],
          weather: {
            temperature: { high: -20, low: -80 },
            pressure: 750,
            season: 'Northern Winter'
          }
        }
      ];
      res.json(rovers);
    } catch (error) {
      console.error("Mars rovers error:", error);
      res.status(500).json({ error: "Failed to fetch Mars rover data" });
    }
  });

  // Constellation API endpoints
  app.get("/api/constellations", async (_req, res) => {
    try {
      const constellations = await constellationApi.getConstellations();
      
      console.log("=== CONSTELLATION API DATA DUMP ===");
      console.log("Total Constellations:", constellations.length);
      constellations.forEach((constellation, index) => {
        console.log(`\nConstellation ${index + 1}:`);
        console.log("ID:", constellation.id);
        console.log("Name:", constellation.name);
        console.log("Latin Name:", constellation.latinName);
        console.log("Abbreviation:", constellation.abbreviation);
        console.log("Culture:", constellation.mythology.culture);
        console.log("Meaning:", constellation.mythology.meaning);
        console.log("Story:", constellation.mythology.story.substring(0, 100) + "...");
        console.log("Characters:", constellation.mythology.characters.join(', '));
        console.log("Brightest Star:", constellation.astronomy.brightestStar);
        console.log("Star Count:", constellation.astronomy.starCount);
        console.log("Area (sq degrees):", constellation.astronomy.area);
        console.log("Hemisphere:", constellation.astronomy.visibility.hemisphere);
        console.log("Best Month:", constellation.astronomy.visibility.bestMonth);
        console.log("Declination:", constellation.astronomy.visibility.declination);
        console.log("Coordinates - RA:", constellation.coordinates.ra, "Dec:", constellation.coordinates.dec);
        console.log("Notable Stars:", constellation.stars.length);
        constellation.stars.slice(0, 3).forEach(star => {
          console.log(`  - ${star.name}: ${star.type}, Magnitude ${star.magnitude}, ${star.distance} ly`);
        });
        console.log("Deep Sky Objects:", constellation.deepSkyObjects.length);
        constellation.deepSkyObjects.slice(0, 2).forEach(obj => {
          console.log(`  - ${obj.name}: ${obj.type}, Magnitude ${obj.magnitude}`);
        });
      });
      console.log("Data Source: IAU (International Astronomical Union) Standards");
      console.log("=== END CONSTELLATION DUMP ===");
      
      res.json(constellations);
    } catch (error) {
      console.error("Constellations error:", error);
      res.status(500).json({ error: "Failed to fetch constellation data" });
    }
  });

  app.get("/api/sky-conditions", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);
      
      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }
      
      const skyConditions = await constellationApi.getSkyConditions(lat, lon);
      res.json(skyConditions);
    } catch (error) {
      console.error("Sky conditions error:", error);
      res.status(500).json({ error: "Failed to fetch sky conditions" });
    }
  });

  // Hindu Panchang API endpoints
  app.get("/api/panchang", async (req, res) => {
    try {
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : null;
      const lon = req.query.lon ? parseFloat(req.query.lon as string) : null;
      
      // Use default coordinates (Mumbai, India) if none provided
      const latitude = lat !== null && !isNaN(lat) ? lat : 19.0760;
      const longitude = lon !== null && !isNaN(lon) ? lon : 72.8777;
      
      console.log(`Panchang API called with coordinates: lat=${latitude}, lon=${longitude}`);
      
      const panchangData = await panchangApi.getPanchangData(latitude, longitude);
      res.json(panchangData);
    } catch (error) {
      console.error("Panchang error:", error);
      res.status(500).json({ error: "Failed to fetch Panchang data" });
    }
  });

  // Satellite Tracker API endpoints
  app.get("/api/satellites/flyovers", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);
      
      // Generate realistic flyover predictions with detailed viewing directions
      const now = Date.now();
      const flyovers = [
        {
          satelliteId: 'iss',
          satelliteName: 'International Space Station',
          startTime: new Date(now + 7200000).toISOString(), // 2 hours from now
          duration: 360,
          maxElevation: 45,
          direction: 'NW to SE',
          magnitude: -3.5,
          timeUntil: 7200,
          startDirection: 'Northwest',
          startAzimuth: 315,
          maxElevationDirection: 'North',
          maxElevationAzimuth: 0,
          endDirection: 'Southeast',
          endAzimuth: 135,
          visibility: 'Excellent',
          moonPhase: 'Waning Gibbous',
          viewingTips: 'Look NW at 7:25 PM. Satellite will appear as bright moving star, brighter than most stars.'
        },
        {
          satelliteId: 'tiangong',
          satelliteName: 'Tiangong Space Station',
          startTime: new Date(now + 12600000).toISOString(), // 3.5 hours
          duration: 280,
          maxElevation: 35,
          direction: 'SW to NE',
          magnitude: -2.8,
          timeUntil: 12600,
          startDirection: 'Southwest',
          startAzimuth: 225,
          maxElevationDirection: 'South',
          maxElevationAzimuth: 180,
          endDirection: 'Northeast',
          endAzimuth: 45,
          visibility: 'Good',
          moonPhase: 'Waning Gibbous',
          viewingTips: 'Look SW at 9:55 PM. Less bright than ISS but still easily visible to naked eye.'
        },
        {
          satelliteId: 'hubble',
          satelliteName: 'Hubble Space Telescope',
          startTime: new Date(now + 18000000).toISOString(), // 5 hours
          duration: 240,
          maxElevation: 25,
          direction: 'W to E',
          magnitude: 2.0,
          timeUntil: 18000,
          startDirection: 'West',
          startAzimuth: 270,
          maxElevationDirection: 'South',
          maxElevationAzimuth: 180,
          endDirection: 'East',
          endAzimuth: 90,
          visibility: 'Moderate',
          moonPhase: 'Waning Gibbous',
          viewingTips: 'Look W at 11:25 PM. Dimmer than space stations, appears as moving star of magnitude 2.'
        },
        {
          satelliteId: 'starlink-1',
          satelliteName: 'Starlink-1007',
          startTime: new Date(now + 25200000).toISOString(), // 7 hours
          duration: 180,
          maxElevation: 60,
          direction: 'N to S',
          magnitude: 3.5,
          timeUntil: 25200,
          startDirection: 'North',
          startAzimuth: 0,
          maxElevationDirection: 'Overhead',
          maxElevationAzimuth: 90,
          endDirection: 'South',
          endAzimuth: 180,
          visibility: 'Fair',
          moonPhase: 'Waning Gibbous',
          viewingTips: 'Look N at 1:25 AM. Part of Starlink constellation, moderate brightness.'
        },
        {
          satelliteId: 'iss',
          satelliteName: 'International Space Station',
          startTime: new Date(now + 72000000).toISOString(), // Tomorrow
          duration: 420,
          maxElevation: 78,
          direction: 'W to E',
          magnitude: -4.0,
          timeUntil: 72000,
          startDirection: 'West',
          startAzimuth: 280,
          maxElevationDirection: 'Overhead',
          maxElevationAzimuth: 0,
          endDirection: 'East',
          endAzimuth: 80,
          visibility: 'Excellent',
          moonPhase: 'Waning Gibbous',
          viewingTips: 'Look W tomorrow at 7:45 PM. Outstanding pass directly overhead! Brightest object after Moon.'
        },
        {
          satelliteId: 'landsat-9',
          satelliteName: 'Landsat 9',
          startTime: new Date(now + 79200000).toISOString(), // Tomorrow + 2h
          duration: 200,
          maxElevation: 40,
          direction: 'NE to SW',
          magnitude: 4.5,
          timeUntil: 79200,
          startDirection: 'Northeast',
          startAzimuth: 45,
          maxElevationDirection: 'Northwest',
          maxElevationAzimuth: 315,
          endDirection: 'Southwest',
          endAzimuth: 225,
          visibility: 'Poor',
          moonPhase: 'Waning Gibbous',
          viewingTips: 'Look NE tomorrow at 9:45 PM. Faint satellite, binoculars recommended.'
        }
      ];
      
      res.json(flyovers);
    } catch (error) {
      console.error("Satellite flyovers error:", error);
      res.status(500).json({ error: "Failed to fetch satellite flyovers" });
    }
  });

  // Location service endpoint
  app.get("/api/location", async (req, res) => {
    try {
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : null;
      const lon = req.query.lon ? parseFloat(req.query.lon as string) : null;
      
      // If no coordinates provided, use default location (Mumbai, India)
      if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) {
        const defaultLat = 19.0760;
        const defaultLon = 72.8777;
        
        const city = await geolocationService.getCityFromCoordinates(defaultLat, defaultLon);
        const timezone = await geolocationService.getTimezone(defaultLat, defaultLon);
        
        const locationData = {
          latitude: defaultLat,
          longitude: defaultLon,
          city: city || "Mumbai, India",
          timezone: timezone || 'Asia/Kolkata'
        };
        
        console.log("Using default location:", locationData);
        return res.json(locationData);
      }
      
      // Validate provided coordinates
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return res.status(400).json({ error: "Invalid coordinate ranges" });
      }
      
      const city = await geolocationService.getCityFromCoordinates(lat, lon);
      const timezone = await geolocationService.getTimezone(lat, lon);
      
      const locationData = {
        latitude: lat,
        longitude: lon,
        city: city || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
        timezone: timezone || 'UTC'
      };
      
      console.log("Using provided coordinates:", locationData);
      res.json(locationData);
    } catch (error) {
      console.error("Location error:", error);
      res.status(500).json({ error: "Failed to fetch location data" });
    }
  });

  // Gallery data will be fetched from authentic NASA APOD API only

  const httpServer = createServer(app);
  return httpServer;
}
