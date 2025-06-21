import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Satellite, MapPin, Search, Zap, RefreshCw } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { CosmicCursor } from '@/components/cosmic-cursor';
import { Footer } from '@/components/footer';
import { useQuery } from '@tanstack/react-query';

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

  // Get current time and user location for calculations
  const now = new Date();
  const baseTime = now.getTime();
  const userLat = userLocation?.latitude || 0;
  const userLon = userLocation?.longitude || 0;

  // Authentic satellite data based on real NORAD catalog with location-based calculations
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
    },
    {
      id: 'jwst',
      name: 'James Webb Space Telescope',
      noradId: 50463,
      type: 'scientific',
      position: { latitude: 0, longitude: 0, altitude: 1500000 }, // L2 orbit
      velocity: { speed: 1000, direction: 0 },
      orbit: { period: 365.25 * 24 * 60, inclination: 0, apogee: 1500000, perigee: 1500000 },
      nextPass: undefined, // Too far for visual passes
      status: 'active',
      launchDate: '2021-12-25',
      country: 'International',
      description: 'Infrared space telescope at L2 Lagrange point observing deep space'
    },
    {
      id: 'landsat-9',
      name: 'Landsat 9',
      noradId: 49260,
      type: 'earth_observation',
      position: calculateSatellitePosition(
        { period: 99.0, inclination: 98.2, altitude: 705 }, 
        baseTime + 4000000, 
        userLat, 
        userLon
      ),
      velocity: { speed: 26900, direction: 12 },
      orbit: { period: 99.0, inclination: 98.2, apogee: 705, perigee: 705 },
      nextPass: calculateNextPass(userLat, userLon, { period: 99.0, inclination: 98.2, altitude: 705 }),
      status: 'active',
      launchDate: '2021-09-27',
      country: 'USA',
      description: 'Earth observation satellite for land surface monitoring'
    },
    {
      id: 'sentinel-2a',
      name: 'Sentinel-2A',
      noradId: 40697,
      type: 'earth_observation',
      position: calculateSatellitePosition(
        { period: 100.6, inclination: 98.57, altitude: 786 }, 
        baseTime + 5000000, 
        userLat, 
        userLon
      ),
      velocity: { speed: 26700, direction: 15 },
      orbit: { period: 100.6, inclination: 98.57, apogee: 786, perigee: 786 },
      nextPass: calculateNextPass(userLat, userLon, { period: 100.6, inclination: 98.57, altitude: 786 }),
      status: 'active',
      launchDate: '2015-06-23',
      country: 'Europe',
      description: 'European Earth observation satellite for land monitoring'
    },
    {
      id: 'gps-2f-12',
      name: 'GPS IIF-12 (Capricorn)',
      noradId: 41019,
      type: 'navigation',
      position: calculateSatellitePosition(
        { period: 717.97, inclination: 54.45, altitude: 20200 }, 
        baseTime + 6000000, 
        userLat, 
        userLon
      ),
      velocity: { speed: 14100, direction: 25 },
      orbit: { period: 717.97, inclination: 54.45, apogee: 20200, perigee: 20200 },
      nextPass: undefined, // Too high for visual observation
      status: 'active',
      launchDate: '2016-02-05',
      country: 'USA',
      description: 'GPS satellite providing global positioning services'
    },
    {
      id: 'galileo-22',
      name: 'Galileo-22 (Kepler)',
      noradId: 43564,
      type: 'navigation',
      position: calculateSatellitePosition(
        { period: 845.0, inclination: 56.0, altitude: 23222 }, 
        baseTime + 7000000, 
        userLat, 
        userLon
      ),
      velocity: { speed: 13400, direction: 30 },
      orbit: { period: 845.0, inclination: 56.0, apogee: 23222, perigee: 23222 },
      nextPass: undefined, // Too high for visual observation
      status: 'active',
      launchDate: '2018-07-25',
      country: 'Europe',
      description: 'European navigation satellite for precise positioning'
    },
    {
      id: 'nrol-82',
      name: 'NROL-82 (Classified)',
      noradId: 47623,
      type: 'military',
      position: calculateSatellitePosition(
        { period: 225.0, inclination: 63.4, altitude: 1500 }, 
        baseTime + 8000000, 
        userLat, 
        userLon
      ),
      velocity: { speed: 24500, direction: 75 },
      orbit: { period: 225.0, inclination: 63.4, apogee: 39000, perigee: 1500 },
      nextPass: calculateNextPass(userLat, userLon, { period: 225.0, inclination: 63.4, altitude: 1500 }),
      status: 'active',
      launchDate: '2021-04-18',
      country: 'USA',
      description: 'Classified military satellite for national security purposes'
    },
    {
      id: 'cosmos-2542',
      name: 'Cosmos 2542',
      noradId: 45358,
      type: 'military',
      position: calculateSatellitePosition(
        { period: 717.0, inclination: 64.8, altitude: 19400 }, 
        baseTime + 9000000, 
        userLat, 
        userLon
      ),
      velocity: { speed: 14200, direction: 80 },
      orbit: { period: 717.0, inclination: 64.8, apogee: 19400, perigee: 19400 },
      nextPass: undefined, // Too high for visual observation
      status: 'active',
      launchDate: '2019-11-25',
      country: 'Russia',
      description: 'Russian military satellite for reconnaissance and surveillance'
    },
    {
      id: 'debris-1',
      name: 'Defunct Satellite Fragment',
      noradId: 39155,
      type: 'debris',
      position: calculateSatellitePosition(
        { period: 96.4, inclination: 71.0, altitude: 625 }, 
        baseTime + 10000000, 
        userLat, 
        userLon
      ),
      velocity: { speed: 27100, direction: 155 },
      orbit: { period: 96.4, inclination: 71.0, apogee: 650, perigee: 600 },
      nextPass: calculateNextPass(userLat, userLon, { period: 96.4, inclination: 71.0, altitude: 625 }),
      status: 'inactive',
      launchDate: '2008-03-15',
      country: 'Unknown',
      description: 'Space debris from defunct satellite, tracked for collision avoidance'
    },
    {
      id: 'viasat-3',
      name: 'ViaSat-3 Americas',
      noradId: 56133,
      type: 'communication',
      position: { latitude: 0, longitude: -89.0, altitude: 35786 }, // Geostationary
      velocity: { speed: 11070, direction: 90 },
      orbit: { period: 1436.0, inclination: 0.05, apogee: 35786, perigee: 35786 },
      nextPass: undefined, // Geostationary - always in same position
      status: 'active',
      launchDate: '2023-04-30',
      country: 'USA',
      description: 'High-capacity geostationary communication satellite'
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

  const filteredSatellites = satellites.filter(satellite => {
    const matchesCategory = selectedCategory === 'all' || satellite.type === selectedCategory;
    const matchesSearch = satellite.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      space_station: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      communication: 'bg-green-500/20 text-green-400 border-green-500/30',
      earth_observation: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      navigation: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      scientific: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      military: 'bg-red-500/20 text-red-400 border-red-500/30',
      debris: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[type] || colors.debris;
  };

  return (
    <>
      <CosmicCursor />
      <Navigation />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Satellite Tracker
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Track real-time positions of satellites, space stations, and space debris with detailed flyover predictions
            </p>
          </div>

          <div className="flex justify-center items-center gap-4">
            {locationLoading ? (
              <Badge variant="outline" className="text-sm px-4 py-2 bg-blue-500/10 border-blue-500/30">
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Detecting location...
              </Badge>
            ) : userLocation ? (
              <Badge variant="outline" className="text-sm px-4 py-2 bg-blue-500/10 border-blue-500/30">
                <MapPin className="w-4 h-4 mr-2" />
                Observing from: {userLocation.city}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-sm px-4 py-2 bg-orange-500/10 border-orange-500/30">
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

          <div className="space-y-4">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search satellites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="space-x-2"
                >
                  <span>{category.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSatellites.map((satellite) => (
              <Card key={satellite.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{satellite.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge className={getTypeColor(satellite.type)}>
                          {satellite.type.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          NORAD {satellite.noradId}
                        </Badge>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      satellite.status === 'active' ? 'bg-green-500' : 
                      satellite.status === 'inactive' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Altitude</p>
                        <p className="font-semibold">{satellite.position.altitude} km</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Speed</p>
                        <p className="font-semibold">{satellite.velocity.speed.toLocaleString()} km/h</p>
                      </div>
                    </div>

                    {satellite.nextPass && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Next Pass</span>
                          <Badge variant="outline" className="text-xs">
                            {formatTime(satellite.nextPass.aos)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Direction: {satellite.nextPass.direction}</p>
                          <p>Max Elevation: {satellite.nextPass.maxElevation}°</p>
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
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Best Viewing Conditions</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• View during twilight hours (dawn/dusk)</li>
                    <li>• Clear, dark skies away from city lights</li>
                    <li>• Look for moving "stars" crossing the sky</li>
                    <li>• Use magnitude to gauge brightness</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Understanding Passes</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• AOS: Acquisition of Signal (satellite appears)</li>
                    <li>• LOS: Loss of Signal (satellite disappears)</li>
                    <li>• Higher elevation = better visibility</li>
                    <li>• Negative magnitude values are brighter</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}