"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionWrapper from "../SectionWrapper";

gsap.registerPlugin(ScrollTrigger);

export default function Differentiators() {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      
      if (isDesktop) {
        ScrollTrigger.create({
          trigger: "#differentiators",
          start: "top top",
          end: "bottom bottom",
          pin: ".diff-visual",
          scrub: true,
        });
      }

      const items = gsap.utils.toArray<HTMLLIElement>(".diff-item");
      
      items.forEach((item) => {
        gsap.from(item, {
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
          x: -50,
          opacity: 0,
          duration: 0.8,
        });
      });
    }, listRef);

    return () => ctx.revert();
  }, []);

  return (
    <SectionWrapper id="differentiators" className="grid md:grid-cols-2 gap-12 items-start bg-white/5">
      <div className="diff-visual order-2 md:order-1 relative h-[50vh] md:h-screen w-full sticky top-0 flex items-center justify-center overflow-hidden">
         {/* Visual */}
         <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-black to-black opacity-50" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] font-serif opacity-5 select-none">
            &
         </div>
         <div className="relative z-20 w-64 h-64 rounded-full border border-white/10 backdrop-blur-md flex items-center justify-center">
            <div className="w-48 h-48 rounded-full bg-primary/10 animate-pulse" />
         </div>
      </div>
      
      <div className="order-1 md:order-2 py-20 md:py-40">
        <span className="text-primary text-sm tracking-widest uppercase">03 / Why Us</span>
        <h2 className="text-4xl md:text-5xl font-serif mt-4 mb-12">The Mundus Edge</h2>
        
        <ul ref={listRef} className="space-y-16">
          {[
            { title: "Global Network Access", desc: "Direct lines to the world's most exclusive distributors." },
            { title: "Data-Driven Insights", desc: "Proprietary analytics that predict market shifts before they happen." },
            { title: "Sustainable Practices", desc: "Building brands that respect the earth and the craft." },
            { title: "Artisan Partnership", desc: "Connecting you with the masters of distillation." }
          ].map((item, i) => (
            <li key={i} className="diff-item flex flex-col gap-2 border-b border-white/10 pb-8">
              <span className="text-primary text-sm mb-2">0{i + 1}</span>
              <h3 className="text-2xl md:text-3xl font-light">{item.title}</h3>
              <p className="text-white/50 max-w-md">{item.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </SectionWrapper>
  );
}
