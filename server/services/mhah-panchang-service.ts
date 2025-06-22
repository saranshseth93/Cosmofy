import { MhahPanchang } from 'mhah-panchang';

export interface PanchangData {
  date: string;
  location: string;
  weekday: string;
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
  masa: {
    name?: string;
    paksha?: string;
    ayana?: string;
    ritu?: string;
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

export class MhahPanchangService {
  private panchang: any;

  constructor() {
    this.panchang = new MhahPanchang();
  }

  async getPanchangData(date: string, latitude: number, longitude: number, city: string = 'Unknown'): Promise<PanchangData> {
    try {
      const targetDate = new Date(date);
      
      // Get basic Panchang data using calculate method
      const basicResult = this.panchang.calculate(targetDate);
      
      // Get calendar data with location for more detailed calculations
      const calendarResult = this.panchang.calendar(targetDate, latitude, longitude);

      console.log('Mhah Panchang Basic Result:', JSON.stringify(basicResult, null, 2));
      console.log('Mhah Panchang Calendar Result:', JSON.stringify(calendarResult, null, 2));

      return this.formatPanchangData(basicResult, calendarResult, date, city);
    } catch (error) {
      console.error('Mhah Panchang calculation error:', error);
      throw new Error(`Authentic Panchang calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatPanchangData(basicResult: any, calendarResult: any, date: string, city: string): PanchangData {
    const formatTime = (timeObj: any): string => {
      if (!timeObj) return 'Not available';
      if (typeof timeObj === 'string') return timeObj;
      if (timeObj.hour !== undefined && timeObj.minute !== undefined) {
        return `${String(timeObj.hour).padStart(2, '0')}:${String(timeObj.minute).padStart(2, '0')}`;
      }
      return 'Not available';
    };

    const getDayOfWeek = (date: string): string => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayIndex = new Date(date).getDay();
      return days[dayIndex];
    };

    return {
      date,
      location: city,
      weekday: getDayOfWeek(date),
      
      tithi: {
        name: result.tithi?.name || 'Unknown',
        endTime: formatTime(result.tithi?.endTime),
        nextTithi: result.tithi?.next || 'Unknown',
        paksha: result.tithi?.paksha || this.getPakshaFromTithi(result.tithi?.name)
      },
      
      nakshatra: {
        name: result.nakshatra?.name || 'Unknown',
        endTime: formatTime(result.nakshatra?.endTime),
        nextNakshatra: result.nakshatra?.next || 'Unknown',
        lord: this.getNakshatraLord(result.nakshatra?.name),
        deity: this.getNakshatraDeity(result.nakshatra?.name)
      },
      
      yoga: {
        name: result.yoga?.name || 'Unknown',
        endTime: formatTime(result.yoga?.endTime),
        nextYoga: result.yoga?.next || 'Unknown',
        meaning: this.getYogaMeaning(result.yoga?.name)
      },
      
      karana: {
        name: result.karana?.name || 'Unknown',
        endTime: formatTime(result.karana?.endTime),
        nextKarana: result.karana?.next || 'Unknown'
      },
      
      timings: {
        sunrise: formatTime(result.sunrise),
        sunset: formatTime(result.sunset),
        moonrise: formatTime(result.moonrise),
        moonset: formatTime(result.moonset),
        solarNoon: formatTime(result.solarNoon),
        dayLength: this.calculateDuration(result.sunrise, result.sunset),
        nightLength: this.calculateNightDuration(result.sunrise, result.sunset)
      },
      
      moonData: {
        rashi: result.moonRashi?.name || this.getMoonRashi(result.nakshatra?.name),
        rashiLord: this.getRashiLord(result.moonRashi?.name),
        element: this.getRashiElement(result.moonRashi?.name),
        phase: result.moonPhase?.name || 'Unknown',
        illumination: result.moonPhase?.illumination ? `${Math.round(result.moonPhase.illumination * 100)}%` : 'Unknown'
      },
      
      auspiciousTimes: {
        abhijitMuhurat: formatTime(result.abhijitMuhurat),
        amritKaal: formatTime(result.amritKaal),
        brahmaMuhurat: formatTime(result.brahmaMuhurat)
      },
      
      inauspiciousTimes: {
        rahuKaal: formatTime(result.rahuKaal),
        yamaGandaKaal: formatTime(result.yamaGandaKaal),
        gulikaKaal: formatTime(result.gulikaKaal),
        durMuhurat: formatTime(result.durMuhurat)
      },
      
      masa: {
        name: result.masa?.name || 'Unknown',
        paksha: result.tithi?.paksha || 'Unknown',
        ayana: result.ayana || this.getAyana(date),
        ritu: result.ritu || this.getRitu(date)
      },
      
      festivals: result.festivals || this.getFestivals(date),
      vrats: result.vrats || this.getVrats(date),
      doshaIntervals: result.doshaIntervals || []
    };
  }

  private getTimezone(latitude: number, longitude: number): number {
    // Basic timezone calculation based on longitude
    return Math.round(longitude / 15);
  }

  private calculateDuration(start: any, end: any): string {
    if (!start || !end) return 'Unknown';
    
    const startMinutes = (start.hour || 0) * 60 + (start.minute || 0);
    const endMinutes = (end.hour || 0) * 60 + (end.minute || 0);
    const diffMinutes = endMinutes - startMinutes;
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  }

  private calculateNightDuration(sunrise: any, sunset: any): string {
    if (!sunrise || !sunset) return 'Unknown';
    
    const dayMinutes = this.calculateDurationInMinutes(sunrise, sunset);
    const nightMinutes = 24 * 60 - dayMinutes;
    
    const hours = Math.floor(nightMinutes / 60);
    const minutes = nightMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  }

  private calculateDurationInMinutes(start: any, end: any): number {
    const startMinutes = (start.hour || 0) * 60 + (start.minute || 0);
    const endMinutes = (end.hour || 0) * 60 + (end.minute || 0);
    return endMinutes - startMinutes;
  }

  private getPakshaFromTithi(tithiName: string): string {
    if (!tithiName) return 'Unknown';
    
    const shuklaPackTithis = [
      'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
      'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
      'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima'
    ];
    
    return shuklaPackTithis.includes(tithiName) ? 'Shukla Paksha' : 'Krishna Paksha';
  }

  private getNakshatraLord(nakshatraName: string): string {
    const lords: Record<string, string> = {
      'Ashwini': 'Ketu', 'Bharani': 'Venus', 'Krittika': 'Sun', 'Rohini': 'Moon',
      'Mrigashirsha': 'Mars', 'Ardra': 'Rahu', 'Punarvasu': 'Jupiter', 'Pushya': 'Saturn',
      'Ashlesha': 'Mercury', 'Magha': 'Ketu', 'Purva Phalguni': 'Venus', 'Uttara Phalguni': 'Sun',
      'Hasta': 'Moon', 'Chitra': 'Mars', 'Swati': 'Rahu', 'Vishakha': 'Jupiter',
      'Anuradha': 'Saturn', 'Jyeshtha': 'Mercury', 'Mula': 'Ketu', 'Purva Ashadha': 'Venus',
      'Uttara Ashadha': 'Sun', 'Shravana': 'Moon', 'Dhanishta': 'Mars', 'Shatabhisha': 'Rahu',
      'Purva Bhadrapada': 'Jupiter', 'Uttara Bhadrapada': 'Saturn', 'Revati': 'Mercury'
    };
    return lords[nakshatraName] || 'Unknown';
  }

  private getNakshatraDeity(nakshatraName: string): string {
    const deities: Record<string, string> = {
      'Ashwini': 'Ashwini Kumaras', 'Bharani': 'Yama', 'Krittika': 'Agni', 'Rohini': 'Brahma',
      'Mrigashirsha': 'Soma', 'Ardra': 'Rudra', 'Punarvasu': 'Aditi', 'Pushya': 'Brihaspati',
      'Ashlesha': 'Nagas', 'Magha': 'Pitris', 'Purva Phalguni': 'Bhaga', 'Uttara Phalguni': 'Aryaman',
      'Hasta': 'Savitar', 'Chitra': 'Tvashtar', 'Swati': 'Vayu', 'Vishakha': 'Indra-Agni',
      'Anuradha': 'Mitra', 'Jyeshtha': 'Indra', 'Mula': 'Nirriti', 'Purva Ashadha': 'Apas',
      'Uttara Ashadha': 'Vishwadevas', 'Shravana': 'Vishnu', 'Dhanishta': 'Vasus', 'Shatabhisha': 'Varuna',
      'Purva Bhadrapada': 'Aja Ekapada', 'Uttara Bhadrapada': 'Ahir Budhnya', 'Revati': 'Pushan'
    };
    return deities[nakshatraName] || 'Unknown';
  }

  private getYogaMeaning(yogaName: string): string {
    const meanings: Record<string, string> = {
      'Vishkumbha': 'Obstacles', 'Priti': 'Love', 'Ayushman': 'Long life', 'Saubhagya': 'Good fortune',
      'Shobhana': 'Splendid', 'Atiganda': 'Great obstacles', 'Sukarma': 'Good deeds', 'Dhriti': 'Resolve',
      'Shula': 'Spear', 'Ganda': 'Obstacles', 'Vriddhi': 'Growth', 'Dhruva': 'Fixed',
      'Vyaghata': 'Striking', 'Harshana': 'Joy', 'Vajra': 'Diamond', 'Siddhi': 'Success',
      'Vyatipata': 'Calamity', 'Variyan': 'Best', 'Parigha': 'Iron bar', 'Shiva': 'Auspicious',
      'Siddha': 'Accomplished', 'Sadhya': 'Achievable', 'Shubha': 'Auspicious', 'Shukla': 'Bright',
      'Brahma': 'Sacred', 'Indra': 'Powerful', 'Vaidhriti': 'Poor support'
    };
    return meanings[yogaName] || 'Unknown';
  }

  private getMoonRashi(nakshatraName: string): string {
    const rashiMap: Record<string, string> = {
      'Ashwini': 'Mesha', 'Bharani': 'Mesha', 'Krittika': 'Vrishabha',
      'Rohini': 'Vrishabha', 'Mrigashirsha': 'Mithuna', 'Ardra': 'Mithuna',
      'Punarvasu': 'Karka', 'Pushya': 'Karka', 'Ashlesha': 'Karka',
      'Magha': 'Simha', 'Purva Phalguni': 'Simha', 'Uttara Phalguni': 'Kanya',
      'Hasta': 'Kanya', 'Chitra': 'Tula', 'Swati': 'Tula',
      'Vishakha': 'Vrishchika', 'Anuradha': 'Vrishchika', 'Jyeshtha': 'Vrishchika',
      'Mula': 'Dhanu', 'Purva Ashadha': 'Dhanu', 'Uttara Ashadha': 'Makara',
      'Shravana': 'Makara', 'Dhanishta': 'Kumbha', 'Shatabhisha': 'Kumbha',
      'Purva Bhadrapada': 'Meena', 'Uttara Bhadrapada': 'Meena', 'Revati': 'Meena'
    };
    return rashiMap[nakshatraName] || 'Unknown';
  }

  private getRashiLord(rashiName: string): string {
    const lords: Record<string, string> = {
      'Mesha': 'Mars', 'Vrishabha': 'Venus', 'Mithuna': 'Mercury', 'Karka': 'Moon',
      'Simha': 'Sun', 'Kanya': 'Mercury', 'Tula': 'Venus', 'Vrishchika': 'Mars',
      'Dhanu': 'Jupiter', 'Makara': 'Saturn', 'Kumbha': 'Saturn', 'Meena': 'Jupiter'
    };
    return lords[rashiName] || 'Unknown';
  }

  private getRashiElement(rashiName: string): string {
    const elements: Record<string, string> = {
      'Mesha': 'Fire', 'Vrishabha': 'Earth', 'Mithuna': 'Air', 'Karka': 'Water',
      'Simha': 'Fire', 'Kanya': 'Earth', 'Tula': 'Air', 'Vrishchika': 'Water',
      'Dhanu': 'Fire', 'Makara': 'Earth', 'Kumbha': 'Air', 'Meena': 'Water'
    };
    return elements[rashiName] || 'Unknown';
  }

  private getAyana(date: string): string {
    const month = new Date(date).getMonth() + 1;
    return (month >= 4 && month <= 9) ? 'Dakshinayana' : 'Uttarayana';
  }

  private getRitu(date: string): string {
    const month = new Date(date).getMonth() + 1;
    if (month >= 3 && month <= 4) return 'Vasanta';
    if (month >= 5 && month <= 6) return 'Grishma';
    if (month >= 7 && month <= 8) return 'Varsha';
    if (month >= 9 && month <= 10) return 'Sharad';
    if (month >= 11 && month <= 12) return 'Shishira';
    return 'Hemanta';
  }

  private getFestivals(date: string): string[] {
    // Basic festival calculation based on date patterns
    const month = new Date(date).getMonth() + 1;
    const festivals: string[] = [];
    
    if (month === 6) {
      festivals.push('Guru Purnima', 'Shravan Somwar');
    }
    
    return festivals;
  }

  private getVrats(date: string): string[] {
    // Basic vrat calculation based on day patterns
    const dayOfWeek = new Date(date).getDay();
    const vrats: string[] = [];
    
    if (dayOfWeek === 1) { // Monday
      vrats.push('Som Pradosh', 'Solah Somwar Vrat');
    }
    
    return vrats;
  }
}

export const mhahPanchangService = new MhahPanchangService();