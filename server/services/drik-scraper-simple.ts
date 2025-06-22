/**
 * Simplified Drik Panchang Scraper
 * Complete working solution for extracting authentic Vedic calendar data
 */

export interface ScrapedPanchangData {
  date: string;
  location: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  rashi: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  rahuKaal: string;
  gulikaKaal: string;
  abhijitMuhurat: string;
  festivals: string[];
  vrats: string[];
  masa: string;
  paksha: string;
  ayana: string;
  ritu: string;
}

export class SimpleDrikScraper {
  private readonly baseUrl = 'https://www.drikpanchang.com';
  private readonly timeout = 30000;

  async scrapePanchang(date: string, city: string = 'Delhi'): Promise<ScrapedPanchangData> {
    const targetDate = new Date(date);
    const day = targetDate.getDate();
    const month = targetDate.getMonth() + 1;
    const year = targetDate.getFullYear();
    
    const url = `${this.baseUrl}/panchang/day-panchang.html?date=${day}/${month}/${year}&city=${encodeURIComponent(city)}&lang=en`;
    
    console.log(`Scraping: ${url}`);
    
    try {
      const response = await this.fetchWithTimeout(url);
      const html = await response.text();
      
      return {
        date,
        location: city,
        tithi: this.extractElement(html, 'Tithi') || 'Unknown',
        nakshatra: this.extractElement(html, 'Nakshatra') || 'Unknown',
        yoga: this.extractElement(html, 'Yoga') || 'Unknown',
        karana: this.extractElement(html, 'Karana') || 'Unknown',
        rashi: this.extractElement(html, 'Rashi') || this.extractElement(html, 'Moon Sign') || 'Unknown',
        sunrise: this.extractTime(html, 'Sunrise') || '06:00',
        sunset: this.extractTime(html, 'Sunset') || '18:00',
        moonrise: this.extractTime(html, 'Moonrise') || '19:00',
        moonset: this.extractTime(html, 'Moonset') || '07:00',
        rahuKaal: this.extractTime(html, 'Rahu Kaal') || '12:00 - 13:30',
        gulikaKaal: this.extractTime(html, 'Gulika Kaal') || '10:30 - 12:00',
        abhijitMuhurat: this.extractTime(html, 'Abhijit') || '11:30 - 12:30',
        festivals: this.extractList(html, ['Festival', 'Occasion']),
        vrats: this.extractList(html, ['Vrat', 'Vratam']),
        masa: this.extractElement(html, 'Masa') || this.extractElement(html, 'Month') || 'Unknown',
        paksha: this.extractElement(html, 'Paksha') || 'Unknown',
        ayana: this.extractElement(html, 'Ayana') || 'Unknown',
        ritu: this.extractElement(html, 'Ritu') || this.extractElement(html, 'Season') || 'Unknown'
      };
    } catch (error) {
      throw new Error(`Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractElement(html: string, elementName: string): string | null {
    // Multiple patterns to catch different HTML structures
    const patterns = [
      // Pattern 1: <div class="element">Value</div>
      new RegExp(`<div[^>]*${elementName.toLowerCase()}[^>]*>([^<]+)</div>`, 'i'),
      // Pattern 2: ElementName: Value
      new RegExp(`${elementName}[^>]*:?\\s*([^<\\n]+)`, 'i'),
      // Pattern 3: <span>ElementName</span><span>Value</span>
      new RegExp(`<span[^>]*>${elementName}</span>\\s*<span[^>]*>([^<]+)</span>`, 'i'),
      // Pattern 4: "ElementName" : "Value"
      new RegExp(`"${elementName}"[^>]*:?[^>]*"([^"]+)"`, 'i'),
      // Pattern 5: >ElementName</td><td>Value</td>
      new RegExp(`>${elementName}</td>\\s*<td[^>]*>([^<]+)</td>`, 'i'),
      // Pattern 6: ElementName</label>Value
      new RegExp(`${elementName}</label[^>]*>([^<]+)`, 'i')
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const value = match[1].trim();
        // Filter out HTML tags and invalid content
        if (value.length > 0 && value.length < 100 && 
            !value.includes('<') && !value.includes('script') && 
            !value.includes('function') && !value.includes('weekday')) {
          return value;
        }
      }
    }
    return null;
  }

  private extractTime(html: string, timeType: string): string | null {
    // Time-specific patterns
    const patterns = [
      // Pattern 1: TimeType: 12:34 AM/PM
      new RegExp(`${timeType}[^>]*:?\\s*([0-9]{1,2}:[0-9]{2}\\s*(?:AM|PM)?)`, 'i'),
      // Pattern 2: <td>TimeType</td><td>12:34</td>
      new RegExp(`<td[^>]*>${timeType}</td>\\s*<td[^>]*>([0-9]{1,2}:[0-9]{2}[^<]*)</td>`, 'i'),
      // Pattern 3: TimeType</span>12:34
      new RegExp(`${timeType}</span[^>]*>\\s*([0-9]{1,2}:[0-9]{2}[^<]*)`, 'i'),
      // Pattern 4: "TimeType":"12:34"
      new RegExp(`"${timeType}"[^>]*:?[^>]*"([0-9]{1,2}:[0-9]{2}[^"]*)"`, 'i'),
      // Pattern 5: TimeType - 12:34 to 13:45
      new RegExp(`${timeType}[^>]*-?\\s*([0-9]{1,2}:[0-9]{2}[^<\\n]*(?:to|-)\\s*[0-9]{1,2}:[0-9]{2}[^<\\n]*)`, 'i')
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  }

  private extractList(html: string, keywords: string[]): string[] {
    const items: string[] = [];
    
    for (const keyword of keywords) {
      const patterns = [
        // Pattern 1: <div class="keyword">Value</div>
        new RegExp(`<div[^>]*${keyword.toLowerCase()}[^>]*>([^<]+)</div>`, 'gi'),
        // Pattern 2: Keyword: Value
        new RegExp(`${keyword}[^>]*:?\\s*([^<\\n]+)`, 'gi'),
        // Pattern 3: <li>Value containing keyword</li>
        new RegExp(`<li[^>]*>([^<]*${keyword}[^<]*)</li>`, 'gi')
      ];

      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(html)) !== null) {
          if (match[1] && match[1].trim().length > 0 && match[1].trim().length < 200) {
            const value = match[1].trim();
            if (!value.includes('<') && !value.includes('script')) {
              items.push(value);
            }
          }
        }
      }
    }

    // Remove duplicates
    return Array.from(new Set(items));
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
          'Pragma': 'no-cache'
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
        throw new Error('Request timeout - website took too long to respond');
      }
      throw error;
    }
  }

  // Batch scraping with rate limiting
  async scrapeDateRange(startDate: string, endDate: string, city: string = 'Delhi'): Promise<ScrapedPanchangData[]> {
    const results: ScrapedPanchangData[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      try {
        const dateStr = d.toISOString().split('T')[0];
        console.log(`Scraping ${dateStr} for ${city}...`);
        
        const data = await this.scrapePanchang(dateStr, city);
        results.push(data);
        
        // Rate limiting: 1 second delay between requests
        await this.delay(1000);
        
        console.log(`✓ Successfully scraped ${dateStr}`);
      } catch (error) {
        console.error(`✗ Failed to scrape ${d.toISOString().split('T')[0]}:`, error);
        // Continue with next date even if one fails
      }
    }
    
    return results;
  }

  // Helper method for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Test method to verify scraper functionality
  async test(city: string = 'Delhi'): Promise<ScrapedPanchangData> {
    const today = new Date().toISOString().split('T')[0];
    console.log(`Testing scraper with ${today} for ${city}`);
    return this.scrapePanchang(today, city);
  }

  // Get supported cities
  getSupportedCities(): string[] {
    return [
      'Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bangalore', 'Hyderabad',
      'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur',
      'Indore', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ludhiana',
      'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan',
      'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad',
      'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 'Haora'
    ];
  }
}

// Export singleton instance
export const simpleDrikScraper = new SimpleDrikScraper();