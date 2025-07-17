import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  try {
    const response = await fetch('https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=10');
    
    if (!response.ok) {
      throw new Error(`Launch Library API error: ${response.status}`);
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
    console.error('Rocket Launches API error:', error);
    return {
      statusCode: 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Rocket launches data temporarily unavailable',
        message: 'Unable to fetch launch data from Launch Library API'
      }),
    };
  }
};