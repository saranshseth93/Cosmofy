import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  try {
    // Fetch space weather data from NOAA
    const response = await fetch('https://services.swpc.noaa.gov/json/ovation_aurora_latest.json');
    
    if (!response.ok) {
      throw new Error(`NOAA Space Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Space Weather API error:', error);
    return {
      statusCode: 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Space weather data temporarily unavailable',
        message: 'Unable to fetch current space weather conditions'
      }),
    };
  }
};