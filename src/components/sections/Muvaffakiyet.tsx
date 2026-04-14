"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import SectionWrapper from "../SectionWrapper";
import clsx from "clsx";
import { StableLocaleText } from "@/components/StableLocaleText";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MUVAFFAKIYET_SLIDES: {
  id: string;
  titleKey: TranslationKey;
  textKey: TranslationKey;
}[] = [
  { id: "kim", titleKey: "muvaffakiyet.kim.title", textKey: "muvaffakiyet.kim.text" },
  { id: "neden", titleKey: "muvaffakiyet.neden.title", textKey: "muvaffakiyet.neden.text" },
  { id: "nasil", titleKey: "muvaffakiyet.nasil.title", textKey: "muvaffakiyet.nasil.text" },
  { id: "ne", titleKey: "muvaffakiyet.ne.title", textKey: "muvaffakiyet.ne.text" },
  { id: "nerede", titleKey: "muvaffakiyet.nerede.title", textKey: "muvaffakiyet.nerede.text" },
  { id: "ne-zaman", titleKey: "muvaffakiyet.neZaman.title", textKey: "muvaffakiyet.neZaman.text" },
];

export default function Muvaffakiyet() {
  const { t, lang } = useLanguage();
  const DATA = MUVAFFAKIYET_SLIDES;
  const TOTAL = DATA.length;
  const START_INDEX = TOTAL;
  const LOOP_REPEAT = 3;
  const LOOP_SLIDES = useMemo(
    () =>
      Array.from({ length: TOTAL * LOOP_REPEAT }, (_, index) => ({
        virtualIndex: index,
        realIndex: index % TOTAL,
        item: DATA[index % TOTAL],
      })),
    [DATA, TOTAL]
  );

  const [activeVirtualIndex, setActiveVirtualIndex] = useState(START_INDEX);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const scrollRaf = useRef<number | null>(null);

  const activeIndex = activeVirtualIndex % TOTAL;

  const centerByVirtualIndex = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth", forceMidLoop = false) => {
      const container = carouselRef.current;
      if (!container) return;

      const canonical = ((index % TOTAL) + TOTAL) % TOTAL;
      const nextIndex = forceMidLoop ? TOTAL + canonical : index;
      const element = itemRefs.current[nextIndex];
      if (!element) return;

      const left = element.offsetLeft - (container.clientWidth - element.clientWidth) / 2;
      container.scrollTo({ left, behavior });
      setActiveVirtualIndex(nextIndex);
    },
    [TOTAL]
  );

  const navigate = useCallback(
    (direction: 1 | -1) => {
      centerByVirtualIndex(activeVirtualIndex + direction);
    },
    [activeVirtualIndex, centerByVirtualIndex]
  );

  useEffect(() => {
    centerByVirtualIndex(START_INDEX, "auto", true);
  }, [centerByVirtualIndex, START_INDEX]);

  useEffect(() => {
    const onResize = () => centerByVirtualIndex(activeVirtualIndex, "auto", true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeVirtualIndex, centerByVirtualIndex]);

  const handleScroll = () => {
    if (scrollRaf.current) {
      cancelAnimationFrame(scrollRaf.current);
    }

    scrollRaf.current = requestAnimationFrame(() => {
      const container = carouselRef.current;
      if (!container) return;

      const center = container.scrollLeft + container.clientWidth / 2;
      let closestIndex = activeVirtualIndex;
      let closestDistance = Number.POSITIVE_INFINITY;

      LOOP_SLIDES.forEach(({ virtualIndex }) => {
        const element = itemRefs.current[virtualIndex];
        if (!element) return;

        const elementCenter = element.offsetLeft + element.clientWidth / 2;
        const distance = Math.abs(elementCenter - center);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = virtualIndex;
        }
      });

      setActiveVirtualIndex(closestIndex);

      // Re-center into the middle track copy to keep a seamless loop.
      if (closestIndex < TOTAL || closestIndex >= TOTAL * 2) {
        centerByVirtualIndex(closestIndex, "auto", true);
      }
    });
  };

  useEffect(() => {
    return () => {
      if (scrollRaf.current) {
        cancelAnimationFrame(scrollRaf.current);
      }
    };
  }, []);

  return (
    <SectionWrapper id="muvaffakiyet" className="py-20">
      <div className="w-full relative z-10">
        {/* Section header */}
        <div className="mb-12 md:mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-serif mt-4">
            <StableLocaleText tKey="muvaffakiyet.title" fill className="text-inherit" />
          </h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">
            <StableLocaleText tKey="muvaffakiyet.subtitle" fill className="text-inherit" />
          </p>
        </div>

        {/* Unified loop carousel - mobile + desktop */}
        <div className="select-none">
          <div className="relative">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label={lang === "tr" ? "Onceki" : "Previous"}
              className={clsx(
                "absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full border border-white/20 bg-black/45 text-white/85 backdrop-blur-sm transition-all",
                "active:scale-95 hover:bg-black/60"
              )}
            >
              <ChevronLeft className="h-4 w-4 mx-auto" />
            </button>

            <div
              ref={carouselRef}
              onScroll={handleScroll}
              className="overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex items-stretch gap-3 sm:gap-4 px-8 sm:px-12">
                {LOOP_SLIDES.map(({ virtualIndex, realIndex, item }) => {
                  const isActive = virtualIndex === activeVirtualIndex;

                  return (
                    <button
                      key={`${item.id}-${virtualIndex}`}
                      type="button"
                      ref={(element) => {
                        itemRefs.current[virtualIndex] = element;
                      }}
                      onClick={() => centerByVirtualIndex(virtualIndex)}
                      aria-label={t(item.titleKey)}
                      className={clsx(
                        "shrink-0 snap-center text-left rounded-2xl border px-5 py-6 sm:px-6 sm:py-7 transition-all duration-250",
                        "basis-[84%] sm:basis-[62%] lg:basis-[46%] xl:basis-[38%]",
                        isActive
                          ? "border-primary/50 bg-white/[0.07] shadow-[0_10px_35px_rgba(212,175,55,0.12)]"
                          : "border-white/15 bg-white/[0.03] opacity-70 hover:opacity-95"
                      )}
                    >
                      <h3
                        className={clsx(
                          "font-serif mb-3 sm:mb-4 transition-colors",
                          isActive ? "text-2xl lg:text-[2rem] text-primary" : "text-xl lg:text-2xl text-white/80"
                        )}
                      >
                        <StableLocaleText tKey={item.titleKey} fill className="text-inherit" />
                      </h3>
                      <p
                        className={clsx(
                          "font-light leading-relaxed transition-colors",
                          isActive ? "text-sm lg:text-base text-white/75" : "text-sm text-white/55 line-clamp-6"
                        )}
                      >
                        <StableLocaleText tKey={item.textKey} fill className="text-inherit" />
                      </p>
                      <span className="sr-only">{realIndex + 1}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(1)}
              aria-label={lang === "tr" ? "Sonraki" : "Next"}
              className={clsx(
                "absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full border border-white/20 bg-black/45 text-white/85 backdrop-blur-sm transition-all",
                "active:scale-95 hover:bg-black/60"
              )}
            >
              <ChevronRight className="h-4 w-4 mx-auto" />
            </button>
          </div>

          <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mx-auto mt-10 mb-6" />
          <div className="flex items-center justify-center gap-2">
            {DATA.map((item, i) => (
              <button
                key={item.id}
                onClick={() => centerByVirtualIndex(TOTAL + i)}
                aria-label={t(item.titleKey)}
                className={clsx(
                  "rounded-full transition-all duration-300 cursor-pointer",
                  i === activeIndex
                    ? "w-6 h-1.5 bg-primary"
                    : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
