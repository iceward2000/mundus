"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import SectionWrapper from "../SectionWrapper";

const SERVICES = [
  { title: "Brand Strategy", desc: "Defining your core identity and market positioning." },
  { title: "Product Development", desc: "Crafting liquid excellence from concept to bottle." },
  { title: "Go-to-Market", desc: "Strategic launch planning for maximum impact." },
];

export default function Services() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".service-card", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
        },
        y: 100,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: "power3.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <SectionWrapper id="services" className="flex flex-col justify-center">
      <div ref={containerRef} className="w-full max-w-6xl mx-auto">
        <div className="mb-16">
           <span className="text-primary text-sm tracking-widest uppercase">02 / Expertise</span>
           <h2 className="text-4xl md:text-5xl font-serif mt-4">Holistic Guidance</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {SERVICES.map((service, idx) => (
            <div
              key={idx}
              className="service-card group p-8 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors duration-500 rounded-sm backdrop-blur-sm"
            >
              <div className="h-12 w-12 mb-6 rounded-full bg-gradient-to-tr from-primary/50 to-transparent group-hover:scale-110 transition-transform duration-500" />
              <h3 className="text-2xl font-serif mb-4">{service.title}</h3>
              <p className="text-white/60 leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
