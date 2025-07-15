import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Telescope, Eye, Calendar, MapPin, Clock, Star, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { CosmicCursor } from '@/components/cosmic-cursor';
import { Footer } from '@/components/footer';

interface TelescopeObservation {
  id: string;
  telescope: string;
  target: string;
  type: string;
  startTime: string;
  duration: number;
  instruments: string[];
  description: string;
  imageUrl?: string;
  status: 'scheduled' | 'observing' | 'completed';
  coordinates: {
    ra: string;
    dec: string;
  };
}

interface TelescopeStatus {
  name: string;
  status: 'operational' | 'maintenance' | 'offline';
  currentTarget: string | null;
  nextObservation: string;
  location: string;
  instruments: string[];
  description: string;
}

export default function VirtualTelescopePage() {
  const [selectedTelescope, setSelectedTelescope] = useState('hubble');

  const { data: observations, isLoading: observationsLoading } = useQuery<TelescopeObservation[]>({
    queryKey: ['/api/telescope/observations', selectedTelescope],
    refetchInterval: 60000, // 1 minute
  });

  const { data: telescopes, isLoading: telescopesLoading } = useQuery<TelescopeStatus[]>({
    queryKey: ['/api/telescope/status'],
    refetchInterval: 300000, // 5 minutes
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      operational: 'bg-green-500',
      maintenance: 'bg-yellow-500',
      offline: 'bg-red-500',
      observing: 'bg-blue-500',
      scheduled: 'bg-gray-500',
      completed: 'bg-green-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Handle API errors gracefully
  const showErrorState = (!observationsLoading && !observations) || (!telescopesLoading && !telescopes);

  if (observationsLoading || telescopesLoading) {
    return (
      <>
        <Navigation />
        <CosmicCursor />
        <div className="min-h-screen bg-gradient-to-b from-black via-blue-950/20 to-black pt-24">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading telescope data...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (showErrorState) {
    return (
      <>
        <Navigation />
        <CosmicCursor />
        <div className="min-h-screen bg-gradient-to-b from-black via-blue-950/20 to-black pt-24">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center space-y-6">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="h-10 w-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Virtual Telescope Network Unavailable
                </h1>
                <p className="text-muted-foreground mb-6">
                  Telescope observation data requires specialized API credentials. Please configure telescope network access to view live feeds from Hubble, James Webb, and ground observatories.
                </p>
                <div className="text-sm text-muted-foreground">
                  <p>• Hubble Space Telescope feeds</p>
                  <p>• James Webb Space Telescope data</p>
                  <p>• Ground-based observatory access</p>
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
      <div className="min-h-screen bg-gradient-to-b from-black via-blue-950/20 to-black pt-24">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Virtual Telescope Network
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real-time feeds and schedules from Hubble, James Webb, and ground-based observatories
            </p>
          </div>

          <Tabs value={selectedTelescope} onValueChange={setSelectedTelescope} className="w-full">
            {/* Telescope Selection */}
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="hubble">Hubble Space Telescope</TabsTrigger>
              <TabsTrigger value="jwst">James Webb Space Telescope</TabsTrigger>
              <TabsTrigger value="ground">Ground Observatories</TabsTrigger>
            </TabsList>

            {/* Telescope Status Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              {telescopes?.map((telescope) => (
                <Card key={telescope.name}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Telescope className="h-5 w-5 text-blue-500" />
                      {telescope.name.replace(' Space Telescope', '')}
                    </CardTitle>
                    <Badge className={`${getStatusBadge(telescope.status)} text-white w-fit`}>
                      {telescope.status}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Current Target</div>
                      <div className="font-medium">{telescope.currentTarget || 'Standby'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Next Observation</div>
                      <div className="font-medium">{telescope.nextObservation}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Location</div>
                      <div className="font-medium">{telescope.location}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Observations */}
            <TabsContent value={selectedTelescope} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-500" />
                    Scheduled Observations
                  </CardTitle>
                  <CardDescription>
                    Upcoming observations and data collection sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {observations?.map((observation) => (
                      <div key={observation.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold">{observation.target}</h3>
                            <Badge variant="outline" className="mt-1">
                              {observation.type}
                            </Badge>
                          </div>
                          <Badge className={`${getStatusBadge(observation.status)} text-white`}>
                            {observation.status}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-4">{observation.description}</p>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>Start: {formatTime(observation.startTime)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>Duration: {formatDuration(observation.duration)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>Coordinates: {observation.coordinates.ra}, {observation.coordinates.dec}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <div className="text-muted-foreground mb-1">Instruments</div>
                              <div className="flex flex-wrap gap-1">
                                {observation.instruments.map((instrument) => (
                                  <Badge key={instrument} variant="secondary" className="text-xs">
                                    {instrument}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {observation.imageUrl && (
                          <div className="mt-4">
                            <img 
                              src={observation.imageUrl} 
                              alt={observation.target}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                About the Telescope Network
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Hubble Space Telescope</h4>
                  <p className="text-muted-foreground">
                    Operating since 1990, Hubble has revolutionized our understanding of the cosmos with 
                    its stunning optical and ultraviolet observations of distant galaxies, nebulae, and planets.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">James Webb Space Telescope</h4>
                  <p className="text-muted-foreground">
                    The most powerful space telescope ever built, observing in infrared to see through cosmic dust 
                    and study the earliest galaxies formed after the Big Bang.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Ground Observatories</h4>
                  <p className="text-muted-foreground">
                    A network of the world's largest ground-based telescopes, including Keck, VLT, and Gemini, 
                    providing complementary observations and real-time sky monitoring.
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