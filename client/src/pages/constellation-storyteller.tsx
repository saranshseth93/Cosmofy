import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Clock, Eye, Star, Moon, Sun, Search, Globe, Telescope, Calendar, BookOpen, Navigation as NavIcon, Compass } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { CosmicCursor } from '@/components/cosmic-cursor';
import { Footer } from '@/components/footer';

interface Constellation {
  id: string;
  name: string;
  latinName: string;
  abbreviation: string;
  mythology: {
    culture: string;
    story: string;
    meaning: string;
    characters: string[];
  };
  astronomy: {
    brightestStar: string;
    starCount: number;
    area: number;
    visibility: {
      hemisphere: 'northern' | 'southern' | 'both';
      bestMonth: string;
      declination: number;
    };
  };
  coordinates: {
    ra: number;
    dec: number;
  };
  stars: {
    name: string;
    magnitude: number;
    type: string;
    distance: number;
  }[];
  deepSkyObjects: {
    name: string;
    type: string;
    magnitude: number;
    description: string;
  }[];
  imageUrl: string;
  starMapUrl: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  timezone: string;
  city: string;
}

interface SkyConditions {
  visibleConstellations: string[];
  moonPhase: string;
  moonIllumination: number;
  bestViewingTime: string;
  conditions: string;
}

