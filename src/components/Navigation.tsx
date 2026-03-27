"use client";

import { useLayoutEffect, useRef, useState, useCallback, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SECTIONS } from "@/lib/constants";
import clsx from "clsx";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useLanguage, type Lang, type TranslationKey } from "@/context/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function Navigation() {
  const [activeId, setActiveId] = useState<string>("");
  const navRef = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();
  const { lang, setLang, t } = useLanguage();

  const [playing, setPlaying] = useState(false);
  const [showAudioToggle, setShowAudioToggle] = useState(false);

  const LANG_LABELS: Record<Lang, string> = { tr: "TÜRKÇE", en: "ENGLISH" };
  const nextLang: Lang = lang === "tr" ? "en" : "tr";
  const langLabel = LANG_LABELS[nextLang];

  // Derived states for different modes
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const isSidebarMode = transitionProgress > 0.95;

  useEffect(() => {
    setActiveId(SECTIONS[0].id);
    const isScrolled = window.scrollY > 100;
    if (isScrolled) {
      setTransitionProgress(1);
    }
  }, []);

  // ── Audio toggle logic ──────────────────────────────────────────────────
  const toggleAudio = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
    } else {
      window.dispatchEvent(new Event("mundus-global-audio-activate"));
      a.volume = 0.5;
      a.play().catch(console.error);
    }
    setPlaying((p) => !p);
  }, [playing]);

  const handleAudioKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleAudio();
      }
    },
    [toggleAudio]
  );

  useEffect(() => {
    const desktop =
      window.matchMedia("(pointer: fine)").matches && window.innerWidth >= 768;
    if (!desktop) return;

    const verified = sessionStorage.getItem("mundus-age-verified") === "true";
    if (verified) {
      setShowAudioToggle(true);
    } else {
      const handle = () => setShowAudioToggle(true);
      window.addEventListener("mundus-entered", handle);
      return () => window.removeEventListener("mundus-entered", handle);
    }
  }, []);

  useEffect(() => {
    const onVideoAudioActivate = () => {
      const a = audioRef.current;
      if (!a) return;
      a.pause();
      setPlaying(false);
    };

    window.addEventListener("mundus-video-audio-activate", onVideoAudioActivate);
    return () => {
      window.removeEventListener("mundus-video-audio-activate", onVideoAudioActivate);
    };
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const proxy = { value: transitionProgress };

      // If we start scrolled, ensure we start at the end state visually
      if (window.scrollY > 100) {
        proxy.value = 1;
        setTransitionProgress(1);
      }

      function animateToState(targetVal: number) {
        gsap.to(proxy, {
          value: targetVal,
          duration: 1.0, // Fixed fast duration
          ease: "power3.inOut",
          onStart: () => setIsAnimating(true),
          onUpdate: () => {
            setTransitionProgress(proxy.value);
          },
          onComplete: () => setIsAnimating(false)
        });
      }

      // 1. Pinning Trigger - Pins the hero section but does NOT scrub the animation
      ScrollTrigger.create({
        trigger: "body",
        start: "top top-=1", // Add a tiny offset so it doesn't trigger immediately at 0
        end: "+=500", // Distance to hold the pin
        pin: "#hero",
        scrub: false, // Don't scrub, we use callbacks to trigger animation
        onEnter: () => {
          // Trigger animation to sidebar only when we actually cross the start threshold
          animateToState(1);
        },
        onLeaveBack: () => {
          // Trigger animation back to center
          animateToState(0);
        }
      });
    });

    return () => ctx.revert();
  }, []); // Run once on mount


  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Global scroll percentage counter
      ScrollTrigger.create({
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          if (counterRef.current) {
            counterRef.current.innerText = Math.round(self.progress * 100).toString();
          }
        },
      });

      // Active section highlighting
      SECTIONS.forEach((section) => {
        ScrollTrigger.create({
          trigger: `#${section.id}`,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => {
            if (self.isActive) {
              setActiveId(section.id);
            }
          },
        });
      });
    });
    return () => ctx.revert();
  }, []);

  // Close accordion when leaving sidebar mode
  useEffect(() => {
    if (transitionProgress < 0.5) {
      setIsAccordionOpen(false);
    }
  }, [transitionProgress]);

  // Close accordion on outside click or ESC key
  useEffect(() => {
    if (!isAccordionOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsAccordionOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsAccordionOpen(false);
      }
    };

    const timeout = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 10);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAccordionOpen]);

  const handleScrollTo = useCallback((id: string) => {
    setIsAccordionOpen(false);
    if (prefersReducedMotion) {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: "auto" });
      return;
    }

    gsap.to(window, {
      duration: 1.5,
      scrollTo: { y: `#${id}`, autoKill: false },
      ease: "power3.inOut",
    });
  }, [prefersReducedMotion]);

  // Mobile Navigation - Bottom pill with dots
  if (isMobile) {
    return (
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black/90 backdrop-blur-lg px-5 py-3 rounded-full border border-white/10 shadow-2xl shadow-black/50">
        <div className="flex gap-3 items-center">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => handleScrollTo(section.id)}
              className={clsx(
                "relative w-2.5 h-2.5 rounded-full transition-all duration-300",
                activeId === section.id
                  ? "bg-primary scale-125"
                  : "bg-white/20 hover:bg-white/40"
              )}
              aria-label={t(`nav.${section.id}` as TranslationKey)}
            >
              {activeId === section.id && (
                <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-50" />
              )}
            </button>
          ))}

          <span className="w-px h-3 bg-white/10 mx-0.5" />

          <LanguageToggle variant="nav" />
        </div>
      </nav>
    );
  }

  // Calculate interpolated values based on scroll progress
  const lerp = (start: number, end: number, t: number) => start + (end - start) * t;
  
  // Container position: fixed left-0, vertically centered
  // We remove the container-level horizontal translation to stagger items individually
  
  // Content padding: 0 -> 32px to offset text from left edge when docked
  const contentPadding = lerp(0, 32, transitionProgress);
  
  // Background opacity for sidebar (only visible after 60% progress)
  const bgProgress = Math.max(0, (transitionProgress - 0.6) / 0.4);
  const bgOpacity = lerp(0, 0.95, bgProgress);

  // Sidebar vertical target — how far below center the items dock
  const sidebarVH = 28;

  // First item's transition progress (for accordion toggle positioning)
  const firstItemProgress = Math.max(0, Math.min(1, transitionProgress / 0.5));

  return (
    <>
      <nav
        ref={navRef}
        className="fixed z-50 top-1/2 left-0 pointer-events-none mix-blend-difference -translate-y-1/2"
      >
        {/* Sidebar Accordion Toggle — only mounted near/in sidebar mode */}
        {transitionProgress > 0.8 && (
          <div
            className="absolute top-0 z-10"
            style={{
              left: `${contentPadding}px`,
              transform: `translateX(calc((50vw - 50%) * ${1 - firstItemProgress})) translateY(calc(${lerp(0, sidebarVH, firstItemProgress)}vh - 2.5rem))`,
              opacity: isSidebarMode ? 1 : 0,
              visibility: isSidebarMode ? 'visible' : 'hidden',
              pointerEvents: isSidebarMode ? 'auto' : 'none',
              transition: 'opacity 0.4s cubic-bezier(0.19, 1, 0.22, 1), visibility 0.4s',
            }}
          >
            <button
              onClick={() => setIsAccordionOpen(prev => !prev)}
              className={clsx(
                "group flex items-center justify-center",
                "min-w-[48px] min-h-[48px] w-12 h-12 -m-2 p-2",
                "text-white/70 hover:text-white transition-colors duration-300",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-xl",
                "touch-manipulation"
              )}
              aria-label={isAccordionOpen ? t("nav.close") : t("nav.open")}
              aria-expanded={isAccordionOpen}
            >
              <div className="relative w-6 h-6 flex-shrink-0">
                <span
                  className={clsx(
                    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[2px] bg-current transition-all duration-300 ease-[cubic-bezier(0.19,1,0.22,1)]",
                    isAccordionOpen ? "w-4 rotate-45" : "w-6"
                  )}
                />
                <span
                  className={clsx(
                    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[2px] bg-current transition-all duration-300 ease-[cubic-bezier(0.19,1,0.22,1)]",
                    isAccordionOpen ? "w-4 -rotate-45 opacity-100" : "w-0 opacity-0"
                  )}
                />
              </div>
            </button>
          </div>
        )}

        {/* Navigation list */}
        <ul 
          className={clsx(
            "relative flex flex-col w-fit items-start transition-none",
            isAnimating ? "pointer-events-none" : "pointer-events-auto"
          )}
          style={{ paddingLeft: `${contentPadding}px` }}
        >
          {SECTIONS.map((section, index) => {
            const isActive = activeId === section.id;

            const totalNavItems = SECTIONS.length + 1;
            const itemDuration = 0.5;
            const staggerStep = (1 - itemDuration) / (totalNavItems - 1);
            const staggerDelay = index * staggerStep;
            const itemProgress = Math.max(0, Math.min(1, (transitionProgress - staggerDelay) / itemDuration));

            const itemScale = lerp(1.1, 1, itemProgress);
            const verticalOffset = lerp(0, sidebarVH, itemProgress);
            const itemMargin = 24;

            const lineOpacity = lerp(1, 0, itemProgress);
            const lineWidth = isActive ? lerp(48, 0, itemProgress) : 0;
            const titleOpacity = 1;
            const titleTranslateX = 0;
            const dotOpacity = isActive ? bgProgress : 0;

            return (
              <li
                key={section.id}
                className="nav-item relative will-change-transform"
                style={{
                  transform: `translateX(calc((50vw - 50%) * ${1 - itemProgress})) translateY(${verticalOffset}vh) scale(${itemScale})`,
                  marginBottom: `${itemMargin}px`,
                  ...(isSidebarMode ? {
                    opacity: isAccordionOpen ? 1 : 0,
                    transition: `opacity 0.35s cubic-bezier(0.19, 1, 0.22, 1) ${isAccordionOpen ? index * 60 : (SECTIONS.length - 1 - index) * 30}ms`,
                    pointerEvents: (isAccordionOpen ? 'auto' : 'none') as React.CSSProperties['pointerEvents'],
                  } : {}),
                }}
              >
                <span
                  className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white transition-transform duration-300"
                  style={{
                    opacity: dotOpacity,
                    left: "-16px",
                    transform: `translateY(-50%) scale(${isActive ? 1 : 0})`,
                  }}
                />

                <button
                  onClick={() => handleScrollTo(section.id)}
                  className={clsx(
                    "group flex items-center gap-3 transition-colors duration-300 text-left",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg px-2 py-1 -mx-2 -my-1",
                    isActive ? "text-white font-black" : "text-neutral-400 hover:text-white font-extrabold"
                  )}
                >
                  <span
                    className="h-[1px] bg-current transition-all duration-300"
                    style={{
                      width: `${lineWidth}px`,
                      opacity: lineOpacity,
                    }}
                  />

                  <span
                    className="tracking-wide text-sm uppercase whitespace-nowrap"
                    style={{
                      opacity: titleOpacity,
                      transform: `translateX(${titleTranslateX}px)`,
                    }}
                  >
                    {t(`nav.${section.id}` as TranslationKey)}
                  </span>
                </button>
              </li>
            );
          })}

          {/* Language switcher — last nav item, identical structure to section items */}
          {(() => {
            const langIndex = SECTIONS.length;
            const totalNavItems = SECTIONS.length + 1;
            const itemDuration = 0.5;
            const staggerStep = (1 - itemDuration) / (totalNavItems - 1);
            const staggerDelay = langIndex * staggerStep;
            const langProgress = Math.max(0, Math.min(1, (transitionProgress - staggerDelay) / itemDuration));
            const langScale = lerp(1.1, 1, langProgress);
            const langVertical = lerp(0, sidebarVH, langProgress);
            const langLineOpacity = lerp(1, 0, langProgress);

            return (
              <li
                className="nav-item relative will-change-transform"
                style={{
                  transform: `translateX(calc((50vw - 50%) * ${1 - langProgress})) translateY(${langVertical}vh) scale(${langScale})`,
                  marginBottom: 0,
                  ...(isSidebarMode ? {
                    opacity: isAccordionOpen ? 1 : 0,
                    transition: `opacity 0.35s cubic-bezier(0.19, 1, 0.22, 1) ${isAccordionOpen ? langIndex * 60 : 0}ms`,
                    pointerEvents: (isAccordionOpen ? 'auto' : 'none') as React.CSSProperties['pointerEvents'],
                  } : {}),
                }}
              >
                <button
                  onClick={() => setLang(nextLang)}
                  className={clsx(
                    "group flex items-center gap-3 transition-colors duration-300 text-left",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg px-2 py-1 -mx-2 -my-1",
                    "text-neutral-400 hover:text-white font-extrabold"
                  )}
                >
                  <span
                    className="h-[1px] bg-current transition-all duration-300"
                    style={{ width: 0, opacity: langLineOpacity }}
                  />
                  <span className="tracking-wide text-sm whitespace-nowrap">
                    {langLabel}
                  </span>
                </button>
              </li>
            );
          })()}
        </ul>

        {/* Scroll indicator - only visible in center mode */}
        <div 
          className="absolute -bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          style={{ 
            opacity: lerp(1, 0, transitionProgress * 2),
            pointerEvents: transitionProgress < 0.5 ? 'auto' : 'none',
          }}
        >
          <div className="relative w-5 h-8 border border-white/20 rounded-full overflow-hidden">
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-2 bg-white/50 rounded-full animate-bounce" />
          </div>
          <span className="text-[9px] tracking-[0.4em] uppercase text-white/30 font-light">
            {t("nav.scroll")}
          </span>
        </div>
      </nav>

      {/* Top-right HUD: audio toggle + scroll percentage — single aligned row */}
      {!isMobile && (
        <div className="fixed top-8 right-8 z-[70] pointer-events-none flex items-center gap-5">
          <audio ref={audioRef} src="/audio/loop.mp3" loop preload="auto" />

          {showAudioToggle && (
            <button
              className="relative flex items-center justify-center w-12 h-6 focus:outline-none cursor-pointer pointer-events-auto shrink-0"
              style={{ animation: "audioToggleReveal 0.5s ease-out both" }}
              onClick={toggleAudio}
              onKeyDown={handleAudioKeyDown}
              aria-label={playing ? "Müziği Durdur" : "Müziği Oynat"}
              tabIndex={0}
            >
              <div className="relative w-full h-full flex items-center overflow-hidden">
                {/* Flat line — paused state */}
                <div
                  className={`absolute left-0 right-0 h-[1px] bg-primary transition-all duration-300 ease-out ${
                    playing ? "opacity-0 scale-x-50" : "opacity-80 scale-x-100"
                  }`}
                />
                {/* Scrolling sine-wave — playing state */}
                <div
                  className={`absolute inset-0 bg-primary transition-opacity duration-300 ease-out ${
                    playing
                      ? "opacity-80 animate-audio-wave animate-mask-scroll"
                      : "opacity-0"
                  }`}
                  style={{
                    maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 24' fill='none' stroke='black' stroke-width='3'%3E%3Cpath d='M0 12 Q 25 2, 50 12 T 100 12' vector-effect='non-scaling-stroke' /%3E%3C/svg%3E")`,
                    WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 24' fill='none' stroke='black' stroke-width='3'%3E%3Cpath d='M0 12 Q 25 2, 50 12 T 100 12' vector-effect='non-scaling-stroke' /%3E%3C/svg%3E")`,
                    maskRepeat: "repeat-x",
                    WebkitMaskRepeat: "repeat-x",
                    maskSize: "50px 100%",
                    WebkitMaskSize: "50px 100%",
                  }}
                />
              </div>
            </button>
          )}

          <div className="flex items-baseline gap-1 font-serif text-[color:var(--foreground)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
            <span ref={counterRef} className="text-4xl font-light tabular-nums leading-none">0</span>
            <span className="text-sm opacity-70">%</span>
          </div>
        </div>
      )}

    </>
  );
}
