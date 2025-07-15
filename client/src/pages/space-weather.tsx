import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Zap, Sun, Shield, Globe, Activity, Radio, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { CosmicCursor } from '@/components/cosmic-cursor';
import { Footer } from '@/components/footer';

interface SpaceWeatherData {
  solarWind: {
    speed: number;
    density: number;
    temperature: number;
    magneticField: {
      bt: number;
      bz: number;
      phi: number;
    };
    protonFlux: number;
  };
  geomagneticActivity: {
    kpIndex: number;
    kpForecast: number[];
    aIndex: number;
    apIndex: number;
    activity: string;
    forecast: string;
    dstIndex: number;
  };
  solarActivity: {
    solarFluxF107: number;
    sunspotNumber: number;
    solarFlares: {
      class: string;
      region: string;
      time: string;
      intensity: number;
      peakTime: string;
      location: string;
    }[];
    coronalMassEjections: {
      speed: number;
      direction: number;
      arrivalTime: string;
      impactProbability: number;
    }[];
  };
  radiationEnvironment: {
    protonEvent: boolean;
    electronFlux: number;
    highEnergyProtons: number;
    radiationStormLevel: number;
  };
  auroraForecast: {
    visibility: number;
    activity: string;
    viewingTime: string;
    ovationPrime: number;
    hemisphericPower: number;
  };
  alerts: {
    type: string;
    severity: string;
    message: string;
    issued: string;
    expires: string;
  }[];
  lastUpdated: string;
  dataSource: string;
  confidence: number;
}

