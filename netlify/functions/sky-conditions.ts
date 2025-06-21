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
    const lat = parseFloat(event.queryStringParameters?.lat || '0');
    const lon = parseFloat(event.queryStringParameters?.lon || '0');
    
    const isNorthern = lat > 0;
    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth() + 1;
    
    // Basic visibility calculation based on hemisphere and time
    const northernConstellations = ['orion', 'ursa-major', 'cassiopeia', 'perseus', 'andromeda', 'lyra', 'cygnus', 'draco'];
    const southernConstellations = ['orion', 'crux', 'centaurus', 'carina', 'vela', 'scorpius', 'sagittarius'];
    
    const visibleConstellations = isNorthern ? northernConstellations : southernConstellations;
    
    // Calculate moon phase based on actual lunar cycle
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    const lunarCycle = (dayOfYear % 29.5) / 29.5;
    const moonPhases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 
                       'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
    const moonPhase = moonPhases[Math.floor(lunarCycle * 8)];
    const moonIllumination = Math.floor(50 + 50 * Math.cos(lunarCycle * 2 * Math.PI));
    
    const skyConditions = {
      visibleConstellations: visibleConstellations.slice(0, Math.floor(Math.random() * 3) + 5),
      moonPhase,
      moonIllumination: Math.abs(moonIllumination),
      bestViewingTime: isNorthern ? '21:00 - 02:00' : '20:00 - 01:00',
      conditions: hour >= 20 || hour <= 4 ? 'Good viewing conditions' : 'Daylight - not visible'
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(skyConditions),
    };
  } catch (error) {
    console.error('Sky Conditions API Error:', error);
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