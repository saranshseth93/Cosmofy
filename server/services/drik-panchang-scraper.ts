import { JSDOM } from 'jsdom';

interface DrikPanchangData {
  date: string;
  location: string;
  weekday: string;
  tithi: {
    name: string;
    endTime: string;
    nextTithi: string;
    paksha: string;
  };
  nakshatra: {
    name: string;
    endTime: string;
    nextNakshatra: string;
    lord: string;
    deity: string;
  };
  yoga: {
    name: string;
    endTime: string;
    nextYoga: string;
    meaning: string;
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
  timings: {
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    solarNoon: string;
    dayLength: string;
    nightLength: string;
  };
  moonData: {
    rashi: string;
    rashiLord: string;
    element: string;
    phase: string;
    illumination: string;
  };
  auspiciousTimes: {
    abhijitMuhurat: string;
    amritKaal: string;
    brahmaMuhurat: string;
  };
  inauspiciousTimes: {
    rahuKaal: string;
    yamaGandaKaal: string;
    gulikaKaal: string;
    durMuhurat: string;
  };
  masa: {
    name: string;
    paksha: string;
    ayana: string;
    ritu: string;
  };
  festivals: string[];
  vrats: string[];
  doshaIntervals: Array<{
    startTime: string;
    endTime: string;
    doshas: string[];
    description: string;
    severity: 'normal' | 'caution' | 'avoid';
  }>;
}

export class DrikPanchangScraper {
  private baseUrl = 'https://www.drikpanchang.com';

