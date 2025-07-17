import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  const timeout = setTimeout(() => {
    return {
      statusCode: 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: "ISS position API unavailable", 
        message: "Unable to fetch current ISS position from NASA API" 
      }),
    };
  }, 10000);
  
  try {
    const response = await fetch('http://api.open-notify.org/iss-now.json');
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      throw new Error(`ISS API error: ${response.status}`);
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
    console.error('ISS Position API error:', error);
    return {
      statusCode: 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'ISS position API temporarily unavailable',
        message: 'Unable to fetch current ISS position'
      }),
    };
  }
};