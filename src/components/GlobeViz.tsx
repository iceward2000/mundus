"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { getCheersForCountry } from "@/lib/cheersData";

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
  markers?: any[];
}

// Static colors for stable rendering
const PATH_COLORS = [
  "#d4af37", // Gold
  "#FF0080", // Neon Pink
  "#00FFEA", // Cyan
  "#7000FF"  // Violet
];

export default function GlobeViz({ markers = [] }: GlobeVizProps) {
  const globeEl = useRef<any>(undefined);
  const [countries, setCountries] = useState({ features: [] });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPolygon, setHoveredPolygon] = useState<any>(null);
  const [ready, setReady] = useState(false);

  // Stable color accessor to prevent re-renders breaking the lines
  const getPathColor = useCallback(() => PATH_COLORS, []);

  // 1. Safe Initialization & Cleanup Strategy
  useEffect(() => {
    // Delay mounting to avoid conflict with transitions/Strict Mode double-mount
    const timer = setTimeout(() => {
      setReady(true);
    }, 500);

    return () => {
      clearTimeout(timer);
      setReady(false);
      
      // CRITICAL FIX: Manually dispose of the WebGL context
      if (globeEl.current) {
        try {
          // Attempt to find and dispose the renderer to free WebGL context
          const renderer = globeEl.current.renderer();
          if (renderer) {
            renderer.dispose();
            renderer.forceContextLoss();
            renderer.domElement = null;
          }
          
          // Also try to pause the controls
          const controls = globeEl.current.controls();
          if (controls) {
            controls.dispose();
          }
        } catch (e) {
          // Ignore disposal errors if instance is already gone
        }
      }
    };
  }, []);

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
    const timer = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (ready && globeEl.current) {
      // Auto-rotate configuration
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
      globeEl.current.controls().enableZoom = true;
      
      // Adjust camera distance
      globeEl.current.pointOfView({ altitude: 2.5 });
    }
  }, [ready]);

  // Process GeoJSON features into paths for animated borders
  const borderPaths = useMemo(() => {
    const paths: any[] = [];
    countries.features.forEach((feature: any) => {
      const { geometry, properties } = feature;
      if (!geometry) return;

      // Extract coordinates for paths
      const extractCoords = (coords: any[]) => {
        return {
          coords: coords,
          properties
        };
      };

      if (geometry.type === 'Polygon') {
        paths.push(extractCoords(geometry.coordinates[0]));
      } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach((polygon: any) => {
          paths.push(extractCoords(polygon[0]));
        });
      }
    });
    return paths;
  }, [countries]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] relative overflow-hidden">
      {ready && (
        <Globe
          ref={globeEl}
          width={dimensions.width}
          height={dimensions.height}
          // Strict minimal configuration to ensure context creation succeeds
          rendererConfig={{ 
            antialias: false, 
            alpha: true, 
            failIfMajorPerformanceCaveat: false,
            powerPreference: "default" 
          }}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          
          // Tiled Countries
          polygonsData={countries.features}
          polygonCapColor={(d: any) => 
              d === hoveredPolygon 
                  ? "rgba(212, 175, 55, 0.3)" // Gold tint on hover
                  : "rgba(20, 30, 50, 0.6)"   // Dark transparent blue for countries
          }
          polygonSideColor={() => "rgba(0, 0, 0, 0.2)"}
          polygonStrokeColor={() => "transparent"}
          
          // Hover Label with "Cheers" info
          polygonLabel={({ properties: d }: any) => {
            const cheers = getCheersForCountry(d.ADMIN);
            return `
              <div style="background: rgba(15, 23, 42, 0.9); color: white; padding: 12px 16px; border-radius: 8px; font-family: sans-serif; backdrop-filter: blur(8px); border: 1px solid rgba(212, 175, 55, 0.3); box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                <h3 style="font-weight: bold; font-size: 1.2em; margin: 0 0 4px 0; color: #d4af37;">${d.ADMIN}</h3>
                ${cheers ? `<div style="font-size: 1.1em; color: #e2e8f0; font-style: italic;">"${cheers}"</div>` : ''}
              </div>
            `;
          }}
          onPolygonHover={setHoveredPolygon}
          polygonAltitude={0.01}

          // Animated Borders
          pathsData={borderPaths}
          pathPoints={(d: any) => d.coords}
          pathPointLat={(p: any) => p[1]}
          pathPointLng={(p: any) => p[0]}
          pathPointAlt={0.02} 
          
          // Bold, Beautiful Colors for Borders
          pathColor={getPathColor}
          
          pathStroke={1} 
          pathDashLength={2} // Longer dashes to show more border simultaneously
          pathDashGap={0.1}  // Smaller gaps
          pathDashAnimateTime={12000} // Slower animation speed
          pathResolution={3} // Optimize performance
        />
      )}
      
      <div className="absolute bottom-4 left-4 p-4 pointer-events-none">
        <h3 className="text-white text-xl font-bold drop-shadow-md">Global Celebration</h3>
        <p className="text-slate-300 text-sm drop-shadow-md">How the world says "Cheers"</p>
      </div>
    </div>
  );
}
