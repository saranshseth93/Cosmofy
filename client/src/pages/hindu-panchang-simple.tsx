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
  suburb: string;
  city: string;
  country: string;
  display: string;
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
    rahuKaal: string;
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
  const [userCoords, setUserCoords] = useState<{lat: number, lon: number}>({ lat: 28.6139, lon: 77.209 }); // Default to Delhi for instant loading
  const [locationError, setLocationError] = useState<string | null>(null);

  // Handle unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.warn('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

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
        return;
      }

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { 
            timeout: 5000, 
            enableHighAccuracy: false,
            maximumAge: 600000
          });
        });
        setUserCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      } catch (error) {
        setLocationError("Location access denied - using Delhi coordinates");
        // Keep the default Delhi coordinates for data consistency
      }
    };

    requestLocation();
  }, []);

  const { data: locationData } = useQuery<LocationData>({
    queryKey: ['/api/location', userCoords.lat, userCoords.lon],
    queryFn: async () => {
      const response = await fetch(`/api/location?lat=${userCoords.lat}&lon=${userCoords.lon}`);
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: panchangData, isLoading: panchangLoading, error: panchangError } = useQuery<PanchangData>({
    queryKey: ['/api/panchang', userCoords.lat, userCoords.lon],
    queryFn: async () => {
      const response = await fetch(`/api/panchang?lat=${userCoords.lat}&lon=${userCoords.lon}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Panchang data');
      }
      return response.json();
    },
    staleTime: 60 * 60 * 1000,
    retry: 1,
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
              <Card className="bg-black/40 border-red-500/30 max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center space-x-2">
                    <Star className="h-5 w-5" />
                    <span>पंचांग डेटा उपलब्ध नहीं / Panchang Data Unavailable</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-300 mb-4">
                    Unable to load authentic Panchang calculations. This may be due to:
                  </p>
                  <ul className="text-red-200 space-y-2 ml-4 list-disc">
                    <li>Network connectivity issues</li>
                    <li>API service temporarily unavailable</li>
                    <li>Location access required for calculations</li>
                  </ul>
                  <div className="mt-6 p-4 bg-red-900/20 rounded-lg">
                    <p className="text-red-200 text-sm">
                      <strong>Note:</strong> Cosmofy displays only authentic Vedic calculations sourced from 
                      professional astronomical libraries. No synthetic data is shown to maintain accuracy.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
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
                  {locationData?.display || locationData?.suburb || panchangData?.location?.city || 'Delhi, India'}
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
                  {/* Tithi */}
                  <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-orange-300 text-lg flex items-center gap-2">
                        <Moon className="h-5 w-5" />
                        तिथि / Tithi
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-2xl font-bold text-orange-200">{panchangData.tithi.name}</div>
                      <div className="text-sm text-orange-300">{panchangData.tithi.sanskrit}</div>
                      <div className="text-xs text-orange-400">Deity: {panchangData.tithi.deity}</div>
                      <div className="text-xs text-orange-400">Ends: {panchangData.tithi.endTime}</div>
                      <Badge variant="outline" className="text-xs bg-orange-900/30 border-orange-500/40 text-orange-200">
                        {panchangData.tithi.paksh} paksh - {panchangData.tithi.number}
                      </Badge>
                    </CardContent>
                  </Card>

                  {/* Nakshatra */}
                  <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-purple-300 text-lg flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        नक्षत्र / Nakshatra
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-2xl font-bold text-purple-200">{panchangData.nakshatra.name}</div>
                      <div className="text-sm text-purple-300">{panchangData.nakshatra.sanskrit}</div>
                      <div className="text-xs text-purple-400">Deity: {panchangData.nakshatra.deity}</div>
                      <div className="text-xs text-purple-400">Ends: {panchangData.nakshatra.endTime}</div>
                      <Badge variant="outline" className="text-xs bg-purple-900/30 border-purple-500/40 text-purple-200">
                        Lord: {panchangData.nakshatra.lord}
                      </Badge>
                    </CardContent>
                  </Card>

                  {/* Yoga */}
                  <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-green-300 text-lg flex items-center gap-2">
                        <Sun className="h-5 w-5" />
                        योग / Yoga
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-2xl font-bold text-green-200">{panchangData.yoga.name}</div>
                      <div className="text-sm text-green-300">{panchangData.yoga.sanskrit}</div>
                      <div className="text-xs text-green-400">Meaning: {panchangData.yoga.meaning}</div>
                      <div className="text-xs text-green-400">Ends: {panchangData.yoga.endTime}</div>
                      <Badge variant="outline" className="text-xs bg-green-900/30 border-green-500/40 text-green-200">
                        {panchangData.yoga.type}
                      </Badge>
                    </CardContent>
                  </Card>

                  {/* Karana */}
                  <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-blue-300 text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        करण / Karana
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-2xl font-bold text-blue-200">{panchangData.karana.name}</div>
                      <div className="text-sm text-blue-300">{panchangData.karana.sanskrit}</div>
                      <div className="text-xs text-blue-400">Meaning: {panchangData.karana.meaning}</div>
                      <div className="text-xs text-blue-400">Ends: {panchangData.karana.endTime}</div>
                      <Badge variant="outline" className="text-xs bg-blue-900/30 border-blue-500/40 text-blue-200">
                        {panchangData.karana.type}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                {/* Time Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
                    <CardHeader>
                      <CardTitle className="text-yellow-300 flex items-center gap-2">
                        <Sun className="h-5 w-5" />
                        सूर्य व चन्द्र / Sun & Moon
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-yellow-400">Sunrise</div>
                          <div className="text-lg font-bold text-yellow-200">{panchangData.sunrise}</div>
                        </div>
                        <div>
                          <div className="text-sm text-yellow-400">Sunset</div>
                          <div className="text-lg font-bold text-yellow-200">{panchangData.sunset}</div>
                        </div>
                        <div>
                          <div className="text-sm text-yellow-400">Moonrise</div>
                          <div className="text-lg font-bold text-yellow-200">{panchangData.moonrise}</div>
                        </div>
                        <div>
                          <div className="text-sm text-yellow-400">Moonset</div>
                          <div className="text-lg font-bold text-yellow-200">{panchangData.moonset}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/30">
                    <CardHeader>
                      <CardTitle className="text-red-300 flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        शुभ मुहूर्त / Auspicious Times
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-red-400">Abhijit Muhurat</span>
                          <span className="text-sm font-bold text-red-200">{panchangData.shubhMuhurat.abhijitMuhurat}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-red-400">Rahu Kaal</span>
                          <span className="text-sm font-bold text-red-200">{panchangData.shubhMuhurat.rahuKaal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-red-400">Gulika Kaal</span>
                          <span className="text-sm font-bold text-red-200">{panchangData.shubhMuhurat.gulikaKaal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-red-400">Yama Ganda</span>
                          <span className="text-sm font-bold text-red-200">{panchangData.shubhMuhurat.yamaGandaKaal}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/30">
                    <CardHeader>
                      <CardTitle className="text-indigo-300">राशि व मास / Rashi & Masa</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <div className="text-sm text-indigo-400">Moon Rashi</div>
                        <div className="text-lg font-bold text-indigo-200">{panchangData.rashi.name}</div>
                        <div className="text-xs text-indigo-300">Element: {panchangData.rashi.element}</div>
                        <div className="text-xs text-indigo-300">Lord: {panchangData.rashi.lord}</div>
                      </div>
                      <div className="pt-2">
                        <div className="text-sm text-indigo-400">Masa</div>
                        <div className="text-lg font-bold text-indigo-200">{panchangData.masa}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-teal-900/20 to-cyan-900/20 border-teal-500/30">
                    <CardHeader>
                      <CardTitle className="text-teal-300">युग व संवत् / Yuga & Samvat</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <div className="text-sm text-teal-400">Current Yuga</div>
                        <div className="text-lg font-bold text-teal-200">{panchangData.yug}</div>
                      </div>
                      <div className="pt-2">
                        <div className="text-sm text-teal-400">Samvat Systems</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {panchangData.samvat.slice(0, 4).map((samvat, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-teal-900/30 border-teal-500/40 text-teal-200">
                              {samvat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-pink-900/20 to-rose-900/20 border-pink-500/30">
                    <CardHeader>
                      <CardTitle className="text-pink-300">काल इकाई / Time Units</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="space-y-1">
                        {panchangData.kaalIkai.map((unit, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-pink-900/30 border-pink-500/40 text-pink-200">
                            {unit}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Data Verification */}
                <Card className="bg-gradient-to-br from-gray-900/20 to-slate-900/20 border-gray-500/30">
                  <CardHeader>
                    <CardTitle className="text-gray-300">डेटा सत्यापन / Data Verification</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant={panchangData.verification.verified ? "default" : "destructive"} className="text-xs">
                        {panchangData.verification.verified ? "Verified" : "Unverified"}
                      </Badge>
                      <span className="text-sm text-gray-400">
                        {panchangData.source}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Method: {panchangData.calculationMethod}</div>
                      <div>Freshness: {panchangData.dataFreshness}</div>
                      <div>Backup: {panchangData.backupSource}</div>
                    </div>
                  </CardContent>
                </Card>

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
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}