import { useQuery } from "@tanstack/react-query";
import { Zap, Clock, Camera, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CosmicPulse } from "@/components/lottie-loader";
import { useGSAP } from "@/hooks/use-gsap";
import { useGeolocation } from "@/hooks/use-geolocation";
import { AuroraForecast } from "@/types/space";

interface AuroraTrackerProps {
  id?: string;
}

export function AuroraTracker({ id = "aurora" }: AuroraTrackerProps) {
  const sectionRef = useGSAP();
  const {
    coordinates,
    error: locationError,
    requestLocation,
  } = useGeolocation();

  const {
    data: forecast,
    isLoading,
    error,
  } = useQuery<AuroraForecast>({
    queryKey: [
      "/api/aurora/forecast",
      coordinates?.latitude,
      coordinates?.longitude,
    ],
    queryFn: async () => {
      if (!coordinates) throw new Error("Location required");
      const response = await fetch(
        `/api/aurora/forecast?lat=${coordinates.latitude}&lon=${coordinates.longitude}`
      );
      if (!response.ok) throw new Error("Failed to fetch aurora forecast");
      return response.json();
    },
    enabled: !!coordinates,
  });

  const getActivityLevel = (kpIndex: number) => {
    if (kpIndex >= 7) return { level: "Storm", color: "hsl(330, 81%, 60%)" };
    if (kpIndex >= 5) return { level: "Active", color: "hsl(43, 96%, 56%)" };
    if (kpIndex >= 3) return { level: "Moderate", color: "hsl(158, 76%, 36%)" };
    return { level: "Quiet", color: "hsl(200, 50%, 50%)" };
  };

  const getVisibilityPercentage = (kpIndex: number, latitude?: number) => {
    if (!latitude) return 0;
    const absLat = Math.abs(latitude);

    if (kpIndex >= 7 && absLat >= 50) return 90;
    if (kpIndex >= 6 && absLat >= 55) return 80;
    if (kpIndex >= 5 && absLat >= 60) return 70;
    if (kpIndex >= 4 && absLat >= 65) return 60;
    if (kpIndex >= 3 && absLat >= 70) return 50;

    return Math.max(0, kpIndex * 10 - (70 - absLat));
  };

  const mockViewingTimes = [
    {
      time: "Tonight, 11:30 PM - 2:00 AM",
      activity: "High Activity Expected",
      kp: "Kp 6",
      color: "hsl(330, 81%, 60%)",
    },
    {
      time: "Tomorrow, 10:45 PM - 1:30 AM",
      activity: "Moderate Activity",
      kp: "Kp 4",
      color: "hsl(43, 96%, 56%)",
    },
    {
      time: "Jan 20, 12:00 AM - 3:00 AM",
      activity: "Storm Activity",
      kp: "Kp 7",
      color: "hsl(330, 81%, 60%)",
    },
  ];

  return (
    <section
      id={id}
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-[hsl(261,57%,29%)] to-[hsl(244,62%,26%)] section-reveal"
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-orbitron font-bold mb-6 text-gradient">
            Aurora Forecast
          </h2>
          <p className="text-xl opacity-80 max-w-2xl mx-auto">
            Track geomagnetic activity and discover the best times and locations
            to witness the spectacular aurora displays.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Aurora Activity */}
          <Card className="glass-effect rounded-2xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-orbitron font-bold mb-6 flex items-center">
                <Zap className="text-[hsl(158,76%,36%)] mr-3 h-8 w-8" />
                Current Activity
              </h3>

              {!coordinates && !locationError && (
                <div className="text-center mb-6">
                  <Button
                    onClick={requestLocation}
                    className="bg-[hsl(158,76%,36%)]"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Enable Location
                  </Button>
                  <p className="text-sm opacity-70 mt-2">
                    Location access required for aurora forecasts
                  </p>
                </div>
              )}

              {locationError && (
                <div className="text-center text-red-400 mb-6">
                  <p>{locationError}</p>
                  <Button
                    onClick={requestLocation}
                    variant="outline"
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {/* Aurora Activity Display */}
              <div className="relative rounded-xl overflow-hidden mb-6 h-64 bg-gradient-to-br from-green-900 via-blue-900 to-purple-900">
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(222,47%,8%)] via-transparent to-transparent" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <CosmicPulse size={80} />
                </div>
                <div className="absolute bottom-4 left-4">
                  {isLoading ? (
                    <div className="glass-effect px-3 py-2 rounded-lg">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  ) : forecast ? (
                    <div className="glass-effect px-3 py-2 rounded-lg">
                      <div className="text-sm">
                        Kp Index:{" "}
                        <span className="text-[hsl(158,76%,36%)] font-bold">
                          {forecast.kpIndex}
                        </span>
                      </div>
                      <div className="text-xs opacity-70">
                        {getActivityLevel(forecast.kpIndex).level} Activity
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="text-center">
                      <Skeleton className="h-6 w-12 mx-auto mb-1" />
                      <Skeleton className="h-3 w-16 mx-auto" />
                    </div>
                  ))}
                </div>
              ) : forecast && coordinates ? (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-[hsl(158,76%,36%)]">
                      {getVisibilityPercentage(
                        forecast.kpIndex,
                        coordinates.latitude
                      )}
                      %
                    </div>
                    <div className="text-xs opacity-70">Visibility</div>
                  </div>
                  <div className="text-center">
                    <div
                      className="text-xl font-bold"
                      style={{
                        color: getActivityLevel(forecast.kpIndex).color,
                      }}
                    >
                      {getActivityLevel(forecast.kpIndex).level}
                    </div>
                    <div className="text-xs opacity-70">Intensity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-[hsl(330,81%,60%)]">
                      3-5h
                    </div>
                    <div className="text-xs opacity-70">Duration</div>
                  </div>
                </div>
              ) : null}

              {coordinates && (
                <div className="text-center">
                  <Button className="bg-gradient-to-r from-[hsl(158,76%,36%)] to-[hsl(330,81%,60%)] hover:scale-105 transform transition-all duration-300">
                    <MapPin className="mr-2 h-4 w-4" />
                    Get Location Forecast
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Best Viewing Times */}
          <Card className="glass-effect rounded-2xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-orbitron font-bold mb-6 flex items-center">
                <Clock className="text-[hsl(330,81%,60%)] mr-3 h-8 w-8" />
                Best Viewing Times
              </h3>

              <div className="space-y-4 mb-6">
                {mockViewingTimes.map((time, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-[hsl(222,47%,8%)] bg-opacity-50 rounded-xl"
                  >
                    <div>
                      <div className="font-semibold">{time.time}</div>
                      <div className="text-sm" style={{ color: time.color }}>
                        {time.activity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold" style={{ color: time.color }}>
                        {time.kp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Aurora Photography Tips */}
              <div className="bg-[hsl(222,47%,8%)] bg-opacity-30 rounded-xl p-6">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Camera className="text-[hsl(158,76%,36%)] mr-2 h-5 w-5" />
                  Photography Tips
                </h4>
                <ul className="text-sm space-y-2 opacity-80">
                  <li>• Use manual camera settings (ISO 1600-3200)</li>
                  <li>• 15-30 second exposure times work best</li>
                  <li>• Find dark locations away from city lights</li>
                  <li>• Check weather for clear skies</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
