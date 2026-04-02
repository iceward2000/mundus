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
  const loadedFilesRef = useRef<Set<string>>(new Set());
  const preloadedImagesRef = useRef<HTMLImageElement[]>([]);
  const preloadTimersRef = useRef<number[]>([]);
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

  useEffect(() => {
    if (prefersReducedMotion) return;

    const loadedFiles = loadedFilesRef.current;
    const filesInUse = state.current.shuffledImages.map((img) => img.file);
    const eagerCount = isMobile ? 36 : 72;
    const eagerFiles = filesInUse.slice(0, eagerCount);
    const deferredFiles = filesInUse.slice(eagerCount);

    const preloadFile = (file: string) => {
      if (loadedFiles.has(file)) return;
      const img = new Image();
      img.decoding = "async";
      img.loading = "eager";
      img.src = `${CONFIG.pathPrefix}${file}`;
      img.onload = () => loadedFiles.add(file);
      img.onerror = () => loadedFiles.add(file);
      preloadedImagesRef.current.push(img);
    };

    eagerFiles.forEach((file, i) => {
      const timer = window.setTimeout(() => preloadFile(file), i * 18);
      preloadTimersRef.current.push(timer);
    });

    deferredFiles.forEach((file, i) => {
      const timer = window.setTimeout(
        () => preloadFile(file),
        eagerFiles.length * 18 + i * 45
      );
      preloadTimersRef.current.push(timer);
    });

    return () => {
      preloadTimersRef.current.forEach((id) => window.clearTimeout(id));
      preloadTimersRef.current = [];
      preloadedImagesRef.current = [];
      loadedFiles.clear();
    };
  }, [isMobile, prefersReducedMotion]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion) return;
    const effectState = state.current;

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

      // Prefer already loaded files to keep spawn smooth during interaction.
      let imgData = effectState.shuffledImages[effectState.currentIndex];
      let nextIndex = (effectState.currentIndex + 1) % effectState.shuffledImages.length;
      for (let i = 0; i < effectState.shuffledImages.length; i++) {
        const idx = (effectState.currentIndex + i) % effectState.shuffledImages.length;
        const candidate = effectState.shuffledImages[idx];
        if (loadedFilesRef.current.has(candidate.file)) {
          imgData = candidate;
          nextIndex = (idx + 1) % effectState.shuffledImages.length;
          break;
        }
      }

      effectState.currentIndex = nextIndex;
      if (effectState.currentIndex === 0) {
        effectState.shuffledImages = shuffleArray(COCKTAIL_IMAGES);
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
      effectState.activeLayers.push(img);
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
        effectState.activeLayers = effectState.activeLayers.filter(l => l !== animTarget);
      }, runtimeConfig.fadeDuration + 200);

      if (effectState.activeLayers.length > runtimeConfig.maxLayers) {
        const toRemove = effectState.activeLayers.shift();
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
      if (now - effectState.lastSpawnTime < runtimeConfig.throttleInterval) {
        return;
      }

      const dx = x - effectState.lastPointerPos.x;
      const dy = y - effectState.lastPointerPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < runtimeConfig.spawnThreshold) {
        return;
      }

      const timeDelta = Math.max(1, now - effectState.lastSpawnTime);
      const velocity = dist / timeDelta;

      effectState.lastSpawnTime = now;
      effectState.lastPointerPos = { x, y };

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
      effectState.isDragging = true;
      effectState.lastPointerPos = point;
      effectState.lastSpawnTime = Date.now();
    };

    const handleMobilePointerMove = (e: PointerEvent) => {
      if (!isMobile || !effectState.isDragging) return;
      const point = getRelativePointer(e.clientX, e.clientY);
      if (!point) return;
      maybeSpawn(point.x, point.y, Date.now());
    };

    const stopMobileDrag = () => {
      effectState.isDragging = false;
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
      effectState.activeLayers.forEach((el) => el.remove());
      effectState.activeLayers = [];
      effectState.isDragging = false;
    };
  }, [isMobile, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-full overflow-hidden select-none ${
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
