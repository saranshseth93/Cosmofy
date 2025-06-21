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
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ 
        error: 'Geolocation service unavailable',
        message: 'Unable to fetch authentic location data from geolocation APIs. Please check API configuration.'
      }),
    };
  } catch (error) {
    console.error('Location API Error:', error);
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ 
        error: 'Geolocation service unavailable',
        message: 'Unable to fetch authentic location data from geolocation APIs.'
      }),
    };
  }
};