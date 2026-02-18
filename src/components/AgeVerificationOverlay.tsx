"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

export default function AgeVerificationOverlay() {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [blendActive, setBlendActive] = useState(false);
  const [isStatic, setIsStatic] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if previously verified
    const verified = sessionStorage.getItem("mundus-age-verified");
    if (verified !== "true") {
      setIsOverlayVisible(true);
      setShowLogo(true);
      // Enable blend mode after initial expansion (3s)
      setTimeout(() => setBlendActive(true), 3000);
    } else {
      // If verified, show logo immediately in static position
      setShowLogo(true);
      setIsStatic(true);
      setBlendActive(true);
    }
  }, []);

  const handleEnter = () => {
    if (!contentRef.current || !overlayRef.current) return;

    // Fade out content and background
    gsap.to(contentRef.current, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut"
    });

    gsap.to(overlayRef.current, {
      backgroundColor: "transparent",
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        sessionStorage.setItem("mundus-age-verified", "true");
        window.dispatchEvent(new Event("mundus-entered"));
        setIsOverlayVisible(false); // Only hides overlay interaction/bg, keeps logo
      },
    });
  };

  const handleExit = () => {
    window.location.href = "https://www.google.com";
  };

  if (!showLogo) return null;

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center transition-colors px-4 ${isOverlayVisible ? 'bg-[#050505] pointer-events-auto' : 'bg-transparent pointer-events-none mix-blend-difference'}`}
    >
      {/* Logo Animation - Fixed Position */}
      <div className={`ConsentLogo w-6 h-6 ${blendActive ? 'blend-active' : ''} ${isStatic ? 'logo-static' : ''}`}>
        <div className="logo-square sq-1"></div>
        <div className="logo-square sq-2"></div>
        <div className="logo-square sq-3"></div>
        <div className="logo-square sq-4"></div>
        <div className="logo-square sq-5"></div>
        <div className="logo-square sq-6"></div>
      </div>

      {isOverlayVisible && (
        <div ref={contentRef} className="flex flex-col items-center space-y-8 max-w-sm w-full text-center mt-20 overlay-content-reveal pointer-events-auto">
        {/* Minimal Brand */}
        <img
          src="/mundus-text-logo.svg"
          alt="MUNDUS"
          className="w-[180px] md:w-[220px] h-auto select-none"
          draggable={false}
        />

        {/* Divider */}
        <div className="h-[1px] w-12 bg-white/10" />

        {/* Question */}
        <p className="text-sm text-neutral-400 font-light tracking-wide leading-relaxed">
            İkamet ettiğiniz ülkede yasal içki içme yaşında mısınız?
        </p>

        {/* Actions */}
        <div className="flex flex-col w-full space-y-4 pt-4">
          <button
            onClick={handleEnter}
            className="w-full py-4 border border-white/10 hover:border-white hover:bg-white hover:text-black transition-all duration-500 text-xs tracking-[0.2em] uppercase"
          >
              GİRİŞ
          </button>
          <button
            onClick={handleExit}
            className="text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors duration-300 tracking-[0.2em] uppercase"
          >
              18 YAŞINDAN KÜÇÜĞÜM
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
