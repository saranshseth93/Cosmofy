import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Satellite,
  Globe,
  Zap,
  Circle,
  Rocket,
  Newspaper,
  Volume2,
  CloudRain,
  Calendar,
  Star,
  MapPin,
  ArrowRight,
  Sparkles,
  Telescope,
  TrendingUp,
  Users,
  Clock,
  Eye,
  Activity,
  Target,
  Atom,
  Moon,
  Sun,
} from "lucide-react";
import { Footer } from "@/components/footer";

const HeroSection = ({ children }: { children: React.ReactNode }) => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    {/* Animated Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.05),transparent_50%)]" />
    </div>
    
    {/* Floating particles */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        >
          <div className="w-1 h-1 bg-white/20 rounded-full" />
        </div>
      ))}
    </div>

    <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {children}
    </div>
  </section>
);

const AnimatedText = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {children}
    </div>
  );
};

const CosmosText = () => {
  return (
    <div className="relative inline-block">
      <span
        className="text-6xl md:text-8xl lg:text-9xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse"
        style={{
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 3s ease-in-out infinite',
        }}
      >
        COSMOS
      </span>
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
};

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  stats, 
  href, 
  gradient 
}: {
  icon: any;
  title: string;
  description: string;
  stats: string;
  href: string;
  gradient: string;
}) => (
  <Link href={href}>
    <Card className="group relative overflow-hidden bg-neutral-900/50 border-neutral-700 hover:border-neutral-600 transition-all duration-300 hover:scale-105 cursor-pointer">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-10`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <ArrowRight className="h-5 w-5 text-neutral-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
        </div>
        <CardTitle className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <CardDescription className="text-neutral-300 mb-4">
          {description}
        </CardDescription>
        <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 border-neutral-600">
          {stats}
        </Badge>
      </CardContent>
    </Card>
  </Link>
);

export default function Home() {
  const features = [
    {
      icon: Camera,
      title: "NASA Image Gallery",
      description: "Explore breathtaking astronomical images from NASA's archives with advanced filtering and search capabilities.",
      stats: "20+ Categories",
      href: "/gallery",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Satellite,
      title: "ISS Live Tracker",
      description: "Track the International Space Station in real-time with live position updates and pass predictions.",
      stats: "Real-time Data",
      href: "/iss-tracker",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Globe,
      title: "Solar System Explorer",
      description: "Interactive journey through our solar system with detailed planetary information and 3D visualizations.",
      stats: "8 Planets",
      href: "/solar-system",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Zap,
      title: "Aurora Forecast",
      description: "Get real-time aurora predictions and optimal viewing conditions based on your location.",
      stats: "Location-based",
      href: "/aurora",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Circle,
      title: "Asteroid Tracker",
      description: "Monitor near-Earth asteroids with detailed orbital data and potential impact assessments.",
      stats: "Live Updates",
      href: "/asteroids",
      gradient: "from-gray-500 to-slate-500"
    },
    {
      icon: Rocket,
      title: "Space Missions",
      description: "Follow active space missions with crew information, mission objectives, and live updates.",
      stats: "Active Missions",
      href: "/missions",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: Newspaper,
      title: "Space News",
      description: "Stay updated with the latest space exploration news from multiple authoritative sources.",
      stats: "Daily Updates",
      href: "/news",
      gradient: "from-teal-500 to-cyan-500"
    },
    {
      icon: Volume2,
      title: "Cosmic Sounds",
      description: "Experience authentic space sounds based on real NASA mission data and cosmic phenomena.",
      stats: "8 Sound Categories",
      href: "/sounds",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      icon: CloudRain,
      title: "Space Weather",
      description: "Monitor solar activity, geomagnetic storms, and space weather conditions affecting Earth.",
      stats: "NOAA Data",
      href: "/space-weather",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: Calendar,
      title: "Cosmic Events",
      description: "Discover upcoming astronomical events including eclipses, meteor showers, and planetary alignments.",
      stats: "Event Calendar",
      href: "/events",
      gradient: "from-violet-500 to-purple-500"
    },
    {
      icon: Star,
      title: "Constellation Guide",
      description: "Explore constellation patterns with mythology, star information, and visibility from your location.",
      stats: "26 Constellations",
      href: "/constellations",
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      icon: MapPin,
      title: "Satellite Tracker",
      description: "Track satellites in real-time with orbital predictions and flyover notifications for your location.",
      stats: "Location-based Tracking",
      href: "/satellites",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      icon: Sun,
      title: "Hindu Panchang",
      description: "Traditional Vedic calendar with astronomical calculations, tithis, and auspicious timings.",
      stats: "Vedic Astronomy",
      href: "/panchang",
      gradient: "from-amber-500 to-yellow-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-black">
      <Navigation />
      
      <HeroSection>
        <AnimatedText>
          <div className="mb-8">
            <CosmosText />
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-neutral-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Explore the infinite wonders of space through real-time data, stunning visuals, and interactive experiences
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/gallery">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Begin Exploration
              </Button>
            </Link>
            <div className="flex items-center text-neutral-400 text-sm">
              <Eye className="mr-2 h-4 w-4" />
              <span>13 Interactive Features</span>
            </div>
          </div>
        </AnimatedText>
      </HeroSection>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Space Exploration Features
            </h2>
            <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
              Comprehensive tools and data sources for space enthusiasts, researchers, and curious minds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="opacity-0 animate-fade-in-up"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'forwards'
                }}
              >
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-blue-400">13</div>
              <div className="text-neutral-400">Interactive Features</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-purple-400">Real-time</div>
              <div className="text-neutral-400">Data Sources</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-green-400">NASA</div>
              <div className="text-neutral-400">API Integration</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-orange-400">24/7</div>
              <div className="text-neutral-400">Live Updates</div>
            </div>
          </div>
        </div>
      </section>

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