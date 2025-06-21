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
    // Parse query parameters for exact API replication
    const url = new URL(event.path || '/', 'https://example.com');
    const limit = event.queryStringParameters?.limit || '20';
    const offset = event.queryStringParameters?.offset || '0';
    const search = event.queryStringParameters?.search || '';
    
    // Build exact Spaceflight News API v4 URL
    let apiUrl = `https://api.spaceflightnewsapi.net/v4/articles?limit=${limit}&offset=${offset}`;
    if (search) {
      apiUrl += `&search=${encodeURIComponent(search)}`;
    }
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ 
          error: 'Spaceflight News API unavailable',
          message: `API returned status ${response.status}. Please try again later.`
        }),
      };
    }
    
    const data = await response.json();
    
    // Return exact API format - already sorted by published_at descending
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Space News API Error:', error);
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch authentic space news',
        message: error instanceof Error ? error.message : 'Spaceflight News API service unavailable'
      }),
    };
  }
};