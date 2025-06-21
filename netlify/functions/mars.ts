import { Handler } from '@netlify/functions';

const NASA_API_KEY = process.env.NASA_API_KEY || '';

export const handler: Handler = async (event, context): Promise<any> => {
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
    const path = event.path;
    
    if (path.includes('/rovers')) {
      // Mars rovers status - requires authentic NASA mission data
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ 
          error: 'NASA Mars rover API unavailable',
          message: 'Unable to fetch authentic Mars rover status from NASA APIs. Please check API configuration.'
        }),
      };
    } else {
      // Mars photos endpoint - requires NASA API key for authentic data
      if (!NASA_API_KEY) {
        return {
          statusCode: 503,
          headers,
          body: JSON.stringify({ 
            error: 'NASA API key required for authentic Mars rover photos',
            message: 'Please configure NASA_API_KEY environment variable to access live Mars rover images'
          }),
        };
      }

      // Parse query parameters for exact API replication
      const sol = event.queryStringParameters?.sol || '3900';
      const rover = event.queryStringParameters?.rover || 'perseverance';
      const camera = event.queryStringParameters?.camera || '';
      const page = event.queryStringParameters?.page || '1';
      
      // Build exact NASA Mars Photo API URL
      let apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${sol}&api_key=${NASA_API_KEY}`;
      if (camera) {
        apiUrl += `&camera=${camera}`;
      }
      if (page !== '1') {
        apiUrl += `&page=${page}`;
      }
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        return {
          statusCode: 503,
          headers,
          body: JSON.stringify({ 
            error: 'NASA Mars Photo API unavailable',
            message: `NASA API returned status ${response.status}. Please try again later.`
          }),
        };
      }
      
      const data = await response.json();
      
      // Return exact NASA API format
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data),
      };
    }
  } catch (error) {
    console.error('Mars API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch Mars data',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};