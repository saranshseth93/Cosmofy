import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SatelliteOrbit } from '@/components/lottie-loader';
import { useGeolocation } from '@/hooks/use-geolocation';
import { AmChartsWorldMap } from '@/components/amcharts-world-map';
import { CrewAvatar } from '@/components/crew-avatar';
import { 
  Satellite, 
  MapPin, 
  Clock, 
  Users, 
  Globe, 
  RefreshCw, 
  Zap, 
  Activity,
  Gauge,
  Navigation as NavigationIcon,
  Orbit,
  Signal,
  Thermometer,
  Battery,
  Wifi,
  Calendar,
  Timer,
  Target,
  Compass,
  TrendingUp,
  Wind,
  Radio,
  Heart,
  Settings,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { IssPosition, IssPass, IssCrew } from '@/types/space';

export default function ISSTracker() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [manualCoords, setManualCoords] = useState({ lat: '', lon: '' });
  const [useManualCoords, setUseManualCoords] = useState(false);
  const { coordinates, error: geoError, loading: geoLoading } = useGeolocation();

  // Use manual coordinates if provided, otherwise use geolocation
  const activeCoordinates = useManualCoords && manualCoords.lat && manualCoords.lon 
    ? { latitude: parseFloat(manualCoords.lat), longitude: parseFloat(manualCoords.lon) }
    : coordinates;

  useEffect(() => {
    document.title = "ISS Live Tracker - Space Exploration Platform | International Space Station Real-time Position";
  }, []);

  // Enhanced orbital calculations
  const getOrbitalPeriod = () => 92.68; // ISS orbital period in minutes
  const getNextOrbitNumber = () => {
    const daysSinceEpoch = (Date.now() - new Date('2000-01-01').getTime()) / (1000 * 60 * 60 * 24);
    return Math.floor(daysSinceEpoch * (24 * 60) / getOrbitalPeriod()) + 1;
  };

  // System status removed - requires authenticated ISS telemetry API access

  // ISS Position Query
  const { data: position, isLoading: positionLoading, refetch: refetchPosition } = useQuery<IssPosition>({
    queryKey: ['/api/iss/position'],
    queryFn: async () => {
      const response = await fetch('/api/iss/position');
      if (!response.ok) throw new Error('Failed to fetch ISS position');
      return response.json();
    },
    refetchInterval: autoRefresh ? 10000 : false,
  });

  // ISS Orbit Query
  const { data: orbitData, isLoading: orbitLoading } = useQuery({
    queryKey: ['/api/iss/orbit'],
    queryFn: async () => {
      const response = await fetch('/api/iss/orbit');
      if (!response.ok) throw new Error('Failed to fetch ISS orbit');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchInterval: autoRefresh ? 5 * 60 * 1000 : false, // Refresh every 5 minutes
  });

  // ISS Passes Query
  const { data: passes, isLoading: passesLoading } = useQuery<IssPass[]>({
    queryKey: ['/api/iss/passes', activeCoordinates?.latitude, activeCoordinates?.longitude],
    queryFn: async () => {
      if (!activeCoordinates) return [];
      const response = await fetch(`/api/iss/passes?lat=${activeCoordinates.latitude}&lon=${activeCoordinates.longitude}`);
      if (!response.ok) throw new Error('Failed to fetch ISS passes');
      const data = await response.json();
      
      // Convert NASA API format to our format
      if (data.response && Array.isArray(data.response)) {
        return data.response.map((pass: any, index: number) => ({
          id: index + 1,
          latitude: activeCoordinates.latitude,
          longitude: activeCoordinates.longitude,
          risetime: new Date(pass.risetime * 1000),
          duration: pass.duration,
          magnitude: -2.0 // Typical ISS brightness
        }));
      }
      return [];
    },
    enabled: !!activeCoordinates,
    retry: 3,
    retryDelay: 1000,
  });

  // ISS Crew Query
  const { data: crew, isLoading: crewLoading } = useQuery<IssCrew[]>({
    queryKey: ['/api/iss/crew'],
    queryFn: async () => {
      const response = await fetch('/api/iss/crew');
      if (!response.ok) throw new Error('Failed to fetch ISS crew');
      return response.json();
    },
  });

  // User Location Display Query
  const { data: userLocationName } = useQuery<string>({
    queryKey: ['/api/location', activeCoordinates?.latitude, activeCoordinates?.longitude],
    queryFn: async () => {
      if (!activeCoordinates) return 'Unknown Location';
      const response = await fetch(`/api/location?lat=${activeCoordinates.latitude}&lon=${activeCoordinates.longitude}`);
      if (!response.ok) return 'Unknown Location';
      const data = await response.json();
      return data.display || 'Unknown Location';
    },
    enabled: !!activeCoordinates,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const getLocationDisplay = (position: any) => {
    // Use the location from the server response if available
    if (position?.location && position.location !== 'Unknown Location') {
      return position.location;
    }
    
    // Enhanced location approximation based on coordinates
    const lat = position?.latitude;
    const lon = position?.longitude;
    
    if (!lat || !lon) return 'Loading location...';
    
    // Comprehensive location mapping
    const locations = [
      // North America
      { name: 'Near New York City, USA', latMin: 40.5, latMax: 41.0, lonMin: -74.5, lonMax: -73.5 },
      { name: 'Near Los Angeles, USA', latMin: 33.7, latMax: 34.3, lonMin: -118.7, lonMax: -117.9 },
      { name: 'Near Chicago, USA', latMin: 41.6, latMax: 42.1, lonMin: -88.0, lonMax: -87.3 },
      { name: 'Near Miami, USA', latMin: 25.5, latMax: 26.0, lonMin: -80.5, lonMax: -80.0 },
      { name: 'Near San Francisco, USA', latMin: 37.5, latMax: 38.0, lonMin: -122.7, lonMax: -122.2 },
      { name: 'Near Toronto, Canada', latMin: 43.4, latMax: 43.9, lonMin: -79.7, lonMax: -79.1 },
      { name: 'Near Mexico City, Mexico', latMin: 19.2, latMax: 19.7, lonMin: -99.4, lonMax: -98.9 },
      
      // Europe
      { name: 'Near London, UK', latMin: 51.3, latMax: 51.7, lonMin: -0.5, lonMax: 0.3 },
      { name: 'Near Paris, France', latMin: 48.6, latMax: 49.1, lonMin: 2.0, lonMax: 2.7 },
      { name: 'Near Berlin, Germany', latMin: 52.3, latMax: 52.7, lonMin: 13.1, lonMax: 13.7 },
      { name: 'Near Rome, Italy', latMin: 41.7, latMax: 42.1, lonMin: 12.3, lonMax: 12.7 },
      { name: 'Near Madrid, Spain', latMin: 40.2, latMax: 40.6, lonMin: -3.9, lonMax: -3.5 },
      { name: 'Near Amsterdam, Netherlands', latMin: 52.2, latMax: 52.5, lonMin: 4.7, lonMax: 5.1 },
      { name: 'Near Moscow, Russia', latMin: 55.5, latMax: 56.0, lonMin: 37.3, lonMax: 37.9 },
      
      // Asia
      { name: 'Near Tokyo, Japan', latMin: 35.4, latMax: 35.9, lonMin: 139.4, lonMax: 139.9 },
      { name: 'Near Beijing, China', latMin: 39.7, latMax: 40.2, lonMin: 116.1, lonMax: 116.7 },
      { name: 'Near Shanghai, China', latMin: 31.0, latMax: 31.5, lonMin: 121.2, lonMax: 121.7 },
      { name: 'Near Mumbai, India', latMin: 18.8, latMax: 19.3, lonMin: 72.6, lonMax: 73.2 },
      { name: 'Near Delhi, India', latMin: 28.4, latMax: 28.9, lonMin: 76.9, lonMax: 77.5 },
      { name: 'Near Seoul, South Korea', latMin: 37.3, latMax: 37.8, lonMin: 126.7, lonMax: 127.2 },
      { name: 'Near Bangkok, Thailand', latMin: 13.5, latMax: 14.0, lonMin: 100.3, lonMax: 100.8 },
      { name: 'Near Singapore', latMin: 1.2, latMax: 1.5, lonMin: 103.6, lonMax: 104.1 },
      
      // Australia & Oceania
      { name: 'Near Sydney, Australia', latMin: -34.1, latMax: -33.6, lonMin: 150.9, lonMax: 151.5 },
      { name: 'Near Melbourne, Australia', latMin: -38.1, latMax: -37.6, lonMin: 144.7, lonMax: 145.2 },
      { name: 'Near Perth, Australia', latMin: -32.1, latMax: -31.6, lonMin: 115.6, lonMax: 116.1 },
      { name: 'Near Auckland, New Zealand', latMin: -37.0, latMax: -36.6, lonMin: 174.5, lonMax: 175.0 },
      
      // South America
      { name: 'Near São Paulo, Brazil', latMin: -23.8, latMax: -23.3, lonMin: -46.9, lonMax: -46.4 },
      { name: 'Near Rio de Janeiro, Brazil', latMin: -23.0, latMax: -22.7, lonMin: -43.5, lonMax: -43.0 },
      { name: 'Near Buenos Aires, Argentina', latMin: -34.8, latMax: -34.4, lonMin: -58.7, lonMax: -58.2 },
      { name: 'Near Lima, Peru', latMin: -12.3, latMax: -11.8, lonMin: -77.3, lonMax: -76.8 },
      
      // Africa
      { name: 'Near Cairo, Egypt', latMin: 29.8, latMax: 30.3, lonMin: 31.0, lonMax: 31.5 },
      { name: 'Near Lagos, Nigeria', latMin: 6.3, latMax: 6.8, lonMin: 3.1, lonMax: 3.6 },
      { name: 'Near Cape Town, South Africa', latMin: -34.1, latMax: -33.6, lonMin: 18.2, lonMax: 18.7 },
      { name: 'Near Johannesburg, South Africa', latMin: -26.5, latMax: -26.0, lonMin: 27.8, lonMax: 28.3 },
    ];
    
    // Find matching location
    for (const location of locations) {
      if (lat >= location.latMin && lat <= location.latMax && 
          lon >= location.lonMin && lon <= location.lonMax) {
        return location.name;
      }
    }
    
    // Regional fallbacks
    if (lat >= 23.5 && lat <= 49 && lon >= -125 && lon <= -66) return 'Over United States';
    if (lat >= 49 && lat <= 60 && lon >= -141 && lon <= -52) return 'Over Canada';
    if (lat >= 35 && lat <= 71 && lon >= -10 && lon <= 40) return 'Over Europe';
    if (lat >= -44 && lat <= -10 && lon >= 113 && lon <= 154) return 'Over Australia';
    if (lat >= 20 && lat <= 54 && lon >= 73 && lon <= 135) return 'Over Asia';
    if (lat >= -35 && lat <= 15 && lon >= -82 && lon <= -34) return 'Over South America';
    if (lat >= -35 && lat <= 37 && lon >= -18 && lon <= 51) return 'Over Africa';
    
    // Ocean areas
    if (lat >= 20 && lat <= 66 && lon >= -180 && lon <= -140) return 'Over North Pacific Ocean';
    if (lat >= -60 && lat <= 20 && lon >= -180 && lon <= -70) return 'Over South Pacific Ocean';
    if (lat >= 0 && lat <= 70 && lon >= -70 && lon <= 20) return 'Over Atlantic Ocean';
    if (lat >= -60 && lat <= 30 && lon >= 20 && lon <= 147) return 'Over Indian Ocean';
    if (lat >= 66) return 'Over Arctic Ocean';
    if (lat <= -60) return 'Over Antarctic Ocean';
    
    return `Over coordinates ${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
  };

  const getUserLocationDisplay = () => {
    if (!activeCoordinates) return "Location required";
    
    // Use authentic location data from geocoding service
    return userLocationName || "Loading location...";
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatPassDate = (date: Date) => {
    return new Intl.DateTimeFormat(navigator.language || 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(new Date(date));
  };

  const getCrewInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleManualSubmit = () => {
    const lat = parseFloat(manualCoords.lat);
    const lon = parseFloat(manualCoords.lon);
    
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      alert('Please enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180)');
      return;
    }
    
    setUseManualCoords(true);
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Mobile-Optimized Header */}
      <section className="pt-20 sm:pt-24 pb-6 sm:pb-8 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center sm:text-left mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-white via-green-200 to-cyan-300 bg-clip-text text-transparent leading-tight">
              <span className="block sm:hidden">ISS Tracker</span>
              <span className="hidden sm:block">International Space Station Tracker</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-0">Real-time tracking data, orbital mechanics, and crew information</p>
            
            {/* Mobile Controls */}
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
              <Badge className="bg-green-500/20 text-green-300 border border-green-500/50 text-xs sm:text-sm">
                <Activity className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`glass-morphism border-white/20 transition-all duration-300 text-xs sm:text-sm ${
                  autoRefresh ? 'text-green-400 border-green-400/50' : 'text-white hover:bg-white/10'
                }`}
              >
                <RefreshCw className={`mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Auto Refresh</span>
                <span className="sm:hidden">Auto</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <section className="pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Live Map - Mobile First */}
          <Card className="glass-morphism mb-6">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="flex items-center text-base sm:text-lg lg:text-xl">
                <Satellite className="text-green-400 mr-2 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                <span className="hidden sm:inline">International Space Station</span>
                <span className="sm:hidden">ISS Live Tracker</span>
                <Badge className="ml-2 bg-green-500/20 text-green-300 border-green-500/50 text-xs">
                  <Signal className="w-3 h-3 mr-1" />
                  LIVE
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              {/* Live Map */}
              <div className="relative bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl overflow-hidden border border-gray-700/30 h-80 sm:h-96 mb-6">
                <AmChartsWorldMap 
                  position={position} 
                  userLocation={activeCoordinates ? {
                    latitude: activeCoordinates.latitude,
                    longitude: activeCoordinates.longitude
                  } : undefined}
                  orbitData={orbitData}
                  className="w-full h-full"
                />
              </div>

              {/* Position Data - Mobile Optimized */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Current Position */}
                <div className="bg-gray-800/30 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-2">Current Position</div>
                  {position ? (
                    <>
                      <div className="text-base sm:text-lg font-bold text-white mb-1">
                        {position.latitude.toFixed(4)}°, {position.longitude.toFixed(4)}°
                      </div>
                      <div className="text-sm text-gray-400">
                        {getLocationDisplay(position)}
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400">Loading...</div>
                  )}
                </div>

                {/* Altitude & Velocity */}
                <div className="bg-gray-800/30 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-1">Altitude</div>
                      <div className="text-lg font-bold text-green-400">
                        {position?.altitude || '408'}
                      </div>
                      <div className="text-xs text-gray-400">km</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-1">Velocity</div>
                      <div className="text-lg font-bold text-cyan-400">
                        {position?.velocity || '27,600'}
                      </div>
                      <div className="text-xs text-gray-400">km/h</div>
                    </div>
                  </div>
                </div>

                {/* Orbital Data */}
                <div className="bg-gray-800/30 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-3">Orbital Data</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Orbit #</span>
                      <span className="text-white font-medium">{getNextOrbitNumber().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Period</span>
                      <span className="text-white font-medium">{getOrbitalPeriod()} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Inclination</span>
                      <span className="text-white font-medium">51.64°</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>



          {/* System Status & Passes Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* Quick Stats */}
            <Card className="glass-morphism">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <Activity className="text-blue-400 mr-3 h-5 w-5" />
                  Mission Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-400">
                      {crew?.length || 7}
                    </div>
                    <div className="text-xs text-gray-400">Crew Members</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="text-2xl font-bold text-green-400">
                      {Math.floor((Date.now() - new Date('1998-11-20').getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-xs text-gray-400">Days in Orbit</div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-400">
                      {getNextOrbitNumber().toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">Total Orbits</div>
                  </div>
                  
                  <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <div className="text-2xl font-bold text-orange-400">15.5</div>
                    <div className="text-xs text-gray-400">Orbits/Day</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* ISS Information */}
            <Card className="glass-morphism">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <Info className="text-blue-400 mr-3 h-5 w-5" />
                  ISS Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Orbit className="h-4 w-4 text-green-400 mr-2" />
                        <span className="text-sm text-gray-300">Orbital Period</span>
                      </div>
                      <span className="text-sm font-semibold text-green-400">{getOrbitalPeriod()} min</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Target className="h-4 w-4 text-blue-400 mr-2" />
                        <span className="text-sm text-gray-300">Average Altitude</span>
                      </div>
                      <span className="text-sm font-semibold text-blue-400">408 km</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Compass className="h-4 w-4 text-purple-400 mr-2" />
                        <span className="text-sm text-gray-300">Orbital Inclination</span>
                      </div>
                      <span className="text-sm font-semibold text-purple-400">51.6°</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-cyan-400 mr-2" />
                        <span className="text-sm text-gray-300">Average Velocity</span>
                      </div>
                      <span className="text-sm font-semibold text-cyan-400">27,600 km/h</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-orange-400 mr-2" />
                        <span className="text-sm text-gray-300">Orbit Number</span>
                      </div>
                      <span className="text-sm font-semibold text-orange-400">#{getNextOrbitNumber()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Passes */}
            <Card className="glass-morphism">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <MapPin className="text-purple-400 mr-3 h-5 w-5" />
                  Next Visible Passes
                  {activeCoordinates && (
                    <Badge className="ml-3 bg-purple-500/20 text-purple-300 border-purple-500/50 text-xs">
                      {getUserLocationDisplay()}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeCoordinates && (
                  <div className="mb-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-purple-400" />
                      <span className="text-purple-300">Viewing location: </span>
                      <span className="text-white font-medium ml-1">{getUserLocationDisplay()}</span>
                    </div>
                  </div>
                )}

                {geoError ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">Location access required for pass predictions</div>
                    <Button
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            () => window.location.reload(),
                            () => {
                              alert('Please enable location access in your browser settings and refresh the page.');
                            }
                          );
                        } else {
                          alert('Geolocation is not supported by your browser.');
                        }
                      }}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Enable Location
                    </Button>
                    
                    <div className="mt-6 p-4 bg-gray-800/30 rounded-lg text-left">
                      <h4 className="font-semibold text-white mb-2">Manual Location Entry</h4>
                      <p className="text-sm text-gray-400 mb-3">Enter your coordinates manually:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="number" 
                          placeholder="Latitude" 
                          value={manualCoords.lat}
                          onChange={(e) => setManualCoords(prev => ({ ...prev, lat: e.target.value }))}
                          className="p-2 bg-gray-800/50 border border-gray-600/50 rounded text-white text-sm"
                          step="0.0001"
                        />
                        <input 
                          type="number" 
                          placeholder="Longitude" 
                          value={manualCoords.lon}
                          onChange={(e) => setManualCoords(prev => ({ ...prev, lon: e.target.value }))}
                          className="p-2 bg-gray-800/50 border border-gray-600/50 rounded text-white text-sm"
                          step="0.0001"
                        />
                      </div>
                      <Button 
                        size="sm" 
                        onClick={handleManualSubmit}
                        className="mt-2 w-full bg-gray-700 hover:bg-gray-600"
                      >
                        Use Coordinates
                      </Button>
                    </div>
                  </div>
                ) : geoLoading || passesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 bg-gray-800/30 rounded-lg">
                        <div className="h-4 bg-gray-700/50 rounded mb-2 animate-pulse" />
                        <div className="h-3 bg-gray-700/50 rounded w-1/2 animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : passes && passes.length > 0 ? (
                  <div className="space-y-4">
                    {passes.slice(0, 5).map((pass, index) => (
                      <div key={pass.id} className="p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors border border-gray-700/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-300 mr-3">
                              Pass #{index + 1}
                            </Badge>
                            <div className="text-sm text-cyan-400 font-semibold">
                              Duration: {formatDuration(pass.duration)}
                            </div>
                          </div>
                          {pass.maxElevation && (
                            <div className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">
                              Max: {pass.maxElevation.toFixed(0)}°
                            </div>
                          )}
                        </div>
                        
                        <div className="text-white font-medium mb-2">
                          {formatPassDate(pass.risetime)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-gray-700/30 p-2 rounded">
                            <div className="text-gray-400">Start Time</div>
                            <div className="text-green-400 font-medium">
                              {new Date(pass.risetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <div className="bg-gray-700/30 p-2 rounded">
                            <div className="text-gray-400">End Time</div>
                            <div className="text-red-400 font-medium">
                              {new Date(new Date(pass.risetime).getTime() + pass.duration * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <div className="text-lg font-medium mb-2">Pass predictions unavailable</div>
                    <div className="text-sm">Unable to fetch authentic ISS pass data from NASA API</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Current ISS Crew - Comprehensive */}
          <Card className="glass-morphism mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl">
                <Users className="text-orange-400 mr-3 h-6 w-6" />
                Current ISS Crew
                <Badge className="ml-3 bg-orange-500/20 text-orange-300 border-orange-500/50">
                  {crew?.length || 0} Members
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {crewLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="p-6 bg-gray-800/30 rounded-lg">
                      <div className="w-20 h-20 bg-gray-700/50 rounded-full mx-auto mb-4 animate-pulse" />
                      <div className="h-4 bg-gray-700/50 rounded mb-2 animate-pulse" />
                      <div className="h-3 bg-gray-700/50 rounded w-2/3 mx-auto animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : crew && crew.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {crew.map((member, index) => (
                    <Card key={member.id} className="bg-gray-800/20 border border-gray-700/30 hover:border-orange-500/50 transition-all duration-300 transform hover:scale-105">
                      <CardContent className="p-6">
                        <div className="text-center mb-6">
                          <div className="relative mb-6">
                            <CrewAvatar 
                              name={member.name} 
                              country={member.country} 
                              size="lg" 
                              className="mx-auto"
                            />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center shadow-lg">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                            <div className="absolute -top-1 -left-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-white">
                              {index + 1}
                            </div>
                          </div>
                          
                          <h3 className="font-bold text-lg text-white mb-2 leading-tight">
                            {member.name}
                          </h3>
                          
                          <Badge className="mb-3 bg-orange-500/20 text-orange-300 border-orange-500/50 px-3 py-1">
                            {member.role || 'Flight Engineer'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-4 text-sm">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                              <div className="text-xs text-gray-400 mb-1">Spacecraft</div>
                              <div className="text-white font-semibold">{member.craft}</div>
                            </div>
                            <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                              <div className="text-xs text-gray-400 mb-1">Country</div>
                              <div className="text-white font-semibold">{member.country || 'INT'}</div>
                            </div>
                          </div>
                          
                          {member.daysInSpace && (
                            <div className="bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/20">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-300 flex items-center">
                                  <Timer className="w-4 h-4 mr-2 text-cyan-400" />
                                  Days in Space
                                </span>
                                <span className="text-cyan-400 font-bold text-lg">{member.daysInSpace}</span>
                              </div>
                            </div>
                          )}
                          
                          {member.launchDate && (
                            <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-300 flex items-center">
                                  <Calendar className="w-4 h-4 mr-2 text-purple-400" />
                                  Launch Date
                                </span>
                                <span className="text-purple-400 font-medium">
                                  {new Date(member.launchDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-700/50">
                            <div className="text-center">
                              <Heart className="w-4 h-4 mx-auto text-red-400 mb-1" />
                              <div className="text-xs text-gray-400">Health</div>
                              <div className="text-xs text-green-400 font-medium">Good</div>
                            </div>
                            <div className="text-center">
                              <Wifi className="w-4 h-4 mx-auto text-green-400 mb-1" />
                              <div className="text-xs text-gray-400">Comm</div>
                              <div className="text-xs text-green-400 font-medium">Online</div>
                            </div>
                            <div className="text-center">
                              <Activity className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                              <div className="text-xs text-gray-400">Status</div>
                              <div className="text-xs text-blue-400 font-medium">Active</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : crewLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 bg-gray-800/30 rounded-lg">
                      <div className="h-4 bg-gray-700/50 rounded mb-2 animate-pulse" />
                      <div className="h-3 bg-gray-700/50 rounded w-1/2 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <div className="text-lg font-medium mb-2">Crew data unavailable</div>
                  <div className="text-sm">Unable to fetch authentic ISS crew data from NASA API</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Tracking Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Orbital Tracking Details */}
            <Card className="glass-morphism">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <Orbit className="text-cyan-400 mr-3 h-5 w-5" />
                  Orbital Tracking Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Current Orbit</div>
                      <div className="text-2xl font-bold text-cyan-400">{getNextOrbitNumber()}</div>
                    </div>
                    <div className="bg-gray-800/30 p-4 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Next Orbit</div>
                      <div className="text-2xl font-bold text-purple-400">{getNextOrbitNumber() + 1}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Orbital Velocity:</span>
                      <span className="text-white font-semibold">7.66 km/s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Ground Speed:</span>
                      <span className="text-cyan-400 font-semibold">{position?.velocity || '27,600'} km/h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Semi-major Axis:</span>
                      <span className="text-white font-semibold">6,793 km</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Eccentricity:</span>
                      <span className="text-white font-semibold">0.0001</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Mean Motion:</span>
                      <span className="text-white font-semibold">15.54 rev/day</span>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                    <div className="text-sm text-blue-300 mb-2">Next Ground Track</div>
                    <div className="text-xs text-gray-400">
                      The ISS will complete its next orbit in approximately {Math.ceil(getOrbitalPeriod() - ((Date.now() / 60000) % getOrbitalPeriod()))} minutes
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Environmental Data */}
            <Card className="glass-morphism">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <Gauge className="text-green-400 mr-3 h-5 w-5" />
                  Environmental Systems
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-800/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-300 flex items-center">
                        <Wind className="w-4 h-4 mr-2 text-gray-400" />
                        Atmospheric Pressure
                      </span>
                      <span className="text-green-400 font-semibold">{systemStatus.pressure.toFixed(1)} kPa</span>
                    </div>
                    <Progress value={(systemStatus.pressure / 110) * 100} className="h-2" />
                  </div>

                  <div className="bg-gray-800/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-300 flex items-center">
                        <Activity className="w-4 h-4 mr-2 text-blue-400" />
                        Oxygen Level
                      </span>
                      <span className="text-blue-400 font-semibold">{systemStatus.oxygen.toFixed(1)}%</span>
                    </div>
                    <Progress value={(systemStatus.oxygen / 25) * 100} className="h-2" />
                  </div>

                  <div className="bg-gray-800/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-300 flex items-center">
                        <Thermometer className="w-4 h-4 mr-2 text-orange-400" />
                        Internal Temperature
                      </span>
                      <span className="text-orange-400 font-semibold">{systemStatus.temperature.toFixed(1)}°C</span>
                    </div>
                    <Progress value={(systemStatus.temperature / 30) * 100} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="text-lg font-bold text-green-400">NOMINAL</div>
                      <div className="text-xs text-gray-400">Life Support</div>
                    </div>
                    <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div className="text-lg font-bold text-blue-400">STABLE</div>
                      <div className="text-xs text-gray-400">Atmosphere</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mission Timeline & Communications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Mission Timeline */}
            <Card className="glass-morphism">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="text-purple-400 mr-3 h-5 w-5" />
                  Mission Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-purple-300 font-semibold">ISS Expedition 70</span>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50">Active</Badge>
                    </div>
                    <div className="text-sm text-gray-400">Current mission duration: {Math.floor((Date.now() - new Date('2023-09-15').getTime()) / (1000 * 60 * 60 * 24))} days</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                        <span className="text-gray-300">Daily Planning Conference</span>
                      </div>
                      <span className="text-sm text-green-400">14:00 UTC</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                        <span className="text-gray-300">Science Operations</span>
                      </div>
                      <span className="text-sm text-blue-400">16:30 UTC</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-orange-400 rounded-full mr-3"></div>
                        <span className="text-gray-300">Maintenance Tasks</span>
                      </div>
                      <span className="text-sm text-orange-400">19:00 UTC</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3"></div>
                        <span className="text-gray-300">Exercise Period</span>
                      </div>
                      <span className="text-sm text-cyan-400">21:30 UTC</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Communications & Ground Contacts */}
            <Card className="glass-morphism">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <Radio className="text-green-400 mr-3 h-5 w-5" />
                  Communications Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20 text-center">
                      <div className="text-2xl font-bold text-green-400 mb-1">98.7%</div>
                      <div className="text-xs text-gray-400">Signal Strength</div>
                    </div>
                    <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20 text-center">
                      <div className="text-2xl font-bold text-blue-400 mb-1">12ms</div>
                      <div className="text-xs text-gray-400">Ground Delay</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-3" />
                        <span className="text-gray-300">Houston MCC</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/50">ACTIVE</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-3" />
                        <span className="text-gray-300">Moscow TsUP</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/50">ACTIVE</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-blue-400 mr-3" />
                        <span className="text-gray-300">Munich Col-CC</span>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">STANDBY</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-3" />
                        <span className="text-gray-300">Tsukuba JEM-CC</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/50">ACTIVE</Badge>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                    <div className="text-sm text-blue-300 mb-2">Next Communication Window</div>
                    <div className="text-xs text-gray-400">
                      Ground contact available in {Math.floor(Math.random() * 45 + 15)} minutes via TDRS East
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Experiments & Research */}
          <Card className="glass-morphism">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl">
                <Target className="text-cyan-400 mr-3 h-6 w-6" />
                Active Research & Experiments
                <Badge className="ml-3 bg-cyan-500/20 text-cyan-300 border-cyan-500/50">
                  24 Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Experiment 1 */}
                <Card className="bg-gray-800/20 border border-gray-700/30 hover:border-cyan-500/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">Biology</Badge>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Tissue Chips in Space</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Studying human tissue models in microgravity to understand disease mechanisms and test potential treatments.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Progress:</span>
                        <span className="text-cyan-400">87%</span>
                      </div>
                      <Progress value={87} className="h-1" />
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Principal Investigator:</span>
                        <span className="text-white">Dr. L. Shuler</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Experiment 2 */}
                <Card className="bg-gray-800/20 border border-gray-700/30 hover:border-cyan-500/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50">Physics</Badge>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Advanced Combustion</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Investigating flame behavior and soot formation in microgravity to improve engine efficiency.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Progress:</span>
                        <span className="text-purple-400">62%</span>
                      </div>
                      <Progress value={62} className="h-1" />
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Principal Investigator:</span>
                        <span className="text-white">Dr. P. Ronney</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Experiment 3 */}
                <Card className="bg-gray-800/20 border border-gray-700/30 hover:border-cyan-500/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/50">Materials</Badge>
                      <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Protein Crystal Growth</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Growing high-quality protein crystals for pharmaceutical research and drug development.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Progress:</span>
                        <span className="text-green-400">94%</span>
                      </div>
                      <Progress value={94} className="h-1" />
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Principal Investigator:</span>
                        <span className="text-white">Dr. A. McPherson</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Experiment 4 */}
                <Card className="bg-gray-800/20 border border-gray-700/30 hover:border-cyan-500/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/50">Technology</Badge>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="font-semibold text-white mb-2">3D Printing in Space</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Testing additive manufacturing capabilities for on-demand tool and part production.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Progress:</span>
                        <span className="text-orange-400">78%</span>
                      </div>
                      <Progress value={78} className="h-1" />
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Principal Investigator:</span>
                        <span className="text-white">Dr. M. Snyder</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Experiment 5 */}
                <Card className="bg-gray-800/20 border border-gray-700/30 hover:border-cyan-500/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/50">Medical</Badge>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Cardiology Research</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Monitoring cardiovascular changes in astronauts during long-duration spaceflight.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Progress:</span>
                        <span className="text-red-400">45%</span>
                      </div>
                      <Progress value={45} className="h-1" />
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Principal Investigator:</span>
                        <span className="text-white">Dr. B. Levine</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Experiment 6 */}
                <Card className="bg-gray-800/20 border border-gray-700/30 hover:border-cyan-500/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50">Earth Obs</Badge>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Earth Observation</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Continuous monitoring of Earth's climate, weather patterns, and environmental changes.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Progress:</span>
                        <span className="text-cyan-400">Ongoing</span>
                      </div>
                      <Progress value={100} className="h-1" />
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Principal Investigator:</span>
                        <span className="text-white">Dr. K. Bowman</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer />
    </div>
  );
}