import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, Home, Camera, Satellite, Zap, Circle, Rocket, Globe, Newspaper, Volume2, Telescope, Calendar, Star, MapPin, CloudRain } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Logo removed - using text instead

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/gallery', label: 'Gallery', icon: Camera },
    { href: '/iss-tracker', label: 'ISS Tracker', icon: Satellite },
    { href: '/solar-system', label: 'Solar System', icon: Globe },
    { href: '/aurora', label: 'Aurora', icon: Zap },
    { href: '/asteroids', label: 'Asteroids', icon: Circle },
    { href: '/missions', label: 'Missions', icon: Rocket },
    { href: '/news', label: 'Space News', icon: Newspaper },
    { href: '/sounds', label: 'Space Sounds', icon: Volume2 },
    { href: '/space-weather', label: 'Space Weather', icon: CloudRain },
    { href: '/telescope', label: 'Virtual Telescope', icon: Telescope },
    { href: '/events', label: 'Cosmic Events', icon: Calendar },
    { href: '/mars-rover', label: 'Mars Rovers', icon: MapPin },
    { href: '/constellations', label: 'Constellations', icon: Star },
    { href: '/satellites', label: 'Satellite Tracker', icon: Satellite },

  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-700/50' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              COSMOFY
            </span>
          </Link>

          {/* Hamburger Menu Button (Both Desktop and Mobile) */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-neutral-300 hover:text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Navigation Menu (Both Desktop and Mobile) */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-neutral-900/95 backdrop-blur-xl border-b border-neutral-700/50 shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="container mx-auto px-4 sm:px-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                          isActive 
                            ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20' 
                            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="mr-3 h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}