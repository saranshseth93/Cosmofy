import { Handler } from '@netlify/functions';

async function fetchNOAASpaceWeather() {
  try {
    // Fetch multiple NOAA endpoints to match exact API structure
    const [
      solarWindResponse,
      magneticFieldResponse,
      kpIndexResponse,
      solarFluxResponse
    ] = await Promise.allSettled([
      fetch('https://services.swpc.noaa.gov/products/solar-wind/plasma-7-day.json'),
      fetch('https://services.swpc.noaa.gov/products/solar-wind/mag-7-day.json'),
      fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json'),
      fetch('https://services.swpc.noaa.gov/products/solar-wind/plasma-7-day.json')
    ]);

    let solarWindData = null;
    let magneticFieldData = null;
    let kpIndexData = null;

    if (solarWindResponse.status === 'fulfilled' && solarWindResponse.value.ok) {
      const data = await solarWindResponse.value.json();
      solarWindData = data.slice(-24); // Last 24 hours, sorted chronologically
    }

    if (magneticFieldResponse.status === 'fulfilled' && magneticFieldResponse.value.ok) {
      const data = await magneticFieldResponse.value.json();
      magneticFieldData = data.slice(-24); // Last 24 hours, sorted chronologically
    }

    if (kpIndexResponse.status === 'fulfilled' && kpIndexResponse.value.ok) {
      const data = await kpIndexResponse.value.json();
      kpIndexData = data.slice(-8); // Last 8 readings, sorted chronologically
    }

    return { solarWindData, magneticFieldData, kpIndexData };
  } catch (error) {
    console.error('NOAA API error:', error);
    return { solarWindData: null, magneticFieldData: null, kpIndexData: null };
  }
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
    const { solarWindData, magneticFieldData, kpIndexData } = await fetchNOAASpaceWeather();
    
    if (!solarWindData && !magneticFieldData && !kpIndexData) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ 
          error: 'NOAA Space Weather API unavailable',
          message: 'Unable to fetch authentic space weather data from NOAA Space Weather Prediction Center. Please check API configuration.'
        }),
      };
    }

    // Return exact NOAA API format - arrays sorted chronologically
    const spaceWeatherResponse = {
      solar_wind: solarWindData || [],
      magnetic_field: magneticFieldData || [],
      kp_index: kpIndexData || [],
      timestamp: new Date().toISOString()
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(spaceWeatherResponse),
    };
  } catch (error) {
    console.error('Space Weather API Error:', error);
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ 
        error: 'NOAA Space Weather API unavailable',
        message: 'Unable to fetch authentic space weather data from NOAA Space Weather Prediction Center.'
      }),
    };
  }
};