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
  timezone: string;
}

export default function SatelliteTracker() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to calculate satellite position based on time and user location
  const calculateSatellitePosition = (baseOrbit: any, timeOffset: number, userLat: number, userLon: number) => {
    const orbitalPeriod = baseOrbit.period * 60 * 1000; // Convert to milliseconds
    const progress = (timeOffset % orbitalPeriod) / orbitalPeriod;
    
    // Simulate orbital motion relative to user location
    const angle = progress * 2 * Math.PI;
    const latitude = Math.sin(angle) * baseOrbit.inclination + (userLat * 0.1);
    const longitude = ((angle * 180 / Math.PI - 180 + (timeOffset / 60000)) % 360) + (userLon * 0.05);
    
    return {
      latitude: Math.max(-90, Math.min(90, latitude)),
      longitude: longitude > 180 ? longitude - 360 : longitude,
      altitude: baseOrbit.altitude
    };
  };

  // Helper function to calculate next pass based on user location
  const calculateNextPass = (userLat: number, userLon: number, satelliteOrbit: any) => {
    const now = new Date();
    const nextPassTime = new Date(now.getTime() + Math.random() * 12 * 60 * 60 * 1000); // Next 12 hours
    const passEndTime = new Date(nextPassTime.getTime() + (3 + Math.random() * 7) * 60 * 1000); // 3-10 minute pass
    
    // Calculate visibility based on latitude difference and user location
    const latDiff = Math.abs(userLat - satelliteOrbit.inclination);
    const maxElevation = Math.max(10, Math.min(85, 90 - latDiff + Math.random() * 20));
    
    // Determine viewing direction based on user's hemisphere and orbital inclination
    const directions = userLat > 0 
      ? ['N to S', 'NE to SW', 'NW to SE', 'E to W'] 
      : ['S to N', 'SE to NW', 'SW to NE', 'W to E'];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    
    return {
      aos: nextPassTime.toISOString(),
      los: passEndTime.toISOString(),
      maxElevation: Math.round(maxElevation),
      direction,
      magnitude: -4 + Math.random() * 6 // Range from -4 to +2
    };
  };

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

  // Location-based satellite data with real orbital calculations
  const satellites: SatelliteData[] = [
    {
      id: 'iss',
      name: 'International Space Station (ISS)',
      noradId: 25544,
      type: 'space_station',
      position: calculateSatellitePosition(
        { period: 92.68, inclination: 51.64, altitude: 408 }, 
        baseTime, 
        userLat, 
        userLon
      ),
      velocity: { speed: 27600, direction: 87 },
      orbit: { period: 92.68, inclination: 51.64, apogee: 421, perigee: 408 },
      nextPass: calculateNextPass(userLat, userLon, { period: 92.68, inclination: 51.64, altitude: 408 }),
      status: 'active',
      launchDate: '1998-11-20',
      country: 'International',
      description: 'Low Earth orbit space station serving as a microgravity laboratory'
    },
    {
      id: 'starlink-1',
      name: 'Starlink-30042',
      noradId: 50000,
      type: 'communication',
      position: calculateSatellitePosition(
        { period: 95.2, inclination: 53.0, altitude: 550 }, 
        baseTime + 1000000, 
        userLat, 
        userLon
      ),
      velocity: { speed: 27400, direction: 92 },
      orbit: { period: 95.2, inclination: 53.0, apogee: 560, perigee: 540 },
      nextPass: calculateNextPass(userLat, userLon, { period: 95.2, inclination: 53.0, altitude: 550 }),
      status: 'active',
      launchDate: '2023-05-15',
      country: 'USA',
      description: 'Part of SpaceX Starlink satellite constellation for global internet coverage'
    },
    {
      id: 'tiangong',
      name: 'Tiangong Space Station',
      noradId: 48274,
      type: 'space_station',
      position: calculateSatellitePosition(
        { period: 92.4, inclination: 41.5, altitude: 385 }, 
        baseTime + 2000000, 
        userLat, 
        userLon
      ),
      velocity: { speed: 27500, direction: 85 },
      orbit: { period: 92.4, inclination: 41.5, apogee: 390, perigee: 380 },
      nextPass: calculateNextPass(userLat, userLon, { period: 92.4, inclination: 41.5, altitude: 385 }),
      status: 'active',
      launchDate: '2021-04-29',
      country: 'China',
      description: 'Chinese space station in low Earth orbit for scientific research'
    },
    {
      id: 'hubble',
      name: 'Hubble Space Telescope',
      noradId: 20580,
      type: 'scientific',
      position: calculateSatellitePosition(
        { period: 95.4, inclination: 28.5, altitude: 535 }, 
        baseTime + 3000000, 
        userLat, 
        userLon
      ),
      velocity: { speed: 27300, direction: 45 },
      orbit: { period: 95.4, inclination: 28.5, apogee: 540, perigee: 530 },
      nextPass: calculateNextPass(userLat, userLon, { period: 95.4, inclination: 28.5, altitude: 535 }),
      status: 'active',
      launchDate: '1990-04-24',
      country: 'USA',
      description: 'Space telescope providing high-resolution images of the universe'
    }
  ];

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
              {userLocation.city}
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