import { useState, useEffect } from "react";
import { AlertTriangle, Calendar, Zap, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/navigation";
import { AnimatedAsteroids } from "@/components/animated-asteroids";
import { Footer } from "@/components/footer";

const nearEarthAsteroids = [
  {
    id: "1",
    name: "2024 PT5",
    estimatedDiameter: { min: 0.008, max: 0.018 },
    closeApproachDate: new Date("2025-01-09"),
    velocity: 28.1,
    missDistance: 0.00628,
    isPotentiallyHazardous: false,
    magnitudeH: 27.1,
  },
  {
    id: "2",
    name: "99942 Apophis",
    estimatedDiameter: { min: 0.32, max: 0.72 },
    closeApproachDate: new Date("2029-04-13"),
    velocity: 7.42,
    missDistance: 0.000255,
    isPotentiallyHazardous: true,
    magnitudeH: 19.7,
  },
  {
    id: "3",
    name: "2023 DW",
    estimatedDiameter: { min: 0.045, max: 0.101 },
    closeApproachDate: new Date("2025-02-14"),
    velocity: 25.18,
    missDistance: 0.0135,
    isPotentiallyHazardous: false,
    magnitudeH: 22.4,
  },
  {
    id: "4",
    name: "2022 AP7",
    estimatedDiameter: { min: 1.1, max: 2.3 },
    closeApproachDate: new Date("2026-05-04"),
    velocity: 8.15,
    missDistance: 0.0447,
    isPotentiallyHazardous: true,
    magnitudeH: 17.8,
  },
  {
    id: "5",
    name: "2024 UQ",
    estimatedDiameter: { min: 0.012, max: 0.027 },
    closeApproachDate: new Date("2025-03-22"),
    velocity: 31.7,
    missDistance: 0.0089,
    isPotentiallyHazardous: false,
    magnitudeH: 25.9,
  },
  {
    id: "6",
    name: "Bennu",
    estimatedDiameter: { min: 0.46, max: 0.51 },
    closeApproachDate: new Date("2135-09-25"),
    velocity: 11.2,
    missDistance: 0.0024,
    isPotentiallyHazardous: true,
    magnitudeH: 20.9,
  },
];

export default function Asteroids() {
  const [sortBy, setSortBy] = useState<"date" | "size" | "distance">("date");
  const [showOnlyHazardous, setShowOnlyHazardous] = useState(false);

  useEffect(() => {
    document.title =
      "Near-Earth Asteroids - Space Exploration Platform | Asteroid Tracking & Monitoring";
  }, []);

  const filteredAsteroids = nearEarthAsteroids
    .filter((asteroid) => !showOnlyHazardous || asteroid.isPotentiallyHazardous)
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return a.closeApproachDate.getTime() - b.closeApproachDate.getTime();
        case "size":
          return b.estimatedDiameter.max - a.estimatedDiameter.max;
        case "distance":
          return a.missDistance - b.missDistance;
        default:
          return 0;
      }
    });

  const getRiskLevel = (asteroid: (typeof nearEarthAsteroids)[0]) => {
    if (
      asteroid.isPotentiallyHazardous &&
      asteroid.estimatedDiameter.max > 1.0
    ) {
      return {
        level: "High",
        color: "bg-red-500/10 border-red-500/20 text-red-400",
      };
    }
    if (asteroid.isPotentiallyHazardous) {
      return {
        level: "Medium",
        color: "bg-orange-500/10 border-orange-500/20 text-orange-400",
      };
    }
    return {
      level: "Low",
      color: "bg-green-500/10 border-green-500/20 text-green-400",
    };
  };

  const formatDistance = (au: number) => {
    const km = au * 149597870.7;
    if (km > 1000000) {
      return `${(km / 1000000).toFixed(2)}M km`;
    }
    return `${Math.round(km).toLocaleString()} km`;
  };

  const formatDiameter = (min: number, max: number) => {
    if (max < 1) {
      return `${Math.round(min * 1000)}-${Math.round(max * 1000)} m`;
    }
    return `${min.toFixed(1)}-${max.toFixed(1)} km`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-black text-white relative overflow-hidden">
      {/* Animated Asteroids Background */}
      <AnimatedAsteroids />

      {/* Global Navigation */}
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 mt-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Near-Earth Asteroids
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Track potentially hazardous asteroids and their close approaches to
            Earth
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex gap-2">
            <Button
              variant={sortBy === "date" ? "default" : "outline"}
              onClick={() => setSortBy("date")}
              size="sm"
            >
              Sort by Date
            </Button>
            <Button
              variant={sortBy === "size" ? "default" : "outline"}
              onClick={() => setSortBy("size")}
              size="sm"
            >
              Sort by Size
            </Button>
            <Button
              variant={sortBy === "distance" ? "default" : "outline"}
              onClick={() => setSortBy("distance")}
              size="sm"
            >
              Sort by Distance
            </Button>
          </div>

          <Button
            variant={showOnlyHazardous ? "default" : "outline"}
            onClick={() => setShowOnlyHazardous(!showOnlyHazardous)}
            size="sm"
            className="flex items-center"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            {showOnlyHazardous ? "Show All" : "Hazardous Only"}
          </Button>
        </div>

        {/* Asteroids Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAsteroids.map((asteroid) => {
            const risk = getRiskLevel(asteroid);
            return (
              <Card
                key={asteroid.id}
                className="bg-neutral-800/50 border-neutral-700 p-6 hover:border-neutral-600 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-lg text-white">
                    {asteroid.name}
                  </h3>
                  <Badge className={risk.color}>{risk.level} Risk</Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Close Approach</span>
                    <span className="text-white font-medium">
                      {asteroid.closeApproachDate.toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Diameter</span>
                    <span className="text-white font-medium">
                      {formatDiameter(
                        asteroid.estimatedDiameter.min,
                        asteroid.estimatedDiameter.max
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Miss Distance</span>
                    <span className="text-white font-medium">
                      {formatDistance(asteroid.missDistance)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Velocity</span>
                    <span className="text-white font-medium">
                      {asteroid.velocity.toFixed(1)} km/s
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-400">Magnitude</span>
                    <span className="text-white font-medium">
                      H = {asteroid.magnitudeH}
                    </span>
                  </div>
                </div>

                {asteroid.isPotentiallyHazardous && (
                  <div className="mt-4 pt-4 border-t border-neutral-700">
                    <div className="flex items-center text-orange-400 text-sm">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Potentially Hazardous Asteroid
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-neutral-700">
                  <div className="text-xs text-neutral-500 mb-2">
                    Days Until Approach
                  </div>
                  <div className="text-lg font-bold text-blue-400">
                    {Math.ceil(
                      (asteroid.closeApproachDate.getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24)
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredAsteroids.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-400 text-lg">
              No asteroids found for the selected filter.
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 bg-neutral-800/30 rounded-lg p-6 border border-neutral-700">
          <h2 className="text-2xl font-bold mb-4">
            About Near-Earth Asteroids
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-blue-400">
                Potentially Hazardous Asteroids
              </h3>
              <p className="text-neutral-300 text-sm leading-relaxed">
                Objects larger than 140 meters that come within 7.5 million
                kilometers of Earth's orbit are classified as potentially
                hazardous.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-green-400">
                Monitoring & Detection
              </h3>
              <p className="text-neutral-300 text-sm leading-relaxed">
                NASA's Planetary Defense Coordination Office continuously tracks
                near-Earth objects to assess potential impact risks.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
