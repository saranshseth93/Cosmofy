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

const HinduPanchang = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [currentDate, setCurrentDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
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
          <Card className="bg-black/80 border-orange-500/30 backdrop-blur-sm max-w-md">
            <CardContent className="pt-6">
              <p className="text-orange-200 text-center">
                Unable to load authentic Panchang data. Please check your connection and try again.
              </p>
            </CardContent>
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
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
              Hindu Panchang
            </h1>
            <p className="text-xl text-orange-200 max-w-3xl mx-auto">
              Authentic Vedic Calendar with Astronomical Calculations
            </p>
          </div>

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
            </div>
          ) : null}

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-orange-200">Calculating authentic Panchang data...</p>
            </div>
          ) : panchangData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Basic Panchang Elements */}
              <Card className="bg-black/80 border-orange-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-orange-400 flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Panchang Elements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-orange-300 font-semibold">Tithi</p>
                      <p className="text-orange-100">{panchangData.tithi.name}</p>
                      <p className="text-orange-400 text-sm">Ends: {formatTime(panchangData.tithi.endTime)}</p>
                      <p className="text-orange-300 text-sm">Next: {panchangData.tithi.nextTithi}</p>
                    </div>
                    <div>
                      <p className="text-orange-300 font-semibold">Nakshatra</p>
                      <p className="text-orange-100">{panchangData.nakshatra.name}</p>
                      <p className="text-orange-400 text-sm">Ends: {formatTime(panchangData.nakshatra.endTime)}</p>
                      <p className="text-orange-300 text-sm">Next: {panchangData.nakshatra.nextNakshatra}</p>
                    </div>
                    <div>
                      <p className="text-orange-300 font-semibold">Yoga</p>
                      <p className="text-orange-100">{panchangData.yoga.name}</p>
                      <p className="text-orange-400 text-sm">Ends: {formatTime(panchangData.yoga.endTime)}</p>
                      <p className="text-orange-300 text-sm">Next: {panchangData.yoga.nextYoga}</p>
                    </div>
                    <div>
                      <p className="text-orange-300 font-semibold">Karana</p>
                      <p className="text-orange-100">{panchangData.karana.name}</p>
                      <p className="text-orange-400 text-sm">Ends: {formatTime(panchangData.karana.endTime)}</p>
                      <p className="text-orange-300 text-sm">Next: {panchangData.karana.nextKarana}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sun & Moon Timings */}
              <Card className="bg-black/80 border-orange-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-orange-400 flex items-center gap-2">
                    <Sun className="h-5 w-5" />
                    Celestial Timings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Sunrise className="h-4 w-4 text-orange-400" />
                      <div>
                        <p className="text-orange-300 text-sm">Sunrise</p>
                        <p className="text-orange-100">{formatTime(panchangData.timings.sunrise)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sunset className="h-4 w-4 text-orange-400" />
                      <div>
                        <p className="text-orange-300 text-sm">Sunset</p>
                        <p className="text-orange-100">{formatTime(panchangData.timings.sunset)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-orange-400" />
                      <div>
                        <p className="text-orange-300 text-sm">Moonrise</p>
                        <p className="text-orange-100">{formatTime(panchangData.timings.moonrise || 'N/A')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-orange-400" />
                      <div>
                        <p className="text-orange-300 text-sm">Moonset</p>
                        <p className="text-orange-100">{formatTime(panchangData.timings.moonset || 'N/A')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Auspicious Times */}
              <Card className="bg-black/80 border-orange-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    Auspicious Times
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-green-300">Brahma Muhurat</span>
                      <span className="text-green-100">{panchangData.auspiciousTimes.brahmaMuhurat || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-300">Abhijit Muhurat</span>
                      <span className="text-green-100">{panchangData.auspiciousTimes.abhijitMuhurat || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-300">Amrit Kaal</span>
                      <span className="text-green-100">{panchangData.auspiciousTimes.amritKaal || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inauspicious Times */}
              <Card className="bg-black/80 border-orange-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Inauspicious Times
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-red-300">Rahu Kaal</span>
                      <span className="text-red-100">{panchangData.inauspiciousTimes.rahuKaal || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-red-300">Yama Ganda Kaal</span>
                      <span className="text-red-100">{panchangData.inauspiciousTimes.yamaGandaKaal || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-red-300">Gulika Kaal</span>
                      <span className="text-red-100">{panchangData.inauspiciousTimes.gulikaKaal || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Moon Data */}
              <Card className="bg-black/80 border-orange-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center gap-2">
                    <Moon className="h-5 w-5" />
                    Moon Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-blue-300 text-sm">Moon Rashi</p>
                      <p className="text-blue-100">{panchangData.moonData.rashi}</p>
                    </div>
                    <div>
                      <p className="text-blue-300 text-sm">Moon Phase</p>
                      <p className="text-blue-100">{panchangData.moonData.phase || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-blue-300 text-sm">Illumination</p>
                      <p className="text-blue-100">{panchangData.moonData.illumination || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-blue-300 text-sm">Paksha</p>
                      <p className="text-blue-100">{panchangData.tithi.paksha || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Calendar Information */}
              <Card className="bg-black/80 border-orange-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-purple-400 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Calendar Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-purple-300 text-sm">Masa</p>
                      <p className="text-purple-100">{panchangData.masa.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm">Ritu</p>
                      <p className="text-purple-100">{panchangData.masa.ritu || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm">Ayana</p>
                      <p className="text-purple-100">{panchangData.masa.ayana || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm">Weekday</p>
                      <p className="text-purple-100">{panchangData.weekday}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Festivals & Vrats */}
              {(panchangData.festivals.length > 0 || panchangData.vrats.length > 0) && (
                <Card className="bg-black/80 border-orange-500/30 backdrop-blur-sm lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-yellow-400 flex items-center gap-2">
                      <Compass className="h-5 w-5" />
                      Festivals & Observances
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {panchangData.festivals.length > 0 && (
                        <div>
                          <h4 className="text-yellow-300 font-semibold mb-3">Festivals</h4>
                          <div className="space-y-2">
                            {panchangData.festivals.map((festival, index) => (
                              <Badge key={index} className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                {festival}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {panchangData.vrats.length > 0 && (
                        <div>
                          <h4 className="text-yellow-300 font-semibold mb-3">Vrats</h4>
                          <div className="space-y-2">
                            {panchangData.vrats.map((vrat, index) => (
                              <Badge key={index} className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                                {vrat}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
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
};

export default HinduPanchang;