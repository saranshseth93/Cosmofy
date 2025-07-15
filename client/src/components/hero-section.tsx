import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'wouter';
import { useEffect, useRef } from 'react';

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create animated stars
    const stars: Array<{x: number, y: number, radius: number, opacity: number, speed: number}> = [];
    
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.5 + 0.2
      });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw stars
      stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
        
        // Animate stars
        star.opacity = Math.sin(Date.now() * 0.001 + star.x) * 0.3 + 0.7;
        star.y += star.speed;
        
        if (star.y > canvas.height) {
          star.y = -star.radius;
          star.x = Math.random() * canvas.width;
        }
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <Badge className="mb-8 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all duration-300 px-4 py-2 mt-8">
          Real-time Space Data Platform
        </Badge>
        
        {/* Animated Cosmic Scene */}
        <div className="relative w-full h-[500px] mb-8 rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-cyan-900/30 backdrop-blur-sm border border-white/10">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_20%,_rgba(0,0,0,0.4)_100%)]"></div>
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl mb-6 animate-pulse filter drop-shadow-2xl">
                🌌
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Interactive Cosmic Experience
              </h2>
              <p className="text-neutral-300 text-lg">
                Journey through the universe with real-time space data
              </p>
            </div>
          </div>
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
