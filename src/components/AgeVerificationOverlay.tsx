"use client";

/**
 * AgeVerificationOverlay — Client-side age gate for alcohol-related content.
 *
 * Flow:
 * - On mount, checks sessionStorage("mundus-age-verified"). If "true", overlay stays hidden.
 * - Otherwise shows full-screen overlay with video background and age question.
 * - "Evet" (Yes): sets sessionStorage, dispatches "mundus-entered", fades out overlay.
 * - "Hayır" (No): redirects to Google.
 *
 * Security note: sessionStorage is easily bypassed via DevTools. This provides a UX/compliance
 * layer, not enforcement. See CODEBASE_ANALYSIS.md for details.
 */

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/context/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import VideoAudioToggle from "@/components/VideoAudioToggle";
import clsx from "clsx";

gsap.registerPlugin(ScrollTrigger);

const VIDEO_SRC = "/videos/entrance-compressed.mp4";

export default function AgeVerificationOverlay() {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [blendActive, setBlendActive] = useState(false);
  const [isStatic, setIsStatic] = useState(false);
  const [showGlassContainer, setShowGlassContainer] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [preloadActive, setPreloadActive] = useState(true);

  const overlayRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const glassCardRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { t } = useLanguage();

  /** Desktop: wait for AssetPreloader to reach 100%. Mobile: immediate. */
  const loadComplete = !preloadActive || loadProgress >= 100;

  // Prevent body scroll while overlay is active
  useEffect(() => {
    if (isOverlayVisible) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.inset = "0";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.inset = "";
    };
  }, [isOverlayVisible]);

  useEffect(() => {
    /** Hydration-safe check: if already verified this session, skip overlay. */
    const verified = sessionStorage.getItem("mundus-age-verified");
    if (verified !== "true") {
      setIsOverlayVisible(true);
      setShowLogo(true);
      setTimeout(() => setBlendActive(true), 3000);
      /** Logo: 3s expansion + 3.2s delay + up to 2.8s fly ≈ 6s total. Show glass ~1s before completion for smoother transition. */
      const showGlassAt = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches ? 4500 : 5000;
      const t = setTimeout(() => setShowGlassContainer(true), showGlassAt);
      return () => clearTimeout(t);
    } else {
      setShowLogo(true);
      setIsStatic(true);
      setBlendActive(true);
    }
  }, []);

  // Autoplay fallback
  useEffect(() => {
    if (!isOverlayVisible || !videoRef.current) return;

    const video = videoRef.current;
    const tryPlay = () => {
      video.play().catch(() => {});
    };

    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener("loadeddata", tryPlay, { once: true });
    }
  }, [isOverlayVisible]);

  useEffect(() => {
    const desktop =
      window.matchMedia("(pointer: fine)").matches && window.innerWidth >= 768;

    if (!desktop) {
      setPreloadActive(false);
      setLoadProgress(100);
      return;
    }

    const handler = (e: Event) => {
      setLoadProgress(
        (e as CustomEvent<{ progress: number }>).detail.progress
      );
    };
    window.addEventListener("mundus-load-progress", handler);
    return () => window.removeEventListener("mundus-load-progress", handler);
  }, []);

  const handleEnter = () => {
    if (!loadComplete) return;

    /** Persist verification for this tab/session. Other components listen for mundus-entered. */
    sessionStorage.setItem("mundus-age-verified", "true");
    window.dispatchEvent(new Event("mundus-entered"));

    if (!contentWrapperRef.current || !overlayRef.current) return;

    gsap.to(contentWrapperRef.current, {
      opacity: 0,
      scale: 1.1,
      duration: 0.8,
      ease: "power2.inOut",
    });

    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        setIsOverlayVisible(false);
        // Body lock styles are removed by the useEffect cleanup on the next render.
        // Wait a tick so the layout is back to normal before resetting scroll
        // and recalculating all ScrollTrigger positions.
        setTimeout(() => {
          window.scrollTo(0, 0);
          ScrollTrigger.refresh();
        }, 100);
      },
    });
  };

  /** Under-18: redirect away from alcohol content. */
  const handleExit = () => {
    window.location.href = "https://www.google.com";
  };

  // 3D Perspective & Styling Tricks
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!glassCardRef.current || !videoWrapperRef.current) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    // Normalize coordinates (-1 to 1)
    const x = (clientX / innerWidth) * 2 - 1;
    const y = (clientY / innerHeight) * 2 - 1;

    // Trick X: Action when cursor moves inside the container
    gsap.to(glassCardRef.current, {
      rotateX: -y * 10,
      rotateY: x * 10,
      translateZ: 40,
      backgroundColor: "rgba(255, 255, 255, 0.02)",
      borderColor: "rgba(255, 255, 255, 0.3)",
      boxShadow: `0 40px 80px rgba(0,0,0,0.6), ${-x * 30}px ${-y * 30}px 60px rgba(255,255,255,0.15) inset, ${x * 20}px ${y * 20}px 40px rgba(255,255,255,0.08)`,
      ease: "power2.out",
      duration: 0.6
    });

    gsap.to(videoWrapperRef.current, {
      x: -x * 30,
      y: -y * 30,
      scale: 1.08,
      filter: "blur(0px) brightness(0.9)", // Bring the video sharply into focus
      ease: "power2.out",
      duration: 0.6
    });
  }, []);

  /** Fade in liquid glass container when logo animation nears completion. */
  useLayoutEffect(() => {
    if (showGlassContainer && contentWrapperRef.current) {
      gsap.fromTo(
        contentWrapperRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" }
      );
    }
  }, [showGlassContainer]);

  const handleMouseLeave = useCallback(() => {
    if (!glassCardRef.current || !videoWrapperRef.current) return;

    // Trick Y: Action when cursor leaves the container
    gsap.to(glassCardRef.current, {
      rotateX: 0,
      rotateY: 0,
      translateZ: 0,
      backgroundColor: "rgba(0, 0, 0, 0.1)",
      borderColor: "rgba(255, 255, 255, 0.05)",
      boxShadow: "0 30px 60px rgba(0,0,0,0.4), 0 0 0 rgba(255,255,255,0) inset",
      ease: "power3.out",
      duration: 1.2
    });

    gsap.to(videoWrapperRef.current, {
      x: 0,
      y: 0,
      scale: 1,
      filter: "blur(16px) brightness(0.4)", // Fade into a cinematic blurry depth of field
      ease: "power3.out",
      duration: 1.2
    });
  }, []);

  if (!showLogo) return null;

  return (
    <>
      <div
        className={`ConsentLogo w-6 h-6 ${blendActive ? "blend-active" : ""} ${isStatic ? "logo-static" : ""
          }`}
        style={isOverlayVisible ? { zIndex: 10001 } : undefined}
      >
        <div className="logo-square sq-1"></div>
        <div className="logo-square sq-2"></div>
        <div className="logo-square sq-3"></div>
        <div className="logo-square sq-4"></div>
        <div className="logo-square sq-5"></div>
        <div className="logo-square sq-6"></div>
      </div>

      {isOverlayVisible && (
        <div
          ref={overlayRef}
          className="age-overlay fixed inset-0 z-[10000] overflow-hidden pointer-events-auto bg-black"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Parallax Video layer */}
          <div
            ref={videoWrapperRef}
            className="absolute inset-[-10%] w-[120%] h-[120%]"
            style={{ filter: "blur(16px) brightness(0.4)", transform: "scale(1)" }}
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
            >
              <source src={VIDEO_SRC} type="video/mp4" />
            </video>
          </div>

          <div
            className="absolute top-6 right-6 sm:top-8 sm:right-8 pointer-events-auto transition-opacity duration-700"
            style={{
              zIndex: 3,
              opacity: showGlassContainer ? 1 : 0,
              visibility: showGlassContainer ? "visible" : "hidden",
              pointerEvents: showGlassContainer ? "auto" : "none",
            }}
          >
            <LanguageToggle variant="overlay" />
          </div>

          {/* 3D Perspective Container — hidden until logo animation nears completion */}
          <div
            ref={contentWrapperRef}
            className="relative w-full h-full flex flex-col items-center justify-center p-4 z-10"
            style={{
              perspective: "1200px",
              ...(showGlassContainer ? {} : { opacity: 0, visibility: "hidden" as const, pointerEvents: "none" as const }),
            }}
          >
            {/* The Glassy 3D Card */}
            <div
              ref={glassCardRef}
              className="w-full max-w-sm rounded-[2rem] p-8 sm:p-12 flex flex-col items-center justify-center bg-black/10 backdrop-blur-md md:backdrop-blur-none border border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.4)] transition-colors duration-700"
              style={{ transformStyle: "preserve-3d" }}
            >
              <img
                src="/mundus-text-logo.svg"
                alt="MUNDUS"
                className="w-[160px] sm:w-[200px] h-auto select-none mb-8 drop-shadow-lg"
                draggable={false}
                style={{ transform: "translateZ(30px)" }}
              />

              <div className="h-[1px] w-12 bg-white/20 mb-8" style={{ transform: "translateZ(40px)" }} />

              <h2
                className="text-lg sm:text-2xl text-white font-light tracking-wide text-center leading-relaxed mb-10 text-shadow-sm"
                style={{ transform: "translateZ(50px)" }}
              >
                {t("overlay.question")}
              </h2>

              <div className="flex flex-col sm:flex-row gap-4 w-full" style={{ transform: "translateZ(60px)" }}>
                <button
                  onClick={handleEnter}
                  disabled={!loadComplete}
                  className={clsx(
                    "flex-1 relative overflow-hidden group py-4 px-6 rounded-xl border transition-all duration-500",
                    loadComplete
                      ? "border-white/20 bg-white/10 hover:bg-white hover:border-white shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] cursor-pointer"
                      : "border-white/[0.06] bg-transparent cursor-default"
                  )}
                >
                  {!loadComplete && (
                    <div
                      className="absolute inset-y-0 left-0 bg-white/5 transition-all duration-500 ease-out"
                      style={{ width: `${loadProgress}%` }}
                    />
                  )}

                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <span
                      className={clsx(
                        "tracking-[0.2em] text-sm font-medium uppercase transition-colors duration-500",
                        loadComplete ? "text-white group-hover:text-black" : "text-white/30"
                      )}
                    >
                      {t("overlay.yes")}
                    </span>
                    {!loadComplete && loadProgress > 0 && (
                      <span className="text-[10px] tabular-nums font-light text-white/40">
                        {loadProgress}%
                      </span>
                    )}
                  </div>
                </button>

                <button
                  onClick={handleExit}
                  className="flex-1 py-4 px-6 rounded-xl border border-white/10 bg-transparent hover:bg-black/40 hover:border-white/40 transition-all duration-500 flex items-center justify-center cursor-pointer group"
                >
                  <span className="text-white/60 group-hover:text-white transition-colors duration-300 tracking-[0.2em] text-sm font-medium uppercase drop-shadow-sm">
                    {t("overlay.no")}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <VideoAudioToggle
            videoRef={videoRef}
            audioSrc="/audio/mundus-entrance-audio.mp3"
            sourceId="entrance"
            hidden={!showGlassContainer}
            className="z-50"
          />
        </div>
      )}
    </>
  );
}
