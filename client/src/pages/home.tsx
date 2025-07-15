import { useEffect } from 'react';
import { Link } from 'wouter';
import { Navigation } from '@/components/navigation';
import { HeroSection } from '@/components/hero-section';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Satellite, Zap, Circle, Rocket, ArrowRight, Globe, Newspaper, Volume2, Cloud, Telescope, Calendar, MapPin, Star, Radio, Sun } from 'lucide-react';
import { Footer } from '@/components/footer';

export default function Home() {
  useEffect(() => {
    document.title = "Space Explorer - Explore the Cosmos | Real-time Space Data & NASA APIs";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Journey through space with real-time NASA data, track the ISS, discover celestial wonders, and witness aurora displays. Experience the cosmos like never before.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Journey through space with real-time NASA data, track the ISS, discover celestial wonders, and witness aurora displays. Experience the cosmos like never before.';
      document.head.appendChild(meta);
    }
  }, []);

  const features = [
    {
      id: 'gallery',
      title: 'APOD Gallery',
      description: 'Explore NASA\'s astronomy picture of the day collection with detailed explanations and high-resolution imagery.',
      icon: Camera,
      href: '/gallery',
      stats: '10k+ Images'
    },
    {
      id: 'iss-tracker',
      title: 'ISS Tracker',
      description: 'Track the International Space Station in real-time with live position data and pass predictions.',
      icon: Satellite,
      href: '/iss-tracker',
      stats: 'Live Position'
    },
    {
      id: 'solar-system',
      title: 'Solar System Explorer',
      description: 'Interactive 3D visualization of our solar system with detailed planetary data and orbital mechanics.',
      icon: Globe,
      href: '/solar-system',
      stats: '8 Planets'
    },
    {
      id: 'aurora',
      title: 'Aurora Forecast',
      description: 'Monitor geomagnetic activity and discover optimal viewing conditions for aurora displays.',
      icon: Zap,
      href: '/aurora',
      stats: 'Global Coverage'
    },
    {
      id: 'asteroids',
      title: 'Asteroid Watch',
      description: 'Stay informed about near-Earth objects and their trajectories with real-time tracking data.',
      icon: Circle,
      href: '/asteroids',
      stats: '500+ Tracked'
    },
    {
      id: 'missions',
      title: 'Space Missions',
      description: 'Follow active space missions and their latest discoveries from agencies worldwide.',
      icon: Rocket,
      href: '/missions',
      stats: '20+ Active'
    },
    {
      id: 'news',
      title: 'Space News',
      description: 'Stay updated with the latest space exploration news and discoveries from around the world.',
      icon: Newspaper,
      href: '/news',
      stats: 'Real-time'
    },

    {
      id: 'space-weather',
      title: 'Space Weather',
      description: 'Monitor solar activity, geomagnetic storms, and space radiation with real-time NOAA data.',
      icon: Cloud,
      href: '/space-weather',
      stats: 'Live Data'
    },
    {
      id: 'telescope',
      title: 'Virtual Telescope',
      description: 'Access live feeds from Hubble, James Webb, and ground observatories with observation schedules.',
      icon: Telescope,
      href: '/telescope',
      stats: 'Live Feeds'
    },
    {
      id: 'events',
      title: 'Cosmic Events',
      description: 'Track upcoming eclipses, meteor showers, planetary alignments with detailed countdown timers.',
      icon: Calendar,
      href: '/events',
      stats: 'Upcoming Events'
    },

    {
      id: 'constellations',
      title: 'Constellation Guide',
      description: 'Interactive star patterns with mythology, visibility tracking based on your location and time.',
      icon: Star,
      href: '/constellations',
      stats: '88 Constellations'
    },
    {
      id: 'satellite-tracker',
      title: 'Satellite Tracker',
      description: 'Real-time positions of satellites, space stations, and debris with detailed flyover predictions.',
      icon: Radio,
      href: '/satellite-tracker',
      stats: '20+ Satellites'
    },

  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <HeroSection />

      {/* Features Section */}
      <section className="section-spacing">
        <div className="content-container">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-blue-500/10 border border-blue-500/20 text-blue-400">
              Explore Space Data
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Discover the Universe
            </h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              Access real-time space data and astronomical imagery from NASA and leading space agencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.id} href={feature.href}>
                  <Card className="glass-morphism p-6 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer group h-full flex flex-col">
                    <div className="flex items-center mb-4">
                      <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 mr-4">
                        <Icon className="h-6 w-6 text-blue-400" />
                      </div>
                      <div className="text-sm text-neutral-500">{feature.stats}</div>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-neutral-400 leading-relaxed mb-4 flex-grow">
                      {feature.description}
                    </p>

                    <div className="flex items-center text-blue-400 font-medium text-sm group-hover:text-white transition-colors mt-auto">
                      Explore
                      <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}