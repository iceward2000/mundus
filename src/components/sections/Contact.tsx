"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import SectionWrapper from "../SectionWrapper";
import { Send, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import gsap from "gsap";
import PolicyModal from "@/components/PolicyModal";
import VideoAudioToggle from "@/components/VideoAudioToggle";

const formSteps = [
  { id: "fullName", label: "Ad Soyad", type: "text", placeholder: "Adınız Soyadınız" },
  { id: "phone", label: "Telefon", type: "tel", placeholder: "Telefon Numaranız" },
  { id: "email", label: "E-posta", type: "email", placeholder: "E-posta Adresiniz" },
  { id: "message", label: "Danışmanlık Talebi", type: "text", placeholder: "Nasıl yardımcı olabiliriz?" },
];

export default function Contact() {
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [isFocused, setIsFocused] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [useLiteVisuals, setUseLiteVisuals] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const successTextRef = useRef<HTMLDivElement>(null);
  const inputElementRef = useRef<HTMLInputElement>(null);
  const formContentRef = useRef<HTMLDivElement>(null);
  const spanMeasureRef = useRef<HTMLSpanElement>(null);
  const fieldContainerRef = useRef<HTMLDivElement>(null);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasCssSupports =
      typeof CSS !== "undefined" && typeof CSS.supports === "function";
    const hasBackdropSupport =
      hasCssSupports &&
      (CSS.supports("backdrop-filter: blur(2px)") ||
        CSS.supports("-webkit-backdrop-filter: blur(2px)"));
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const cores = navigator.hardwareConcurrency ?? 8;
    const lowPowerDevice = memory <= 4 || cores <= 4;

    // Older/low-power GPUs often artifact when backdrop-filter + 3D transforms + heavy shadows are stacked.
    setUseLiteVisuals(reducedMotion || !hasBackdropSupport || lowPowerDevice);
  }, []);

  useEffect(() => {
    const mobileMediaQuery = window.matchMedia("(max-width: 639px)");
    const applyViewport = () => setIsMobileViewport(mobileMediaQuery.matches);
    applyViewport();

    const handleChange = (
      event: MediaQueryListEvent | MediaQueryList
    ) => {
      setIsMobileViewport(event.matches);
    };

    if (typeof mobileMediaQuery.addEventListener === "function") {
      mobileMediaQuery.addEventListener("change", handleChange);
      return () => mobileMediaQuery.removeEventListener("change", handleChange);
    }

    mobileMediaQuery.addListener(handleChange);
    return () => mobileMediaQuery.removeListener(handleChange);
  }, []);

  // Smoothly animate text alignment using padding
  useEffect(() => {
    if (!inputElementRef.current || !fieldContainerRef.current || !spanMeasureRef.current) return;

    // We only want to align right if there IS text and we are NOT focused
    const containerWidth = fieldContainerRef.current.offsetWidth;
    // adding a tiny offset for cursor/caret accuracy
    const textWidth = spanMeasureRef.current.offsetWidth;

    let targetPadding = 0;
    if (!isFocused && formData[formSteps[currentStep].id as keyof typeof formData].length > 0) {
      targetPadding = Math.max(0, containerWidth - textWidth);
    }

    gsap.to(inputElementRef.current, {
      paddingLeft: targetPadding,
      duration: 0.8,
      ease: "power3.inOut" // Smooth cinematic glide
    });

  }, [formData, currentStep, isFocused]);

  useEffect(() => {
    const section = document.getElementById("contact");
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: "500px 0px" }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoadVideo || !videoRef.current) return;

    const video = videoRef.current;
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.load();
    const tryPlay = () => {
      video.play().catch(() => {});
    };

    tryPlay();
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    video.addEventListener("loadedmetadata", tryPlay);

    const retryOnInteraction = () => {
      tryPlay();
      window.removeEventListener("touchstart", retryOnInteraction);
      window.removeEventListener("pointerdown", retryOnInteraction);
    };
    window.addEventListener("touchstart", retryOnInteraction, { passive: true });
    window.addEventListener("pointerdown", retryOnInteraction, { passive: true });

    return () => {
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("loadedmetadata", tryPlay);
      window.removeEventListener("touchstart", retryOnInteraction);
      window.removeEventListener("pointerdown", retryOnInteraction);
    };
  }, [shouldLoadVideo]);

  // 3D Perspective – cursor-based liquid glass tilt (like AgeVerificationOverlay)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!inputContainerRef.current) return;
    if (isSubmitting || submitStatus === "success") return;
    if (useLiteVisuals) return;

    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth) * 2 - 1;
    const y = (clientY / innerHeight) * 2 - 1;

    gsap.to(inputContainerRef.current, {
      rotateX: -y * 10,
      rotateY: x * 10,
      translateZ: 40,
      backgroundColor: "rgba(255, 255, 255, 0.02)",
      borderColor: "rgba(255, 255, 255, 0.25)",
      boxShadow: `inset 0 0 30px rgba(255,255,255,0.12), 0 20px 50px rgba(0,0,0,0.5), ${-x * 30}px ${-y * 30}px 60px rgba(255,255,255,0.12) inset, ${x * 20}px ${y * 20}px 40px rgba(255,255,255,0.06)`,
      ease: "power2.out",
      duration: 0.6,
    });
  }, [isSubmitting, submitStatus, useLiteVisuals]);

  const handleMouseLeave = useCallback(() => {
    if (!inputContainerRef.current) return;
    if (isSubmitting || submitStatus === "success") return;
    if (useLiteVisuals) return;

    gsap.to(inputContainerRef.current, {
      rotateX: 0,
      rotateY: 0,
      translateZ: 0,
      backgroundColor: "rgba(255, 255, 255, 0.01)",
      borderColor: "rgba(255, 255, 255, 0.2)",
      boxShadow: "inset 0 0 20px rgba(255,255,255,0.1), 0 20px 50px rgba(0,0,0,0.5)",
      ease: "power3.out",
      duration: 1.2,
    });
  }, [isSubmitting, submitStatus, useLiteVisuals]);

  useEffect(() => {
    if (useLiteVisuals) return;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave, useLiteVisuals]);

  // Keep step-to-step focus behavior, but do not autofocus on initial mount
  // because browser will scroll to the focused input (jumping to contact on refresh).
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (inputElementRef.current && !isSubmitting && submitStatus === "idle") {
      inputElementRef.current.focus();
    }
  }, [currentStep, isSubmitting, submitStatus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubmitStatus("idle");
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const nextStep = async () => {
    if (currentStep < formSteps.length - 1) {
      const stepData = formSteps[currentStep];
      if (stepData.id === "email" && formData.email.length > 0 && !formData.email.includes("@")) return;

      gsap.fromTo(
        formContentRef.current,
        { opacity: 0, x: 30, scale: 0.98 },
        { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: "power3.out" }
      );
      setCurrentStep((prev) => prev + 1);
    } else {
      if (formData.message.trim().length === 0) return;
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      gsap.fromTo(
        formContentRef.current,
        { opacity: 0, x: -30, scale: 0.98 },
        { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: "power3.out" }
      );
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextStep();
    }
  };

  const handleReset = () => {
    setSubmitStatus("idle");
    setIsSubmitting(false);
    setCurrentStep(0); // Reset to first step
    setShowCheckmark(false);

    // Kills the infinite levitation timeline
    gsap.killTweensOf(inputContainerRef.current);
    gsap.killTweensOf(formContentRef.current);

    // Animate orb expanding smoothly back to form
    gsap.to(inputContainerRef.current, {
      maxWidth: "672px", // matches Tailwind max-w-2xl
      width: "100%",
      minHeight: "140px",
      height: "140px",
      borderRadius: "3rem",
      y: 0,
      scale: 1,
      duration: 0.6,
      ease: "power3.out",
      boxShadow: "inset 0 0 20px rgba(255,255,255,0.1), 0 20px 50px rgba(0,0,0,0.5)",
      borderColor: "rgba(255,255,255,0.2)",
      backgroundColor: "rgba(255,255,255,0.01)",
      onComplete: () => {
        // Clear all inline styles to let CSS take over fully again
        gsap.set(inputContainerRef.current, { clearProps: "all" });
      }
    });

    gsap.fromTo(formContentRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, delay: 0.3, clearProps: "all" }
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitStatus("idle");

    const tl = gsap.timeline();
    const submitMorphStyles = isMobileViewport
      ? {
          maxWidth: "360px",
          width: "92%",
          height: "92px",
          minHeight: "92px",
          borderRadius: "2rem",
          duration: 0.5,
        }
      : {
          maxWidth: "80px",
          width: "80px",
          height: "80px",
          minHeight: "80px",
          borderRadius: "50%",
          duration: 0.7,
        };

    // 0. Fade out text contents instantly to prep for shape shifting
    tl.to(formContentRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.out",
    });

    // 1. Morph to a glowing liquid purple orb
    tl.to(
      inputContainerRef.current,
      {
        ...submitMorphStyles,
        ease: "power3.inOut",
        // Soft white inner glow to hold the glass shape, and a wide light-purple outer glow
        boxShadow: "inset 0 0 20px rgba(255,255,255,0.4), 0 0 50px 20px rgba(168, 85, 247, 0.4)",
        borderColor: "rgba(255,255,255,0.4)",
        // A transparent gradient that we will animate
        background: "linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(216, 180, 254, 0.4), rgba(168, 85, 247, 0.2))",
        backgroundSize: "200% 200%",
        backdropFilter: useLiteVisuals ? "none" : "blur(40px)",
      },
      "-=0.1"
    );

    // 2. Levitate slightly, gather energy infinitely + shift gradient
    tl.to(inputContainerRef.current, {
      y: isMobileViewport ? -8 : -20,
      scale: isMobileViewport ? 1.03 : 1.1,
      backgroundPosition: "100% 100%",
      duration: isMobileViewport ? 0.9 : 1.5,
      ease: "sine.inOut",
      yoyo: true,
      repeat: isMobileViewport ? 0 : -1,
    });

    try {
      const nameParts = formData.fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          company: "",
          position: "",
          phone: formData.phone,
          email: formData.email,
          message: formData.message,
        }),
      });

      if (!response.ok) throw new Error("Failed to send");

      setSubmitStatus("success");
      setShowCheckmark(true);
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        message: "",
      });

      // 3. Auto-hide checkmark after few seconds
      setTimeout(() => {
        setShowCheckmark(false);
      }, 3000);

    } catch (error) {
      console.error(error);
      setSubmitStatus("error");

      // On error, revert animation
      gsap.killTweensOf(inputContainerRef.current);
      gsap.killTweensOf(formContentRef.current);

      gsap.to(inputContainerRef.current, {
        maxWidth: "672px",
        width: "100%",
        minHeight: "140px",
        height: "140px",
        borderRadius: "3rem",
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "power3.out",
        boxShadow: "inset 0 0 20px rgba(255,255,255,0.1), 0 20px 50px rgba(0,0,0,0.5)",
        borderColor: "rgba(255,255,255,0.2)",
        background: "rgba(255,255,255,0.01)", // ensure we map back to static string, clearing the linear-gradient
        onComplete: () => {
          gsap.set(inputContainerRef.current, { clearProps: "all" });
        }
      });

      gsap.fromTo(formContentRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, delay: 0.4, clearProps: "all" }
      );
      setIsSubmitting(false);
    }
  };

  const step = formSteps[currentStep];

  return (
    <SectionWrapper id="contact" className="min-h-screen flex items-center justify-center relative z-10 overflow-hidden">
      {/* Background Video Layer */}
      <video
        ref={videoRef}
        autoPlay={shouldLoadVideo}
        muted
        loop
        playsInline
        onEnded={() => {
          const video = videoRef.current;
          if (!video) return;
          video.currentTime = 0;
          video.play().catch(() => {});
        }}
        preload="none"
        className="absolute inset-0 w-full h-full object-cover z-0"
        aria-hidden="true"
      >
        <source src="/videos/exit-compressed.webm" type="video/webm" />
        <source src="/videos/exit-compressed.mp4" type="video/mp4" />
      </video>
      <VideoAudioToggle
        videoRef={videoRef}
        audioSrc="/audio/mundus-exit-audio.mp3"
        sourceId="exit"
        className="z-[3]"
      />

      {/* Dark Overlay for better light reflection effect */}
      <div className="absolute inset-0 bg-black/40 z-[1]" />

      {/* Content Layer */}
      <div className="relative z-[2] w-full max-w-5xl px-4 flex flex-col items-center">
        {/* Title */}
        <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif text-white tracking-wide mb-16 sm:mb-24 drop-shadow-lg pointer-events-none text-center">
          İletişim
        </h2>

        {/* Interactive Form Area */}
        <div className="w-full flex items-center justify-center gap-4 sm:gap-6 min-h-[140px] relative mt-4" style={{ perspective: "1200px" }}>
          {/* Prev Arrow Desktop */}
          <button
            onClick={prevStep}
            disabled={currentStep === 0 || isSubmitting}
            type="button"
            className={clsx(
              "hidden sm:flex p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/50 transition-all duration-300",
              "hover:text-white hover:bg-white/10 hover:border-white/30 hover:scale-110 active:scale-95",
              "disabled:opacity-0 disabled:pointer-events-none disabled:-translate-x-4",
              (isSubmitting || submitStatus === "success") && "opacity-0 pointer-events-none -translate-x-4"
            )}
          >
            <ChevronLeft size={32} />
          </button>

          {/* Liquid Glass Input */}
          <div
            ref={inputContainerRef}
            style={{ transformStyle: "preserve-3d" }}
            onClick={() => {
              if (submitStatus === "success") {
                handleReset();
              }
            }}
            className={clsx(
              "relative w-full max-w-2xl will-change-transform",
              useLiteVisuals
                ? "bg-black/35 rounded-[3rem] group border border-white/15 shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
                : "bg-white/[0.01] backdrop-blur-[40px] rounded-[3rem] group border-t border-l border-white/20 border-b border-r border-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.1),0_20px_50px_rgba(0,0,0,0.5)]",
              submitStatus === "idle" && !isSubmitting && "hover:shadow-[inset_0_0_30px_rgba(255,255,255,0.15),0_20px_50px_rgba(0,0,0,0.6)]",
              submitStatus === "success" && "cursor-pointer",
              isSubmitting && submitStatus !== "success" && "pointer-events-none overflow-hidden",
              submitStatus === "error" && "border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)]"
            )}
          >
            {/* Success Checkmark */}
            <div
              className={clsx("absolute inset-0 flex items-center justify-center transition-opacity duration-500", showCheckmark ? "opacity-100" : "opacity-0 pointer-events-none")}
              style={{ transform: "translateZ(50px)" }}
            >
              <CheckCircle2 className="text-primary w-8 h-8 group-hover:scale-110 transition-transform" />
            </div>

            {/* Internal gleam effect */}
            {!useLiteVisuals && (
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-50 mix-blend-overlay rounded-[inherit]" />
            )}

            <div
              ref={formContentRef}
              className="relative w-full flex flex-col justify-end px-6 sm:px-12 py-8 sm:py-10 min-h-[140px]"
            >
              {/* Step counter */}
              <div
                className="absolute top-6 right-6 sm:top-8 sm:right-12 text-white/40 font-mono text-xs font-medium"
                style={{ transform: "translateZ(30px)" }}
              >
                {currentStep + 1} / {formSteps.length}
              </div>

              <div
                ref={fieldContainerRef}
                className="relative w-full flex flex-col justify-end mt-4"
                style={{ transform: "translateZ(40px)" }}
              >
                <label className={clsx(
                  "absolute left-0 pointer-events-none transition-all duration-300 origin-left",
                  (isFocused || formData[step.id as keyof typeof formData].length > 0)
                    ? "-top-4 text-[10px] sm:text-xs tracking-[0.25em] font-bold text-primary z-10"
                    : "top-1/2 -translate-y-1/2 text-xl sm:text-3xl lg:text-4xl font-light text-white/40 z-10"
                )}>
                  {step.placeholder}
                </label>

                {/* Hidden span for text measurement to calculate sliding distance */}
                <span
                  ref={spanMeasureRef}
                  className="absolute opacity-0 pointer-events-none whitespace-pre text-2xl sm:text-4xl lg:text-5xl font-light left-0 top-0 pt-2 pb-2"
                  style={{ visibility: 'hidden' }}
                  aria-hidden="true"
                >
                  {formData[step.id as keyof typeof formData]}
                </span>

                <input
                  ref={inputElementRef}
                  type={step.type}
                  name={step.id}
                  value={formData[step.id as keyof typeof formData]}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  disabled={isSubmitting}
                  className="w-full bg-transparent border-0 border-b-2 border-white/10 focus:border-primary focus:border-b-2 outline-none focus:outline-none ring-0 focus:ring-0 transition-colors duration-300 pt-2 pb-2 text-2xl sm:text-4xl lg:text-5xl font-light text-white text-left selection:bg-primary/30 rounded-none shadow-none z-20 relative"
                  style={{ boxShadow: 'none' }}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          {/* Next / Submit Arrow Desktop */}
          <button
            onClick={nextStep}
            disabled={
              isSubmitting ||
              (step.id === "email" && formData.email.length > 0 && !formData.email.includes("@"))
            }
            type="button"
            className={clsx(
              "hidden sm:flex p-4 rounded-full transition-all duration-300 relative overflow-hidden",
              "bg-white/5 backdrop-blur-md border border-white/10 text-white",
              "hover:bg-primary/20 hover:border-primary/50 hover:text-primary hover:scale-110 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] active:scale-95 group",
              (isSubmitting || submitStatus === "success") && "opacity-0 pointer-events-none translate-x-4",
              step.id === "email" &&
              formData.email.length > 0 &&
              !formData.email.includes("@") &&
              "opacity-50 hover:scale-100 hover:border-white/10 hover:bg-white/5 hover:text-white cursor-not-allowed",
              submitStatus === "error" && "bg-red-500/20 text-red-500 border-red-500/50"
            )}
          >
            <div className="relative z-10 flex items-center justify-center">
              {currentStep === formSteps.length - 1 ? (
                <Send
                  size={32}
                  className="translate-x-[-2px] group-hover:translate-x-0 group-hover:-translate-y-1 transition-transform"
                />
              ) : (
                <ChevronRight size={32} />
              )}
            </div>
          </button>
        </div>

        {/* Mobile controls */}
        <div className={clsx(
          "flex sm:hidden w-full max-w-[90%] justify-between items-center mt-8 px-2 transition-all duration-500",
          (isSubmitting || submitStatus === "success") ? "opacity-0 pointer-events-none translate-y-4" : "opacity-100 translate-y-0"
        )}>
          <button
            onClick={prevStep}
            disabled={currentStep === 0 || isSubmitting}
            className="p-4 rounded-full bg-white/5 border border-white/10 text-white/70 disabled:opacity-0 transition-opacity"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextStep}
            disabled={isSubmitting}
            className="p-4 rounded-full bg-white/10 border border-white/30 text-white flex items-center gap-3 pr-6"
          >
            <span className="text-xs font-semibold uppercase tracking-widest pl-2">
              {currentStep === formSteps.length - 1 ? "Gönder" : "İleri"}
            </span>
            {currentStep === formSteps.length - 1 ? (
              <Send size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        </div>
      </div>

      <div className="absolute bottom-5 left-5 sm:bottom-8 sm:left-8 z-[3]">
        <button
          type="button"
          onClick={() => setIsPolicyModalOpen(true)}
          className={clsx(
            "text-[10px] tracking-[0.15em] transition-colors duration-300 py-1 px-1 rounded uppercase",
            "focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40",
            "text-neutral-500 hover:text-neutral-200"
          )}
        >
          Politikalar
        </button>
      </div>

      <PolicyModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
      />
    </SectionWrapper>
  );
}
