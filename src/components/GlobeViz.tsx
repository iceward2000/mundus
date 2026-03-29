"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { getCheersForCountry } from "@/lib/cheersData";

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full bg-slate-950 text-slate-500">
      <span className="animate-pulse">Loading...</span>
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

const getPolygonSideColor = () => "rgba(0, 0, 0, 0.2)";
const getPolygonStrokeColor = () => "transparent";
const getPathPoints = (d: any) => d.coords;
const getPathPointLat = (p: any) => p[1];
const getPathPointLng = (p: any) => p[0];
const getPolygonLabel = ({ properties: d }: any) => {
  const countryName = d.DISPLAY_ADMIN || d.ADMIN;
  const { trName, cheers } = getCheersForCountry(countryName);
  return `
    <div style="background: rgba(15, 23, 42, 0.9); color: white; padding: 12px 16px; border-radius: 8px; font-family: sans-serif; backdrop-filter: blur(8px); border: 1px solid rgba(212, 175, 55, 0.3); box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
      <h3 style="font-weight: bold; font-size: 1.2em; margin: 0 0 4px 0; color: #d4af37;">${trName}</h3>
      ${cheers ? `<div style="font-size: 1.1em; color: #e2e8f0; font-style: italic;">"${cheers}"</div>` : ''}
    </div>
  `;
};

export default function GlobeViz({ markers = [] }: GlobeVizProps) {
  const globeEl = useRef<any>(undefined);
  const [countries, setCountries] = useState({ features: [] });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPolygon, setHoveredPolygon] = useState<any>(null);
  const [ready, setReady] = useState(false);

  // Some overseas territories are grouped under a sovereign country in this dataset.
  // For the South America part of France, we relabel to Guyana to match site data.
  const getDisplayAdmin = useCallback((admin: string, ring: [number, number][]) => {
    if (admin !== "France") return admin;
    if (!ring.length) return admin;

    let sumLng = 0;
    let sumLat = 0;
    ring.forEach(([lng, lat]) => {
      sumLng += lng;
      sumLat += lat;
    });
    const centerLng = sumLng / ring.length;
    const centerLat = sumLat / ring.length;

    const isSouthAmericaFrancePiece =
      centerLng > -56 &&
      centerLng < -50 &&
      centerLat > 1 &&
      centerLat < 7;

    return isSouthAmericaFrancePiece ? "Guyana" : admin;
  }, []);

  // Stable color accessor to prevent re-renders breaking the lines
  const getPathColor = useCallback(() => PATH_COLORS, []);

  const getPolygonCapColor = useCallback((d: any) =>
    d === hoveredPolygon
      ? "rgba(212, 175, 55, 0.3)" // Gold tint on hover
      : "rgba(20, 30, 50, 0.6)",  // Dark transparent blue for countries
    [hoveredPolygon]);

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

  const polygonFeatures = useMemo(() => {
    const features: any[] = [];
    countries.features.forEach((feature: any) => {
      const { geometry, properties } = feature;
      if (!geometry || !properties) return;

      if (geometry.type === "Polygon") {
        const ring = geometry.coordinates[0];
        features.push({
          type: "Feature",
          properties: {
            ...properties,
            DISPLAY_ADMIN: getDisplayAdmin(properties.ADMIN, ring),
          },
          geometry,
        });
        return;
      }

      if (geometry.type === "MultiPolygon") {
        geometry.coordinates.forEach((polygon: any) => {
          const ring = polygon[0];
          features.push({
            type: "Feature",
            properties: {
              ...properties,
              DISPLAY_ADMIN: getDisplayAdmin(properties.ADMIN, ring),
            },
            geometry: {
              type: "Polygon",
              coordinates: polygon,
            },
          });
        });
      }
    });
    return features;
  }, [countries, getDisplayAdmin]);

  // Process polygon features into paths for animated borders
  const borderPaths = useMemo(() => {
    const paths: any[] = [];
    polygonFeatures.forEach((feature: any) => {
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
      }
    });
    return paths;
  }, [polygonFeatures]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[500px] relative overflow-hidden touch-none"
      data-lenis-prevent // Prevents Lenis from hijacking scroll/drag events on the globe
    >
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
          polygonsData={polygonFeatures}
          polygonCapColor={getPolygonCapColor}
          polygonSideColor={getPolygonSideColor}
          polygonStrokeColor={getPolygonStrokeColor}

          // Hover Label with "Cheers" info
          polygonLabel={getPolygonLabel}
          onPolygonHover={setHoveredPolygon}
          polygonAltitude={0.01}

          // Animated Borders
          pathsData={borderPaths}
          pathPoints={getPathPoints}
          pathPointLat={getPathPointLat}
          pathPointLng={getPathPointLng}
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

    </div>
  );
}
