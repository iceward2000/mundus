"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Prevent browsers from restoring previous scroll position on refresh.
    const supportsManualRestoration =
      typeof window !== "undefined" && "scrollRestoration" in window.history;
    const previousRestoration = supportsManualRestoration
      ? window.history.scrollRestoration
      : null;

    if (supportsManualRestoration) {
      window.history.scrollRestoration = "manual";
    }

    const resetScrollTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    resetScrollTop();
    const rafId = window.requestAnimationFrame(resetScrollTop);

    return () => {
      window.cancelAnimationFrame(rafId);
      if (supportsManualRestoration && previousRestoration) {
        window.history.scrollRestoration = previousRestoration;
      }
    };
  }, []);

  useEffect(() => {
    // Only enable Lenis on devices with fine pointers (mouse) to avoid
    // interfering with native touch scrolling on mobile.
    const isDesktop = window.matchMedia("(pointer: fine)").matches;

    if (!isDesktop) return;

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
    };
  }, []);

  return <>{children}</>;
}
