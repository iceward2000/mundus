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

const GEOJSON_PRIMARY = "/data/ne_110m_admin_0_countries.geojson";
const GEOJSON_FALLBACK =
  "https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson";
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
  const [countries, setCountries] = useState<{ features: any[] }>({ features: [] });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPolygon, setHoveredPolygon] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [compactLayout, setCompactLayout] = useState(false);

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

  const getPolygonCapColor = useCallback(
    (d: any) => {
      if (d === hoveredPolygon) {
        return "rgba(212, 175, 55, 0.42)";
      }
      return "#E8E9EB";
    },
    [hoveredPolygon]
  );

  const getPolygonStrokeColor = useCallback(
    () =>
      compactLayout ? "rgba(212, 175, 55, 0.22)" : "transparent",
    [compactLayout]
  );

  const polygonAltitude = compactLayout ? 0.045 : 0.018;
  const pathPointAltitude = compactLayout ? 0.04 : 0.02;

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
    let cancelled = false;

    const loadGeo = async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      return res.json() as Promise<{ features: any[] }>;
    };

    (async () => {
      try {
        const data = await loadGeo(GEOJSON_PRIMARY);
        if (!cancelled) setCountries(data);
      } catch {
        try {
          const data = await loadGeo(GEOJSON_FALLBACK);
          if (!cancelled) setCountries(data);
        } catch {
          if (!cancelled) setCountries({ features: [] });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) {
        setDimensions({ width: w, height: h });
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("orientationchange", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setCompactLayout(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!ready || !globeEl.current) return;
    if (dimensions.width < 1 || dimensions.height < 1) return;

    const controls = globeEl.current.controls();
    const canvas = globeEl.current.renderer()?.domElement as HTMLCanvasElement | undefined;
    let resumeRotateTimer: ReturnType<typeof setTimeout>;
    let isPinching = false;

    const pauseAutoRotate = () => {
      clearTimeout(resumeRotateTimer);
      controls.autoRotate = false;
    };

    const scheduleResumeAutoRotate = () => {
      if (compactLayout) return;
      clearTimeout(resumeRotateTimer);
      resumeRotateTimer = setTimeout(() => {
        controls.autoRotate = true;
      }, 3500);
    };

    controls.autoRotate = !compactLayout;
    controls.autoRotateSpeed = compactLayout ? 0.35 : 0.5;
    controls.enableZoom = true;
    controls.zoomSpeed = compactLayout ? 2.2 : 1;
    controls.enablePan = false;
    controls.rotateSpeed = compactLayout ? 0.45 : 0.8;
    controls.minDistance = compactLayout ? 140 : 120;
    controls.maxDistance = compactLayout ? 900 : 1000;

    if ("touches" in controls) {
      // Keep pinch gesture focused on dolly by disabling pan.
      // OrbitControls has no dolly-only touch mode, so this is the closest stable setup.
      (
        controls as {
          touches: { ONE: number; TWO: number };
        }
      ).touches.ONE = 0; // THREE.TOUCH.ROTATE
      (
        controls as {
          touches: { ONE: number; TWO: number };
        }
      ).touches.TWO = 2; // THREE.TOUCH.DOLLY_PAN (pan disabled above)
    }

    if ("enableDamping" in controls) {
      (controls as { enableDamping: boolean }).enableDamping = true;
      (controls as { dampingFactor: number }).dampingFactor = 0.06;
    }

    globeEl.current.pointOfView({ altitude: compactLayout ? 2.35 : 2.5 });

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length < 2) return;
      isPinching = true;
      // Prevent accidental spin when two-finger pinch starts.
      controls.enableRotate = false;
      pauseAutoRotate();
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (event.touches.length >= 2) return;
      if (!isPinching) return;
      isPinching = false;
      controls.enableRotate = true;
      scheduleResumeAutoRotate();
    };

    if (canvas) {
      canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
      canvas.addEventListener("touchend", handleTouchEnd, { passive: true });
      canvas.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    }

    controls.addEventListener("start", pauseAutoRotate);
    controls.addEventListener("end", scheduleResumeAutoRotate);

    return () => {
      clearTimeout(resumeRotateTimer);
      if (canvas) {
        canvas.removeEventListener("touchstart", handleTouchStart);
        canvas.removeEventListener("touchend", handleTouchEnd);
        canvas.removeEventListener("touchcancel", handleTouchEnd);
      }
      controls.removeEventListener("start", pauseAutoRotate);
      controls.removeEventListener("end", scheduleResumeAutoRotate);
    };
  }, [ready, dimensions.width, dimensions.height, compactLayout]);

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

  const canRenderGlobe =
    ready && dimensions.width > 0 && dimensions.height > 0;

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-0 lg:min-h-[500px] relative overflow-hidden touch-none"
      data-lenis-prevent // Prevents Lenis from hijacking scroll/drag events on the globe
    >
      {canRenderGlobe && (
        <Globe
          ref={globeEl}
          width={dimensions.width}
          height={dimensions.height}
          rendererConfig={{
            antialias: false,
            alpha: true,
            failIfMajorPerformanceCaveat: false,
            powerPreference: "high-performance",
          }}
          globeImageUrl="https://unpkg.com/three-globe/example/img/earth-dark.jpg"
          bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"

          polygonsData={polygonFeatures}
          polygonCapColor={getPolygonCapColor}
          polygonSideColor={getPolygonSideColor}
          polygonStrokeColor={getPolygonStrokeColor}

          polygonLabel={getPolygonLabel}
          onPolygonHover={setHoveredPolygon}
          polygonAltitude={polygonAltitude}
          polygonCapCurvatureResolution={compactLayout ? 8 : 12}

          pathsData={borderPaths}
          pathPoints={getPathPoints}
          pathPointLat={getPathPointLat}
          pathPointLng={getPathPointLng}
          pathPointAlt={pathPointAltitude}

          // Bold, Beautiful Colors for Borders
          pathColor={getPathColor}

          pathStroke={1}
          pathDashLength={2} // Longer dashes to show more border simultaneously
          pathDashGap={0.1}  // Smaller gaps
          pathDashAnimateTime={12000} // Slower animation speed
          pathResolution={compactLayout ? 2 : 3}
        />
      )}

      {ready && !canRenderGlobe && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-slate-500 text-sm">
          <span className="animate-pulse">Loading…</span>
        </div>
      )}
    </div>
  );
}
