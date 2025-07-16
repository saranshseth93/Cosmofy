import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Eye, Rocket, Moon, Sun, Star, Globe, Camera, Telescope } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { CosmicCursor } from '@/components/cosmic-cursor';
import { Footer } from '@/components/footer';

interface CosmicEvent {
  id: string;
  title: string;
  type: 'eclipse' | 'meteor_shower' | 'planetary_alignment' | 'rocket_launch' | 'transit' | 'conjunction';
  date: string;
  time: string;
  duration: string;
  visibility: {
    global: boolean;
    regions: string[];
    bestTime: string;
  };
  description: string;
  significance: string;
  viewingTips: string[];
  countdown: number;
  status: 'upcoming' | 'happening' | 'past';
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  images?: string[];
}

interface RocketLaunch {
  id: string;
  mission: string;
  agency: string;
  vehicle: string;
  launchSite: string;
  date: string;
  time: string;
  description: string;
  objectives: string[];
  countdown: number;
  status: 'scheduled' | 'delayed' | 'scrubbed';
  livestreamUrl?: string;
}

export default function CosmicEventsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number; city?: string } | null>(null);

  const { data: events, isLoading: eventsLoading } = useQuery<CosmicEvent[]>({
    queryKey: ['/api/cosmic-events', selectedCategory],
    refetchInterval: 60000,
  });

  const { data: launches, isLoading: launchesLoading } = useQuery<RocketLaunch[]>({
    queryKey: ['/api/rocket-launches'],
    refetchInterval: 300000,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          try {
            const response = await fetch(`/api/location?lat=${lat}&lon=${lon}`);
            const locationData = await response.json();
            setUserLocation({
              lat,
              lon,
              city: locationData.city || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`
            });
          } catch (error) {
            setUserLocation({
              lat,
              lon,
              city: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`
            });
          }
        },
        () => {
          setUserLocation({ lat: 40.7128, lon: -74.0060, city: 'Default Location' });
        }
      );
    }
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'eclipse': return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'meteor_shower': return <Star className="h-5 w-5 text-blue-500" />;
      case 'planetary_alignment': return <Moon className="h-5 w-5 text-purple-500" />;
      case 'rocket_launch': return <Rocket className="h-5 w-5 text-red-500" />;
      case 'transit': return <Eye className="h-5 w-5 text-green-500" />;
      case 'conjunction': return <MapPin className="h-5 w-5 text-orange-500" />;
      default: return <Calendar className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-green-500';
      case 'happening': return 'bg-blue-500';
      case 'scheduled': return 'bg-green-500';
      case 'delayed': return 'bg-yellow-500';
      case 'scrubbed': return 'bg-red-500';
      case 'past': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCountdown = (seconds: number) => {
    if (seconds <= 0) return 'Now!';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(navigator.language || 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return date.toLocaleTimeString(navigator.language || 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateString: string, timeString?: string) => {
    const date = new Date(dateString);
    if (timeString) {
      const [hours, minutes] = timeString.split(':');
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    }
    return date.toLocaleString(navigator.language || 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEventVisibleFromLocation = (event: CosmicEvent) => {
    if (event.visibility.global) return true;
    if (!userLocation) return true;
    
    const userRegion = userLocation.lat > 23.5 ? 'Northern Hemisphere' : 
                      userLocation.lat < -23.5 ? 'Southern Hemisphere' : 'Equatorial';
    
    return event.visibility.regions.some(region => 
      region.includes(userRegion) || region === 'Global'
    );
  };

  const categories = [
    { id: 'all', label: 'All Events', icon: Calendar },
    { id: 'eclipse', label: 'Eclipses', icon: Sun },
    { id: 'meteor_shower', label: 'Meteor Showers', icon: Star },
    { id: 'planetary_alignment', label: 'Alignments', icon: Moon },
    { id: 'rocket_launch', label: 'Launches', icon: Rocket },
    { id: 'transit', label: 'Transits', icon: Eye },
  ];

  if (eventsLoading || launchesLoading) {
    return (
      <>
        <Navigation />
        <CosmicCursor />
        <div className="min-h-screen bg-gradient-to-b from-black via-blue-950/20 to-black pt-24">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading cosmic events...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const filteredEvents = events?.filter(event => {
    if (selectedCategory === 'all') return true;
    return event.type === selectedCategory;
  });

  const upcomingLaunches = launches?.filter(launch => 
    launch.status === 'scheduled' && launch.countdown > 0
  );

  return (
    <>
      <Navigation />
      <CosmicCursor />
      <div className="min-h-screen bg-gradient-to-b from-black via-blue-950/20 to-black pt-24">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Location Chip */}
          {userLocation?.city && (
            <div className="flex justify-center">
              <Badge variant="outline" className="px-4 py-2 text-sm bg-purple-500/10 border-purple-500/30 text-purple-400">
                📍 {userLocation.city}
              </Badge>
            </div>
          )}

          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Cosmic Event Calendar
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upcoming eclipses, meteor showers, planetary alignments, and rocket launches with countdown timers
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>

          {/* Upcoming Rocket Launches */}
          {upcomingLaunches && upcomingLaunches.length > 0 && (selectedCategory === 'all' || selectedCategory === 'rocket_launch') && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Rocket className="h-6 w-6 text-red-500" />
                Upcoming Rocket Launches
              </h2>
              <div className="grid gap-4">
                {upcomingLaunches.slice(0, 5).map((launch) => (
                  <Card key={launch.id} className="border-l-4 border-l-red-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{launch.mission}</CardTitle>
                          <CardDescription className="mt-1">
                            {launch.agency} • {launch.vehicle} • {launch.launchSite}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getStatusColor(launch.status)} text-white mb-2`}>
                            {launch.status}
                          </Badge>
                          <div className="text-2xl font-mono font-bold text-red-500">
                            {formatCountdown(launch.countdown)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{launch.description}</p>
                      
                      {/* Mission Objectives */}
                      {launch.objectives && launch.objectives.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-sm mb-2">Mission Objectives</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {launch.objectives.map((objective, index) => (
                              <li key={index}>• {objective}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDateTime(launch.date, launch.time)}
                        </div>
                        {launch.livestreamUrl && (
                          <a href={launch.livestreamUrl} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-500 hover:underline flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            Watch Live
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Cosmic Events */}
          {(selectedCategory !== 'rocket_launch') && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Star className="h-6 w-6 text-purple-500" />
                Cosmic Events
              </h2>
              <div className="grid gap-6">
                {filteredEvents?.map((event) => (
                <Card key={event.id} className={`${isEventVisibleFromLocation(event) ? 'border-l-4 border-l-blue-500' : 'opacity-60'}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        {getEventIcon(event.type)}
                        <div>
                          <CardTitle className="text-xl">{event.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {formatDate(event.date)} at {formatTime(event.time)} • Duration: {event.duration}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStatusColor(event.status)} text-white mb-2`}>
                          {event.status}
                        </Badge>
                        <div className="text-lg font-mono font-bold text-blue-500">
                          {formatCountdown(event.countdown)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{event.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Visibility Information
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div><strong>Global Event:</strong> {event.visibility.global ? 'Yes' : 'No'}</div>
                          <div><strong>Visible Regions:</strong> {event.visibility.regions.join(', ')}</div>
                          <div><strong>Best Viewing Time:</strong> {event.visibility.bestTime}</div>
                          {event.coordinates && (
                            <div><strong>Optimal Location:</strong> {event.coordinates.latitude}°, {event.coordinates.longitude}°</div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Camera className="h-4 w-4" />
                          Viewing Tips
                        </h4>
                        <ul className="space-y-1 text-sm">
                          {event.viewingTips.map((tip, index) => (
                            <li key={index}>• {tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {/* Event Significance */}
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Scientific Significance</div>
                      <div className="text-sm">{event.significance}</div>
                    </div>

                    {/* Event Images */}
                    {event.images && event.images.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Telescope className="h-4 w-4" />
                          Related Images
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {event.images.slice(0, 3).map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`${event.title} ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Event Type Badge */}
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="capitalize">
                        {event.type.replace('_', ' ')}
                      </Badge>
                      {!isEventVisibleFromLocation(event) && (
                        <span className="text-xs text-muted-foreground">Not visible from your location</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          )}

          {/* Event Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-500">{events?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Events</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-500">{launches?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Rocket Launches</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">
                    {events?.filter(e => isEventVisibleFromLocation(e)).length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Visible from Location</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-500">
                    {events?.filter(e => e.status === 'upcoming').length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Upcoming Events</div>
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