export default function ConstellationStorytellerPage() {
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [selectedConstellation, setSelectedConstellation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const { data: constellations, isLoading: constellationsLoading } = useQuery<Constellation[]>({
    queryKey: ['/api/constellations'],
  });

  const { data: skyConditions, isLoading: skyLoading } = useQuery<SkyConditions>({
    queryKey: ['/api/sky-conditions', userLocation?.latitude, userLocation?.longitude],
    queryFn: () => 
      fetch(`/api/sky-conditions?lat=${userLocation?.latitude}&lon=${userLocation?.longitude}`)
        .then(res => res.json()),
    enabled: !!userLocation?.latitude && !!userLocation?.longitude,
    refetchInterval: 3600000, // 1 hour
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
              timezone: locationData.timezone || 'UTC',
              city: locationData.city || 'Unknown Location'
            });
          } catch (error) {
            setUserLocation({
              latitude,
              longitude,
              timezone: 'UTC',
              city: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`
            });
          }
        },
        () => {
          setUserLocation({
            latitude: 0,
            longitude: 0,
            timezone: 'UTC',
            city: 'Default Location'
          });
        }
      );
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(navigator.language || 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMonth = (monthName: string) => {
    const date = new Date(`${monthName} 1, 2024`);
    return date.toLocaleDateString(navigator.language || 'en-US', {
      month: 'long'
    });
  };

  const getHemisphereIcon = (hemisphere: string) => {
    switch (hemisphere) {
      case 'northern': return <NavIcon className="h-4 w-4 text-blue-500" />;
      case 'southern': return <Compass className="h-4 w-4 text-orange-500" />;
      case 'both': return <Globe className="h-4 w-4 text-green-500" />;
      default: return <Globe className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMoonPhaseIcon = (phase: string) => {
    if (phase.includes('New')) return <Moon className="h-5 w-5 text-gray-600" />;
    if (phase.includes('Full')) return <Sun className="h-5 w-5 text-yellow-400" />;
    return <Moon className="h-5 w-5 text-blue-400" />;
  };

  const isConstellationVisible = (constellation: Constellation) => {
    if (!userLocation) return true;
    
    const userLat = userLocation.latitude;
    const hemisphere = constellation.astronomy.visibility.hemisphere;
    
    // Check hemisphere visibility
    if (hemisphere === 'northern' && userLat < -30) return false;
    if (hemisphere === 'southern' && userLat > 30) return false;
    
    // Check declination visibility
    const declination = constellation.astronomy.visibility.declination;
    const maxVisibleDeclination = 90 - Math.abs(userLat);
    
    return Math.abs(declination) <= maxVisibleDeclination;
  };

  const filteredConstellations = constellations
    ?.filter(constellation => {
      if (!searchQuery.trim()) return true; // Show all when search is empty
      return constellation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             constellation.mythology.culture.toLowerCase().includes(searchQuery.toLowerCase()) ||
             constellation.mythology.meaning.toLowerCase().includes(searchQuery.toLowerCase());
    })
    ?.sort((a, b) => {
      // Sort by visibility first (visible ones first), then alphabetically
      const aVisible = isConstellationVisible(a);
      const bVisible = isConstellationVisible(b);
      
      if (aVisible && !bVisible) return -1;
      if (!aVisible && bVisible) return 1;
      return a.name.localeCompare(b.name);
    });

  const selectedConstellationData = constellations?.find(c => c.id === selectedConstellation);

  if (constellationsLoading) {
    return (
      <>
        <Navigation />
        <CosmicCursor />
        <div className="min-h-screen bg-gradient-to-b from-black via-blue-950/20 to-black pt-24">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading constellation data...</p>
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
      <div className="min-h-screen bg-gradient-to-b from-black via-blue-950/20 to-black pt-24">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Location Chip */}
          {userLocation?.city && (
            <div className="flex justify-center">
              <Badge variant="outline" className="px-4 py-2 text-sm bg-indigo-500/10 border-indigo-500/30 text-indigo-400">
                📍 {userLocation.city}
              </Badge>
            </div>
          )}

          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Constellation Storyteller
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Interactive star patterns with mythology, navigation based on your location and time
            </p>
          </div>

          {/* Sky Conditions Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Current Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">
                  {formatTime(currentTime)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {userLocation?.timezone || 'Local Time'}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {skyConditions ? getMoonPhaseIcon(skyConditions.moonPhase) : <Moon className="h-5 w-5 text-yellow-500" />}
                  Moon Phase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-yellow-500">
                  {skyConditions?.moonPhase || 'Loading...'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {skyConditions?.moonIllumination}% illuminated
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="h-5 w-5 text-green-500" />
                  Viewing Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-green-500">
                  {skyConditions?.bestViewingTime || 'Loading...'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Optimal stargazing window
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5 text-purple-500" />
                  Sky Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-purple-500">
                  {skyConditions?.conditions || 'Loading...'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Current weather conditions
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visible Constellations */}
          {skyConditions && skyConditions.visibleConstellations && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Telescope className="h-5 w-5 text-blue-500" />
                  Currently Visible Constellations
                </CardTitle>
                <CardDescription>
                  Based on your location and current time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skyConditions.visibleConstellations.map((id) => {
                    const constellation = constellations?.find(c => c.id === id);
                    return constellation ? (
                      <Badge
                        key={id}
                        variant="outline"
                        className="cursor-pointer hover:bg-blue-500/20"
                        onClick={() => setSelectedConstellation(id)}
                      >
                        {constellation.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observation Location Info */}
          {userLocation && (
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Observation Location:</span>
                <Badge variant="outline" className="bg-background/50 text-foreground">
                  {userLocation.city}
                </Badge>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search constellations, mythology, or culture..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Constellation List */}
          <div className="grid gap-6">
            {filteredConstellations?.map((constellation) => (
              <Card key={constellation.id} className="overflow-hidden">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Constellation Image */}
                  <div className="relative lg:w-80 flex-shrink-0">
                    <img
                      src={constellation.imageUrl}
                      alt={`${constellation.name} constellation`}
                      className="w-full h-64 lg:h-80 object-contain bg-gradient-to-br from-slate-900 to-slate-800"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop&q=80`;
                      }}
                    />
                    <div className="absolute top-2 left-2 space-y-2">
                      <Badge variant="outline" className="bg-black/50 text-white border-white/30">
                        {constellation.abbreviation}
                      </Badge>
                      <div>
                        {isConstellationVisible(constellation) ? (
                          <Badge className="bg-green-500/80 text-white border-green-400/30">
                            Visible
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/80 text-white border-red-400/30">
                            Not Visible
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Constellation Info */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold">{constellation.name}</h3>
                        <p className="text-muted-foreground">{constellation.latinName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getHemisphereIcon(constellation.astronomy.visibility.hemisphere)}
                        <span className="text-sm capitalize">{constellation.astronomy.visibility.hemisphere}</span>
                      </div>
                    </div>

                    {/* Mythology Section */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-amber-500" />
                          Mythology ({constellation.mythology.culture})
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Meaning:</strong> {constellation.mythology.meaning}
                        </p>
                        <p className="text-sm leading-relaxed">{constellation.mythology.story}</p>
                        {constellation.mythology.characters.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-muted-foreground">Characters: </span>
                            <span className="text-xs">{constellation.mythology.characters.join(', ')}</span>
                          </div>
                        )}
                      </div>

                      {/* Astronomy Data */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Star className="h-4 w-4 text-blue-500" />
                            Astronomical Data
                          </h4>
                          <div className="space-y-1 text-sm">
                            <div><strong>Brightest Star:</strong> {constellation.astronomy.brightestStar}</div>
                            <div><strong>Star Count:</strong> {constellation.astronomy.starCount}</div>
                            <div><strong>Area:</strong> {constellation.astronomy.area} sq degrees</div>
                            <div><strong>Best Month:</strong> {formatMonth(constellation.astronomy.visibility.bestMonth)}</div>
                            <div><strong>Declination:</strong> {constellation.astronomy.visibility.declination}°</div>
                            <div><strong>Coordinates:</strong> RA {constellation.coordinates.ra}h, Dec {constellation.coordinates.dec}°</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Telescope className="h-4 w-4 text-purple-500" />
                            Notable Stars
                          </h4>
                          <div className="space-y-1 text-sm">
                            {constellation.stars.map((star, index) => (
                              <div key={`${constellation.id}-star-${index}`}>
                                <strong>{star.name}</strong> - {star.type} (Mag {star.magnitude}, {star.distance} ly)
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Deep Sky Objects */}
                      {constellation.deepSkyObjects.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Globe className="h-4 w-4 text-green-500" />
                            Deep Sky Objects
                          </h4>
                          <div className="space-y-1 text-sm">
                            {constellation.deepSkyObjects.map((object, index) => (
                              <div key={index}>
                                <strong>{object.name}</strong> - {object.type} (Mag {object.magnitude})
                                <p className="text-muted-foreground text-xs">{object.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Star Map Button */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedConstellation(constellation.id === selectedConstellation ? null : constellation.id)}
                        >
                          {constellation.id === selectedConstellation ? 'Hide' : 'Show'} Star Map
                        </Button>
                      </div>

                      {/* Star Map Image */}
                      {selectedConstellation === constellation.id && (
                        <div className="mt-4">
                          <img
                            src={constellation.starMapUrl}
                            alt={`${constellation.name} star map`}
                            className="w-full h-64 object-cover rounded-lg border"
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            Star map showing the pattern and major stars of {constellation.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Location & Time Info */}
          {userLocation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-500" />
                  Your Observation Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Location</div>
                    <div className="text-muted-foreground">{userLocation.city}</div>
                  </div>
                  <div>
                    <div className="font-medium">Coordinates</div>
                    <div className="text-muted-foreground">
                      {userLocation.latitude.toFixed(4)}°, {userLocation.longitude.toFixed(4)}°
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Timezone</div>
                    <div className="text-muted-foreground">{userLocation.timezone}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}