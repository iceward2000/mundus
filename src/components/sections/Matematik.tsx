"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SectionWrapper from "../SectionWrapper";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

gsap.registerPlugin(ScrollTrigger);

// Operation structure: op0=add, op1=multiply, op2=divide, op3=subtract; each has items i0..iN
const OP_STRUCTURE = [
  { labelKey: "mat.op0.label" as TranslationKey, itemCount: 5 },
  { labelKey: "mat.op1.label" as TranslationKey, itemCount: 7 },
  { labelKey: "mat.op2.label" as TranslationKey, itemCount: 6 },
  { labelKey: "mat.op3.label" as TranslationKey, itemCount: 5 },
];

export default function Matematik() {
  const { t, lang } = useLanguage();

  const OPERATIONS = useMemo(() => {
    return OP_STRUCTURE.map((op, opIndex) => ({
      label: t(op.labelKey),
      items: Array.from({ length: op.itemCount }, (_, i) => ({
        title: t(`mat.op${opIndex}.i${i}.title` as TranslationKey),
        desc: t(`mat.op${opIndex}.i${i}.desc` as TranslationKey),
      })),
    }));
  }, [t, lang]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const symbolOrbRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const hBarRef = useRef<SVGRectElement>(null);
  const vBarRef = useRef<SVGRectElement>(null);
  const topDotRef = useRef<SVGCircleElement>(null);
  const bottomDotRef = useRef<SVGCircleElement>(null);

  const prefersReducedMotion = usePrefersReducedMotion();
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    if (!hBarRef.current || !vBarRef.current || !topDotRef.current || !bottomDotRef.current) return;
    didInit.current = true;

    gsap.set(hBarRef.current, { transformOrigin: "50% 50%" });
    gsap.set(vBarRef.current, { transformOrigin: "50% 50%", scaleY: 1 });
    gsap.set(topDotRef.current, { transformOrigin: "50% 50%", scale: 0, opacity: 0 });
    gsap.set(bottomDotRef.current, { transformOrigin: "50% 50%", scale: 0, opacity: 0 });
  }, []);

  // Entrance scroll animation
  useEffect(() => {
    if (prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#matematik",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
      tl.from(".mat-header", { y: 40, opacity: 0, duration: 0.8, ease: "power2.out" });
      tl.from(".mat-symbol-area", { scale: 0.85, opacity: 0, duration: 0.9, ease: "power2.out" }, "-=0.5");
      tl.from(".mat-content-wrap", { y: 30, opacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.5");
    }, sectionRef);
    return () => ctx.revert();
  }, [prefersReducedMotion]);

  // Scroll-based timeline line animation
  useEffect(() => {
    if (!timelineRef.current || !lineRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(lineRef.current, {
        scrollTrigger: {
          trigger: timelineRef.current,
          start: "top 70%",
          end: "bottom 70%",
          scrub: 1,
        },
        height: "100%",
        ease: "none",
      });
    }, timelineRef);

    return () => ctx.revert();
  }, []);

  // Recalculate ScrollTrigger positions when items change
  useEffect(() => {
    const timer = setTimeout(() => ScrollTrigger.refresh(), 200);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  // Activate timeline dots as the line reaches them
  useEffect(() => {
    if (prefersReducedMotion || !timelineRef.current) return;
    let triggers: ScrollTrigger[] = [];

    const timer = setTimeout(() => {
      if (!timelineRef.current) return;
      const dots = timelineRef.current.querySelectorAll('.mat-glass-dot');

      dots.forEach((dot) => {
        const item = dot.closest('.mat-item');
        if (!item) return;

        const st = ScrollTrigger.create({
          trigger: item,
          start: 'top 75%',
          onEnter: () => dot.classList.add('mat-dot-active'),
          onLeaveBack: () => dot.classList.remove('mat-dot-active'),
        });
        triggers.push(st);
      });
    }, 350);

    return () => {
      clearTimeout(timer);
      triggers.forEach(st => st.kill());
    };
  }, [activeIndex, prefersReducedMotion]);

  // Animate content when activeIndex changes (skip first render)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!contentRef.current) return;

    const d = prefersReducedMotion ? 0 : 0.35;
    gsap.fromTo(contentRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: d, ease: "power2.out" });

    const items = contentRef.current.querySelectorAll(".mat-item");
    if (items.length) {
      gsap.fromTo(
        items,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, stagger: 0.05, duration: d, ease: "power2.out", delay: 0.06, onComplete: () => setIsAnimating(false) }
      );
    } else {
      setIsAnimating(false);
    }
  }, [activeIndex, prefersReducedMotion]);

  const handleClick = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    if (!hasInteracted) setHasInteracted(true);

    const next = (activeIndex + 1) % 4;
    const d = prefersReducedMotion ? 0.01 : 0.55;
    const tl = gsap.timeline();

    if (contentRef.current) {
      tl.to(contentRef.current, { opacity: 0, y: 12, duration: d * 0.45, ease: "power2.in" });
    }

    switch (activeIndex) {
      case 0:
        tl.to(hBarRef.current, { rotation: 45, duration: d, ease: "power2.inOut" }, "<+=0.15");
        tl.to(vBarRef.current, { rotation: 45, duration: d, ease: "power2.inOut" }, "<");
        break;
      case 1:
        tl.to(hBarRef.current, { rotation: 0, duration: d * 0.7, ease: "power2.inOut" }, "<+=0.1");
        tl.to(vBarRef.current, { rotation: 0, duration: d * 0.7, ease: "power2.inOut" }, "<");
        tl.to(vBarRef.current, { scaleY: 0, duration: d * 0.4, ease: "power2.in" }, "-=0.15");
        tl.to([topDotRef.current, bottomDotRef.current], { scale: 1, opacity: 1, duration: d * 0.4, ease: "back.out(1.7)", stagger: 0.07 }, "-=0.08");
        break;
      case 2:
        tl.to(topDotRef.current, { scale: 0, opacity: 0, duration: d * 0.45, ease: "power2.in" }, "<+=0.1");
        tl.to(bottomDotRef.current, { scale: 0, opacity: 0, duration: d * 0.45, ease: "power2.in" }, "<+=0.06");
        break;
      case 3:
        tl.to(vBarRef.current, { scaleY: 1, duration: d * 0.55, ease: "back.out(1.7)" }, "<+=0.1");
        break;
    }

    tl.call(() => setActiveIndex(next));
  }, [activeIndex, isAnimating, hasInteracted, prefersReducedMotion]);

  const handleOrbMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !symbolOrbRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    gsap.to(symbolOrbRef.current, {
      rotateX: -y * 10,
      rotateY: x * 10,
      translateZ: 28,
      borderColor: "rgba(255, 255, 255, 0.28)",
      boxShadow: `0 30px 60px rgba(0,0,0,0.45), ${-x * 22}px ${-y * 22}px 50px rgba(255,255,255,0.14) inset, ${x * 18}px ${y * 18}px 35px rgba(255,255,255,0.08)`,
      ease: "power2.out",
      duration: 0.45,
    });

    if (svgRef.current) {
      gsap.to(svgRef.current, {
        x: x * 5,
        y: y * 5,
        ease: "power2.out",
        duration: 0.45,
      });
    }
  }, [prefersReducedMotion]);

  const handleOrbMouseLeave = useCallback(() => {
    if (prefersReducedMotion || !symbolOrbRef.current) return;

    gsap.to(symbolOrbRef.current, {
      rotateX: 0,
      rotateY: 0,
      translateZ: 0,
      borderColor: "rgba(255, 255, 255, 0.2)",
      boxShadow: "0 0 0 rgba(255,255,255,0)",
      ease: "power3.out",
      duration: 1,
    });

    if (svgRef.current) {
      gsap.to(svgRef.current, {
        x: 0,
        y: 0,
        ease: "power3.out",
        duration: 1,
      });
    }
  }, [prefersReducedMotion]);

  const current = OPERATIONS[activeIndex];

  const dotIcon = (
    [
      <svg key="plus" className="mat-dot-core w-3.5 h-3.5 text-primary" viewBox="0 0 14 14" fill="none">
        <line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>,
      <svg key="times" className="mat-dot-core w-3 h-3 text-primary" viewBox="0 0 14 14" fill="none">
        <line x1="3" y1="3" x2="11" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="11" y1="3" x2="3" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>,
      <svg key="divide" className="mat-dot-core w-3.5 h-3.5 text-primary" viewBox="0 0 14 14" fill="none">
        <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="7" cy="3" r="1.5" fill="currentColor" />
        <circle cx="7" cy="11" r="1.5" fill="currentColor" />
      </svg>,
      <svg key="minus" className="mat-dot-core w-3.5 h-3.5 text-primary" viewBox="0 0 14 14" fill="none">
        <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>,
    ] as const
  )[activeIndex];

  return (
    <SectionWrapper id="matematik" fullHeight={false} className="overflow-hidden md:!overflow-visible">
      <div ref={sectionRef} className="max-w-7xl mx-auto w-full py-10 md:py-20">
        {/* Header */}
        <div className="mat-header text-center mb-10 md:mb-14">
          <span className="text-primary text-sm tracking-widest uppercase">{t("matematik.label")}</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif mt-4">{t("matematik.title")}</h2>
        </div>

        {/* Desktop: 2-column | Mobile: single column */}
        <div className="flex flex-col md:flex-row md:gap-12 lg:gap-20">
          {/* Left column — arithmetic symbol (sticky on desktop) */}
          <div className="mat-symbol-area flex flex-col items-center mb-10 md:mb-0 md:w-[38%] lg:w-[35%] md:sticky md:top-[25vh] md:self-start">
            <div className="relative" style={{ perspective: "1200px" }}>
              <div
                ref={symbolOrbRef}
                onMouseMove={handleOrbMouseMove}
                onMouseLeave={handleOrbMouseLeave}
                className="relative group isolate rounded-full will-change-transform"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Subtle background glow so the glass has something to refract */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-[30px] -z-10 pointer-events-none" />

                <div
                  className="!absolute inset-0 liquid-glass !rounded-full after:!hidden transition-[border-color] duration-500 group-hover:!border-white/25 pointer-events-none"
                >
                  <div className="liquid-glass-specular" />
                </div>

                <button
                  onClick={handleClick}
                  disabled={isAnimating}
                  className="relative z-10 p-6 sm:p-8 md:p-8 lg:p-10 cursor-pointer disabled:cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded-full"
                  aria-label={t("matematik.ariaNext")}
                  style={{ transform: "translateZ(35px)" }}
                >
                  <svg
                    ref={svgRef}
                    viewBox="0 0 200 200"
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-36 lg:h-36 relative z-10 drop-shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                    aria-hidden="true"
                  >
                    <rect
                      ref={hBarRef}
                      x="30" y="91" width="140" height="18" rx="9"
                      className="fill-primary"
                    />
                    <rect
                      ref={vBarRef}
                      x="91" y="30" width="18" height="140" rx="9"
                      className="fill-primary"
                    />
                    <circle
                      ref={topDotRef}
                      cx="100" cy="52" r="14"
                      className="fill-primary"
                    />
                    <circle
                      ref={bottomDotRef}
                      cx="100" cy="148" r="14"
                      className="fill-primary"
                    />
                  </svg>
                </button>
              </div>

              {!hasInteracted && (
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/25 text-xs sm:text-sm whitespace-nowrap animate-pulse select-none pointer-events-none">
                  {t("matematik.clickHint")}
                </span>
              )}
            </div>

            <div className="flex gap-2.5 mt-10" aria-hidden="true">
              {OPERATIONS.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${i === activeIndex ? "bg-primary scale-150" : "bg-white/15"}`}
                />
              ))}
            </div>
          </div>

          {/* Right column — timeline content */}
          <div className="md:w-[62%] lg:w-[65%]">
            <div ref={contentRef} className="mat-content-wrap">
              <h3 className="text-2xl md:text-3xl font-serif text-primary mb-8 md:mb-10 pl-12">
                {current.label}
              </h3>

              <div ref={timelineRef} className="relative">
                <div className="mat-guide-line absolute left-[16px] top-0 h-full -translate-x-1/2 z-0" />
                <div
                  ref={lineRef}
                  className="mat-line absolute left-[16px] top-0 h-0 -translate-x-1/2 z-[1]"
                />

                {current.items.map((item, i) => (
                  <div
                    key={`${activeIndex}-${i}`}
                    className="mat-item relative pl-12 pb-10 last:pb-0 z-[2]"
                  >
                    <div className="mat-glass-dot absolute left-0 top-0.5 w-8 h-8 flex items-center justify-center z-10">
                      {dotIcon}
                    </div>

                    <div className="pt-1">
                      <h4 className="text-base md:text-lg font-medium text-white/90 mb-1.5 transition-colors duration-300">
                        {item.title}
                      </h4>
                      <p className="text-white/45 text-sm md:text-[15px] leading-relaxed transition-colors duration-300">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
