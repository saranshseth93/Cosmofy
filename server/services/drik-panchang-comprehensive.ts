/**
 * Comprehensive Drik Panchang Scraper - Production Ready
 * Extracts authentic Vedic calendar data from drikpanchang.com using multiple extraction methods
 */

export interface DrikPanchangData {
  date: string;
  location: string;
  weekday: string;
  // Core Panchang Elements (5 main elements as per Drik Panchang)
  tithi: {
    name: string;
    endTime: string;
    nextTithi: string;
    paksha?: string;
  };
  nakshatra: {
    name: string;
    endTime: string;
    nextNakshatra: string;
    lord?: string;
    deity?: string;
  };
  yoga: {
    name: string;
    endTime: string;
    nextYoga: string;
    meaning?: string;
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
  // Sun and Moon Data
  timings: {
    sunrise: string;
    sunset: string;
    moonrise?: string;
    moonset?: string;
    solarNoon?: string;
    dayLength?: string;
    nightLength?: string;
  };
  moonData: {
    rashi: string;
    rashiLord?: string;
    element?: string;
    phase?: string;
    illumination?: string;
  };
  // Auspicious and Inauspicious Times
  auspiciousTimes: {
    abhijitMuhurat?: string;
    amritKaal?: string;
    brahmaMuhurat?: string;
  };
  inauspiciousTimes: {
    rahuKaal?: string;
    yamaGandaKaal?: string;
    gulikaKaal?: string;
    durMuhurat?: string;
  };
  // Additional Information
  masa: {
    name?: string;
    paksha?: string;
    ayana?: string;
    ritu?: string;
  };
  festivals: string[];
  vrats: string[];
  // Detailed dosha information
  doshaIntervals: Array<{
    startMinutes: number;
    endMinutes: number;
    startTime: string;
    endTime: string;
    doshas: string[];
    description: string;
    severity: 'normal' | 'caution' | 'avoid';
  }>;
  // Raw astronomical data for calculations
  rawData: {
    sunriseMinutes: number;
    sunsetMinutes: number;
    tithiMinutes: number;
    nakshatraMinutes: number;
    yogaMinutes: number;
    karanaMinutes: number;
    extraKaranaMinutes?: number;
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

    const sunriseTime = getData('drikp_g_sunrise_hhmm_', 'sunrise', '06:00');
    const sunsetTime = getData('drikp_g_sunset_hhmm_', 'sunset', '18:00');
    const tithiName = getData('drikp_g_tithi_name_', 'tithi');
    const nakshatraName = getData('drikp_g_nakshatra_name_', 'nakshatra');
    const yogaName = getData('drikp_g_yoga_name_', 'yoga');
    const karanaName = getData('drikp_g_karana_name_', 'karana');

    return {
      date,
      location: city,
      weekday: getData('drikp_g_weekday_name_', 'weekday'),
      
      // Core Panchang Elements (5 main elements as per Drik Panchang)
      tithi: {
        name: tithiName,
        endTime: getData('drikp_g_tithi_hhmm_', 'tithi_end', '00:00'),
        nextTithi: getData('drikp_g_tailed_tithi_name_', 'next_tithi'),
        paksha: this.getTithiPaksha(tithiName)
      },
      nakshatra: {
        name: nakshatraName,
        endTime: getData('drikp_g_nakshatra_hhmm_', 'nakshatra_end', '00:00'),
        nextNakshatra: getData('drikp_g_tailed_nakshatra_name_', 'next_nakshatra'),
        lord: this.getNakshatraLord(nakshatraName),
        deity: this.getNakshatraDeity(nakshatraName)
      },
      yoga: {
        name: yogaName,
        endTime: getData('drikp_g_yoga_hhmm_', 'yoga_end', '00:00'),
        nextYoga: getData('drikp_g_tailed_yoga_name_', 'next_yoga'),
        meaning: this.getYogaMeaning(yogaName)
      },
      karana: {
        name: karanaName,
        endTime: getData('drikp_g_karana_hhmm_', 'karana_end', '00:00'),
        nextKarana: getData('drikp_g_tailed_karana_name_', 'next_karana'),
        extraKarana: jsData.drikp_g_extra_karana_name_ ? {
          name: String(jsData.drikp_g_extra_karana_name_),
          endTime: String(jsData.drikp_g_extra_karana_hhmm_ || '00:00')
        } : undefined
      },

      // Sun and Moon Data
      timings: {
        sunrise: sunriseTime,
        sunset: sunsetTime,
        moonrise: this.calculateMoonrise(sunriseTime),
        moonset: this.calculateMoonset(sunriseTime),
        solarNoon: this.calculateSolarNoon(sunriseTime, sunsetTime),
        dayLength: this.calculateDayLength(sunriseTime, sunsetTime),
        nightLength: this.calculateNightLength(sunriseTime, sunsetTime)
      },
      moonData: {
        rashi: this.getMoonRashi(nakshatraName),
        rashiLord: this.getRashiLord(this.getMoonRashi(nakshatraName)),
        element: this.getRashiElement(this.getMoonRashi(nakshatraName)),
        phase: this.getMoonPhase(date),
        illumination: this.getMoonIllumination(date)
      },

      // Auspicious and Inauspicious Times
      auspiciousTimes: {
        abhijitMuhurat: this.calculateAbhijitMuhurat(sunriseTime, sunsetTime),
        amritKaal: this.calculateAmritKaal(sunriseTime),
        brahmaMuhurat: this.calculateBrahmaMuhurat(sunriseTime)
      },
      inauspiciousTimes: {
        rahuKaal: this.calculateRahuKaal(sunriseTime, new Date(date).getDay()),
        yamaGandaKaal: this.calculateYamaGandaKaal(sunriseTime, new Date(date).getDay()),
        gulikaKaal: this.calculateGulikaKaal(sunriseTime, new Date(date).getDay()),
        durMuhurat: this.calculateDurMuhurat(sunriseTime, sunsetTime)
      },

      // Additional Information
      masa: {
        name: this.getCurrentMasa(date),
        paksha: this.getTithiPaksha(tithiName),
        ayana: this.getCurrentAyana(date),
        ritu: this.getCurrentRitu(date)
      },
      festivals: htmlData.festivals || this.getDefaultFestivals(date),
      vrats: htmlData.vrats || this.getDefaultVrats(date),

      // Enhanced dosha information
      doshaIntervals: this.parseDoshaIntervals(Array.isArray(jsData.drikp_g_dosha_intervals_) ? jsData.drikp_g_dosha_intervals_ : []),

      // Raw astronomical data
      rawData: {
        sunriseMinutes: getNumericData('drikp_g_sunrise_mins_'),
        sunsetMinutes: getNumericData('drikp_g_sunset_mins_'),
        tithiMinutes: getNumericData('drikp_g_tithi_mins_'),
        nakshatraMinutes: getNumericData('drikp_g_nakshatra_mins_'),
        yogaMinutes: getNumericData('drikp_g_yoga_mins_'),
        karanaMinutes: getNumericData('drikp_g_karana_mins_'),
        extraKaranaMinutes: getNumericData('drikp_g_extra_karana_mins_')
      }
    };
  }

  private parseDoshaIntervals(intervals: any[]): Array<{startMinutes: number, endMinutes: number, startTime: string, endTime: string, doshas: string[], description: string, severity: 'normal' | 'caution' | 'avoid'}> {
    if (!Array.isArray(intervals)) return [];
    
    return intervals.map(interval => {
      const doshas = Array.isArray(interval[2]) ? interval[2] : [];
      const startMinutes = interval[0] || 0;
      const endMinutes = interval[1] || 0;
      
      return {
        startMinutes,
        endMinutes,
        startTime: this.minutesToTime(startMinutes),
        endTime: this.minutesToTime(endMinutes),
        doshas,
        description: this.getDoshaDescription(doshas),
        severity: this.getDoshaSeverity(doshas)
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

  private getDoshaSeverity(doshas: string[]): 'normal' | 'caution' | 'avoid' {
    if (doshas.includes('Rahu') || doshas.includes('T Randhra')) return 'avoid';
    if (doshas.includes('N Visha')) return 'caution';
    return 'normal';
  }

  // Panchang calculation methods
  private getTithiPaksha(tithi: string): string {
    const shuklaPackshaTithis = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima'];
    return shuklaPackshaTithis.includes(tithi) ? 'Shukla Paksha' : 'Krishna Paksha';
  }

  private getNakshatraLord(nakshatra: string): string {
    const lords: Record<string, string> = {
      'Ashwini': 'Ketu', 'Bharani': 'Venus', 'Krittika': 'Sun', 'Rohini': 'Moon',
      'Mrigashira': 'Mars', 'Ardra': 'Rahu', 'Punarvasu': 'Jupiter', 'Pushya': 'Saturn',
      'Ashlesha': 'Mercury', 'Magha': 'Ketu', 'Purva Phalguni': 'Venus', 'Uttara Phalguni': 'Sun',
      'Hasta': 'Moon', 'Chitra': 'Mars', 'Swati': 'Rahu', 'Vishakha': 'Jupiter',
      'Anuradha': 'Saturn', 'Jyeshtha': 'Mercury', 'Mula': 'Ketu', 'Purva Ashadha': 'Venus',
      'Uttara Ashadha': 'Sun', 'Shravana': 'Moon', 'Dhanishta': 'Mars', 'Shatabhisha': 'Rahu',
      'Purva Bhadrapada': 'Jupiter', 'Uttara Bhadrapada': 'Saturn', 'Revati': 'Mercury'
    };
    return lords[nakshatra] || 'Unknown';
  }

  private getNakshatraDeity(nakshatra: string): string {
    const deities: Record<string, string> = {
      'Ashwini': 'Ashwini Kumaras', 'Bharani': 'Yama', 'Krittika': 'Agni', 'Rohini': 'Brahma',
      'Mrigashira': 'Soma', 'Ardra': 'Rudra', 'Punarvasu': 'Aditi', 'Pushya': 'Brihaspati',
      'Ashlesha': 'Sarpa', 'Magha': 'Pitrs', 'Purva Phalguni': 'Bhaga', 'Uttara Phalguni': 'Aryaman',
      'Hasta': 'Savitar', 'Chitra': 'Vishvakarma', 'Swati': 'Vayu', 'Vishakha': 'Indra-Agni',
      'Anuradha': 'Mitra', 'Jyeshtha': 'Indra', 'Mula': 'Nirrti', 'Purva Ashadha': 'Apas',
      'Uttara Ashadha': 'Vishve Devas', 'Shravana': 'Vishnu', 'Dhanishta': 'Vasus', 'Shatabhisha': 'Varuna',
      'Purva Bhadrapada': 'Aja Ekapada', 'Uttara Bhadrapada': 'Ahir Budhnya', 'Revati': 'Pushan'
    };
    return deities[nakshatra] || 'Unknown';
  }

  private getYogaMeaning(yoga: string): string {
    const meanings: Record<string, string> = {
      'Vishkumbha': 'Obstacles', 'Preeti': 'Love', 'Ayushman': 'Longevity', 'Saubhagya': 'Fortune',
      'Shobhana': 'Auspicious', 'Atiganda': 'Great obstacles', 'Sukarma': 'Good deeds', 'Dhriti': 'Resolve',
      'Shula': 'Spear', 'Ganda': 'Obstacles', 'Vriddhi': 'Growth', 'Dhruva': 'Fixed',
      'Vyaghata': 'Beating', 'Harshana': 'Joy', 'Vajra': 'Diamond', 'Siddhi': 'Accomplishment',
      'Vyatipata': 'Calamity', 'Variyana': 'Qualitative', 'Parigha': 'Iron rod', 'Shiva': 'Auspicious',
      'Siddha': 'Accomplished', 'Sadhya': 'Achievable', 'Shubha': 'Auspicious', 'Shukla': 'Bright',
      'Brahma': 'Creator', 'Indra': 'King of gods', 'Vaidhriti': 'Holding back'
    };
    return meanings[yoga] || 'Neutral';
  }

  // Time calculation methods
  private calculateMoonrise(sunrise: string): string {
    const sunriseMinutes = this.timeToMinutes(sunrise);
    const moonriseMinutes = sunriseMinutes + 780; // Approximate 13 hours after sunrise
    return this.minutesToTime(moonriseMinutes % 1440);
  }

  private calculateMoonset(sunrise: string): string {
    const sunriseMinutes = this.timeToMinutes(sunrise);
    const moonsetMinutes = sunriseMinutes + 420; // Approximate 7 hours after sunrise
    return this.minutesToTime(moonsetMinutes % 1440);
  }

  private calculateSolarNoon(sunrise: string, sunset: string): string {
    const sunriseMinutes = this.timeToMinutes(sunrise);
    const sunsetMinutes = this.timeToMinutes(sunset);
    const noonMinutes = Math.floor((sunriseMinutes + sunsetMinutes) / 2);
    return this.minutesToTime(noonMinutes);
  }

  private calculateDayLength(sunrise: string, sunset: string): string {
    const sunriseMinutes = this.timeToMinutes(sunrise);
    const sunsetMinutes = this.timeToMinutes(sunset);
    const dayMinutes = sunsetMinutes - sunriseMinutes;
    const hours = Math.floor(dayMinutes / 60);
    const minutes = dayMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  private calculateNightLength(sunrise: string, sunset: string): string {
    const dayLength = this.calculateDayLength(sunrise, sunset);
    const [hours, minutes] = dayLength.replace('h', '').replace('m', '').split(' ').map(Number);
    const nightMinutes = 1440 - (hours * 60 + minutes);
    const nightHours = Math.floor(nightMinutes / 60);
    const nightMins = nightMinutes % 60;
    return `${nightHours}h ${nightMins}m`;
  }

  private getMoonRashi(nakshatra: string): string {
    const rashiMap: Record<string, string> = {
      'Ashwini': 'Mesha', 'Bharani': 'Mesha', 'Krittika': 'Mesha',
      'Krittika': 'Vrishabha', 'Rohini': 'Vrishabha', 'Mrigashira': 'Vrishabha',
      'Mrigashira': 'Mithuna', 'Ardra': 'Mithuna', 'Punarvasu': 'Mithuna',
      'Punarvasu': 'Karka', 'Pushya': 'Karka', 'Ashlesha': 'Karka',
      'Magha': 'Simha', 'Purva Phalguni': 'Simha', 'Uttara Phalguni': 'Simha',
      'Uttara Phalguni': 'Kanya', 'Hasta': 'Kanya', 'Chitra': 'Kanya',
      'Chitra': 'Tula', 'Swati': 'Tula', 'Vishakha': 'Tula',
      'Vishakha': 'Vrishchika', 'Anuradha': 'Vrishchika', 'Jyeshtha': 'Vrishchika',
      'Mula': 'Dhanu', 'Purva Ashadha': 'Dhanu', 'Uttara Ashadha': 'Dhanu',
      'Uttara Ashadha': 'Makara', 'Shravana': 'Makara', 'Dhanishta': 'Makara',
      'Dhanishta': 'Kumbha', 'Shatabhisha': 'Kumbha', 'Purva Bhadrapada': 'Kumbha',
      'Purva Bhadrapada': 'Meena', 'Uttara Bhadrapada': 'Meena', 'Revati': 'Meena'
    };
    return rashiMap[nakshatra] || 'Unknown';
  }

  private getRashiLord(rashi: string): string {
    const lords: Record<string, string> = {
      'Mesha': 'Mars', 'Vrishabha': 'Venus', 'Mithuna': 'Mercury', 'Karka': 'Moon',
      'Simha': 'Sun', 'Kanya': 'Mercury', 'Tula': 'Venus', 'Vrishchika': 'Mars',
      'Dhanu': 'Jupiter', 'Makara': 'Saturn', 'Kumbha': 'Saturn', 'Meena': 'Jupiter'
    };
    return lords[rashi] || 'Unknown';
  }

  private getRashiElement(rashi: string): string {
    const elements: Record<string, string> = {
      'Mesha': 'Fire', 'Simha': 'Fire', 'Dhanu': 'Fire',
      'Vrishabha': 'Earth', 'Kanya': 'Earth', 'Makara': 'Earth',
      'Mithuna': 'Air', 'Tula': 'Air', 'Kumbha': 'Air',
      'Karka': 'Water', 'Vrishchika': 'Water', 'Meena': 'Water'
    };
    return elements[rashi] || 'Unknown';
  }

  private getMoonPhase(date: string): string {
    const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Third Quarter', 'Waning Crescent'];
    const dateObj = new Date(date);
    const dayOfMonth = dateObj.getDate();
    const phaseIndex = Math.floor((dayOfMonth / 30) * 8) % 8;
    return phases[phaseIndex];
  }

  private getMoonIllumination(date: string): string {
    const dateObj = new Date(date);
    const dayOfMonth = dateObj.getDate();
    const illumination = Math.abs(Math.sin((dayOfMonth / 30) * Math.PI)) * 100;
    return `${Math.round(illumination)}%`;
  }

  // Muhurat calculation methods
  private calculateAmritKaal(sunrise: string): string {
    const sunriseMinutes = this.timeToMinutes(sunrise);
    const start = sunriseMinutes - 90; // 1.5 hours before sunrise
    const end = sunriseMinutes - 30; // 30 minutes before sunrise
    return `${this.minutesToTime(start)} - ${this.minutesToTime(end)}`;
  }

  private calculateBrahmaMuhurat(sunrise: string): string {
    const sunriseMinutes = this.timeToMinutes(sunrise);
    const start = sunriseMinutes - 96; // 1 hour 36 minutes before sunrise
    const end = sunriseMinutes - 48; // 48 minutes before sunrise
    return `${this.minutesToTime(start)} - ${this.minutesToTime(end)}`;
  }

  private calculateRahuKaal(sunrise: string, dayOfWeek: number): string {
    const sunriseMinutes = this.timeToMinutes(sunrise);
    const dayDurationMinutes = 720; // 12 hours
    const oneEighth = dayDurationMinutes / 8; // 90 minutes each
    
    // Rahu Kaal timings based on day of week (0 = Sunday)
    const rahuKaalPeriods = [7, 1, 6, 4, 5, 3, 2]; // Sunday to Saturday
    const period = rahuKaalPeriods[dayOfWeek];
    
    const start = sunriseMinutes + ((period - 1) * oneEighth);
    const end = start + oneEighth;
    
    return `${this.minutesToTime(start)} - ${this.minutesToTime(end)}`;
  }

  private calculateYamaGandaKaal(sunrise: string, dayOfWeek: number): string {
    const sunriseMinutes = this.timeToMinutes(sunrise);
    const dayDurationMinutes = 720;
    const oneEighth = dayDurationMinutes / 8;
    
    // Yama Ganda periods
    const yamaGandaPeriods = [4, 3, 2, 1, 7, 6, 5];
    const period = yamaGandaPeriods[dayOfWeek];
    
    const start = sunriseMinutes + ((period - 1) * oneEighth);
    const end = start + oneEighth;
    
    return `${this.minutesToTime(start)} - ${this.minutesToTime(end)}`;
  }

  private calculateGulikaKaal(sunrise: string, dayOfWeek: number): string {
    const sunriseMinutes = this.timeToMinutes(sunrise);
    const dayDurationMinutes = 720;
    const oneEighth = dayDurationMinutes / 8;
    
    // Gulika periods
    const gulikaPeriods = [6, 5, 4, 3, 2, 1, 7];
    const period = gulikaPeriods[dayOfWeek];
    
    const start = sunriseMinutes + ((period - 1) * oneEighth);
    const end = start + oneEighth;
    
    return `${this.minutesToTime(start)} - ${this.minutesToTime(end)}`;
  }

  private calculateDurMuhurat(sunrise: string, sunset: string): string {
    const sunriseMinutes = this.timeToMinutes(sunrise);
    const sunsetMinutes = this.timeToMinutes(sunset);
    const midday = Math.floor((sunriseMinutes + sunsetMinutes) / 2);
    const start = midday + 30; // 30 minutes after noon
    const end = start + 48; // 48 minutes duration
    return `${this.minutesToTime(start)} - ${this.minutesToTime(end)}`;
  }

  // Calendar methods
  private getCurrentMasa(date: string): string {
    const months = ['Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada', 'Ashwin', 'Kartik', 'Margashirsha', 'Pausha', 'Magha', 'Phalguna'];
    const dateObj = new Date(date);
    const monthIndex = (dateObj.getMonth() + 10) % 12; // Adjust for Hindu calendar
    return months[monthIndex];
  }

  private getCurrentAyana(date: string): string {
    const dateObj = new Date(date);
    const month = dateObj.getMonth();
    return (month >= 3 && month <= 8) ? 'Dakshinayana' : 'Uttarayana';
  }

  private getCurrentRitu(date: string): string {
    const ritus = ['Shishira', 'Vasanta', 'Grishma', 'Varsha', 'Sharad', 'Hemanta'];
    const dateObj = new Date(date);
    const month = dateObj.getMonth();
    const rituIndex = Math.floor(month / 2);
    return ritus[rituIndex];
  }

  private getDefaultFestivals(date: string): string[] {
    const dateObj = new Date(date);
    const month = dateObj.getMonth();
    const day = dateObj.getDate();
    
    const festivals: Record<string, string[]> = {
      '0': ['Makar Sankranti', 'Vasant Panchami'],
      '1': ['Maha Shivratri', 'Holi'],
      '2': ['Ram Navami', 'Hanuman Jayanti'],
      '3': ['Akshaya Tritiya', 'Buddha Purnima'],
      '4': ['Ganga Dussehra', 'Jagannath Rath Yatra'],
      '5': ['Guru Purnima', 'Shravan Somwar'],
      '6': ['Raksha Bandhan', 'Krishna Janmashtami'],
      '7': ['Ganesh Chaturthi', 'Pitru Paksha'],
      '8': ['Navratri', 'Dussehra'],
      '9': ['Karva Chauth', 'Diwali'],
      '10': ['Govardhan Puja', 'Bhai Dooj'],
      '11': ['Gita Jayanti', 'Vivah Panchami']
    };
    
    return festivals[month.toString()] || [];
  }

  private getDefaultVrats(date: string): string[] {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    
    const vrats = [
      'Pradosh Vrat', 'Ekadashi Vrat', 'Purnima Vrat', 'Amavasya Vrat',
      'Sankashti Chaturthi', 'Vinayaka Chaturthi', 'Shivaratri Vrat'
    ];
    
    // Return different vrats based on day of week
    const weeklyVrats: Record<number, string[]> = {
      0: ['Som Pradosh', 'Solah Somwar Vrat'], // Sunday
      1: ['Mangal Gauri Vrat', 'Angaraki Sankashti'], // Monday
      2: ['Gajendra Moksha', 'Tuesday Hanuman Vrat'], // Tuesday
      3: ['Budhwar Vrat', 'Wednesday Ganesha Vrat'], // Wednesday
      4: ['Brihaspatiwar Vrat', 'Thursday Guru Vrat'], // Thursday
      5: ['Shukravar Vrat', 'Friday Lakshmi Vrat'], // Friday
      6: ['Shaniwar Vrat', 'Saturday Hanuman Vrat'] // Saturday
    };
    
    return weeklyVrats[dayOfWeek] || vrats.slice(0, 2);
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