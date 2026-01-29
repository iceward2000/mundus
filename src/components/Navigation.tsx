"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SECTIONS } from "@/lib/constants";
import clsx from "clsx";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import MusicPlayer from "@/components/MusicPlayer";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Easing function for smooth interpolation
const easeOutExpo = (t: number): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

export default function Navigation() {
  const [activeId, setActiveId] = useState<string>("");
  const navRef = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Derived states for different modes
  const [isSidebar, setIsSidebar] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);

  useEffect(() => {
    setActiveId(SECTIONS[0].id);

    // Main scroll trigger - switches mode based on threshold
    const morphTrigger = ScrollTrigger.create({
      trigger: "body",
      start: "top top-=100", // Trigger after 100px scroll
      end: "bottom bottom",
      onEnter: () => setIsSidebar(true),
      onLeaveBack: () => setIsSidebar(false),
    });

    // Global scroll percentage counter
    const progressTrigger = ScrollTrigger.create({
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

    return () => {
      morphTrigger.kill();
      progressTrigger.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [prefersReducedMotion]);

  // Animate transition between modes
  useEffect(() => {
    const targetProgress = isSidebar ? 1 : 0;
    
    // Animate the transitionProgress state
    const tween = gsap.to({}, {
      duration: 0.8,
      ease: "power2.inOut",
      onUpdate: function() {
        // Manually interpolate transitionProgress for smoother React updates
        // However, setting state in onUpdate is fine for this number of elements
        // We calculate the value based on the tween's progress
        const currentVal = isSidebar 
          ? this.progress() 
          : 1 - this.progress();
        // Since we can't easily get the 'value' from an empty object tween without a property
        // Let's use a proxy object
      }
    });
    
    // Better approach: tween a proxy object
    const proxy = { value: transitionProgress };
    gsap.to(proxy, {
      value: targetProgress,
      duration: 0.8,
      ease: "power3.inOut",
      onUpdate: () => {
        setTransitionProgress(proxy.value);
      }
    });

    return () => {
      gsap.killTweensOf(proxy);
    };
  }, [isSidebar]); // Removed transitionProgress from deps to avoid loop, but we need start value. 
  // Actually simpler: just let GSAP handle the value from current state.


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
  
  // Container position: center (50%) -> left (0%) for flush alignment
  const containerLeft = lerp(50, 0, transitionProgress);
  const containerTranslateX = lerp(-50, 0, transitionProgress);
  const containerTranslateY = lerp(-50, 0, transitionProgress); // -50% (center) to 0% (sidebar start)
  
  // Content padding: 0 -> 32px to offset text from left edge when docked
  const contentPadding = lerp(0, 32, transitionProgress);
  
  // Background opacity for sidebar (only visible after 60% progress)
  const bgProgress = Math.max(0, (transitionProgress - 0.6) / 0.4);
  const bgOpacity = lerp(0, 0.95, bgProgress);

  return (
    <>
      <nav
        ref={navRef}
        className="fixed z-50 top-1/2 pointer-events-none"
        style={{
          left: `${containerLeft}%`,
          transform: `translateX(${containerTranslateX}%) translateY(${containerTranslateY}%)`,
        }}
      >
        {/* Sidebar background - aligned to left edge */}
        <div 
          className="absolute -top-[50vh] -bottom-[50vh] left-0 w-64"
          style={{ 
            opacity: bgOpacity,
            background: `linear-gradient(90deg, 
              rgba(10,10,10,${bgOpacity}) 0%, 
              rgba(10,10,10,${bgOpacity * 0.8}) 60%,
              transparent 100%)`,
            backdropFilter: bgOpacity > 0.1 ? `blur(${12 * bgOpacity}px)` : 'none',
            WebkitBackdropFilter: bgOpacity > 0.1 ? `blur(${12 * bgOpacity}px)` : 'none',
          }}
        />

        {/* Navigation list */}
        <ul 
          className="relative flex flex-col pointer-events-auto"
          style={{ paddingLeft: `${contentPadding}px` }}
        >
          {SECTIONS.map((section, index) => {
            const isActive = activeId === section.id;
            
            // Staggered animation for each item
            const staggerDelay = index * 0.05;
            const itemProgress = Math.max(0, Math.min(1, (transitionProgress - staggerDelay) / (0.9 - staggerDelay)));
            
            // Individual item transforms
            const itemScale = lerp(1.1, 1, itemProgress);
            
            // Spacing between items: more generous in center, tighter in sidebar
            const itemMargin = lerp(20, 32, transitionProgress);
            
            // Label (01, 02, etc) - always visible but changes size
            const labelSize = lerp(16, 12, itemProgress);
            const labelOpacity = lerp(0.5, 0.7, itemProgress);
            
            // Line indicator - fades out during transition
            const lineOpacity = lerp(1, 0, itemProgress);
            const lineWidth = isActive ? lerp(48, 0, itemProgress) : 0;
            
            // Title - always visible now
            const titleOpacity = 1;
            const titleTranslateX = 0;
            
            // Subtitle - fades in later
            const subtitleProgress = Math.max(0, (itemProgress - 0.5) / 0.5);
            const subtitleOpacity = lerp(0, 0.5, subtitleProgress);
            
            // Active dot indicator - appears in sidebar mode
            const dotOpacity = isActive ? bgProgress : 0;

            return (
              <li
                key={section.id}
                className="nav-item relative"
                style={{
                  transform: `scale(${itemScale})`,
                  marginBottom: `${itemMargin}px`,
                }}
              >
                {/* Active indicator dot for sidebar mode */}
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary transition-transform duration-300"
                  style={{
                    opacity: dotOpacity,
                    left: `${contentPadding - 16}px`, // Adjust position relative to content padding
                    transform: `translateY(-50%) scale(${isActive ? 1 : 0})`,
                  }}
                />
                
                <button
                  onClick={() => handleScrollTo(section.id)}
                  className={clsx(
                    "group flex items-center gap-3 transition-colors duration-300 text-left",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg px-2 py-1 -mx-2 -my-1",
                    isActive ? "text-primary" : "text-white/40 hover:text-white/70"
                  )}
                >
                  {/* Section number/label */}
                  <span 
                    className="font-serif italic tracking-wide transition-all duration-300 min-w-[2rem]"
                    style={{ 
                      fontSize: `${labelSize}px`,
                      opacity: labelOpacity,
                    }}
                  >
                    {section.label}
                  </span>

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

                  {/* Separator dot */}
                  <span 
                    className="w-1 h-1 rounded-full bg-current"
                    style={{
                      opacity: subtitleOpacity * 0.5,
                    }}
                  />

                  {/* Subtitle */}
                  <span
                    className="text-xs font-light tracking-wider text-white/40 whitespace-nowrap"
                    style={{
                      opacity: subtitleOpacity,
                    }}
                  >
                    {section.subtitle}
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
            pointerEvents: !isSidebar ? 'auto' : 'none',
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
