import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Sun, 
  Moon, 
  Thermometer, 
  Timer, 
  Orbit, 
  Zap,
  Info,
  ChevronRight
} from "lucide-react";

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

const planets: Planet[] = [
  {
    id: "mercury",
    name: "Mercury",
    radius: 0.38,
    distance: 0.39,
    orbitalPeriod: 88,
    rotationPeriod: 1408,
    mass: 0.055,
    temperature: 167,
    moons: 0,
    color: "from-gray-400 to-gray-600",
    description: "The smallest planet in our solar system and closest to the Sun.",
    facts: [
      "Has extreme temperature variations from -173°C to 427°C",
      "One day on Mercury lasts about 59 Earth days",
      "Has a very thin atmosphere called an exosphere",
      "Named after the Roman messenger god"
    ]
  },
  {
    id: "venus",
    name: "Venus",
    radius: 0.95,
    distance: 0.72,
    orbitalPeriod: 225,
    rotationPeriod: 5832,
    mass: 0.815,
    temperature: 464,
    moons: 0,
    color: "from-yellow-400 to-orange-500",
    description: "The hottest planet in our solar system with a thick, toxic atmosphere.",
    facts: [
      "Rotates backwards compared to most planets",
      "Surface pressure is 90 times that of Earth",
      "Called Earth's twin due to similar size",
      "Covered in thick clouds of sulfuric acid"
    ]
  },
  {
    id: "earth",
    name: "Earth",
    radius: 1.0,
    distance: 1.0,
    orbitalPeriod: 365,
    rotationPeriod: 24,
    mass: 1.0,
    temperature: 15,
    moons: 1,
    color: "from-blue-400 to-green-500",
    description: "Our home planet, the only known planet to harbor life.",
    facts: [
      "71% of surface is covered by water",
      "Has a protective magnetic field",
      "Only planet known to support life",
      "Age is approximately 4.5 billion years"
    ]
  },
  {
    id: "mars",
    name: "Mars",
    radius: 0.53,
    distance: 1.52,
    orbitalPeriod: 687,
    rotationPeriod: 25,
    mass: 0.107,
    temperature: -65,
    moons: 2,
    color: "from-red-500 to-red-700",
    description: "The Red Planet, named for its rusty color due to iron oxide on its surface.",
    facts: [
      "Has the largest volcano in the solar system (Olympus Mons)",
      "Evidence suggests it once had liquid water",
      "Day length is similar to Earth (24.6 hours)",
      "Has polar ice caps made of water and CO2"
    ]
  },
  {
    id: "jupiter",
    name: "Jupiter",
    radius: 11.2,
    distance: 5.2,
    orbitalPeriod: 4333,
    rotationPeriod: 10,
    mass: 318,
    temperature: -110,
    moons: 95,
    color: "from-orange-300 to-brown-500",
    description: "The largest planet in our solar system, a gas giant with a Great Red Spot.",
    facts: [
      "More massive than all other planets combined",
      "Great Red Spot is a storm larger than Earth",
      "Has a faint ring system",
      "Acts as a cosmic vacuum cleaner, protecting inner planets"
    ]
  },
  {
    id: "saturn",
    name: "Saturn",
    radius: 9.4,
    distance: 9.5,
    orbitalPeriod: 10756,
    rotationPeriod: 11,
    mass: 95,
    temperature: -140,
    moons: 146,
    color: "from-yellow-200 to-yellow-400",
    description: "Known for its spectacular ring system, Saturn is a gas giant less dense than water.",
    facts: [
      "Has the most extensive ring system",
      "Less dense than water - it would float!",
      "Winds can reach speeds of 1,800 km/h",
      "Titan, its largest moon, has lakes of methane"
    ]
  },
  {
    id: "uranus",
    name: "Uranus",
    radius: 4.0,
    distance: 19.2,
    orbitalPeriod: 30687,
    rotationPeriod: 17,
    mass: 14.5,
    temperature: -195,
    moons: 28,
    color: "from-cyan-300 to-blue-400",
    description: "An ice giant that rotates on its side, with a unique sideways orientation.",
    facts: [
      "Rotates on its side at a 98-degree angle",
      "Made mostly of water, methane, and ammonia ices",
      "Has faint rings discovered in 1977",
      "Coldest planetary atmosphere in solar system"
    ]
  },
  {
    id: "neptune",
    name: "Neptune",
    radius: 3.9,
    distance: 30.1,
    orbitalPeriod: 60190,
    rotationPeriod: 16,
    mass: 17.1,
    temperature: -200,
    moons: 16,
    color: "from-blue-500 to-blue-700",
    description: "The windiest planet in our solar system, an ice giant with supersonic winds.",
    facts: [
      "Strongest winds in solar system (up to 2,100 km/h)",
      "Takes 165 Earth years to orbit the Sun",
      "Has a Great Dark Spot similar to Jupiter's Great Red Spot",
      "Discovered through mathematical prediction"
    ]
  }
];

