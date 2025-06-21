import { Handler } from '@netlify/functions';

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
    const satellites = [
      {
        id: 1,
        name: 'International Space Station',
        noradId: 25544,
        type: 'Space Station',
        country: 'International',
        launchDate: '1998-11-20',
        altitude: 408,
        inclination: 51.6,
        period: 92.68,
        description: 'The largest human-made object in low Earth orbit',
        position: {
          latitude: Math.sin(Date.now() / 600000) * 51.6,
          longitude: ((Date.now() / 92000) % 360) - 180,
          altitude: 408
        }
      },
      {
        id: 2,
        name: 'Hubble Space Telescope',
        noradId: 20580,
        type: 'Scientific',
        country: 'USA',
        launchDate: '1990-04-24',
        altitude: 547,
        inclination: 28.5,
        period: 95.42,
        description: 'Space telescope that has revolutionized astronomy',
        position: {
          latitude: Math.sin(Date.now() / 650000) * 28.5,
          longitude: ((Date.now() / 95420) % 360) - 180,
          altitude: 547
        }
      }
    ];
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(satellites),
    };
  } catch (error) {
    console.error('Satellites API Error:', error);
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