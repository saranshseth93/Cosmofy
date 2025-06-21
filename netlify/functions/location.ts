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
    const lat = parseFloat(event.queryStringParameters?.lat || '');
    const lon = parseFloat(event.queryStringParameters?.lon || '');
    
    if (isNaN(lat) || isNaN(lon)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid coordinates',
          message: 'Please provide valid latitude and longitude parameters'
        }),
      };
    }

    // Use BigDataCloud reverse geocoding API (free, no API key required)
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    
    if (!response.ok) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ 
          error: 'Geolocation service unavailable',
          message: 'Unable to fetch location data from reverse geocoding service'
        }),
      };
    }
    
    const locationData = await response.json();
    
    // Extract suburb/locality information with priority order
    const suburb = locationData.locality || locationData.city || locationData.principalSubdivision;
    const city = locationData.city || locationData.principalSubdivision;
    const country = locationData.countryName;
    
    const formattedLocation = {
      latitude: lat,
      longitude: lon,
      suburb: suburb || 'Unknown area',
      city: city || 'Unknown city',
      country: country || 'Unknown country',
      display: suburb ? `${suburb}, ${country}` : (city ? `${city}, ${country}` : country || 'Unknown location'),
      timezone: locationData.timezone || 'UTC'
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(formattedLocation),
    };
    
  } catch (error) {
    console.error('Location API Error:', error);
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ 
        error: 'Geolocation service error',
        message: error instanceof Error ? error.message : 'Failed to fetch location data'
      }),
    };
  }
};