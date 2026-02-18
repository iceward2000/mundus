"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

// ── Asset Manifest ──────────────────────────────────────────────────────────
const IMAGE_ASSETS = [
  "/mundus-text-logo.svg",
  "/hikaye-images/13.png",
  "/hikaye-images/14.png",
  ...Array.from({ length: 144 }, (_, i) => `/cocktail-images/${i + 7}.png`),
];
const AUDIO_ASSETS = ["/audio/loop.mp3"];
const ALL_ASSETS = [...IMAGE_ASSETS, ...AUDIO_ASSETS];

const MIN_LOAD_MS = 1800;

type Phase = "load" | "hold" | "morph" | "done";

export default function AssetPreloader() {
  // ── Refs ─────────────────────────────────────────────────────────────────
  const overlayRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const barTrackRef = useRef<HTMLDivElement>(null);
  const d1 = useRef<HTMLSpanElement>(null);
  const d2 = useRef<HTMLSpanElement>(null);
  const d3 = useRef<HTMLSpanElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // ── State ────────────────────────────────────────────────────────────────
  const [num, setNum] = useState(0);
  const [phase, setPhase] = useState<Phase>("load");
  const [playing, setPlaying] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  const prog = useRef({ actual: 0, display: 0, start: 0 });

  // ── Music toggle ─────────────────────────────────────────────────────────
  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
    } else {
      a.volume = 0.5;
      a.play().catch(console.error);
    }
    setPlaying((p) => !p);
  }, [playing]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    },
    [toggle]
  );

  // ── Morph animation ─────────────────────────────────────────────────────
  const runMorph = useCallback(() => {
    const group = groupRef.current;
    const overlay = overlayRef.current;
    if (!group || !overlay) return;

    const rect = group.getBoundingClientRect();
    const fromCX = rect.left + rect.width / 2;
    const fromCY = rect.top + rect.height / 2;

    const toCX = window.innerWidth - 148;
    const toCY = 42;

    const dx = toCX - fromCX;
    const dy = toCY - fromCY;

    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.style.overflow = "";
        setPhase("done");
        window.dispatchEvent(new Event("mundus-preload-complete"));
      },
    });
    tlRef.current = tl;

    // 1 — Fade out helper elements
    tl.to([percentRef.current, barTrackRef.current], {
      opacity: 0,
      y: 8,
      duration: 0.3,
      ease: "power2.in",
    });

    // 2 — Fly to corner
    tl.to(
      group,
      {
        x: dx,
        y: dy,
        scale: 0.15,
        duration: 1.1,
        ease: "power3.inOut",
      },
      "-=0.1"
    );

    // 3 — Dissolve overlay background
    tl.to(
      overlay,
      {
        backgroundColor: "rgba(5,5,5,0)",
        duration: 0.7,
        ease: "power2.inOut",
      },
      "-=0.85"
    );

    // 4 — Cross-fade: digits blur out
    tl.to(
      [d1.current, d2.current, d3.current],
      {
        opacity: 0,
        filter: "blur(8px)",
        duration: 0.35,
        ease: "power2.in",
      },
      "-=0.5"
    );

    // 5 — Bars spring in
    if (barsRef.current) {
      tl.fromTo(
        barsRef.current.children,
        { opacity: 0, scaleY: 0 },
        {
          opacity: 0.85,
          scaleY: 1,
          duration: 0.4,
          ease: "back.out(1.7)",
          stagger: 0.07,
        },
        "-=0.15"
      );
    }
  }, []);

  // ── Desktop check (synchronous-ish) ──────────────────────────────────────
  useEffect(() => {
    const desktop =
      window.matchMedia("(pointer: fine)").matches && window.innerWidth >= 768;
    setIsDesktop(desktop);
    if (!desktop) setPhase("done");
  }, []);

  // ── Phase 1: Preload all assets ──────────────────────────────────────────
  useEffect(() => {
    if (!isDesktop || phase !== "load") return;

    const html = document.documentElement;
    html.style.overflow = "hidden";
    prog.current.start = Date.now();

    let n = 0;
    const total = ALL_ASSETS.length;
    const bump = () => {
      n++;
      prog.current.actual = Math.round((n / total) * 100);
    };

    IMAGE_ASSETS.forEach((url) => {
      const img = new Image();
      img.onload = bump;
      img.onerror = bump;
      img.src = url;
    });

    AUDIO_ASSETS.forEach((url) => {
      fetch(url)
        .then((r) => r.blob())
        .then(bump)
        .catch(bump);
    });

    let alive = true;
    const tick = () => {
      if (!alive) return;
      const { actual, display, start } = prog.current;

      let next = display + (actual - display) * 0.08;
      if (actual - next < 0.5) next = actual;
      prog.current.display = next;
      setNum(Math.floor(next));

      if (
        actual >= 100 &&
        next >= 99.5 &&
        Date.now() - start >= MIN_LOAD_MS
      ) {
        prog.current.display = 100;
        setNum(100);
        setPhase("hold");
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    return () => {
      alive = false;
      html.style.overflow = "";
    };
  }, [isDesktop, phase]);

  // ── Phase 2: Brief hold at 100, then morph ──────────────────────────────
  useEffect(() => {
    if (phase !== "hold") return;
    const t = setTimeout(() => {
      setPhase("morph");
      requestAnimationFrame(() => requestAnimationFrame(runMorph));
    }, 700);
    return () => clearTimeout(t);
  }, [phase, runMorph]);

  // ── Audio bar wave animation (play/pause) ────────────────────────────────
  useEffect(() => {
    if (phase !== "done" || !barsRef.current) return;
    const bars = Array.from(barsRef.current.children) as HTMLElement[];

    if (playing) {
      bars.forEach((bar, i) => {
        gsap.to(bar, {
          scaleY: 1,
          duration: 0.35 + i * 0.12,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 0.1,
        });
      });
    } else {
      bars.forEach((bar) => {
        gsap.killTweensOf(bar);
        gsap.to(bar, { scaleY: 0.18, duration: 0.35, ease: "power2.out" });
      });
    }

    return () => {
      bars.forEach((bar) => gsap.killTweensOf(bar));
    };
  }, [phase, playing]);

  // ── Cleanup ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      tlRef.current?.kill();
      if (audio) audio.pause();
    };
  }, []);

  // ── Render nothing on mobile ─────────────────────────────────────────────
  if (!isDesktop && phase === "done") return null;

  const full = num >= 100;
  const isDone = phase === "done";

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[10002] bg-[#050505] flex items-center justify-center max-md:hidden"
      style={{ pointerEvents: isDone ? "none" : "auto" }}
    >
      <audio ref={audioRef} src="/audio/loop.mp3" loop preload="auto" />

      <div
        ref={groupRef}
        className="flex flex-col items-center will-change-transform"
        onClick={isDone ? toggle : undefined}
        onKeyDown={isDone ? handleKeyDown : undefined}
        role={isDone ? "button" : undefined}
        aria-label={
          isDone
            ? playing
              ? "Müziği Durdur"
              : "Müziği Oynat"
            : undefined
        }
        tabIndex={isDone ? 0 : undefined}
        style={{
          pointerEvents: isDone ? "auto" : "none",
          cursor: isDone ? "pointer" : "default",
          mixBlendMode: isDone ? "difference" : "normal",
        }}
      >
        {/* ── Number + Bars ────────────────────────────────────────────── */}
        <div className="relative">
          {full ? (
            <div className="font-serif text-[clamp(64px,10vw,140px)] font-extralight text-primary/90 tabular-nums leading-none tracking-tighter flex">
              <span
                ref={d1}
                className="inline-block"
                style={{ willChange: "opacity, filter" }}
              >
                1
              </span>
              <span
                ref={d2}
                className="inline-block"
                style={{ willChange: "opacity, filter" }}
              >
                0
              </span>
              <span
                ref={d3}
                className="inline-block"
                style={{ willChange: "opacity, filter" }}
              >
                0
              </span>
            </div>
          ) : (
            <div className="font-serif text-[clamp(64px,10vw,140px)] font-extralight text-primary/90 tabular-nums leading-none tracking-tighter">
              {num}
            </div>
          )}

          {/* Bars overlay — hidden until morph cross-fades them in */}
          {full && (
            <div
              ref={barsRef}
              className="absolute inset-0 flex items-end justify-center gap-[0.2em] pb-[0.15em]"
            >
              <div
                className="w-[0.14em] h-[0.55em] bg-primary rounded-full origin-bottom"
                style={{ opacity: 0 }}
              />
              <div
                className="w-[0.14em] h-[0.75em] bg-primary rounded-full origin-bottom"
                style={{ opacity: 0 }}
              />
              <div
                className="w-[0.14em] h-[0.55em] bg-primary rounded-full origin-bottom"
                style={{ opacity: 0 }}
              />
            </div>
          )}
        </div>

        {/* ── Percent sign ─────────────────────────────────────────────── */}
        <span
          ref={percentRef}
          className="font-serif text-[clamp(12px,1.5vw,20px)] text-primary/35 font-light mt-3 tracking-[0.3em]"
        >
          %
        </span>

        {/* ── Thin progress track ──────────────────────────────────────── */}
        <div
          ref={barTrackRef}
          className="mt-10 w-20 h-[1px] bg-white/[0.04] rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-primary/20 rounded-full"
            style={{ width: `${num}%`, transition: "width 0.3s ease-out" }}
          />
        </div>
      </div>
    </div>
  );
}
