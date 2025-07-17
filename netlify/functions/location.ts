import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  try {
    const { queryStringParameters } = event;
    const lat = queryStringParameters?.lat || '-37.8136';
    const lng = queryStringParameters?.lng || '144.9631';
    
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    
    if (!response.ok) {
      throw new Error(`BigDataCloud API error: ${response.status}`);
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
    console.error('Location API error:', error);
    return {
      statusCode: 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Location service temporarily unavailable',
        message: 'Unable to fetch location data'
      }),
    };
  }
};