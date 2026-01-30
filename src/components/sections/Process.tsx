"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import SectionWrapper from "../SectionWrapper";

export default function Process() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Horizontal scroll simulation or simple vertical reveal
      // For this single page vertical scroll, let's do a vertical timeline reveal
      
      gsap.from(".process-step", {
        scrollTrigger: {
          trigger: trackRef.current,
          start: "top 70%",
        },
        y: 50,
        opacity: 0,
        stagger: 0.3,
        duration: 1,
      });
      
      gsap.to(".process-line", {
        scrollTrigger: {
          trigger: trackRef.current,
          start: "top 60%",
          end: "bottom 60%",
          scrub: 1,
        },
        height: "100%",
        ease: "none",
      });
      
    }, trackRef);

    return () => ctx.revert();
  }, []);

  return (
    <SectionWrapper id="process" className="flex flex-col items-center">
      <div className="text-center mb-20 relative z-10">
        <span className="text-primary text-sm tracking-widest uppercase">04 / Process</span>
        <h2 className="text-4xl md:text-5xl font-serif mt-4">The Journey</h2>
      </div>

      <div ref={trackRef} className="relative w-full max-w-3xl z-10">
        <div className="process-line absolute left-[15px] md:left-1/2 top-0 w-[1px] bg-primary h-0 -translate-x-1/2" />
        
        {[
          { title: "Discovery", desc: "Unearthing the roots of your vision." },
          { title: "Strategy", desc: "Charting the course through market complexities." },
          { title: "Execution", desc: "Bringing the liquid to life with precision." },
          { title: "Growth", desc: "Scaling with integrity and momentum." }
        ].map((step, i) => (
          <div key={i} className={`process-step relative flex flex-col md:flex-row gap-8 mb-16 ${i % 2 === 0 ? 'md:text-right' : 'md:flex-row-reverse md:text-left'}`}>
            <div className={`flex-1 ${i % 2 === 0 ? 'md:pr-12' : 'md:pl-12'} pl-12 md:pl-0`}>
              <h3 className="text-2xl font-serif text-white mb-2">{step.title}</h3>
              <p className="text-white/60">{step.desc}</p>
            </div>
            
            <div className="absolute left-0 md:left-1/2 -translate-x-[4px] md:-translate-x-1/2 w-8 h-8 flex items-center justify-center bg-black border border-primary rounded-full z-10">
               <div className="w-2 h-2 bg-primary rounded-full" />
            </div>
            
            <div className="flex-1 hidden md:block" />
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
