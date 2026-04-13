"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const supportsHistory = typeof window.history.scrollRestoration === "string";
    const previousScrollRestoration = supportsHistory
      ? window.history.scrollRestoration
      : null;

    if (supportsHistory) {
      // Prevent browsers from restoring the previous scroll position on reload.
      window.history.scrollRestoration = "manual";
    }

    // Keep hash-based deep links working; otherwise always start from top.
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }

    // Only enable Lenis on devices with fine pointers (mouse) to avoid
    // interfering with native touch scrolling on mobile.
    const isDesktop = window.matchMedia("(pointer: fine)").matches;

    if (!isDesktop) {
      return () => {
        if (supportsHistory && previousScrollRestoration) {
          window.history.scrollRestoration = previousScrollRestoration;
        }
      };
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Synchronize Lenis scroll with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(raf);
      if (supportsHistory && previousScrollRestoration) {
        window.history.scrollRestoration = previousScrollRestoration;
      }
    };
  }, []);

  return <>{children}</>;
}
