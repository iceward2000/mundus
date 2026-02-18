"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface StrokePoint {
  x: number;
  y: number;
  width: number;
}

const SketchReveal = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingEnabled = useRef(false);
  const lastScrollY = useRef(0);
  const hueRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    lastScrollY.current = window.scrollY;
    gsap.set(canvas, { "--hue-rotate": 0, "--blur": 0 });

    if (
      typeof window !== "undefined" &&
      sessionStorage.getItem("mundus-age-verified") === "true"
    ) {
      isDrawingEnabled.current = true;
    }
    const handleEnter = () => {
      isDrawingEnabled.current = true;
    };
    window.addEventListener("mundus-entered", handleEnter);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Config ──────────────────────────────────────────────
    const MIN_WIDTH = 1.5;
    const MAX_WIDTH = 152;
    const COLOR = "#d4af37";
    const GLOW_COLOR = "rgba(212, 175, 55, 0.25)";
    const GLOW_BLUR = 10;
    const VELOCITY_SMOOTH_FRAMES = 7;
    const WIDTH_TENSION = 0.1;
    const WIDTH_DAMPING = 0.72;
    const STAMP_SPACING = 0.2;

    // ── State ───────────────────────────────────────────────
    let points: StrokePoint[] = [];
    let smoothVelocity = 0;
    let currentWidth = MAX_WIDTH;
    let widthVelocity = 0;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let dpr = window.devicePixelRatio || 1;
    let hasDrawn = false;

    // ── Resize (DPR-aware for retina sharpness) ────────────
    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      points = [];
      currentWidth = MAX_WIDTH;
      widthVelocity = 0;
      smoothVelocity = 0;
      hasDrawn = false;
    };
    window.addEventListener("resize", resize);
    resize();

    // ── Velocity → target width (quadratic easing) ─────────
    const getTargetWidth = (velocity: number): number => {
      const normalizedVel = Math.min(velocity / 1.8, 1);
      const t = normalizedVel * normalizedVel;
      return MAX_WIDTH - t * (MAX_WIDTH - MIN_WIDTH);
    };

    // ── Spring physics for smooth width transitions ────────
    const updateWidth = (targetWidth: number, dt: number): number => {
      const clampedDt = Math.min(dt, 64);
      const substeps = Math.max(1, Math.round(clampedDt / 8));
      const subDt = clampedDt / substeps;

      for (let i = 0; i < substeps; i++) {
        const force = (targetWidth - currentWidth) * WIDTH_TENSION;
        const damping = -widthVelocity * WIDTH_DAMPING;
        widthVelocity += (force + damping) * (subDt / 16);
        currentWidth += widthVelocity * (subDt / 16);
      }

      currentWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, currentWidth));
      return currentWidth;
    };

    // ── Catmull-Rom spline interpolation ───────────────────
    const catmullRom = (
      p0: number,
      p1: number,
      p2: number,
      p3: number,
      t: number
    ): number => {
      const t2 = t * t;
      const t3 = t2 * t;
      return (
        0.5 *
        (2 * p1 +
          (-p0 + p2) * t +
          (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
          (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
      );
    };

    // ── Draw a smooth segment using stamp-based rendering ──
    // Batches all circles into one path for efficient shadow/glow
    const drawSegment = (
      p0: StrokePoint,
      p1: StrokePoint,
      p2: StrokePoint,
      p3: StrokePoint
    ) => {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const segmentLength = Math.hypot(dx, dy);

      if (segmentLength < 0.5) return;

      const avgWidth = (p1.width + p2.width) / 2;
      const stepSize = Math.max(0.5, avgWidth * STAMP_SPACING);
      const steps = Math.max(2, Math.ceil(segmentLength / stepSize));

      ctx.shadowColor = GLOW_COLOR;
      ctx.shadowBlur = GLOW_BLUR;
      ctx.fillStyle = COLOR;

      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = catmullRom(p0.x, p1.x, p2.x, p3.x, t);
        const y = catmullRom(p0.y, p1.y, p2.y, p3.y, t);
        const w = p1.width + (p2.width - p1.width) * t;
        const r = Math.max(0.5, w / 2);
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, Math.PI * 2);
      }
      ctx.fill();

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    };

    // ── Handle pointer movement ────────────────────────────
    const handleMove = (clientX: number, clientY: number) => {
      if (window.scrollY > 100) return;
      if (!isDrawingEnabled.current) return;

      const now = performance.now();
      const dt = now - lastTime;
      lastTime = now;

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Instantaneous velocity (px/ms)
      const dist = Math.hypot(x - lastX, y - lastY);
      const instantVelocity = dt > 0 ? dist / dt : 0;

      // Exponential moving average for buttery smooth velocity
      const alpha = 2 / (VELOCITY_SMOOTH_FRAMES + 1);
      smoothVelocity =
        smoothVelocity * (1 - alpha) + instantVelocity * alpha;

      // Spring-based width transition
      const targetWidth = getTargetWidth(smoothVelocity);
      const width = updateWidth(targetWidth, dt);

      lastX = x;
      lastY = y;
      hasDrawn = true;

      const newPoint: StrokePoint = { x, y, width };
      points.push(newPoint);

      if (points.length >= 4) {
        const len = points.length;
        drawSegment(
          points[len - 4],
          points[len - 3],
          points[len - 2],
          points[len - 1]
        );
      } else if (points.length === 1) {
        // First point — draw a single stamp
        ctx.shadowColor = GLOW_COLOR;
        ctx.shadowBlur = GLOW_BLUR;
        ctx.fillStyle = COLOR;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.5, width / 2), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }

      // Trim point buffer to avoid unbounded growth
      if (points.length > 50) {
        points = points.slice(-30);
      }
    };

    // ── Mouse events ───────────────────────────────────────
    const onMouseMove = (e: MouseEvent) =>
      handleMove(e.clientX, e.clientY);

    // ── Touch events ───────────────────────────────────────
    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 100) return;
      if (!isDrawingEnabled.current) return;
      if (e.touches.length !== 1) return;

      const rect = canvas.getBoundingClientRect();
      lastX = e.touches[0].clientX - rect.left;
      lastY = e.touches[0].clientY - rect.top;
      lastTime = performance.now();
      smoothVelocity = 0;
      currentWidth = MAX_WIDTH;
      widthVelocity = 0;
      points = [];
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    // ── Clear canvas on click / double-tap ─────────────────
    const handleClear = () => {
      if (window.scrollY > 100) return;
      if (!isDrawingEnabled.current) return;

      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      points = [];
      currentWidth = MAX_WIDTH;
      widthVelocity = 0;
      smoothVelocity = 0;
      hasDrawn = false;
    };

    let lastTapTime = 0;
    const onTouchEnd = () => {
      const now = performance.now();
      if (now - lastTapTime < 350) {
        handleClear();
      }
      lastTapTime = now;
    };

    // ── Scroll effect (hue shift, scale, blur) ─────────────
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const deltaY = Math.abs(scrollY - lastScrollY.current);
      lastScrollY.current = scrollY;

      const progress = Math.min(scrollY / vh, 1);
      const scale = 1 + progress;
      const blur = progress * 6;
      hueRef.current += deltaY * 0.5;

      gsap.to(canvas, {
        scale,
        "--blur": blur,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
      gsap.to(canvas, {
        "--hue-rotate": hueRef.current,
        duration: 1.2,
        ease: "power2.out",
      });
    };

    // ── Attach all listeners ───────────────────────────────
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", handleClear);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", handleClear);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("mundus-entered", handleEnter);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-screen z-[1] pointer-events-none mix-blend-screen opacity-50"
      style={{ isolation: "isolate" }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{
          filter:
            "blur(calc(var(--blur) * 1px)) hue-rotate(calc(var(--hue-rotate) * 1deg))",
          willChange: "transform, filter",
        }}
      />
    </div>
  );
};

export default SketchReveal;
