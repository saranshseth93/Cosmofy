# Complete Drik Panchang Scraping Guide

## Overview

This guide provides comprehensive code for scraping authentic Vedic calendar data from drikpanchang.com. The implementation includes multiple extraction patterns, error handling, rate limiting, and batch processing capabilities.

## Files Created

1. **server/services/drik-panchang-final.ts** - Production-ready scraper with refined HTML parsing
2. **server/services/drik-scraper-simple.ts** - Simplified version for basic scraping
3. **server/services/drik-panchang-scraper.ts** - Comprehensive version with detailed interfaces

## API Endpoints Available

### 1. Test Scraper
```
GET /api/scraper/test?city=Delhi
```
Tests the scraper with current date for specified city.

### 2. Scrape Specific Date
```
GET /api/scraper/panchang?date=2025-06-22&city=Delhi
```
Scrapes Panchang data for specific date and city.

### 3. Batch Scraping (Date Range)
```
GET /api/scraper/batch?startDate=2025-06-22&endDate=2025-06-24&city=Delhi
```
Scrapes multiple dates (max 7 days) with rate limiting.

### 4. Scraper Status
```
GET /api/scraper/status
```
Returns scraper configuration and usage information.

## Core Scraping Code

### Basic Usage Example

```typescript
import { drikPanchangScraper } from './services/drik-panchang-final';

// Scrape today's Panchang for Delhi
const today = new Date().toISOString().split('T')[0];
const data = await drikPanchangScraper.scrapePanchang(today, 'Delhi');

console.log('Tithi:', data.tithi.name);
console.log('Nakshatra:', data.nakshatra.name);
console.log('Sunrise:', data.timings.sunrise);
console.log('Festivals:', data.festivals);
```

### Batch Scraping Example

```typescript
// Scrape a week of data
const results = await drikPanchangScraper.scrapeDateRange(
  '2025-06-22', 
  '2025-06-28', 
  'Mumbai'
);

results.forEach(day => {
  console.log(`${day.date}: ${day.tithi.name} - ${day.nakshatra.name}`);
});
```

## Data Structure Returned

```typescript
interface DrikPanchangData {
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
```

## HTML Extraction Patterns

The scraper uses multiple regex patterns to extract data from Drik Panchang's HTML:

### Tithi Extraction
```typescript
const tithiPatterns = [
  /<div[^>]*class[^>]*tithi[^>]*>.*?<span[^>]*>([^<]+)<\/span>/i,
  /<td[^>]*>Tithi<\/td>\s*<td[^>]*>([^<]+)<\/td>/i,
  /Tithi[^:]*:\s*([^<\n]+)/i,
  /<h3[^>]*>([^<]*Tithi[^<]*)<\/h3>/i,
  /\"tithi\"\s*:\s*\"([^"]+)\"/i
];
```

### Time Extraction
```typescript
const timePatterns = [
  new RegExp(`<td[^>]*>${timeType}<\\/td>\\s*<td[^>]*>([0-9]{1,2}:[0-9]{2}[^<]*)<\\/td>`, 'i'),
  new RegExp(`${timeType}[^:]*:\\s*([0-9]{1,2}:[0-9]{2}[^<\\n]*)`, 'i'),
  new RegExp(`${timeType}[^>]*>([0-9]{1,2}:[0-9]{2}[^<]*)`, 'i')
];
```

## Error Handling

The scraper includes comprehensive error handling:

```typescript
try {
  const data = await drikPanchangScraper.scrapePanchang(date, city);
  // Process data
} catch (error) {
  if (error.message.includes('timeout')) {
    console.log('Website took too long to respond');
  } else if (error.message.includes('HTTP 429')) {
    console.log('Rate limited - wait before retrying');
  } else {
    console.log('Scraping failed:', error.message);
  }
}
```

## Rate Limiting

- **Single requests**: No delay
- **Batch requests**: 2-second delay between requests
- **Maximum batch size**: 7 days
- **Request timeout**: 30 seconds

## Supported Cities

Major Indian cities supported:
- Delhi, Mumbai, Kolkata, Chennai, Bangalore, Hyderabad
- Pune, Ahmedabad, Jaipur, Lucknow, Kanpur, Nagpur
- Indore, Bhopal, Visakhapatnam, Patna, Vadodara
- And many more...

## Best Practices

### 1. Implement Caching
```typescript
const cache = new Map();
const cacheKey = `${date}-${city}`;

if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}

const data = await drikPanchangScraper.scrapePanchang(date, city);
cache.set(cacheKey, data);
return data;
```

### 2. Handle Network Issues
```typescript
async function scrapeWithRetry(date: string, city: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await drikPanchangScraper.scrapePanchang(date, city);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 3. Validate Extracted Data
```typescript
function validatePanchangData(data: DrikPanchangData): boolean {
  const requiredFields = ['tithi', 'nakshatra', 'yoga', 'karana'];
  return requiredFields.every(field => 
    data[field] && 
    data[field].name && 
    data[field].name !== 'Unknown' &&
    data[field].name.length > 1
  );
}
```

## Advanced Usage

### Custom Extraction Patterns
```typescript
// Add custom patterns for specific data extraction
const customPatterns = [
  /Your custom regex pattern here/i,
  // Add more patterns as needed
];

// Extend the extraction method
private extractCustomElement(html: string): string | null {
  return this.extractWithPatterns(html, customPatterns);
}
```

### Database Storage
```typescript
async function storePanchangData(data: DrikPanchangData) {
  await database.collection('panchang').insertOne({
    ...data,
    scrapedAt: new Date(),
    source: 'drikpanchang.com'
  });
}
```

## Troubleshooting

### Common Issues

1. **Empty or Invalid Data**
   - Check if Drik Panchang website structure changed
   - Verify the city name spelling
   - Ensure date format is YYYY-MM-DD

2. **Network Timeouts**
   - Increase timeout value in scraper configuration
   - Implement retry logic with exponential backoff
   - Check internet connectivity

3. **Rate Limiting**
   - Add longer delays between requests
   - Use multiple IP addresses if needed
   - Implement request queuing

4. **HTML Structure Changes**
   - Update extraction patterns based on new HTML structure
   - Add fallback patterns for robustness
   - Monitor scraper success rates

## Legal Considerations

- Respect robots.txt file
- Implement appropriate delays between requests
- Don't overwhelm the server with too many requests
- Consider contacting the website owner for permission
- Use scraped data responsibly and ethically

## Testing the Scraper

You can test the scraper using curl commands:

```bash
# Test basic functionality
curl "http://localhost:5000/api/scraper/test?city=Delhi"

# Scrape specific date
curl "http://localhost:5000/api/scraper/panchang?date=2025-06-22&city=Mumbai"

# Batch scraping
curl "http://localhost:5000/api/scraper/batch?startDate=2025-06-22&endDate=2025-06-24&city=Chennai"

# Check status
curl "http://localhost:5000/api/scraper/status"
```

## Integration with Your Panchang System

To integrate the scraper with your existing Panchang calculations:

```typescript
async function getEnhancedPanchangData(date: string, lat: number, lon: number) {
  const city = getCityFromCoordinates(lat, lon);
  
  try {
    // Try scraping first
    const scrapedData = await drikPanchangScraper.scrapePanchang(date, city);
    return formatScrapedData(scrapedData);
  } catch (error) {
    // Fallback to astronomical calculations
    console.log('Scraping failed, using calculations:', error.message);
    return calculatePanchangData(date, lat, lon);
  }
}
```

This comprehensive guide provides you with everything needed to implement authentic Drik Panchang data scraping in your application.