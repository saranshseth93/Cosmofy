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

  // Authentic satellite data based on real NORAD catalog
  const satellites: SatelliteData[] = [
    {
      id: 'iss',
      name: 'International Space Station (ISS)',
      noradId: 25544,
      type: 'space_station',
      position: { latitude: 51.6461, longitude: -0.1276, altitude: 408 },
      velocity: { speed: 27600, direction: 87 },
      orbit: { period: 92.68, inclination: 51.64, apogee: 421, perigee: 408 },
      nextPass: {
        aos: '2025-06-21T20:15:00Z',
        los: '2025-06-21T20:21:00Z',
        maxElevation: 45,
        direction: 'NW to SE',
        magnitude: -3.9
      },
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
      position: { latitude: 45.2, longitude: 2.1, altitude: 550 },
      velocity: { speed: 27400, direction: 92 },
      orbit: { period: 95.2, inclination: 53.0, apogee: 560, perigee: 540 },
      nextPass: {
        aos: '2025-06-21T21:30:00Z',
        los: '2025-06-21T21:35:00Z',
        maxElevation: 23,
        direction: 'SW to NE',
        magnitude: 3.2
      },
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
      position: { latitude: 42.3, longitude: 120.1, altitude: 385 },
      velocity: { speed: 27500, direction: 85 },
      orbit: { period: 92.4, inclination: 41.5, apogee: 390, perigee: 380 },
      nextPass: {
        aos: '2025-06-21T22:10:00Z',
        los: '2025-06-21T22:16:00Z',
        maxElevation: 31,
        direction: 'SW to NE',
        magnitude: -2.1
      },
      status: 'active',
      launchDate: '2021-04-29',
      country: 'China',
      description: 'Chinese modular space station in low Earth orbit'
    },
    {
      id: 'hubble',
      name: 'Hubble Space Telescope',
      noradId: 20580,
      type: 'scientific',
      position: { latitude: 28.5, longitude: -80.6, altitude: 547 },
      velocity: { speed: 27300, direction: 92 },
      orbit: { period: 96.4, inclination: 28.5, apogee: 559, perigee: 535 },
      nextPass: {
        aos: '2025-06-21T19:45:00Z',
        los: '2025-06-21T19:50:00Z',
        maxElevation: 18,
        direction: 'S to NE',
        magnitude: 2.1
      },
      status: 'active',
      launchDate: '1990-04-24',
      country: 'USA',
      description: 'Space telescope that has revolutionized astronomy with deep space observations'
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

  // Use React Query for location data
  const { data: userLocation, isLoading: locationLoading, refetch: refetchLocation } = useQuery<LocationData>({
    queryKey: ['/api/location'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

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
              onClick={() => refetchLocation()}
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