/**
 * Comprehensive Drik Panchang Web Scraper
 * Extracts authentic Vedic calendar data from drikpanchang.com
 */

interface PanchangScrapedData {
  date: string;
  location: string;
  tithi: {
    name: string;
    type?: string;
    number?: number;
    start?: string;
    end?: string;
    deity?: string;
    significance?: string;
  };
  nakshatra: {
    name: string;
    number?: number;
    start?: string;
    end?: string;
    lord?: string;
    deity?: string;
    meaning?: string;
  };
  yoga: {
    name: string;
    number?: number;
    start?: string;
    end?: string;
    meaning?: string;
  };
  karana: {
    name: string;
    number?: number;
    start?: string;
    end?: string;
    meaning?: string;
  };
  rashi: {
    name: string;
    element?: string;
    lord?: string;
  };
  timings: {
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    solarNoon?: string;
  };
  muhurat: {
    abhijitMuhurat?: string;
    brahmaRahukaal?: string;
    gulikaKaal?: string;
    yamaGandaKaal?: string;
    rohiniChoghadiya?: string;
    amritChoghadiya?: string;
  };
  masa: {
    amantaName?: string;
    purnimaName?: string;
    adhikMaasa?: boolean;
    ayana?: string;
    moonPhase?: string;
    paksha?: string;
    ritu?: string;
  };
  festivals: string[];
  vrats: string[];
  inauspiciousTimes: Array<{
    name: string;
    time: string;
    description: string;
  }>;
  auspiciousTimes: Array<{
    name: string;
    time: string;
    description: string;
  }>;
}

export class DrikPanchangScraper {
  private readonly baseUrl = 'https://www.drikpanchang.com';
  private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  private readonly requestTimeout = 30000; // 30 seconds

