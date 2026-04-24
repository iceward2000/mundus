"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/context/LanguageContext";

const INTRO_LINES = [
  "Göz hizasında derin bi bakış,",
  "Kadehin dibinden, kalpten bi tık.",
  "Tadı bizlik, içi dolu, sesi tok bi tık.",
  "E bi tık’da burada demlenir her şey",
  "Dostluk, muhabbet, aşk, iş; burada deriz anlaştık",
];
const LAST_LINE_PREFIX = "E haydi o zaman, gönülden ";
const LAST_LINE_ACTION = "bi tık";
const SEREFE_TEXT = "şerefe";
const FORWARD_DURATION = 2.25;
const GATE_PROGRESS = 0.34;
const FLAP_CYCLE = "abcdefghijklmnoprstuvyzcgisouşçğıöü";
const FRAME_EASE = "none";
const MOBILE_FRAME_CROP_BIAS = 0.78;
const HINT_BUMP_COOLDOWN_MS = 260;
const MOBILE_COMPLETED_ACTION_OFFSET_Y = 330;
const DESKTOP_COMPLETED_ACTION_OFFSET_Y = 380;
const COMPLETED_HINT_GAP_Y = 10;
const RETURN_TO_POEM_HINT = {
  tr: "şiire geri dönmek için tıkla",
  en: "click to return to the poem",
};

type Phase =
  | "intro"
  | "gate"
  | "animating-forward"
  | "completed"
  | "animating-reverse";

