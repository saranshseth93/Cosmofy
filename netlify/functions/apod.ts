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
    // Sample APOD data for deployment
    const apodData = [
      {
        id: 1,
        date: '2024-12-21',
        title: 'Orion Nebula in Infrared',
        explanation: 'The Orion Nebula is a stellar nursery where new stars are born, located about 1,340 light-years from Earth.',
        url: 'https://science.nasa.gov/wp-content/uploads/2023/09/orion-nebula-by-hubble-and-spitzer.jpg',
        hdurl: 'https://science.nasa.gov/wp-content/uploads/2023/09/orion-nebula-by-hubble-and-spitzer.jpg',
        mediaType: 'image',
        copyright: 'NASA/ESA',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        date: '2024-12-20',
        title: 'Andromeda Galaxy',
        explanation: 'The Andromeda Galaxy is the nearest major galaxy to the Milky Way and is approaching us at about 250,000 mph.',
        url: 'https://science.nasa.gov/wp-content/uploads/2023/09/andromeda-galaxy-with-h-alpha.jpg',
        hdurl: 'https://science.nasa.gov/wp-content/uploads/2023/09/andromeda-galaxy-with-h-alpha.jpg',
        mediaType: 'image',
        copyright: 'NASA/ESA',
        createdAt: new Date().toISOString()
      }
    ];
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(apodData),
    };
  } catch (error) {
    console.error('APOD API Error:', error);
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