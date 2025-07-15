import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'wouter';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <Badge className="mb-8 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all duration-300 px-4 py-2 mt-8">
          Real-time Space Data Platform
        </Badge>
        
        {/* Spline 3D Scene */}
        <div className="relative w-full h-[500px] mb-8 rounded-xl overflow-hidden bg-black/20 backdrop-blur-sm border border-white/10">
          <iframe
            src="https://my.spline.design/bb6658c5-dafd-4ba9-8a6b-1d7c5d6a6f6d"
            className="w-full h-full border-0"
            allowFullScreen
            title="3D Cosmic Scene"
          />
        </div>
        
        {/* Description */}
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Journey through space with real-time NASA data, track the ISS, discover 
          celestial wonders, and witness the universe unfold before your eyes.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link href="/gallery">
            <button className="cosmic-cta group relative inline-flex items-center px-12 py-4 overflow-hidden text-lg font-bold text-white bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-400 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/25">
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></span>
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              <span className="relative z-10 flex items-center">
                Launch Exploration
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </button>
          </Link>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="glass-morphism rounded-lg p-6 hover:bg-white/[0.04] transition-all duration-300">
            <div className="flex items-center justify-center mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-green-400 text-sm font-medium">Live</span>
            </div>
            <div className="text-neutral-400 text-sm mb-1">ISS Tracking</div>
            <div className="text-xl font-semibold text-white">Real-time</div>
          </div>
          
          <div className="glass-morphism rounded-lg p-6 hover:bg-white/[0.04] transition-all duration-300">
            <div className="text-neutral-400 text-sm mb-1">Cosmic Images</div>
            <div className="text-xl font-semibold text-white">10k+</div>
            <div className="text-xs text-neutral-500 mt-1">NASA APOD Gallery</div>
          </div>
          
          <div className="glass-morphism rounded-lg p-6 hover:bg-white/[0.04] transition-all duration-300">
            <div className="text-neutral-400 text-sm mb-1">Asteroids Tracked</div>
            <div className="text-xl font-semibold text-white">500+</div>
            <div className="text-xs text-neutral-500 mt-1">Near-Earth Objects</div>
          </div>
        </div>
      </div>
    </section>
  );
}
