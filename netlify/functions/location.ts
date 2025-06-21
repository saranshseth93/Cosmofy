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
    // Return default location data for Netlify deployment
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
  } catch (error) {
    console.error('Location API Error:', error);
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