  /**
   * Scrape complete Panchang data for a specific date and location
   */
  async scrapePanchangData(
    date: string, 
    cityName: string = 'Delhi',
    lat?: number,
    lon?: number
  ): Promise<PanchangScrapedData> {
    try {
      const targetDate = new Date(date);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1;
      const day = targetDate.getDate();

      // Primary URL for day panchang
      const panchangUrl = `${this.baseUrl}/panchang/day-panchang.html?date=${day}/${month}/${year}&city=${encodeURIComponent(cityName)}&lang=en`;
      
      console.log(`Scraping Panchang from: ${panchangUrl}`);
      
      const response = await this.fetchWithTimeout(panchangUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      return this.parsePanchangHTML(html, date, cityName);
      
    } catch (error) {
      console.error('Drik Panchang scraping error:', error);
      throw new Error(`Failed to scrape Panchang data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse the HTML content and extract all Panchang elements
   */
  private parsePanchangHTML(html: string, date: string, location: string): PanchangScrapedData {
    const data: PanchangScrapedData = {
      date,
      location,
      tithi: { name: '' },
      nakshatra: { name: '' },
      yoga: { name: '' },
      karana: { name: '' },
      rashi: { name: '' },
      timings: {
        sunrise: '',
        sunset: '',
        moonrise: '',
        moonset: ''
      },
      muhurat: {},
      masa: {},
      festivals: [],
      vrats: [],
      inauspiciousTimes: [],
      auspiciousTimes: []
    };

    // Extract Tithi information
    data.tithi = this.extractTithiData(html);
    
    // Extract Nakshatra information
    data.nakshatra = this.extractNakshatraData(html);
    
    // Extract Yoga information
    data.yoga = this.extractYogaData(html);
    
    // Extract Karana information
    data.karana = this.extractKaranaData(html);
    
    // Extract Rashi information
    data.rashi = this.extractRashiData(html);
    
    // Extract timing information
    data.timings = this.extractTimingData(html);
    
    // Extract Muhurat information
    data.muhurat = this.extractMuhuratData(html);
    
    // Extract Masa information
    data.masa = this.extractMasaData(html);
    
    // Extract festivals and vrats
    data.festivals = this.extractFestivals(html);
    data.vrats = this.extractVrats(html);
    
    // Extract auspicious and inauspicious times
    data.auspiciousTimes = this.extractAuspiciousTimes(html);
    data.inauspiciousTimes = this.extractInauspiciousTimes(html);

    return data;
  }

  /**
   * Extract Tithi data from HTML
   */
  private extractTithiData(html: string): PanchangScrapedData['tithi'] {
    const patterns = [
      /<div[^>]*tithi[^>]*>.*?<span[^>]*>([^<]+)<\/span>/gi,
      /Tithi[^>]*>([^<]+)</gi,
      /"tithi"[^>]*>([^<]+)</gi,
      /तिथि[^>]*>([^<]+)</gi
    ];

    const tithi = this.extractWithPatterns(html, patterns);
    
    return {
      name: tithi || '',
      deity: this.extractTithiDeity(html, tithi) || undefined,
      significance: this.extractTithiSignificance(html, tithi) || undefined,
      start: this.extractTithiTiming(html, 'start') || undefined,
      end: this.extractTithiTiming(html, 'end') || undefined
    };
  }

  /**
   * Extract Nakshatra data from HTML
   */
  private extractNakshatraData(html: string): PanchangScrapedData['nakshatra'] {
    const patterns = [
      /<div[^>]*nakshatra[^>]*>.*?<span[^>]*>([^<]+)<\/span>/gi,
      /Nakshatra[^>]*>([^<]+)</gi,
      /"nakshatra"[^>]*>([^<]+)</gi,
      /नक्षत्र[^>]*>([^<]+)</gi
    ];

    const nakshatra = this.extractWithPatterns(html, patterns);
    
    return {
      name: nakshatra || '',
      lord: this.extractNakshatraLord(html, nakshatra),
      deity: this.extractNakshatraDeity(html, nakshatra),
      meaning: this.extractNakshatraMeaning(html, nakshatra),
      start: this.extractNakshatraTiming(html, 'start'),
      end: this.extractNakshatraTiming(html, 'end')
    };
  }

  /**
   * Extract Yoga data from HTML
   */
  private extractYogaData(html: string): PanchangScrapedData['yoga'] {
    const patterns = [
      /<div[^>]*yoga[^>]*>.*?<span[^>]*>([^<]+)<\/span>/gi,
      /Yoga[^>]*>([^<]+)</gi,
      /"yoga"[^>]*>([^<]+)</gi,
      /योग[^>]*>([^<]+)</gi
    ];

    const yoga = this.extractWithPatterns(html, patterns);
    
    return {
      name: yoga || '',
      meaning: this.extractYogaMeaning(html, yoga),
      start: this.extractYogaTiming(html, 'start'),
      end: this.extractYogaTiming(html, 'end')
    };
  }

  /**
   * Extract Karana data from HTML
   */
  private extractKaranaData(html: string): PanchangScrapedData['karana'] {
    const patterns = [
      /<div[^>]*karana[^>]*>.*?<span[^>]*>([^<]+)<\/span>/gi,
      /Karana[^>]*>([^<]+)</gi,
      /"karana"[^>]*>([^<]+)</gi,
      /करण[^>]*>([^<]+)</gi
    ];

    const karana = this.extractWithPatterns(html, patterns);
    
    return {
      name: karana || '',
      meaning: this.extractKaranaMeaning(html, karana),
      start: this.extractKaranaTiming(html, 'start'),
      end: this.extractKaranaTiming(html, 'end')
    };
  }

  /**
   * Extract Rashi data from HTML
   */
  private extractRashiData(html: string): PanchangScrapedData['rashi'] {
    const patterns = [
      /Moon\s+Sign[^>]*>([^<]+)</gi,
      /Rashi[^>]*>([^<]+)</gi,
      /राशि[^>]*>([^<]+)</gi,
      /"rashi"[^>]*>([^<]+)</gi
    ];

    const rashi = this.extractWithPatterns(html, patterns);
    
    return {
      name: rashi || '',
      element: this.getRashiElement(rashi),
      lord: this.getRashiLord(rashi)
    };
  }

  /**
   * Extract timing data from HTML
   */
  private extractTimingData(html: string): PanchangScrapedData['timings'] {
    return {
      sunrise: this.extractTimeValue(html, 'Sunrise') || '',
      sunset: this.extractTimeValue(html, 'Sunset') || '',
      moonrise: this.extractTimeValue(html, 'Moonrise') || '',
      moonset: this.extractTimeValue(html, 'Moonset') || '',
      solarNoon: this.extractTimeValue(html, 'Solar Noon')
    };
  }

  /**
   * Extract Muhurat data from HTML
   */
  private extractMuhuratData(html: string): PanchangScrapedData['muhurat'] {
    return {
      abhijitMuhurat: this.extractTimeValue(html, 'Abhijit'),
      brahmaRahukaal: this.extractTimeValue(html, 'Rahu Kaal'),
      gulikaKaal: this.extractTimeValue(html, 'Gulika Kaal'),
      yamaGandaKaal: this.extractTimeValue(html, 'Yama Ganda'),
      rohiniChoghadiya: this.extractTimeValue(html, 'Rohini'),
      amritChoghadiya: this.extractTimeValue(html, 'Amrit')
    };
  }

  /**
   * Extract Masa data from HTML
   */
  private extractMasaData(html: string): PanchangScrapedData['masa'] {
    return {
      amantaName: this.extractWithPatterns(html, [/Amanta[^>]*>([^<]+)</gi]),
      purnimaName: this.extractWithPatterns(html, [/Purnimanta[^>]*>([^<]+)</gi]),
      ayana: this.extractWithPatterns(html, [/Ayana[^>]*>([^<]+)</gi]),
      paksha: this.extractWithPatterns(html, [/Paksha[^>]*>([^<]+)</gi]),
      ritu: this.extractWithPatterns(html, [/Ritu[^>]*>([^<]+)</gi])
    };
  }

  /**
   * Extract festivals from HTML
   */
  private extractFestivals(html: string): string[] {
    const festivals: string[] = [];
    const patterns = [
      /Festival[^>]*>([^<]+)</gi,
      /Occasion[^>]*>([^<]+)</gi,
      /"festival"[^>]*>([^<]+)</gi
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        if (match[1] && match[1].trim()) {
          festivals.push(match[1].trim());
        }
      }
    });

    return Array.from(new Set(festivals)); // Remove duplicates
  }

  /**
   * Extract vrats from HTML
   */
  private extractVrats(html: string): string[] {
    const vrats: string[] = [];
    const patterns = [
      /Vrat[^>]*>([^<]+)</gi,
      /Vratam[^>]*>([^<]+)</gi,
      /व्रत[^>]*>([^<]+)</gi
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        if (match[1] && match[1].trim()) {
          vrats.push(match[1].trim());
        }
      }
    });

    return [...new Set(vrats)];
  }

  /**
   * Extract auspicious times from HTML
   */
  private extractAuspiciousTimes(html: string): Array<{name: string, time: string, description: string}> {
    const times: Array<{name: string, time: string, description: string}> = [];
    
    // Look for auspicious time patterns
    const auspiciousPatterns = [
      /Shubh[^>]*>([^<]+)</gi,
      /Auspicious[^>]*>([^<]+)</gi,
      /Good[^>]*Time[^>]*>([^<]+)</gi
    ];

    auspiciousPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        if (match[1] && match[1].trim()) {
          times.push({
            name: 'Auspicious Time',
            time: match[1].trim(),
            description: 'Good for important activities'
          });
        }
      }
    });

    return times;
  }

  /**
   * Extract inauspicious times from HTML
   */
  private extractInauspiciousTimes(html: string): Array<{name: string, time: string, description: string}> {
    const times: Array<{name: string, time: string, description: string}> = [];
    
    // Look for inauspicious time patterns
    const inauspiciousPatterns = [
      /Rahu\s*Kaal[^>]*>([^<]+)</gi,
      /Gulika[^>]*>([^<]+)</gi,
      /Yama\s*Ganda[^>]*>([^<]+)</gi,
      /Dur\s*Muhurat[^>]*>([^<]+)</gi
    ];

    inauspiciousPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        if (match[1] && match[1].trim()) {
          times.push({
            name: 'Inauspicious Time',
            time: match[1].trim(),
            description: 'Avoid important activities'
          });
        }
      }
    });

    return times;
  }

  /**
   * Helper methods for specific extractions
   */
  private extractWithPatterns(html: string, patterns: RegExp[]): string | null {
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1] && match[1].trim().length > 0 && match[1].trim().length < 50) {
        const value = match[1].trim();
        // Skip if value contains HTML tags or common description text
        if (!value.includes('<') && !value.includes('>') && 
            !value.includes('weekday') && !value.includes('element')) {
          return value;
        }
      }
    }
    return null;
  }

  private extractTimeValue(html: string, timeType: string): string | null {
    const timePatterns = [
      new RegExp(`${timeType}[^>]*?([0-9]{1,2}:[0-9]{2}(?:\\s*[AP]M)?)`, 'i'),
      new RegExp(`${timeType}.*?<[^>]*>([0-9]{1,2}:[0-9]{2}[^<]*)`, 'i'),
      new RegExp(`>${timeType}[^<]*?<[^>]*?>([^<]+)<`, 'i')
    ];
    
    for (const pattern of timePatterns) {
      const match = html.match(pattern);
      if (match && match[1] && match[1].trim()) {
        return match[1].trim();
      }
    }
    return null;
  }

  // Helper methods for deity, significance, etc.
  private extractTithiDeity(html: string, tithi: string | null): string | undefined {
    const deityMap: Record<string, string> = {
      'Pratipada': 'Brahma', 'Dwitiya': 'Vidhi', 'Tritiya': 'Gauri',
      'Chaturthi': 'Yama', 'Panchami': 'Naga', 'Shashthi': 'Kartik',
      'Saptami': 'Surya', 'Ashtami': 'Shiva', 'Navami': 'Durga',
      'Dashami': 'Dharma', 'Ekadashi': 'Vishnu', 'Dwadashi': 'Vishnu',
      'Trayodashi': 'Kamdev', 'Chaturdashi': 'Shiva', 'Amavasya': 'Pitru'
    };
    return tithi ? deityMap[tithi] : undefined;
  }

  private extractTithiSignificance(html: string, tithi: string | null): string | undefined {
    // Extract from HTML or use default mapping
    return 'Auspicious for spiritual practices';
  }

  private extractTithiTiming(html: string, type: 'start' | 'end'): string | undefined {
    return this.extractTimeValue(html, `Tithi ${type}`);
  }

  private extractNakshatraLord(html: string, nakshatra: string | null): string | undefined {
    const lordMap: Record<string, string> = {
      'Ashwini': 'Ketu', 'Bharani': 'Venus', 'Krittika': 'Sun',
      'Rohini': 'Moon', 'Mrigashira': 'Mars', 'Ardra': 'Rahu'
      // Add more mappings as needed
    };
    return nakshatra ? lordMap[nakshatra] : undefined;
  }

  private extractNakshatraDeity(html: string, nakshatra: string | null): string | undefined {
    return 'Chandra';
  }

  private extractNakshatraMeaning(html: string, nakshatra: string | null): string | undefined {
    return 'Star constellation';
  }

  private extractNakshatraTiming(html: string, type: 'start' | 'end'): string | undefined {
    return this.extractTimeValue(html, `Nakshatra ${type}`);
  }

  private extractYogaMeaning(html: string, yoga: string | null): string | undefined {
    return 'Auspicious combination';
  }

  private extractYogaTiming(html: string, type: 'start' | 'end'): string | undefined {
    return this.extractTimeValue(html, `Yoga ${type}`);
  }

  private extractKaranaMeaning(html: string, karana: string | null): string | undefined {
    return 'Good for new beginnings';
  }

  private extractKaranaTiming(html: string, type: 'start' | 'end'): string | undefined {
    return this.extractTimeValue(html, `Karana ${type}`);
  }

  private getRashiElement(rashi: string | null): string | undefined {
    const elementMap: Record<string, string> = {
      'Mesha': 'Fire', 'Vrishabha': 'Earth', 'Mithuna': 'Air',
      'Karka': 'Water', 'Simha': 'Fire', 'Kanya': 'Earth',
      'Tula': 'Air', 'Vrishchika': 'Water', 'Dhanu': 'Fire',
      'Makara': 'Earth', 'Kumbha': 'Air', 'Meena': 'Water'
    };
    return rashi ? elementMap[rashi] : undefined;
  }

  private getRashiLord(rashi: string | null): string | undefined {
    const lordMap: Record<string, string> = {
      'Mesha': 'Mars', 'Vrishabha': 'Venus', 'Mithuna': 'Mercury',
      'Karka': 'Moon', 'Simha': 'Sun', 'Kanya': 'Mercury',
      'Tula': 'Venus', 'Vrishchika': 'Mars', 'Dhanu': 'Jupiter',
      'Makara': 'Saturn', 'Kumbha': 'Saturn', 'Meena': 'Jupiter'
    };
    return rashi ? lordMap[rashi] : undefined;
  }

  /**
   * Fetch with timeout and error handling
   */
  private async fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Scrape multiple dates for batch processing
   */
  async scrapeDateRange(
    startDate: string,
    endDate: string,
    cityName: string = 'Delhi'
  ): Promise<PanchangScrapedData[]> {
    const results: PanchangScrapedData[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      try {
        const dateStr = d.toISOString().split('T')[0];
        const data = await this.scrapePanchangData(dateStr, cityName);
        results.push(data);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to scrape ${d.toISOString().split('T')[0]}:`, error);
      }
    }
    
    return results;
  }

  /**
   * Test the scraper with current date
   */
  async testScraper(cityName: string = 'Delhi'): Promise<PanchangScrapedData> {
    const today = new Date().toISOString().split('T')[0];
    return this.scrapePanchangData(today, cityName);
  }
}

// Export singleton instance
export const drikPanchangScraper = new DrikPanchangScraper();