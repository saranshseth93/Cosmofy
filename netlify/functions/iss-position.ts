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
    // Generate realistic ISS position data
    const now = new Date();
    const baseLatitude = Math.sin(now.getTime() / 600000) * 51.6; // ISS orbital inclination
    const baseLongitude = ((now.getTime() / 92000) % 360) - 180; // ~92 minute orbit
    
    const issPosition = {
      id: 1,
      latitude: parseFloat(baseLatitude.toFixed(4)),
      longitude: parseFloat(baseLongitude.toFixed(4)),
      altitude: 408,
      velocity: 27600,
      timestamp: now,
      location: baseLongitude > -10 && baseLongitude < 50 && baseLatitude > 35 && baseLatitude < 70 ? 
        'Over Europe' : 
        baseLongitude > -130 && baseLongitude < -60 && baseLatitude > 25 && baseLatitude < 50 ?
        'Over North America' : 'Over Ocean'
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(issPosition),
    };
  } catch (error) {
    console.error('ISS Position API Error:', error);
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