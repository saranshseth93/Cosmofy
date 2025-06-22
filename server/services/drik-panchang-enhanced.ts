/**
 * Enhanced Drik Panchang Scraper - Targets JavaScript Data Structure
 * Extracts authentic Vedic calendar data from drikpanchang.com JavaScript variables
 */

export interface DrikPanchangData {
  date: string;
  location: string;
  tithi: {
    name: string;
    endTime: string;
    nextTithi: string;
  };
  nakshatra: {
    name: string;
    endTime: string;
    nextNakshatra: string;
  };
  yoga: {
    name: string;
    endTime: string;
    nextYoga: string;
  };
  karana: {
    name: string;
    endTime: string;
    nextKarana: string;
    extraKarana?: {
      name: string;
      endTime: string;
    };
  };
  weekday: string;
  timings: {
    sunrise: string;
    sunset: string;
    nextSunrise: string;
  };
  doshaIntervals: Array<{
    startMinutes: number;
    endMinutes: number;
    doshas: string[];
  }>;
  rawData: {
    sunriseMinutes: number;
    sunsetMinutes: number;
    tithiMinutes: number;
    nakshatraMinutes: number;
    yogaMinutes: number;
    karanaMinutes: number;
  };
}

export class EnhancedDrikPanchangScraper {
  private readonly baseUrl = 'https://www.drikpanchang.com';
  private readonly timeout = 30000;

