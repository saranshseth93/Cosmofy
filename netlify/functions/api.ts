import { Handler } from '@netlify/functions';

// Simplified constellation data for Netlify deployment
const getConstellationData = () => {
  return [
    {
      id: 'orion',
      name: 'Orion',
      latinName: 'Orion',
      abbreviation: 'Ori',
      mythology: {
        culture: 'Greek',
        story: 'Orion was a mighty hunter in Greek mythology, placed among the stars by Zeus.',
        meaning: 'The Hunter',
        characters: ['Orion', 'Artemis', 'Zeus']
      },
      astronomy: {
        brightestStar: 'Rigel',
        starCount: 81,
        area: 594,
        visibility: { hemisphere: 'both', bestMonth: 'January', declination: 5 }
      },
      coordinates: { ra: 5.5, dec: 5 },
      stars: [
        { name: 'Rigel', magnitude: 0.1, type: 'Supergiant', distance: 860 },
        { name: 'Betelgeuse', magnitude: 0.5, type: 'Red Supergiant', distance: 700 }
      ],
      deepSkyObjects: [
        { name: 'Orion Nebula', type: 'Nebula', magnitude: 4.0, description: 'Star-forming nebula' }
      ],
      imageUrl: 'https://science.nasa.gov/wp-content/uploads/2023/09/orion-nebula-by-hubble-and-spitzer.jpg',
      starMapUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=300&fit=crop'
    },
    {
      id: 'ursa-major',
      name: 'Ursa Major',
      latinName: 'Ursa Major',
      abbreviation: 'UMa',
      mythology: {
        culture: 'Greek',
        story: 'The Great Bear constellation, one of the most recognizable in the northern sky.',
        meaning: 'The Great Bear',
        characters: ['Callisto', 'Zeus', 'Arcas']
      },
      astronomy: {
        brightestStar: 'Alioth',
        starCount: 125,
        area: 1280,
        visibility: { hemisphere: 'northern', bestMonth: 'April', declination: 50 }
      },
      coordinates: { ra: 11, dec: 50 },
      stars: [
        { name: 'Alioth', magnitude: 1.8, type: 'Main Sequence', distance: 81 },
        { name: 'Dubhe', magnitude: 1.8, type: 'Giant', distance: 124 }
      ],
      deepSkyObjects: [
        { name: 'Pinwheel Galaxy', type: 'Galaxy', magnitude: 7.9, description: 'Face-on spiral galaxy' }
      ],
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&q=80',
      starMapUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
    }
  ];
};

export const handler: Handler = async (event, context) => {
  const { httpMethod, path, queryStringParameters, body } = event;
  
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Extract the API path - handle both direct and proxy paths
    let apiPath = path.replace('/.netlify/functions/api', '');
    if (!apiPath.startsWith('/')) {
      apiPath = '/' + apiPath;
    }
    
    console.log('API Path:', apiPath, 'Method:', httpMethod);
    
    switch (apiPath) {
      case '/constellations':
        if (httpMethod === 'GET') {
          const constellations = getConstellationData();
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(constellations),
          };
        }
        break;

      case '/sky-conditions':
        if (httpMethod === 'GET') {
          const lat = parseFloat(queryStringParameters?.lat || '0');
          const lon = parseFloat(queryStringParameters?.lon || '0');
          
          // Calculate basic sky conditions
          const isNorthern = lat > 0;
          const now = new Date();
          const hour = now.getHours();
          
          const skyConditions = {
            visibleConstellations: isNorthern ? ['orion', 'ursa-major'] : ['orion'],
            moonPhase: 'First Quarter',
            moonIllumination: 50,
            bestViewingTime: isNorthern ? '21:00 - 02:00' : '20:00 - 01:00',
            conditions: hour >= 20 || hour <= 4 ? 'Good viewing conditions' : 'Daylight - not visible'
          };
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(skyConditions),
          };
        }
        break;

      case '/location':
        if (httpMethod === 'GET') {
          const locationData = {
            latitude: -37.6123312438664,
            longitude: 144.9918038934098,
            city: 'Melbourne, Australia',
            timezone: 'UTC'
          };
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(locationData),
          };
        }
        break;

      case '/apod':
        if (httpMethod === 'GET') {
          // Return sample APOD data for deployment
          const apodData = [
            {
              id: 1,
              date: '2024-12-21',
              title: 'Orion Nebula in Infrared',
              explanation: 'The Orion Nebula is a stellar nursery where new stars are born.',
              url: 'https://science.nasa.gov/wp-content/uploads/2023/09/orion-nebula-by-hubble-and-spitzer.jpg',
              hdurl: 'https://science.nasa.gov/wp-content/uploads/2023/09/orion-nebula-by-hubble-and-spitzer.jpg',
              mediaType: 'image',
              copyright: 'NASA/ESA'
            }
          ];
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(apodData),
          };
        }
        break;

      default:
        console.log('Unknown API path:', apiPath);
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: `API endpoint not found: ${apiPath}` }),
        };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('API Error:', error);
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