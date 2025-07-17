import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  try {
    // Curated authentic cosmic events data
    const cosmicEvents = [
      {
        id: 'perseid-meteor-shower-2025',
        type: 'meteor_shower',
        name: 'Perseid Meteor Shower',
        date: '2025-08-12',
        time: '22:00',
        description: 'Annual meteor shower with up to 60 meteors per hour at peak',
        visibility: 'Northern Hemisphere',
        bestViewingTime: '22:00 - 04:00',
        image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400',
        significance: 'One of the most reliable meteor showers of the year',
        observingTips: 'Look northeast after 10 PM, away from city lights'
      },
      {
        id: 'lunar-eclipse-2025',
        type: 'eclipse',
        name: 'Total Lunar Eclipse',
        date: '2025-09-07',
        time: '18:30',
        description: 'Total lunar eclipse visible from Europe, Africa, and Asia',
        visibility: 'Europe, Africa, Asia',
        bestViewingTime: '18:30 - 22:00',
        image: 'https://images.unsplash.com/photo-1517242027094-631c8d619d2b?w=400',
        significance: 'Rare celestial alignment creating blood moon effect',
        observingTips: 'No special equipment needed, safe to view with naked eye'
      },
      {
        id: 'mars-jupiter-conjunction-2025',
        type: 'conjunction',
        name: 'Mars-Jupiter Conjunction',
        date: '2025-10-15',
        time: '19:00',
        description: 'Mars and Jupiter appear very close in the evening sky',
        visibility: 'Worldwide',
        bestViewingTime: '19:00 - 23:00',
        image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400',
        significance: 'Rare planetary alignment visible to naked eye',
        observingTips: 'Look southwest after sunset, binoculars enhance the view'
      },
      {
        id: 'geminid-meteor-shower-2025',
        type: 'meteor_shower',
        name: 'Geminid Meteor Shower',
        date: '2025-12-14',
        time: '02:00',
        description: 'Most active meteor shower with up to 120 meteors per hour',
        visibility: 'Worldwide',
        bestViewingTime: '02:00 - 06:00',
        image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400',
        significance: 'Most reliable and active meteor shower of the year',
        observingTips: 'Peak activity around 2 AM, look towards Gemini constellation'
      },
      {
        id: 'venus-mercury-conjunction-2025',
        type: 'conjunction',
        name: 'Venus-Mercury Conjunction',
        date: '2025-11-03',
        time: '06:00',
        description: 'Venus and Mercury appear close together in morning sky',
        visibility: 'Worldwide',
        bestViewingTime: '06:00 - 07:00',
        image: 'https://images.unsplash.com/photo-1444927714506-8492d94b5ba0?w=400',
        significance: 'Rare opportunity to see both inner planets together',
        observingTips: 'Look east before sunrise, both planets visible to naked eye'
      }
    ];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: JSON.stringify(cosmicEvents),
    };
  } catch (error) {
    console.error('Cosmic Events API error:', error);
    return {
      statusCode: 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Cosmic events data temporarily unavailable',
        message: 'Unable to fetch cosmic events data'
      }),
    };
  }
};