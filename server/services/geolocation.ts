export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface AuroraData {
  kpIndex: number;
  forecast: string;
  visibility: number;
  activity: string;
}

export class GeolocationService {
  // Get aurora forecast for given coordinates
  async getAuroraForecast(lat: number, lon: number): Promise<AuroraData> {
    try {
      // Using NOAA Space Weather API
      const response = await fetch("https://services.swpc.noaa.gov/json/3-day-forecast.json");
      const data = await response.json();
      
      // Calculate visibility based on latitude (aurora more visible at higher latitudes)
      const visibility = this.calculateAuroraVisibility(lat, data[0]?.kp_index || 0);
      
      return {
        kpIndex: data[0]?.kp_index || 0,
        forecast: data[0]?.forecast || "No forecast available",
        visibility,
        activity: this.getActivityLevel(data[0]?.kp_index || 0)
      };
    } catch (error) {
      console.error("Error fetching aurora forecast:", error);
      return {
        kpIndex: 0,
        forecast: "Unable to fetch forecast",
        visibility: 0,
        activity: "Unknown"
      };
    }
  }

  private calculateAuroraVisibility(latitude: number, kpIndex: number): number {
    // Aurora visibility calculation based on magnetic latitude and Kp index
    const absLat = Math.abs(latitude);
    
    if (kpIndex >= 7 && absLat >= 50) return 90;
    if (kpIndex >= 6 && absLat >= 55) return 80;
    if (kpIndex >= 5 && absLat >= 60) return 70;
    if (kpIndex >= 4 && absLat >= 65) return 60;
    if (kpIndex >= 3 && absLat >= 70) return 50;
    
    return Math.max(0, (kpIndex * 10) - (70 - absLat));
  }

  private getActivityLevel(kpIndex: number): string {
    if (kpIndex >= 7) return "Storm";
    if (kpIndex >= 5) return "Active";
    if (kpIndex >= 3) return "Moderate";
    if (kpIndex >= 1) return "Quiet";
    return "Very Quiet";
  }

  // Calculate distance between two coordinates
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Get timezone for coordinates
  async getTimezone(lat: number, lon: number): Promise<string> {
    try {
      // Using TimeZoneDB API (requires key) or fallback to UTC
      const response = await fetch(`https://api.timezonedb.com/v2.1/get-time-zone?key=${process.env.TIMEZONE_API_KEY}&format=json&by=position&lat=${lat}&lng=${lon}`);
      const data = await response.json();
      return data.zoneName || "UTC";
    } catch (error) {
      console.error("Error fetching timezone:", error);
      return "UTC";
    }
  }

  async getCityFromCoordinates(lat: number, lon: number): Promise<string> {
    try {
      // Using OpenStreetMap Nominatim for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Space-Explorer-App/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Geocoding API error');
      }
      
      const data = await response.json();
      
      // Extract suburb/locality information with priority order
      const address = data.address || {};
      const suburb = address.suburb || 
                     address.neighbourhood || 
                     address.quarter ||
                     address.district ||
                     address.city || 
                     address.town || 
                     address.village ||
                     address.county ||
                     address.state ||
                     'Unknown Location';
      
      const country = address.country || '';
      
      // Return suburb with country if available, prefixed with "Over"
      return country ? `Over ${suburb}, ${country}` : `Over ${suburb}`;
    } catch (error) {
      console.error("Error fetching city from coordinates:", error);
      // Return ocean/coordinate info as fallback
      if (Math.abs(lat) < 60) {
        return lat > 0 ? "Northern Ocean" : "Southern Ocean";
      }
      return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
    }
  }
}

export const geolocationService = new GeolocationService();
