import { useQuery } from "@tanstack/react-query";
import {
  Zap,
  AlertTriangle,
  Calendar,
  Ruler,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LottieLoader } from "@/components/lottie-loader";
import { useGSAP } from "@/hooks/use-gsap";
import { Asteroid } from "@/types/space";

interface AsteroidTrackerProps {
  id?: string;
}

export function AsteroidTracker({ id = "asteroids" }: AsteroidTrackerProps) {
  const sectionRef = useGSAP();

  const {
    data: asteroids,
    isLoading,
    error,
  } = useQuery<Asteroid[]>({
    queryKey: ["/api/asteroids/upcoming"],
    queryFn: async () => {
      const response = await fetch("/api/asteroids/upcoming");
      if (!response.ok) throw new Error("Failed to fetch asteroids");
      return response.json();
    },
  });

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatSize = (diameter: any) => {
    if (!diameter?.kilometers) return "Unknown";
    const min = diameter.kilometers.estimated_diameter_min;
    const max = diameter.kilometers.estimated_diameter_max;

    if (min < 1 && max < 1) {
      return `${Math.round(min * 1000)}m - ${Math.round(max * 1000)}m`;
    }
    return `${min.toFixed(1)}km - ${max.toFixed(1)}km`;
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return "Unknown";
    return `${distance.toFixed(3)} AU`;
  };

  const formatVelocity = (velocity?: number) => {
    if (!velocity) return "Unknown";
    return `${velocity.toFixed(1)} km/s`;
  };

  const dashboardStats = {
    total: asteroids?.length || 0,
    hazardous: asteroids?.filter((a) => a.isPotentiallyHazardous).length || 0,
    thisWeek:
      asteroids?.filter((a) => {
        const approachDate = new Date(a.closeApproachDate);
        const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        return approachDate <= weekFromNow;
      }).length || 0,
    closest: asteroids?.[0]?.missDistance || 0,
  };

  if (error) {
    return (
      <section
        id={id}
        className="py-20 bg-gradient-to-b from-[hsl(244,62%,26%)] to-[hsl(222,47%,8%)]"
      >
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="text-5xl font-orbitron font-bold mb-6 text-gradient">
              Near-Earth Asteroids
            </h2>
            <p className="text-red-400">
              Failed to load asteroid data. Please try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id={id}
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-[hsl(244,62%,26%)] to-[hsl(222,47%,8%)] section-reveal"
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-orbitron font-bold mb-6 text-gradient">
            Near-Earth Asteroids
          </h2>
          <p className="text-xl opacity-80 max-w-2xl mx-auto">
            Monitor potentially hazardous asteroids and upcoming close
            approaches to Earth with real-time NASA data.
          </p>
        </div>

        {/* Asteroid Dashboard */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-effect rounded-xl">
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 text-[hsl(158,76%,36%)] mx-auto mb-3" />
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                ) : (
                  <div className="text-2xl font-bold">
                    {dashboardStats.total}
                  </div>
                )}
                <div className="text-sm opacity-70">Tracked Objects</div>
              </CardContent>
            </Card>

            <Card className="glass-effect rounded-xl">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-12 w-12 text-[hsl(43,96%,56%)] mx-auto mb-3" />
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                ) : (
                  <div className="text-2xl font-bold">
                    {dashboardStats.hazardous}
                  </div>
                )}
                <div className="text-sm opacity-70">Potentially Hazardous</div>
              </CardContent>
            </Card>

            <Card className="glass-effect rounded-xl">
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-[hsl(330,81%,60%)] mx-auto mb-3" />
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                ) : (
                  <div className="text-2xl font-bold">
                    {dashboardStats.thisWeek}
                  </div>
                )}
                <div className="text-sm opacity-70">Close Approaches</div>
              </CardContent>
            </Card>

            <Card className="glass-effect rounded-xl">
              <CardContent className="p-6 text-center">
                <Ruler className="h-12 w-12 text-[hsl(158,76%,36%)] mx-auto mb-3" />
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                ) : (
                  <div className="text-2xl font-bold">
                    {formatDistance(dashboardStats.closest)}
                  </div>
                )}
                <div className="text-sm opacity-70">Closest Distance</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upcoming Close Approaches */}
        <Card className="glass-effect rounded-2xl">
          <CardContent className="p-8">
            <h3 className="text-2xl font-orbitron font-bold mb-8 flex items-center">
              <AlertTriangle className="text-[hsl(43,96%,56%)] mr-3 h-8 w-8" />
              Upcoming Close Approaches
            </h3>

            <div className="space-y-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <LottieLoader size={100} className="mb-6" />
                  <p className="text-lg opacity-70 mb-8">
                    Tracking near-Earth objects...
                  </p>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-[hsl(222,47%,8%)] bg-opacity-50 rounded-xl w-full mb-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Skeleton className="h-6 w-48 mr-3" />
                          <Skeleton className="h-6 w-32" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i}>
                              <Skeleton className="h-4 w-16 mb-1" />
                              <Skeleton className="h-5 w-20" />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 md:ml-6">
                        <Skeleton className="h-10 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : asteroids && asteroids.length > 0 ? (
                asteroids.slice(0, 5).map((asteroid) => (
                  <div
                    key={asteroid.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-[hsl(222,47%,8%)] bg-opacity-50 rounded-xl"
                  >
                    <div className="flex-1">
                      <div className="flex items-center mb-2 flex-wrap gap-2">
                        <h4 className="text-lg font-semibold">
                          {asteroid.name}
                        </h4>
                        <Badge
                          className={
                            asteroid.isPotentiallyHazardous
                              ? "bg-[hsl(43,96%,56%)]"
                              : "bg-[hsl(158,76%,36%)]"
                          }
                        >
                          {asteroid.isPotentiallyHazardous
                            ? "Potentially Hazardous"
                            : "Safe Passage"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="opacity-70">Date</div>
                          <div className="font-semibold">
                            {formatDate(asteroid.closeApproachDate)}
                          </div>
                        </div>
                        <div>
                          <div className="opacity-70">Distance</div>
                          <div className="font-semibold text-[hsl(158,76%,36%)]">
                            {formatDistance(asteroid.missDistance)}
                          </div>
                        </div>
                        <div>
                          <div className="opacity-70">Size</div>
                          <div className="font-semibold">
                            {formatSize(asteroid.estimatedDiameter)}
                          </div>
                        </div>
                        <div>
                          <div className="opacity-70">Velocity</div>
                          <div className="font-semibold text-[hsl(330,81%,60%)]">
                            {formatVelocity(asteroid.relativeVelocity)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-6">
                      <Button className="bg-gradient-to-r from-[hsl(43,96%,56%)] to-[hsl(330,81%,60%)] hover:scale-105 transform transition-all duration-300">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No upcoming asteroid approaches found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
