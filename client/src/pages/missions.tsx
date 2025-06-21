import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Rocket, Calendar, Globe, Users, Clock, MapPin, Target, Award, Zap, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CosmicPulse } from '@/components/lottie-loader';
import { PulseCTA, CosmicCTA } from '@/components/cosmic-cta';

interface SpaceMission {
  id: string;
  name: string;
  status: {
    id: number;
    name: string;
    abbrev: string;
    description: string;
  };
  net: string;
  window_end: string;
  window_start: string;
  mission?: {
    id: number;
    name: string;
    description: string;
    type: string;
    orbit?: {
      id: number;
      name: string;
      abbrev: string;
    };
  };
  pad: {
    id: number;
    name: string;
    location: {
      id: number;
      name: string;
      country_code: string;
    };
  };
  rocket: {
    id: number;
    configuration: {
      id: number;
      name: string;
      family: string;
      full_name: string;
      variant: string;
    };
  };
  launch_service_provider: {
    id: number;
    name: string;
    type: string;
  };
  image?: string;
  infographic?: string;
  program?: Array<{
    id: number;
    name: string;
    description: string;
    agencies: Array<{
      id: number;
      name: string;
      type: string;
    }>;
  }>;
}

export default function SpaceMissions() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedMission, setSelectedMission] = useState<SpaceMission | null>(null);

  useEffect(() => {
    document.title = "Space Missions - Cosmofy | Current & Upcoming Missions";
  }, []);

  const { data: missions, isLoading, error } = useQuery<SpaceMission[]>({
    queryKey: ['/api/missions'],
    queryFn: async () => {
      const response = await fetch('/api/missions');
      if (!response.ok) throw new Error('Failed to fetch missions');
      const data = await response.json();
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'go':
      case 'success':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'tbd':
      case 'to be determined':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'failure':
      case 'partial failure':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'in flight':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  const filteredMissions = selectedFilter === 'All' 
    ? missions || []
    : missions?.filter(mission => mission.status?.name === selectedFilter) || [];

  const uniqueStatuses = missions ? ['All', ...Array.from(new Set(missions.map(m => m.status?.name).filter(Boolean)))] : ['All'];

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysFromNow = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) return `In ${diffDays} days`;
    if (diffDays === 0) return 'Today';
    return `${Math.abs(diffDays)} days ago`;
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="stars" />
          <div className="twinkling" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-300 text-xs sm:text-sm">
              Mission Control Center
            </Badge>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent leading-tight">
              Space Missions
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8 px-4 sm:px-0">
              Explore humanity's most ambitious space exploration missions, from lunar expeditions to deep space discoveries.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Filters */}
      <section className="pb-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {uniqueStatuses.map((status) => (
              <PulseCTA
                key={status}
                onClick={() => setSelectedFilter(status)}
                isActive={selectedFilter === status}
                className="relative"
              >
                <span className="flex items-center">
                  {status}
                  {missions && (
                    <Badge className="ml-2 text-xs" variant="secondary">
                      {status === 'All' ? missions.length : missions.filter(m => m.status === status).length}
                    </Badge>
                  )}
                </span>
              </PulseCTA>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Cards */}
      <section className="pb-16 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="glass-morphism animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-48 bg-gray-700/30 rounded-lg mb-4" />
                    <div className="h-4 bg-gray-700/30 rounded mb-2" />
                    <div className="h-4 bg-gray-700/30 rounded w-2/3 mb-4" />
                    <div className="h-3 bg-gray-700/30 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredMissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMissions.map((mission) => (
                <Card key={mission.id} className="glass-morphism hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setSelectedMission(mission)}>
                  <CardContent className="p-0">
                    {/* Mission Image */}
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img 
                        src={mission.imageUrl} 
                        alt={mission.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <Badge className={`absolute top-4 right-4 ${getStatusColor(mission.status)} border`}>
                        {mission.status}
                      </Badge>
                    </div>
                    
                    {/* Mission Details */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-white">{mission.name}</h3>
                        <Badge variant="outline" className="text-xs text-gray-300 border-gray-600">
                          {mission.agency}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                        {mission.description}
                      </p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-400">
                          <Rocket className="w-4 h-4 mr-2" />
                          <span>{mission.missionType}</span>
                        </div>
                        <div className="flex items-center text-gray-400">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{mission.destination}</span>
                        </div>
                        <div className="flex items-center text-gray-400">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(mission.launchDate)} • {getDaysFromNow(mission.launchDate)}</span>
                        </div>
                        {mission.crew && mission.crew.length > 0 && (
                          <div className="flex items-center text-gray-400">
                            <Users className="w-4 h-4 mr-2" />
                            <span>{mission.crew.length} crew member{mission.crew.length > 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 opacity-50">
                  <Rocket className="w-full h-full text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No missions found</h3>
                <p className="text-gray-500 mb-4">
                  {selectedFilter === 'All' 
                    ? 'No space missions are currently available.' 
                    : `No missions with status "${selectedFilter}" found.`
                  }
                </p>
                <CosmicCTA 
                  onClick={() => setSelectedFilter('All')}
                  variant="secondary"
                  size="sm"
                >
                  Show All Missions
                </CosmicCTA>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mission Detail Modal */}
      {selectedMission && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedMission.name}</h2>
                  <div className="flex items-center gap-3">
                    <Badge className={`${getStatusColor(selectedMission.status)} border`}>
                      {selectedMission.status}
                    </Badge>
                    <Badge variant="outline" className="text-gray-300 border-gray-600">
                      {selectedMission.agency}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMission(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="objectives">Objectives</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="achievements">Progress</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Mission Description</h3>
                      <p className="text-gray-300 mb-4">{selectedMission.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                          <span className="text-gray-400">Launch Date:</span>
                          <span className="text-white ml-2">{formatDate(selectedMission.launchDate)}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="w-4 h-4 mr-2 text-green-400" />
                          <span className="text-gray-400">Destination:</span>
                          <span className="text-white ml-2">{selectedMission.destination}</span>
                        </div>
                        {selectedMission.missionDuration && (
                          <div className="flex items-center text-sm">
                            <Clock className="w-4 h-4 mr-2 text-purple-400" />
                            <span className="text-gray-400">Duration:</span>
                            <span className="text-white ml-2">{selectedMission.missionDuration}</span>
                          </div>
                        )}
                        {selectedMission.budget && (
                          <div className="flex items-center text-sm">
                            <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                            <span className="text-gray-400">Budget:</span>
                            <span className="text-white ml-2">{selectedMission.budget}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <img 
                        src={selectedMission.imageUrl} 
                        alt={selectedMission.name}
                        className="w-full h-64 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop';
                        }}
                      />
                    </div>
                  </div>
                  
                  {selectedMission.crew && selectedMission.crew.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Crew</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedMission.crew.map((member, index) => (
                          <Badge key={index} variant="outline" className="text-gray-300 border-gray-600">
                            {member}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="objectives" className="space-y-4">
                  {selectedMission.objectives && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Mission Objectives</h3>
                      <ul className="space-y-2">
                        {selectedMission.objectives.map((objective, index) => (
                          <li key={index} className="flex items-start">
                            <Target className="w-4 h-4 mr-2 mt-0.5 text-blue-400 flex-shrink-0" />
                            <span className="text-gray-300">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedMission.instruments && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Scientific Instruments</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedMission.instruments.map((instrument, index) => (
                          <Badge key={index} variant="outline" className="text-gray-300 border-gray-600 justify-start">
                            {instrument}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {selectedMission.launchVehicle && (
                        <div>
                          <h4 className="font-semibold text-white mb-2">Launch Vehicle</h4>
                          <p className="text-gray-300">{selectedMission.launchVehicle}</p>
                        </div>
                      )}
                      
                      {selectedMission.currentLocation && (
                        <div>
                          <h4 className="font-semibold text-white mb-2">Current Location</h4>
                          <p className="text-gray-300">{selectedMission.currentLocation}</p>
                        </div>
                      )}
                      
                      {selectedMission.distanceTraveled && (
                        <div>
                          <h4 className="font-semibold text-white mb-2">Distance Traveled</h4>
                          <p className="text-gray-300">{selectedMission.distanceTraveled}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {selectedMission.operatingTemperature && (
                        <div>
                          <h4 className="font-semibold text-white mb-2">Operating Temperature</h4>
                          <p className="text-gray-300">{selectedMission.operatingTemperature}</p>
                        </div>
                      )}
                      
                      {selectedMission.currentSpeed && (
                        <div>
                          <h4 className="font-semibold text-white mb-2">Current Speed</h4>
                          <p className="text-gray-300">{selectedMission.currentSpeed}</p>
                        </div>
                      )}
                      
                      {selectedMission.samplesCollected && (
                        <div>
                          <h4 className="font-semibold text-white mb-2">Samples Collected</h4>
                          <p className="text-gray-300">{selectedMission.samplesCollected}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="achievements" className="space-y-4">
                  {selectedMission.keyAchievements && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Key Achievements</h3>
                      <ul className="space-y-2">
                        {selectedMission.keyAchievements.map((achievement, index) => (
                          <li key={index} className="flex items-start">
                            <Award className="w-4 h-4 mr-2 mt-0.5 text-yellow-400 flex-shrink-0" />
                            <span className="text-gray-300">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedMission.keyDiscoveries && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Key Discoveries</h3>
                      <ul className="space-y-2">
                        {selectedMission.keyDiscoveries.map((discovery, index) => (
                          <li key={index} className="flex items-start">
                            <Zap className="w-4 h-4 mr-2 mt-0.5 text-cyan-400 flex-shrink-0" />
                            <span className="text-gray-300">{discovery}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedMission.records && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Records & Milestones</h3>
                      <ul className="space-y-2">
                        {selectedMission.records.map((record, index) => (
                          <li key={index} className="flex items-start">
                            <Target className="w-4 h-4 mr-2 mt-0.5 text-green-400 flex-shrink-0" />
                            <span className="text-gray-300">{record}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              {selectedMission.websiteUrl && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <Button
                    onClick={() => window.open(selectedMission.websiteUrl, '_blank')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Official Website
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}