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
    const tithiNames = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'];
    const nakshatraNames = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
    const yogaNames = ['Vishkumbha', 'Preeti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'];
    const karanaNames = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'];

    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    const panchang = {
      date: now.toISOString().split('T')[0],
      location: {
        city: 'Melbourne',
        country: 'Australia',
        latitude: -37.8136,
        longitude: 144.9631
      },
      tithi: {
        name: tithiNames[dayOfYear % tithiNames.length],
        deity: 'Brahma',
        significance: 'Auspicious for new beginnings',
        nextTithi: tithiNames[(dayOfYear + 1) % tithiNames.length],
        endTime: '14:32'
      },
      nakshatra: {
        name: nakshatraNames[dayOfYear % nakshatraNames.length],
        deity: 'Ashwini Kumaras',
        meaning: 'Horse woman',
        nextNakshatra: nakshatraNames[(dayOfYear + 1) % nakshatraNames.length],
        endTime: '18:45'
      },
      yoga: {
        name: yogaNames[dayOfYear % yogaNames.length],
        meaning: 'Good fortune',
        nextYoga: yogaNames[(dayOfYear + 1) % yogaNames.length],
        endTime: '11:20'
      },
      karana: {
        name: karanaNames[dayOfYear % karanaNames.length],
        meaning: 'Fixed',
        nextKarana: karanaNames[(dayOfYear + 1) % karanaNames.length],
        endTime: '02:15'
      },
      sunData: {
        sunrise: '06:15',
        sunset: '18:30',
        direction: 'East to West'
      },
      moonData: {
        moonrise: '22:45',
        moonset: '08:30',
        rashi: 'Mesha',
        element: 'Fire',
        lord: 'Mars'
      },
      auspiciousTimes: [
        { name: 'Brahma Muhurta', time: '04:30 - 05:15', description: 'Best time for meditation and spiritual practices' },
        { name: 'Abhijit Muhurta', time: '11:45 - 12:30', description: 'Victory time, good for important tasks' }
      ],
      inauspiciousTimes: [
        { name: 'Rahu Kaal', time: '09:00 - 10:30', description: 'Avoid starting new ventures' },
        { name: 'Gulika Kaal', time: '15:00 - 16:30', description: 'Time ruled by Saturn, avoid important work' },
        { name: 'Yama Ganda', time: '07:30 - 09:00', description: 'Death period, avoid travel' }
      ],
      festivals: ['Makar Sankranti preparations'],
      vrats: ['Ekadashi Vrat', 'Pradosh Vrat']
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(panchang),
    };
  } catch (error) {
    console.error('Panchang API Error:', error);
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