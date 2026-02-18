"use client";

import React, { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// Configuration
// Generate cocktail images array from 7.png to 150.png
const COLOR_PALETTE = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E", "#0EA5E9", 
  "#1E3A8A", "#A855F7", "#EC4899", "#F43F5E", "#FB923C",
  "#FBBF24", "#34D399", "#3B82F6", "#6366F1", "#8B5CF6",
  "#D946EF", "#F59E0B", "#10B981", "#06B6D4", "#6366F1"
];

const COCKTAIL_IMAGES = Array.from({ length: 144 }, (_, i) => {
  const imageNumber = i + 7; // Start from 7
  return {
    name: `Cocktail ${imageNumber}`,
    file: `${imageNumber}.png`,
  };
});

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
  // Queue size before allowing repeat
  queueSize: 50,
};

// Shuffle array utility
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function CocktailReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [coloredBgEnabled, setColoredBgEnabled] = useState(false);
  
  // Refs for mutable state to avoid re-renders
  const state = useRef({
    lastSpawnTime: 0,
    lastMousePos: { x: 0, y: 0 },
    shuffledImages: shuffleArray(COCKTAIL_IMAGES),
    currentIndex: 0,
    recentQueue: [] as number[], // Track recently shown image indices
    activeLayers: [] as HTMLImageElement[],
  });

  // Images are preloaded by AssetPreloader — no duplicate preload needed

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

      // Get next image from shuffled array
      const imgData = state.current.shuffledImages[state.current.currentIndex];
      const currentImageIndex = state.current.currentIndex;
      
      // Advance index (loop and reshuffle when needed)
      state.current.currentIndex = (state.current.currentIndex + 1) % state.current.shuffledImages.length;
      if (state.current.currentIndex === 0) {
        // Reshuffle when we've gone through all images
        state.current.shuffledImages = shuffleArray(COCKTAIL_IMAGES);
      }

      // Update recent queue
      state.current.recentQueue.push(currentImageIndex);
      if (state.current.recentQueue.length > CONFIG.queueSize) {
        state.current.recentQueue.shift();
      }

      const img = document.createElement("img");
      img.src = `${CONFIG.pathPrefix}${imgData.file}`;
      img.alt = imgData.name;
      
      // Container div for optional background
      const wrapper = document.createElement("div");
      wrapper.style.position = "absolute";
      wrapper.style.width = "200px";
      wrapper.style.height = "300px";
      wrapper.style.left = "0";
      wrapper.style.top = "0";
      wrapper.style.borderRadius = "8px";
      wrapper.style.overflow = "hidden";
      wrapper.style.pointerEvents = "none";
      wrapper.style.zIndex = "10";
      wrapper.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
      
      // Add colored background if enabled
      if (coloredBgEnabled) {
        const randomColor = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
        wrapper.style.backgroundColor = randomColor;
      }
      
      // Styling for image
      img.style.position = "relative";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "contain";
      img.style.display = "block";
      
      // Constrain inside container
      const imgWidth = 200;
      const imgHeight = 300;
      
      // Initial calculated position (centered on cursor + offset)
      let targetX = x - (imgWidth / 2) + 20;
      let targetY = y - (imgHeight / 2) + 20;

      // Clamp to container bounds
      const maxX = container.clientWidth - imgWidth;
      const maxY = container.clientHeight - imgHeight;

      targetX = Math.max(0, Math.min(targetX, maxX));
      targetY = Math.max(0, Math.min(targetY, maxY));
      
      wrapper.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(${targetScale * 0.9})`;
      wrapper.style.opacity = "1";
      wrapper.style.transition = `transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity ${CONFIG.fadeDuration}ms ease-out`;

      wrapper.appendChild(img);
      container.appendChild(wrapper);
      state.current.activeLayers.push(img);

      // Trigger animation frame for initial scale up
      requestAnimationFrame(() => {
        // Force reflow
        void wrapper.offsetWidth;
        wrapper.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(${targetScale})`;
        
        // Schedule fade out
        setTimeout(() => {
             wrapper.style.opacity = "0";
        }, 300);
      });

      // Cleanup after animation
      setTimeout(() => {
        if (wrapper.parentNode === container) {
          container.removeChild(wrapper);
        }
        state.current.activeLayers = state.current.activeLayers.filter(l => l !== img);
      }, CONFIG.fadeDuration + 200);

      // Limit max layers
      if (state.current.activeLayers.length > CONFIG.maxLayers) {
        const toRemove = state.current.activeLayers.shift();
        if (toRemove && toRemove.parentNode) {
            (toRemove.parentNode as HTMLElement).remove();
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
  }, [isMobile, prefersReducedMotion, coloredBgEnabled]);

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
            className="relative w-full h-[940px] overflow-hidden flex items-center justify-center"
        >
             <StaticFallback />
        </div>
      );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[940px] overflow-hidden touch-none"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setColoredBgEnabled(!coloredBgEnabled)}
        className={`
          absolute top-6 right-6 z-50 
          px-4 py-2.5 rounded-full 
          font-medium text-sm
          transition-all duration-300 ease-in-out
          shadow-lg hover:shadow-xl
          backdrop-blur-sm
          ${coloredBgEnabled 
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600' 
            : 'bg-white/90 text-gray-700 hover:bg-white border border-gray-200'
          }
          md:top-8 md:right-8 md:px-5 md:py-3 md:text-base
        `}
        aria-label={coloredBgEnabled ? "Disable colored backgrounds" : "Enable colored backgrounds"}
      >
        <span className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${coloredBgEnabled ? 'bg-white' : 'bg-gray-400'} transition-colors`} />
          <span className="hidden sm:inline">
            {coloredBgEnabled ? 'Renkli Arka Plan' : 'Şeffaf Arka Plan'}
          </span>
          <span className="sm:hidden">
            {coloredBgEnabled ? 'Renkli' : 'Şeffaf'}
          </span>
        </span>
      </button>
    </div>
  );
}

function StaticFallback() {
    const [index, setIndex] = React.useState(0);
    const [coloredBgEnabled, setColoredBgEnabled] = React.useState(false);
    const [shuffledImages] = React.useState(() => shuffleArray(COCKTAIL_IMAGES));
    const isMobile = useIsMobile();
    const prefersReducedMotion = usePrefersReducedMotion();

    const handleClick = () => {
        if (prefersReducedMotion) return;
        setIndex((prev) => (prev + 1) % shuffledImages.length);
    };

    const currentImg = shuffledImages[index];
    const bgColor = coloredBgEnabled ? COLOR_PALETTE[index % COLOR_PALETTE.length] : 'transparent';

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Toggle Button for Mobile */}
            <button
                onClick={() => setColoredBgEnabled(!coloredBgEnabled)}
                className={`
                    absolute top-4 right-4 z-50 
                    px-3 py-2 rounded-full 
                    font-medium text-xs
                    transition-all duration-300
                    shadow-lg
                    ${coloredBgEnabled 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                        : 'bg-white/90 text-gray-700 border border-gray-200'
                    }
                `}
            >
                {coloredBgEnabled ? '🎨 Renkli' : '✨ Şeffaf'}
            </button>
            
            <div 
                className="w-64 h-96 rounded-lg shadow-xl overflow-hidden transition-colors duration-300"
                style={{ backgroundColor: bgColor }}
                onClick={handleClick}
            >
                <img 
                    src={`${CONFIG.pathPrefix}${currentImg.file}`} 
                    alt={currentImg.name}
                    className="w-full h-full object-contain"
                />
            </div>
            
            {!prefersReducedMotion && isMobile && (
                <div className="absolute bottom-4 text-neutral-500 text-sm px-4 py-2 bg-white/80 rounded-full backdrop-blur-sm">
                    Değiştirmek için dokunun
                </div>
            )}
        </div>
    );
}
