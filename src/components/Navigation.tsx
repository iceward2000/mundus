"use client";

import { useLayoutEffect, useRef, useState, useCallback, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SECTIONS } from "@/lib/constants";
import clsx from "clsx";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import MusicPlayer from "@/components/MusicPlayer";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function Navigation() {
  const [activeId, setActiveId] = useState<string>("");
  const navRef = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Derived states for different modes
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setActiveId(SECTIONS[0].id);
    // Check if page is already scrolled on mount
    const isScrolled = window.scrollY > 100;
    if (isScrolled) {
      setTransitionProgress(1);
    }
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

  const handleScrollTo = useCallback((id: string) => {
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
              aria-label={`Scroll to ${section.label}`}
            >
              {activeId === section.id && (
                <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-50" />
              )}
            </button>
          ))}
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

  return (
    <>
      <nav
        ref={navRef}
        className="fixed z-50 top-1/2 left-0 w-full pointer-events-none mix-blend-exclusion -translate-y-1/2"
      >
        {/* Navigation list */}
        <ul 
          className={clsx(
            "relative flex flex-col w-full items-start transition-none",
            isAnimating ? "pointer-events-none" : "pointer-events-auto"
          )}
          style={{ paddingLeft: `${contentPadding}px` }}
        >
          {SECTIONS.map((section, index) => {
            const isActive = activeId === section.id;
            
            // Staggered animation for each item
            // We use a fixed duration for each item's animation (in normalized 0-1 time) to ensure consistent speed.
            // Total time approx 2.0s. 
            // Normalized stagger: 0.075 (~0.15s real time)
            // Normalized duration: 0.5 (~1.0s real time)
            // Last item ends at: 6 * 0.075 + 0.5 = 0.95 (fits in 0-1)
            
            const staggerDelay = index * 0.075;
            const itemDuration = 0.5;
            const itemProgress = Math.max(0, Math.min(1, (transitionProgress - staggerDelay) / itemDuration));
            
            // Individual item transforms
            // Start (0): Center (50vw - 50% shift to center item)
            // End (1): Left aligned (with padding) and moved to bottom
            
            const itemScale = lerp(1.1, 1, itemProgress);
            
            // Vertical movement: 
            // Center mode: 0 (relative to vertically centered container)
            // Sidebar mode: Move down to bottom-left (~35vh down)
            const verticalOffset = lerp(0, 35, itemProgress); // 0vh -> 35vh

            // Spacing between items: Constant now for better UX
            const itemMargin = 24;
            
            // Label (01, 02, etc) - REMOVED
            // const labelSize = lerp(16, 12, itemProgress);
            // const labelOpacity = lerp(0.5, 0.7, itemProgress);
            
            // Line indicator - fades out during transition
            const lineOpacity = lerp(1, 0, itemProgress);
            const lineWidth = isActive ? lerp(48, 0, itemProgress) : 0;
            
            // Title - always visible now
            const titleOpacity = 1;
            const titleTranslateX = 0;
            
            // Active dot indicator - appears in sidebar mode
            const dotOpacity = isActive ? bgProgress : 0;

            return (
              <li
                key={section.id}
                className="nav-item relative will-change-transform"
                style={{
                  transform: `translateX(calc((50vw - 50%) * ${1 - itemProgress})) translateY(${verticalOffset}vh) scale(${itemScale})`,
                  marginBottom: `${itemMargin}px`,
                }}
              >
                {/* Active indicator dot for sidebar mode */}
                <span
                  className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary transition-transform duration-300"
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
                    isActive ? "text-primary font-extrabold" : "text-neutral-400 hover:text-white font-bold"
                  )}
                >
                  {/* Section number/label - REMOVED */}
                  {/* <span 
                    className="font-serif italic tracking-wide transition-all duration-300 min-w-[2rem]"
                    style={{ 
                      fontSize: `${labelSize}px`,
                      opacity: labelOpacity,
                    }}
                  >
                    {section.label}
                  </span> */}

                  {/* Center mode: Line indicator */}
                  <span
                    className="h-[1px] bg-current transition-all duration-300"
                    style={{
                      width: `${lineWidth}px`,
                      opacity: lineOpacity,
                    }}
                  />

                  {/* Title - slides in during transition */}
                  <span
                    className="font-medium tracking-wide text-sm uppercase whitespace-nowrap"
                    style={{
                      opacity: titleOpacity,
                      transform: `translateX(${titleTranslateX}px)`,
                    }}
                  >
                    {section.title}
                  </span>
                </button>
              </li>
            );
          })}
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
            Scroll
          </span>
        </div>
      </nav>

      {/* Percentage Counter - Fixed top right */}
      {!isMobile && (
        <div className="fixed top-8 right-8 z-50 mix-blend-difference pointer-events-none flex items-center gap-6">
          <MusicPlayer />
          <div className="flex items-baseline gap-1 font-serif text-primary/80">
            <span ref={counterRef} className="text-4xl font-light tabular-nums leading-none">0</span>
            <span className="text-sm opacity-60">%</span>
          </div>
        </div>
      )}
    </>
  );
}
