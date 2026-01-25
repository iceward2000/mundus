"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SECTIONS } from "@/lib/constants";
import clsx from "clsx";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function Navigation() {
  const [isSidebar, setIsSidebar] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const navRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    // Initial active state
    setActiveId(SECTIONS[0].id);

    // ScrollTrigger for Nav Morphing
    // We want the nav to move to sidebar after scrolling past the hero (or a bit into it)
    const trigger = ScrollTrigger.create({
      trigger: "#hero",
      start: "bottom top+=20%", // When hero bottom passes 20% from top
      end: "bottom top",
      onLeave: () => setIsSidebar(true),
      onEnterBack: () => setIsSidebar(false),
    });

    // ScrollTrigger for Active Section Highlighting
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
      trigger.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const handleScrollTo = (id: string) => {
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
  };

  // Mobile Nav (Simplified)
  if (isMobile) {
    return (
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
        <div className="flex gap-4">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => handleScrollTo(section.id)}
              className={clsx(
                "w-2 h-2 rounded-full transition-all duration-300",
                activeId === section.id ? "bg-primary scale-125" : "bg-white/20"
              )}
              aria-label={`Scroll to ${section.label}`}
            />
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav
      ref={navRef}
      className={clsx(
        "fixed z-50 transition-all duration-700 ease-in-out",
        isSidebar
          ? "top-0 left-0 h-screen w-64 flex flex-col justify-center pl-8 border-r border-white/5 bg-black/20 backdrop-blur-sm"
          : "top-8 left-1/2 -translate-x-1/2 w-auto flex flex-row items-center justify-center bg-transparent"
      )}
    >
      <ul
        className={clsx(
          "flex gap-6 transition-all duration-700",
          isSidebar ? "flex-col items-start gap-4" : "flex-row items-center"
        )}
      >
        {SECTIONS.map((section) => (
          <li key={section.id} className="group relative">
            <button
              onClick={() => handleScrollTo(section.id)}
              className={clsx(
                "flex items-center gap-3 text-sm tracking-widest uppercase transition-colors duration-300",
                activeId === section.id ? "text-primary" : "text-white/40 hover:text-white"
              )}
            >
              <span className="font-serif italic opacity-50 text-xs">
                {section.label}
              </span>
              <span
                className={clsx(
                  "font-bold transition-all duration-500",
                  isSidebar ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 hidden"
                )}
              >
                {section.title}
              </span>
              
              {/* Center mode indicator */}
              {!isSidebar && (
                <span
                  className={clsx(
                    "block h-[1px] bg-current transition-all duration-300",
                    activeId === section.id ? "w-8" : "w-0 group-hover:w-4"
                  )}
                />
              )}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
