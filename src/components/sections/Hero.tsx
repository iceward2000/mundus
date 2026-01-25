"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import SectionWrapper from "../SectionWrapper";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from(titleRef.current, {
        y: 100,
        opacity: 0,
        duration: 1.5,
        ease: "power4.out",
        delay: 0.5,
      })
      .from(subtitleRef.current, {
        y: 50,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      }, "-=1");

    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <SectionWrapper id="hero" className="items-center text-center">
      <div ref={containerRef} className="relative z-10 flex flex-col items-center">
        <h1
          ref={titleRef}
          className="font-serif text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60"
        >
          MUNDUS
        </h1>
        <p
          ref={subtitleRef}
          className="mt-6 text-lg md:text-xl font-light tracking-[0.2em] text-primary uppercase"
        >
          Beverage Business Consultancy
        </p>
        
        {/* Abstract Liquid Shape */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[600px] h-[600px] bg-gradient-to-tr from-primary/20 to-purple-900/20 rounded-full blur-[100px] animate-pulse" />
      </div>
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <span className="text-xs tracking-widest opacity-50">SCROLL</span>
      </div>
    </SectionWrapper>
  );
}
