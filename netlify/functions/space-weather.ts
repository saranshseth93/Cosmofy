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
    const now = new Date();
    
    const spaceWeatherData = {
      id: 1,
      timestamp: now,
      solarFlux: Math.floor(Math.random() * 50) + 100,
      kpIndex: Math.floor(Math.random() * 9),
      magneticField: {
        bx: (Math.random() - 0.5) * 20,
        by: (Math.random() - 0.5) * 20,
        bz: (Math.random() - 0.5) * 20,
        total: Math.random() * 15 + 5
      },
      solarWind: {
        speed: Math.floor(Math.random() * 400) + 300,
        density: Math.random() * 10 + 5,
        temperature: Math.floor(Math.random() * 200000) + 50000
      },
      radiation: {
        level: Math.floor(Math.random() * 100) + 1,
        category: Math.random() > 0.8 ? 'elevated' : 'normal'
      },
      auroraForecast: {
        probability: Math.floor(Math.random() * 100),
        visibility: Math.random() > 0.7 ? 'high' : 'moderate',
        location: 'Northern regions'
      }
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(spaceWeatherData),
    };
  } catch (error) {
    console.error('Space Weather API Error:', error);
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