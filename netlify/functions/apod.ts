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
        error: "NASA APOD API unavailable", 
        message: "Unable to fetch authentic astronomy images from NASA API" 
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

    const response = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`
    );
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      throw new Error(`NASA API error: ${response.status}`);
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
    console.error('APOD API error:', error);
    return {
      statusCode: 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'NASA APOD API temporarily unavailable',
        message: 'Please check your NASA API key configuration or try again later'
      }),
    };
  }
};