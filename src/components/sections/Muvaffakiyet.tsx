"use client";

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import SectionWrapper from "../SectionWrapper";
import clsx from "clsx";
import { useLanguage } from "@/context/LanguageContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Muvaffakiyet() {
  const { t, lang } = useLanguage();

  const DATA = useMemo(() => [
    { id: "kim", title: t("muvaffakiyet.kim.title"), text: t("muvaffakiyet.kim.text") },
    { id: "neden", title: t("muvaffakiyet.neden.title"), text: t("muvaffakiyet.neden.text") },
    { id: "nasil", title: t("muvaffakiyet.nasil.title"), text: t("muvaffakiyet.nasil.text") },
    { id: "ne", title: t("muvaffakiyet.ne.title"), text: t("muvaffakiyet.ne.text") },
    { id: "nerede", title: t("muvaffakiyet.nerede.title"), text: t("muvaffakiyet.nerede.text") },
    { id: "ne-zaman", title: t("muvaffakiyet.neZaman.title"), text: t("muvaffakiyet.neZaman.text") },
  ], [t, lang]);

  const TOTAL = DATA.length;

  function wrap(i: number) {
    return ((i % TOTAL) + TOTAL) % TOTAL;
  }

  function getVisibleItems(activeIndex: number, count: number) {
    const half = Math.floor(count / 2);
    return Array.from({ length: count }, (_, i) => {
      const offset = i - half;
      return { offset, dataIndex: wrap(activeIndex + offset) };
    });
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const dragStartX = useRef(0);
  const justSwiped = useRef(false);
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);
  const [mobileCanScroll, setMobileCanScroll] = useState({
    left: false,
    right: true,
  });

  const updateMobileScrollState = useCallback(() => {
    const el = mobileScrollRef.current;
    if (!el) return;

    const threshold = 6;
    setMobileCanScroll({
      left: el.scrollLeft > threshold,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - threshold,
    });
  }, []);

  useEffect(() => {
    const el = mobileScrollRef.current;
    if (!el) return;

    updateMobileScrollState();
    const onScroll = () => updateMobileScrollState();
    const onResize = () => updateMobileScrollState();

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [updateMobileScrollState]);

  const navigate = (dir: number) => {
    setActiveIndex((prev) => wrap(prev + dir));
  };

  const handleMobileNavigate = (dir: 1 | -1) => {
    const el = mobileScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const diff = dragStartX.current - e.clientX;
    if (Math.abs(diff) > 40) {
      justSwiped.current = true;
      navigate(diff > 0 ? 1 : -1);
      setTimeout(() => {
        justSwiped.current = false;
      }, 100);
    }
  };

  const handleItemClick = (offset: number) => {
    if (!justSwiped.current && offset !== 0) navigate(offset);
  };

  return (
    <SectionWrapper id="muvaffakiyet" className="py-20">
      <div className="w-full relative z-10">
        {/* Section header */}
        <div className="mb-12 md:mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-serif mt-4">
            {t("muvaffakiyet.title")}
          </h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">
            {t("muvaffakiyet.subtitle")}
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
              {DATA.map((item) => (
                <article
                  key={item.id}
                  className="w-full min-w-full shrink-0 snap-start text-center px-1"
                >
                  <div className="mx-auto max-w-2xl">
                    <h3 className="font-serif mb-3 text-2xl text-primary">{item.title}</h3>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => handleMobileNavigate(-1)}
                        disabled={!mobileCanScroll.left}
                        aria-label={lang === "tr" ? "Onceki" : "Previous"}
                        className={clsx(
                          "absolute left-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full border border-white/25 bg-black/45 text-white/85 backdrop-blur-sm transition-all",
                          "active:scale-95 disabled:cursor-default",
                          mobileCanScroll.left
                            ? "opacity-100"
                            : "opacity-40 border-white/10 text-white/40"
                        )}
                      >
                        <ChevronLeft className="h-4 w-4 mx-auto" />
                      </button>

                      <p className="font-light leading-relaxed text-sm text-white/70 px-10">
                        {item.text}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleMobileNavigate(1)}
                        disabled={!mobileCanScroll.right}
                        aria-label={lang === "tr" ? "Sonraki" : "Next"}
                        className={clsx(
                          "absolute right-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full border border-white/25 bg-black/45 text-white/85 backdrop-blur-sm transition-all",
                          "active:scale-95 disabled:cursor-default",
                          mobileCanScroll.right
                            ? "opacity-100"
                            : "opacity-40 border-white/10 text-white/40"
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

          {/* Desktop — 5 columns */}
          <div
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            className="hidden md:block touch-pan-y"
          >
            <div key={activeIndex} className="muvaffakiyet-content-reveal">
              <div className="grid grid-cols-[0.7fr_1fr_1.5fr_1fr_0.7fr] gap-5 lg:gap-8 items-start">
                {getVisibleItems(activeIndex, 5).map(({ offset, dataIndex }) => {
                  const isActive = offset === 0;
                  const isAdjacent = Math.abs(offset) === 1;
                  return (
                    <div
                      key={offset}
                      onClick={() => handleItemClick(offset)}
                      className={clsx(
                        "flex flex-col text-center cursor-pointer",
                        isActive
                          ? "opacity-100"
                          : isAdjacent
                            ? "opacity-30"
                            : "opacity-10"
                      )}
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
                        {DATA[dataIndex].title}
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
                          {DATA[dataIndex].text}
                        </p>
                      </div>
                    </div>
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
                  onClick={() => setActiveIndex(i)}
                  aria-label={item.title}
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
      </div>
    </SectionWrapper>
  );
}
