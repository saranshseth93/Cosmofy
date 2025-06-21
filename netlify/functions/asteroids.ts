import { Handler } from '@netlify/functions';

const NASA_API_KEY = process.env.NASA_API_KEY || '';

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
    if (!NASA_API_KEY) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ 
          error: 'NASA API key required for authentic asteroid data',
          message: 'Please configure NASA_API_KEY environment variable to access live NASA Near-Earth Object data'
        }),
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const response = await fetch(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${nextWeek}&api_key=${NASA_API_KEY}`
    );
    
    if (!response.ok) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ 
          error: 'NASA NEO API unavailable',
          message: `NASA API returned status ${response.status}. Please try again later.`
        }),
      };
    }
    
    const neoData = await response.json();
    
    // Extract and sort asteroids by close approach date (ascending)
    const asteroids: any[] = [];
    Object.values(neoData.near_earth_objects).forEach((dateAsteroids: any) => {
      asteroids.push(...dateAsteroids);
    });
    
    // Sort by closest approach date, then by miss distance
    const sortedAsteroids = asteroids.sort((a, b) => {
      const dateA = new Date(a.close_approach_data[0].close_approach_date_full).getTime();
      const dateB = new Date(b.close_approach_data[0].close_approach_date_full).getTime();
      if (dateA !== dateB) return dateA - dateB;
      
      const distA = parseFloat(a.close_approach_data[0].miss_distance.kilometers);
      const distB = parseFloat(b.close_approach_data[0].miss_distance.kilometers);
      return distA - distB;
    });
    
    // Return exact NASA API format
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        links: neoData.links,
        element_count: neoData.element_count,
        near_earth_objects: sortedAsteroids
      }),
    };
    
  } catch (error) {
    console.error('Asteroids API Error:', error);
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch authentic NASA asteroid data',
        message: error instanceof Error ? error.message : 'NASA NEO API service unavailable'
      }),
    };
  }
};