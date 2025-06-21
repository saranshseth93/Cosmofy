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
    const limit = event.queryStringParameters?.limit || '10';
    const offset = event.queryStringParameters?.offset || '0';
    const mode = event.queryStringParameters?.mode || 'detailed';
    
    // Fetch from Launch Library API v2 (public API)
    const apiUrl = `https://ll.thespacedevs.com/2.2.0/launch/?limit=${limit}&offset=${offset}&mode=${mode}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ 
          error: 'Launch Library API unavailable',
          message: `API returned status ${response.status}. Please try again later.`
        }),
      };
    }
    
    const data = await response.json();
    
    // Return exact Launch Library API format - sorted by launch date
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
    
  } catch (error) {
    console.error('Missions API Error:', error);
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch authentic mission data',
        message: error instanceof Error ? error.message : 'Launch Library API service unavailable'
      }),
    };
  }
};