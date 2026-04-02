"use client";

import { useState } from "react";
import clsx from "clsx";
import { StableLocaleText } from "@/components/StableLocaleText";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Tab = "gercek" | "hayal";

export default function Hayal() {
  const [activeTab, setActiveTab] = useState<Tab>("gercek");
  const [isAnimating, setIsAnimating] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleTabChange = (tab: Tab) => {
    if (tab === activeTab || isAnimating) return;
    setIsAnimating(true);
    setActiveTab(tab);
    setTimeout(() => setIsAnimating(false), 800);
  };

  return (
    <section id="hayal" className="relative w-full min-h-screen overflow-hidden">
      {/* Content layer */}
      <div className="relative z-10 flex flex-col justify-start min-h-screen px-4 md:px-8 lg:px-16 py-20 md:py-32">
        <div className="mb-8 md:mb-10 lg:mb-12 text-center">
          <h2 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight text-white/90">
            Hayal
          </h2>
        </div>

        {/* ——— Liquid Glass Panel ——— */}
        <div className="liquid-glass w-full">
          {/* Background video lives inside glass and stays clipped by radius */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <video
              className="h-full w-full object-cover"
              src="/videos/bira-compressed.mp4"
              autoPlay={!prefersReducedMotion}
              loop={!prefersReducedMotion}
              muted
              playsInline
              preload="metadata"
              aria-hidden="true"
            />
            {/* Keeps tab labels legible while preserving glass depth */}
            <div className="absolute inset-0 bg-black/30" />
          </div>

          {/* Spacer content inside glass */}
          <div className="relative z-10 px-10 md:px-20 lg:px-28 pt-14 md:pt-20 lg:pt-24 pb-24 md:pb-28 lg:pb-32" />

          {/* Extra specular highlight layer */}
          <div className="liquid-glass-specular" />

          {/* Side labels — act as tab switches */}
          <div className="absolute inset-0 z-20 flex justify-between items-center px-8 md:px-24 lg:px-32">
            <button
              onClick={() => handleTabChange("gercek")}
              className={clsx(
                "group relative transition-all duration-700",
                activeTab === "gercek"
                  ? "text-white"
                  : "text-white/70 hover:text-white/90"
              )}
              style={{ transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)" }}
            >
              <span
                className={clsx(
                  "font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight transition-opacity duration-700",
                  activeTab === "gercek"
                    ? "opacity-100"
                    : "opacity-80",
                  !prefersReducedMotion && activeTab !== "gercek" && "hayal-tab-pulse"
                )}
              >
                <StableLocaleText tKey="hayal.gercek" nowrap className="text-inherit" />
              </span>
              <span
                className={clsx(
                  "absolute -bottom-1 left-0 h-[1px] bg-white/50 transition-all duration-700",
                  activeTab === "gercek" ? "w-full" : "w-0"
                )}
                style={{ transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)" }}
              />
            </button>

            <button
              onClick={() => handleTabChange("hayal")}
              className={clsx(
                "group relative transition-all duration-700",
                activeTab === "hayal"
                  ? "text-white"
                  : "text-white/70 hover:text-white/90"
              )}
              style={{ transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)" }}
            >
              <span
                className={clsx(
                  "font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight transition-opacity duration-700",
                  activeTab === "hayal"
                    ? "opacity-100"
                    : "opacity-80",
                  !prefersReducedMotion && activeTab !== "hayal" && "hayal-tab-pulse"
                )}
              >
                <StableLocaleText tKey="hayal.hayal" nowrap className="text-inherit" />
              </span>
              <span
                className={clsx(
                  "absolute -bottom-1 right-0 h-[1px] bg-white/50 transition-all duration-700",
                  activeTab === "hayal" ? "w-full" : "w-0"
                )}
                style={{ transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)" }}
              />
            </button>
          </div>
        </div>

        {/* ——— Text content below the glass ——— */}
        <div className="mt-10 md:mt-16 lg:mt-20 max-w-5xl mx-auto w-full">
          <div key={activeTab} className="hayal-content-reveal">
            <p className="text-base md:text-lg lg:text-xl leading-relaxed text-white/85 font-light indent-8 text-balance">
              <StableLocaleText
                tKey={activeTab === "gercek" ? "hayal.gercekText" : "hayal.hayalText"}
                fill
                className="text-inherit"
              />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
