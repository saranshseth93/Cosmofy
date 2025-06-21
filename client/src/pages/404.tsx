import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Rocket, Star, Satellite } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-black relative overflow-hidden">
      {/* Animated Background Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Floating Rocket */}
      <div className="absolute top-20 right-10 animate-bounce">
        <Rocket className="h-16 w-16 text-blue-400 opacity-30" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          {/* 404 Text with Glow Effect */}
          <div className="mb-8">
            <h1 
              className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))',
              }}
            >
              404
            </h1>
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Star className="h-6 w-6 text-yellow-400 animate-spin" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Lost in Space
              </h2>
              <Star className="h-6 w-6 text-yellow-400 animate-spin" />
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-12">
            <p className="text-lg md:text-xl text-neutral-300 mb-4 leading-relaxed">
              The page you're looking for has drifted into the cosmic void.
            </p>
            <p className="text-neutral-400">
              Don't worry, even astronauts get lost sometimes. Let's navigate you back to familiar territory.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Home className="mr-2 h-5 w-5" />
                Return to Home Base
              </Button>
            </Link>
            <Button 
              variant="outline"
              size="lg" 
              onClick={() => window.history.back()}
              className="border-neutral-600 text-neutral-300 hover:bg-neutral-800 px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go Back
            </Button>
          </div>

          {/* Quick Navigation */}
          <div className="bg-neutral-900/50 backdrop-blur-lg border border-neutral-700 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center">
              <Satellite className="mr-2 h-5 w-5 text-blue-400" />
              Quick Navigation
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Link href="/gallery">
                <Button variant="ghost" className="w-full text-neutral-400 hover:text-white hover:bg-neutral-800">
                  Gallery
                </Button>
              </Link>
              <Link href="/iss-tracker">
                <Button variant="ghost" className="w-full text-neutral-400 hover:text-white hover:bg-neutral-800">
                  ISS Tracker
                </Button>
              </Link>
              <Link href="/solar-system">
                <Button variant="ghost" className="w-full text-neutral-400 hover:text-white hover:bg-neutral-800">
                  Solar System
                </Button>
              </Link>
              <Link href="/satellites">
                <Button variant="ghost" className="w-full text-neutral-400 hover:text-white hover:bg-neutral-800">
                  Satellites
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute bottom-10 left-10 animate-pulse">
        <div className="w-4 h-4 bg-purple-400 rounded-full opacity-50" />
      </div>
      <div className="absolute top-1/3 left-20 animate-pulse">
        <div className="w-2 h-2 bg-blue-400 rounded-full opacity-60" />
      </div>
      <div className="absolute bottom-1/4 right-20 animate-pulse">
        <div className="w-3 h-3 bg-pink-400 rounded-full opacity-40" />
      </div>
    </div>
  );
}