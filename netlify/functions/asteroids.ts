import { Handler } from '@netlify/functions';

const NASA_API_KEY = process.env.NASA_API_KEY || process.env.VITE_NASA_API_KEY || "";

export const handler: Handler = async (event, context) => {
  const timeout = setTimeout(() => {
    return {
      statusCode: 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: "NASA asteroid API unavailable", 
        message: "Unable to fetch authentic asteroid data from NASA API" 
      }),
    };
  }, 10000);
  
  try {
    if (!NASA_API_KEY) {
      clearTimeout(timeout);
      return {
        statusCode: 503,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: "NASA API key not configured",
          message: "Please configure NASA_API_KEY environment variable"
        }),
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const response = await fetch(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${nextWeek}&api_key=${NASA_API_KEY}`
    );
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      throw new Error(`NASA NEO API error: ${response.status}`);
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
    clearTimeout(timeout);
    console.error('Asteroids API error:', error);
    return {
      statusCode: 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'NASA asteroid data temporarily unavailable',
        message: 'Please check your NASA API key configuration or try again later'
      }),
    };
  }
};