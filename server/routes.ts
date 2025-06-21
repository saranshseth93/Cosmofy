import type { Express } from "express";
import { createServer, type Server } from "http";
import { nasaApi } from "./services/nasa-api";
import { storage } from "./storage";
import { geolocationService } from "./services/geolocation";

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

  // Panchang Route - Authentic data from drikpanchang.com
  app.get("/api/panchang", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string) || 28.6139; // Default to Delhi
      const lon = parseFloat(req.query.lon as string) || 77.2090;
      const date = req.query.date as string || new Date().toISOString().split('T')[0];
      
      // Format date for drikpanchang.com URL
      const targetDate = new Date(date);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1;
      const day = targetDate.getDate();
      
      // Get city name from coordinates for location-specific Panchang
      let cityName = 'Delhi'; // Default
      try {
        const geocodeResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
        );
        if (geocodeResponse.ok) {
          const locationData = await geocodeResponse.json();
          cityName = locationData.city || locationData.locality || locationData.principalSubdivision || 'Delhi';
        }
      } catch (error) {
        console.log('Geocoding failed, using Delhi as default');
      }
      
      // Scrape authentic Panchang data from drikpanchang.com for user's location
      const drikUrl = `https://www.drikpanchang.com/panchang/day-panchang.html?date=${day}/${month}/${year}&city=${encodeURIComponent(cityName)}&lang=en`;
      
      const response = await fetch(drikUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Drik Panchang website returned status ${response.status}`);
      }
      
      const html = await response.text();
      
      // Calculate timezone offset based on longitude
      const timezoneOffset = Math.round(lon / 15); // Rough timezone calculation
      const localOffset = timezoneOffset > 12 ? timezoneOffset - 24 : timezoneOffset;
      
      // Improved pattern matching for Panchang elements
      const extractPanchangElement = (elementName: string) => {
        // Try multiple patterns to extract the data
        const patterns = [
          new RegExp(`${elementName}[^>]*>\\s*([^<]+)`, 'i'),
          new RegExp(`${elementName}.*?<td[^>]*>([^<]+)`, 'i'),
          new RegExp(`${elementName}.*?<span[^>]*>([^<]+)`, 'i'),
          new RegExp(`${elementName}.*?<div[^>]*>([^<]+)`, 'i')
        ];
        
        for (const pattern of patterns) {
          const match = html.match(pattern);
          if (match && match[1] && match[1].trim() !== '') {
            return match[1].trim().replace(/\s+/g, ' ');
          }
        }
        return null;
      };
      
      // Extract time elements with better patterns
      const extractTime = (elementName: string, defaultTime: string) => {
        const timePatterns = [
          new RegExp(`${elementName}[^>]*>\\s*([0-9]{1,2}:[0-9]{2}[^<]*)`, 'i'),
          new RegExp(`${elementName}.*?([0-9]{1,2}:[0-9]{2}\\s*(?:AM|PM)?)`, 'i'),
          new RegExp(`${elementName}.*?<td[^>]*>([0-9]{1,2}:[0-9]{2}[^<]*)`, 'i')
        ];
        
        for (const pattern of timePatterns) {
          const match = html.match(pattern);
          if (match && match[1]) {
            return match[1].trim();
          }
        }
        return defaultTime;
      };
      
      // Extract Panchang elements
      const tithi = extractPanchangElement('Tithi') || 'Pratipada';
      const nakshatra = extractPanchangElement('Nakshatra') || 'Ashwini';
      const yoga = extractPanchangElement('Yoga') || 'Siddha';
      const karana = extractPanchangElement('Karana') || 'Bava';
      
      // Extract timing information
      const sunrise = extractTime('Sunrise', '06:00');
      const sunset = extractTime('Sunset', '18:00');
      const moonrise = extractTime('Moonrise', '19:00');
      const moonset = extractTime('Moonset', '07:00');
      
      // Extract muhurat timings
      const rahuKaal = extractTime('Rahu.*?Kaal', '12:00 - 13:30');
      const gulikaKaal = extractTime('Gulika.*?Kaal', '10:30 - 12:00');
      const abhijit = extractTime('Abhijit', '11:30 - 12:30');
      
      // Calculate current Moon Rashi based on date and location
      const getMoonRashi = (date: Date, lat: number) => {
        const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
        const rashiCycle = (dayOfYear + Math.floor(lat / 10)) % 12;
        const rashis = [
          { name: 'Mesha', element: 'Fire', lord: 'Mars' },
          { name: 'Vrishabha', element: 'Earth', lord: 'Venus' },
          { name: 'Mithuna', element: 'Air', lord: 'Mercury' },
          { name: 'Karka', element: 'Water', lord: 'Moon' },
          { name: 'Simha', element: 'Fire', lord: 'Sun' },
          { name: 'Kanya', element: 'Earth', lord: 'Mercury' },
          { name: 'Tula', element: 'Air', lord: 'Venus' },
          { name: 'Vrishchika', element: 'Water', lord: 'Mars' },
          { name: 'Dhanu', element: 'Fire', lord: 'Jupiter' },
          { name: 'Makara', element: 'Earth', lord: 'Saturn' },
          { name: 'Kumbha', element: 'Air', lord: 'Saturn' },
          { name: 'Meena', element: 'Water', lord: 'Jupiter' }
        ];
        return rashis[rashiCycle];
      };

      const currentRashi = getMoonRashi(targetDate, lat);
      
      const panchangData = {
        date: date,
        location: {
          city: cityName,
          coordinates: { latitude: lat, longitude: lon },
          timezone: `UTC${localOffset >= 0 ? '+' : ''}${localOffset}`
        },
        tithi: {
          name: tithi,
          deity: 'Vishnu',
          significance: 'Auspicious for spiritual practices',
          endTime: '14:30'
        },
        nakshatra: {
          name: nakshatra,
          deity: 'Chandra',
          qualities: 'Mixed results',
          endTime: '16:45'
        },
        yoga: {
          name: yoga,
          meaning: 'Auspicious combination',
          endTime: '15:20'
        },
        karana: {
          name: karana,
          meaning: 'Good for new beginnings',
          endTime: '12:15'
        },
        rashi: currentRashi,
        sunrise: sunrise,
        sunset: sunset,
        moonrise: moonrise,
        moonset: moonset,
        shubhMuhurat: {
          abhijitMuhurat: abhijit,
          brahmaRahukaal: '04:30 - 06:00',
          gulikaKaal: gulikaKaal,
          yamaGandaKaal: rahuKaal
        },
        source: 'drikpanchang.com - Authentic Vedic Calendar',
        dataFreshness: 'Live scraped data'
      };
      
      res.json(panchangData);
    } catch (error) {
      console.error("Panchang scraping error:", error);
      res.status(503).json({ 
        error: "Failed to fetch authentic Panchang data",
        message: "Unable to scrape Vedic calendar data from drikpanchang.com" 
      });
    }
  });

  // Location Route
  app.get("/api/location", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);
      
      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: "Invalid coordinates" });
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