import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorFallbackProps {
  error?: Error | { message: string };
  resetErrorBoundary?: () => void;
  title?: string;
  description?: string;
  showRetry?: boolean;
  showHome?: boolean;
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
  title = "Data Currently Unavailable",
  description = "Unable to fetch authentic space data from external APIs. Please check your connection or try again later.",
  showRetry = true,
  showHome = false
}: ErrorFallbackProps) {
  const errorMessage = error?.message || description;
  
  return (
    <Card className="w-full max-w-md mx-auto border-red-200 dark:border-red-800">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <CardTitle className="text-red-800 dark:text-red-200">{title}</CardTitle>
        <CardDescription className="text-red-600 dark:text-red-400">
          {errorMessage}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {showRetry && resetErrorBoundary && (
          <Button 
            onClick={resetErrorBoundary}
            variant="outline"
            className="w-full border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        {showHome && (
          <Button 
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Specific error components for different API failures
export function SpaceWeatherError() {
  return (
    <ErrorFallback
      title="Space Weather Data Unavailable"
      description="Unable to fetch authentic space weather data from NOAA Space Weather Prediction Center. Real-time solar wind and geomagnetic data requires active API connections."
    />
  );
}

export function ConstellationError() {
  return (
    <ErrorFallback
      title="Constellation Data Unavailable"
      description="Unable to fetch authentic constellation data from astronomical sources. Star chart information requires connection to go-astronomy.com and NOIRLab services."
    />
  );
}

export function SatelliteError() {
  return (
    <ErrorFallback
      title="Satellite Tracking Unavailable"
      description="Unable to fetch authentic satellite tracking data. Real-time orbital positions require connection to satellite tracking services."
    />
  );
}

export function AuroraError() {
  return (
    <ErrorFallback
      title="Aurora Forecast Unavailable"
      description="Unable to fetch authentic aurora forecast data from NOAA Space Weather Prediction Center. Aurora visibility predictions require active API connections."
    />
  );
}

export function NASADataError() {
  return (
    <ErrorFallback
      title="NASA Data Unavailable"
      description="Unable to fetch authentic data from NASA APIs. Space imagery and mission data requires valid API key and active connections."
    />
  );
}