export default function SpaceWeatherPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number; display: string } | null>(null);

  const { data: spaceWeather, isLoading: weatherLoading, error: weatherError } = useQuery<SpaceWeatherData>({
    queryKey: ['/api/space-weather'],
    refetchInterval: 300000, // 5 minutes
  });

  const { data: locationData, isLoading: locationLoading } = useQuery({
    queryKey: ['/api/location'],
    refetchInterval: 3600000, // 1 hour
  });

  useEffect(() => {
    if (locationData && !locationLoading) {
      setUserLocation({
        lat: locationData.latitude,
        lon: locationData.longitude,
        display: locationData.display
      });
    }
  }, [locationData, locationLoading]);

  // Handle API errors gracefully
  const showErrorState = (!weatherLoading && !spaceWeather) || weatherError;

  if (weatherLoading || locationLoading) {
    return (
      <>
        <Navigation />
        <CosmicCursor />
        <div className="min-h-screen bg-gradient-to-b from-black via-blue-950/20 to-black pt-24">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading space weather data...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (showErrorState) {
    return (
      <>
        <Navigation />
        <CosmicCursor />
        <div className="min-h-screen bg-gradient-to-b from-black via-blue-950/20 to-black pt-24">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center space-y-6">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="h-10 w-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Space Weather Data Unavailable
                </h1>
                <p className="text-muted-foreground mb-6">
                  NOAA Space Weather data requires specialized API credentials. Please configure NOAA access to monitor solar activity, geomagnetic storms, and space radiation.
                </p>
                <div className="text-sm text-muted-foreground">
                  <p>• Real-time solar wind data</p>
                  <p>• Geomagnetic activity monitoring</p>
                  <p>• Aurora visibility forecasts</p>
                  <p>• Space radiation levels</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'extreme': return 'text-red-500';
      case 'severe': return 'text-orange-500';
      case 'strong': return 'text-orange-500';
      case 'moderate': return 'text-yellow-500';
      case 'minor': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getKpColor = (kp: number) => {
    if (kp >= 7) return 'bg-red-500';
    if (kp >= 5) return 'bg-orange-500';
    if (kp >= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getRadiationStormLevel = (level: number) => {
    const levels = ['S0', 'S1', 'S2', 'S3', 'S4', 'S5'];
    return levels[level] || 'S0';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString(navigator.language || 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  return (
    <>
      <Navigation />
      <CosmicCursor />
      <div className="min-h-screen bg-gradient-to-b from-black via-blue-950/20 to-black pt-24">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Location Chip */}
          {userLocation?.display && (
            <div className="flex justify-center">
              <Badge variant="outline" className="px-4 py-2 text-sm bg-blue-500/10 border-blue-500/30 text-blue-400">
                📍 {userLocation.display}
              </Badge>
            </div>
          )}

          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
              Space Weather Dashboard
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real-time monitoring of solar activity, geomagnetic storms, and aurora forecasts
            </p>
            <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
              <div>Data Source: {spaceWeather?.dataSource}</div>
              <div>Confidence: {spaceWeather?.confidence?.toFixed(1)}%</div>
              <div>Updated: {spaceWeather?.lastUpdated ? formatTimestamp(spaceWeather.lastUpdated) : 'Unknown'}</div>
            </div>
          </div>

          {/* Active Alerts */}
          {spaceWeather?.alerts && spaceWeather.alerts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
                Active Space Weather Alerts
              </h2>
              <div className="grid gap-4">
                {spaceWeather.alerts.map((alert, index) => (
                  <Card key={index} className="border-l-4 border-l-orange-500">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{alert.type}</CardTitle>
                        <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-2">{alert.message}</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Issued: {formatTimestamp(alert.issued)}</span>
                        <span>Expires: {formatTimestamp(alert.expires)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Solar Wind Parameters */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Sun className="h-6 w-6 text-yellow-500" />
              Solar Wind Conditions
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Solar Wind Speed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold text-blue-500">
                    {spaceWeather?.solarWind.speed?.toFixed(1)} km/s
                  </div>
                  <Progress value={(spaceWeather?.solarWind.speed || 0) / 8} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Normal: 300-500 km/s | High: &gt;600 km/s
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-green-500" />
                    Particle Density
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold text-green-500">
                    {spaceWeather?.solarWind.density?.toFixed(1)} p/cm³
                  </div>
                  <Progress value={(spaceWeather?.solarWind.density || 0) * 5} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Normal: 1-10 p/cm³ | High: &gt;20 p/cm³
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-red-500" />
                    Temperature
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold text-red-500">
                    {(spaceWeather?.solarWind.temperature || 0 / 1000).toFixed(0)}K K
                  </div>
                  <Progress value={(spaceWeather?.solarWind.temperature || 0) / 3000} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Normal: 50-150K K | High: &gt;250K K
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Magnetic Field Components */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Shield className="h-6 w-6 text-purple-500" />
              Interplanetary Magnetic Field
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Total Field (Bt)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-500">
                    {spaceWeather?.solarWind.magneticField.bt?.toFixed(1)} nT
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Magnitude of magnetic field
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Z-Component (Bz)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${(spaceWeather?.solarWind.magneticField.bz || 0) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {spaceWeather?.solarWind.magneticField.bz?.toFixed(1)} nT
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {(spaceWeather?.solarWind.magneticField.bz || 0) < 0 ? 'Southward - Enhanced geomagnetic activity' : 'Northward - Reduced activity'}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Proton Flux</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">
                    {spaceWeather?.solarWind.protonFlux} p/cm²/s
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    High-energy proton flux
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Geomagnetic Activity */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Globe className="h-6 w-6 text-blue-500" />
              Geomagnetic Activity
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Kp Index</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold text-blue-500">
                    {spaceWeather?.geomagneticActivity.kpIndex?.toFixed(1)}
                  </div>
                  <div className={`h-3 rounded-full ${getKpColor(spaceWeather?.geomagneticActivity.kpIndex || 0)}`}></div>
                  <div className="text-sm font-medium">{spaceWeather?.geomagneticActivity.activity}</div>
                  <div className="text-xs text-muted-foreground">{spaceWeather?.geomagneticActivity.forecast}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Kp Forecast</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {spaceWeather?.geomagneticActivity.kpForecast?.map((kp, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">+{index * 3}h:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{kp.toFixed(1)}</span>
                        <div className={`w-3 h-3 rounded-full ${getKpColor(kp)}`}></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Planetary Indices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">A-index:</span>
                    <span className="font-medium">{spaceWeather?.geomagneticActivity.aIndex}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Ap-index:</span>
                    <span className="font-medium">{spaceWeather?.geomagneticActivity.apIndex}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">DST-index:</span>
                    <span className="font-medium">{spaceWeather?.geomagneticActivity.dstIndex} nT</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Aurora Forecast</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-2xl font-bold text-green-500">
                    {spaceWeather?.auroraForecast.visibility?.toFixed(0)}%
                  </div>
                  <Progress value={spaceWeather?.auroraForecast.visibility || 0} className="h-2" />
                  <div className="text-sm font-medium">{spaceWeather?.auroraForecast.activity} Activity</div>
                  <div className="text-xs text-muted-foreground">{spaceWeather?.auroraForecast.viewingTime}</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Solar Activity */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Sun className="h-6 w-6 text-orange-500" />
              Solar Activity
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Solar Flux F10.7</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">
                    {spaceWeather?.solarActivity.solarFluxF107?.toFixed(1)} sfu
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Radio flux at 10.7 cm (solar activity indicator)
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Sunspot Number</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-500">
                    {spaceWeather?.solarActivity.sunspotNumber}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Current sunspot count (solar cycle indicator)
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Radiation Storm Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    {getRadiationStormLevel(spaceWeather?.radiationEnvironment.radiationStormLevel || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Current radiation storm scale (S0-S5)
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Solar Flares */}
          {spaceWeather?.solarActivity.solarFlares && spaceWeather.solarActivity.solarFlares.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-red-500" />
                  Recent Solar Flares (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {spaceWeather.solarActivity.solarFlares.slice(0, 5).map((flare, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Badge variant="outline" className="text-red-500 border-red-500">
                            {flare.class}
                          </Badge>
                          <span className="ml-2 text-sm font-medium">{flare.region}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{flare.location}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Peak Time:</span>
                          <div>{formatTimestamp(flare.peakTime)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Detection:</span>
                          <div>{formatTimestamp(flare.time)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Coronal Mass Ejections */}
          {spaceWeather?.solarActivity.coronalMassEjections && spaceWeather.solarActivity.coronalMassEjections.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-5 w-5 text-purple-500" />
                  Coronal Mass Ejections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {spaceWeather.solarActivity.coronalMassEjections.map((cme, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Speed:</span>
                          <div className="font-medium">{cme.speed.toFixed(0)} km/s</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Direction:</span>
                          <div className="font-medium">{cme.direction.toFixed(0)}°</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Earth Impact:</span>
                          <div className="font-medium">{cme.impactProbability}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Arrival:</span>
                          <div className="font-medium">{formatTimestamp(cme.arrivalTime)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Radiation Environment */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-500" />
              Radiation Environment
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Proton Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${spaceWeather?.radiationEnvironment.protonEvent ? 'text-red-500' : 'text-green-500'}`}>
                    {spaceWeather?.radiationEnvironment.protonEvent ? 'ACTIVE' : 'QUIET'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Solar energetic particle event status
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Electron Flux</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500">
                    {spaceWeather?.radiationEnvironment.electronFlux?.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    High-energy electrons (&gt;2 MeV)
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>High-Energy Protons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-500">
                    {spaceWeather?.radiationEnvironment.highEnergyProtons}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Proton flux (&gt;10 MeV)
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Aurora Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-500" />
                Aurora Forecast Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Current Conditions</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Visibility:</span>
                      <span className="font-medium">{spaceWeather?.auroraForecast.visibility?.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Activity Level:</span>
                      <span className="font-medium">{spaceWeather?.auroraForecast.activity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>OVATION Prime:</span>
                      <span className="font-medium">{spaceWeather?.auroraForecast.ovationPrime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hemispheric Power:</span>
                      <span className="font-medium">{spaceWeather?.auroraForecast.hemisphericPower} GW</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Viewing Information</h4>
                  <div className="space-y-1">
                    <div><strong>Best Viewing Time:</strong> {spaceWeather?.auroraForecast.viewingTime}</div>
                    <div><strong>Current Kp:</strong> {spaceWeather?.geomagneticActivity.kpIndex?.toFixed(1)} ({spaceWeather?.geomagneticActivity.activity})</div>
                    <div><strong>Magnetic Field Bz:</strong> {spaceWeather?.solarWind.magneticField.bz?.toFixed(1)} nT</div>
                    <div><strong>Solar Wind Speed:</strong> {spaceWeather?.solarWind.speed?.toFixed(0)} km/s</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}