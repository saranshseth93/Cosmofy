import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Satellite, MapPin, Clock, Bell, Search, Orbit, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { CosmicCursor } from '@/components/cosmic-cursor';
import { Footer } from '@/components/footer';

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
    aos: string; // Acquisition of Signal
    los: string; // Loss of Signal
    maxElevation: number;
    direction: string;
    magnitude: number;
  };
  status: 'active' | 'inactive' | 'unknown';
  launchDate: string;
  country: string;
  description: string;
}

interface FlyoverNotification {
  satelliteId: string;
  satelliteName: string;
  startTime: string;
  duration: number;
  maxElevation: number;
  direction: string;
  magnitude: number;
  timeUntil: number;
  startDirection: string;
  startAzimuth: number;
  maxElevationDirection: string;
  maxElevationAzimuth: number;
  endDirection: string;
  endAzimuth: number;
  visibility: string;
  moonPhase: string;
  viewingTips: string;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  city: string;
  timezone: string;
}

export default function SatelliteTrackerPage() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('featured');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notifications, setNotifications] = useState<boolean>(false);

  const { data: satellites, isLoading: satellitesLoading } = useQuery<SatelliteData[]>({
    queryKey: ['/api/satellites', selectedCategory, userLocation?.latitude, userLocation?.longitude],
    enabled: !!userLocation,
    refetchInterval: 30000, // 30 seconds for real-time tracking
  });

  const { data: flyovers, isLoading: flyoversLoading } = useQuery<FlyoverNotification[]>({
    queryKey: ['/api/satellites/flyovers', userLocation?.latitude, userLocation?.longitude],
    enabled: !!userLocation,
    refetchInterval: 300000, // 5 minutes
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await fetch(`/api/location?lat=${latitude}&lon=${longitude}`);
            const locationData = await response.json();
            setUserLocation({
              latitude,
              longitude,
              city: locationData.city || 'Unknown',
              timezone: locationData.timezone || 'UTC'
            });
          } catch (error) {
            setUserLocation({
              latitude,
              longitude,
              city: 'Unknown',
              timezone: 'UTC'
            });
          }
        },
        () => {
          // Default to moderate latitude
          setUserLocation({
            latitude: 40.7128,
            longitude: -74.0060,
            city: 'New York',
            timezone: 'America/New_York'
          });
        }
      );
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const getSatelliteIcon = (type: string) => {
    switch (type) {
      case 'space_station': return <Satellite className="h-5 w-5 text-blue-500" />;
      case 'communication': return <Zap className="h-5 w-5 text-green-500" />;
      case 'earth_observation': return <MapPin className="h-5 w-5 text-purple-500" />;
      case 'navigation': return <Orbit className="h-5 w-5 text-orange-500" />;
      case 'scientific': return <Satellite className="h-5 w-5 text-cyan-500" />;
      case 'military': return <Satellite className="h-5 w-5 text-red-500" />;
      case 'debris': return <Satellite className="h-5 w-5 text-gray-500" />;
      default: return <Satellite className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-red-500';
      case 'unknown': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimeUntil = (seconds: number) => {
    if (seconds <= 0) return 'Now!';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const enableNotifications = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotifications(true);
      // Schedule notifications for upcoming flyovers
      flyovers?.forEach(flyover => {
        if (flyover.timeUntil > 0 && flyover.timeUntil < 3600) { // Within 1 hour
          setTimeout(() => {
            new Notification(`${flyover.satelliteName} Flyover`, {
              body: `Max elevation: ${flyover.maxElevation}°, Duration: ${formatDuration(flyover.duration)}`,
              icon: '/satellite-icon.png'
            });
          }, (flyover.timeUntil - 300) * 1000); // 5 minutes before
        }
      });
    }
  };

  const categories = [
    { id: 'featured', label: 'Featured', description: 'ISS, Hubble, and other notable satellites' },
    { id: 'space_station', label: 'Space Stations', description: 'International Space Station and others' },
    { id: 'communication', label: 'Communication', description: 'TV, internet, and phone satellites' },
    { id: 'earth_observation', label: 'Earth Observation', description: 'Weather and monitoring satellites' },
    { id: 'navigation', label: 'Navigation', description: 'GPS, GLONASS, and Galileo' },
    { id: 'scientific', label: 'Scientific', description: 'Research and space telescopes' },
  ];

  const filteredSatellites = satellites?.filter(satellite =>
    satellite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    satellite.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    satellite.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!userLocation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Location Required</h2>
          <p className="text-muted-foreground">
            Please allow location access to track satellites and predict flyovers for your area.
          </p>
        </div>
      </div>
    );
  }

  if (satellitesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading satellite data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <CosmicCursor />
      <Navigation />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
          Satellite Tracker
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Real-time positions of satellites, space stations, and debris with flyover notifications for your location
        </p>
      </div>

      {/* Location and Notifications */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Observation Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>City:</strong> {userLocation.city}</div>
              <div><strong>Coordinates:</strong> {userLocation.latitude.toFixed(3)}°, {userLocation.longitude.toFixed(3)}°</div>
              <div><strong>Timezone:</strong> {userLocation.timezone}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Flyover Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Get notified 5 minutes before visible satellite passes
              </div>
              <Button 
                onClick={enableNotifications}
                disabled={notifications || Notification.permission !== 'granted'}
                size="sm"
              >
                {notifications ? 'Notifications Enabled' : 'Enable Notifications'}
              </Button>
              {Notification.permission === 'denied' && (
                <div className="text-xs text-orange-500">
                  Notifications blocked. Enable in browser settings.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Flyovers */}
      {flyovers && flyovers.length > 0 && (
        <Card className="border-blue-500 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-blue-500" />
              Upcoming Flyovers
            </CardTitle>
            <CardDescription>
              Visible satellite passes for your location in the next 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {flyovers.slice(0, 6).map((flyover, index) => (
                <div key={index} className="p-6 bg-muted/30 rounded-lg border border-blue-500/20">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">{flyover.satelliteName}</h4>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className={`
                          ${flyover.visibility === 'Excellent' ? 'bg-green-500/10 text-green-400' : 
                            flyover.visibility === 'Good' ? 'bg-blue-500/10 text-blue-400' :
                            flyover.visibility === 'Moderate' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-orange-500/10 text-orange-400'}
                        `}>
                          {flyover.visibility}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Mag {flyover.magnitude}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-500">
                        {formatTimeUntil(flyover.timeUntil)}
                      </div>
                      <div className="text-xs text-muted-foreground">until start</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm text-blue-400">Timing & Path</h5>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div><strong>Start:</strong> {new Date(flyover.startTime).toLocaleString()}</div>
                        <div><strong>Duration:</strong> {formatDuration(flyover.duration)}</div>
                        <div><strong>Path:</strong> {flyover.direction}</div>
                        <div><strong>Max elevation:</strong> {flyover.maxElevation}°</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm text-green-400">Viewing Directions</h5>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div><strong>Look:</strong> {flyover.startDirection} ({flyover.startAzimuth}°)</div>
                        <div><strong>Highest:</strong> {flyover.maxElevationDirection} ({flyover.maxElevationAzimuth}°)</div>
                        <div><strong>Disappears:</strong> {flyover.endDirection} ({flyover.endAzimuth}°)</div>
                        <div><strong>Moon phase:</strong> {flyover.moonPhase}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/20 p-3 rounded border-l-4 border-l-blue-500">
                    <h5 className="font-medium text-sm text-blue-400 mb-1">Viewing Tips</h5>
                    <p className="text-sm text-muted-foreground">{flyover.viewingTips}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Search */}
        <div className="flex gap-4 items-center mt-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search satellites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={() => setSearchQuery('')}>
            Clear
          </Button>
        </div>

        {/* Satellite Grid */}
        {categories.map(category => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold">{category.label}</h2>
              <p className="text-muted-foreground">{category.description}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSatellites?.map((satellite) => (
                <Card key={satellite.id} className="relative overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getSatelliteIcon(satellite.type)}
                          {satellite.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {satellite.country} • NORAD {satellite.noradId}
                        </CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(satellite.status)} text-white`}>
                        {satellite.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {satellite.description}
                    </p>

                    {/* Current Position */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Current Position</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-muted-foreground">Latitude</div>
                          <div className="font-mono">{satellite.position.latitude.toFixed(2)}°</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Longitude</div>
                          <div className="font-mono">{satellite.position.longitude.toFixed(2)}°</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Altitude</div>
                          <div className="font-mono">{satellite.position.altitude.toFixed(0)} km</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Speed</div>
                          <div className="font-mono">{satellite.velocity.speed.toFixed(1)} km/s</div>
                        </div>
                      </div>
                    </div>

                    {/* Orbital Data */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Orbital Data</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-muted-foreground">Period</div>
                          <div>{satellite.orbit.period.toFixed(1)} min</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Inclination</div>
                          <div>{satellite.orbit.inclination.toFixed(1)}°</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Apogee</div>
                          <div>{satellite.orbit.apogee.toFixed(0)} km</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Perigee</div>
                          <div>{satellite.orbit.perigee.toFixed(0)} km</div>
                        </div>
                      </div>
                    </div>

                    {/* Next Pass */}
                    {satellite.nextPass && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                        <h4 className="font-medium text-sm mb-2">Next Visible Pass</h4>
                        <div className="text-xs space-y-1">
                          <div>Start: {new Date(satellite.nextPass.aos).toLocaleString()}</div>
                          <div>End: {new Date(satellite.nextPass.los).toLocaleString()}</div>
                          <div>Max elevation: {satellite.nextPass.maxElevation}° {satellite.nextPass.direction}</div>
                          {satellite.nextPass.magnitude && (
                            <div>Magnitude: {satellite.nextPass.magnitude}</div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Launched: {new Date(satellite.launchDate).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredSatellites && filteredSatellites.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Satellite className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Satellites Found</h3>
                  <p className="text-muted-foreground">
                    No satellites match your search criteria. Try adjusting your search or selecting a different category.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>About Satellite Tracking</CardTitle>
          <CardDescription>
            Understanding orbital mechanics and satellite visibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2">Tracking Accuracy</h4>
              <p className="text-muted-foreground mb-4">
                Satellite positions are calculated using Two-Line Element (TLE) data 
                from NORAD, updated regularly for maximum accuracy. Positions are 
                accurate to within a few kilometers.
              </p>
              
              <h4 className="font-medium mb-2">Visibility Conditions</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• Satellites must be sunlit while observer is in darkness</li>
                <li>• Best viewing is during twilight hours</li>
                <li>• Higher elevation passes are easier to spot</li>
                <li>• Clear skies are essential for visual observation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Orbital Terms</h4>
              <div className="space-y-2 text-muted-foreground">
                <div><strong>Apogee:</strong> Highest point in orbit</div>
                <div><strong>Perigee:</strong> Lowest point in orbit</div>
                <div><strong>Inclination:</strong> Angle of orbit relative to equator</div>
                <div><strong>Period:</strong> Time to complete one orbit</div>
                <div><strong>AOS/LOS:</strong> Acquisition/Loss of Signal times</div>
              </div>
              
              <h4 className="font-medium mb-2 mt-4">Brightness Scale</h4>
              <p className="text-muted-foreground">
                Satellite brightness is measured in magnitude. Lower numbers are 
                brighter. The ISS can reach magnitude -6, brighter than Venus.
              </p>
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