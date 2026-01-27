"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionWrapper from "../SectionWrapper";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Initial entrance animation
      const tl = gsap.timeline();

      tl.from(titleRef.current, {
        y: 120,
        opacity: 0,
        duration: 1.8,
        ease: "power4.out",
        delay: 0.3,
      })
      .from(subtitleRef.current, {
        y: 60,
        opacity: 0,
        duration: 1.4,
        ease: "power3.out",
      }, "-=1.2")
      .from(decorRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 2,
        ease: "power2.out",
      }, "-=1.4");

      // Parallax scroll effect for hero content
      ScrollTrigger.create({
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;
          
          // Move title up and fade out faster
          gsap.set(titleRef.current, {
            y: progress * -150,
            opacity: 1 - progress * 1.5,
          });
          
          // Subtitle follows with slight delay
          gsap.set(subtitleRef.current, {
            y: progress * -100,
            opacity: 1 - progress * 1.8,
          });

          // Decorative element scales and fades
          gsap.set(decorRef.current, {
            scale: 1 + progress * 0.3,
            opacity: 1 - progress * 1.2,
          });
        },
      });

    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <SectionWrapper id="hero" className="items-center text-center relative overflow-hidden">
      {/* Main content - positioned to work with centered nav */}
      <div ref={containerRef} className="relative z-10 flex flex-col items-center pt-[45vh]">
        <h1
          ref={titleRef}
          className="font-serif text-6xl md:text-8xl lg:text-[10rem] xl:text-[12rem] font-bold tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/50 leading-[0.85]"
        >
          MUNDUS
        </h1>
        <p
          ref={subtitleRef}
          className="mt-8 text-base md:text-lg lg:text-xl font-light tracking-[0.25em] text-primary/90 uppercase"
        >
          Beverage Business Consultancy
        </p>
      </div>

      {/* Decorative background elements */}
      <div 
        ref={decorRef}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        {/* Primary glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/15 via-primary/5 to-transparent rounded-full blur-[120px]" />
        
        {/* Secondary accent glow */}
        <div className="absolute top-[60%] left-[30%] w-[500px] h-[500px] bg-gradient-radial from-purple-900/20 via-purple-900/5 to-transparent rounded-full blur-[100px] animate-pulse-slow" />
        
        {/* Tertiary accent */}
        <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-gradient-radial from-amber-900/15 via-amber-900/5 to-transparent rounded-full blur-[80px] animate-pulse-slower" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </SectionWrapper>
  );
}
