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
    const missions = [
      {
        id: 1,
        name: 'James Webb Space Telescope',
        agency: 'NASA/ESA/CSA',
        type: 'Observatory',
        status: 'Active',
        launchDate: '2021-12-25',
        description: 'The most powerful space telescope ever built, observing the universe in infrared light.',
        location: 'L2 Lagrange Point',
        crew: []
      },
      {
        id: 2,
        name: 'Perseverance Mars Mission',
        agency: 'NASA',
        type: 'Rover',
        status: 'Active',
        launchDate: '2020-07-30',
        description: 'Searching for signs of ancient life on Mars and collecting samples for future return.',
        location: 'Jezero Crater, Mars',
        crew: []
      },
      {
        id: 3,
        name: 'International Space Station',
        agency: 'NASA/Roscosmos/ESA/JAXA/CSA',
        type: 'Space Station',
        status: 'Active',
        launchDate: '1998-11-20',
        description: 'A multinational collaborative project serving as a microgravity research laboratory.',
        location: 'Low Earth Orbit',
        crew: ['Expedition 70 Crew']
      }
    ];
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(missions),
    };
  } catch (error) {
    console.error('Missions API Error:', error);
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