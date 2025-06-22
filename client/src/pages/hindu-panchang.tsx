import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, Sun, Moon, Star, Sunrise, Sunset, Timer, Compass } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/navigation';
import { CosmicCursor } from '@/components/cosmic-cursor';
import { Footer } from '@/components/footer';

// Animated Hindu Background Component
const DivineBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div 
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(-45deg, #4A1A3A, #B91C1C, #EA580C, #F97316, #D97706, #7C2D12)',
        backgroundSize: '400% 400%',
        animation: 'hinduGradientWave 15s ease infinite'
      }}
    />
    
    <style dangerouslySetInnerHTML={{
      __html: `
        @keyframes hinduGradientWave {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `
    }} />
  </div>
);

interface LocationData {
  latitude: number;
  longitude: number;
  timezone: string;
  city: string;
}

interface PanchangApiResponse {
  success: boolean;
  data: {
    date: string;
    location: string;
    weekday: string;
    tithi: {
      name: string;
      endTime: string;
      nextTithi: string;
      paksha?: string;
    };
    nakshatra: {
      name: string;
      endTime: string;
      nextNakshatra: string;
      lord?: string;
      deity?: string;
    };
    yoga: {
      name: string;
      endTime: string;
      nextYoga: string;
      meaning?: string;
    };
    karana: {
      name: string;
      endTime: string;
      nextKarana: string;
      extraKarana?: {
        name: string;
        endTime: string;
      };
    };
    timings: {
      sunrise: string;
      sunset: string;
      moonrise?: string;
      moonset?: string;
      solarNoon?: string;
      dayLength?: string;
      nightLength?: string;
    };
    moonData: {
      rashi: string;
      rashiLord?: string;
      element?: string;
      phase?: string;
      illumination?: string;
    };
    auspiciousTimes: {
      abhijitMuhurat?: string;
      amritKaal?: string;
      brahmaMuhurat?: string;
    };
    inauspiciousTimes: {
      rahuKaal?: string;
      yamaGandaKaal?: string;
      gulikaKaal?: string;
      durMuhurat?: string;
    };
    masa: {
      name?: string;
      paksha?: string;
      ayana?: string;
      ritu?: string;
    };
    festivals: string[];
    vrats: string[];
    doshaIntervals: Array<{
      startTime: string;
      endTime: string;
      doshas: string[];
      description: string;
      severity: 'normal' | 'caution' | 'avoid';
    }>;
  };
}