export default function SolarSystem() {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);

  const PlanetCard = ({ planet }: { planet: Planet }) => (
    <Card 
      className="group relative overflow-hidden bg-neutral-900/50 border-neutral-700 hover:border-neutral-600 transition-all duration-300 hover:scale-105 cursor-pointer"
      onClick={() => setSelectedPlanet(planet)}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${planet.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div 
            className={`w-12 h-12 rounded-full bg-gradient-to-br ${planet.color} shadow-lg`}
            style={{
              boxShadow: `0 0 20px rgba(${planet.color.includes('blue') ? '59, 130, 246' : 
                         planet.color.includes('red') ? '239, 68, 68' :
                         planet.color.includes('yellow') ? '245, 158, 11' :
                         planet.color.includes('green') ? '34, 197, 94' : '156, 163, 175'}, 0.3)`
            }}
          />
          <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
        </div>
        <CardTitle className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
          {planet.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <CardDescription className="text-neutral-300">
          {planet.description}
        </CardDescription>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4 text-orange-400" />
            <span className="text-neutral-400">{planet.distance} AU</span>
          </div>
          <div className="flex items-center space-x-2">
            <Timer className="h-4 w-4 text-blue-400" />
            <span className="text-neutral-400">{planet.orbitalPeriod} days</span>
          </div>
          <div className="flex items-center space-x-2">
            <Thermometer className="h-4 w-4 text-red-400" />
            <span className="text-neutral-400">{planet.temperature}°C</span>
          </div>
          <div className="flex items-center space-x-2">
            <Moon className="h-4 w-4 text-gray-400" />
            <span className="text-neutral-400">{planet.moons} moons</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-neutral-800 text-neutral-300">
            {planet.radius}x Earth size
          </Badge>
          <Badge variant="secondary" className="bg-neutral-800 text-neutral-300">
            {planet.mass}x Earth mass
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-black">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-600 bg-clip-text text-transparent mb-6">
              Solar System
            </h1>
            <p className="text-xl md:text-2xl text-neutral-300 max-w-4xl mx-auto leading-relaxed">
              Explore our cosmic neighborhood with detailed information about each planet, 
              their characteristics, and fascinating facts about our solar system
            </p>
          </div>
          
          {/* Solar System Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">8</div>
              <div className="text-neutral-400">Planets</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">290+</div>
              <div className="text-neutral-400">Moons</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">4.6B</div>
              <div className="text-neutral-400">Years Old</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">1</div>
              <div className="text-neutral-400">Known Life</div>
            </div>
          </div>
        </div>
      </section>

      {/* Planets Grid */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {planets.map((planet, index) => (
              <div
                key={planet.id}
                className="opacity-0 animate-fade-in-up"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'forwards'
                }}
              >
                <PlanetCard planet={planet} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planet Detail Modal */}
      <Dialog open={!!selectedPlanet} onOpenChange={() => setSelectedPlanet(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-neutral-900 border-neutral-700">
          {selectedPlanet && (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <div 
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${selectedPlanet.color} shadow-lg`}
                    style={{
                      boxShadow: `0 0 30px rgba(${selectedPlanet.color.includes('blue') ? '59, 130, 246' : 
                                 selectedPlanet.color.includes('red') ? '239, 68, 68' :
                                 selectedPlanet.color.includes('yellow') ? '245, 158, 11' :
                                 selectedPlanet.color.includes('green') ? '34, 197, 94' : '156, 163, 175'}, 0.4)`
                    }}
                  />
                  <div>
                    <DialogTitle className="text-3xl font-bold text-white">
                      {selectedPlanet.name}
                    </DialogTitle>
                    <DialogDescription className="text-neutral-300 text-lg">
                      {selectedPlanet.description}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-8">
                {/* Key Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-neutral-800/50 rounded-lg p-4 text-center">
                    <Sun className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{selectedPlanet.distance}</div>
                    <div className="text-neutral-400 text-sm">AU from Sun</div>
                  </div>
                  <div className="bg-neutral-800/50 rounded-lg p-4 text-center">
                    <Orbit className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{selectedPlanet.orbitalPeriod}</div>
                    <div className="text-neutral-400 text-sm">Earth days/year</div>
                  </div>
                  <div className="bg-neutral-800/50 rounded-lg p-4 text-center">
                    <Timer className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{selectedPlanet.rotationPeriod}</div>
                    <div className="text-neutral-400 text-sm">Hours/day</div>
                  </div>
                  <div className="bg-neutral-800/50 rounded-lg p-4 text-center">
                    <Thermometer className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{selectedPlanet.temperature}°C</div>
                    <div className="text-neutral-400 text-sm">Average temp</div>
                  </div>
                </div>

                {/* Comparison to Earth */}
                <div className="bg-neutral-800/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Zap className="mr-2 h-5 w-5 text-blue-400" />
                    Compared to Earth
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-400">{selectedPlanet.radius}x</div>
                      <div className="text-neutral-400">Radius</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-400">{selectedPlanet.mass}x</div>
                      <div className="text-neutral-400">Mass</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-400">{selectedPlanet.moons}</div>
                      <div className="text-neutral-400">Moons</div>
                    </div>
                  </div>
                </div>

                {/* Fascinating Facts */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Info className="mr-2 h-5 w-5 text-yellow-400" />
                    Fascinating Facts
                  </h3>
                  <div className="space-y-3">
                    {selectedPlanet.facts.map((fact, index) => (
                      <div key={index} className="flex items-start space-x-3 bg-neutral-800/30 rounded-lg p-4">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                        <div className="text-neutral-300">{fact}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}