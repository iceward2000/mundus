"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full bg-slate-950 text-slate-500">
      Loading Globe...
    </div>
  ),
});

interface GlobeVizProps {
  markers?: {
    lat: number;
    lng: number;
    label: string;
    description: string;
    color?: string;
  }[];
}

export default function GlobeViz({ markers = [] }: GlobeVizProps) {
  const globeEl = useRef<any>(undefined);
  const [countries, setCountries] = useState({ features: [] });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load country data
    fetch(
      "https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson"
    )
      .then((res) => res.json())
      .then(setCountries);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (globeEl.current) {
      // Auto-rotate
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
      
      // Adjust camera distance
      globeEl.current.pointOfView({ altitude: 2.5 });
    }
  }, []);

  // Process GeoJSON features into paths for animated borders
  const borderPaths = useMemo(() => {
    const paths: any[] = [];
    countries.features.forEach((feature: any) => {
      const { geometry, properties } = feature;
      if (!geometry) return;

      if (geometry.type === 'Polygon') {
        paths.push({
          coords: geometry.coordinates[0], // Outer ring
          properties
        });
      } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach((polygon: any) => {
          paths.push({
            coords: polygon[0], // Outer ring
            properties
          });
        });
      }
    });
    return paths;
  }, [countries]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] relative overflow-hidden">
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        // Hex Polygons
        hexPolygonsData={countries.features}
        hexPolygonResolution={3}
        hexPolygonMargin={0.3}
        hexPolygonColor={useCallback(() => "#1d4ed8", [])} // Primary blue-ish
        hexPolygonLabel={({ properties: d }: any) => `
          <div style="background: #333; color: white; padding: 4px 8px; border-radius: 4px;">
            <b>${d.ADMIN}</b> (${d.ISO_A2})
          </div>
        `}

        // Animated Borders (using pathsData)
        pathsData={borderPaths}
        pathPoints={(d: any) => d.coords}
        pathPointLat={(p: any) => p[1]}
        pathPointLng={(p: any) => p[0]}
        pathColor={() => "#60a5fa"} // Light blue color for the path
        pathDashLength={0.5} // Length of the colored dash
        pathDashGap={0.2}    // Length of the gap
        pathDashAnimateTime={2000} // Animation duration in ms - creates the "moving" effect
        pathResolution={2}

        // Clickable Dots (Points)
        pointsData={markers}
        pointLat={(d: any) => d.lat}
        pointLng={(d: any) => d.lng}
        pointColor={(d: any) => d.color || "#facc15"} // Yellow default
        pointRadius={0.5} // Size of the dot
        pointAltitude={0.01} // Slightly above surface
        pointResolution={12} // Smoothness
        
        onPointClick={(d: any) => {
            if (globeEl.current) {
                globeEl.current.pointOfView({ lat: d.lat, lng: d.lng, altitude: 1.5 }, 1000);
            }
        }}
        
        // Labels for markers (Clickable Text)
        labelsData={markers}
        labelLat={(d: any) => d.lat}
        labelLng={(d: any) => d.lng}
        labelText={(d: any) => d.label}
        labelLabel={(d: any) => `
          <div style="background: rgba(0,0,0,0.8); color: white; padding: 8px; border-radius: 4px; font-family: sans-serif; min-width: 150px;">
            <div style="font-weight: bold; margin-bottom: 4px;">${d.label}</div>
            <div style="font-size: 0.9em; line-height: 1.4;">${d.description}</div>
          </div>
        `}
        labelColor={() => "white"}
        labelDotRadius={0.2} // Tiny dot for label anchor, mostly hidden by point
        labelSize={1.5}
        labelResolution={2}
        
        // Tooltip interaction for labels
        onLabelClick={(d: any) => {
            if (globeEl.current) {
                globeEl.current.pointOfView({ lat: d.lat, lng: d.lng, altitude: 1.5 }, 1000);
            }
        }}
      />
      
      {/* Overlay info box if needed */}
      <div className="absolute bottom-4 left-4 p-4 pointer-events-none">
        <h3 className="text-white text-xl font-bold drop-shadow-md">Global Presence</h3>
        <p className="text-slate-300 text-sm drop-shadow-md">Interactive Visualization</p>
      </div>
    </div>
  );
}
