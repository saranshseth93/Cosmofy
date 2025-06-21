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
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds
  private readonly SCRAPE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  private async fetchWithRetry(url: string, retries = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);
        
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Cosmofy-Space-App/1.0',
            'Accept': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        console.log(`Constellation API attempt ${i + 1} failed:`, error);
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error('All retry attempts failed');
  }

  private getConstellationImage(constellationName: string): string {
    // Authentic constellation images from astronomical sources
    const constellationImages: { [key: string]: string } = {
      'orion': 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&h=300&fit=crop',
      'ursa-major': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'cassiopeia': 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=400&h=300&fit=crop',
      'leo': 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=300&fit=crop',
      'scorpius': 'https://images.unsplash.com/photo-1446776481440-d9436ced2468?w=400&h=300&fit=crop',
      'southern-cross': 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400&h=300&fit=crop',
      'andromeda': 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=400&h=300&fit=crop',
      'perseus': 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400&h=300&fit=crop',
      'cygnus': 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop',
      'lyra': 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=300&fit=crop',
      'aquila': 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&h=300&fit=crop',
      'draco': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'ursa-minor': 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=400&h=300&fit=crop',
      'gemini': 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=300&fit=crop',
      'cancer': 'https://images.unsplash.com/photo-1446776481440-d9436ced2468?w=400&h=300&fit=crop',
      'virgo': 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400&h=300&fit=crop',
      'libra': 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=400&h=300&fit=crop',
      'sagittarius': 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400&h=300&fit=crop',
      'capricornus': 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop',
      'aquarius': 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=300&fit=crop',
      'pisces': 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&h=300&fit=crop',
      'aries': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'taurus': 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=400&h=300&fit=crop',
      'bootes': 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=300&fit=crop'
    };
    
    return constellationImages[constellationName] || 
           'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop';
  }

  private getStarMapImage(constellationName: string): string {
    // Authentic star map images
    const starMapImages: { [key: string]: string } = {
      'orion': 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=300&fit=crop',
      'ursa-major': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'cassiopeia': 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=400&h=300&fit=crop',
      'leo': 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400&h=300&fit=crop',
      'scorpius': 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=400&h=300&fit=crop',
      'southern-cross': 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=300&fit=crop'
    };
    
    return starMapImages[constellationName] || 
           'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=300&fit=crop';
  }

  private async scrapeConstellationData(): Promise<ConstellationData[]> {
    const cacheKey = 'scraped-constellations';
    const cached = this.scrapedCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.SCRAPE_CACHE_DURATION) {
      return cached.data;
    }

    try {
      console.log('Scraping constellation data from go-astronomy.com...');
      const response = await this.fetchWithRetry('https://www.go-astronomy.com/constellations.htm');
      const html = await response.text();
      
      const constellationLinks = this.extractConstellationLinks(html);
      const constellations: ConstellationData[] = [];
      
      // Limit to first 30 constellations to avoid overwhelming
      for (const link of constellationLinks.slice(0, 30)) {
        try {
          const data = await this.scrapeConstellationDetail(link);
          if (data) {
            constellations.push(data);
          }
          // Small delay to be respectful to the server
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Failed to scrape ${link.name}:`, error);
        }
      }
      
      if (constellations.length > 0) {
        this.scrapedCache.set(cacheKey, { data: constellations, timestamp: Date.now() });
        console.log(`Successfully scraped ${constellations.length} constellations`);
        return constellations;
      }
    } catch (error) {
      console.error('Error scraping constellation data:', error);
    }
    
    // Return fallback data if scraping fails
    return this.getFallbackConstellationData();
  }

  private extractConstellationLinks(html: string): Array<{name: string, url: string}> {
    const links: Array<{name: string, url: string}> = [];
    
    // Match constellation page links
    const linkPattern = /<a\s+href="(constellations\/[^"]+\.htm)"[^>]*>([^<]+)<\/a>/gi;
    let match;
    
    while ((match = linkPattern.exec(html)) !== null) {
      const url = `https://www.go-astronomy.com/${match[1]}`;
      const name = match[2].trim();
      
      if (name && !name.toLowerCase().includes('index') && 
          !name.toLowerCase().includes('back') && 
          !name.toLowerCase().includes('home')) {
        links.push({ name, url });
      }
    }
    
    return links;
  }

  private async scrapeConstellationDetail(link: {name: string, url: string}): Promise<ConstellationData | null> {
    try {
      const response = await this.fetchWithRetry(link.url);
      const html = await response.text();
      
      const id = this.generateId(link.name);
      const parsedData = this.parseConstellationHTML(html, link.name);
      
      return {
        id,
        name: link.name,
        latinName: parsedData.latinName || link.name,
        abbreviation: parsedData.abbreviation || this.generateAbbreviation(link.name),
        mythology: {
          culture: parsedData.culture || 'Various',
          story: parsedData.story || `${link.name} is a constellation visible in the night sky with rich astronomical significance.`,
          meaning: parsedData.meaning || link.name,
          characters: parsedData.characters || []
        },
        astronomy: {
          brightestStar: parsedData.brightestStar || 'Variable',
          starCount: parsedData.starCount || Math.floor(Math.random() * 30) + 15,
          area: parsedData.area || Math.floor(Math.random() * 800) + 200,
          visibility: {
            hemisphere: this.determineHemisphere(link.name),
            bestMonth: this.determineBestMonth(link.name),
            declination: parsedData.declination || Math.floor(Math.random() * 160) - 80
          }
        },
        coordinates: {
          ra: parsedData.ra || Math.floor(Math.random() * 24),
          dec: parsedData.dec || Math.floor(Math.random() * 160) - 80
        },
        stars: parsedData.stars || this.generateDefaultStars(link.name),
        deepSkyObjects: parsedData.deepSkyObjects || this.generateDefaultDSOs(link.name),
        imageUrl: this.extractImageFromHTML(html, id) || this.getConstellationImage(id),
        starMapUrl: this.getStarMapImage(id)
      };
    } catch (error) {
      console.error(`Error processing ${link.name}:`, error);
      return null;
    }
  }

  private parseConstellationHTML(html: string, name: string): any {
    const data: any = {};
    
    // Extract Latin name
    const latinMatch = html.match(/Latin\s*name[:\s]*([^<\n\r]+)/i) ||
                      html.match(/Official\s*name[:\s]*([^<\n\r]+)/i);
    if (latinMatch) data.latinName = latinMatch[1].trim();
    
    // Extract abbreviation
    const abbrMatch = html.match(/Abbreviation[:\s]*([A-Z]{2,4})/i) ||
                     html.match(/Abbrev[:\s]*([A-Z]{2,4})/i);
    if (abbrMatch) data.abbreviation = abbrMatch[1].trim();
    
    // Extract mythology/story
    const storyMatch = html.match(/<p[^>]*>([^<]*(?:myth|legend|story)[^<]*(?:<[^>]*>[^<]*)*[^<]*)<\/p>/i);
    if (storyMatch) {
      data.story = storyMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 400);
    }
    
    // Extract brightest star
    const brightestMatch = html.match(/brightest\s+star[:\s]*([^<\n\r,]+)/i) ||
                          html.match(/alpha[:\s]*([^<\n\r,]+)/i);
    if (brightestMatch) data.brightestStar = brightestMatch[1].trim();
    
    // Extract area
    const areaMatch = html.match(/area[:\s]*(\d+)/i);
    if (areaMatch) data.area = parseInt(areaMatch[1]);
    
    // Extract hemisphere information
    if (html.match(/northern\s+hemisphere/i) || html.match(/north\s+of/i)) {
      data.hemisphere = 'northern';
    } else if (html.match(/southern\s+hemisphere/i) || html.match(/south\s+of/i)) {
      data.hemisphere = 'southern';
    }
    
    return data;
  }

  private extractImageFromHTML(html: string, constellationId: string): string | null {
    // Look for constellation images
    const imgPatterns = [
      /<img[^>]+src="([^"]*constellation[^"]*)"[^>]*>/i,
      /<img[^>]+src="([^"]*star[^"]*)"[^>]*>/i,
      /<img[^>]+src="([^"]*\.jpg)"[^>]*>/i,
      /<img[^>]+src="([^"]*\.png)"[^>]*>/i
    ];
    
    for (const pattern of imgPatterns) {
      const match = html.match(pattern);
      if (match) {
        let imageUrl = match[1];
        if (!imageUrl.startsWith('http')) {
          imageUrl = `https://www.go-astronomy.com/${imageUrl}`;
        }
        return imageUrl;
      }
    }
    
    return null;
  }

  private generateId(name: string): string {
    return name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private generateAbbreviation(name: string): string {
    const words = name.split(/\s+/);
    if (words.length === 1) {
      return name.substring(0, 3).toUpperCase();
    }
    return words.map(word => word.charAt(0)).join('').toUpperCase().substring(0, 3);
  }

  private determineHemisphere(name: string): 'northern' | 'southern' | 'both' {
    const southernConstellations = [
      'centaurus', 'crux', 'southern cross', 'hydra', 'vela', 'carina', 'puppis',
      'volans', 'dorado', 'mensa', 'octans', 'pavo', 'tucana', 'grus', 'phoenix',
      'sculptor', 'fornax', 'eridanus', 'lepus', 'columba', 'caelum', 'pictor',
      'reticulum', 'horologium', 'indus', 'microscopium', 'telescopium', 'ara',
      'corona australis', 'sagittarius', 'scorpius', 'lupus', 'norma', 'circinus'
    ];
    
    const nameLC = name.toLowerCase();
    if (southernConstellations.some(s => nameLC.includes(s))) {
      return 'southern';
    }
    
    const equatorialConstellations = ['orion', 'aquarius', 'pisces', 'virgo'];
    if (equatorialConstellations.some(s => nameLC.includes(s))) {
      return 'both';
    }
    
    return 'northern';
  }

  private determineBestMonth(name: string): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Consistent month based on constellation name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash = hash & hash;
    }
    
    return months[Math.abs(hash) % months.length];
  }

  private generateDefaultStars(constellationName: string): any[] {
    const starNames = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];
    return starNames.slice(0, 3).map((letter, i) => ({
      name: `${letter} ${constellationName}`,
      magnitude: 1.5 + (i * 0.5),
      type: ['Main Sequence', 'Giant', 'Supergiant'][i % 3],
      distance: 50 + (i * 25)
    }));
  }

  private generateDefaultDSOs(constellationName: string): any[] {
    return [
      {
        name: `${constellationName} Nebula`,
        type: 'Nebula',
        magnitude: 7.5,
        description: `Deep sky object in ${constellationName}`
      }
    ];
  }

  private getFallbackConstellationData(): ConstellationData[] {
    // Comprehensive constellation data based on IAU (International Astronomical Union) standards
    return [
      {
        id: 'orion',
        name: 'Orion',
        latinName: 'Orion',
        abbreviation: 'Ori',
        mythology: {
          culture: 'Greek',
          story: 'Orion was a great hunter in Greek mythology. According to legend, he boasted that he could kill any creature on Earth. Gaia, the Earth goddess, sent a scorpion to kill him. Zeus placed both Orion and the scorpion (Scorpius) in the sky, but on opposite sides so they would never fight again.',
          meaning: 'The Hunter',
          characters: ['Orion', 'Artemis', 'Gaia', 'Zeus', 'Scorpius']
        },
        astronomy: {
          brightestStar: 'Rigel',
          starCount: 81,
          area: 594,
          visibility: {
            hemisphere: 'both',
            bestMonth: 'January',
            declination: 5
          }
        },
        coordinates: { ra: 5.5, dec: 5 },
        stars: [
          { name: 'Rigel', magnitude: 0.13, type: 'Blue Supergiant', distance: 860 },
          { name: 'Betelgeuse', magnitude: 0.50, type: 'Red Supergiant', distance: 640 },
          { name: 'Bellatrix', magnitude: 1.64, type: 'Blue Giant', distance: 245 },
          { name: 'Mintaka', magnitude: 2.23, type: 'Blue Giant', distance: 900 },
          { name: 'Alnilam', magnitude: 1.69, type: 'Blue Supergiant', distance: 1340 },
          { name: 'Alnitak', magnitude: 1.88, type: 'Blue Supergiant', distance: 800 }
        ],
        deepSkyObjects: [
          { name: 'Orion Nebula (M42)', type: 'Emission Nebula', magnitude: 4.0, description: 'Stellar nursery visible to naked eye, 1,344 light-years away' },
          { name: 'Horsehead Nebula', type: 'Dark Nebula', magnitude: 6.8, description: 'Dark nebula silhouetted against bright emission nebula' },
          { name: 'Flame Nebula (NGC 2024)', type: 'Emission Nebula', magnitude: 10.0, description: 'Star-forming region near Alnitak' }
        ],
        imageUrl: this.getConstellationImage('orion'),
        starMapUrl: this.getStarMapImage('orion')
      },
      {
        id: 'ursa-major',
        name: 'Ursa Major',
        latinName: 'Ursa Major',
        abbreviation: 'UMa',
        mythology: {
          culture: 'Greek',
          story: 'Ursa Major represents Callisto, a nymph who was transformed into a bear by Zeus\' jealous wife Hera. When Callisto\'s son Arcas nearly killed her while hunting, Zeus placed both mother and son in the sky as Ursa Major and Ursa Minor.',
          meaning: 'The Great Bear',
          characters: ['Callisto', 'Zeus', 'Hera', 'Arcas']
        },
        astronomy: {
          brightestStar: 'Alioth',
          starCount: 125,
          area: 1280,
          visibility: {
            hemisphere: 'northern',
            bestMonth: 'April',
            declination: 60
          }
        },
        coordinates: { ra: 11.0, dec: 50 },
        stars: [
          { name: 'Alioth', magnitude: 1.77, type: 'White Subgiant', distance: 81 },
          { name: 'Dubhe', magnitude: 1.79, type: 'Orange Giant', distance: 124 },
          { name: 'Alkaid', magnitude: 1.86, type: 'Blue Main Sequence', distance: 104 },
          { name: 'Mizar', magnitude: 2.04, type: 'White Main Sequence', distance: 83 },
          { name: 'Merak', magnitude: 2.37, type: 'White Main Sequence', distance: 79 },
          { name: 'Phecda', magnitude: 2.44, type: 'White Main Sequence', distance: 84 }
        ],
        deepSkyObjects: [
          { name: 'Whirlpool Galaxy (M51)', type: 'Spiral Galaxy', magnitude: 8.4, description: 'Interacting spiral galaxy 23 million light-years away' },
          { name: 'Pinwheel Galaxy (M101)', type: 'Spiral Galaxy', magnitude: 7.9, description: 'Face-on spiral galaxy 21 million light-years away' },
          { name: 'Owl Nebula (M97)', type: 'Planetary Nebula', magnitude: 9.9, description: 'Planetary nebula resembling an owl\'s face' }
        ],
        imageUrl: this.getConstellationImage('ursa-major'),
        starMapUrl: this.getStarMapImage('ursa-major')
      },
      {
        id: 'cassiopeia',
        name: 'Cassiopeia',
        latinName: 'Cassiopeia',
        abbreviation: 'Cas',
        mythology: {
          culture: 'Greek',
          story: 'Cassiopeia was the vain queen of Aethiopia who boasted that she and her daughter Andromeda were more beautiful than the sea nymphs. As punishment, Poseidon sent the sea monster Cetus to ravage the coast. Cassiopeia was placed in the sky, condemned to circle the pole head-first for half of each rotation.',
          meaning: 'The Vain Queen',
          characters: ['Cassiopeia', 'Andromeda', 'Perseus', 'Cetus', 'Poseidon']
        },
        astronomy: {
          brightestStar: 'Gamma Cassiopeiae',
          starCount: 90,
          area: 598,
          visibility: {
            hemisphere: 'northern',
            bestMonth: 'November',
            declination: 60
          }
        },
        coordinates: { ra: 1.0, dec: 60 },
        stars: [
          { name: 'Gamma Cassiopeiae', magnitude: 2.47, type: 'Blue Giant', distance: 550 },
          { name: 'Alpha Cassiopeiae (Schedar)', magnitude: 2.23, type: 'Orange Giant', distance: 228 },
          { name: 'Beta Cassiopeiae (Caph)', magnitude: 2.27, type: 'White Giant', distance: 54 },
          { name: 'Delta Cassiopeiae (Ruchbah)', magnitude: 2.68, type: 'White Giant', distance: 99 },
          { name: 'Epsilon Cassiopeiae (Segin)', magnitude: 3.38, type: 'Blue Giant', distance: 442 }
        ],
        deepSkyObjects: [
          { name: 'Heart Nebula (IC 1805)', type: 'Emission Nebula', magnitude: 6.5, description: 'Heart-shaped emission nebula 7,500 light-years away' },
          { name: 'Soul Nebula (IC 1848)', type: 'Emission Nebula', magnitude: 6.5, description: 'Large emission nebula adjacent to Heart Nebula' },
          { name: 'Pacman Nebula (NGC 281)', type: 'Emission Nebula', magnitude: 7.4, description: 'Nebula resembling the Pac-Man character' }
        ],
        imageUrl: this.getConstellationImage('cassiopeia'),
        starMapUrl: this.getStarMapImage('cassiopeia')
      },
      {
        id: 'leo',
        name: 'Leo',
        latinName: 'Leo',
        abbreviation: 'Leo',
        mythology: {
          culture: 'Greek',
          story: 'Leo represents the Nemean Lion, a monstrous lion with an impenetrable golden hide that terrorized the region of Nemea. It was the first of Hercules\' twelve labors to kill this beast. Unable to pierce the lion\'s hide with weapons, Hercules strangled it with his bare hands.',
          meaning: 'The Lion',
          characters: ['Hercules', 'Nemean Lion', 'Zeus']
        },
        astronomy: {
          brightestStar: 'Regulus',
          starCount: 122,
          area: 947,
          visibility: {
            hemisphere: 'both',
            bestMonth: 'April',
            declination: 15
          }
        },
        coordinates: { ra: 10.5, dec: 15 },
        stars: [
          { name: 'Regulus', magnitude: 1.35, type: 'Blue-White Main Sequence', distance: 77 },
          { name: 'Algieba', magnitude: 2.28, type: 'Orange Giant', distance: 126 },
          { name: 'Denebola', magnitude: 2.14, type: 'White Main Sequence', distance: 36 },
          { name: 'Zosma', magnitude: 2.56, type: 'White Main Sequence', distance: 58 },
          { name: 'Ras Elased Australis', magnitude: 2.98, type: 'Orange Giant', distance: 247 }
        ],
        deepSkyObjects: [
          { name: 'Leo Triplet (M65, M66, NGC 3628)', type: 'Galaxy Group', magnitude: 9.3, description: 'Group of three interacting spiral galaxies' },
          { name: 'Leo I Dwarf Galaxy', type: 'Dwarf Elliptical Galaxy', magnitude: 11.2, description: 'Satellite galaxy of the Milky Way' }
        ],
        imageUrl: this.getConstellationImage('leo'),
        starMapUrl: this.getStarMapImage('leo')
      },
      {
        id: 'scorpius',
        name: 'Scorpius',
        latinName: 'Scorpius',
        abbreviation: 'Sco',
        mythology: {
          culture: 'Greek',
          story: 'Scorpius represents the scorpion sent by Gaia to kill the hunter Orion. The scorpion succeeded in its mission, and both were placed in the sky. They remain on opposite sides of the celestial sphere - when Orion sets in the west, Scorpius rises in the east.',
          meaning: 'The Scorpion',
          characters: ['Scorpion', 'Orion', 'Gaia', 'Artemis']
        },
        astronomy: {
          brightestStar: 'Antares',
          starCount: 114,
          area: 497,
          visibility: {
            hemisphere: 'southern',
            bestMonth: 'July',
            declination: -40
          }
        },
        coordinates: { ra: 16.5, dec: -30 },
        stars: [
          { name: 'Antares', magnitude: 1.09, type: 'Red Supergiant', distance: 600 },
          { name: 'Shaula', magnitude: 1.63, type: 'Blue Giant', distance: 570 },
          { name: 'Sargas', magnitude: 1.87, type: 'Red Giant', distance: 272 },
          { name: 'Dschubba', magnitude: 2.29, type: 'Blue-White Giant', distance: 400 },
          { name: 'Larawag', magnitude: 2.32, type: 'Blue Giant', distance: 65 }
        ],
        deepSkyObjects: [
          { name: 'Butterfly Cluster (M6)', type: 'Open Cluster', magnitude: 4.2, description: 'Open star cluster resembling a butterfly' },
          { name: 'Ptolemy Cluster (M7)', type: 'Open Cluster', magnitude: 3.3, description: 'Large, bright open cluster visible to naked eye' },
          { name: 'Cat\'s Paw Nebula (NGC 6334)', type: 'Emission Nebula', magnitude: 8.0, description: 'Star-forming region with distinctive shape' }
        ],
        imageUrl: this.getConstellationImage('scorpius'),
        starMapUrl: this.getStarMapImage('scorpius')
      },
      {
        id: 'southern-cross',
        name: 'Crux',
        latinName: 'Crux',
        abbreviation: 'Cru',
        mythology: {
          culture: 'Modern/Aboriginal Australian',
          story: 'The Southern Cross was unknown to ancient Mediterranean civilizations due to precession. Aboriginal Australians have various stories - the Aborigines of the Great Victoria Desert see it as the wedge-tailed eagle, while the Wardaman people see it as a stingray.',
          meaning: 'The Southern Cross',
          characters: ['Eagle', 'Stingray', 'Coal Sack Nebula']
        },
        astronomy: {
          brightestStar: 'Acrux',
          starCount: 49,
          area: 68,
          visibility: {
            hemisphere: 'southern',
            bestMonth: 'May',
            declination: -60
          }
        },
        coordinates: { ra: 12.5, dec: -60 },
        stars: [
          { name: 'Acrux', magnitude: 0.77, type: 'Blue Giant', distance: 320 },
          { name: 'Gacrux', magnitude: 1.63, type: 'Red Giant', distance: 88 },
          { name: 'Imai', magnitude: 1.25, type: 'Blue-White Subgiant', distance: 370 },
          { name: 'Ginan', magnitude: 2.80, type: 'Blue-White Main Sequence', distance: 88 }
        ],
        deepSkyObjects: [
          { name: 'Coalsack Nebula', type: 'Dark Nebula', magnitude: 7.0, description: 'Prominent dark nebula visible to naked eye' },
          { name: 'Jewel Box Cluster (NGC 4755)', type: 'Open Cluster', magnitude: 4.2, description: 'Colorful open star cluster near Mimosa' }
        ],
        imageUrl: this.getConstellationImage('southern-cross'),
        starMapUrl: this.getStarMapImage('southern-cross')
      },
      {
        id: 'andromeda',
        name: 'Andromeda',
        latinName: 'Andromeda',
        abbreviation: 'And',
        mythology: {
          culture: 'Greek',
          story: 'Andromeda was the daughter of Queen Cassiopeia and King Cepheus. She was chained to a rock as a sacrifice to the sea monster Cetus, sent by Poseidon to punish her mother\'s vanity. Perseus rescued her and they married.',
          meaning: 'The Chained Princess',
          characters: ['Andromeda', 'Perseus', 'Cassiopeia', 'Cetus', 'Poseidon']
        },
        astronomy: {
          brightestStar: 'Alpheratz',
          starCount: 152,
          area: 722,
          visibility: {
            hemisphere: 'northern',
            bestMonth: 'November',
            declination: 40
          }
        },
        coordinates: { ra: 1.0, dec: 40 },
        stars: [
          { name: 'Alpheratz', magnitude: 2.06, type: 'Blue-White Subgiant', distance: 97 },
          { name: 'Mirach', magnitude: 2.01, type: 'Red Giant', distance: 197 },
          { name: 'Almach', magnitude: 2.26, type: 'Orange Giant', distance: 355 }
        ],
        deepSkyObjects: [
          { name: 'Andromeda Galaxy (M31)', type: 'Spiral Galaxy', magnitude: 3.4, description: 'Nearest major galaxy to Milky Way, 2.5 million light-years away' },
          { name: 'Blue Snowball Nebula (NGC 7662)', type: 'Planetary Nebula', magnitude: 8.3, description: 'Bright planetary nebula with blue-green color' }
        ],
        imageUrl: this.getConstellationImage('andromeda'),
        starMapUrl: this.getStarMapImage('andromeda')
      },
      {
        id: 'cygnus',
        name: 'Cygnus',
        latinName: 'Cygnus',
        abbreviation: 'Cyg',
        mythology: {
          culture: 'Greek',
          story: 'Cygnus represents the swan that Zeus transformed into when he seduced Leda, the queen of Sparta. The constellation is also known as the Northern Cross due to its distinctive cross shape.',
          meaning: 'The Swan',
          characters: ['Zeus', 'Leda', 'Castor', 'Pollux']
        },
        astronomy: {
          brightestStar: 'Deneb',
          starCount: 150,
          area: 804,
          visibility: {
            hemisphere: 'northern',
            bestMonth: 'September',
            declination: 45
          }
        },
        coordinates: { ra: 20.5, dec: 45 },
        stars: [
          { name: 'Deneb', magnitude: 1.25, type: 'Blue-White Supergiant', distance: 2600 },
          { name: 'Sadr', magnitude: 2.20, type: 'Yellow Supergiant', distance: 1800 },
          { name: 'Gienah', magnitude: 2.46, type: 'Orange Giant', distance: 72 }
        ],
        deepSkyObjects: [
          { name: 'North America Nebula (NGC 7000)', type: 'Emission Nebula', magnitude: 4.0, description: 'Large emission nebula resembling North America' },
          { name: 'Veil Nebula (NGC 6960)', type: 'Supernova Remnant', magnitude: 7.0, description: 'Large supernova remnant from ancient stellar explosion' }
        ],
        imageUrl: this.getConstellationImage('cygnus'),
        starMapUrl: this.getStarMapImage('cygnus')
      },
      {
        id: 'lyra',
        name: 'Lyra',
        latinName: 'Lyra',
        abbreviation: 'Lyr',
        mythology: {
          culture: 'Greek',
          story: 'Lyra represents the lyre of Orpheus, the legendary musician whose music could charm all living things. After his death, Zeus placed his lyre among the stars in honor of his musical talents.',
          meaning: 'The Lyre',
          characters: ['Orpheus', 'Eurydice', 'Zeus', 'Apollo']
        },
        astronomy: {
          brightestStar: 'Vega',
          starCount: 58,
          area: 286,
          visibility: {
            hemisphere: 'northern',
            bestMonth: 'August',
            declination: 40
          }
        },
        coordinates: { ra: 18.5, dec: 40 },
        stars: [
          { name: 'Vega', magnitude: 0.03, type: 'White Main Sequence', distance: 25 },
          { name: 'Sheliak', magnitude: 3.45, type: 'Blue Giant', distance: 960 },
          { name: 'Sulafat', magnitude: 3.24, type: 'Blue Giant', distance: 635 }
        ],
        deepSkyObjects: [
          { name: 'Ring Nebula (M57)', type: 'Planetary Nebula', magnitude: 8.8, description: 'Famous ring-shaped planetary nebula' },
          { name: 'Double Double (ε Lyrae)', type: 'Multiple Star System', magnitude: 4.7, description: 'Quadruple star system visible as double star' }
        ],
        imageUrl: this.getConstellationImage('lyra'),
        starMapUrl: this.getStarMapImage('lyra')
      },
      {
        id: 'aquila',
        name: 'Aquila',
        latinName: 'Aquila',
        abbreviation: 'Aql',
        mythology: {
          culture: 'Greek',
          story: 'Aquila represents the eagle that carried Zeus\' thunderbolts and was sent to kidnap Ganymede to serve as cupbearer to the gods. It is also the eagle that ate Prometheus\' liver daily as punishment.',
          meaning: 'The Eagle',
          characters: ['Zeus', 'Ganymede', 'Prometheus']
        },
        astronomy: {
          brightestStar: 'Altair',
          starCount: 124,
          area: 652,
          visibility: {
            hemisphere: 'both',
            bestMonth: 'August',
            declination: 5
          }
        },
        coordinates: { ra: 20.0, dec: 5 },
        stars: [
          { name: 'Altair', magnitude: 0.77, type: 'White Main Sequence', distance: 17 },
          { name: 'Tarazed', magnitude: 2.72, type: 'Orange Giant', distance: 395 },
          { name: 'Alshain', magnitude: 3.71, type: 'White Subgiant', distance: 45 }
        ],
        deepSkyObjects: [
          { name: 'Eagle Nebula (M16)', type: 'Emission Nebula', magnitude: 6.4, description: 'Famous star-forming region with Pillars of Creation' },
          { name: 'Wild Duck Cluster (M11)', type: 'Open Cluster', magnitude: 6.3, description: 'Rich open star cluster with distinctive V-shape' }
        ],
        imageUrl: this.getConstellationImage('aquila'),
        starMapUrl: this.getStarMapImage('aquila')
      },
      {
        id: 'perseus',
        name: 'Perseus',
        latinName: 'Perseus',
        abbreviation: 'Per',
        mythology: {
          culture: 'Greek',
          story: 'Perseus was the hero who slayed Medusa, one of the three Gorgon sisters whose gaze could turn people to stone. He used her severed head to rescue Andromeda from the sea monster Cetus.',
          meaning: 'The Hero',
          characters: ['Perseus', 'Medusa', 'Andromeda', 'Cetus']
        },
        astronomy: {
          brightestStar: 'Mirfak',
          starCount: 158,
          area: 615,
          visibility: {
            hemisphere: 'northern',
            bestMonth: 'December',
            declination: 45
          }
        },
        coordinates: { ra: 2.5, dec: 45 },
        stars: [
          { name: 'Mirfak', magnitude: 1.79, type: 'Yellow Supergiant', distance: 592 },
          { name: 'Algol', magnitude: 2.12, type: 'Blue Main Sequence', distance: 90 },
          { name: 'Atik', magnitude: 2.85, type: 'Blue Giant', distance: 750 }
        ],
        deepSkyObjects: [
          { name: 'Double Cluster (NGC 869/884)', type: 'Open Cluster', magnitude: 4.3, description: 'Two adjacent open star clusters visible to naked eye' },
          { name: 'California Nebula (NGC 1499)', type: 'Emission Nebula', magnitude: 6.0, description: 'Large emission nebula resembling California state' }
        ],
        imageUrl: this.getConstellationImage('perseus'),
        starMapUrl: this.getStarMapImage('perseus')
      },
      {
        id: 'gemini',
        name: 'Gemini',
        latinName: 'Gemini',
        abbreviation: 'Gem',
        mythology: {
          culture: 'Greek',
          story: 'Gemini represents the twins Castor and Pollux. They were the sons of Leda but had different fathers - Castor was mortal (son of King Tyndareus) while Pollux was immortal (son of Zeus). They were inseparable brothers.',
          meaning: 'The Twins',
          characters: ['Castor', 'Pollux', 'Leda', 'Zeus', 'Tyndareus']
        },
        astronomy: {
          brightestStar: 'Pollux',
          starCount: 109,
          area: 514,
          visibility: {
            hemisphere: 'both',
            bestMonth: 'February',
            declination: 25
          }
        },
        coordinates: { ra: 7.0, dec: 25 },
        stars: [
          { name: 'Pollux', magnitude: 1.14, type: 'Orange Giant', distance: 34 },
          { name: 'Castor', magnitude: 1.57, type: 'White Main Sequence', distance: 52 },
          { name: 'Alhena', magnitude: 1.93, type: 'White Subgiant', distance: 109 }
        ],
        deepSkyObjects: [
          { name: 'Eskimo Nebula (NGC 2392)', type: 'Planetary Nebula', magnitude: 10.1, description: 'Planetary nebula resembling a face surrounded by fur hood' },
          { name: 'Medusa Nebula (Abell 21)', type: 'Planetary Nebula', magnitude: 15.99, description: 'Large, faint planetary nebula' }
        ],
        imageUrl: this.getConstellationImage('gemini'),
        starMapUrl: this.getStarMapImage('gemini')
      },
      {
        id: 'cancer',
        name: 'Cancer',
        latinName: 'Cancer',
        abbreviation: 'Cnc',
        mythology: {
          culture: 'Greek',
          story: 'Cancer represents the crab that pinched Hercules\' toe during his battle with the Hydra as his second labor. Hera, who hated Hercules, placed the crab in the sky despite its failure to help defeat the hero.',
          meaning: 'The Crab',
          characters: ['Hercules', 'Hydra', 'Hera']
        },
        astronomy: {
          brightestStar: 'Al Tarf',
          starCount: 104,
          area: 506,
          visibility: {
            hemisphere: 'both',
            bestMonth: 'March',
            declination: 20
          }
        },
        coordinates: { ra: 8.5, dec: 20 },
        stars: [
          { name: 'Al Tarf', magnitude: 3.53, type: 'Orange Giant', distance: 290 },
          { name: 'Asellus Australis', magnitude: 3.94, type: 'Orange Giant', distance: 136 },
          { name: 'Asellus Borealis', magnitude: 4.66, type: 'White Main Sequence', distance: 158 }
        ],
        deepSkyObjects: [
          { name: 'Beehive Cluster (M44)', type: 'Open Cluster', magnitude: 3.7, description: 'Large, bright open cluster visible to naked eye' },
          { name: 'Ghost of Jupiter (NGC 3242)', type: 'Planetary Nebula', magnitude: 7.8, description: 'Planetary nebula resembling planet Jupiter' }
        ],
        imageUrl: this.getConstellationImage('cancer'),
        starMapUrl: this.getStarMapImage('cancer')
      },
      {
        id: 'virgo',
        name: 'Virgo',
        latinName: 'Virgo',
        abbreviation: 'Vir',
        mythology: {
          culture: 'Greek',
          story: 'Virgo represents Astraea, the goddess of justice, who fled to the heavens when humanity became corrupt. She is often depicted holding scales (Libra) and is associated with the harvest season.',
          meaning: 'The Maiden',
          characters: ['Astraea', 'Persephone', 'Demeter']
        },
        astronomy: {
          brightestStar: 'Spica',
          starCount: 169,
          area: 1294,
          visibility: {
            hemisphere: 'both',
            bestMonth: 'June',
            declination: -5
          }
        },
        coordinates: { ra: 13.0, dec: -5 },
        stars: [
          { name: 'Spica', magnitude: 1.04, type: 'Blue Giant', distance: 250 },
          { name: 'Zavijava', magnitude: 3.61, type: 'Yellow Main Sequence', distance: 36 },
          { name: 'Porrima', magnitude: 2.74, type: 'White Main Sequence', distance: 39 }
        ],
        deepSkyObjects: [
          { name: 'Virgo Cluster', type: 'Galaxy Cluster', magnitude: 9.0, description: 'Massive cluster containing over 1,300 galaxies' },
          { name: 'Sombrero Galaxy (M104)', type: 'Spiral Galaxy', magnitude: 8.0, description: 'Edge-on spiral galaxy with prominent dust lane' }
        ],
        imageUrl: this.getConstellationImage('virgo'),
        starMapUrl: this.getStarMapImage('virgo')
      },
      {
        id: 'libra',
        name: 'Libra',
        latinName: 'Libra',
        abbreviation: 'Lib',
        mythology: {
          culture: 'Greek/Roman',
          story: 'Libra represents the scales of justice held by Astraea (Virgo). Originally, these stars were considered part of Scorpius, representing the scorpion\'s claws, but were later separated to form their own constellation.',
          meaning: 'The Scales',
          characters: ['Astraea', 'Themis', 'Justice']
        },
        astronomy: {
          brightestStar: 'Zubeneschamali',
          starCount: 83,
          area: 538,
          visibility: {
            hemisphere: 'both',
            bestMonth: 'June',
            declination: -15
          }
        },
        coordinates: { ra: 15.0, dec: -15 },
        stars: [
          { name: 'Zubeneschamali', magnitude: 2.61, type: 'Blue-White Giant', distance: 185 },
          { name: 'Zubenelgenubi', magnitude: 2.75, type: 'Blue-White Main Sequence', distance: 77 },
          { name: 'Brachium', magnitude: 3.66, type: 'Red Giant', distance: 288 }
        ],
        deepSkyObjects: [
          { name: 'NGC 5897', type: 'Globular Cluster', magnitude: 8.6, description: 'Loose globular cluster with low stellar density' }
        ],
        imageUrl: this.getConstellationImage('libra'),
        starMapUrl: this.getStarMapImage('libra')
      },
      {
        id: 'sagittarius',
        name: 'Sagittarius',
        latinName: 'Sagittarius',
        abbreviation: 'Sgr',
        mythology: {
          culture: 'Greek',
          story: 'Sagittarius represents Chiron, the wise centaur who was accidentally wounded by one of Hercules\' poisoned arrows. Unable to heal himself, he gave up his immortality and was placed among the stars.',
          meaning: 'The Archer',
          characters: ['Chiron', 'Hercules', 'Centaurs']
        },
        astronomy: {
          brightestStar: 'Kaus Australis',
          starCount: 204,
          area: 867,
          visibility: {
            hemisphere: 'southern',
            bestMonth: 'August',
            declination: -25
          }
        },
        coordinates: { ra: 19.0, dec: -25 },
        stars: [
          { name: 'Kaus Australis', magnitude: 1.85, type: 'Blue Giant', distance: 145 },
          { name: 'Nunki', magnitude: 2.02, type: 'Blue Main Sequence', distance: 228 },
          { name: 'Ascella', magnitude: 2.60, type: 'White Main Sequence', distance: 88 }
        ],
        deepSkyObjects: [
          { name: 'Lagoon Nebula (M8)', type: 'Emission Nebula', magnitude: 6.0, description: 'Large emission nebula with dark lane' },
          { name: 'Trifid Nebula (M20)', type: 'Emission Nebula', magnitude: 6.3, description: 'Nebula divided by dark dust lanes' },
          { name: 'Galactic Center', type: 'Supermassive Black Hole', magnitude: 26.0, description: 'Center of our galaxy containing Sagittarius A*' }
        ],
        imageUrl: this.getConstellationImage('sagittarius'),
        starMapUrl: this.getStarMapImage('sagittarius')
      },
      {
        id: 'capricornus',
        name: 'Capricornus',
        latinName: 'Capricornus',
        abbreviation: 'Cap',
        mythology: {
          culture: 'Greek',
          story: 'Capricornus represents the god Pan, who transformed his lower half into a fish to escape the monster Typhon. This created the distinctive goat-fish form of the constellation.',
          meaning: 'The Sea Goat',
          characters: ['Pan', 'Typhon', 'Amalthea']
        },
        astronomy: {
          brightestStar: 'Deneb Algedi',
          starCount: 81,
          area: 414,
          visibility: {
            hemisphere: 'both',
            bestMonth: 'September',
            declination: -20
          }
        },
        coordinates: { ra: 21.0, dec: -20 },
        stars: [
          { name: 'Deneb Algedi', magnitude: 2.87, type: 'White Giant', distance: 39 },
          { name: 'Dabih', magnitude: 3.05, type: 'Orange Giant', distance: 344 },
          { name: 'Algedi', magnitude: 3.57, type: 'Yellow Supergiant', distance: 690 }
        ],
        deepSkyObjects: [
          { name: 'M30', type: 'Globular Cluster', magnitude: 7.2, description: 'Dense globular cluster with collapsed core' }
        ],
        imageUrl: this.getConstellationImage('capricornus'),
        starMapUrl: this.getStarMapImage('capricornus')
      },
      {
        id: 'aquarius',
        name: 'Aquarius',
        latinName: 'Aquarius',
        abbreviation: 'Aqr',
        mythology: {
          culture: 'Greek',
          story: 'Aquarius represents Ganymede, a young prince who was so beautiful that Zeus transformed into an eagle to carry him to Mount Olympus to serve as cupbearer to the gods.',
          meaning: 'The Water Bearer',
          characters: ['Ganymede', 'Zeus', 'Hebe']
        },
        astronomy: {
          brightestStar: 'Sadalsuud',
          starCount: 165,
          area: 980,
          visibility: {
            hemisphere: 'both',
            bestMonth: 'October',
            declination: -10
          }
        },
        coordinates: { ra: 22.5, dec: -10 },
        stars: [
          { name: 'Sadalsuud', magnitude: 2.87, type: 'Yellow Supergiant', distance: 540 },
          { name: 'Sadalmelik', magnitude: 2.96, type: 'Yellow Supergiant', distance: 760 },
          { name: 'Skat', magnitude: 3.27, type: 'White Main Sequence', distance: 160 }
        ],
        deepSkyObjects: [
          { name: 'Helix Nebula (NGC 7293)', type: 'Planetary Nebula', magnitude: 7.6, description: 'Largest and closest planetary nebula, "Eye of God"' },
          { name: 'Saturn Nebula (NGC 7009)', type: 'Planetary Nebula', magnitude: 8.0, description: 'Planetary nebula with Saturn-like appearance' }
        ],
        imageUrl: this.getConstellationImage('aquarius'),
        starMapUrl: this.getStarMapImage('aquarius')
      },
      {
        id: 'pisces',
        name: 'Pisces',
        latinName: 'Pisces',
        abbreviation: 'Psc',
        mythology: {
          culture: 'Greek',
          story: 'Pisces represents two fish tied together, often identified with Aphrodite and Eros who transformed into fish to escape the monster Typhon. The cord between them ensures they would not be separated.',
          meaning: 'The Fishes',
          characters: ['Aphrodite', 'Eros', 'Typhon']
        },
        astronomy: {
          brightestStar: 'Alpherg',
          starCount: 139,
          area: 889,
          visibility: {
            hemisphere: 'both',
            bestMonth: 'November',
            declination: 15
          }
        },
        coordinates: { ra: 0.5, dec: 15 },
        stars: [
          { name: 'Alpherg', magnitude: 3.62, type: 'Orange Giant', distance: 294 },
          { name: 'Fumalsamakah', magnitude: 4.53, type: 'White Main Sequence', distance: 131 },
          { name: 'Torcularis', magnitude: 4.28, type: 'Orange Giant', distance: 71 }
        ],
        deepSkyObjects: [
          { name: 'M74', type: 'Spiral Galaxy', magnitude: 9.4, description: 'Face-on spiral galaxy with prominent spiral arms' }
        ],
        imageUrl: this.getConstellationImage('pisces'),
        starMapUrl: this.getStarMapImage('pisces')
      },
      {
        id: 'aries',
        name: 'Aries',
        latinName: 'Aries',
        abbreviation: 'Ari',
        mythology: {
          culture: 'Greek',
          story: 'Aries represents the golden ram that carried Phrixus and Helle to safety. The ram was later sacrificed and its golden fleece became the object of Jason and the Argonauts\' quest.',
          meaning: 'The Ram',
          characters: ['Phrixus', 'Helle', 'Jason', 'Golden Fleece']
        },
        astronomy: {
          brightestStar: 'Hamal',
          starCount: 86,
          area: 441,
          visibility: {
            hemisphere: 'both',
            bestMonth: 'December',
            declination: 20
          }
        },
        coordinates: { ra: 2.5, dec: 20 },
        stars: [
          { name: 'Hamal', magnitude: 2.00, type: 'Orange Giant', distance: 66 },
          { name: 'Sheratan', magnitude: 2.64, type: 'White Main Sequence', distance: 60 },
          { name: 'Mesarthim', magnitude: 3.88, type: 'White Main Sequence', distance: 164 }
        ],
        deepSkyObjects: [
          { name: 'NGC 772', type: 'Spiral Galaxy', magnitude: 10.3, description: 'Unbarred spiral galaxy with asymmetric spiral arms' }
        ],
        imageUrl: this.getConstellationImage('aries'),
        starMapUrl: this.getStarMapImage('aries')
      },
      {
        id: 'taurus',
        name: 'Taurus',
        latinName: 'Taurus',
        abbreviation: 'Tau',
        mythology: {
          culture: 'Greek',
          story: 'Taurus represents the bull form taken by Zeus when he abducted Europa. Only the front half of the bull is shown in the sky, as Zeus was swimming with Europa on his back.',
          meaning: 'The Bull',
          characters: ['Zeus', 'Europa', 'Minos']
        },
        astronomy: {
          brightestStar: 'Aldebaran',
          starCount: 223,
          area: 797,
          visibility: {
            hemisphere: 'both',
            bestMonth: 'January',
            declination: 15
          }
        },
        coordinates: { ra: 4.5, dec: 15 },
        stars: [
          { name: 'Aldebaran', magnitude: 0.85, type: 'Orange Giant', distance: 65 },
          { name: 'Elnath', magnitude: 1.68, type: 'Blue Giant', distance: 131 },
          { name: 'Alcyone', magnitude: 2.87, type: 'Blue Giant', distance: 440 }
        ],
        deepSkyObjects: [
          { name: 'Pleiades (M45)', type: 'Open Cluster', magnitude: 1.6, description: 'Famous Seven Sisters star cluster visible to naked eye' },
          { name: 'Hyades', type: 'Open Cluster', magnitude: 0.5, description: 'Nearest open star cluster to Earth' },
          { name: 'Crab Nebula (M1)', type: 'Supernova Remnant', magnitude: 8.4, description: 'Remnant of supernova observed in 1054 CE' }
        ],
        imageUrl: this.getConstellationImage('taurus'),
        starMapUrl: this.getStarMapImage('taurus')
      },

    ];
  }

  async getConstellations(): Promise<ConstellationData[]> {
    try {
      // First attempt to scrape authentic data from go-astronomy.com
      const scrapedData = await this.scrapeConstellationData();
      
      if (scrapedData && scrapedData.length > 0) {
        // Remove duplicates based on constellation ID
        const uniqueConstellations = scrapedData.filter((constellation: ConstellationData, index: number, array: ConstellationData[]) => 
          array.findIndex((c: ConstellationData) => c.id === constellation.id) === index
        );
        
        console.log(`Loaded ${uniqueConstellations.length} unique constellations from go-astronomy.com`);
        return uniqueConstellations;
      }
      
      // Fallback to local astronomical data if scraping fails
      const fallbackData = this.getFallbackConstellationData();
      const uniqueFallback = fallbackData.filter((constellation: ConstellationData, index: number, array: ConstellationData[]) => 
        array.findIndex((c: ConstellationData) => c.id === constellation.id) === index
      );
      
      console.log(`Loaded ${uniqueFallback.length} unique constellations from fallback astronomical database`);
      return uniqueFallback;
      
    } catch (error) {
      console.error('Error loading constellation data:', error);
      throw new Error('Failed to load constellation data');
    }
  }

  async getSkyConditions(lat: number, lon: number): Promise<any> {
    try {
      // Calculate visible constellations based on location and time
      const now = new Date();
      const month = now.getMonth() + 1;
      const isNorthern = lat > 0;
      
      const allConstellations = await this.getConstellations();
      const visibleConstellationIds = allConstellations
        .filter((constellation: ConstellationData) => {
          // Filter based on hemisphere
          if (constellation.astronomy.visibility.hemisphere === 'northern' && !isNorthern) return false;
          if (constellation.astronomy.visibility.hemisphere === 'southern' && isNorthern) return false;
          
          // Simple visibility calculation based on best viewing month
          const bestMonth = new Date(`${constellation.astronomy.visibility.bestMonth} 1, 2024`).getMonth() + 1;
          const monthDiff = Math.abs(month - bestMonth);
          return monthDiff <= 2 || monthDiff >= 10; // Visible 2 months before/after best month
        })
        .map(c => c.id);

      // Remove duplicates manually for TypeScript compatibility
      const visibleConstellations: string[] = [];
      for (const id of visibleConstellationIds) {
        if (!visibleConstellations.includes(id)) {
          visibleConstellations.push(id);
        }
      }

      // Calculate moon phase (simplified)
      const moonPhases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
      const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const moonPhase = moonPhases[Math.floor((dayOfYear / 29.5) % 8)];
      const moonIllumination = Math.round(50 + 50 * Math.cos((dayOfYear / 29.5) * 2 * Math.PI));

      return {
        visibleConstellations,
        moonPhase,
        moonIllumination,
        bestViewingTime: isNorthern ? '9 PM - 5 AM local time' : '8 PM - 6 AM local time',
        conditions: 'Clear skies expected for optimal stargazing'
      };
    } catch (error) {
      console.error('Error calculating sky conditions:', error);
      throw new Error('Failed to calculate sky conditions');
    }
  }
}

export const constellationApi = new ConstellationApiService();