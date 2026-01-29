"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { Check } from "lucide-react";
import Image from "next/image";

export default function AgeVerificationOverlay() {
  const [isVerified, setIsVerified] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if previously verified
    const verified = sessionStorage.getItem("mundus-age-verified");
    if (verified === "true") {
      setShouldRender(false);
      return;
    }

    // Start background animation
    if (bgRef.current) {
      gsap.to(bgRef.current, {
        scale: 1.1,
        duration: 20,
        ease: "none",
        repeat: -1,
        yoyo: true
      });
    }

    // "Preload" animation - this runs immediately to show activity
    // Simulating the "experience loading" while user is on the gate
    if (lineRef.current) {
      gsap.to(lineRef.current, {
        width: "100%",
        duration: 4,
        ease: "power2.inOut",
      });
    }
  }, []);

  const handleEnter = () => {
    if (!isChecked) return;
    
    // Smooth exit animation
    const tl = gsap.timeline();
    
    tl.to(contentRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.6,
      ease: "power2.inOut",
    })
    .to(containerRef.current, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        sessionStorage.setItem("mundus-age-verified", "true");
        window.dispatchEvent(new Event("mundus-entered"));
        setShouldRender(false);
      }
    }, "-=0.2");
  };

  if (!shouldRender) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#050505] text-foreground overflow-hidden"
    >
      {/* Background Image with Blur */}
      <div ref={bgRef} className="absolute inset-0 z-0 opacity-20 pointer-events-none">
         <Image 
            src="/cocktail-images/acikmavi.png" 
            alt="Background" 
            fill
            className="object-cover blur-3xl scale-110"
            priority
         />
      </div>

      {/* Grain Overlay specific to this component for consistency */}
      <div className="absolute inset-0 z-[1] grain-overlay opacity-[0.03] pointer-events-none"></div>

      {/* Verification Content */}
      <div 
        ref={contentRef}
        className="relative z-10 flex flex-col items-center justify-center space-y-12 p-6 max-w-2xl w-full"
      >
        <div className="space-y-4 text-center">
          <h1 className="font-serif text-5xl md:text-7xl tracking-wider text-primary drop-shadow-lg">MUNDUS</h1>
          <div className="h-[1px] w-24 bg-primary/30 mx-auto my-4"></div>
          <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-gray-400 font-light">
            Premium Beverage Consultancy
          </p>
        </div>

        <div className="flex flex-col items-center space-y-8 w-full backdrop-blur-sm bg-black/20 p-8 rounded-2xl border border-white/5 shadow-2xl">
          <p className="text-lg md:text-xl font-light leading-relaxed text-center text-gray-200">
            Are you of legal drinking age in your country of residence?
          </p>
          
          <div 
            onClick={() => setIsChecked(!isChecked)}
            className="flex items-center justify-center space-x-4 cursor-pointer group py-2"
          >
            <div className={`
              w-6 h-6 border transition-all duration-300 flex items-center justify-center rounded-sm
              ${isChecked 
                ? 'bg-primary border-primary shadow-[0_0_10px_rgba(212,175,55,0.3)]' 
                : 'border-white/30 group-hover:border-primary/70 bg-transparent'}
            `}>
              {isChecked && <Check className="w-4 h-4 text-black" strokeWidth={3} />}
            </div>
            <span className={`
              text-sm tracking-[0.2em] uppercase transition-colors duration-300 select-none
              ${isChecked ? 'text-primary' : 'text-gray-400 group-hover:text-white'}
            `}>
              I am over 18
            </span>
          </div>

          <button
            onClick={handleEnter}
            disabled={!isChecked}
            className={`
              relative overflow-hidden px-16 py-4 text-sm tracking-[0.25em] uppercase transition-all duration-700
              border border-primary/30 group
              ${isChecked 
                ? 'bg-primary text-black hover:bg-[#e5c158] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] cursor-pointer transform hover:-translate-y-1' 
                : 'bg-transparent text-gray-500 cursor-not-allowed opacity-50'}
            `}
          >
            <span className="relative z-10 font-semibold">Enter Experience</span>
          </button>
        </div>
      </div>

      {/* Subtle Loading Line at Bottom */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5 z-20">
        <div 
          ref={lineRef}
          className="h-full bg-primary/50 shadow-[0_0_10px_rgba(212,175,55,0.5)] w-0"
        />
      </div>
      
      <div className="absolute bottom-8 left-0 w-full text-center z-20">
         <span className="text-[10px] tracking-[0.4em] text-white/20 uppercase">
            Curated by Mundus
         </span>
      </div>
    </div>
  );
}
