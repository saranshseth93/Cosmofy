import { Link } from "wouter";
import { Github, Twitter, Linkedin, Mail, Star, Rocket } from "lucide-react";

// Use inline SVG logo for now
const logoImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23667eea'/%3E%3Ctext x='50' y='57' text-anchor='middle' fill='white' font-family='Arial' font-size='24' font-weight='bold'%3EC%3C/text%3E%3C/svg%3E";

export function Footer() {
  return (
    <footer className="bg-neutral-900 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src={logoImage}
                alt="Space Explorer Logo"
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold text-white">Cosmofy</span>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-sm">
              Explore the infinite wonders of space through real-time data, 
              stunning visuals, and interactive experiences powered by NASA APIs.
            </p>
            <div className="flex items-center space-x-2 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
              <span className="text-neutral-400 text-sm ml-2">Space Exploration</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Explore</h3>
            <div className="space-y-2">
              <Link href="/gallery">
                <span className="text-neutral-400 hover:text-white transition-colors text-sm cursor-pointer">
                  NASA Gallery
                </span>
              </Link>
              <Link href="/iss-tracker">
                <span className="text-neutral-400 hover:text-white transition-colors text-sm cursor-pointer">
                  ISS Tracker
                </span>
              </Link>
              <Link href="/solar-system">
                <span className="text-neutral-400 hover:text-white transition-colors text-sm cursor-pointer">
                  Solar System
                </span>
              </Link>
              <Link href="/satellites">
                <span className="text-neutral-400 hover:text-white transition-colors text-sm cursor-pointer">
                  Satellite Tracker
                </span>
              </Link>
              <Link href="/space-weather">
                <span className="text-neutral-400 hover:text-white transition-colors text-sm cursor-pointer">
                  Space Weather
                </span>
              </Link>
            </div>
          </div>

          {/* Features & Info */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Features</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Rocket className="h-4 w-4 text-blue-400" />
                <span className="text-neutral-400 text-sm">Real-time Data</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-purple-400" />
                <span className="text-neutral-400 text-sm">NASA Integration</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-green-400" />
                <span className="text-neutral-400 text-sm">13 Space Tools</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-neutral-400 text-sm">
            © 2025 Cosmofy. Built with love for space exploration.
          </div>
          <div className="flex items-center space-x-1 text-neutral-400 text-sm mt-4 sm:mt-0">
            <span>Powered by</span>
            <span className="text-blue-400 font-medium">NASA APIs</span>
            <span>•</span>
            <span className="text-purple-400 font-medium">Real-time Data</span>
          </div>
        </div>
      </div>
    </footer>
  );
}