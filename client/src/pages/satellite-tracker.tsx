import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/navigation';
import { CosmicCursor } from '@/components/cosmic-cursor';
import { Satellite, MapPin, Clock, Target, Zap, Eye, RefreshCw, Search } from 'lucide-react';

interface SatelliteData {
  id: string;
  name: string;
  noradId: number;
  type: 'space_station' | 'communication' | 'earth_observation' | 'navigation' | 'scientific' | 'military' | 'debris';
  position: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  velocity: {
    speed: number;
    direction: number;
  };
  orbit: {
    period: number;
    inclination: number;
    apogee: number;
    perigee: number;
  };
  nextPass?: {
    aos: string;
    los: string;
    maxElevation: number;
    direction: string;
    magnitude: number;
  };
  status: 'active' | 'inactive' | 'unknown';
  launchDate: string;
  country: string;
  description: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  display: string;
  timezone: string;
}

export default function SatelliteTracker() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // This function would need authentic orbital mechanics API data
  // Removing synthetic position calculations to maintain data integrity

  // This function would need authentic satellite tracking API data
  // Removing synthetic calculations to maintain data integrity

  // Get user's actual coordinates using browser geolocation
  const [coordinates, setCoordinates] = useState<{lat: number; lon: number} | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lon: longitude });
          setGeoError(null);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setGeoError(error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5 * 60 * 1000 // 5 minutes
        }
      );
    } else {
      setGeoError('Geolocation not supported');
    }
  }, []);

  // Use React Query for location data with actual coordinates
  const { data: userLocation, isLoading: locationLoading, refetch: refetchLocation } = useQuery<LocationData>({
    queryKey: ['/api/location', coordinates?.lat, coordinates?.lon],
    queryFn: async () => {
      if (!coordinates) {
        throw new Error('No coordinates available');
      }
      const response = await fetch(`/api/location?lat=${coordinates.lat}&lon=${coordinates.lon}`);
      if (!response.ok) {
        throw new Error('Failed to fetch location');
      }
      return response.json();
    },
    enabled: !!coordinates,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const handleRefreshLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lon: longitude });
          setGeoError(null);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setGeoError(error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0 // Force fresh location
        }
      );
    }
  };

  // Get current time and user location for calculations
  const now = new Date();
  const baseTime = now.getTime();
  const userLat = userLocation?.latitude || 0;
  const userLon = userLocation?.longitude || 0;

  // Fetch satellites from API - replacing hardcoded data
  const { data: satellites = [], isLoading: satellitesLoading, error: satellitesError } = useQuery<SatelliteData[]>({
    queryKey: ['/api/satellites', userLat, userLon],
    queryFn: async () => {
      const response = await fetch(`/api/satellites?lat=${userLat}&lon=${userLon}`);
      if (!response.ok) {
        throw new Error('Failed to fetch satellite data');
      }
      return response.json();
    },
    enabled: !!userLocation,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // 1 minute
  });

  const categories = [
    { id: 'all', name: 'All Satellites', count: satellites.length },
    { id: 'space_station', name: 'Space Stations', count: satellites.filter(s => s.type === 'space_station').length },
    { id: 'communication', name: 'Communication', count: satellites.filter(s => s.type === 'communication').length },
    { id: 'earth_observation', name: 'Earth Observation', count: satellites.filter(s => s.type === 'earth_observation').length },
    { id: 'navigation', name: 'Navigation', count: satellites.filter(s => s.type === 'navigation').length },
    { id: 'scientific', name: 'Scientific', count: satellites.filter(s => s.type === 'scientific').length },
    { id: 'military', name: 'Military', count: satellites.filter(s => s.type === 'military').length },
    { id: 'debris', name: 'Space Debris', count: satellites.filter(s => s.type === 'debris').length }
  ];

  const filteredSatellites = satellites.filter(satellite => {
    const matchesCategory = selectedCategory === 'all' || satellite.type === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      satellite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      satellite.country.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  // Show error state if satellites API fails
  if (satellitesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <CosmicCursor />
        <Navigation />
        
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-6">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <Satellite className="h-10 w-10 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Satellite Tracking Data Unavailable
              </h1>
              <p className="text-muted-foreground mb-6">
                Real-time satellite tracking requires specialized orbital mechanics APIs and NORAD data access. 
                Please configure satellite tracking credentials to monitor live satellite positions.
              </p>
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Explore Other Features
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <CosmicCursor />
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Satellite Tracker
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Track real-time satellite positions and predict flyover times for your location
          </p>
        </div>

        {satellitesLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading satellite data...</p>
          </div>
        )}

        {/* Location Display */}
        <div className="flex justify-center items-center gap-4 mb-8">
          {locationLoading && (
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Detecting location...
            </Badge>
          )}
          {userLocation && (
            <Badge variant="secondary" className="bg-green-500/20 text-green-300">
              <MapPin className="w-4 h-4 mr-2" />
              {userLocation.display || userLocation.city}
            </Badge>
          )}
          {(!locationLoading && !userLocation) && (
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-300">
              <MapPin className="w-4 h-4 mr-2" />
              Location not detected
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshLocation}
            className="text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh Location
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search satellites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`text-xs ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-white/10 hover:bg-white/20 border-white/20'
                }`}
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>
        </div>

        {/* Satellites Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {filteredSatellites.map((satellite) => (
            <Card key={satellite.id} className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Satellite className="w-5 h-5 mr-2 text-blue-400" />
                  {satellite.name}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      satellite.status === 'active' 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {satellite.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                    {satellite.type.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="text-gray-300">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Position:</span>
                      <p>{satellite.position.latitude.toFixed(2)}°, {satellite.position.longitude.toFixed(2)}°</p>
                      <p>{satellite.position.altitude} km</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Velocity:</span>
                      <p>{satellite.velocity.speed.toLocaleString()} km/h</p>
                    </div>
                  </div>

                  <div className="text-xs">
                    <span className="text-gray-400">Orbit:</span>
                    <p>Period: {satellite.orbit.period.toFixed(1)} min</p>
                    <p>Inclination: {satellite.orbit.inclination}°</p>
                  </div>

                  {satellite.nextPass && (
                    <div className="bg-blue-500/10 p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Eye className="w-4 h-4 mr-2 text-blue-400" />
                        <span className="text-sm font-medium text-blue-300">Next Flyover</span>
                      </div>
                      <div className="text-xs space-y-1">
                        <p>Start: {formatTime(satellite.nextPass.aos)}</p>
                        <p>End: {formatTime(satellite.nextPass.los)}</p>
                        <p>Max Elevation: {satellite.nextPass.maxElevation}°</p>
                        <p>Direction: {satellite.nextPass.direction}</p>
                        <p>Magnitude: {satellite.nextPass.magnitude}</p>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    <p>Country: {satellite.country}</p>
                    <p>Launched: {formatDate(satellite.launchDate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-500" />
              Satellite Viewing Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 text-white">Best Viewing Conditions</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Clear, dark skies away from city lights</li>
                  <li>• Look during twilight hours (dawn/dusk)</li>
                  <li>• Use the predicted direction and elevation</li>
                  <li>• Brighter satellites (lower magnitude) are easier to spot</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-white">What You'll See</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Steady moving point of light (not blinking)</li>
                  <li>• ISS appears as bright as Venus (-3 to -4 magnitude)</li>
                  <li>• Satellites reflect sunlight, appearing brightest at twilight</li>
                  <li>• Movement is smooth and consistent across the sky</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}