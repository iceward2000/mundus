"use client";

import SectionWrapper from "../SectionWrapper";

export default function Footer() {
  return (
    <SectionWrapper id="contact" className="items-center justify-center text-center min-h-[70vh]">
      <div className="max-w-3xl mx-auto space-y-8">
        <span className="text-primary text-sm tracking-widest uppercase">06 / Contact</span>
        <h2 className="text-5xl md:text-7xl font-serif leading-tight">
          Ready to Elevate <br /> Your Brand?
        </h2>
        <p className="text-white/60 text-lg max-w-xl mx-auto">
          Let's craft the future of spirits together. Schedule a consultation to begin your journey.
        </p>
        
        <div className="pt-8">
          <button className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full border border-white/20 hover:border-primary transition-colors duration-300">
             <span className="relative z-10 text-lg tracking-widest uppercase group-hover:text-black transition-colors duration-300">Start Project</span>
             <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
          </button>
        </div>
      </div>
      
      <footer className="absolute bottom-8 w-full text-center text-xs text-white/30 uppercase tracking-widest">
        © {new Date().getFullYear()} Mundus Consultancy. All Rights Reserved.
      </footer>
    </SectionWrapper>
  );
}