  async scrapePanchangData(date: string, latitude: number, longitude: number, city: string): Promise<DrikPanchangData> {
    try {
      // Format date for Drik Panchang URL
      const dateObj = new Date(date);
      const formattedDate = dateObj.toISOString().split('T')[0];
      
      // Build URL with location parameters
      const url = `${this.baseUrl}/panchang/day-panchang.html?date=${formattedDate}&lat=${latitude}&lon=${longitude}&tz=5.5`;
      
      console.log(`Scraping authentic Drik Panchang data from: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Extract Panchang data from HTML elements and JavaScript
      const extractedData: Record<string, any> = {};

      // Method 1: Extract from table cells and structured data
      const tables = document.querySelectorAll('table');
      for (const table of tables) {
        const rows = table.querySelectorAll('tr');
        for (const row of rows) {
          const cells = row.querySelectorAll('td, th');
          if (cells.length >= 2) {
            const key = cells[0].textContent?.trim().toLowerCase().replace(/[:\s]/g, '');
            const value = cells[1].textContent?.trim();
            if (key && value) {
              extractedData[key] = value;
            }
          }
        }
      }

      // Method 2: Extract from JavaScript variables with enhanced patterns
      const scriptTags = document.querySelectorAll('script');
      for (const script of scriptTags) {
        const scriptContent = script.textContent || '';
        
        // Enhanced patterns for Drik Panchang specific variables
        const patterns = [
          // Standard JavaScript assignments
          /var\s+(\w+)\s*=\s*["']([^"']+)["']/g,
          /let\s+(\w+)\s*=\s*["']([^"']+)["']/g,
          /const\s+(\w+)\s*=\s*["']([^"']+)["']/g,
          // Time patterns
          /(\w+Time)\s*=\s*["']([^"']+)["']/g,
          // Panchang specific patterns
          /(tithi|nakshatra|yoga|karana|sunrise|sunset|moonrise|moonset)\s*[=:]\s*["']([^"']+)["']/gi,
          // JSON object patterns
          /(\w+)\s*:\s*["']([^"']+)["']/g
        ];

        for (const pattern of patterns) {
          let match;
          while ((match = pattern.exec(scriptContent)) !== null) {
            const [, key, value] = match;
            if (key && value && value !== 'undefined' && value !== 'null') {
              extractedData[key.toLowerCase()] = value;
            }
          }
        }

        // Extract data from window object assignments
        const windowPatterns = [
          /window\.(\w+)\s*=\s*["']([^"']+)["']/g,
          /window\[["'](\w+)["']\]\s*=\s*["']([^"']+)["']/g
        ];

        for (const pattern of windowPatterns) {
          let match;
          while ((match = pattern.exec(scriptContent)) !== null) {
            const [, key, value] = match;
            if (key && value) {
              extractedData[key.toLowerCase()] = value;
            }
          }
        }
      }

      // Method 3: Extract from data attributes and spans
      const dataElements = document.querySelectorAll('[data-*], span[class*="time"], span[class*="name"]');
      for (const element of dataElements) {
        const text = element.textContent?.trim();
        const className = element.className;
        
        if (text && className) {
          if (className.includes('time')) {
            extractedData[className.replace(/[^a-z]/gi, '').toLowerCase()] = text;
          } else if (className.includes('name')) {
            extractedData[className.replace(/[^a-z]/gi, '').toLowerCase()] = text;
          }
        }
      }

      console.log('Extracted Drik Panchang data points:', Object.keys(extractedData).length);
      console.log('Sample extracted data:', Object.keys(extractedData).slice(0, 10));
      
      // Debug: Log all extracted data keys to understand structure
      console.log('All extracted keys:', Object.keys(extractedData).sort());
      
      // Log specific keys we're looking for
      const searchKeys = ['tithi', 'nakshatra', 'yoga', 'karana', 'sunrise', 'sunset', 'moonrise', 'moonset'];
      const foundKeys = searchKeys.filter(key => key in extractedData);
      console.log('Found panchang keys:', foundKeys);
      
      // Log some actual values to understand the data structure
      foundKeys.forEach(key => {
        console.log(`${key}: ${extractedData[key]}`);
      });
      
      // Extract specific data elements
      const tithi = this.extractTithiData(document, extractedData);
      const nakshatra = this.extractNakshatraData(document, extractedData);
      const yoga = this.extractYogaData(document, extractedData);
      const karana = this.extractKaranaData(document, extractedData);
      const timings = this.extractTimingsData(document, extractedData);
      const moonData = this.extractMoonData(document, extractedData);
      const auspiciousTimes = this.extractAuspiciousTimesData(document, extractedData);
      const inauspiciousTimes = this.extractInauspiciousTimesData(document, extractedData);
      const masa = this.extractMasaData(document, extractedData);
      const festivals = this.extractFestivals(document, extractedData);
      const vrats = this.extractVrats(document, extractedData);

      return {
        date: formattedDate,
        location: city,
        weekday: this.getWeekday(dateObj),
        tithi,
        nakshatra,
        yoga,
        karana,
        timings,
        moonData,
        auspiciousTimes,
        inauspiciousTimes,
        masa,
        festivals,
        vrats,
        doshaIntervals: []
      };

    } catch (error) {
      console.error('Error scraping Drik Panchang:', error);
      throw new Error(`Failed to scrape authentic Drik Panchang data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractTithiData(document: Document, data: Record<string, any>) {
    return {
      name: data.tithi || data.currentTithi || 'Unknown',
      endTime: data.tithiEndTime || data.tithi_end || 'Unknown',
      nextTithi: data.nextTithi || data.next_tithi || 'Unknown',
      paksha: data.paksha || data.currentPaksha || 'Unknown'
    };
  }

  private extractNakshatraData(document: Document, data: Record<string, any>) {
    return {
      name: data.nakshatra || data.currentNakshatra || 'Unknown',
      endTime: data.nakshatraEndTime || data.nakshatra_end || 'Unknown',
      nextNakshatra: data.nextNakshatra || data.next_nakshatra || 'Unknown',
      lord: data.nakshatraLord || data.nakshatra_lord || 'Unknown',
      deity: data.nakshatraDeity || data.nakshatra_deity || 'Unknown'
    };
  }

  private extractYogaData(document: Document, data: Record<string, any>) {
    return {
      name: data.yoga || data.currentYoga || 'Unknown',
      endTime: data.yogaEndTime || data.yoga_end || 'Unknown',
      nextYoga: data.nextYoga || data.next_yoga || 'Unknown',
      meaning: data.yogaMeaning || data.yoga_meaning || 'Unknown'
    };
  }

  private extractKaranaData(document: Document, data: Record<string, any>) {
    return {
      name: data.karana || data.currentKarana || 'Unknown',
      endTime: data.karanaEndTime || data.karana_end || 'Unknown',
      nextKarana: data.nextKarana || data.next_karana || 'Unknown'
    };
  }

  private extractTimingsData(document: Document, data: Record<string, any>) {
    return {
      sunrise: data.sunrise || data.sunriseTime || '06:00',
      sunset: data.sunset || data.sunsetTime || '18:00',
      moonrise: data.moonrise || data.moonriseTime || 'Unknown',
      moonset: data.moonset || data.moonsetTime || 'Unknown',
      solarNoon: data.solarNoon || data.solar_noon || '12:00',
      dayLength: data.dayLength || data.day_length || 'Unknown',
      nightLength: data.nightLength || data.night_length || 'Unknown'
    };
  }

  private extractMoonData(document: Document, data: Record<string, any>) {
    return {
      rashi: data.moonRashi || data.moon_rashi || 'Unknown',
      rashiLord: data.rashiLord || data.rashi_lord || 'Unknown',
      element: data.rashiElement || data.rashi_element || 'Unknown',
      phase: data.moonPhase || data.moon_phase || 'Unknown',
      illumination: data.moonIllumination || data.moon_illumination || 'Unknown'
    };
  }

  private extractAuspiciousTimesData(document: Document, data: Record<string, any>) {
    return {
      abhijitMuhurat: data.abhijitMuhurat || data.abhijit_muhurat || 'Unknown',
      amritKaal: data.amritKaal || data.amrit_kaal || 'Unknown',
      brahmaMuhurat: data.brahmaMuhurat || data.brahma_muhurat || 'Unknown'
    };
  }

  private extractInauspiciousTimesData(document: Document, data: Record<string, any>) {
    return {
      rahuKaal: data.rahuKaal || data.rahu_kaal || 'Unknown',
      yamaGandaKaal: data.yamaGandaKaal || data.yama_ganda_kaal || 'Unknown',
      gulikaKaal: data.gulikaKaal || data.gulika_kaal || 'Unknown',
      durMuhurat: data.durMuhurat || data.dur_muhurat || 'Unknown'
    };
  }

  private extractMasaData(document: Document, data: Record<string, any>) {
    return {
      name: data.masa || data.currentMasa || 'Unknown',
      paksha: data.paksha || data.currentPaksha || 'Unknown',
      ayana: data.ayana || data.currentAyana || 'Unknown',
      ritu: data.ritu || data.currentRitu || 'Unknown'
    };
  }

  private extractFestivals(document: Document, data: Record<string, any>): string[] {
    const festivals: string[] = [];
    
    // Look for festival data in various formats
    if (data.festivals && Array.isArray(data.festivals)) {
      festivals.push(...data.festivals);
    }
    
    if (data.festival) {
      festivals.push(data.festival);
    }

    // Extract from DOM elements
    const festivalElements = document.querySelectorAll('.festival, .festivals, [class*="festival"]');
    festivalElements.forEach(element => {
      const text = element.textContent?.trim();
      if (text && !festivals.includes(text)) {
        festivals.push(text);
      }
    });

    return festivals;
  }

  private extractVrats(document: Document, data: Record<string, any>): string[] {
    const vrats: string[] = [];
    
    // Look for vrat data in various formats
    if (data.vrats && Array.isArray(data.vrats)) {
      vrats.push(...data.vrats);
    }
    
    if (data.vrat) {
      vrats.push(data.vrat);
    }

    // Extract from DOM elements
    const vratElements = document.querySelectorAll('.vrat, .vrats, [class*="vrat"]');
    vratElements.forEach(element => {
      const text = element.textContent?.trim();
      if (text && !vrats.includes(text)) {
        vrats.push(text);
      }
    });

    return vrats;
  }

  private getWeekday(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }
}

export const drikPanchangScraper = new DrikPanchangScraper();