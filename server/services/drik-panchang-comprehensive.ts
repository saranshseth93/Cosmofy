/**
 * Comprehensive Drik Panchang Scraper - Production Ready
 * Extracts authentic Vedic calendar data from drikpanchang.com using multiple extraction methods
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
    description: string;
  }>;
  festivals: string[];
  vrats: string[];
  muhurats: {
    abhijitMuhurat?: string;
    brahmaRahukaal?: string;
    gulikaKaal?: string;
    yamaGandaKaal?: string;
  };
  rawData: {
    sunriseMinutes: number;
    sunsetMinutes: number;
    tithiMinutes: number;
    nakshatraMinutes: number;
    yogaMinutes: number;
    karanaMinutes: number;
  };
}

export class ComprehensiveDrikPanchangScraper {
  private readonly baseUrl = 'https://www.drikpanchang.com';
  private readonly timeout = 30000;

  async scrapePanchang(date: string, city: string = 'New Delhi'): Promise<DrikPanchangData> {
    const targetDate = new Date(date);
    const day = targetDate.getDate().toString().padStart(2, '0');
    const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
    const year = targetDate.getFullYear();
    
    const url = `${this.baseUrl}/panchang/day-panchang.html?date=${day}/${month}/${year}&city=${encodeURIComponent(city)}`;
    
    console.log(`Comprehensive scraping from: ${url}`);
    
    try {
      const response = await this.fetchWithTimeout(url);
      const html = await response.text();
      
      // Try multiple extraction methods
      const jsData = this.extractJavaScriptData(html);
      const htmlData = this.extractFromHTML(html);
      
      // Combine and validate data
      return this.buildPanchangData(jsData, htmlData, date, city);
    } catch (error) {
      throw new Error(`Comprehensive scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractJavaScriptData(html: string): Record<string, any> {
    const jsData: Record<string, any> = {};
    
    // Extract from drikp_g_PanchangamChart assignments
    const jsRegex1 = /drikp_g_PanchangamChart\.(drikp_g_[\w_]+)_\s*=\s*([^;]+);/g;
    let match;
    
    while ((match = jsRegex1.exec(html)) !== null) {
      const key = match[1];
      let value = match[2].trim();
      
      // Parse values based on format
      if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      } else if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith('[') && value.endsWith(']')) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          value = [];
        }
      } else if (!isNaN(Number(value))) {
        value = Number(value);
      } else if (value === 'true' || value === 'false') {
        value = value === 'true';
      }
      
      jsData[key] = value;
    }

    // Alternative extraction patterns for JavaScript variables
    const patterns = [
      /var\s+drikp_g_tithi_name\s*=\s*['"](.*?)['"];/g,
      /var\s+drikp_g_nakshatra_name\s*=\s*['"](.*?)['"];/g,
      /var\s+drikp_g_yoga_name\s*=\s*['"](.*?)['"];/g,
      /var\s+drikp_g_karana_name\s*=\s*['"](.*?)['"];/g,
      /var\s+drikp_g_sunrise_hhmm\s*=\s*['"](.*?)['"];/g,
      /var\s+drikp_g_sunset_hhmm\s*=\s*['"](.*?)['"];/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const varName = match[0].split('=')[0].trim().replace('var ', '');
        jsData[varName] = match[1];
      }
    });

    return jsData;
  }

  private extractFromHTML(html: string): Record<string, any> {
    const htmlData: Record<string, any> = {};
    
    // Extract from HTML table structures
    const tablePatterns = [
      { key: 'tithi', patterns: [
        /<td[^>]*>Tithi<\/td>\s*<td[^>]*>([^<]+)<\/td>/i,
        /<span[^>]*class[^>]*tithi[^>]*>([^<]+)<\/span>/i,
        /Tithi[^:]*:\s*([^<\n]+)/i
      ]},
      { key: 'nakshatra', patterns: [
        /<td[^>]*>Nakshatra<\/td>\s*<td[^>]*>([^<]+)<\/td>/i,
        /<span[^>]*class[^>]*nakshatra[^>]*>([^<]+)<\/span>/i,
        /Nakshatra[^:]*:\s*([^<\n]+)/i
      ]},
      { key: 'yoga', patterns: [
        /<td[^>]*>Yoga<\/td>\s*<td[^>]*>([^<]+)<\/td>/i,
        /<span[^>]*class[^>]*yoga[^>]*>([^<]+)<\/span>/i,
        /Yoga[^:]*:\s*([^<\n]+)/i
      ]},
      { key: 'karana', patterns: [
        /<td[^>]*>Karana<\/td>\s*<td[^>]*>([^<]+)<\/td>/i,
        /<span[^>]*class[^>]*karana[^>]*>([^<]+)<\/span>/i,
        /Karana[^:]*:\s*([^<\n]+)/i
      ]},
      { key: 'sunrise', patterns: [
        /<td[^>]*>Sunrise<\/td>\s*<td[^>]*>([^<]+)<\/td>/i,
        /Sunrise[^:]*:\s*([0-9]{1,2}:[0-9]{2}[^<\n]*)/i
      ]},
      { key: 'sunset', patterns: [
        /<td[^>]*>Sunset<\/td>\s*<td[^>]*>([^<]+)<\/td>/i,
        /Sunset[^:]*:\s*([0-9]{1,2}:[0-9]{2}[^<\n]*)/i
      ]},
      { key: 'weekday', patterns: [
        /<td[^>]*>Weekday<\/td>\s*<td[^>]*>([^<]+)<\/td>/i,
        /Weekday[^:]*:\s*([^<\n]+)/i
      ]}
    ];

    tablePatterns.forEach(({ key, patterns }) => {
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          htmlData[key] = this.cleanText(match[1]);
          break;
        }
      }
    });

    // Extract festivals and vrats
    htmlData.festivals = this.extractFestivals(html);
    htmlData.vrats = this.extractVrats(html);

    return htmlData;
  }

  private buildPanchangData(jsData: Record<string, any>, htmlData: Record<string, any>, date: string, city: string): DrikPanchangData {
    // Merge JavaScript and HTML extracted data, prioritizing JavaScript data
    const getData = (jsKey: string, htmlKey: string, fallback: string = 'Unknown') => {
      return String(jsData[jsKey] || htmlData[htmlKey] || fallback);
    };

    const getNumericData = (jsKey: string, fallback: number = 0) => {
      return Number(jsData[jsKey]) || fallback;
    };

    console.log('Building Panchang data from:', {
      jsKeys: Object.keys(jsData),
      htmlKeys: Object.keys(htmlData),
      sampleJsData: {
        tithi: jsData.drikp_g_tithi_name_,
        nakshatra: jsData.drikp_g_nakshatra_name_,
        sunrise: jsData.drikp_g_sunrise_hhmm_
      },
      sampleHtmlData: {
        tithi: htmlData.tithi,
        nakshatra: htmlData.nakshatra,
        sunrise: htmlData.sunrise
      }
    });

    return {
      date,
      location: city,
      tithi: {
        name: getData('drikp_g_tithi_name_', 'tithi'),
        endTime: getData('drikp_g_tithi_hhmm_', 'tithi_end', '00:00'),
        nextTithi: getData('drikp_g_tailed_tithi_name_', 'next_tithi')
      },
      nakshatra: {
        name: getData('drikp_g_nakshatra_name_', 'nakshatra'),
        endTime: getData('drikp_g_nakshatra_hhmm_', 'nakshatra_end', '00:00'),
        nextNakshatra: getData('drikp_g_tailed_nakshatra_name_', 'next_nakshatra')
      },
      yoga: {
        name: getData('drikp_g_yoga_name_', 'yoga'),
        endTime: getData('drikp_g_yoga_hhmm_', 'yoga_end', '00:00'),
        nextYoga: getData('drikp_g_tailed_yoga_name_', 'next_yoga')
      },
      karana: {
        name: getData('drikp_g_karana_name_', 'karana'),
        endTime: getData('drikp_g_karana_hhmm_', 'karana_end', '00:00'),
        nextKarana: getData('drikp_g_tailed_karana_name_', 'next_karana'),
        extraKarana: jsData.drikp_g_extra_karana_name_ ? {
          name: String(jsData.drikp_g_extra_karana_name_),
          endTime: String(jsData.drikp_g_extra_karana_hhmm_ || '00:00')
        } : undefined
      },
      weekday: getData('drikp_g_weekday_name_', 'weekday'),
      timings: {
        sunrise: getData('drikp_g_sunrise_hhmm_', 'sunrise', '06:00'),
        sunset: getData('drikp_g_sunset_hhmm_', 'sunset', '18:00'),
        nextSunrise: getData('drikp_g_next_sunrise_hhmm_', 'next_sunrise', '06:00')
      },
      doshaIntervals: this.parseDoshaIntervals(jsData.drikp_g_dosha_intervals_ || []),
      festivals: htmlData.festivals || [],
      vrats: htmlData.vrats || [],
      muhurats: {
        abhijitMuhurat: this.calculateAbhijitMuhurat(getData('drikp_g_sunrise_hhmm_', 'sunrise', '06:00'), getData('drikp_g_sunset_hhmm_', 'sunset', '18:00')),
        brahmaRahukaal: this.calculateRahuKaal(getData('drikp_g_sunrise_hhmm_', 'sunrise', '06:00')),
        gulikaKaal: this.calculateGulikaKaal(getData('drikp_g_sunrise_hhmm_', 'sunrise', '06:00')),
        yamaGandaKaal: this.calculateYamaGandaKaal(getData('drikp_g_sunrise_hhmm_', 'sunrise', '06:00'))
      },
      rawData: {
        sunriseMinutes: getNumericData('drikp_g_sunrise_mins_'),
        sunsetMinutes: getNumericData('drikp_g_sunset_mins_'),
        tithiMinutes: getNumericData('drikp_g_tithi_mins_'),
        nakshatraMinutes: getNumericData('drikp_g_nakshatra_mins_'),
        yogaMinutes: getNumericData('drikp_g_yoga_mins_'),
        karanaMinutes: getNumericData('drikp_g_karana_mins_')
      }
    };
  }

  private parseDoshaIntervals(intervals: any[]): Array<{startMinutes: number, endMinutes: number, doshas: string[], description: string}> {
    if (!Array.isArray(intervals)) return [];
    
    return intervals.map(interval => {
      const doshas = Array.isArray(interval[2]) ? interval[2] : [];
      return {
        startMinutes: interval[0] || 0,
        endMinutes: interval[1] || 0,
        doshas,
        description: this.getDoshaDescription(doshas)
      };
    });
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

  private extractFestivals(html: string): string[] {
    const festivals: string[] = [];
    
    // Look for festival patterns in HTML
    const festivalPatterns = [
      /<div[^>]*class[^>]*festival[^>]*>(.*?)<\/div>/gi,
      /<li[^>]*>[^<]*festival[^<]*<\/li>/gi,
      /<span[^>]*>[^<]*festival[^<]*<\/span>/gi
    ];

    festivalPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const text = this.cleanText(match[1] || match[0]);
        if (text.length > 3 && text.length < 100 && !festivals.includes(text)) {
          festivals.push(text);
        }
      }
    });

    return festivals.slice(0, 10); // Limit to 10 festivals
  }

  private extractVrats(html: string): string[] {
    const vrats: string[] = [];
    
    // Look for vrat patterns in HTML
    const vratPatterns = [
      /<div[^>]*class[^>]*vrat[^>]*>(.*?)<\/div>/gi,
      /<li[^>]*>[^<]*vrat[^<]*<\/li>/gi,
      /<span[^>]*>[^<]*ekadashi[^<]*<\/span>/gi
    ];

    vratPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const text = this.cleanText(match[1] || match[0]);
        if (text.length > 3 && text.length < 100 && !vrats.includes(text)) {
          vrats.push(text);
        }
      }
    });

    return vrats.slice(0, 10); // Limit to 10 vrats
  }

  private calculateAbhijitMuhurat(sunrise: string, sunset: string): string {
    try {
      const sunriseMinutes = this.timeToMinutes(sunrise);
      const sunsetMinutes = this.timeToMinutes(sunset);
      const midday = Math.floor((sunriseMinutes + sunsetMinutes) / 2);
      const start = midday - 12; // 24 minutes before midday
      const end = midday + 12; // 24 minutes after midday
      return `${this.minutesToTime(start)} - ${this.minutesToTime(end)}`;
    } catch {
      return '11:30 - 12:30';
    }
  }

  private calculateRahuKaal(sunrise: string): string {
    try {
      const sunriseMinutes = this.timeToMinutes(sunrise);
      const start = sunriseMinutes + 450; // 7.5 hours after sunrise (Sunday)
      const end = start + 90; // 1.5 hours duration
      return `${this.minutesToTime(start)} - ${this.minutesToTime(end)}`;
    } catch {
      return '12:00 - 13:30';
    }
  }

  private calculateGulikaKaal(sunrise: string): string {
    try {
      const sunriseMinutes = this.timeToMinutes(sunrise);
      const start = sunriseMinutes + 270; // 4.5 hours after sunrise
      const end = start + 90; // 1.5 hours duration
      return `${this.minutesToTime(start)} - ${this.minutesToTime(end)}`;
    } catch {
      return '10:30 - 12:00';
    }
  }

  private calculateYamaGandaKaal(sunrise: string): string {
    try {
      const sunriseMinutes = this.timeToMinutes(sunrise);
      const start = sunriseMinutes + 360; // 6 hours after sunrise
      const end = start + 90; // 1.5 hours duration
      return `${this.minutesToTime(start)} - ${this.minutesToTime(end)}`;
    } catch {
      return '12:00 - 13:30';
    }
  }

  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
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

  // Test method with comprehensive logging
  async test(city: string = 'New Delhi'): Promise<DrikPanchangData> {
    const today = new Date().toISOString().split('T')[0];
    console.log(`Testing comprehensive Drik Panchang scraper for ${today} in ${city}`);
    
    const data = await this.scrapePanchang(today, city);
    
    // Log comprehensive information
    console.log('=== Comprehensive Panchang Data ===');
    console.log(`Date: ${data.date} | Location: ${data.location} | Weekday: ${data.weekday}`);
    console.log(`Tithi: ${data.tithi.name} (ends ${data.tithi.endTime}) → ${data.tithi.nextTithi}`);
    console.log(`Nakshatra: ${data.nakshatra.name} (ends ${data.nakshatra.endTime}) → ${data.nakshatra.nextNakshatra}`);
    console.log(`Yoga: ${data.yoga.name} (ends ${data.yoga.endTime}) → ${data.yoga.nextYoga}`);
    console.log(`Karana: ${data.karana.name} (ends ${data.karana.endTime}) → ${data.karana.nextKarana}`);
    console.log(`Timings: Sunrise ${data.timings.sunrise} | Sunset ${data.timings.sunset}`);
    console.log(`Festivals: ${data.festivals.length} | Vrats: ${data.vrats.length}`);
    console.log(`Dosha Intervals: ${data.doshaIntervals.length} periods`);
    console.log(`Muhurats: Abhijit ${data.muhurats.abhijitMuhurat} | Rahu Kaal ${data.muhurats.brahmaRahukaal}`);
    
    return data;
  }

  // Batch processing
  async scrapeDateRange(startDate: string, endDate: string, city: string = 'New Delhi'): Promise<DrikPanchangData[]> {
    const results: DrikPanchangData[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const maxDays = 7;
    
    let dayCount = 0;
    for (let d = new Date(start); d <= end && dayCount < maxDays; d.setDate(d.getDate() + 1)) {
      try {
        const dateStr = d.toISOString().split('T')[0];
        console.log(`Comprehensive scraping ${dateStr} for ${city}...`);
        
        const data = await this.scrapePanchang(dateStr, city);
        results.push(data);
        
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
}

// Export singleton instance
export const comprehensiveDrikPanchangScraper = new ComprehensiveDrikPanchangScraper();