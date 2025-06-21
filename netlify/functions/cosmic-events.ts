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
        error: 'Astronomical events API unavailable',
        message: 'Unable to fetch authentic cosmic event data from astronomical APIs. Please check API configuration.'
      }),
    };
  } catch (error) {
    console.error('Cosmic Events API Error:', error);
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ 
        error: 'Astronomical events API unavailable',
        message: 'Unable to fetch authentic cosmic event data from astronomical APIs.'
      }),
    };
  }
};