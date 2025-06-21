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
    const path = event.path;
    
    if (path.includes('/status')) {
      // Telescope status endpoint
      const telescopes = [
        {
          id: 1,
          name: 'Hubble Space Telescope',
          status: 'Active',
          currentTarget: 'NGC 3372 - Carina Nebula',
          nextObservation: new Date(Date.now() + 2 * 60 * 60 * 1000),
          location: 'Low Earth Orbit',
          instruments: ['WFC3', 'ACS', 'COS', 'STIS'],
          lastUpdate: new Date()
        },
        {
          id: 2,
          name: 'James Webb Space Telescope',
          status: 'Active',
          currentTarget: 'TRAPPIST-1 System',
          nextObservation: new Date(Date.now() + 4 * 60 * 60 * 1000),
          location: 'L2 Lagrange Point',
          instruments: ['NIRCam', 'NIRSpec', 'MIRI', 'FGS/NIRISS'],
          lastUpdate: new Date()
        },
        {
          id: 3,
          name: 'Chandra X-ray Observatory',
          status: 'Active',
          currentTarget: 'Sagittarius A* - Galactic Center',
          nextObservation: new Date(Date.now() + 6 * 60 * 60 * 1000),
          location: 'Elliptical Earth Orbit',
          instruments: ['ACIS', 'HRC'],
          lastUpdate: new Date()
        }
      ];
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(telescopes),
      };
    } else {
      // Telescope observations endpoint
      const observations = [
        {
          id: 1,
          telescopeName: 'Hubble Space Telescope',
          target: 'Orion Nebula',
          observationDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          imageUrl: 'https://science.nasa.gov/wp-content/uploads/2023/09/orion-nebula-by-hubble-and-spitzer.jpg',
          description: 'Multi-wavelength observation of the Orion star-forming region',
          instrument: 'WFC3',
          exposureTime: '1200 seconds',
          filters: ['F656N', 'F502N', 'F814W']
        },
        {
          id: 2,
          telescopeName: 'James Webb Space Telescope',
          target: 'NGC 7317-7320 - Stephan\'s Quintet',
          observationDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
          imageUrl: 'https://science.nasa.gov/wp-content/uploads/2023/09/stephans-quintet-sq-nircam-miri-composite-1.jpg',
          description: 'Infrared view of interacting galaxy group',
          instrument: 'NIRCam',
          exposureTime: '1000 seconds',
          filters: ['F200W', 'F300M', 'F335M']
        },
        {
          id: 3,
          telescopeName: 'Chandra X-ray Observatory',
          target: 'Cassiopeia A Supernova Remnant',
          observationDate: new Date(Date.now() - 72 * 60 * 60 * 1000),
          imageUrl: 'https://science.nasa.gov/wp-content/uploads/2023/09/cassiopeia-a-chandra.jpg',
          description: 'X-ray analysis of supernova shock waves and ejecta',
          instrument: 'ACIS-S',
          exposureTime: '50000 seconds',
          filters: ['0.5-7.0 keV']
        }
      ];
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(observations),
      };
    }
  } catch (error) {
    console.error('Telescope API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch telescope data',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};