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
        },
        {
          id: 3,
          name: 'Ingenuity',
          status: 'Active',
          landingDate: '2021-02-18',
          location: 'Jezero Crater (Airfield)',
          sol: 1000 + Math.floor((Date.now() - new Date('2021-02-18').getTime()) / (24 * 60 * 60 * 1000)),
          totalPhotos: 5000,
          missionObjective: 'Demonstrate powered flight on Mars',
          instruments: ['Navigation Camera', 'Color Camera'],
          currentActivity: 'Aerial reconnaissance missions',
          lastCommunication: new Date(Date.now() - 3 * 60 * 60 * 1000),
          flights: 70,
          flightTime: '125 minutes total'
        }
      ];
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(rovers),
      };
    } else {
      // Mars photos endpoint
      let photos = [];
      
      if (NASA_API_KEY) {
        try {
          const sol = Math.floor(Math.random() * 100) + 3000; // Recent sol
          const rover = 'perseverance';
          const response = await fetch(
            `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${sol}&api_key=${NASA_API_KEY}`
          );
          
          if (response.ok) {
            const data = await response.json();
            photos = data.photos.slice(0, 20).map((photo: any, index: number) => ({
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
          console.log('NASA Mars API unavailable, using curated data');
        }
      }
      
      // Fallback to curated Mars photos
      photos = [] as any[];
      photos.push(
        {
          id: 1,
          sol: 3045,
          img_src: 'https://mars.nasa.gov/mars2020-raw-images/pub/ods/surface/sol/00687/ids/edr/browse/zcam/ZR0_0687_0698117626_796ECM_N0260000ZCAM08049_063085J01.jpg',
          earth_date: '2024-12-15',
          camera: { name: 'ZCAM', full_name: 'Zoom Camera' },
          rover: { name: 'Perseverance', status: 'active', landing_date: '2021-02-18' }
        },
        {
          id: 2,
          sol: 3044,
          img_src: 'https://mars.nasa.gov/mars2020-raw-images/pub/ods/surface/sol/00686/ids/edr/browse/fcam/FLF_0686_0698031227_882ECM_N0260000FHAZ00337_0630LUJ01.jpg',
          earth_date: '2024-12-14',
          camera: { name: 'FHAZ', full_name: 'Front Hazard Avoidance Camera' },
          rover: { name: 'Perseverance', status: 'active', landing_date: '2021-02-18' }
        }
      ];
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(photos),
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