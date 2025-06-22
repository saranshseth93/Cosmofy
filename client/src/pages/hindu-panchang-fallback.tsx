import { Navigation } from '@/components/navigation';
import { CosmicCursor } from '@/components/cosmic-cursor';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Calendar } from 'lucide-react';

export default function HinduPanchangFallback() {
  return (
    <>
      <Navigation />
      <CosmicCursor />
      <div className="min-h-screen relative pt-24">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-800 to-black" />
        
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-8">
            <Card className="bg-black/40 border-orange-500/30 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-orange-400 flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Hindu Panchang - Under Maintenance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-orange-300">
                    The Hindu Panchang feature is currently being updated to provide 
                    authentic Vedic calendar calculations.
                  </p>
                  <div className="p-4 bg-orange-900/20 rounded-lg">
                    <p className="text-orange-200 text-sm">
                      <strong>Coming Soon:</strong> Complete Panchang details including 
                      Tithi, Nakshatra, Yoga, Karana, and auspicious timings based on 
                      your location.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}