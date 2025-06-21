import React, { useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Rocket } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { CosmicCursor } from '@/components/cosmic-cursor';
import { Footer } from '@/components/footer';

export default function NotFoundPage() {
  useEffect(() => {
    // Add floating animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0% { transform: translateY(0px) rotate(0deg); }
        33% { transform: translateY(-10px) rotate(5deg); }
        66% { transform: translateY(5px) rotate(-5deg); }
        100% { transform: translateY(0px) rotate(0deg); }
      }
      
      @keyframes glow {
        0%, 100% { text-shadow: 0 0 20px #3b82f6, 0 0 30px #3b82f6, 0 0 40px #3b82f6; }
        50% { text-shadow: 0 0 30px #06b6d4, 0 0 40px #06b6d4, 0 0 50px #06b6d4; }
      }
      
      @keyframes stars {
        0% { transform: translateY(0) rotate(0deg); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
      }
      
      @keyframes rocket-float {
        0%, 100% { transform: translateY(0px) rotate(-5deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
      <CosmicCursor />
      <Navigation />
      
      {/* Animated background stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-70"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `stars ${Math.random() * 3 + 2}s linear infinite`,
              animationDelay: Math.random() * 2 + 's'
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-8 max-w-2xl mx-auto">
          
          {/* Floating rocket */}
          <div 
            className="flex justify-center mb-8"
            style={{ animation: 'rocket-float 3s ease-in-out infinite' }}
          >
            <Rocket 
              className="h-24 w-24 text-blue-400 transform rotate-45" 
              style={{ filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))' }}
            />
          </div>

          {/* 404 text with glow effect */}
          <div 
            className="text-9xl md:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400"
            style={{ 
              animation: 'glow 2s ease-in-out infinite alternate',
              fontFamily: 'monospace'
            }}
          >
            404
          </div>

          {/* Error message */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Lost in Space
            </h1>
            <p className="text-xl text-blue-200 mb-2">
              Houston, we have a problem!
            </p>
            <p className="text-lg text-slate-300 max-w-md mx-auto leading-relaxed">
              The page you're looking for has drifted into the cosmic void. 
              Let's navigate you back to familiar territory.
            </p>
          </div>

          {/* Floating elements */}
          <div className="flex justify-center space-x-8 mb-8">
            {['🌟', '🚀', '🛸', '🌙'].map((emoji, index) => (
              <div
                key={index}
                className="text-3xl"
                style={{
                  animation: `float 3s ease-in-out infinite`,
                  animationDelay: `${index * 0.5}s`
                }}
              >
                {emoji}
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link href="/">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Home className="mr-2 h-5 w-5" />
                Return to Earth
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.history.back()}
              className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go Back
            </Button>
          </div>

          {/* Help text */}
          <div className="pt-8 text-sm text-slate-400">
            <p>Need assistance? Check out our:</p>
            <div className="flex flex-wrap justify-center gap-4 mt-2 text-blue-300">
              <Link href="/gallery" className="hover:text-blue-200 transition-colors">
                Gallery
              </Link>
              <span>•</span>
              <Link href="/iss-tracker" className="hover:text-blue-200 transition-colors">
                ISS Tracker
              </Link>
              <span>•</span>
              <Link href="/space-news" className="hover:text-blue-200 transition-colors">
                Space News
              </Link>
              <span>•</span>
              <Link href="/satellite-tracker" className="hover:text-blue-200 transition-colors">
                Satellite Tracker
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent" />
      <Footer />
    </div>
  );
}