export default function RakiFrames() {
  const { lang } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const introOverlayRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const lastPrefixRef = useRef<HTMLSpanElement>(null);
  const actionFlapRef = useRef<HTMLSpanElement>(null);
  const actionTextRef = useRef<HTMLSpanElement>(null);
  const unlockActionRef = useRef<() => void>(() => {});
  const reverseActionRef = useRef<() => void>(() => {});
  const gateLockCleanupRef = useRef<(() => void) | null>(null);
  const scrollHintAttemptsRef = useRef(0);
  const lastHintBumpAtRef = useRef(0);
  const activeTweenRef = useRef<gsap.core.Animation | null>(null);
  const phaseRef = useRef<Phase>("intro");
  const [phase, setPhase] = useState<Phase>("intro");
  const [actionText, setActionText] = useState(LAST_LINE_ACTION);
  const [scrollHintLevel, setScrollHintLevel] = useState(0);
  const [isActivated, setIsActivated] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const isGateActive = phase === "gate";
  const showPoem = phase === "intro" || phase === "gate";
  const completedActionOffsetY = isDesktop
    ? DESKTOP_COMPLETED_ACTION_OFFSET_Y
    : MOBILE_COMPLETED_ACTION_OFFSET_Y;

  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsActivated(true);
          observer.disconnect();
        }
      },
      { rootMargin: "800px 0px" }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const syncDesktop = () => setIsDesktop(desktopQuery.matches);
    syncDesktop();
    desktopQuery.addEventListener("change", syncDesktop);
    return () => desktopQuery.removeEventListener("change", syncDesktop);
  }, []);

  useEffect(() => {
    if (!isActivated) return;

    gsap.registerPlugin(ScrollTrigger);

    const canvasElement = canvasRef.current;
    const triggerEl = sectionRef.current;
    const sticky = stickyRef.current;
    const introOverlay = introOverlayRef.current;
    const canvasContext = canvasElement?.getContext("2d");
    if (!canvasElement || !canvasContext || !triggerEl || !sticky || !introOverlay) return;
    const canvas = canvasElement;
    const context = canvasContext;

    const frameStart = 0;
    const frameEnd = 44;
    const frameCount = frameEnd - frameStart + 1;
    const totalIntroCharacters =
      INTRO_LINES.reduce((sum, line) => sum + line.length, 0) + LAST_LINE_PREFIX.length;

    const currentFrame = (index: number) =>
      `/videos/raki-trimmed-final-frames/${frameStart + index - 1}.png`;

    const getCanvasBackgroundColor = () => {
      const rootStyle = window.getComputedStyle(document.documentElement);
      return rootStyle.getPropertyValue("--background").trim() || "rgb(10, 10, 10)";
    };

    const images: HTMLImageElement[] = [];
    const frameState = { frame: 1 };
    const setPhaseState = (nextPhase: Phase) => {
      phaseRef.current = nextPhase;
      setPhase(nextPhase);
    };

    const setActionFlapVisual = (vars: gsap.TweenVars) => {
      if (!actionFlapRef.current) return;
      gsap.set(actionFlapRef.current, vars);
    };

    const runSplitFlap = (nextText: string) => {
      const flapEl = actionFlapRef.current;
      if (!flapEl) {
        setActionText(nextText);
        return null;
      }

      gsap.killTweensOf(flapEl);
      const fromText = actionTextRef.current?.textContent ?? actionText;
      const maxLength = Math.max(fromText.length, nextText.length);
      const fromPadded = fromText.padEnd(maxLength, " ");
      const toPadded = nextText.padEnd(maxLength, " ");
      const stepCount = 18;
      const stepDuration = 2.4 / stepCount;

      const buildBoardFrame = (stepIndex: number) => {
        const revealCount = Math.floor((stepIndex / (stepCount - 1)) * maxLength);
        return Array.from({ length: maxLength }, (_, i) => {
          const targetChar = toPadded[i];
          if (targetChar === " ") return " ";
          if (i < revealCount) return targetChar;
          const currentChar = fromPadded[i];
          const baseIndex = Math.max(0, FLAP_CYCLE.indexOf(currentChar));
          return FLAP_CYCLE[(baseIndex + stepIndex + i * 2) % FLAP_CYCLE.length];
        }).join("");
      };

      gsap.set(flapEl, {
        transformPerspective: 1000,
        transformOrigin: "50% 50%",
        backfaceVisibility: "hidden",
      });
      const flapTl = gsap.timeline({
        onComplete: () => {
          setActionText(nextText);
          gsap.set(flapEl, { rotationX: 0, scaleY: 1, filter: "brightness(1)" });
        },
      });

      for (let i = 0; i < stepCount; i++) {
        flapTl
          .to(flapEl, {
            rotationX: -82,
            scaleY: 0.62,
            filter: "brightness(0.45)",
            duration: stepDuration * 0.48,
            ease: "power1.in",
          })
          .add(() => {
            setActionText(buildBoardFrame(i));
            gsap.set(flapEl, { rotationX: 82, scaleY: 0.62, filter: "brightness(0.45)" });
          })
          .to(flapEl, {
            rotationX: 0,
            scaleY: 1,
            filter: "brightness(1)",
            duration: stepDuration * 0.52,
            ease: "power1.out",
          });
      }

      return flapTl;
    };

    const renderFrame = (frame: number) => {
      frameState.frame = Math.max(1, Math.min(frameCount, frame));
      context.fillStyle = getCanvasBackgroundColor();
      context.fillRect(0, 0, canvas.width, canvas.height);

      const img = images[frameState.frame - 1];
      if (!img?.complete || !img.width || !img.height) return;

      const coverScale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const containScale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      const scale = isMobile
        ? containScale + (coverScale - containScale) * MOBILE_FRAME_CROP_BIAS
        : coverScale;
      const x = canvas.width / 2 - (img.width / 2) * scale;
      const y = canvas.height / 2 - (img.height / 2) * scale;
      context.drawImage(img, x, y, img.width * scale, img.height * scale);
    };

    const renderBlack = () => {
      context.fillStyle = getCanvasBackgroundColor();
      context.fillRect(0, 0, canvas.width, canvas.height);
    };

    const clearPoemText = () => {
      lineRefs.current.forEach((lineEl) => {
        if (lineEl) lineEl.textContent = "";
      });
      if (lastPrefixRef.current) lastPrefixRef.current.textContent = "";
    };

    const updateIntroText = (progress: number) => {
      let remaining = Math.floor(
        totalIntroCharacters * Math.min(Math.max(progress, 0), 1)
      );
      INTRO_LINES.forEach((line, index) => {
        const visibleCharacters = Math.max(0, Math.min(line.length, remaining));
        const lineEl = lineRefs.current[index];
        if (lineEl) lineEl.textContent = line.slice(0, visibleCharacters);
        remaining -= line.length;
      });

      const prefixCharacters = Math.max(0, Math.min(LAST_LINE_PREFIX.length, remaining));
      if (lastPrefixRef.current) {
        lastPrefixRef.current.textContent = LAST_LINE_PREFIX.slice(0, prefixCharacters);
      }
    };

    setPhaseState("intro");
    setActionText(LAST_LINE_ACTION);
    scrollHintAttemptsRef.current = 0;
    setScrollHintLevel(0);
    clearPoemText();

    let loadedCount = 0;
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === 1 && phaseRef.current === "completed") renderFrame(frameCount);
      };
      images.push(img);
    }

    const setCanvasSize = () => {
      // Keep sequence stable on mobile where browser chrome affects viewport height.
      canvas.width = sticky.clientWidth;
      canvas.height = sticky.clientHeight;
      if (phaseRef.current === "completed") {
        renderFrame(frameCount);
      } else {
        renderBlack();
      }
    };

    let resizeRafId: number | null = null;
    const scheduleCanvasResize = () => {
      if (resizeRafId !== null) window.cancelAnimationFrame(resizeRafId);
      resizeRafId = window.requestAnimationFrame(() => {
        resizeRafId = null;
        setCanvasSize();
      });
    };

    window.addEventListener("resize", scheduleCanvasResize, { passive: true });
    window.addEventListener("orientationchange", scheduleCanvasResize, { passive: true });
    setCanvasSize();

    const getHintLevel = (attemptCount: number) => {
      if (attemptCount >= 20) return 2;
      if (attemptCount >= 8) return 1;
      return 0;
    };

    const createScrollLock = (fixedY: number) => {
      if (typeof document === "undefined") return () => {};
      const previousOverflow = document.body.style.overflow;
      const previousTouchAction = document.body.style.touchAction;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";

      const bumpHint = () => {
        const now = performance.now();
        if (now - lastHintBumpAtRef.current < HINT_BUMP_COOLDOWN_MS) return;
        lastHintBumpAtRef.current = now;
        scrollHintAttemptsRef.current += 1;
        setScrollHintLevel(getHintLevel(scrollHintAttemptsRef.current));
      };

      const preventWheel = (event: WheelEvent) => {
        event.preventDefault();
        bumpHint();
      };
      const preventTouch = (event: TouchEvent) => {
        event.preventDefault();
        bumpHint();
      };
      const keepPosition = () => {
        if (Math.abs(window.scrollY - fixedY) > 1) {
          window.scrollTo({ top: fixedY, behavior: "auto" });
        }
      };
      const preventKeys = (event: KeyboardEvent) => {
        const scrollKeys = [" ", "ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"];
        if (!scrollKeys.includes(event.key)) return;
        event.preventDefault();
        bumpHint();
      };

      window.addEventListener("wheel", preventWheel, { passive: false });
      window.addEventListener("touchmove", preventTouch, { passive: false });
      window.addEventListener("keydown", preventKeys, { passive: false });
      window.addEventListener("scroll", keepPosition, { passive: true });
      keepPosition();

      return () => {
        document.body.style.overflow = previousOverflow;
        document.body.style.touchAction = previousTouchAction;
        window.removeEventListener("wheel", preventWheel);
        window.removeEventListener("touchmove", preventTouch);
        window.removeEventListener("keydown", preventKeys);
        window.removeEventListener("scroll", keepPosition);
      };
    };

    const setGateActive = (active: boolean) => {
      if (active) {
        if (!gateLockCleanupRef.current) {
          gateLockCleanupRef.current = createScrollLock(window.scrollY);
        }
      } else if (gateLockCleanupRef.current) {
        gateLockCleanupRef.current();
        gateLockCleanupRef.current = null;
        scrollHintAttemptsRef.current = 0;
        lastHintBumpAtRef.current = 0;
        setScrollHintLevel(0);
      }
    };

    const trigger = ScrollTrigger.create({
      trigger: triggerEl,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.2,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (
          phaseRef.current === "animating-forward" ||
          phaseRef.current === "animating-reverse" ||
          phaseRef.current === "completed"
        ) {
          return;
        }

        let progress = self.progress;

        if (phaseRef.current === "gate") {
          const lockPosition = self.start + (self.end - self.start) * GATE_PROGRESS;
          self.scroll(lockPosition);
          progress = GATE_PROGRESS;
          setGateActive(true);
        } else if (progress >= GATE_PROGRESS) {
          const lockPosition = self.start + (self.end - self.start) * GATE_PROGRESS;
          self.scroll(lockPosition);
          progress = GATE_PROGRESS;
          setGateActive(true);
          setPhaseState("gate");
        } else {
          setGateActive(false);
          if (phaseRef.current !== "intro") setPhaseState("intro");
        }

        updateIntroText(progress / GATE_PROGRESS);
        renderBlack();
      },
      onLeave: () => {
        if (phaseRef.current === "intro") setGateActive(false);
      },
      onEnterBack: () => {
        if (phaseRef.current !== "completed") return;
        clearPoemText();
        setActionText(SEREFE_TEXT);
        setActionFlapVisual({
          autoAlpha: 1,
          y: completedActionOffsetY,
          filter: "blur(0px)",
        });
        renderFrame(frameCount);
      },
      onLeaveBack: () => {
        if (phaseRef.current === "intro") setGateActive(false);
      },
    });

    unlockActionRef.current = () => {
      if (phaseRef.current !== "gate") return;
      setGateActive(false);
      activeTweenRef.current?.kill();
      setPhaseState("animating-forward");
      setActionFlapVisual({ autoAlpha: 1, y: 0, filter: "blur(0px)" });

      const forwardState = { frame: 1, poem: 1 };
      const forwardTimeline = gsap.timeline({
        onComplete: () => {
          renderFrame(frameCount);
          clearPoemText();
          setActionText(SEREFE_TEXT);
          setActionFlapVisual({
            autoAlpha: 1,
            y: completedActionOffsetY,
            filter: "blur(0px)",
          });
          setPhaseState("completed");
          activeTweenRef.current = null;
        },
      });

      forwardTimeline
        .to(forwardState, {
          poem: 0,
          duration: 1.1,
          ease: "power2.inOut",
          onUpdate: () => {
            updateIntroText(forwardState.poem);
          },
          onComplete: () => {
            clearPoemText();
          },
        })
        .add(() => {
          renderFrame(1);
        })
        .add(runSplitFlap(SEREFE_TEXT) ?? gsap.timeline())
        .to(
          actionFlapRef.current,
          {
            autoAlpha: 0,
            y: -14,
            filter: "blur(9px)",
            duration: 1.05,
            ease: "power2.inOut",
          },
          "+=0.45"
        )
        .to(forwardState, {
          frame: frameCount,
          ease: FRAME_EASE,
          duration: FORWARD_DURATION,
          onStart: () => {
            renderFrame(1);
          },
          onUpdate: () => {
            const frame = Math.round(forwardState.frame);
            renderFrame(frame);
          },
        });

      activeTweenRef.current = forwardTimeline;
    };

    reverseActionRef.current = () => {
      if (phaseRef.current !== "completed") return;
      activeTweenRef.current?.kill();
      setPhaseState("animating-reverse");
      clearPoemText();

      const reverseState = { frame: frameCount };
      renderFrame(frameCount);
      const reverseTimeline = gsap.timeline({
        onComplete: () => {
          setPhaseState("gate");
          setGateActive(true);
          setActionText(LAST_LINE_ACTION);
          setActionFlapVisual({ autoAlpha: 1, y: 0, filter: "blur(0px)" });
          const poemState = { progress: 0 };
          gsap.to(poemState, {
            progress: 1,
            duration: 1.05,
            ease: "power2.out",
            onUpdate: () => {
              updateIntroText(poemState.progress);
            },
          });
          activeTweenRef.current = null;
        },
      });

      reverseTimeline
        .to(actionFlapRef.current, {
          autoAlpha: 0,
          y: completedActionOffsetY + 14,
          filter: "blur(9px)",
          duration: 0.48,
          ease: "power2.inOut",
        })
        .to(reverseState, {
          frame: 1,
          ease: FRAME_EASE,
          duration: FORWARD_DURATION,
          onUpdate: () => {
            const frame = Math.round(reverseState.frame);
            renderFrame(frame);
          },
        });

      activeTweenRef.current = reverseTimeline;
    };

    gsap.set(introOverlay, { autoAlpha: 1 });
    renderBlack();

    return () => {
      unlockActionRef.current = () => {};
      reverseActionRef.current = () => {};
      activeTweenRef.current?.kill();
      activeTweenRef.current = null;
      if (gateLockCleanupRef.current) {
        gateLockCleanupRef.current();
        gateLockCleanupRef.current = null;
      }
      trigger.kill();
      if (resizeRafId !== null) window.cancelAnimationFrame(resizeRafId);
      window.removeEventListener("resize", scheduleCanvasResize);
      window.removeEventListener("orientationchange", scheduleCanvasResize);
    };
  }, [isActivated, completedActionOffsetY]);

  return (
    <section
      ref={sectionRef}
      id="raki-frames"
      className="relative z-10 w-full"
      style={{ height: "320svh" }}
    >
      <div ref={stickyRef} className="sticky top-0 h-[100svh] w-full">
        <canvas ref={canvasRef} className="absolute left-0 h-full w-full" />
        <div
          ref={introOverlayRef}
          className="pointer-events-none absolute inset-0 flex items-center justify-center px-5 sm:px-10"
        >
          <div className="relative mx-auto h-[min(80vh,760px)] w-full max-w-[min(98vw,1500px)] text-[clamp(0.66rem,1.95vw,2.9rem)] font-semibold leading-[1.28] text-white [text-shadow:0_0_26px_rgba(0,0,0,0.75)]">
            <div className="absolute left-1/2 top-1/2 w-[min(92vw,1200px)] -translate-x-1/2 -translate-y-[108%] text-left">
              <div className={showPoem ? "opacity-100" : "opacity-0"}>
                {INTRO_LINES.map((line, index) => (
                  <p
                    key={`raki-intro-${index}`}
                    ref={(el) => {
                      lineRefs.current[index] = el;
                    }}
                    className="min-h-[1.3em] whitespace-nowrap"
                  />
                ))}
              </div>

              <p className="min-h-[1.3em] whitespace-nowrap">
                <span className="relative inline-block">
                  <span aria-hidden className="invisible">
                    {LAST_LINE_PREFIX}
                  </span>
                  <span
                    ref={lastPrefixRef}
                    className={`absolute inset-0 transition-opacity duration-150 ${showPoem ? "opacity-100" : "opacity-0"}`}
                  />
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (phase === "completed") reverseActionRef.current();
                    else unlockActionRef.current();
                  }}
                  className={`pointer-events-auto inline bg-transparent px-0 align-baseline font-bold leading-[1.28] transition duration-200 ${
                    isGateActive || phase === "animating-forward" || phase === "animating-reverse" || phase === "completed"
                      ? "opacity-100"
                      : "opacity-0"
                  } ${
                    phase === "completed"
                      ? "cursor-pointer text-[#ffe39a]"
                      : isGateActive
                        ? "cursor-pointer text-[#f5d27a] animate-pulse"
                        : "cursor-default text-[#f5d27a]"
                  }`}
                >
                  <span
                    ref={actionFlapRef}
                    className="inline-block px-[0.16em] tracking-[0.06em] [perspective:1000px] [transform-style:preserve-3d]"
                  >
                    <span ref={actionTextRef} className="inline-block will-change-transform">
                      {actionText}
                    </span>
                  </span>
                </button>
                <span
                  className={`mt-1 block w-full text-center text-[clamp(0.74rem,1.15vw,0.95rem)] font-medium leading-tight tracking-[0.02em] text-white/78 transition-[opacity,transform] duration-250 ${
                    phase === "completed" ? "opacity-100" : "opacity-0"
                  }`}
                  style={{
                    transform:
                      phase === "completed"
                        ? `translateY(${completedActionOffsetY + COMPLETED_HINT_GAP_Y}px)`
                        : "translateY(0px)",
                  }}
                >
                  {RETURN_TO_POEM_HINT[lang]}
                </span>
              </p>
            </div>

            <p
              className={`absolute left-1/2 top-[calc(50%+4.8rem)] mx-auto w-full max-w-[min(92vw,920px)] -translate-x-1/2 text-[clamp(0.78rem,1.4vw,1.03rem)] font-medium tracking-[0.04em] text-white/85 transition-all duration-300 ${
                isGateActive ? "opacity-100" : "opacity-0"
              } ${scrollHintLevel > 0 ? "scale-[1.03] text-[#f5d27a]" : ""} ${
                scrollHintLevel > 1 ? "animate-pulse text-[#ffd67f]" : ""
              }`}
            >
              {scrollHintLevel === 0 &&
                'bu bölümü geçmek için "bi tık"a tıkla'}
              {scrollHintLevel === 1 &&
                'hadi anam, tıkla şuna'}
              {scrollHintLevel === 2 &&
                'iyi sen bilirsin, sabaha kadar kaydırabilirsin, tıklamadan geçemeyeceksin'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
