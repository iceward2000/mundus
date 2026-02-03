"use client";

import React, { useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// Configuration
const COCKTAIL_IMAGES = [
  // Colored Background Loop
  { name: "Red", file: "COLOREDBG-COCKTAIL-1.png", color: "#EF4444" },
  { name: "Orange", file: "COLOREDBG-COCKTAIL-2.png", color: "#F97316" },
  { name: "Yellow", file: "COLOREDBG-COCKTAIL-3.png", color: "#EAB308" },
  { name: "Green", file: "COLOREDBG-COCKTAIL-4.png", color: "#22C55E" },
  { name: "Light Blue", file: "COLOREDBG-COCKTAIL-5.png", color: "#0EA5E9" },
  { name: "Dark Blue", file: "COLOREDBG-COCKTAIL-6.png", color: "#1E3A8A" },
  { name: "Purple", file: "COLOREDBG-COCKTAIL-7.png", color: "#A855F7" },
  // No Background Loop
  { name: "Red NoBg", file: "NOBG-COCKTAIL-1.png", color: "#EF4444" },
  { name: "Orange NoBg", file: "NOBG-COCKTAIL-2.png", color: "#F97316" },
  { name: "Yellow NoBg", file: "NOBG-COCKTAIL-3.png", color: "#EAB308" },
  { name: "Green NoBg", file: "NOBG-COCKTAIL-4.png", color: "#22C55E" },
  { name: "Light Blue NoBg", file: "NOBG-COCKTAIL-5.png", color: "#0EA5E9" },
  { name: "Dark Blue NoBg", file: "NOBG-COCKTAIL-6.png", color: "#1E3A8A" },
  { name: "Purple NoBg", file: "NOBG-COCKTAIL-7.png", color: "#A855F7" },
];

const CONFIG = {
  // Distance threshold in pixels
  spawnThreshold: 30, 
  // Throttle time in ms
  throttleInterval: 15, 
  // Max active layers to keep in DOM
  maxLayers: 50,
  // Fade duration in ms
  fadeDuration: 1500,
  // Image path prefix
  pathPrefix: "/cocktail-images/",
};

export default function CocktailReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();
  
  // Refs for mutable state to avoid re-renders
  const state = useRef({
    lastSpawnTime: 0,
    lastMousePos: { x: 0, y: 0 },
    currentIndex: 0,
    activeLayers: [] as HTMLImageElement[],
  });

  // Preload images
  useEffect(() => {
    COCKTAIL_IMAGES.forEach((img) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = `${CONFIG.pathPrefix}${img.file}`;
      document.head.appendChild(link);
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || isMobile || prefersReducedMotion) return;

    const handlePointerMove = (e: PointerEvent) => {
      const now = Date.now();
      const { clientX, clientY } = e;
      
      // Get container bounds to ensure we calculate position relative to it
      const rect = container.getBoundingClientRect();
      
      // Check if mouse is within container bounds (plus padding/margin if desired)
      // This allows interaction even if navigation is overlaying
      const isInside = 
        clientX >= rect.left && 
        clientX <= rect.right && 
        clientY >= rect.top && 
        clientY <= rect.bottom;

      if (!isInside) return;

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // 1. Throttle check
      if (now - state.current.lastSpawnTime < CONFIG.throttleInterval) {
        return;
      }

      // 2. Distance check
      const dx = x - state.current.lastMousePos.x;
      const dy = y - state.current.lastMousePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CONFIG.spawnThreshold) {
        return;
      }

      // Calculate velocity
      const timeDelta = Math.max(1, now - state.current.lastSpawnTime);
      const velocity = dist / timeDelta;

      // Update state
      state.current.lastSpawnTime = now;
      state.current.lastMousePos = { x, y };

      // 3. Spawn Image
      spawnImage(x, y, velocity);
    };

    const spawnImage = (x: number, y: number, velocity: number) => {
      // Calculate dynamic scale
      const maxVelocity = 4; 
      const minScale = 0.8; 
      const maxScale = 1.5; 
      const normVel = Math.min(Math.max(velocity, 0), maxVelocity) / maxVelocity;
      const targetScale = minScale + (normVel * (maxScale - minScale));

      const imgData = COCKTAIL_IMAGES[state.current.currentIndex];
      
      // Advance index (loop)
      state.current.currentIndex = (state.current.currentIndex + 1) % COCKTAIL_IMAGES.length;

      const img = document.createElement("img");
      img.src = `${CONFIG.pathPrefix}${imgData.file}`;
      img.alt = imgData.name;
      
      // Styling
      img.style.position = "absolute";
      img.style.width = "200px"; // Fixed width for "poster-like" look
      img.style.height = "auto";
      img.style.aspectRatio = "2/3"; // Tall rectangle
      img.style.objectFit = "cover";
      img.style.left = "0";
      img.style.top = "0";
      // Constrain inside container
      const imgWidth = 200;
      const imgHeight = 300; // Approx for 2/3 aspect ratio
      
      // Initial calculated position (centered on cursor + offset)
      let targetX = x - (imgWidth / 2) + 20;
      let targetY = y - (imgHeight / 2) + 20;

      // Clamp to container bounds
      // We allow it to go slightly off-screen if that looks better, but "always constrained" usually means fully visible.
      // Let's keep it fully visible.
      const maxX = container.clientWidth - imgWidth;
      const maxY = container.clientHeight - imgHeight;

      targetX = Math.max(0, Math.min(targetX, maxX));
      targetY = Math.max(0, Math.min(targetY, maxY));
      
      img.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(${targetScale * 0.9})`;
      img.style.opacity = "1";
      img.style.transition = `transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity ${CONFIG.fadeDuration}ms ease-out`;
      img.style.pointerEvents = "none";
      img.style.zIndex = "10";
      img.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"; // Shadow for depth
      img.style.borderRadius = "8px";

      container.appendChild(img);
      state.current.activeLayers.push(img);

      // Trigger animation frame for initial scale up
      requestAnimationFrame(() => {
        // Force reflow
        void img.offsetWidth;
        img.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(${targetScale})`;
        
        // Schedule fade out
        setTimeout(() => {
             img.style.opacity = "0";
        }, 300);
      });

      // Cleanup after animation
      setTimeout(() => {
        if (img.parentNode === container) {
          container.removeChild(img);
        }
        state.current.activeLayers = state.current.activeLayers.filter(l => l !== img);
      }, CONFIG.fadeDuration + 200);

      // Limit max layers
      if (state.current.activeLayers.length > CONFIG.maxLayers) {
        const toRemove = state.current.activeLayers.shift();
        if (toRemove && toRemove.parentNode === container) {
            // Quick fade out if forced removal? Or just remove.
            toRemove.remove();
        }
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      // Cleanup all images on unmount
      state.current.activeLayers.forEach(img => img.remove());
      state.current.activeLayers = [];
    };
  }, [isMobile, prefersReducedMotion]);

  // Static Mobile / Reduced Motion View
  if (isMobile || prefersReducedMotion) {
      // Tap to cycle for mobile
      const handleTap = () => {
          if (prefersReducedMotion) return; // No cycling for reduced motion
          state.current.currentIndex = (state.current.currentIndex + 1) % COCKTAIL_IMAGES.length;
          // Force update (react way for this part)
          // We can just use a simpler implementation for this fallback
      };

      // Simple React implementation for the static view
      return (
        <div 
            className="relative w-full h-[940px] bg-neutral-100 overflow-hidden flex items-center justify-center"
        >
             <StaticFallback />
        </div>
      );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[940px] bg-neutral-100 overflow-hidden touch-none"
    >
    </div>
  );
}

function StaticFallback() {
    const [index, setIndex] = React.useState(0);
    const isMobile = useIsMobile();
    const prefersReducedMotion = usePrefersReducedMotion();

    const handleClick = () => {
        if (prefersReducedMotion) return;
        setIndex((prev) => (prev + 1) % COCKTAIL_IMAGES.length);
    };

    const currentImg = COCKTAIL_IMAGES[index];

    return (
        <div 
            className="relative w-full h-full flex items-center justify-center bg-neutral-50"
            onClick={handleClick}
        >
            <img 
                src={`${CONFIG.pathPrefix}${currentImg.file}`} 
                alt={currentImg.name}
                className="w-64 h-auto shadow-xl rounded-lg object-cover aspect-[2/3]"
            />
            {!prefersReducedMotion && isMobile && (
                <div className="absolute bottom-4 text-neutral-400 text-sm">
                    Tap to cycle
                </div>
            )}
        </div>
    );
}
