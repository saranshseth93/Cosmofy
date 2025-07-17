import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  try {
    // Curated authentic constellation data
    const constellations = [
      {
        id: 'orion',
        name: 'Orion',
        latinName: 'Orion',
        abbreviation: 'Ori',
        mythology: 'Greek hunter in mythology, known for his belt of three stars',
        brightestStar: 'Betelgeuse',
        magnitude: 0.5,
        visibility: 'Winter (Northern Hemisphere)',
        coordinates: { ra: '5h 55m', dec: '+20°' },
        area: 594,
        mainStars: ['Betelgeuse', 'Bellatrix', 'Mintaka', 'Alnilam', 'Alnitak'],
        image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400',
        hemisphere: 'Both',
        season: 'Winter',
        isVisible: true
      },
      {
        id: 'ursa-major',
        name: 'Ursa Major',
        latinName: 'Ursa Major',
        abbreviation: 'UMa',
        mythology: 'Great Bear constellation, contains the Big Dipper asterism',
        brightestStar: 'Alioth',
        magnitude: 1.8,
        visibility: 'Year-round (Northern Hemisphere)',
        coordinates: { ra: '10h 40m', dec: '+56°' },
        area: 1280,
        mainStars: ['Dubhe', 'Merak', 'Phecda', 'Megrez', 'Alioth', 'Mizar', 'Alkaid'],
        image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400',
        hemisphere: 'Northern',
        season: 'Spring',
        isVisible: true
      },
      {
        id: 'cassiopeia',
        name: 'Cassiopeia',
        latinName: 'Cassiopeia',
        abbreviation: 'Cas',
        mythology: 'Queen of Ethiopia in Greek mythology, shaped like a W',
        brightestStar: 'Schedar',
        magnitude: 2.2,
        visibility: 'Year-round (Northern Hemisphere)',
        coordinates: { ra: '1h 00m', dec: '+60°' },
        area: 598,
        mainStars: ['Schedar', 'Caph', 'Gamma Cas', 'Ruchbah', 'Segin'],
        image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400',
        hemisphere: 'Northern',
        season: 'Autumn',
        isVisible: true
      },
      {
        id: 'leo',
        name: 'Leo',
        latinName: 'Leo',
        abbreviation: 'Leo',
        mythology: 'Lion constellation, represents the Nemean Lion from Greek mythology',
        brightestStar: 'Regulus',
        magnitude: 1.4,
        visibility: 'Spring (Northern Hemisphere)',
        coordinates: { ra: '11h 00m', dec: '+20°' },
        area: 947,
        mainStars: ['Regulus', 'Denebola', 'Algieba', 'Zosma', 'Ras Elased'],
        image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400',
        hemisphere: 'Both',
        season: 'Spring',
        isVisible: true
      },
      {
        id: 'scorpius',
        name: 'Scorpius',
        latinName: 'Scorpius',
        abbreviation: 'Sco',
        mythology: 'Scorpion that killed Orion in Greek mythology',
        brightestStar: 'Antares',
        magnitude: 0.9,
        visibility: 'Summer (Northern Hemisphere)',
        coordinates: { ra: '16h 30m', dec: '-30°' },
        area: 497,
        mainStars: ['Antares', 'Shaula', 'Sargas', 'Dschubba', 'Larawag'],
        image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400',
        hemisphere: 'Southern',
        season: 'Summer',
        isVisible: false
      },
      {
        id: 'cygnus',
        name: 'Cygnus',
        latinName: 'Cygnus',
        abbreviation: 'Cyg',
        mythology: 'Swan constellation, represents Zeus transformed into a swan',
        brightestStar: 'Deneb',
        magnitude: 1.3,
        visibility: 'Summer (Northern Hemisphere)',
        coordinates: { ra: '20h 30m', dec: '+45°' },
        area: 804,
        mainStars: ['Deneb', 'Sadr', 'Albireo', 'Gienah', 'Delta Cyg'],
        image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400',
        hemisphere: 'Northern',
        season: 'Summer',
        isVisible: true
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
      body: JSON.stringify(constellations),
    };
  } catch (error) {
    console.error('Constellations API error:', error);
    return {
      statusCode: 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Constellation data temporarily unavailable',
        message: 'Unable to fetch constellation information'
      }),
    };
  }
};