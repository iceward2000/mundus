"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
  const MOBILE_LOOP_COPIES = 3;
  const [activeIndex, setActiveIndex] = useState(0);
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);
  const mobileLoopData = useMemo(
    () =>
      Array.from({ length: TOTAL * MOBILE_LOOP_COPIES }, (_, index) => ({
        item: DATA[index % TOTAL],
        loopIndex: index,
      })),
    [DATA, TOTAL]
  );

  const wrap = useCallback(
    (index: number) => ((index % TOTAL) + TOTAL) % TOTAL,
    [TOTAL]
  );

  const normalizeMobileLoopPosition = useCallback(() => {
    const el = mobileScrollRef.current;
    if (!el) return;
    if (TOTAL <= 0) return;

    const oneSetWidth = el.clientWidth * TOTAL;
    if (oneSetWidth <= 0) return;

    if (el.scrollLeft < oneSetWidth * 0.5) {
      el.scrollLeft += oneSetWidth;
    } else if (el.scrollLeft > oneSetWidth * 1.5) {
      el.scrollLeft -= oneSetWidth;
    }
  }, [TOTAL]);

  useEffect(() => {
    const el = mobileScrollRef.current;
    if (!el) return;
    if (TOTAL <= 0) return;

    const centerLoop = () => {
      el.scrollLeft = el.clientWidth * TOTAL;
    };

    centerLoop();
    const onScroll = () => normalizeMobileLoopPosition();
    const onResize = () => centerLoop();

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [normalizeMobileLoopPosition, TOTAL]);

  const handleMobileNavigate = (dir: 1 | -1) => {
    const el = mobileScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  const activeWrappedIndex = wrap(activeIndex);
  const visibleOffsets = [-2, -1, 0, 1, 2];

  const getShortestLoopOffset = (targetIndex: number) => {
    const from = activeWrappedIndex;
    const forward = (targetIndex - from + TOTAL) % TOTAL;
    const backward = forward - TOTAL;
    return Math.abs(forward) <= Math.abs(backward) ? forward : backward;
  };

  return (
    <SectionWrapper id="muvaffakiyet" className="py-20">
      <div className="w-full relative z-10">
        {/* Section header */}
        <div className="mb-12 md:mb-16">
          <h2 className="mt-4 text-center text-4xl font-serif md:text-5xl">
            <StableLocaleText tKey="muvaffakiyet.title" fill className="text-inherit" />
          </h2>
          <p className="mx-0 mt-4 max-w-xl text-center text-white/60 md:mx-auto md:text-center">
            <StableLocaleText tKey="muvaffakiyet.subtitle" fill className="text-inherit" />
          </p>
        </div>

        {/* Carousel */}
        <div className="select-none">
          {/* Mobile — horizontal carousel, full text per card */}
          <div
            ref={mobileScrollRef}
            className="md:hidden overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex">
              {mobileLoopData.map(({ item, loopIndex }) => (
                <article
                  key={`${item.id}-${loopIndex}`}
                  className="w-full min-w-full shrink-0 snap-start px-1"
                >
                  <div className="mx-auto flex max-w-2xl flex-col px-2">
                    <h3 className="mb-3 text-center font-serif text-2xl text-primary">
                      <StableLocaleText tKey={item.titleKey} fill className="text-inherit" />
                    </h3>
                    <p className="text-left font-light text-sm leading-relaxed text-white/70">
                      <StableLocaleText tKey={item.textKey} fill className="text-inherit" />
                    </p>

                    <div className="mt-5 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleMobileNavigate(-1)}
                        aria-label={lang === "tr" ? "Onceki" : "Previous"}
                        className={clsx(
                          "z-20 h-8 w-8 rounded-full border border-white/25 bg-black/45 text-white/85 backdrop-blur-sm transition-all",
                          "active:scale-95 opacity-100"
                        )}
                      >
                        <ChevronLeft className="h-4 w-4 mx-auto" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMobileNavigate(1)}
                        aria-label={lang === "tr" ? "Sonraki" : "Next"}
                        className={clsx(
                          "z-20 h-8 w-8 rounded-full border border-white/25 bg-black/45 text-white/85 backdrop-blur-sm transition-all",
                          "active:scale-95 opacity-100"
                        )}
                      >
                        <ChevronRight className="h-4 w-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Desktop — horizontal layout (infinite loop, center-focused) */}
          <div className="hidden md:block">
            <div className="muvaffakiyet-content-reveal overflow-hidden">
              <div className="flex items-start justify-center">
                {visibleOffsets.map((offset) => {
                  const itemIndex = wrap(activeIndex + offset);
                  const item = DATA[itemIndex];
                  const isActive = offset === 0;
                  const absOffset = Math.abs(offset);
                  const isAdjacent = absOffset === 1;
                  const isVisible = absOffset <= 2;

                  return (
                    <button
                      key={`${item.id}-${offset}`}
                      type="button"
                      onClick={() => {
                        if (offset !== 0) setActiveIndex((prev) => prev + offset);
                      }}
                      aria-label={t(item.titleKey)}
                      aria-pressed={isActive}
                      className={clsx(
                        "shrink-0 px-3 lg:px-4 text-left transition-all duration-300",
                        "flex flex-col",
                        isActive
                          ? "opacity-100"
                          : isAdjacent
                            ? "opacity-35"
                            : isVisible
                              ? "opacity-15"
                              : "opacity-0 pointer-events-none"
                      )}
                      style={{ width: "clamp(260px, 28vw, 420px)" }}
                    >
                      <h3
                        className={clsx(
                          "font-serif mb-4",
                          isActive
                            ? "text-2xl lg:text-3xl text-primary"
                            : isAdjacent
                              ? "text-lg lg:text-xl text-white/60"
                              : "text-base text-white/40"
                        )}
                      >
                        <StableLocaleText tKey={item.titleKey} fill className="text-inherit" />
                      </h3>
                      <div
                        className={clsx(
                          "relative overflow-hidden",
                          !isActive && (isAdjacent ? "max-h-44" : "max-h-28")
                        )}
                        style={
                          !isActive
                            ? {
                                WebkitMaskImage:
                                  "linear-gradient(to bottom, black 60%, transparent 100%)",
                                maskImage:
                                  "linear-gradient(to bottom, black 60%, transparent 100%)",
                              }
                            : undefined
                        }
                      >
                        <p
                          className={clsx(
                            "font-light leading-relaxed",
                            isActive
                              ? "text-sm lg:text-base text-white/70"
                              : "text-xs lg:text-sm text-white/50"
                          )}
                        >
                          <StableLocaleText tKey={item.textKey} fill className="text-inherit" />
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Separator + dots */}
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mx-auto mt-10 mb-6" />
            <div className="flex items-center justify-center gap-2">
              {DATA.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex((prev) => prev + getShortestLoopOffset(i))}
                  aria-label={t(item.titleKey)}
                  className={clsx(
                    "rounded-full transition-all duration-300 cursor-pointer",
                    i === activeWrappedIndex
                      ? "w-6 h-1.5 bg-primary"
                      : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

    </SectionWrapper>
  );
}
