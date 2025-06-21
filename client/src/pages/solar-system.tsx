import { useState, useEffect, useRef } from 'react';
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

const planets: Planet[] = [
  {
    id: 'sun',
    name: 'Sun',
    radius: 109,
    distance: 0,
    orbitalPeriod: 0,
    rotationPeriod: 609.12,
    mass: 333000,
    temperature: 5778,
    moons: 0,
    color: '#FDB813',
    description: 'Our star, the center of the solar system containing 99.86% of the system\'s mass.',
    facts: [
      'Contains 99.86% of the Solar System\'s mass',
      'Core temperature reaches 15 million°C',
      'Fuses 600 million tons of hydrogen per second',
      'Light takes 8 minutes to reach Earth'
    ]
  },
  {
    id: 'mercury',
    name: 'Mercury',
    radius: 0.38,
    distance: 0.39,
    orbitalPeriod: 88,
    rotationPeriod: 1407.6,
    mass: 0.055,
    temperature: 167,
    moons: 0,
    color: '#8C7853',
    description: 'The smallest planet and closest to the Sun, with extreme temperature variations.',
    facts: [
      'Closest planet to the Sun',
      'No atmosphere to retain heat',
      'Day lasts longer than its year',
      'Has water ice at its poles'
    ]
  },
  {
    id: 'venus',
    name: 'Venus',
    radius: 0.95,
    distance: 0.72,
    orbitalPeriod: 225,
    rotationPeriod: -5832.5,
    mass: 0.815,
    temperature: 464,
    moons: 0,
    color: '#FFC649',
    description: 'The hottest planet due to its thick atmosphere and greenhouse effect.',
    facts: [
      'Hottest planet in the solar system',
      'Rotates backwards (retrograde)',
      'Dense CO2 atmosphere',
      'Surface pressure 90x that of Earth'
    ]
  },
  {
    id: 'earth',
    name: 'Earth',
    radius: 1,
    distance: 1,
    orbitalPeriod: 365.25,
    rotationPeriod: 24,
    mass: 1,
    temperature: 15,
    moons: 1,
    color: '#6B93D6',
    description: 'Our home planet, the only known world with life and liquid water on its surface.',
    facts: [
      'Only known planet with life',
      '71% of surface covered by water',
      'Protective magnetic field',
      'Atmosphere contains 21% oxygen'
    ]
  },
  {
    id: 'mars',
    name: 'Mars',
    radius: 0.53,
    distance: 1.52,
    orbitalPeriod: 687,
    rotationPeriod: 24.6,
    mass: 0.107,
    temperature: -65,
    moons: 2,
    color: '#CD5C5C',
    description: 'The Red Planet, with polar ice caps and the largest volcano in the solar system.',
    facts: [
      'Home to Olympus Mons, largest volcano',
      'Has polar ice caps',
      'Day length similar to Earth',
      'Evidence of ancient water flows'
    ]
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    radius: 11.21,
    distance: 5.20,
    orbitalPeriod: 4333,
    rotationPeriod: 9.9,
    mass: 317.8,
    temperature: -110,
    moons: 95,
    color: '#D8CA9D',
    description: 'The largest planet, a gas giant with a Great Red Spot storm and many moons.',
    facts: [
      'Largest planet in our solar system',
      'Great Red Spot is a giant storm',
      'Has at least 95 moons',
      'Acts as a cosmic vacuum cleaner'
    ]
  },
  {
    id: 'saturn',
    name: 'Saturn',
    radius: 9.45,
    distance: 9.58,
    orbitalPeriod: 10759,
    rotationPeriod: 10.7,
    mass: 95.2,
    temperature: -140,
    moons: 146,
    color: '#FAD5A5',
    description: 'Famous for its prominent ring system and low density.',
    facts: [
      'Prominent ring system',
      'Less dense than water',
      'Has at least 146 moons',
      'Titan has thick atmosphere'
    ]
  },
  {
    id: 'uranus',
    name: 'Uranus',
    radius: 4.01,
    distance: 19.20,
    orbitalPeriod: 30687,
    rotationPeriod: -17.2,
    mass: 14.5,
    temperature: -195,
    moons: 28,
    color: '#4FD0E7',
    description: 'An ice giant that rotates on its side with faint rings.',
    facts: [
      'Rotates on its side (98° tilt)',
      'Made of water, methane, and ammonia',
      'Has faint rings',
      'Coldest planetary atmosphere'
    ]
  },
  {
    id: 'neptune',
    name: 'Neptune',
    radius: 3.88,
    distance: 30.05,
    orbitalPeriod: 60190,
    rotationPeriod: 16.1,
    mass: 17.1,
    temperature: -200,
    moons: 16,
    color: '#4B70DD',
    description: 'The windiest planet with supersonic winds and a deep blue color.',
    facts: [
      'Windiest planet (up to 2,100 km/h)',
      'Deep blue color from methane',
      'Takes 165 Earth years to orbit Sun',
      'Has 16 known moons'
    ]
  }
];

