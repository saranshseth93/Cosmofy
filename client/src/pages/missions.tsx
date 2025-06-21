import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Rocket, Calendar, Globe, MapPin, Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CosmicPulse } from '@/components/lottie-loader';
import { CosmicCursor } from '@/components/cosmic-cursor';

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

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysFromNow = (dateString: string) => {
    const d = new Date(dateString);
    const now = new Date();
    const diffTime = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) return `In ${diffDays} days`;
    if (diffDays === 0) return 'Today';
    return `${Math.abs(diffDays)} days ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      <CosmicCursor />
      <Navigation />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Space Missions
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Explore current and upcoming space missions from agencies around the world
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {uniqueStatuses.map((status) => (
              <Button
                key={status}
                variant={selectedFilter === status ? "default" : "outline"}
                onClick={() => setSelectedFilter(status)}
                className={`${
                  selectedFilter === status 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700'
                } transition-all duration-300`}
              >
                {status}
              </Button>
            ))}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <CosmicPulse />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20">
              <div className="text-red-400 mb-4">Failed to load missions</div>
              <p className="text-gray-400">Unable to fetch space mission data from Launch Library API</p>
            </div>
          )}

          {/* Missions Grid */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredMissions.map((mission) => (
                <Card key={mission.id} className="glass-morphism hover:scale-105 transition-transform duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={`${getStatusColor(mission.status?.name || '')} text-xs`}>
                        {mission.status?.name || 'Unknown'}
                      </Badge>
                      <div className="text-xs text-gray-400">
                        {getDaysFromNow(mission.net)}
                      </div>
                    </div>
                    <CardTitle className="text-lg font-bold text-white mb-2">
                      {mission.name}
                    </CardTitle>
                    {mission.image && (
                      <img 
                        src={mission.image} 
                        alt={mission.name}
                        className="w-full h-40 object-cover rounded-md mb-4"
                      />
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-gray-300">
                      <Rocket className="w-4 h-4 mr-2 text-purple-400" />
                      <span>{mission.rocket?.configuration?.full_name || 'Unknown Rocket'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <Globe className="w-4 h-4 mr-2 text-blue-400" />
                      <span>{mission.launch_service_provider?.name || 'Unknown Agency'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <MapPin className="w-4 h-4 mr-2 text-green-400" />
                      <span>{mission.pad?.location?.name || 'Unknown Location'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <Calendar className="w-4 h-4 mr-2 text-orange-400" />
                      <span>{formatDate(mission.net)}</span>
                    </div>
                    {mission.mission?.description && (
                      <p className="text-sm text-gray-400 line-clamp-3">
                        {mission.mission.description}
                      </p>
                    )}
                    {mission.mission?.type && (
                      <div className="flex items-center text-sm text-gray-300">
                        <Clock className="w-4 h-4 mr-2 text-cyan-400" />
                        <span>{mission.mission.type}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && !error && filteredMissions.length === 0 && (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-4">No missions found</div>
              <p className="text-gray-500">Try adjusting your filter or check back later</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}