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
    const events = [
      {
        id: 1,
        title: 'Total Solar Eclipse',
        type: 'Eclipse',
        date: new Date(now.getTime() + (45 * 24 * 60 * 60 * 1000)),
        description: 'A rare total solar eclipse visible from North America',
        location: 'North America',
        duration: '4 minutes 28 seconds',
        significance: 'The Moon completely blocks the Sun, creating a spectacular celestial event',
        imageUrl: 'https://science.nasa.gov/wp-content/uploads/2023/09/total-solar-eclipse.jpg',
        visibility: 'Totality visible from path of totality, partial eclipse from broader region'
      },
      {
        id: 2,
        title: 'Perseid Meteor Shower Peak',
        type: 'Meteor Shower',
        date: new Date(now.getTime() + (15 * 24 * 60 * 60 * 1000)),
        description: 'Annual meteor shower with up to 60 meteors per hour',
        location: 'Worldwide',
        duration: 'Peak night, active for weeks',
        significance: 'Debris from Comet Swift-Tuttle creates spectacular meteor displays',
        imageUrl: 'https://science.nasa.gov/wp-content/uploads/2023/09/perseid-meteor-shower.jpg',
        visibility: 'Best viewed from dark locations after midnight'
      },
      {
        id: 3,
        title: 'Jupiter Opposition',
        type: 'Planetary Alignment',
        date: new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)),
        description: 'Jupiter at its closest approach to Earth',
        location: 'Worldwide',
        duration: 'Several weeks of optimal viewing',
        significance: 'Jupiter appears largest and brightest in the sky',
        imageUrl: 'https://science.nasa.gov/wp-content/uploads/2023/09/jupiter-opposition.jpg',
        visibility: 'Visible all night, rising at sunset'
      }
    ];
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(events),
    };
  } catch (error) {
    console.error('Cosmic Events API Error:', error);
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