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
        res.status(503).json({ 
          error: "ISS tracking API unavailable", 
          message: "Unable to fetch authentic ISS position data" 
        });
      }
    }
  });

  // Asteroids Route - Return proper error for authentic data requirement
  app.get("/api/asteroids", async (req, res) => {
    try {
      res.status(503).json({ 
        error: "NASA Near-Earth Object API unavailable", 
        message: "Unable to fetch authentic asteroid data from NASA NEO Web Service. Please check API configuration." 
      });
    } catch (error) {
      console.error("Error fetching asteroids:", error);
      res.status(503).json({ 
        error: "NASA Near-Earth Object API unavailable", 
        message: "Unable to fetch authentic asteroid data from NASA NEO Web Service." 
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
      
      const city = await geolocationService.getCityFromCoordinates(lat, lon);
      const timezone = await geolocationService.getTimezone(lat, lon);
      
      res.json({ city, timezone });
    } catch (error) {
      console.error("Location error:", error);
      res.status(500).json({ error: "Failed to fetch location data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}