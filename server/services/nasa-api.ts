const NASA_API_KEY = process.env.NASA_API_KEY || process.env.VITE_NASA_API_KEY || "";
const NASA_BASE_URL = "https://api.nasa.gov";

export interface ApodResponse {
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: string;
  service_version: string;
  title: string;
  url: string;
  copyright?: string;
}

export interface IssResponse {
  iss_position: {
    latitude: string;
    longitude: string;
  };
  message: string;
  timestamp: number;
}

export interface IssPassesResponse {
  message: string;
  request: {
    altitude: number;
    datetime: number;
    latitude: number;
    longitude: number;
    passes: number;
  };
  response: Array<{
    duration: number;
    risetime: number;
  }>;
}

export interface AstroResponse {
  message: string;
  number: number;
  people: Array<{
    craft: string;
    name: string;
  }>;
}

export interface NeoResponse {
  links: any;
  element_count: number;
  near_earth_objects: {
    [date: string]: Array<{
      id: string;
      neo_reference_id: string;
      name: string;
      nasa_jpl_url: string;
      absolute_magnitude_h: number;
      estimated_diameter: {
        kilometers: {
          estimated_diameter_min: number;
          estimated_diameter_max: number;
        };
      };
      is_potentially_hazardous_asteroid: boolean;
      close_approach_data: Array<{
        close_approach_date: string;
        close_approach_date_full: string;
        epoch_date_close_approach: number;
        relative_velocity: {
          kilometers_per_second: string;
          kilometers_per_hour: string;
          miles_per_hour: string;
        };
        miss_distance: {
          astronomical: string;
          lunar: string;
          kilometers: string;
          miles: string;
        };
        orbiting_body: string;
      }>;
    }>;
  };
}

export class NasaApiService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly REQUEST_TIMEOUT = 8000; // 8 seconds

  private async fetchWithRetry(url: string, retries = 2): Promise<Response> {
    // Check cache first
    const cacheKey = url;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return new Response(JSON.stringify(cached.data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          // Cache successful response
          this.cache.set(cacheKey, { data, timestamp: Date.now() });
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        if (response.status === 429) {
          // Rate limited, wait and retry
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
          throw new Error('Request timeout - please try again');
        }
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    throw new Error("Max retries exceeded");
  }

  async getApod(date?: string): Promise<ApodResponse> {
    if (!NASA_API_KEY) {
      throw new Error('NASA API key required for authentic APOD data');
    }
    
    try {
      const url = new URL(`${NASA_BASE_URL}/planetary/apod`);
      url.searchParams.set("api_key", NASA_API_KEY);
      if (date) {
        url.searchParams.set("date", date);
      }

      const response = await this.fetchWithRetry(url.toString());
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('APOD API error:', error);
      throw new Error('Failed to fetch APOD data');
    }
  }

  async getApodRange(startDate: string, endDate: string): Promise<ApodResponse[]> {
    if (!NASA_API_KEY) {
      throw new Error('NASA API key required for authentic APOD data');
    }
    
    const url = new URL(`${NASA_BASE_URL}/planetary/apod`);
    url.searchParams.set("api_key", NASA_API_KEY!);
    url.searchParams.set("start_date", startDate);
    url.searchParams.set("end_date", endDate);

    const response = await this.fetchWithRetry(url.toString());
    return response.json();
  }

  async getIssPosition(): Promise<IssResponse> {
    const response = await this.fetchWithRetry("http://api.open-notify.org/iss-now.json");
    return response.json();
  }

  async getIssPasses(lat: number, lon: number, passes = 5): Promise<IssPassesResponse> {
    const url = new URL("http://api.open-notify.org/iss-pass.json");
    url.searchParams.set("lat", lat.toString());
    url.searchParams.set("lon", lon.toString());
    url.searchParams.set("n", passes.toString());

    const response = await this.fetchWithRetry(url.toString());
    return response.json();
  }

  async getAstronauts(): Promise<AstroResponse> {
    const response = await this.fetchWithRetry("http://api.open-notify.org/astros.json");
    return response.json();
  }

  async getNearEarthObjects(startDate: string, endDate: string): Promise<NeoResponse> {
    if (!NASA_API_KEY) {
      throw new Error('NASA API key required for authentic asteroid data');
    }
    
    const url = new URL(`${NASA_BASE_URL}/neo/rest/v1/feed`);
    url.searchParams.set("api_key", NASA_API_KEY!);
    url.searchParams.set("start_date", startDate);
    url.searchParams.set("end_date", endDate);

    const response = await this.fetchWithRetry(url.toString());
    return response.json();
  }
}

export const nasaApi = new NasaApiService();
