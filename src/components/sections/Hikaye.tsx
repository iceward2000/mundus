"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import SectionWrapper from "../SectionWrapper";
import { StableLocaleText } from "@/components/StableLocaleText";

export default function Hikaye() {
  const [active, setActive] = useState<"dogru" | "yalan">("dogru");
  const selected = active;

  const handleEnter = useCallback((side: "dogru" | "yalan") => {
    setActive(side);
  }, []);

  const handleLeave = useCallback(() => {}, []);

  const handleTap = useCallback((side: "dogru" | "yalan") => {
    setActive(side);
  }, []);

  return (
    <SectionWrapper
      id="hikaye"
      fullHeight={false}
      className="pt-4 md:pt-32 pb-6 md:pb-8 !overflow-visible"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* ── Full-bleed image stage (breaks out of content width) ── */}
        <div className="relative left-1/2 w-screen -translate-x-1/2 z-[3]">
          <div className="relative isolate w-full aspect-[64/15] overflow-hidden rounded-sm border border-white/10 bg-black/30">
            <Image
              src="/hikaye-images/4.png"
              alt="Hikaye - Doğru"
              fill
              className={`object-contain transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                selected === "dogru"
                  ? "opacity-100 scale-100 blur-0"
                  : "opacity-0 scale-[1.03] blur-[2px]"
              }`}
              sizes="100vw"
              priority
            />
            <Image
              src="/hikaye-images/5.png"
              alt="Hikaye - Yalan"
              fill
              className={`object-contain transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                selected === "yalan"
                  ? "opacity-100 scale-100 blur-0"
                  : "opacity-0 scale-[1.03] blur-[2px]"
              }`}
              sizes="100vw"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/5" />
          </div>
        </div>

        {/* Horizontal "hikaye" text below image */}
        <div className="mt-4 flex justify-center select-none">
          <p className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white/60 tracking-[0.22em] uppercase">
            <StableLocaleText tKey="hikaye.sectionName" nowrap className="text-inherit" />
          </p>
        </div>

        {/* ── Doğru / Yalan Titles — always visible ── */}
        <div className="flex justify-between items-center mt-10 md:mt-14 px-1">
          <button
            type="button"
            className="py-4 pr-12 cursor-pointer"
            onMouseEnter={() => handleEnter("dogru")}
            onFocus={() => handleEnter("dogru")}
            onBlur={handleLeave}
            onClick={() => handleTap("dogru")}
          >
            <h3
              className={`font-serif text-2xl md:text-4xl lg:text-5xl transition-[color,opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                selected === "dogru"
                  ? "text-primary opacity-100 -translate-y-0.5"
                  : "text-white/70 opacity-100"
              }`}
            >
              <StableLocaleText tKey="hikaye.titleDogru" nowrap className="text-inherit" />
            </h3>
          </button>

          <button
            type="button"
            className="py-4 pl-12 cursor-pointer"
            onMouseEnter={() => handleEnter("yalan")}
            onFocus={() => handleEnter("yalan")}
            onBlur={handleLeave}
            onClick={() => handleTap("yalan")}
          >
            <h3
              className={`font-serif text-2xl md:text-4xl lg:text-5xl transition-[color,opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                selected === "yalan"
                  ? "text-primary opacity-100 -translate-y-0.5"
                  : "text-white/70 opacity-100"
              }`}
            >
              <StableLocaleText tKey="hikaye.titleYalan" nowrap className="text-inherit" />
            </h3>
          </button>
        </div>

        {/* ── Description Area — fixed height, absolute children, ZERO layout shift ── */}
        <div className="relative mt-6 md:mt-10 md:min-h-[380px] lg:min-h-[420px]">
          {/* Border line */}
          <div
            className={`absolute top-0 left-0 right-0 h-px bg-white/10 transition-[transform,opacity] duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] origin-left ${
              selected ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
            }`}
          />

          {/* Doğru Description — always absolute */}
          <div
            className={`pt-8 pb-4 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:absolute md:inset-x-0 md:top-0 ${
              selected === "dogru"
                ? "opacity-100 translate-y-0"
                : "hidden md:block opacity-0 translate-y-5 pointer-events-none"
            }`}
          >
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-white/80 font-light w-full">
              <StableLocaleText tKey="hikaye.dogru" fill className="text-inherit" />
            </p>
          </div>

          {/* Yalan Description — always absolute */}
          <div
            className={`pt-8 pb-4 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:absolute md:inset-x-0 md:top-0 ${
              selected === "yalan"
                ? "opacity-100 translate-y-0"
                : "hidden md:block opacity-0 translate-y-5 pointer-events-none"
            }`}
          >
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-white/80 font-light w-full text-right">
              <StableLocaleText tKey="hikaye.yalan" fill className="text-inherit" />
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
