import { Handler } from '@netlify/functions';

async function getCityFromCoordinates(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    
    if (response.ok) {
      const data = await response.json();
      const city = data.city || data.locality || data.principalSubdivision;
      const country = data.countryName;
      
      if (city && country) {
        return `Over ${city}, ${country}`;
      } else if (country) {
        return `Over ${country}`;
      }
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  
  return 'Over Ocean';
}

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
    const issResponse = await fetch('http://api.open-notify.org/iss-now.json');
    
    if (!issResponse.ok) {
      throw new Error('ISS API unavailable');
    }
    
    const issData = await issResponse.json();
    
    // Return exact NASA API format with added location data
    const latitude = parseFloat(issData.iss_position.latitude);
    const longitude = parseFloat(issData.iss_position.longitude);
    const location = await getCityFromCoordinates(latitude, longitude);
    
    const response = {
      ...issData,
      iss_position: {
        ...issData.iss_position,
        latitude: latitude.toString(),
        longitude: longitude.toString()
      },
      location
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('ISS Position API Error:', error);
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ 
        error: 'ISS tracking API unavailable',
        message: 'Unable to fetch authentic ISS position data from NASA Open Notify API'
      }),
    };
  }
};