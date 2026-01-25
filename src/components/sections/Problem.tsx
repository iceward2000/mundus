"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionWrapper from "../SectionWrapper";

export default function Problem() {
  const textRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(textRef.current, {
        scrollTrigger: {
          trigger: textRef.current,
          start: "top 80%",
          end: "bottom 20%",
          scrub: 1,
        },
        y: 100,
        opacity: 0.5,
      });
      
      gsap.to(visualRef.current, {
        scrollTrigger: {
          trigger: visualRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
        y: -100,
        rotation: 10,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <SectionWrapper id="problem" className="grid md:grid-cols-2 gap-12 items-center">
      <div ref={textRef} className="space-y-8">
        <span className="text-primary text-sm tracking-widest uppercase">01 / The Reality</span>
        <h2 className="text-4xl md:text-6xl font-serif font-medium leading-tight">
          The Market is <span className="italic text-white/60">Saturated.</span>
        </h2>
        <p className="text-lg text-white/70 max-w-md leading-relaxed">
          In a world of infinite choice, quality alone is no longer a differentiator. 
          Brands without a soul fade into the background noise. You need more than a product; 
          you need a legacy.
        </p>
      </div>

      <div ref={visualRef} className="relative h-[400px] w-full flex items-center justify-center">
        {/* Abstract Visual */}
        <div className="w-64 h-64 border border-white/20 rounded-full relative overflow-hidden backdrop-blur-sm">
           <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/30 rounded-full blur-2xl" />
        </div>
        <div className="absolute top-10 right-10 w-20 h-20 border border-primary/30 rounded-full" />
      </div>
    </SectionWrapper>
  );
}