export default function HinduPanchang() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Get user's precise location using browser geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Get location details from our API
            const response = await fetch(`/api/location?lat=${latitude}&lon=${longitude}`);
            const locationData = await response.json();
            setLocation(locationData);
          } catch (error) {
            console.error('Location API error:', error);
            setLocationError('Unable to determine location');
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError('Location access denied');
          
          // Fallback to default location API
          fetch('/api/location')
            .then(res => res.json())
            .then(data => setLocation(data))
            .catch(() => setLocationError('Location services unavailable'));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } else {
      setLocationError('Geolocation not supported');
      
      // Fallback to default location API
      fetch('/api/location')
        .then(res => res.json())
        .then(data => setLocation(data))
        .catch(() => setLocationError('Location services unavailable'));
    }
  }, []);

  // Fetch authentic Panchang data using astronomical calculations
  const { data: panchangResponse, isLoading, error } = useQuery<PanchangApiResponse>({
    queryKey: ['/api/panchang', currentDate, location?.latitude, location?.longitude, location?.city],
    enabled: !!location,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const panchangData = panchangResponse?.data;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'avoid': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'caution': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-green-500/20 text-green-300 border-green-500/30';
    }
  };

  const formatTime = (time: string) => {
    if (!time || time === '00:00') return 'Not available';
    return time;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <DivineBackground />
        <CosmicCursor />
        <Navigation />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <Card className="bg-black/80 border-orange-500/30 backdrop-blur-sm max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-orange-400">Panchang Data Unavailable</CardTitle>
              <CardDescription className="text-orange-200">
                Unable to fetch authentic Panchang data from Drik Panchang. Please check your connection or try again later.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <DivineBackground />
      <CosmicCursor />
      <Navigation />
      
      <div className="relative z-10 min-h-screen">
        {/* Header Section */}
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 bg-clip-text text-transparent">
                Hindu Panchang
              </span>
            </h1>
            <p className="text-lg text-orange-200 max-w-3xl mx-auto leading-relaxed">
              Experience authentic Vedic calendar data extracted directly from Drik Panchang. 
              Discover the sacred timekeeping system that guides auspicious activities and spiritual practices.
            </p>
          </div>

          {/* Location and Date */}
          {location ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full border border-orange-500/30">
                <MapPin className="h-4 w-4 text-orange-400" />
                <span className="text-orange-200">{location.city}</span>
              </div>
              <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full border border-orange-500/30">
                <Calendar className="h-4 w-4 text-orange-400" />
                <span className="text-orange-200">
                  {new Date(currentDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              {panchangData?.weekday && (
                <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full border border-orange-500/30">
                  <Star className="h-4 w-4 text-orange-400" />
                  <span className="text-orange-200">{panchangData.weekday}</span>
                </div>
              )}
            </div>
          ) : locationError ? (
            <div className="text-center mb-8">
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-4 py-3 max-w-md mx-auto">
                <p className="text-yellow-200 text-sm">{locationError}</p>
                <p className="text-yellow-300 text-xs mt-1">Using default location for Panchang calculations</p>
              </div>
            </div>
          ) : (
            <div className="text-center mb-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-400"></div>
              <p className="mt-2 text-orange-200">Detecting your location...</p>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
              <p className="mt-4 text-orange-200">Loading authentic Panchang data...</p>
            </div>
          ) : panchangData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              
              {/* Core Panchang Elements Card */}
              <Card className="bg-black/80 border-orange-500/30 backdrop-blur-sm lg:col-span-2 xl:col-span-3">
                <CardHeader>
                  <CardTitle className="text-orange-400 flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Panch Ang (Five Elements)
                  </CardTitle>
                  <CardDescription className="text-orange-200">
                    The five fundamental elements of Vedic calendar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Tithi */}
                    <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 p-4 rounded-lg border border-orange-500/20">
                      <h4 className="font-semibold text-orange-300 mb-2">Tithi</h4>
                      <p className="text-orange-100 font-bold">{panchangData.tithi.name}</p>
                      <p className="text-sm text-orange-200">Ends: {formatTime(panchangData.tithi.endTime)}</p>
                      <p className="text-sm text-orange-300">Next: {panchangData.tithi.nextTithi}</p>
                      {panchangData.tithi.paksha && (
                        <Badge className="mt-2 bg-orange-500/20 text-orange-200 border-orange-500/30">
                          {panchangData.tithi.paksha}
                        </Badge>
                      )}
                    </div>

                    {/* Nakshatra */}
                    <div className="bg-gradient-to-br from-red-900/20 to-yellow-900/20 p-4 rounded-lg border border-red-500/20">
                      <h4 className="font-semibold text-red-300 mb-2">Nakshatra</h4>
                      <p className="text-red-100 font-bold">{panchangData.nakshatra.name}</p>
                      <p className="text-sm text-red-200">Ends: {formatTime(panchangData.nakshatra.endTime)}</p>
                      <p className="text-sm text-red-300">Next: {panchangData.nakshatra.nextNakshatra}</p>
                      {panchangData.nakshatra.lord && (
                        <Badge className="mt-2 bg-red-500/20 text-red-200 border-red-500/30">
                          Lord: {panchangData.nakshatra.lord}
                        </Badge>
                      )}
                    </div>

                    {/* Yoga */}
                    <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 p-4 rounded-lg border border-yellow-500/20">
                      <h4 className="font-semibold text-yellow-300 mb-2">Yoga</h4>
                      <p className="text-yellow-100 font-bold">{panchangData.yoga.name}</p>
                      <p className="text-sm text-yellow-200">Ends: {formatTime(panchangData.yoga.endTime)}</p>
                      <p className="text-sm text-yellow-300">Next: {panchangData.yoga.nextYoga}</p>
                      {panchangData.yoga.meaning && (
                        <Badge className="mt-2 bg-yellow-500/20 text-yellow-200 border-yellow-500/30">
                          {panchangData.yoga.meaning}
                        </Badge>
                      )}
                    </div>

                    {/* Karana */}
                    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-4 rounded-lg border border-purple-500/20">
                      <h4 className="font-semibold text-purple-300 mb-2">Karana</h4>
                      <p className="text-purple-100 font-bold">{panchangData.karana.name}</p>
                      <p className="text-sm text-purple-200">Ends: {formatTime(panchangData.karana.endTime)}</p>
                      <p className="text-sm text-purple-300">Next: {panchangData.karana.nextKarana}</p>
                      {panchangData.karana.extraKarana && (
                        <Badge className="mt-2 bg-purple-500/20 text-purple-200 border-purple-500/30">
                          Extra: {panchangData.karana.extraKarana.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sun & Moon Timings */}
              <Card className="bg-black/80 border-orange-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-orange-400 flex items-center gap-2">
                    <Sun className="h-5 w-5" />
                    Sun & Moon Timings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Sunrise className="h-4 w-4 text-yellow-400" />
                      <span className="text-orange-200">Sunrise</span>
                    </div>
                    <span className="text-orange-100 font-bold">{formatTime(panchangData.timings.sunrise)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Sunset className="h-4 w-4 text-orange-400" />
                      <span className="text-orange-200">Sunset</span>
                    </div>
                    <span className="text-orange-100 font-bold">{formatTime(panchangData.timings.sunset)}</span>
                  </div>
                  {panchangData.timings.moonrise && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4 text-blue-400" />
                        <span className="text-orange-200">Moonrise</span>
                      </div>
                      <span className="text-orange-100 font-bold">{formatTime(panchangData.timings.moonrise)}</span>
                    </div>
                  )}
                  {panchangData.timings.moonset && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4 text-gray-400" />
                        <span className="text-orange-200">Moonset</span>
                      </div>
                      <span className="text-orange-100 font-bold">{formatTime(panchangData.timings.moonset)}</span>
                    </div>
                  )}
                  {panchangData.timings.dayLength && (
                    <div className="flex justify-between items-center pt-2 border-t border-orange-500/20">
                      <span className="text-orange-200">Day Length</span>
                      <span className="text-orange-100 font-bold">{panchangData.timings.dayLength}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Moon Data */}
              <Card className="bg-black/80 border-orange-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-orange-400 flex items-center gap-2">
                    <Moon className="h-5 w-5" />
                    Moon Position
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-orange-200">Rashi</span>
                    <span className="text-orange-100 font-bold">{panchangData.moonData.rashi}</span>
                  </div>
                  {panchangData.moonData.rashiLord && (
                    <div className="flex justify-between items-center">
                      <span className="text-orange-200">Lord</span>
                      <span className="text-orange-100 font-bold">{panchangData.moonData.rashiLord}</span>
                    </div>
                  )}
                  {panchangData.moonData.element && (
                    <div className="flex justify-between items-center">
                      <span className="text-orange-200">Element</span>
                      <span className="text-orange-100 font-bold">{panchangData.moonData.element}</span>
                    </div>
                  )}
                  {panchangData.moonData.phase && (
                    <div className="flex justify-between items-center">
                      <span className="text-orange-200">Phase</span>
                      <span className="text-orange-100 font-bold">{panchangData.moonData.phase}</span>
                    </div>
                  )}
                  {panchangData.moonData.illumination && (
                    <div className="flex justify-between items-center">
                      <span className="text-orange-200">Illumination</span>
                      <span className="text-orange-100 font-bold">{panchangData.moonData.illumination}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Auspicious Times */}
              <Card className="bg-black/80 border-green-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    Auspicious Times
                  </CardTitle>
                  <CardDescription className="text-green-200">
                    Favorable periods for important activities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {panchangData.auspiciousTimes.abhijitMuhurat && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-200">Abhijit Muhurat</span>
                      <span className="text-green-100 font-bold">{panchangData.auspiciousTimes.abhijitMuhurat}</span>
                    </div>
                  )}
                  {panchangData.auspiciousTimes.brahmaMuhurat && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-200">Brahma Muhurat</span>
                      <span className="text-green-100 font-bold">{panchangData.auspiciousTimes.brahmaMuhurat}</span>
                    </div>
                  )}
                  {panchangData.auspiciousTimes.amritKaal && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-200">Amrit Kaal</span>
                      <span className="text-green-100 font-bold">{panchangData.auspiciousTimes.amritKaal}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Inauspicious Times */}
              <Card className="bg-black/80 border-red-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Inauspicious Times
                  </CardTitle>
                  <CardDescription className="text-red-200">
                    Periods to avoid important activities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {panchangData.inauspiciousTimes.rahuKaal && (
                    <div className="flex justify-between items-center">
                      <span className="text-red-200">Rahu Kaal</span>
                      <span className="text-red-100 font-bold">{panchangData.inauspiciousTimes.rahuKaal}</span>
                    </div>
                  )}
                  {panchangData.inauspiciousTimes.yamaGandaKaal && (
                    <div className="flex justify-between items-center">
                      <span className="text-red-200">Yama Ganda Kaal</span>
                      <span className="text-red-100 font-bold">{panchangData.inauspiciousTimes.yamaGandaKaal}</span>
                    </div>
                  )}
                  {panchangData.inauspiciousTimes.gulikaKaal && (
                    <div className="flex justify-between items-center">
                      <span className="text-red-200">Gulika Kaal</span>
                      <span className="text-red-100 font-bold">{panchangData.inauspiciousTimes.gulikaKaal}</span>
                    </div>
                  )}
                  {panchangData.inauspiciousTimes.durMuhurat && (
                    <div className="flex justify-between items-center">
                      <span className="text-red-200">Dur Muhurat</span>
                      <span className="text-red-100 font-bold">{panchangData.inauspiciousTimes.durMuhurat}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Festivals & Vrats */}
              {(panchangData.festivals.length > 0 || panchangData.vrats.length > 0) && (
                <Card className="bg-black/80 border-purple-500/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-purple-400 flex items-center gap-2">
                      <Compass className="h-5 w-5" />
                      Festivals & Vrats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {panchangData.festivals.length > 0 && (
                      <div>
                        <h4 className="text-purple-300 font-semibold mb-2">Festivals</h4>
                        <div className="flex flex-wrap gap-2">
                          {panchangData.festivals.slice(0, 5).map((festival: string, index: number) => (
                            <Badge key={index} className="bg-purple-500/20 text-purple-200 border-purple-500/30">
                              {festival}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {panchangData.vrats.length > 0 && (
                      <div>
                        <h4 className="text-purple-300 font-semibold mb-2">Vrats</h4>
                        <div className="flex flex-wrap gap-2">
                          {panchangData.vrats.slice(0, 5).map((vrat: string, index: number) => (
                            <Badge key={index} className="bg-orange-500/20 text-orange-200 border-orange-500/30">
                              {vrat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Dosha Intervals */}
              {panchangData.doshaIntervals.length > 0 && (
                <Card className="bg-black/80 border-orange-500/30 backdrop-blur-sm xl:col-span-3">
                  <CardHeader>
                    <CardTitle className="text-orange-400 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Daily Time Periods
                    </CardTitle>
                    <CardDescription className="text-orange-200">
                      Detailed time periods with their effects throughout the day
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {panchangData.doshaIntervals.map((interval: any, index: number) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${getSeverityColor(interval.severity)}`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold">{interval.startTime} - {interval.endTime}</span>
                            <Badge className={`text-xs ${getSeverityColor(interval.severity)}`}>
                              {interval.severity}
                            </Badge>
                          </div>
                          <div className="text-sm space-y-1">
                            <p className="opacity-90">{interval.description}</p>
                            {interval.doshas.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {interval.doshas.map((dosha: string, i: number) => (
                                  <span key={i} className="text-xs opacity-70 bg-black/30 px-2 py-1 rounded">
                                    {dosha}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          ) : (
            <div className="text-center py-12">
              <Card className="bg-black/80 border-orange-500/30 backdrop-blur-sm max-w-md mx-auto">
                <CardContent className="pt-6">
                  <p className="text-orange-200">
                    Please allow location access to view your personalized Panchang data.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Educational Information */}
          <Card className="bg-black/80 border-orange-500/30 backdrop-blur-sm mt-8">
            <CardHeader>
              <CardTitle className="text-orange-400">About Hindu Panchang</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-200 leading-relaxed">
                The Hindu Panchang is an ancient Vedic calendar system that provides comprehensive astronomical and astrological information. 
                It consists of five main elements (Panch Ang): Tithi (lunar day), Nakshatra (constellation), Yoga (auspicious combination), 
                Karana (half lunar day), and Var (weekday). This sacred timekeeping system guides Hindu festivals, rituals, and auspicious 
                activities based on celestial movements and their spiritual significance.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}