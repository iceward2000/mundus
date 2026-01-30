"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

export default function AgeVerificationOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if previously verified
    const verified = sessionStorage.getItem("mundus-age-verified");
    if (verified !== "true") {
      setIsVisible(true);
    }
  }, []);

  const handleEnter = () => {
    if (!overlayRef.current) return;

    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        sessionStorage.setItem("mundus-age-verified", "true");
        window.dispatchEvent(new Event("mundus-entered"));
        setIsVisible(false);
      },
    });
  };

  const handleExit = () => {
    window.location.href = "https://www.google.com";
  };

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#050505] text-white px-4"
    >
      {/* Logo Animation - Fixed Position */}
      <div className="ConsentLogo w-6 h-6">
        <div className="logo-square sq-1"></div>
        <div className="logo-square sq-2"></div>
        <div className="logo-square sq-3"></div>
        <div className="logo-square sq-4"></div>
        <div className="logo-square sq-5"></div>
        <div className="logo-square sq-6"></div>
      </div>

      <div className="flex flex-col items-center space-y-8 max-w-sm w-full text-center mt-20 overlay-content-reveal">
        {/* Minimal Brand */}
        <h1 className="font-serif text-3xl md:text-4xl tracking-widest">MUNDUS</h1>

        {/* Divider */}
        <div className="h-[1px] w-12 bg-white/10" />

        {/* Question */}
        <p className="text-sm text-neutral-400 font-light tracking-wide leading-relaxed">
          Are you of legal drinking age in your country of residence?
        </p>

        {/* Actions */}
        <div className="flex flex-col w-full space-y-4 pt-4">
          <button
            onClick={handleEnter}
            className="w-full py-4 border border-white/10 hover:border-white hover:bg-white hover:text-black transition-all duration-500 text-xs tracking-[0.2em] uppercase"
          >
            Enter
          </button>
          <button
            onClick={handleExit}
            className="text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors duration-300 tracking-[0.2em] uppercase"
          >
            I am under 18
          </button>
        </div>
      </div>
    </div>
  );
}
