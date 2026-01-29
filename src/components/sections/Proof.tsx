"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import SectionWrapper from "../SectionWrapper";

export default function Proof() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".proof-stat", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <SectionWrapper id="proof" className="bg-white/5">
      <div ref={containerRef} className="max-w-6xl mx-auto w-full">
        <div className="mb-16 text-center md:text-left">
           <span className="text-primary text-sm tracking-widest uppercase">05 / Impact</span>
           <h2 className="text-4xl md:text-5xl font-serif mt-4">Proven Results</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-12">
           {[
             { label: "Brands Launched", value: "50+" },
             { label: "Markets Entered", value: "12" },
             { label: "Revenue Generated", value: "$100M+" },
             { label: "Awards Won", value: "25" }
           ].map((stat, i) => (
             <div key={i} className="proof-stat text-center md:text-left">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-white/50 uppercase tracking-wider">{stat.label}</div>
             </div>
           ))}
        </div>
        
        <div className="mt-24 p-12 border border-white/10 bg-black/40 backdrop-blur-md rounded-sm relative">
           <div className="text-2xl md:text-3xl font-serif italic text-white/80 leading-relaxed">
             &quot;Mundus didn&apos;t just help us launch; they helped us define who we are. Their strategic insight is unmatched in the industry.&quot;
           </div>
           <div className="mt-8 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full" />
              <div>
                 <div className="font-bold">Elena Rossi</div>
                 <div className="text-sm text-primary">Founder, Vesper Spirits</div>
              </div>
           </div>
           <div className="absolute -top-6 -left-4 text-8xl text-primary/20 font-serif">“</div>
        </div>
      </div>
    </SectionWrapper>
  );
}