  async scrapePanchang(date: string, city: string = 'New Delhi'): Promise<DrikPanchangData> {
    const targetDate = new Date(date);
    const day = targetDate.getDate().toString().padStart(2, '0');
    const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
    const year = targetDate.getFullYear();
    
    const url = `${this.baseUrl}/panchang/day-panchang.html?date=${day}/${month}/${year}&city=${encodeURIComponent(city)}`;
    
    console.log(`Scraping enhanced Panchang from: ${url}`);
    
    try {
      const response = await this.fetchWithTimeout(url);
      const html = await response.text();
      
      return this.extractPanchangDataFromJS(html, date, city);
    } catch (error) {
      throw new Error(`Enhanced scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractPanchangDataFromJS(html: string, date: string, city: string): DrikPanchangData {
    // Extract the JavaScript variables containing Panchang data
    const jsDataRegex = /drikp_g_PanchangamChart\.([\w_]+)_\s*=\s*([^;]+);/g;
    const jsData: Record<string, string | number | any[]> = {};
    
    let match;
    while ((match = jsDataRegex.exec(html)) !== null) {
      const key = match[1];
      let value = match[2].trim();
      
      // Parse different value types
      if (value.startsWith("'") && value.endsWith("'")) {
        // String value
        value = value.slice(1, -1);
      } else if (value.startsWith('"') && value.endsWith('"')) {
        // String value with double quotes
        value = value.slice(1, -1);
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Array value - parse as JSON
        try {
          value = JSON.parse(value);
        } catch (e) {
          console.warn(`Failed to parse array for ${key}:`, value);
        }
      } else if (!isNaN(Number(value))) {
        // Numeric value
        value = Number(value);
      } else if (value === 'true' || value === 'false') {
        // Boolean value as string for consistency
        value = value;
      }
      
      jsData[key] = value;
    }

    console.log('Extracted JS data keys:', Object.keys(jsData));

    // Build the Panchang data structure from extracted JavaScript variables
    return {
      date,
      location: city,
      tithi: {
        name: jsData.drikp_g_tithi_name_ || 'Unknown',
        endTime: jsData.drikp_g_tithi_hhmm_ || '00:00',
        nextTithi: jsData.drikp_g_tailed_tithi_name_ || 'Unknown'
      },
      nakshatra: {
        name: jsData.drikp_g_nakshatra_name_ || 'Unknown',
        endTime: jsData.drikp_g_nakshatra_hhmm_ || '00:00',
        nextNakshatra: jsData.drikp_g_tailed_nakshatra_name_ || 'Unknown'
      },
      yoga: {
        name: jsData.drikp_g_yoga_name_ || 'Unknown',
        endTime: jsData.drikp_g_yoga_hhmm_ || '00:00',
        nextYoga: jsData.drikp_g_tailed_yoga_name_ || 'Unknown'
      },
      karana: {
        name: jsData.drikp_g_karana_name_ || 'Unknown',
        endTime: jsData.drikp_g_karana_hhmm_ || '00:00',
        nextKarana: jsData.drikp_g_tailed_karana_name_ || 'Unknown',
        extraKarana: jsData.drikp_g_extra_karana_name_ ? {
          name: jsData.drikp_g_extra_karana_name_,
          endTime: jsData.drikp_g_extra_karana_hhmm_ || '00:00'
        } : undefined
      },
      weekday: jsData.drikp_g_weekday_name_ || 'Unknown',
      timings: {
        sunrise: jsData.drikp_g_sunrise_hhmm_ || '06:00',
        sunset: jsData.drikp_g_sunset_hhmm_ || '18:00',
        nextSunrise: jsData.drikp_g_next_sunrise_hhmm_ || '06:00'
      },
      doshaIntervals: this.parseDoshaIntervals(jsData.drikp_g_dosha_intervals_ || []),
      rawData: {
        sunriseMinutes: jsData.drikp_g_sunrise_mins_ || 0,
        sunsetMinutes: jsData.drikp_g_sunset_mins_ || 0,
        tithiMinutes: jsData.drikp_g_tithi_mins_ || 0,
        nakshatraMinutes: jsData.drikp_g_nakshatra_mins_ || 0,
        yogaMinutes: jsData.drikp_g_yoga_mins_ || 0,
        karanaMinutes: jsData.drikp_g_karana_mins_ || 0
      }
    };
  }

  private parseDoshaIntervals(intervals: any[]): Array<{startMinutes: number, endMinutes: number, doshas: string[]}> {
    if (!Array.isArray(intervals)) return [];
    
    return intervals.map(interval => ({
      startMinutes: interval[0] || 0,
      endMinutes: interval[1] || 0,
      doshas: Array.isArray(interval[2]) ? interval[2] : []
    }));
  }

  private async fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - Drik Panchang website took too long to respond');
      }
      throw error;
    }
  }

  // Convert minutes from midnight to HH:MM format
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // Get detailed dosha information
  getDoshaInfo(data: DrikPanchangData): Array<{time: string, doshas: string[], description: string}> {
    return data.doshaIntervals.map(interval => ({
      time: `${this.minutesToTime(interval.startMinutes)} - ${this.minutesToTime(interval.endMinutes)}`,
      doshas: interval.doshas,
      description: this.getDoshaDescription(interval.doshas)
    }));
  }

  private getDoshaDescription(doshas: string[]): string {
    const descriptions: Record<string, string> = {
      'Rahu': 'Inauspicious time - avoid important activities',
      'T Randhra': 'Tithi related dosha - be cautious',
      'N Visha': 'Nakshatra related dosha - avoid new beginnings',
      'Nakshatra': 'Nakshatra period - generally neutral',
      'Tithi': 'Tithi period - generally neutral'
    };

    const mainDoshas = doshas.filter(d => descriptions[d]);
    if (mainDoshas.length === 0) return 'Normal period';
    
    return mainDoshas.map(d => descriptions[d]).join('; ');
  }

  // Batch processing for multiple dates
  async scrapeDateRange(startDate: string, endDate: string, city: string = 'New Delhi'): Promise<DrikPanchangData[]> {
    const results: DrikPanchangData[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const maxDays = 7; // Limit batch size
    
    let dayCount = 0;
    for (let d = new Date(start); d <= end && dayCount < maxDays; d.setDate(d.getDate() + 1)) {
      try {
        const dateStr = d.toISOString().split('T')[0];
        console.log(`Enhanced scraping ${dateStr} for ${city}...`);
        
        const data = await this.scrapePanchang(dateStr, city);
        results.push(data);
        
        // Rate limiting: 2 second delay between requests
        if (dayCount < maxDays - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        console.log(`✓ Successfully scraped ${dateStr}`);
        dayCount++;
      } catch (error) {
        console.error(`✗ Failed to scrape ${d.toISOString().split('T')[0]}:`, error);
      }
    }
    
    return results;
  }

  // Test method with enhanced data display
  async test(city: string = 'New Delhi'): Promise<DrikPanchangData> {
    const today = new Date().toISOString().split('T')[0];
    console.log(`Testing enhanced Drik Panchang scraper for ${today} in ${city}`);
    
    const data = await this.scrapePanchang(today, city);
    
    // Log detailed information
    console.log('=== Enhanced Panchang Data ===');
    console.log(`Date: ${data.date} | Location: ${data.location}`);
    console.log(`Weekday: ${data.weekday}`);
    console.log(`Tithi: ${data.tithi.name} (ends at ${data.tithi.endTime}) → ${data.tithi.nextTithi}`);
    console.log(`Nakshatra: ${data.nakshatra.name} (ends at ${data.nakshatra.endTime}) → ${data.nakshatra.nextNakshatra}`);
    console.log(`Yoga: ${data.yoga.name} (ends at ${data.yoga.endTime}) → ${data.yoga.nextYoga}`);
    console.log(`Karana: ${data.karana.name} (ends at ${data.karana.endTime}) → ${data.karana.nextKarana}`);
    if (data.karana.extraKarana) {
      console.log(`Extra Karana: ${data.karana.extraKarana.name} (ends at ${data.karana.extraKarana.endTime})`);
    }
    console.log(`Sunrise: ${data.timings.sunrise} | Sunset: ${data.timings.sunset}`);
    console.log(`Dosha Intervals: ${data.doshaIntervals.length} periods`);
    
    return data;
  }

  // Get summary for display
  getSummary(data: DrikPanchangData): string {
    return `${data.date} ${data.location}: ${data.tithi.name} | ${data.nakshatra.name} | ${data.yoga.name} | ${data.karana.name} | ${data.weekday}`;
  }
}

// Export singleton instance
export const enhancedDrikPanchangScraper = new EnhancedDrikPanchangScraper();