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
    const forecasts = [];
    
    for (let i = 0; i < 8; i++) {
      const forecastTime = new Date(now.getTime() + (i * 3 * 60 * 60 * 1000)); // 3-hour intervals
      const kpIndex = Math.floor(Math.random() * 9);
      
      forecasts.push({
        id: i + 1,
        timestamp: forecastTime,
        kpIndex,
        geomagneticActivity: kpIndex < 3 ? 'Quiet' : kpIndex < 5 ? 'Unsettled' : kpIndex < 7 ? 'Active' : 'Storm',
        auroraVisibility: {
          high: kpIndex >= 6,
          moderate: kpIndex >= 4,
          low: kpIndex >= 2
        },
        regions: kpIndex >= 6 ? ['Northern Canada', 'Alaska', 'Northern Scandinavia', 'Northern Russia'] :
                kpIndex >= 4 ? ['Southern Canada', 'Northern US States', 'Scotland', 'Northern Germany'] :
                ['Arctic Circle regions only'],
        probability: Math.min(95, kpIndex * 12),
        conditions: {
          cloudCover: Math.floor(Math.random() * 100),
          moonPhase: 'Waning Crescent',
          moonIllumination: 23,
          optimalViewing: kpIndex >= 4 && Math.random() > 0.5
        }
      });
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(forecasts),
    };
  } catch (error) {
    console.error('Aurora API Error:', error);
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