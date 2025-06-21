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
    const now = new Date();
    const asteroids = [
      {
        id: 1,
        name: '2024 YZ1',
        estimatedDiameter: 150,
        closeApproachDate: new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)),
        missDistance: 0.024,
        relativeVelocity: 28.5,
        isPotentiallyHazardous: false,
        magnitude: 22.8
      },
      {
        id: 2, 
        name: '2024 XW3',
        estimatedDiameter: 280,
        closeApproachDate: new Date(now.getTime() + (12 * 24 * 60 * 60 * 1000)),
        missDistance: 0.047,
        relativeVelocity: 19.2,
        isPotentiallyHazardous: false,
        magnitude: 21.3
      },
      {
        id: 3,
        name: 'Apophis',
        estimatedDiameter: 370,
        closeApproachDate: new Date(now.getTime() + (45 * 24 * 60 * 60 * 1000)),
        missDistance: 0.098,
        relativeVelocity: 30.7,
        isPotentiallyHazardous: true,
        magnitude: 19.7
      }
    ];
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(asteroids),
    };
  } catch (error) {
    console.error('Asteroids API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};