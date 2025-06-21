import { useEffect, useRef } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import { IssPosition } from '@/types/space';

interface AmChartsWorldMapProps {
  position: IssPosition | undefined;
  userLocation?: { latitude: number; longitude: number };
  orbitData?: {
    orbitPath: Array<{
      latitude: number;
      longitude: number;
      timestamp: number;
    }>;
    period: number;
    inclination: number;
    altitude: number;
  };
  className?: string;
}

export function AmChartsWorldMap({ position, userLocation, orbitData, className = "" }: AmChartsWorldMapProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);
  const mapSeriesRef = useRef<am5map.MapPolygonSeries | null>(null);
  const pointSeriesRef = useRef<am5map.MapPointSeries | null>(null);
  const lineSeriesRef = useRef<am5map.MapLineSeries | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Create root element
    const root = am5.Root.new(chartRef.current);
    rootRef.current = root;

    // Set themes
    root.setThemes([am5themes_Dark.new(root)]);

    // Create the map chart
    const chart = root.container.children.push(am5map.MapChart.new(root, {
      panX: "rotateX",
      panY: "rotateY",
      projection: am5map.geoMercator(),
      homeZoomLevel: 1,
      homeGeoPoint: { longitude: 0, latitude: 0 }
    }));

    // Create main polygon series for countries
    const polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
      geoJSON: am5geodata_worldLow,
      exclude: ["AQ"] // Exclude Antarctica for better view
    }));
    mapSeriesRef.current = polygonSeries;

    // Configure country appearance
    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      fill: am5.color("#1e293b"),
      stroke: am5.color("#374151"),
      strokeWidth: 0.5
    });

    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color("#334155")
    });

    // Create point series for markers
    const pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));
    pointSeriesRef.current = pointSeries;

    // Create line series for orbital path
    const lineSeries = chart.series.push(am5map.MapLineSeries.new(root, {}));
    lineSeriesRef.current = lineSeries;

    // Configure point template
    pointSeries.bullets.push(function() {
      const circle = am5.Circle.new(root, {
        radius: 8,
        tooltipText: "{title}",
        fill: am5.color("#22d3ee"),
        stroke: am5.color("#ffffff"),
        strokeWidth: 2
      });

      circle.animate({
        key: "radius",
        from: 8,
        to: 12,
        duration: 1000,
        loops: Infinity,
        easing: am5.ease.yoyo(am5.ease.cubic)
      });

      return am5.Bullet.new(root, {
        sprite: circle
      });
    });

    // Configure line template for orbital path
    lineSeries.mapLines.template.setAll({
      stroke: am5.color("#22d3ee"),
      strokeWidth: 2,
      strokeDasharray: [8, 4],
      strokeOpacity: 0.6
    });

    return () => {
      if (rootRef.current) {
        rootRef.current.dispose();
      }
    };
  }, []);

  // Update ISS position and orbital path
  useEffect(() => {
    if (!pointSeriesRef.current || !lineSeriesRef.current) return;

    const pointSeries = pointSeriesRef.current;
    const lineSeries = lineSeriesRef.current;

    // Clear existing data
    pointSeries.data.clear();
    lineSeries.data.clear();

    const points = [];

    // Add ISS position
    if (position) {
      points.push({
        geometry: {
          type: "Point",
          coordinates: [position.longitude, position.latitude]
        },
        title: `ISS - Alt: ${position.altitude || '408'} km`,
        type: "iss"
      });

      // Orbital path temporarily hidden to avoid confusion with positioning
      // Will be re-enabled when TLE data integration is complete
    }

    // Add user location
    if (userLocation) {
      points.push({
        geometry: {
          type: "Point",
          coordinates: [userLocation.longitude, userLocation.latitude]
        },
        title: "Your Location",
        type: "user"
      });
    }

    pointSeries.data.pushAll(points);

    // Update bullet appearance based on type
    pointSeries.bullets.clear();
    pointSeries.bullets.push(function(root, series, dataItem) {
      const dataContext = dataItem.dataContext as any;
      const isISS = dataContext.type === "iss";
      
      const circle = am5.Circle.new(root, {
        radius: isISS ? 8 : 6,
        tooltipText: "{title}",
        fill: am5.color(isISS ? "#22d3ee" : "#ef4444"),
        stroke: am5.color("#ffffff"),
        strokeWidth: 2
      });

      if (isISS) {
        circle.animate({
          key: "radius",
          from: 8,
          to: 12,
          duration: 1500,
          loops: Infinity,
          easing: am5.ease.yoyo(am5.ease.cubic)
        });
      }

      return am5.Bullet.new(root, {
        sprite: circle
      });
    });

  }, [position, userLocation, orbitData]);

  return (
    <div className={`w-full h-full ${className}`}>
      <div 
        ref={chartRef} 
        className="w-full h-full"
        style={{ minHeight: '300px' }}
      />
      
      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"></div>
          <span className="text-cyan-400 font-medium">ISS Position</span>
        </div>
        {userLocation && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-red-400 rounded-full shadow-lg shadow-red-400/50"></div>
            <span className="text-red-400 font-medium">Your Location</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-1 border border-cyan-400 border-dashed"></div>
          <span className="text-gray-300 text-xs">Orbital Path</span>
        </div>
      </div>

      {/* Position info overlay */}
      {position && (
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Live Position</div>
          <div className="text-sm font-mono text-white">
            {position.latitude.toFixed(3)}°, {position.longitude.toFixed(3)}°
          </div>
          <div className="text-xs text-cyan-400 mt-1">
            Alt: {position.altitude || '408'} km
          </div>
        </div>
      )}
    </div>
  );
}