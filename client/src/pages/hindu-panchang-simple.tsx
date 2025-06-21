import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, Sun, Moon, Star } from 'lucide-react';
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
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
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

interface PanchangData {
  date: string;
  location: {
    city: string;
    coordinates: { latitude: number; longitude: number };
    timezone: string;
  };
  tithi: {
    name: string;
    sanskrit: string;
    deity: string;
    significance: string;
    endTime: string;
    paksh: string;
    number: number;
  };
  nakshatra: {
    name: string;
    sanskrit: string;
    deity: string;
    qualities: string;
    endTime: string;
    lord: string;
  };
  yoga: {
    name: string;
    sanskrit: string;
    meaning: string;
    endTime: string;
    type: string;
  };
  karana: {
    name: string;
    sanskrit: string;
    meaning: string;
    endTime: string;
    type: string;
  };
  vara: string;
  rashi: {
    name: string;
    element: string;
    lord: string;
  };
  masa: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  shubhMuhurat: {
    abhijitMuhurat: string;
    brahmaRahukaal: string;
    gulikaKaal: string;
    yamaGandaKaal: string;
  };
  festivals: string[];
  vratsAndOccasions: string[];
  samvat: string[];
  yug: string;
  kaalIkai: string[];
  verification: {
    tithi: { library: string; scraped: string | null };
    nakshatra: { library: string; scraped: string | null };
    yoga: { library: string; scraped: string | null };
    karana: { library: string; scraped: string | null };
    verified: boolean;
  };
  source: string;
  dataFreshness: string;
  backupSource: string;
  calculationMethod: string;
}

