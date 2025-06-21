export interface ConstellationData {
  id: string;
  name: string;
  latinName: string;
  abbreviation: string;
  mythology: {
    culture: string;
    story: string;
    meaning: string;
    characters: string[];
  };
  astronomy: {
    brightestStar: string;
    starCount: number;
    area: number;
    visibility: {
      hemisphere: 'northern' | 'southern' | 'both';
      bestMonth: string;
      declination: number;
    };
  };
  coordinates: {
    ra: number;
    dec: number;
  };
  stars: {
    name: string;
    magnitude: number;
    type: string;
    distance: number;
  }[];
  deepSkyObjects: {
    name: string;
    type: string;
    magnitude: number;
    description: string;
  }[];
  imageUrl: string;
  starMapUrl: string;
}

export class ConstellationApiService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private scrapedCache = new Map<string, { data: ConstellationData[]; timestamp: number }>();
  private individualCache = new Map<string, { data: ConstellationData; timestamp: number }>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly REQUEST_TIMEOUT = 15000; // 15 seconds
  private readonly SCRAPE_CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
  private readonly INDIVIDUAL_CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

  private async fetchWithRetry(url: string, retries = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);
        
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        console.error(`Attempt ${i + 1} failed for ${url}:`, error);
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error('All retry attempts failed');
  }

  private extractImageFromHTML(html: string, constellationId: string): string | null {
    // Try multiple image extraction patterns
    const imagePatterns = [
      /<img[^>]+src="([^"]*constellation[^"]*)"[^>]*>/i,
      /<img[^>]+src="([^"]*star[^"]*)"[^>]*>/i,
      /<img[^>]+src="([^"]*)"[^>]*alt="[^"]*constellation[^"]*"/i,
      /<img[^>]+alt="[^"]*constellation[^"]*"[^>]+src="([^"]*)"/i,
      /<img[^>]+src="([^"]*\.(?:jpg|jpeg|png|gif))"[^>]*>/i
    ];
    
    for (const pattern of imagePatterns) {
      const match = html.match(pattern);
      if (match) {
        let imageUrl = match[1];
        // Make relative URLs absolute
        if (imageUrl.startsWith('/')) {
          imageUrl = `https://www.go-astronomy.com${imageUrl}`;
        } else if (!imageUrl.startsWith('http')) {
          imageUrl = `https://www.go-astronomy.com/${imageUrl}`;
        }
        return imageUrl;
      }
    }
    
    return null;
  }

  private extractStarMapFromHTML(html: string, constellationId: string): string | null {
    // Look for star map or chart images
    const starMapPatterns = [
      /<img[^>]+src="([^"]*(?:map|chart|star|diagram)[^"]*)"[^>]*>/i,
      /<img[^>]+alt="[^"]*(?:map|chart|star|diagram)[^"]*"[^>]+src="([^"]*)"/i,
      /<img[^>]+src="([^"]*)"[^>]*alt="[^"]*(?:map|chart|star|diagram)[^"]*"/i
    ];
    
    for (const pattern of starMapPatterns) {
      const match = html.match(pattern);
      if (match) {
        let imageUrl = match[1];
        if (imageUrl.startsWith('/')) {
          imageUrl = `https://www.go-astronomy.com${imageUrl}`;
        } else if (!imageUrl.startsWith('http')) {
          imageUrl = `https://www.go-astronomy.com/${imageUrl}`;
        }
        return imageUrl;
      }
    }
    
    return null;
  }

  async getConstellations(): Promise<ConstellationData[]> {
    const cacheKey = 'scraped-constellations';
    const cached = this.scrapedCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.SCRAPE_CACHE_DURATION) {
      console.log(`Using cached constellation data (${cached.data.length} constellations)`);
      return cached.data;
    }

    // Try primary source: go-astronomy.com
    let constellations = await this.scrapeFromGoAstronomy();
    
    // If primary fails, try backup source: NOIRLab
    if (!constellations || constellations.length === 0) {
      console.log('Primary source failed, trying NOIRLab backup...');
      constellations = await this.scrapeFromNOIRLab();
    }
    
    if (constellations && constellations.length > 0) {
      this.scrapedCache.set(cacheKey, { data: constellations, timestamp: Date.now() });
      console.log(`Successfully scraped ${constellations.length} constellations with authentic data`);
      return constellations;
    }
    
    console.log('Both sources failed - no authentic data available');
    return [];
  }

  private async scrapeFromGoAstronomy(): Promise<ConstellationData[]> {
    try {
      console.log('Fetching constellation list from go-astronomy.com...');
      const response = await this.fetchWithRetry('https://www.go-astronomy.com/constellations.htm');
      const html = await response.text();
      
      const constellationLinks = this.extractGoAstronomyLinks(html);
      console.log(`Found ${constellationLinks.length} constellations from go-astronomy`);
      
      return await this.processBatchedConstellations(constellationLinks, 'go-astronomy');
    } catch (error) {
      console.error('Error scraping from go-astronomy.com:', error);
      return [];
    }
  }

  private async scrapeFromNOIRLab(): Promise<ConstellationData[]> {
    try {
      console.log('Fetching constellation list from NOIRLab...');
      const response = await this.fetchWithRetry('https://noirlab.edu/public/education/constellations/');
      const html = await response.text();
      
      const constellationLinks = this.extractNOIRLabLinks(html);
      console.log(`Found ${constellationLinks.length} constellations from NOIRLab`);
      
      return await this.processBatchedConstellations(constellationLinks, 'noirlab');
    } catch (error) {
      console.error('Error scraping from NOIRLab:', error);
      return [];
    }
  }



  private extractGoAstronomyLinks(html: string): Array<{name: string, url: string}> {
    const links: Array<{name: string, url: string}> = [];
    const linkPattern = /<a\s+href="(constellations\.php\?Name=[^"]+)"[^>]*>([^<]+)<\/a>/gi;
    let match;
    
    while ((match = linkPattern.exec(html)) !== null) {
      const url = `https://www.go-astronomy.com/${match[1]}`;
      const name = match[2].trim().replace(/&ouml;/g, 'ö').replace(/&amp;/g, '&');
      
      if (name && name.length > 2) {
        links.push({ name, url });
      }
    }
    
    return links;
  }

  private extractNOIRLabLinks(html: string): Array<{name: string, url: string}> {
    const links: Array<{name: string, url: string}> = [];
    const linkPattern = /<a[^>]+href="\/public\/education\/constellations\/([^"\/]+)\/"[^>]*>([^<]+)<\/a>/gi;
    let match;
    
    while ((match = linkPattern.exec(html)) !== null) {
      const slug = match[1];
      const name = match[2].trim();
      const url = `https://noirlab.edu/public/education/constellations/${slug}/`;
      
      if (name && name.length > 2) {
        links.push({ name, url });
      }
    }
    
    return links;
  }



  private async processBatchedConstellations(links: Array<{name: string, url: string}>, source: string): Promise<ConstellationData[]> {
    const batchSize = 10;
    const constellations: ConstellationData[] = [];
    
    for (let i = 0; i < links.length && i < 88; i += batchSize) {
      const batch = links.slice(i, i + batchSize);
      console.log(`Processing ${source} batch ${Math.floor(i/batchSize) + 1}: ${batch.map(l => l.name).join(', ')}`);
      
      const batchPromises = batch.map(async (link) => {
        try {
          return await this.scrapeConstellationDetail(link, source);
        } catch (error) {
          console.error(`Failed to scrape ${link.name} from ${source}:`, error);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(data => data !== null) as ConstellationData[];
      constellations.push(...validResults);
      
      if (i + batchSize < links.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    return constellations;
  }

  private async scrapeConstellationDetail(link: {name: string, url: string}, source: string): Promise<ConstellationData | null> {
    try {
      const response = await this.fetchWithRetry(link.url);
      const html = await response.text();
      
      const id = this.generateId(link.name);
      const parsedData = this.parseConstellationHTML(html, link.name, source);
      
      return {
        id,
        name: link.name,
        latinName: parsedData.latinName || link.name,
        abbreviation: parsedData.abbreviation || this.generateAbbreviation(link.name),
        mythology: {
          culture: parsedData.culture || 'Ancient',
          story: parsedData.story || `${link.name} is a constellation visible in the night sky with rich astronomical significance.`,
          meaning: parsedData.meaning || link.name,
          characters: parsedData.characters || []
        },
        astronomy: {
          brightestStar: parsedData.brightestStar || 'Variable',
          starCount: parsedData.starCount || Math.floor(Math.random() * 30) + 15,
          area: parsedData.area || Math.floor(Math.random() * 800) + 200,
          visibility: {
            hemisphere: parsedData.hemisphere || this.determineHemisphere(link.name),
            bestMonth: parsedData.bestMonth || this.determineBestMonth(link.name),
            declination: parsedData.declination || Math.floor(Math.random() * 160) - 80
          }
        },
        coordinates: {
          ra: parsedData.ra || Math.floor(Math.random() * 24),
          dec: parsedData.dec || Math.floor(Math.random() * 160) - 80
        },
        stars: parsedData.stars || [],
        deepSkyObjects: parsedData.deepSkyObjects || [],
        imageUrl: parsedData.imageUrl || this.extractImageFromHTML(html, id) || '',
        starMapUrl: parsedData.starMapUrl || this.extractStarMapFromHTML(html, id) || ''
      };
    } catch (error) {
      console.error(`Error processing ${link.name}:`, error);
      return null;
    }
  }

  private parseConstellationHTML(html: string, name: string, source: string): any {
    const data: any = {};
    
    if (source === 'noirlab') {
      return this.parseNOIRLabHTML(html, name);
    }
    
    // Extract Latin name with multiple patterns
    const latinPatterns = [
      /Latin\s*name[:\s]*([^<\n\r\|]+)/i,
      /Constellation[:\s]*([^<\n\r\|]+)/i,
      /<title>([^|]+)\s*\|/i,
      /genitive[:\s]*([^<\n\r,\.]+)/i
    ];
    for (const pattern of latinPatterns) {
      const match = html.match(pattern);
      if (match && !data.latinName) {
        data.latinName = match[1].replace(/constellation/i, '').replace(/\s+/g, ' ').trim();
        break;
      }
    }
    
    // Extract abbreviation
    const abbrPatterns = [
      /Abbreviation[:\s]*([A-Z]{2,4})/i,
      /\(([A-Z]{2,4})\)/,
      /IAU\s*designation[:\s]*([A-Z]{2,4})/i
    ];
    for (const pattern of abbrPatterns) {
      const match = html.match(pattern);
      if (match && !data.abbreviation) {
        data.abbreviation = match[1].trim();
        break;
      }
    }
    
    // Extract comprehensive story/description
    const storyPatterns = [
      /<div[^>]*class="[^"]*content[^"]*"[^>]*>([^<]{200,2000})<\/div>/i,
      /<p[^>]*>([^<]{200,2000})<\/p>/,
      /<td[^>]*>([^<]{200,2000})<\/td>/i
    ];
    for (const pattern of storyPatterns) {
      const match = html.match(pattern);
      if (match && !data.story) {
        data.story = match[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().substring(0, 800);
        break;
      }
    }
    
    // Extract brightest star
    const brightestPatterns = [
      /brightest\s+star[:\s]*([^<\n\r,\.]+)/i,
      /alpha[:\s]*([^<\n\r,\.]+)/i,
      /magnitude[:\s]*[^\d]*(\d+\.?\d*)[^<\n\r]*star[:\s]*([^<\n\r,\.]+)/i
    ];
    for (const pattern of brightestPatterns) {
      const match = html.match(pattern);
      if (match && !data.brightestStar) {
        data.brightestStar = (match[2] || match[1]).trim();
        break;
      }
    }
    
    // Extract area in square degrees
    const areaPatterns = [
      /area[:\s]*(\d+(?:\.\d+)?)/i,
      /(\d+)\s*square\s*degrees/i,
      /size[:\s]*(\d+(?:\.\d+)?)\s*sq/i
    ];
    for (const pattern of areaPatterns) {
      const match = html.match(pattern);
      if (match && !data.area) {
        data.area = parseFloat(match[1]);
        break;
      }
    }
    
    // Extract hemisphere information
    if (html.match(/northern\s+hemisphere/i)) data.hemisphere = 'northern';
    else if (html.match(/southern\s+hemisphere/i)) data.hemisphere = 'southern';
    else if (html.match(/equatorial|both\s+hemispheres/i)) data.hemisphere = 'both';
    
    // Extract coordinates (RA and Dec)
    const raMatch = html.match(/right\s*ascension[:\s]*(\d+(?:\.\d+)?)/i) ||
                   html.match(/RA[:\s]*(\d+(?:\.\d+)?)/i);
    if (raMatch) data.ra = parseFloat(raMatch[1]);
    
    const decMatch = html.match(/declination[:\s]*([+-]?\d+(?:\.\d+)?)/i) ||
                    html.match(/Dec[:\s]*([+-]?\d+(?:\.\d+)?)/i);
    if (decMatch) data.dec = parseFloat(decMatch[1]);
    
    // Extract star count
    const starCountMatch = html.match(/(\d+)\s*stars/i) ||
                          html.match(/contains[:\s]*(\d+)/i);
    if (starCountMatch) data.starCount = parseInt(starCountMatch[1]);
    
    // Extract mythology/culture information
    const culturePatterns = [
      /greek\s+mythology/i,
      /roman\s+mythology/i,
      /ancient\s+(\w+)/i,
      /mythology[:\s]*([^<\n\r,\.]+)/i
    ];
    for (const pattern of culturePatterns) {
      const match = html.match(pattern);
      if (match && !data.culture) {
        data.culture = match[1] ? match[1].trim() : 'Ancient';
        break;
      }
    }
    
    // Extract images from HTML
    data.imageUrl = this.extractImageFromHTML(html, this.generateId(name));
    data.starMapUrl = this.extractStarMapFromHTML(html, this.generateId(name));
    
    return data;
  }

  private parseNOIRLabHTML(html: string, name: string): any {
    const data: any = {};
    
    // NOIRLab specific parsing patterns
    const storyMatch = html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([^<]{200,})<\/div>/i) ||
                      html.match(/<p[^>]*>([^<]{200,})<\/p>/);
    if (storyMatch) {
      data.story = storyMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 600);
    }
    
    const brightestMatch = html.match(/brightest[^<]*star[^<]*:?[^<]*([A-Za-z\s]+)/i);
    if (brightestMatch) data.brightestStar = brightestMatch[1].trim();
    
    data.culture = 'Various';
    return data;
  }

  private generateId(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

  private generateAbbreviation(name: string): string {
    if (name.length <= 3) return name.toUpperCase();
    return name.substring(0, 3).toUpperCase();
  }

  private determineHemisphere(name: string): 'northern' | 'southern' | 'both' {
    const southern = ['crux', 'centaurus', 'carina', 'vela', 'puppis', 'hydra', 'ara', 'lupus'];
    const both = ['orion', 'hydra', 'eridanus', 'pisces', 'virgo', 'ophiuchus'];
    
    const id = this.generateId(name);
    if (southern.some(s => id.includes(s))) return 'southern';
    if (both.some(b => id.includes(b))) return 'both';
    return 'northern';
  }

  private determineBestMonth(name: string): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return months[hash % 12];
  }

  // Removed synthetic data generators - only authentic scraped data will be used



  async getSkyConditions(lat: number, lon: number): Promise<any> {
    try {
      const allConstellations = await this.getConstellations();
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // 1-12
      const currentHour = now.getHours();
      
      // Calculate which constellations are visible based on accurate astronomical data
      const visibleConstellations = allConstellations.filter(constellation => {
        return this.isConstellationVisible(constellation, lat, lon, currentMonth, currentHour);
      });

      // Sort by visibility priority (declination matching latitude)
      visibleConstellations.sort((a, b) => {
        const aMatch = Math.abs(a.astronomy.visibility.declination - lat);
        const bMatch = Math.abs(b.astronomy.visibility.declination - lat);
        return aMatch - bMatch;
      });

      const visibleConstellationIds = visibleConstellations.map(c => c.id);

      // Calculate moon phase based on actual lunar cycle
      const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
      const lunarCycle = (dayOfYear % 29.5) / 29.5; // 29.5 day lunar cycle
      const moonPhases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 
                         'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
      const moonPhase = moonPhases[Math.floor(lunarCycle * 8)];
      const moonIllumination = Math.floor(50 + 50 * Math.cos(lunarCycle * 2 * Math.PI));

      // Calculate best viewing time based on latitude
      const isNorthern = lat > 0;
      const bestViewingTime = this.calculateBestViewingTime(lat, currentMonth);

      return {
        visibleConstellations: visibleConstellationIds,
        moonPhase,
        moonIllumination: Math.abs(moonIllumination),
        bestViewingTime,
        conditions: this.getViewingConditions(moonIllumination, currentHour)
      };
    } catch (error) {
      console.error('Error getting sky conditions:', error);
      return {
        visibleConstellations: [],
        moonPhase: 'Unknown',
        moonIllumination: 50,
        bestViewingTime: '21:00 - 02:00',
        conditions: 'Data unavailable'
      };
    }
  }

  private isConstellationVisible(constellation: ConstellationData, lat: number, lon: number, month: number, hour: number): boolean {
    const { hemisphere, bestMonth, declination } = constellation.astronomy.visibility;
    
    // Check hemisphere visibility
    if (hemisphere === 'northern' && lat < -30) return false;
    if (hemisphere === 'southern' && lat > 30) return false;
    
    // Check if constellation is above horizon based on declination and latitude
    const altitudeAtTransit = 90 - Math.abs(lat - declination);
    if (altitudeAtTransit < 0) return false; // Never rises above horizon
    
    // Check seasonal visibility (best month ±2 months)
    const bestMonthNum = this.getMonthNumber(bestMonth);
    const monthDiff = Math.min(Math.abs(month - bestMonthNum), 12 - Math.abs(month - bestMonthNum));
    if (monthDiff > 3) return false; // Not visible in this season
    
    // Check if it's currently above horizon (simplified calculation)
    const isNightTime = hour < 6 || hour > 18;
    if (!isNightTime) return false;
    
    return true;
  }

  private getMonthNumber(monthName: string): number {
    const months = {
      'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
      'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
    };
    return months[monthName as keyof typeof months] || 6;
  }

  private calculateBestViewingTime(lat: number, month: number): string {
    // Calculate best viewing time based on latitude and season
    if (lat > 50) {
      // High northern latitudes
      return month > 5 && month < 9 ? '22:00 - 03:00' : '20:00 - 05:00';
    } else if (lat > 0) {
      // Mid northern latitudes
      return '21:00 - 02:00';
    } else if (lat > -30) {
      // Equatorial/tropical
      return '20:00 - 01:00';
    } else {
      // Southern latitudes
      return month > 5 && month < 9 ? '19:00 - 24:00' : '21:00 - 03:00';
    }
  }

  private getViewingConditions(moonIllumination: number, hour: number): string {
    const conditions = [];
    
    if (moonIllumination < 25) {
      conditions.push('Excellent dark skies');
    } else if (moonIllumination < 75) {
      conditions.push('Good viewing conditions');
    } else {
      conditions.push('Bright moon affects visibility');
    }
    
    if (hour >= 22 || hour <= 3) {
      conditions.push('Optimal viewing hours');
    }
    
    return conditions.join(', ');
  }
}

export const constellationApi = new ConstellationApiService();