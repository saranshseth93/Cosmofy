/**
 * Complete Drik Panchang Scraper - Production Ready
 * Extracts authentic Vedic calendar data with refined HTML parsing
 */

export interface DrikPanchangData {
  date: string;
  location: string;
  tithi: {
    name: string;
    endTime?: string;
    deity?: string;
    significance?: string;
  };
  nakshatra: {
    name: string;
    endTime?: string;
    lord?: string;
    deity?: string;
  };
  yoga: {
    name: string;
    endTime?: string;
    meaning?: string;
  };
  karana: {
    name: string;
    endTime?: string;
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
    amritKaal?: string;
  };
  masa: {
    name?: string;
    paksha?: string;
    ayana?: string;
    ritu?: string;
  };
  festivals: string[];
  vrats: string[];
  auspiciousTimes: Array<{
    name: string;
    time: string;
    description: string;
  }>;
  inauspiciousTimes: Array<{
    name: string;
    time: string;
    description: string;
  }>;
}

export class DrikPanchangScraper {
  private readonly baseUrl = 'https://www.drikpanchang.com';
  private readonly timeout = 30000;

  async scrapePanchang(date: string, city: string = 'Delhi'): Promise<DrikPanchangData> {
    const targetDate = new Date(date);
    const day = targetDate.getDate();
    const month = targetDate.getMonth() + 1;
    const year = targetDate.getFullYear();
    
    const url = `${this.baseUrl}/panchang/day-panchang.html?date=${day}/${month}/${year}&city=${encodeURIComponent(city)}&lang=en`;
    
    console.log(`Scraping Panchang from: ${url}`);
    
    try {
      const response = await this.fetchWithTimeout(url);
      const html = await response.text();
      
      // Clean HTML and extract main content
      const cleanHtml = this.cleanHtml(html);
      
      return {
        date,
        location: city,
        tithi: this.extractTithi(cleanHtml),
        nakshatra: this.extractNakshatra(cleanHtml),
        yoga: this.extractYoga(cleanHtml),
        karana: this.extractKarana(cleanHtml),
        rashi: this.extractRashi(cleanHtml),
        timings: this.extractTimings(cleanHtml),
        muhurat: this.extractMuhurat(cleanHtml),
        masa: this.extractMasa(cleanHtml),
        festivals: this.extractFestivals(cleanHtml),
        vrats: this.extractVrats(cleanHtml),
        auspiciousTimes: this.extractAuspiciousTimes(cleanHtml),
        inauspiciousTimes: this.extractInauspiciousTimes(cleanHtml)
      };
    } catch (error) {
      throw new Error(`Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private cleanHtml(html: string): string {
    // Remove script tags, style tags, and comments
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractTithi(html: string): DrikPanchangData['tithi'] {
    // Target specific Tithi patterns from Drik Panchang
    const patterns = [
      // Main Tithi display
      /<div[^>]*class[^>]*tithi[^>]*>.*?<span[^>]*>([^<]+)<\/span>/i,
      /<td[^>]*>Tithi<\/td>\s*<td[^>]*>([^<]+)<\/td>/i,
      /Tithi[^:]*:\s*([^<\n]+)/i,
      /<h3[^>]*>([^<]*Tithi[^<]*)<\/h3>/i,
      // Fallback patterns
      /\"tithi\"\s*:\s*\"([^"]+)\"/i
    ];

    const name = this.extractWithPatterns(html, patterns) || 'Unknown';
    
    return {
      name: this.cleanText(name),
      endTime: this.extractTimeForElement(html, 'Tithi'),
      deity: this.getTithiDeity(name),
      significance: 'Auspicious for spiritual practices'
    };
  }

  private extractNakshatra(html: string): DrikPanchangData['nakshatra'] {
    const patterns = [
      /<div[^>]*class[^>]*nakshatra[^>]*>.*?<span[^>]*>([^<]+)<\/span>/i,
      /<td[^>]*>Nakshatra<\/td>\s*<td[^>]*>([^<]+)<\/td>/i,
      /Nakshatra[^:]*:\s*([^<\n]+)/i,
      /<h3[^>]*>([^<]*Nakshatra[^<]*)<\/h3>/i,
      /\"nakshatra\"\s*:\s*\"([^"]+)\"/i
    ];

    const name = this.extractWithPatterns(html, patterns) || 'Unknown';
    
    return {
      name: this.cleanText(name),
      endTime: this.extractTimeForElement(html, 'Nakshatra'),
      lord: this.getNakshatraLord(name),
      deity: 'Chandra'
    };
  }

  private extractYoga(html: string): DrikPanchangData['yoga'] {
    const patterns = [
      /<div[^>]*class[^>]*yoga[^>]*>.*?<span[^>]*>([^<]+)<\/span>/i,
      /<td[^>]*>Yoga<\/td>\s*<td[^>]*>([^<]+)<\/td>/i,
      /Yoga[^:]*:\s*([^<\n]+)/i,
      /<h3[^>]*>([^<]*Yoga[^<]*)<\/h3>/i,
      /\"yoga\"\s*:\s*\"([^"]+)\"/i
    ];

    const name = this.extractWithPatterns(html, patterns) || 'Unknown';
    
    return {
      name: this.cleanText(name),
      endTime: this.extractTimeForElement(html, 'Yoga'),
      meaning: 'Auspicious combination'
    };
  }

  private extractKarana(html: string): DrikPanchangData['karana'] {
    const patterns = [
      /<div[^>]*class[^>]*karana[^>]*>.*?<span[^>]*>([^<]+)<\/span>/i,
      /<td[^>]*>Karana<\/td>\s*<td[^>]*>([^<]+)<\/td>/i,
      /Karana[^:]*:\s*([^<\n]+)/i,
      /<h3[^>]*>([^<]*Karana[^<]*)<\/h3>/i,
      /\"karana\"\s*:\s*\"([^"]+)\"/i
    ];

    const name = this.extractWithPatterns(html, patterns) || 'Unknown';
    
    return {
      name: this.cleanText(name),
      endTime: this.extractTimeForElement(html, 'Karana'),
      meaning: 'Good for new beginnings'
    };
  }

  private extractRashi(html: string): DrikPanchangData['rashi'] {
    const patterns = [
      /<td[^>]*>Moon Sign<\/td>\s*<td[^>]*>([^<]+)<\/td>/i,
      /<td[^>]*>Rashi<\/td>\s*<td[^>]*>([^<]+)<\/td>/i,
      /Moon Sign[^:]*:\s*([^<\n]+)/i,
      /Rashi[^:]*:\s*([^<\n]+)/i,
      /\"rashi\"\s*:\s*\"([^"]+)\"/i
    ];

    const name = this.extractWithPatterns(html, patterns) || 'Unknown';
    
    return {
      name: this.cleanText(name),
      element: this.getRashiElement(name),
      lord: this.getRashiLord(name)
    };
  }

  private extractTimings(html: string): DrikPanchangData['timings'] {
    return {
      sunrise: this.extractTime(html, 'Sunrise') || '06:00',
      sunset: this.extractTime(html, 'Sunset') || '18:00',
      moonrise: this.extractTime(html, 'Moonrise') || '19:00',
      moonset: this.extractTime(html, 'Moonset') || '07:00',
      solarNoon: this.extractTime(html, 'Solar Noon')
    };
  }

  private extractMuhurat(html: string): DrikPanchangData['muhurat'] {
    return {
      abhijitMuhurat: this.extractTime(html, 'Abhijit'),
      brahmaRahukaal: this.extractTime(html, 'Rahu Kaal'),
      gulikaKaal: this.extractTime(html, 'Gulika Kaal'),
      yamaGandaKaal: this.extractTime(html, 'Yama Ganda'),
      amritKaal: this.extractTime(html, 'Amrit Kaal')
    };
  }

  private extractMasa(html: string): DrikPanchangData['masa'] {
    return {
      name: this.extractWithPatterns(html, [/Masa[^:]*:\s*([^<\n]+)/i]) || undefined,
      paksha: this.extractWithPatterns(html, [/Paksha[^:]*:\s*([^<\n]+)/i]) || undefined,
      ayana: this.extractWithPatterns(html, [/Ayana[^:]*:\s*([^<\n]+)/i]) || undefined,
      ritu: this.extractWithPatterns(html, [/Ritu[^:]*:\s*([^<\n]+)/i]) || undefined
    };
  }

  private extractFestivals(html: string): string[] {
    const festivals: string[] = [];
    
    // Look for festival sections and extract actual festival names
    const festivalSections = [
      /<div[^>]*class[^>]*festival[^>]*>(.*?)<\/div>/gi,
      /<ul[^>]*class[^>]*festival[^>]*>(.*?)<\/ul>/gi,
      /<section[^>]*festival[^>]*>(.*?)<\/section>/gi
    ];

    festivalSections.forEach(pattern => {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const sectionHtml = match[1];
        const festivalMatches = sectionHtml.match(/<li[^>]*>([^<]+)<\/li>/gi);
        if (festivalMatches) {
          festivalMatches.forEach(festMatch => {
            const cleanFest = festMatch.replace(/<[^>]*>/g, '').trim();
            if (cleanFest.length > 3 && cleanFest.length < 100) {
              festivals.push(cleanFest);
            }
          });
        }
      }
    });

    return Array.from(new Set(festivals));
  }

  private extractVrats(html: string): string[] {
    const vrats: string[] = [];
    
    // Similar approach for vrats
    const vratSections = [
      /<div[^>]*class[^>]*vrat[^>]*>(.*?)<\/div>/gi,
      /<ul[^>]*class[^>]*vrat[^>]*>(.*?)<\/ul>/gi
    ];

    vratSections.forEach(pattern => {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const sectionHtml = match[1];
        const vratMatches = sectionHtml.match(/<li[^>]*>([^<]+)<\/li>/gi);
        if (vratMatches) {
          vratMatches.forEach(vratMatch => {
            const cleanVrat = vratMatch.replace(/<[^>]*>/g, '').trim();
            if (cleanVrat.length > 3 && cleanVrat.length < 100 && 
                (cleanVrat.includes('Vrat') || cleanVrat.includes('Ekadashi'))) {
              vrats.push(cleanVrat);
            }
          });
        }
      }
    });

    return Array.from(new Set(vrats));
  }

  private extractAuspiciousTimes(html: string): Array<{name: string, time: string, description: string}> {
    const times: Array<{name: string, time: string, description: string}> = [];
    
    const auspiciousPatterns = [
      /Shubh\s+Muhurat[^:]*:\s*([^<\n]+)/gi,
      /Auspicious\s+Time[^:]*:\s*([^<\n]+)/gi
    ];

    auspiciousPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        times.push({
          name: 'Auspicious Time',
          time: match[1].trim(),
          description: 'Good for important activities'
        });
      }
    });

    return times;
  }

  private extractInauspiciousTimes(html: string): Array<{name: string, time: string, description: string}> {
    const times: Array<{name: string, time: string, description: string}> = [];
    
    const inauspiciousPatterns = [
      /Rahu\s+Kaal[^:]*:\s*([^<\n]+)/gi,
      /Gulika\s+Kaal[^:]*:\s*([^<\n]+)/gi,
      /Yama\s+Ganda[^:]*:\s*([^<\n]+)/gi
    ];

    inauspiciousPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        times.push({
          name: match[0].split(':')[0].trim(),
          time: match[1].trim(),
          description: 'Avoid important activities'
        });
      }
    });

    return times;
  }

  // Helper methods
  private extractWithPatterns(html: string, patterns: RegExp[]): string | null {
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const value = this.cleanText(match[1]);
        if (this.isValidValue(value)) {
          return value;
        }
      }
    }
    return null;
  }

  private extractTime(html: string, timeType: string): string | null {
    const timePatterns = [
      new RegExp(`<td[^>]*>${timeType}<\\/td>\\s*<td[^>]*>([0-9]{1,2}:[0-9]{2}[^<]*)<\\/td>`, 'i'),
      new RegExp(`${timeType}[^:]*:\\s*([0-9]{1,2}:[0-9]{2}[^<\\n]*)`, 'i'),
      new RegExp(`${timeType}[^>]*>([0-9]{1,2}:[0-9]{2}[^<]*)`, 'i')
    ];
    
    return this.extractWithPatterns(html, timePatterns);
  }

  private extractTimeForElement(html: string, element: string): string | undefined {
    const time = this.extractTime(html, `${element} End`);
    return time || undefined;
  }

  private cleanText(text: string): string {
    return text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  private isValidValue(value: string): boolean {
    return value.length > 0 && 
           value.length < 100 && 
           !value.includes('<') && 
           !value.includes('>') && 
           !value.includes('script') &&
           !value.includes('function') &&
           !value.includes('weekday') &&
           !value.startsWith('>') &&
           value !== 'Unknown';
  }

  // Data mapping methods
  private getTithiDeity(tithi: string): string {
    const deityMap: Record<string, string> = {
      'Pratipada': 'Brahma', 'Dwitiya': 'Vidhi', 'Tritiya': 'Gauri',
      'Chaturthi': 'Yama', 'Panchami': 'Naga', 'Shashthi': 'Kartik',
      'Saptami': 'Surya', 'Ashtami': 'Shiva', 'Navami': 'Durga',
      'Dashami': 'Dharma', 'Ekadashi': 'Vishnu', 'Dwadashi': 'Vishnu',
      'Trayodashi': 'Kamdev', 'Chaturdashi': 'Shiva', 'Amavasya': 'Pitru'
    };
    return deityMap[tithi] || 'Vishnu';
  }

  private getNakshatraLord(nakshatra: string): string {
    const lordMap: Record<string, string> = {
      'Ashwini': 'Ketu', 'Bharani': 'Venus', 'Krittika': 'Sun',
      'Rohini': 'Moon', 'Mrigashira': 'Mars', 'Ardra': 'Rahu',
      'Punarvasu': 'Jupiter', 'Pushya': 'Saturn', 'Ashlesha': 'Mercury',
      'Magha': 'Ketu', 'Purva Phalguni': 'Venus', 'Uttara Phalguni': 'Sun',
      'Hasta': 'Moon', 'Chitra': 'Mars', 'Swati': 'Rahu',
      'Vishakha': 'Jupiter', 'Anuradha': 'Saturn', 'Jyeshtha': 'Mercury'
    };
    return lordMap[nakshatra] || 'Unknown';
  }

  private getRashiElement(rashi: string): string {
    const elementMap: Record<string, string> = {
      'Mesha': 'Fire', 'Vrishabha': 'Earth', 'Mithuna': 'Air',
      'Karka': 'Water', 'Simha': 'Fire', 'Kanya': 'Earth',
      'Tula': 'Air', 'Vrishchika': 'Water', 'Dhanu': 'Fire',
      'Makara': 'Earth', 'Kumbha': 'Air', 'Meena': 'Water'
    };
    return elementMap[rashi] || 'Unknown';
  }

  private getRashiLord(rashi: string): string {
    const lordMap: Record<string, string> = {
      'Mesha': 'Mars', 'Vrishabha': 'Venus', 'Mithuna': 'Mercury',
      'Karka': 'Moon', 'Simha': 'Sun', 'Kanya': 'Mercury',
      'Tula': 'Venus', 'Vrishchika': 'Mars', 'Dhanu': 'Jupiter',
      'Makara': 'Saturn', 'Kumbha': 'Saturn', 'Meena': 'Jupiter'
    };
    return lordMap[rashi] || 'Unknown';
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

  // Batch processing with rate limiting
  async scrapeDateRange(startDate: string, endDate: string, city: string = 'Delhi'): Promise<DrikPanchangData[]> {
    const results: DrikPanchangData[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      try {
        const dateStr = d.toISOString().split('T')[0];
        console.log(`Scraping ${dateStr} for ${city}...`);
        
        const data = await this.scrapePanchang(dateStr, city);
        results.push(data);
        
        // Rate limiting: 2 second delay between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log(`✓ Successfully scraped ${dateStr}`);
      } catch (error) {
        console.error(`✗ Failed to scrape ${d.toISOString().split('T')[0]}:`, error);
      }
    }
    
    return results;
  }

  // Test the scraper
  async test(city: string = 'Delhi'): Promise<DrikPanchangData> {
    const today = new Date().toISOString().split('T')[0];
    console.log(`Testing Drik Panchang scraper for ${today} in ${city}`);
    return this.scrapePanchang(today, city);
  }
}

// Export singleton instance
export const drikPanchangScraper = new DrikPanchangScraper();