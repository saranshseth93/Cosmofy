import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Info, Zap, Thermometer, Calendar, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Planet {
  id: string;
  name: string;
  radius: number; // Relative to Earth
  distance: number; // AU from Sun
  orbitalPeriod: number; // Earth days
  rotationPeriod: number; // Earth hours
  mass: number; // Relative to Earth
  temperature: number; // Celsius
  moons: number;
  color: string;
  description: string;
  facts: string[];
}

export default function SolarSystemExplorer() {
  const [selectedPlanet, setSelectedPlanet] = useState<string>('earth');
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch planets from le-systeme-solaire.net API
  const { data: planets = [], isLoading, error } = useQuery<Planet[]>({
    queryKey: ['/api/solar-system'],
    queryFn: async () => {
      const response = await fetch('/api/solar-system');
      if (!response.ok) {
        throw new Error('Failed to fetch solar system data');
      }
      return response.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  useEffect(() => {
    document.title = "Solar System Explorer - Cosmofy | Interactive Planetary Data";
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading solar system data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-6">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <Info className="h-10 w-10 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Solar System Data Unavailable
              </h1>
              <p className="text-muted-foreground mb-6">
                Unable to load authentic solar system data from le-systeme-solaire.net API. 
                Please check your connection and try again.
              </p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedPlanetData = planets.find(p => p.id === selectedPlanet) || planets[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Solar System Explorer
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Explore authentic planetary data from le-systeme-solaire.net
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Planet Selection */}
          <div className="lg:col-span-1">
            <Card className="glass-morphism p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Select Planet</h2>
              <div className="space-y-2">
                {planets.map((planet) => (
                  <Button
                    key={planet.id}
                    variant={selectedPlanet === planet.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedPlanet(planet.id)}
                  >
                    <div 
                      className="w-4 h-4 rounded-full mr-3" 
                      style={{ backgroundColor: planet.color }}
                    />
                    {planet.name}
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Planet Details */}
          <div className="lg:col-span-2">
            {selectedPlanetData && (
              <Card className="glass-morphism p-6">
                <div className="flex items-center mb-4">
                  <div 
                    className="w-8 h-8 rounded-full mr-4" 
                    style={{ backgroundColor: selectedPlanetData.color }}
                  />
                  <h2 className="text-2xl font-semibold text-white">{selectedPlanetData.name}</h2>
                </div>
                
                <p className="text-gray-300 mb-6">{selectedPlanetData.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{selectedPlanetData.radius}x</div>
                    <div className="text-sm text-gray-400">Earth Radius</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{selectedPlanetData.distance} AU</div>
                    <div className="text-sm text-gray-400">Distance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{selectedPlanetData.moons}</div>
                    <div className="text-sm text-gray-400">Moons</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">{selectedPlanetData.temperature}°C</div>
                    <div className="text-sm text-gray-400">Temperature</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-white">Key Facts</h3>
                  <ul className="space-y-1">
                    {selectedPlanetData.facts.map((fact, index) => (
                      <li key={index} className="text-gray-300 text-sm">• {fact}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-500/10 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Calendar className="w-5 h-5 text-blue-400 mr-2" />
                      <span className="text-blue-400 font-medium">Orbital Period</span>
                    </div>
                    <p className="text-white">{selectedPlanetData.orbitalPeriod} Earth days</p>
                  </div>
                  <div className="bg-purple-500/10 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Zap className="w-5 h-5 text-purple-400 mr-2" />
                      <span className="text-purple-400 font-medium">Mass</span>
                    </div>
                    <p className="text-white">{selectedPlanetData.mass}x Earth mass</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}