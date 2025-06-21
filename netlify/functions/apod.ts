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
    // Only proceed if NASA API key is available for authentic data
    if (!NASA_API_KEY) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ 
          error: 'NASA API key required for authentic APOD data',
          message: 'Please configure NASA_API_KEY environment variable to access live NASA astronomy images'
        }),
      };
    }

    // Fetch authentic data from NASA APOD API
    const today = new Date().toISOString().split('T')[0];
    const endDate = today;
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const response = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&start_date=${startDate}&end_date=${endDate}`
    );
    
    if (!response.ok) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ 
          error: 'NASA APOD API unavailable',
          message: `NASA API returned status ${response.status}. Please try again later.`
        }),
      };
    }
    
    const nasaData = await response.json();
    const formattedData = Array.isArray(nasaData) ? nasaData : [nasaData];
    
    const apodImages = formattedData.map((item: any, index: number) => ({
      id: index + 1,
      date: item.date,
      title: item.title,
      explanation: item.explanation,
      url: item.url,
      hdurl: item.hdurl || item.url,
      mediaType: item.media_type,
      copyright: item.copyright || 'NASA',
      createdAt: new Date().toISOString()
    }));
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(apodImages),
    };
    
  } catch (error) {
    console.error('APOD API Error:', error);
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch authentic NASA APOD data',
        message: error instanceof Error ? error.message : 'NASA API service unavailable'
      }),
    };
  }
};