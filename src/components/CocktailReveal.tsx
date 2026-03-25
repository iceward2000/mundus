"use client";

import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useLanguage } from "@/context/LanguageContext";

// Configuration
// Generate cocktail images array from 7.png to 150.png


const COCKTAIL_IMAGES = Array.from({ length: 144 }, (_, i) => {
  const imageNumber = i + 7; // Start from 7
  return {
    name: `Cocktail ${imageNumber}`,
    file: `${imageNumber}.png`,
  };
});

const CONFIG = {
  desktop: {
    spawnThreshold: 30,
    throttleInterval: 15,
    maxLayers: 50,
    fadeDuration: 1500,
    minScale: 0.8,
    maxScale: 1.5,
    maxVelocity: 4,
  },
  mobile: {
    spawnThreshold: 18,
    throttleInterval: 22,
    maxLayers: 20,
    fadeDuration: 1150,
    minScale: 0.9,
    maxScale: 1.28,
    maxVelocity: 3.2,
  },
  pathPrefix: "/cocktail-images/",
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
  const { t } = useLanguage();
  const hasInteractedRef = useRef(false);
  const [hasInteracted, setHasInteracted] = useState(false);


  // Refs for mutable state to avoid re-renders
  const state = useRef({
    lastSpawnTime: 0,
    lastPointerPos: { x: 0, y: 0 },
    shuffledImages: shuffleArray(COCKTAIL_IMAGES),
    currentIndex: 0,
    activeLayers: [] as HTMLImageElement[],
    isDragging: false,
  });

  // Images are preloaded by AssetPreloader — no duplicate preload needed

  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion) return;

    const getSpawnSize = () => {
      if (!isMobile) {
        return { width: 400, height: 600 };
      }
      const width = Math.round(Math.min(Math.max(container.clientWidth * 0.58, 180), 280));
      return { width, height: Math.round(width * 1.5) };
    };

    const spawnImage = (x: number, y: number, velocity: number) => {
      const runtimeConfig = isMobile ? CONFIG.mobile : CONFIG.desktop;
      const { width: imgWidth, height: imgHeight } = getSpawnSize();
      const normVel = Math.min(Math.max(velocity, 0), runtimeConfig.maxVelocity) / runtimeConfig.maxVelocity;
      const targetScale =
        runtimeConfig.minScale + ((1 - normVel) * (runtimeConfig.maxScale - runtimeConfig.minScale));

      // Get next image from shuffled array
      const imgData = state.current.shuffledImages[state.current.currentIndex];

      // Advance index (loop and reshuffle when needed)
      state.current.currentIndex = (state.current.currentIndex + 1) % state.current.shuffledImages.length;
      if (state.current.currentIndex === 0) {
        state.current.shuffledImages = shuffleArray(COCKTAIL_IMAGES);
      }

      let targetX = x - (imgWidth / 2) + 20;
      let targetY = y - (imgHeight / 2) + 20;

      const maxX = container.clientWidth - imgWidth;
      const maxY = container.clientHeight - imgHeight;
      targetX = Math.max(0, Math.min(targetX, maxX));
      targetY = Math.max(0, Math.min(targetY, maxY));

      // animTarget is either a bare <img> or a colored wrapper <div>
      let animTarget: HTMLElement;

      const img = document.createElement("img");
      img.src = `${CONFIG.pathPrefix}${imgData.file}`;
      img.alt = imgData.name;
      img.style.position = "absolute";
      img.style.width = `${imgWidth}px`;
      img.style.height = `${imgHeight}px`;
      img.style.left = "0";
      img.style.top = "0";
      img.style.objectFit = "contain";
      img.style.pointerEvents = "none";
      img.style.zIndex = "10";

      container.appendChild(img);
      state.current.activeLayers.push(img);
      animTarget = img;

      animTarget.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(${targetScale * 0.9})`;
      animTarget.style.opacity = "1";
      animTarget.style.transition = `transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity ${runtimeConfig.fadeDuration}ms ease-out`;

      requestAnimationFrame(() => {
        void animTarget.offsetWidth;
        animTarget.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(${targetScale})`;
        setTimeout(() => {
          animTarget.style.opacity = "0";
        }, 300);
      });

      setTimeout(() => {
        if (animTarget.parentNode === container) {
          container.removeChild(animTarget);
        }
        state.current.activeLayers = state.current.activeLayers.filter(l => l !== animTarget);
      }, runtimeConfig.fadeDuration + 200);

      if (state.current.activeLayers.length > runtimeConfig.maxLayers) {
        const toRemove = state.current.activeLayers.shift();
        if (toRemove && toRemove.parentNode === container) {
          container.removeChild(toRemove);
        }
      }

      if (isMobile && !hasInteractedRef.current) {
        hasInteractedRef.current = true;
        setHasInteracted(true);
      }
    };

    const maybeSpawn = (x: number, y: number, now: number) => {
      const runtimeConfig = isMobile ? CONFIG.mobile : CONFIG.desktop;
      if (now - state.current.lastSpawnTime < runtimeConfig.throttleInterval) {
        return;
      }

      const dx = x - state.current.lastPointerPos.x;
      const dy = y - state.current.lastPointerPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < runtimeConfig.spawnThreshold) {
        return;
      }

      const timeDelta = Math.max(1, now - state.current.lastSpawnTime);
      const velocity = dist / timeDelta;

      state.current.lastSpawnTime = now;
      state.current.lastPointerPos = { x, y };

      spawnImage(x, y, velocity);
    };

    const getRelativePointer = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const isInside =
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;

      if (!isInside) {
        return null;
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const handleDesktopPointerMove = (e: PointerEvent) => {
      if (isMobile) return;
      const point = getRelativePointer(e.clientX, e.clientY);
      if (!point) return;
      maybeSpawn(point.x, point.y, Date.now());
    };

    const handleMobilePointerDown = (e: PointerEvent) => {
      if (!isMobile) return;
      const point = getRelativePointer(e.clientX, e.clientY);
      if (!point) return;
      state.current.isDragging = true;
      state.current.lastPointerPos = point;
      state.current.lastSpawnTime = Date.now();
    };

    const handleMobilePointerMove = (e: PointerEvent) => {
      if (!isMobile || !state.current.isDragging) return;
      const point = getRelativePointer(e.clientX, e.clientY);
      if (!point) return;
      maybeSpawn(point.x, point.y, Date.now());
    };

    const stopMobileDrag = () => {
      state.current.isDragging = false;
    };

    window.addEventListener("pointermove", handleDesktopPointerMove);
    container.addEventListener("pointerdown", handleMobilePointerDown);
    container.addEventListener("pointermove", handleMobilePointerMove);
    container.addEventListener("pointerup", stopMobileDrag);
    container.addEventListener("pointercancel", stopMobileDrag);
    container.addEventListener("pointerleave", stopMobileDrag);

    return () => {
      window.removeEventListener("pointermove", handleDesktopPointerMove);
      container.removeEventListener("pointerdown", handleMobilePointerDown);
      container.removeEventListener("pointermove", handleMobilePointerMove);
      container.removeEventListener("pointerup", stopMobileDrag);
      container.removeEventListener("pointercancel", stopMobileDrag);
      container.removeEventListener("pointerleave", stopMobileDrag);
      state.current.activeLayers.forEach(el => el.remove());
      state.current.activeLayers = [];
      state.current.isDragging = false;
    };
  }, [isMobile, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-full overflow-hidden ${
        isMobile ? "touch-pan-y" : "touch-none"
      }`}
    >
      {prefersReducedMotion && <ReducedMotionFallback />}

      {isMobile && !prefersReducedMotion && (
        <div
          className={`pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-24 text-neutral-200 text-xs sm:text-sm px-4 py-2 rounded-full bg-black/45 border border-white/20 backdrop-blur-sm transition-all duration-500 ${
            hasInteracted ? "opacity-0 translate-y-2" : "opacity-100 animate-pulse"
          }`}
        >
          {t("cocktail.mobileHintDrag")}
        </div>
      )}
    </div>
  );
}

function ReducedMotionFallback() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
      <img
        src={`${CONFIG.pathPrefix}${COCKTAIL_IMAGES[0].file}`}
        alt={COCKTAIL_IMAGES[0].name}
        className="w-[min(72vw,320px)] md:w-[360px] h-auto object-contain opacity-90"
      />
    </div>
  );
}
