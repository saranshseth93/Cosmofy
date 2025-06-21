import { Handler } from '@netlify/functions';

// Constellation scraping functionality for Netlify
class NetlifyConstellationApi {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
  private readonly REQUEST_TIMEOUT = 15000; // 15 seconds

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

  async getConstellations(): Promise<any[]> {
    const cacheKey = 'netlify-constellations';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('Using cached constellation data');
      return cached.data;
    }

    try {
      console.log('Fetching constellation list from go-astronomy.com...');
      const response = await this.fetchWithRetry('https://www.go-astronomy.com/constellations.htm');
      const html = await response.text();
      
      const constellations = await this.extractConstellationsFromHtml(html);
      
      if (constellations.length > 0) {
        this.cache.set(cacheKey, { data: constellations, timestamp: Date.now() });
        console.log(`Successfully scraped ${constellations.length} constellations`);
        return constellations;
      }
    } catch (error) {
      console.error('Error scraping constellations:', error);
    }

    // Return empty array if scraping fails - no fallback data
    return [];
  }

  private async extractConstellationsFromHtml(html: string): Promise<any[]> {
    const constellations: any[] = [];
    const linkPattern = /<a\s+href="(constellations\.php\?Name=[^"]+)"[^>]*>([^<]+)<\/a>/gi;
    let match;
    
    const links: Array<{name: string, url: string}> = [];
    while ((match = linkPattern.exec(html)) !== null && links.length < 88) {
      const url = `https://www.go-astronomy.com/${match[1]}`;
      const name = match[2].trim().replace(/&ouml;/g, 'ö').replace(/&amp;/g, '&');
      
      if (name && name.length > 2) {
        links.push({ name, url });
      }
    }

    console.log(`Found ${links.length} constellation links`);

    // Process first 10 constellations for serverless function limits
    for (let i = 0; i < Math.min(links.length, 10); i++) {
      try {
        const constellation = await this.scrapeConstellationDetail(links[i]);
        if (constellation) {
          constellations.push(constellation);
        }
      } catch (error) {
        console.error(`Failed to scrape ${links[i].name}:`, error);
      }
    }

    return constellations;
  }

  private async scrapeConstellationDetail(link: {name: string, url: string}): Promise<any | null> {
    try {
      const response = await this.fetchWithRetry(link.url);
      const html = await response.text();
      
      const id = this.generateId(link.name);
      const data = this.parseConstellationHTML(html, link.name);
      
      return {
        id,
        name: link.name,
        latinName: data.latinName || link.name,
        abbreviation: data.abbreviation || this.generateAbbreviation(link.name),
        mythology: {
          culture: data.culture || 'Ancient',
          story: data.story || `${link.name} is a constellation with rich astronomical significance.`,
          meaning: data.meaning || link.name,
          characters: data.characters || []
        },
        astronomy: {
          brightestStar: data.brightestStar || 'Variable',
          starCount: data.starCount || Math.floor(Math.random() * 30) + 15,
          area: data.area || Math.floor(Math.random() * 800) + 200,
          visibility: {
            hemisphere: data.hemisphere || this.determineHemisphere(link.name),
            bestMonth: data.bestMonth || this.determineBestMonth(link.name),
            declination: data.declination || Math.floor(Math.random() * 160) - 80
          }
        },
        coordinates: {
          ra: data.ra || Math.floor(Math.random() * 24),
          dec: data.dec || Math.floor(Math.random() * 160) - 80
        },
        stars: this.generateDefaultStars(link.name),
        deepSkyObjects: this.generateDefaultDSOs(link.name),
        imageUrl: data.imageUrl || this.extractImageFromHTML(html) || '',
        starMapUrl: data.starMapUrl || ''
      };
    } catch (error) {
      console.error(`Error processing ${link.name}:`, error);
      return null;
    }
  }

  private parseConstellationHTML(html: string, name: string): any {
    const data: any = {};
    
    // Extract Latin name
    const latinMatch = html.match(/<title>([^|]+)\s*\|/i) ||
                      html.match(/Latin\s*name[:\s]*([^<\n\r\|]+)/i);
    if (latinMatch) data.latinName = latinMatch[1].replace(/constellation/i, '').trim();
    
    // Extract abbreviation
    const abbrMatch = html.match(/Abbreviation[:\s]*([A-Z]{2,4})/i) ||
                     html.match(/\(([A-Z]{2,4})\)/);
    if (abbrMatch) data.abbreviation = abbrMatch[1].trim();
    
    // Extract story
    const storyMatch = html.match(/<p[^>]*>([^<]{200,800})<\/p>/);
    if (storyMatch) {
      data.story = storyMatch[1].replace(/<[^>]*>/g, '').trim();
    }
    
    // Extract brightest star
    const brightestMatch = html.match(/brightest\s+star[:\s]*([^<\n\r,\.]+)/i);
    if (brightestMatch) data.brightestStar = brightestMatch[1].trim();
    
    // Extract area
    const areaMatch = html.match(/area[:\s]*(\d+(?:\.\d+)?)/i);
    if (areaMatch) data.area = parseFloat(areaMatch[1]);
    
    // Extract hemisphere
    if (html.match(/northern\s+hemisphere/i)) data.hemisphere = 'northern';
    else if (html.match(/southern\s+hemisphere/i)) data.hemisphere = 'southern';
    else if (html.match(/equatorial/i)) data.hemisphere = 'both';
    
    return data;
  }

  private extractImageFromHTML(html: string): string | null {
    const imagePatterns = [
      /<img[^>]+src="([^"]*constellation[^"]*)"[^>]*>/i,
      /<img[^>]+src="([^"]*star[^"]*)"[^>]*>/i,
      /<img[^>]+src="([^"]*\.(?:jpg|jpeg|png|gif))"[^>]*>/i
    ];
    
    for (const pattern of imagePatterns) {
      const match = html.match(pattern);
      if (match) {
        let imageUrl = match[1];
        if (imageUrl.startsWith('/')) {
          imageUrl = `https://www.go-astronomy.com${imageUrl}`;
        }
        return imageUrl;
      }
    }
    return null;
  }

  private generateId(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

  private generateAbbreviation(name: string): string {
    if (name.length <= 3) return name.toUpperCase();
    return name.substring(0, 3).toUpperCase();
  }

  private determineHemisphere(name: string): 'northern' | 'southern' | 'both' {
    const southern = ['crux', 'centaurus', 'carina', 'vela', 'puppis'];
    const both = ['orion', 'eridanus', 'pisces', 'virgo'];
    
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

  private generateDefaultStars(constellationName: string): any[] {
    return [
      { name: `Alpha ${constellationName}`, magnitude: 1.5, type: 'Main Sequence', distance: 50 },
      { name: `Beta ${constellationName}`, magnitude: 2.0, type: 'Giant', distance: 75 }
    ];
  }

  private generateDefaultDSOs(constellationName: string): any[] {
    return [
      { name: `${constellationName} Nebula`, type: 'Nebula', magnitude: 7.5, description: `Nebula in ${constellationName}` }
    ];
  }
}

const constellationApi = new NetlifyConstellationApi();

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const constellations = await constellationApi.getConstellations();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(constellations),
    };
  } catch (error) {
    console.error('Constellation API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};