export default function HinduPanchangSimplePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userCoords, setUserCoords] = useState<{lat: number, lon: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const requestLocation = async () => {
      if (!navigator.geolocation) {
        setLocationError("Geolocation not supported");
        setUserCoords({ lat: 19.0760, lon: 72.8777 });
        return;
      }

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { 
            timeout: 15000, 
            enableHighAccuracy: true,
            maximumAge: 300000
          });
        });
        setUserCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      } catch (error) {
        setLocationError("Location access denied");
        setUserCoords({ lat: 19.0760, lon: 72.8777 });
      }
    };

    requestLocation();
  }, []);

  const { data: locationData } = useQuery<LocationData>({
    queryKey: ['/api/location', userCoords?.lat, userCoords?.lon],
    queryFn: () => fetch(`/api/location?lat=${userCoords?.lat}&lon=${userCoords?.lon}`).then(res => res.json()),
    enabled: !!userCoords,
    staleTime: 5 * 60 * 1000,
  });

  const { data: panchangData, isLoading: panchangLoading, error: panchangError } = useQuery<PanchangData>({
    queryKey: ['/api/panchang', userCoords?.lat, userCoords?.lon],
    queryFn: async () => {
      const response = await fetch(`/api/panchang?lat=${userCoords?.lat}&lon=${userCoords?.lon}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Panchang data');
      }
      return response.json();
    },
    enabled: !!userCoords,
    staleTime: 60 * 60 * 1000,
    retry: false,
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (panchangLoading) {
    return (
      <>
        <Navigation />
        <CosmicCursor />
        <div className="min-h-screen relative pt-24">
          <DivineBackground />
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 flex items-center justify-center min-h-screen">
            <Card className="bg-black/40 border-orange-500/30">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-400"></div>
                  <p className="text-orange-400 text-lg">Loading authentic Panchang data...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  if (panchangError) {
    return (
      <>
        <Navigation />
        <CosmicCursor />
        <div className="min-h-screen relative pt-24">
          <DivineBackground />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center">
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
                  <h2 className="text-xl font-semibold text-red-400 mb-4">Panchang Data Unavailable</h2>
                  <p className="text-gray-300 mb-4">
                    Unable to fetch authentic Vedic calendar data from panchangJS library.
                  </p>
                  <p className="text-sm text-gray-400">
                    {panchangError?.message || 'Unknown error occurred'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <CosmicCursor />
      <div className="min-h-screen relative pt-24">
        <DivineBackground />
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-8 space-y-8">
            
            {/* Location Chip */}
            <div className="flex justify-center">
              <div className="bg-orange-900/30 border border-orange-500/40 rounded-full px-4 py-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-400" />
                <span className="text-orange-200 text-sm">
                  {locationData?.city || panchangData?.location?.city || 'Mumbai'}
                </span>
              </div>
            </div>

            {/* Header */}
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-pink-400">
                  हिन्दू पञ्चाङ्ग
                </h1>
                <h2 className="text-xl md:text-2xl font-semibold text-orange-300">
                  Hindu Panchang
                </h2>
              </div>
              <div className="space-y-1">
                <p className="text-lg text-orange-200">{formatDate(currentTime)}</p>
                <p className="text-orange-300 font-mono text-xl">{formatTime(currentTime)}</p>
              </div>
            </div>

            {panchangData && (
              <>
                {/* Main Panchang Elements */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* Tithi Card */}
                  <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-400">
                        <Moon className="h-5 w-5" />
                        तिथि / Tithi
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-orange-200">{panchangData.tithi.name}</h3>
                        <Badge variant="secondary" className="text-xs">#{panchangData.tithi.number}</Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          <strong>Deity:</strong> {panchangData.tithi.deity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Paksh:</strong> {panchangData.tithi.paksh}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Sanskrit:</strong> {panchangData.tithi.sanskrit}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Ends: {panchangData.tithi.endTime}
                      </Badge>
                    </CardContent>
                  </Card>

                  {/* Nakshatra Card */}
                  <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-400">
                        <Star className="h-5 w-5" />
                        नक्षत्र / Nakshatra
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <h3 className="text-xl font-bold text-blue-200">{panchangData.nakshatra.name}</h3>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          <strong>Deity:</strong> {panchangData.nakshatra.deity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Lord:</strong> {panchangData.nakshatra.lord}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Sanskrit:</strong> {panchangData.nakshatra.sanskrit}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Ends: {panchangData.nakshatra.endTime}
                      </Badge>
                    </CardContent>
                  </Card>

                  {/* Yoga Card */}
                  <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-400">
                        <Calendar className="h-5 w-5" />
                        योग / Yoga
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <h3 className="text-xl font-bold text-green-200">{panchangData.yoga.name}</h3>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          <strong>Meaning:</strong> {panchangData.yoga.meaning}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Type:</strong> {panchangData.yoga.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Sanskrit:</strong> {panchangData.yoga.sanskrit}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Ends: {panchangData.yoga.endTime}
                      </Badge>
                    </CardContent>
                  </Card>

                  {/* Karana Card */}
                  <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-400">
                        <Clock className="h-5 w-5" />
                        करण / Karana
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <h3 className="text-xl font-bold text-purple-200">{panchangData.karana.name}</h3>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          <strong>Meaning:</strong> {panchangData.karana.meaning}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Type:</strong> {panchangData.karana.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Sanskrit:</strong> {panchangData.karana.sanskrit}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Ends: {panchangData.karana.endTime}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Astronomical Data */}
                  <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-400">
                        <Sun className="h-5 w-5" />
                        Astronomical Data
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Sunrise</p>
                          <p className="text-lg font-mono text-yellow-200">{panchangData.sunrise}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Sunset</p>
                          <p className="text-lg font-mono text-yellow-200">{panchangData.sunset}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Vara</p>
                          <p className="text-lg text-yellow-200">{panchangData.vara}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Masa</p>
                          <p className="text-lg text-yellow-200">{panchangData.masa}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Yug</p>
                        <p className="text-lg text-yellow-200">{panchangData.yug}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Verification Status */}
                  <Card className="bg-gradient-to-br from-teal-900/20 to-cyan-900/20 border-teal-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-teal-400">
                        <Star className="h-5 w-5" />
                        Data Authenticity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          <strong>Source:</strong> {panchangData.source}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Method:</strong> {panchangData.calculationMethod}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Verification:</strong> 
                          <Badge variant={panchangData.verification.verified ? "default" : "destructive"} className="ml-2">
                            {panchangData.verification.verified ? "Verified" : "Unverified"}
                          </Badge>
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <p>Samvat Systems: {panchangData.samvat.length} calendars</p>
                        <p>Kaal Ikai: {panchangData.kaalIkai.join(', ')}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Shubh Muhurat */}
                <Card className="bg-gradient-to-br from-indigo-900/20 to-blue-900/20 border-indigo-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-indigo-400">
                      <Clock className="h-5 w-5" />
                      शुभ मुहूर्त / Shubh Muhurat
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Abhijit Muhurat</p>
                        <p className="text-lg font-mono text-indigo-200">{panchangData.shubhMuhurat.abhijitMuhurat}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Rahu Kaal</p>
                        <p className="text-lg font-mono text-indigo-200">{panchangData.shubhMuhurat.brahmaRahukaal}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Gulika Kaal</p>
                        <p className="text-lg font-mono text-indigo-200">{panchangData.shubhMuhurat.gulikaKaal}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Yama Ganda</p>
                        <p className="text-lg font-mono text-indigo-200">{panchangData.shubhMuhurat.yamaGandaKaal}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Festivals and Vrats */}
                {(panchangData.festivals.length > 0 || panchangData.vratsAndOccasions.length > 0) && (
                  <Card className="bg-gradient-to-br from-rose-900/20 to-pink-900/20 border-rose-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-rose-400">
                        <Calendar className="h-5 w-5" />
                        Festivals & Vrats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {panchangData.festivals.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-rose-300 mb-2">Festivals</h4>
                          <div className="flex flex-wrap gap-2">
                            {panchangData.festivals.map((festival, index) => (
                              <Badge key={index} variant="secondary" className="bg-rose-500/20">
                                {festival}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {panchangData.vratsAndOccasions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-rose-300 mb-2">Vrats & Occasions</h4>
                          <div className="flex flex-wrap gap-2">
                            {panchangData.vratsAndOccasions.map((vrat, index) => (
                              <Badge key={index} variant="outline" className="border-rose-400">
                                {vrat}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Educational Note */}
            <Card className="bg-gradient-to-br from-slate-900/20 to-gray-900/20 border-slate-500/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-300 mb-3">About Hindu Panchang</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  The Hindu Panchang is an ancient Vedic calendar system that tracks five key astronomical elements: 
                  Tithi (lunar day), Nakshatra (constellation), Yoga (auspicious combination), Karana (half-day period), 
                  and Vara (weekday). This system has been used for thousands of years to determine auspicious times 
                  for ceremonies, festivals, and daily activities. Our calculations use the professional panchangJS 
                  library with verification against traditional sources to ensure authenticity.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}