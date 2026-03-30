"use client";

/**
 * AssetPreloader — Preloads heavy assets (images, audio) on desktop before age gate entry.
 * Dispatches "mundus-load-progress" with { progress: 0..100 } so AgeVerificationOverlay
 * can enable the "Evet" button only when ready. On mobile, preloading is skipped (immediate entry).
 */

import { useEffect } from "react";

// ── Asset Manifest ──────────────────────────────────────────────────────────
const DESKTOP_IMAGE_ASSETS = [
  "/mundus-text-logo.svg",
  "/hikaye-images/13.png",
  "/hikaye-images/14.png",
  ...Array.from({ length: 12 }, (_, i) => `/cocktail-images/${i + 7}.png`),
];
const MOBILE_IMAGE_ASSETS = [
  "/mundus-text-logo.svg",
  "/hikaye-images/13.png",
  "/hikaye-images/14.png"
];

export default function AssetPreloader() {
  useEffect(() => {
    const desktop =
      window.matchMedia("(pointer: fine)").matches && window.innerWidth >= 768;
    const imageAssets = desktop ? DESKTOP_IMAGE_ASSETS : MOBILE_IMAGE_ASSETS;
    const total = imageAssets.length;

    if (total === 0) return;

    let loaded = 0;

    const bump = () => {
      loaded++;
      const progress = Math.round((loaded / total) * 100);
      window.dispatchEvent(
        new CustomEvent("mundus-load-progress", { detail: { progress } })
      );
    };

    imageAssets.forEach((url) => {
      const img = new Image();
      img.onload = bump;
      img.onerror = bump;
      img.src = url;
    });
  }, []);

  return null;
}
