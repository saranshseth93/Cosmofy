import { Handler } from '@netlify/functions';

async function fetchNOAASpaceWeather() {
  try {
    // Try to fetch from NOAA Space Weather APIs
    const [solarWindResponse, magneticFieldResponse] = await Promise.allSettled([
      fetch('https://services.swpc.noaa.gov/products/solar-wind/plasma-7-day.json'),
      fetch('https://services.swpc.noaa.gov/products/solar-wind/mag-7-day.json')
    ]);

    let solarWindData = null;
    let magneticFieldData = null;

    if (solarWindResponse.status === 'fulfilled' && solarWindResponse.value.ok) {
      const data = await solarWindResponse.value.json();
      solarWindData = data[data.length - 1]; // Get latest data
    }

    if (magneticFieldResponse.status === 'fulfilled' && magneticFieldResponse.value.ok) {
      const data = await magneticFieldResponse.value.json();
      magneticFieldData = data[data.length - 1]; // Get latest data
    }

    return { solarWindData, magneticFieldData };
  } catch (error) {
    console.error('NOAA API error:', error);
    return { solarWindData: null, magneticFieldData: null };
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
    const { solarWindData, magneticFieldData } = await fetchNOAASpaceWeather();
    
    if (!solarWindData && !magneticFieldData) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ 
          error: 'NOAA Space Weather API unavailable',
          message: 'Unable to fetch authentic space weather data from NOAA Space Weather Prediction Center. Please check API configuration.'
        }),
      };
    }

    const spaceWeatherData = {
      id: 1,
      timestamp: new Date(),
      solarFlux: solarWindData ? parseFloat(solarWindData[4]) || 0 : 0,
      kpIndex: 0,
      magneticField: {
        bx: magneticFieldData ? parseFloat(magneticFieldData[1]) : 0,
        by: magneticFieldData ? parseFloat(magneticFieldData[2]) : 0,
        bz: magneticFieldData ? parseFloat(magneticFieldData[3]) : 0,
        total: magneticFieldData ? parseFloat(magneticFieldData[4]) : 0
      },
      solarWind: {
        speed: solarWindData ? parseFloat(solarWindData[1]) : 0,
        density: solarWindData ? parseFloat(solarWindData[2]) : 0,
        temperature: solarWindData ? parseFloat(solarWindData[3]) * 1000 : 0
      },
      radiation: {
        level: 0,
        category: 'normal'
      },
      auroraForecast: {
        probability: 0,
        visibility: 'low',
        location: 'High northern latitudes only'
      },
      conditions: {
        solarActivity: 'Quiet',
        geomagneticActivity: 'Quiet',
        radiationLevel: 'Normal'
      }
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(spaceWeatherData),
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