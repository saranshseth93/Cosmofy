interface DrikPanchangData {
  date: string;
  location: {
    city: string;
    coordinates: { latitude: number; longitude: number };
    timezone: string;
  };
  tithi: {
    name: string;
    sanskrit: string;
    deity: string;
    significance: string;
    endTime: string;
    paksh: string;
    number: number;
  };
  nakshatra: {
    name: string;
    sanskrit: string;
    deity: string;
    qualities: string;
    endTime: string;
    lord: string;
  };
  yoga: {
    name: string;
    sanskrit: string;
    meaning: string;
    endTime: string;
    type: string;
  };
  karana: {
    name: string;
    sanskrit: string;
    meaning: string;
    endTime: string;
    type: string;
  };
  vara: string;
  rashi: {
    name: string;
    element: string;
    lord: string;
  };
  masa: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  shubhMuhurat: {
    abhijitMuhurat: string;
    rahuKaal: string;
    gulikaKaal: string;
    yamaGandaKaal: string;
  };
  festivals: string[];
  vratsAndOccasions: string[];
  samvat: string[];
  yug: string;
  kaalIkai: string[];
  verification: {
    tithi: { library: string; scraped: string | null };
    nakshatra: { library: string; scraped: string | null };
    yoga: { library: string; scraped: string | null };
    karana: { library: string; scraped: string | null };
    verified: boolean;
  };
  source: string;
  dataFreshness: string;
  backupSource: string;
  calculationMethod: string;
}

class SimpleDrikPanchangScraper {
  private cache = new Map<string, { data: DrikPanchangData; timestamp: number }>();
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  async scrapePanchangData(lat: number, lon: number, date?: string): Promise<DrikPanchangData> {
    const cacheKey = `${lat}_${lon}_${date || 'today'}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    // Since drikpanchang.com scraping is failing, return error to maintain data integrity
    throw new Error('drikpanchang.com scraping unavailable - unable to fetch authentic Vedic calendar data');
  }
}

export const drikPanchangScraper = new SimpleDrikPanchangScraper();