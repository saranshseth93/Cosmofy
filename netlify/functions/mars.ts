import { Handler } from '@netlify/functions';

const NASA_API_KEY = process.env.NASA_API_KEY || '';

export const handler: Handler = async (event, context): Promise<any> => {
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
    const path = event.path;
    
    if (path.includes('/rovers')) {
      // Mars rovers status endpoint
      const rovers = [
        {
          id: 1,
          name: 'Perseverance',
          status: 'Active',
          landingDate: '2021-02-18',
          location: 'Jezero Crater',
          sol: 1000 + Math.floor((Date.now() - new Date('2021-02-18').getTime()) / (24 * 60 * 60 * 1000)),
          totalPhotos: 250000,
          missionObjective: 'Search for signs of ancient microbial life and collect samples',
          instruments: ['MOXIE', 'RIMFAX', 'PIXL', 'SHERLOC', 'SUPERCAM', 'Mastcam-Z'],
          currentActivity: 'Sample collection and analysis',
          lastCommunication: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: 2,
          name: 'Curiosity',
          status: 'Active',
          landingDate: '2012-08-05',
          location: 'Gale Crater',
          sol: 4000 + Math.floor((Date.now() - new Date('2012-08-05').getTime()) / (24 * 60 * 60 * 1000)),
          totalPhotos: 500000,
          missionObjective: 'Assess past and present habitability conditions',
          instruments: ['ChemCam', 'MAHLI', 'APXS', 'SAM', 'CheMin', 'MARDI'],
          currentActivity: 'Geological survey and rock analysis',
          lastCommunication: new Date(Date.now() - 1 * 60 * 60 * 1000)
        }
      ];
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(rovers),
      };
    } else {
      // Mars photos endpoint - requires NASA API key for authentic data
      if (NASA_API_KEY) {
        try {
          const sol = Math.floor(Math.random() * 100) + 3000;
          const rover = 'perseverance';
          const response = await fetch(
            `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${sol}&api_key=${NASA_API_KEY}`
          );
          
          if (response.ok) {
            const data = await response.json();
            const photos = data.photos.slice(0, 20).map((photo: any, index: number) => ({
              id: index + 1,
              sol: photo.sol,
              img_src: photo.img_src,
              earth_date: photo.earth_date,
              camera: {
                name: photo.camera.name,
                full_name: photo.camera.full_name
              },
              rover: {
                name: photo.rover.name,
                status: photo.rover.status,
                landing_date: photo.rover.landing_date
              }
            }));
            
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify(photos),
            };
          }
        } catch (apiError) {
          console.error('NASA Mars API error:', apiError);
        }
      }
      
      // Return error when no API key is available for authentic data
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ 
          error: 'NASA API key required for authentic Mars rover photos',
          message: 'Please provide NASA_API_KEY environment variable'
        }),
      };
    }
  } catch (error) {
    console.error('Mars API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch Mars data',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};