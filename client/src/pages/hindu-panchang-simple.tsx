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
  const [userCoords, setUserCoords] = useState<{lat: number, lon: number}>({ lat: 28.6139, lon: 77.209 }); // Default to Delhi for instant loading
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(`/api/location?lat=${userCoords.lat}&lon=${userCoords.lon}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: panchangData, isLoading: panchangLoading, error: panchangError } = useQuery<PanchangData>({
    queryKey: ['/api/panchang', userCoords.lat, userCoords.lon],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch(`/api/panchang?lat=${userCoords.lat}&lon=${userCoords.lon}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error('Failed to fetch Panchang data');
        }
        return response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
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
                  {locationData?.display || locationData?.suburb || panchangData?.location?.city || 'Mumbai, India'}
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
                {/* Main Panchang Data - Matching drikpanchang.com hierarchy */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Left Column - Sunrise, Sunset, Moonrise, Moonset */}
                  <Card className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-500/30">
                    <CardHeader>
                      <CardTitle className="text-amber-400">Sun & Moon Timings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-amber-300">Sunrise</div>
                          <div className="text-lg font-mono text-amber-200">{panchangData.sunrise}</div>
                        </div>
                        <div>
                          <div className="text-sm text-amber-300">Sunset</div>
                          <div className="text-lg font-mono text-amber-200">{panchangData.sunset}</div>
                        </div>
                        <div>
                          <div className="text-sm text-blue-300">Moonrise</div>
                          <div className="text-lg font-mono text-blue-200">{panchangData.moonrise}</div>
                        </div>
                        <div>
                          <div className="text-sm text-blue-300">Moonset</div>
                          <div className="text-lg font-mono text-blue-200">{panchangData.moonset}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Right Column - Panchang Elements */}
                  <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-purple-400">Panchang Elements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-300">Tithi</span>
                        <span className="text-purple-200 font-semibold">{panchangData.tithi.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-300">Nakshatra</span>
                        <span className="text-blue-200 font-semibold">{panchangData.nakshatra.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-300">Yoga</span>
                        <span className="text-green-200 font-semibold">{panchangData.yoga.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-orange-300">Karana</span>
                        <span className="text-orange-200 font-semibold">{panchangData.karana.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Vara (Weekday)</span>
                        <span className="text-slate-200 font-semibold">{panchangData.vara}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Rahu Kaal and Auspicious Times - Matching drikpanchang.com */}
                <Card className="bg-gradient-to-br from-red-900/20 to-yellow-900/20 border-red-500/30">
                  <CardHeader>
                    <CardTitle className="text-red-400">Rahu Kaal & Muhurat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-red-300">Rahu Kaal</div>
                        <div className="text-lg font-mono text-red-200">{panchangData.shubhMuhurat.brahmaRahukaal}</div>
                      </div>
                      <div>
                        <div className="text-sm text-yellow-300">Gulika Kaal</div>
                        <div className="text-lg font-mono text-yellow-200">{panchangData.shubhMuhurat.gulikaKaal}</div>
                      </div>
                      <div>
                        <div className="text-sm text-orange-300">Yama Ganda</div>
                        <div className="text-lg font-mono text-orange-200">{panchangData.shubhMuhurat.yamaGandaKaal}</div>
                      </div>
                      <div>
                        <div className="text-sm text-green-300">Abhijit Muhurat</div>
                        <div className="text-lg font-mono text-green-200">{panchangData.shubhMuhurat.abhijitMuhurat}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Moon Sign and Festivals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30">
                    <CardHeader>
                      <CardTitle className="text-blue-400">Moon Sign (Rashi)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-200 mb-2">{panchangData.rashi.name}</div>
                        <div className="text-sm text-blue-300">Element: {panchangData.rashi.element}</div>
                        <div className="text-sm text-blue-300">Lord: {panchangData.rashi.lord}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
                    <CardHeader>
                      <CardTitle className="text-green-400">Festivals & Vrats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {panchangData.festivals.length > 0 && (
                        <div className="mb-3">
                          <div className="text-sm text-green-300 mb-1">Festivals:</div>
                          {panchangData.festivals.map((festival, index) => (
                            <div key={index} className="text-green-200 text-sm">{festival}</div>
                          ))}
                        </div>
                      )}
                      {panchangData.vratsAndOccasions.length > 0 && (
                        <div>
                          <div className="text-sm text-green-300 mb-1">Vrats:</div>
                          {panchangData.vratsAndOccasions.map((vrat, index) => (
                            <div key={index} className="text-green-200 text-sm">{vrat}</div>
                          ))}
                        </div>
                      )}
                      {panchangData.festivals.length === 0 && panchangData.vratsAndOccasions.length === 0 && (
                        <div className="text-gray-400 text-sm">No special festivals or vrats today</div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Panchang Elements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Tithi Details */}
                  <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-400">
                        <Moon className="h-5 w-5" />
                        Tithi - Lunar Day #{panchangData.tithi.number}
                      </CardTitle>
                      <CardDescription className="text-orange-200">
                        Based on the moon's phase and position relative to the sun
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-orange-200">{panchangData.tithi.name}</span>
                        <Badge variant="secondary" className="bg-orange-500/20">{panchangData.tithi.paksh} Paksh</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Ruling Deity:</span>
                          <span className="text-orange-200">{panchangData.tithi.deity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Ends At:</span>
                          <span className="text-orange-200 font-mono">{panchangData.tithi.endTime}</span>
                        </div>
                      </div>
                      <div className="bg-orange-900/20 p-3 rounded-lg">
                        <p className="text-xs text-orange-300 leading-relaxed">
                          <strong>Significance:</strong> {panchangData.tithi.significance}
                        </p>
                      </div>
                      <div className="bg-orange-900/10 p-3 rounded-lg">
                        <p className="text-xs text-orange-400 leading-relaxed">
                          <strong>What is Tithi?</strong> A Tithi represents the time taken for the moon to move 12 degrees away from the sun. 
                          There are 30 Tithis in a lunar month, divided into bright half (Shukla Paksh) and dark half (Krishna Paksh). 
                          Each Tithi has specific spiritual significance and recommended activities.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Nakshatra Details */}
                  <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-400">
                        <Star className="h-5 w-5" />
                        Nakshatra - Lunar Constellation
                      </CardTitle>
                      <CardDescription className="text-blue-200">
                        The star constellation where the moon is positioned today
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-blue-200">{panchangData.nakshatra.name}</span>
                        <Badge variant="outline" className="border-blue-400">Constellation</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Ruling Deity:</span>
                          <span className="text-blue-200">{panchangData.nakshatra.deity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Planetary Lord:</span>
                          <span className="text-blue-200">{panchangData.nakshatra.lord}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Ends At:</span>
                          <span className="text-blue-200 font-mono">{panchangData.nakshatra.endTime}</span>
                        </div>
                      </div>
                      <div className="bg-blue-900/20 p-3 rounded-lg">
                        <p className="text-xs text-blue-300 leading-relaxed">
                          <strong>Qualities:</strong> {panchangData.nakshatra.qualities}
                        </p>
                      </div>
                      <div className="bg-blue-900/10 p-3 rounded-lg">
                        <p className="text-xs text-blue-400 leading-relaxed">
                          <strong>What is Nakshatra?</strong> The sky is divided into 27 Nakshatras (lunar mansions), 
                          each spanning 13°20' of the zodiac. The moon stays in each Nakshatra for about one day. 
                          Nakshatras influence personality traits, career choices, and compatibility in relationships.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Yoga Details */}
                  <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-400">
                        <Calendar className="h-5 w-5" />
                        Yoga - Auspicious Combination
                      </CardTitle>
                      <CardDescription className="text-green-200">
                        Union of sun and moon positions creating specific energy patterns
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-green-200">{panchangData.yoga.name}</span>
                        <Badge variant="outline" className="border-green-400">{panchangData.yoga.type}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Meaning:</span>
                          <span className="text-green-200">{panchangData.yoga.meaning}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Ends At:</span>
                          <span className="text-green-200 font-mono">{panchangData.yoga.endTime}</span>
                        </div>
                      </div>
                      <div className="bg-green-900/10 p-3 rounded-lg">
                        <p className="text-xs text-green-400 leading-relaxed">
                          <strong>What is Yoga?</strong> There are 27 Yogas based on the combined movement of sun and moon. 
                          Each Yoga lasts about 13 hours 20 minutes on average. Yogas determine the overall auspiciousness 
                          of activities and influence the success of new ventures, ceremonies, and important decisions.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Karana Details */}
                  <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-400">
                        <Clock className="h-5 w-5" />
                        Karana - Half Lunar Day
                      </CardTitle>
                      <CardDescription className="text-purple-200">
                        Each Tithi is divided into two Karanas of about 6 hours each
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-purple-200">{panchangData.karana.name}</span>
                        <Badge variant="outline" className="border-purple-400">{panchangData.karana.type}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Meaning:</span>
                          <span className="text-purple-200">{panchangData.karana.meaning}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Ends At:</span>
                          <span className="text-purple-200 font-mono">{panchangData.karana.endTime}</span>
                        </div>
                      </div>
                      <div className="bg-purple-900/10 p-3 rounded-lg">
                        <p className="text-xs text-purple-400 leading-relaxed">
                          <strong>What is Karana?</strong> There are 11 Karanas: 7 movable (Chara) and 4 fixed (Sthira). 
                          Each Karana influences specific activities - some favor travel and movement, others favor 
                          stability and meditation. Karanas help determine the best timing for daily activities.
                        </p>
                      </div>
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

                {/* Moon Information */}
                <Card className="bg-gradient-to-br from-slate-900/20 to-blue-900/20 border-slate-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-400">
                      <Moon className="h-5 w-5" />
                      चन्द्र विवरण / Moon Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Moonrise</p>
                        <p className="text-lg font-mono text-slate-200">{panchangData.moonrise}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Moonset</p>
                        <p className="text-lg font-mono text-slate-200">{panchangData.moonset}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Moon Rashi</p>
                        <p className="text-lg text-slate-200">{panchangData.rashi.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Element</p>
                        <p className="text-lg text-slate-200">{panchangData.rashi.element}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Planetary Lord</p>
                      <p className="text-lg text-slate-200">{panchangData.rashi.lord}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Extended Panchang Elements */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Detailed Tithi Information */}
                  <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-400">
                        <Moon className="h-5 w-5" />
                        तिथि विस्तार / Tithi Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Name</span>
                          <span className="text-orange-200 font-semibold">{panchangData.tithi.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Sanskrit</span>
                          <span className="text-orange-200">{panchangData.tithi.sanskrit}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Number</span>
                          <Badge variant="secondary">#{panchangData.tithi.number}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Paksh</span>
                          <span className="text-orange-200">{panchangData.tithi.paksh}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-orange-500/20">
                        <p className="text-sm text-muted-foreground mb-1">Deity</p>
                        <p className="text-orange-200">{panchangData.tithi.deity}</p>
                      </div>
                      <div className="pt-2 border-t border-orange-500/20">
                        <p className="text-xs text-muted-foreground mb-1">Significance</p>
                        <p className="text-xs text-orange-300">{panchangData.tithi.significance}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detailed Nakshatra Information */}
                  <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-400">
                        <Star className="h-5 w-5" />
                        नक्षत्र विस्तार / Nakshatra Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Name</span>
                          <span className="text-blue-200 font-semibold">{panchangData.nakshatra.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Sanskrit</span>
                          <span className="text-blue-200">{panchangData.nakshatra.sanskrit}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Lord</span>
                          <span className="text-blue-200">{panchangData.nakshatra.lord}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-blue-500/20">
                        <p className="text-sm text-muted-foreground mb-1">Deity</p>
                        <p className="text-blue-200">{panchangData.nakshatra.deity}</p>
                      </div>
                      <div className="pt-2 border-t border-blue-500/20">
                        <p className="text-xs text-muted-foreground mb-1">Qualities</p>
                        <p className="text-xs text-blue-300">{panchangData.nakshatra.qualities}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Combined Yoga & Karana Details */}
                  <Card className="bg-gradient-to-br from-green-900/20 to-purple-900/20 border-green-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-400">
                        <Calendar className="h-5 w-5" />
                        योग व करण / Yoga & Karana
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-green-300 mb-2">Yoga Details</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Name</span>
                            <span className="text-green-200">{panchangData.yoga.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Type</span>
                            <span className="text-green-200">{panchangData.yoga.type}</span>
                          </div>
                          <p className="text-xs text-green-300">{panchangData.yoga.meaning}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-green-500/20">
                        <h4 className="text-sm font-semibold text-purple-300 mb-2">Karana Details</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Name</span>
                            <span className="text-purple-200">{panchangData.karana.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Type</span>
                            <span className="text-purple-200">{panchangData.karana.type}</span>
                          </div>
                          <p className="text-xs text-purple-300">{panchangData.karana.meaning}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Advanced Vedic Calendar Information */}
                <Card className="bg-gradient-to-br from-amber-900/20 to-yellow-900/20 border-amber-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-400">
                      <Calendar className="h-5 w-5" />
                      विस्तृत कैलेंडर / Advanced Calendar Systems
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-amber-300 mb-2">Current Period</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Yug</span>
                            <span className="text-amber-200">{panchangData.yug}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Masa</span>
                            <span className="text-amber-200">{panchangData.masa}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Vara</span>
                            <span className="text-amber-200">{panchangData.vara}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-amber-300 mb-2">Kaal Ikai Elements</h4>
                        <div className="flex flex-wrap gap-1">
                          {panchangData.kaalIkai.map((element, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-amber-400">
                              {element}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-amber-300 mb-2">Samvat Systems</h4>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-amber-200">{panchangData.samvat.length}</div>
                          <div className="text-xs text-muted-foreground">Calendar Types</div>
                          <div className="mt-2 max-h-20 overflow-y-auto">
                            <div className="flex flex-wrap gap-1">
                              {panchangData.samvat.slice(0, 6).map((samvat, index) => (
                                <Badge key={index} variant="secondary" className="text-xs bg-amber-500/20">
                                  {samvat}
                                </Badge>
                              ))}
                              {panchangData.samvat.length > 6 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{panchangData.samvat.length - 6} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Comprehensive Timing Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Auspicious Times */}
                  <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-400">
                        <Sun className="h-5 w-5" />
                        Auspicious Times (Shubh Muhurat)
                      </CardTitle>
                      <CardDescription className="text-green-200">
                        Favorable periods for important activities, ceremonies, and new beginnings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-lg font-semibold text-green-300">Abhijit Muhurat</span>
                          <span className="text-green-200 font-mono text-lg">{panchangData.shubhMuhurat.abhijitMuhurat}</span>
                        </div>
                        <p className="text-sm text-green-400 leading-relaxed mb-3">
                          The most auspicious time of the day, occurring around midday. This 48-minute period is considered 
                          universally favorable for all activities, especially starting new ventures, signing contracts, 
                          and making important decisions.
                        </p>
                        <div className="bg-green-900/20 p-3 rounded">
                          <p className="text-xs text-green-300">
                            <strong>Best for:</strong> Business launches, property purchases, job interviews, 
                            educational activities, travel, and spiritual practices.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-green-900/20 p-3 rounded-lg">
                        <h4 className="text-sm font-semibold text-green-300 mb-2">Understanding Shubh Muhurat</h4>
                        <p className="text-xs text-green-400 leading-relaxed">
                          A Muhurat is an auspicious time period calculated based on planetary positions, lunar phases, 
                          and stellar alignments. Hindu tradition emphasizes timing activities during favorable periods 
                          to ensure success, prosperity, and positive outcomes. Even for non-believers, these periods 
                          represent times of heightened cosmic energy and natural harmony.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Inauspicious Times */}
                  <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-400">
                        <Clock className="h-5 w-5" />
                        Inauspicious Times (Ashubh Kaal)
                      </CardTitle>
                      <CardDescription className="text-red-200">
                        Periods to avoid for important activities, ceremonies, and major decisions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      
                      <div className="bg-red-900/30 p-4 rounded-lg border border-red-500/30">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-lg font-semibold text-red-300">Rahu Kaal</span>
                          <span className="text-red-200 font-mono text-lg">{panchangData.shubhMuhurat.brahmaRahukaal}</span>
                        </div>
                        <p className="text-sm text-red-400 leading-relaxed mb-2">
                          Named after the shadow planet Rahu, this 90-minute period occurs daily at different times 
                          depending on the weekday. Considered highly inauspicious for starting new ventures.
                        </p>
                        <div className="bg-red-900/20 p-2 rounded text-xs text-red-300">
                          <strong>Avoid:</strong> New business ventures, travel, signing contracts, job interviews, 
                          purchasing property, and important meetings.
                        </div>
                      </div>

                      <div className="bg-red-900/30 p-4 rounded-lg border border-red-500/30">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-lg font-semibold text-red-300">Gulika Kaal</span>
                          <span className="text-red-200 font-mono text-lg">{panchangData.shubhMuhurat.gulikaKaal}</span>
                        </div>
                        <p className="text-sm text-red-400 leading-relaxed mb-2">
                          Ruled by Gulika (Saturn's son), this period brings delays, obstacles, and negative energy. 
                          Traditional time for reflection rather than action.
                        </p>
                        <div className="bg-red-900/20 p-2 rounded text-xs text-red-300">
                          <strong>Avoid:</strong> Important decisions, financial transactions, and social events.
                        </div>
                      </div>

                      <div className="bg-red-900/30 p-4 rounded-lg border border-red-500/30">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-lg font-semibold text-red-300">Yama Ganda</span>
                          <span className="text-red-200 font-mono text-lg">{panchangData.shubhMuhurat.yamaGandaKaal}</span>
                        </div>
                        <p className="text-sm text-red-400 leading-relaxed mb-2">
                          Associated with Yama (god of death), this period is considered most inauspicious for any activity. 
                          Time for meditation and introspection.
                        </p>
                        <div className="bg-red-900/20 p-2 rounded text-xs text-red-300">
                          <strong>Avoid:</strong> Travel, ceremonies, medical procedures, and life-changing decisions.
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Complete Vedic Calendar System */}
                <Card className="bg-gradient-to-br from-slate-900/20 to-gray-900/20 border-slate-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-400">
                      <Calendar className="h-5 w-5" />
                      Complete Vedic Calendar System
                    </CardTitle>
                    <CardDescription className="text-slate-200">
                      Comprehensive time-keeping system used for spiritual, agricultural, and social planning
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Current Time Periods */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-900/30 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-slate-300 mb-3">Current Era</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Yuga (Era):</span>
                            <span className="text-slate-200">{panchangData.yug}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Masa (Month):</span>
                            <span className="text-slate-200">{panchangData.masa}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Vara (Weekday):</span>
                            <span className="text-slate-200">{panchangData.vara}</span>
                          </div>
                        </div>
                        <div className="mt-3 bg-slate-900/20 p-2 rounded text-xs text-slate-400">
                          We are currently in Kali Yuga, the fourth and final era in the cycle of time, 
                          characterized by spiritual darkness but also opportunity for rapid spiritual growth.
                        </div>
                      </div>

                      <div className="bg-slate-900/30 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-slate-300 mb-3">Time Elements (Kaal Ikai)</h4>
                        <div className="space-y-2">
                          {panchangData.kaalIkai.map((element, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs border-slate-400">{element}</Badge>
                              <span className="text-xs text-slate-400">
                                {index === 0 && "(Cosmic Day)"}
                                {index === 1 && "(Age of Manu)"}
                                {index === 2 && "(Yuga Cycle)"}
                                {index === 3 && "(Year)"}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 bg-slate-900/20 p-2 rounded text-xs text-slate-400">
                          These represent the hierarchical time divisions in Hindu cosmology, 
                          from the smallest (Samvat/Year) to the largest (Kalpa/Cosmic Day of Brahma).
                        </div>
                      </div>

                      <div className="bg-slate-900/30 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-slate-300 mb-3">Calendar Systems</h4>
                        <div className="text-center mb-3">
                          <div className="text-3xl font-bold text-slate-200">{panchangData.samvat.length}</div>
                          <div className="text-xs text-muted-foreground">Active Samvat Systems</div>
                        </div>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {panchangData.samvat.slice(0, 8).map((samvat, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-slate-500/20 mr-1 mb-1">
                              {samvat}
                            </Badge>
                          ))}
                          {panchangData.samvat.length > 8 && (
                            <Badge variant="secondary" className="text-xs">
                              +{panchangData.samvat.length - 8} more
                            </Badge>
                          )}
                        </div>
                        <div className="mt-3 bg-slate-900/20 p-2 rounded text-xs text-slate-400">
                          Different regions and traditions use various calendar systems, 
                          each with its own epoch and cultural significance.
                        </div>
                      </div>
                    </div>

                    {/* What Each System Means */}
                    <div className="bg-slate-900/20 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-slate-300 mb-4">Understanding the Panchang System</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h5 className="font-semibold text-slate-300 mb-2">For Hindu Practitioners:</h5>
                          <p className="text-slate-400 leading-relaxed">
                            The Panchang is your daily spiritual compass, guiding you through optimal times for prayers, 
                            rituals, fasting, and life events. Each element carries deep spiritual significance connected 
                            to cosmic energies, planetary influences, and divine timing that affects your karma and spiritual progress.
                          </p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-slate-300 mb-2">For Everyone Else:</h5>
                          <p className="text-slate-400 leading-relaxed">
                            Think of the Panchang as an ancient astronomical calendar that tracks celestial cycles 
                            affecting Earth. Many modern studies suggest lunar phases influence human behavior, tides, 
                            and natural rhythms. This system helps align daily activities with natural cosmic patterns 
                            for optimal results and well-being.
                          </p>
                        </div>
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
                        त्योहार व व्रत / Festivals & Vrats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {panchangData.festivals.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-rose-300 mb-2">🎉 Today's Festivals</h4>
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
                          <h4 className="text-sm font-semibold text-rose-300 mb-2">🙏 Vrats & Spiritual Occasions</h4>
                          <div className="flex flex-wrap gap-2">
                            {panchangData.vratsAndOccasions.map((vrat, index) => (
                              <Badge key={index} variant="outline" className="border-rose-400">
                                {vrat}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {panchangData.festivals.length === 0 && panchangData.vratsAndOccasions.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">No major festivals or vrats today</p>
                          <p className="text-xs text-muted-foreground mt-1">Perfect day for regular spiritual practices</p>
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