export default function SolarSystem() {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet>(planets[3]); // Earth as default
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    document.title = "Solar System Explorer - Cosmofy | Interactive Planetary Data";
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let time = 0;

    const animate = () => {
      const centerX = canvas.offsetWidth / 2;
      const centerY = canvas.offsetHeight / 2;
      const maxRadius = Math.min(centerX, centerY) - 30; // Ensure everything fits
      
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      // Draw Sun with improved styling
      const sunRadius = Math.min(15, maxRadius * 0.08);
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, sunRadius);
      gradient.addColorStop(0, '#FFD700');
      gradient.addColorStop(0.5, '#FFA500');
      gradient.addColorStop(1, '#FF6347');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, sunRadius, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add glow effect
      ctx.shadowColor = '#FFA500';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw planets with adaptive spacing
      planets.slice(1).forEach((planet, index) => {
        const orbitRadius = (maxRadius / 8) * (index + 1.5);
        const angle = (time * 0.01) / Math.sqrt(planet.distance);
        const x = centerX + Math.cos(angle) * orbitRadius;
        const y = centerY + Math.sin(angle) * orbitRadius;
        
        // Draw orbit path
        ctx.beginPath();
        ctx.arc(centerX, centerY, orbitRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw planet with better sizing and gradients
        const planetRadius = Math.max(2, Math.min(12, Math.log(planet.radius + 1) * 3));
        const planetGradient = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, planetRadius);
        planetGradient.addColorStop(0, planet.color);
        planetGradient.addColorStop(1, '#000000');
        
        ctx.beginPath();
        ctx.arc(x, y, planetRadius, 0, 2 * Math.PI);
        ctx.fillStyle = planetGradient;
        ctx.fill();
        
        // Highlight selected planet
        if (planet.id === selectedPlanet.id) {
          ctx.strokeStyle = '#60A5FA';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Add planet name label
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '12px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(planet.name, x, y + planetRadius + 15);
        }
      });

      time += 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedPlanet]);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatTemperature = (temp: number) => {
    return temp > 0 ? `+${temp}°C` : `${temp}°C`;
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
          <div className="max-w-4xl mx-auto text-center mb-12">
            <Badge className="mb-4 sm:mb-6 bg-gradient-to-r from-orange-600/20 to-yellow-600/20 border border-orange-500/30 text-orange-300 text-xs sm:text-sm">
              Interactive Solar System
            </Badge>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-yellow-200 to-orange-300 bg-clip-text text-transparent leading-tight">
              Solar System Explorer
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8 px-4 sm:px-0">
              Explore our solar system with interactive planetary data, orbital mechanics, and fascinating facts about each celestial body.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Solar System Visualization */}
          <div className="space-y-6">
            <Card className="bg-neutral-800/50 border-neutral-700 p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Zap className="w-6 h-6 mr-2 text-blue-400" />
                Interactive Solar System
              </h2>
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-80 bg-black/20 rounded-lg border border-neutral-700"
                  style={{ cursor: 'pointer' }}
                />
                <p className="text-sm text-neutral-400 mt-2 text-center">
                  Click on planets to explore • Orbits are not to scale
                </p>
              </div>
            </Card>

            {/* Planet Selection */}
            <Card className="bg-neutral-800/50 border-neutral-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Select Planet</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {planets.map((planet) => (
                  <Button
                    key={planet.id}
                    variant={selectedPlanet.id === planet.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPlanet(planet)}
                    className="flex flex-col items-center p-3 h-auto"
                  >
                    <div 
                      className="w-6 h-6 rounded-full mb-2"
                      style={{ backgroundColor: planet.color }}
                    />
                    <span className="text-xs">{planet.name}</span>
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Planet Details */}
          <div className="space-y-6">
            <Card className="bg-neutral-800/50 border-neutral-700 p-6">
              <div className="flex items-center mb-4">
                <div 
                  className="w-12 h-12 rounded-full mr-4"
                  style={{ backgroundColor: selectedPlanet.color }}
                />
                <div>
                  <h2 className="text-3xl font-bold">{selectedPlanet.name}</h2>
                  <Badge className="mt-1 bg-blue-500/10 border-blue-500/20 text-blue-400">
                    {selectedPlanet.id === 'sun' ? 'Star' : 'Planet'}
                  </Badge>
                </div>
              </div>
              <p className="text-neutral-300 leading-relaxed mb-6">
                {selectedPlanet.description}
              </p>

              {/* Key Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-neutral-900/50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Thermometer className="w-4 h-4 mr-2 text-red-400" />
                    <span className="text-sm text-neutral-400">Temperature</span>
                  </div>
                  <span className="text-xl font-bold">{formatTemperature(selectedPlanet.temperature)}</span>
                </div>

                <div className="bg-neutral-900/50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                    <span className="text-sm text-neutral-400">Year Length</span>
                  </div>
                  <span className="text-xl font-bold">
                    {selectedPlanet.id === 'sun' ? 'N/A' : `${formatNumber(selectedPlanet.orbitalPeriod)} days`}
                  </span>
                </div>

                <div className="bg-neutral-900/50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Users className="w-4 h-4 mr-2 text-green-400" />
                    <span className="text-sm text-neutral-400">Moons</span>
                  </div>
                  <span className="text-xl font-bold">{selectedPlanet.moons}</span>
                </div>

                <div className="bg-neutral-900/50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Info className="w-4 h-4 mr-2 text-purple-400" />
                    <span className="text-sm text-neutral-400">Mass (Earth = 1)</span>
                  </div>
                  <span className="text-xl font-bold">
                    {selectedPlanet.mass >= 1 ? formatNumber(selectedPlanet.mass) : selectedPlanet.mass.toFixed(3)}
                  </span>
                </div>
              </div>

              {/* Interesting Facts */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Fascinating Facts</h3>
                <ul className="space-y-2">
                  {selectedPlanet.facts.map((fact, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span className="text-neutral-300">{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Additional Data */}
            <Card className="bg-neutral-800/50 border-neutral-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Orbital Data</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Distance from Sun</span>
                  <span className="font-medium">
                    {selectedPlanet.id === 'sun' ? 'Center' : `${selectedPlanet.distance} AU`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Radius (Earth = 1)</span>
                  <span className="font-medium">{selectedPlanet.radius}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Day Length</span>
                  <span className="font-medium">
                    {selectedPlanet.id === 'sun' 
                      ? '25.4 Earth days' 
                      : selectedPlanet.rotationPeriod < 0 
                        ? `${Math.abs(selectedPlanet.rotationPeriod).toFixed(1)}h (retrograde)`
                        : `${selectedPlanet.rotationPeriod.toFixed(1)}h`
                    }
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}