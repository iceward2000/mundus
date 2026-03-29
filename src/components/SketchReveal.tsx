"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { useLanguage, type TranslationKey } from "@/context/LanguageContext";

interface StrokePoint {
  x: number;
  y: number;
  width: number;
}

interface SketchConfig {
  minWidth: number;
  maxWidth: number;
  tension: number;
  damping: number;
}

type ShapeMode = "diamond" | "heart" | "spade" | "club";

const DEFAULT_CONFIG: SketchConfig = {
  minWidth: 12,
  maxWidth: 122,
  tension: 0.12,
  damping: 0.72,
};

const SLIDER_DEFS: {
  key: keyof SketchConfig;
  labelKey: TranslationKey;
  min: number;
  max: number;
  step: number;
  tooltipKey: TranslationKey;
}[] = [
    {
      key: "minWidth",
      labelKey: "sketch.slider.minWidth.label",
      min: 0,
      max: 200,
      step: 1,
      tooltipKey: "sketch.slider.minWidth.tooltip",
    },
    {
      key: "maxWidth",
      labelKey: "sketch.slider.maxWidth.label",
      min: 0,
      max: 400,
      step: 1,
      tooltipKey: "sketch.slider.maxWidth.tooltip",
    },
    {
      key: "tension",
      labelKey: "sketch.slider.tension.label",
      min: 0,
      max: 1,
      step: 0.01,
      tooltipKey: "sketch.slider.tension.tooltip",
    },
    {
      key: "damping",
      labelKey: "sketch.slider.damping.label",
      min: 0,
      max: 1,
      step: 0.01,
      tooltipKey: "sketch.slider.damping.tooltip",
    },
  ];

// ── Portal-based Tooltip ────────────────────────────────────
// Rendered via createPortal at document.body to escape any parent
// overflow:hidden. Position is computed from the trigger's bounding
// rect and auto-flips horizontally if it would clip the left edge.
const SliderTooltip = ({
  text,
  describedById,
  triggerAriaLabel,
}: {
  text: string;
  describedById: string;
  triggerAriaLabel: string;
}) => {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const updatePos = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tipW = 200;
    const tipH = 72;

    let left = rect.left - tipW - 10;
    let top = rect.top + rect.height / 2;

    if (left < 8) left = rect.right + 10;
    const half = tipH / 2;
    if (top - half < 8) top = 8 + half;
    else if (top + half > window.innerHeight - 8)
      top = window.innerHeight - 8 - half;

    setPos({ top, left });
  }, []);

  const show = useCallback(() => {
    clearTimeout(timeoutRef.current);
    updatePos();
    setVisible(true);
  }, [updatePos]);

  const hide = useCallback(() => {
    timeoutRef.current = setTimeout(() => setVisible(false), 120);
  }, []);

  const toggle = useCallback(() => {
    setVisible((v) => {
      if (!v) updatePos();
      return !v;
    });
  }, [updatePos]);

  return (
    <span className="sketch-tooltip-anchor">
      <button
        ref={triggerRef}
        type="button"
        className="sketch-tooltip-trigger"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={toggle}
        aria-describedby={describedById}
        aria-label={triggerAriaLabel}
      >
        ?
      </button>
      {mounted &&
        createPortal(
          <div
            id={describedById}
            role="tooltip"
            className={`sketch-tooltip-card ${visible ? "sketch-tooltip-visible" : ""}`}
            style={{
              top: pos.top,
              left: pos.left,
              transform: `translateY(-50%) scale(${visible ? 1 : 0.92})`,
            }}
          >
            {text}
          </div>,
          document.body
        )}
    </span>
  );
};

// ── Card-suit shape icons (inline SVG) ──────────────────────
const SHAPE_SVGS: Record<ShapeMode, React.ReactNode> = {
  diamond: <path d="M10 2L16.5 10L10 18L3.5 10Z" />,
  heart: (
    <path d="M10 16.5C10 16.5 2 11.5 2 7C2 4.2 4 2.5 6.2 2.5C8 2.5 9.4 3.8 10 5C10.6 3.8 12 2.5 13.8 2.5C16 2.5 18 4.2 18 7C18 11.5 10 16.5 10 16.5Z" />
  ),
  spade: (
    <>
      <path d="M10 2C10 2 2 8.5 2 12.5C2 15 3.8 16.5 5.8 16.5C7.6 16.5 9 15 10 13.5C11 15 12.4 16.5 14.2 16.5C16.2 16.5 18 15 18 12.5C18 8.5 10 2 10 2Z" />
      <rect x="8.5" y="14.5" width="3" height="4" rx="0.5" />
    </>
  ),
  club: (
    <>
      <circle cx="10" cy="6.5" r="3.5" />
      <circle cx="5.5" cy="12" r="3.5" />
      <circle cx="14.5" cy="12" r="3.5" />
      <rect x="8.5" y="13" width="3" height="5" rx="0.5" />
    </>
  ),
};

const SHAPE_LABEL_KEYS: Record<ShapeMode, TranslationKey> = {
  diamond: "sketch.shape.diamond",
  heart: "sketch.shape.heart",
  spade: "sketch.shape.spade",
  club: "sketch.shape.club",
};

const ShapeIcon = ({
  shape,
  active,
  onClick,
  ariaLabel,
}: {
  shape: ShapeMode;
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`sketch-shape-btn ${active ? "sketch-shape-active" : ""}`}
    aria-label={ariaLabel}
    aria-pressed={active}
  >
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      {SHAPE_SVGS[shape]}
    </svg>
  </button>
);

// ═════════════════════════════════════════════════════════════
// Main component
// ═════════════════════════════════════════════════════════════

const SketchReveal = () => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingEnabled = useRef(false);
  const lastScrollY = useRef(0);
  const hueRef = useRef(0);

  const [config, setConfig] = useState<SketchConfig>(DEFAULT_CONFIG);
  const [panelOpen, setPanelOpen] = useState(true);
  const [shapeMode, setShapeMode] = useState<ShapeMode>("diamond");
  const [panelVisible, setPanelVisible] = useState(false);

  const configRef = useRef<SketchConfig>(DEFAULT_CONFIG);
  configRef.current = config;

  const shapeModeRef = useRef<ShapeMode>("diamond");
  shapeModeRef.current = shapeMode;

  const handleConfigChange = useCallback(
    (key: keyof SketchConfig, value: number) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // ── Scroll-based visibility ────────────────────────────────
  // The canvas container is position:fixed so IntersectionObserver
  // always reports it as visible. Instead we track scrollY directly:
  // panel appears while user is within the first viewport (the sketch
  // drawing area), disappears once they scroll past.
  useEffect(() => {
    const check = () => {
      setPanelVisible(window.scrollY < window.innerHeight);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  // ── Main drawing effect (runs once) ───────────────────────
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

    const COLOR = "#d4af37";
    const GLOW_COLOR = "rgba(212, 175, 55, 0.25)";
    const GLOW_BLUR = 10;
    const VELOCITY_SMOOTH_FRAMES = 7;
    const STAMP_SPACING = 1.5;

    let points: StrokePoint[] = [];
    let smoothVelocity = 0;
    let currentWidth = configRef.current.maxWidth;
    let widthVelocity = 0;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let dpr = window.devicePixelRatio || 1;
    let hasDrawn = false;

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
      currentWidth = configRef.current.maxWidth;
      widthVelocity = 0;
      smoothVelocity = 0;
      hasDrawn = false;
    };
    window.addEventListener("resize", resize);
    resize();

    const getTargetWidth = (velocity: number): number => {
      const { minWidth, maxWidth } = configRef.current;
      const normalizedVel = Math.min(velocity / 1.8, 1);
      const t = normalizedVel * normalizedVel;
      return maxWidth - t * (maxWidth - minWidth);
    };

    const updateWidth = (targetWidth: number, dt: number): number => {
      const { minWidth, maxWidth, tension, damping } = configRef.current;
      const clampedDt = Math.min(dt, 64);
      const substeps = Math.max(1, Math.round(clampedDt / 8));
      const subDt = clampedDt / substeps;

      for (let i = 0; i < substeps; i++) {
        const force = (targetWidth - currentWidth) * tension;
        const damp = -widthVelocity * damping;
        widthVelocity += (force + damp) * (subDt / 16);
        currentWidth += widthVelocity * (subDt / 16);
      }

      currentWidth = Math.max(minWidth, Math.min(maxWidth, currentWidth));
      return currentWidth;
    };

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

    // Draws one stamp at (x, y) with radius r using the active card suit.
    // All sub-paths are appended to the current beginPath batch — the
    // caller handles beginPath/fill for efficient glow rendering.
    const stampShape = (x: number, y: number, r: number) => {
      const mode = shapeModeRef.current;

      if (mode === "diamond") {
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + r * 0.6, y);
        ctx.lineTo(x, y + r);
        ctx.lineTo(x - r * 0.6, y);
        ctx.closePath();
      } else if (mode === "heart") {
        ctx.moveTo(x, y + r * 0.75);
        ctx.bezierCurveTo(
          x + r * 0.05, y + r * 0.55,
          x + r, y + r * 0.05,
          x + r * 0.55, y - r * 0.45
        );
        ctx.bezierCurveTo(
          x + r * 0.2, y - r * 0.85,
          x, y - r * 0.55,
          x, y - r * 0.2
        );
        ctx.bezierCurveTo(
          x, y - r * 0.55,
          x - r * 0.2, y - r * 0.85,
          x - r * 0.55, y - r * 0.45
        );
        ctx.bezierCurveTo(
          x - r, y + r * 0.05,
          x - r * 0.05, y + r * 0.55,
          x, y + r * 0.75
        );
      } else if (mode === "spade") {
        ctx.moveTo(x, y - r * 0.8);
        ctx.bezierCurveTo(
          x + r * 0.05, y - r * 0.55,
          x + r, y - r * 0.05,
          x + r * 0.55, y + r * 0.35
        );
        ctx.bezierCurveTo(
          x + r * 0.2, y + r * 0.75,
          x + r * 0.05, y + r * 0.45,
          x, y + r * 0.15
        );
        ctx.bezierCurveTo(
          x - r * 0.05, y + r * 0.45,
          x - r * 0.2, y + r * 0.75,
          x - r * 0.55, y + r * 0.35
        );
        ctx.bezierCurveTo(
          x - r, y - r * 0.05,
          x - r * 0.05, y - r * 0.55,
          x, y - r * 0.8
        );
        ctx.moveTo(x - r * 0.12, y + r * 0.35);
        ctx.lineTo(x + r * 0.12, y + r * 0.35);
        ctx.lineTo(x + r * 0.15, y + r);
        ctx.lineTo(x - r * 0.15, y + r);
        ctx.closePath();
      } else {
        const cr = r * 0.36;
        ctx.moveTo(x + cr, y - r * 0.3);
        ctx.arc(x, y - r * 0.3, cr, 0, Math.PI * 2);
        ctx.moveTo(x - r * 0.38 + cr, y + r * 0.15);
        ctx.arc(x - r * 0.38, y + r * 0.15, cr, 0, Math.PI * 2);
        ctx.moveTo(x + r * 0.38 + cr, y + r * 0.15);
        ctx.arc(x + r * 0.38, y + r * 0.15, cr, 0, Math.PI * 2);
        ctx.moveTo(x - r * 0.12, y + r * 0.35);
        ctx.lineTo(x + r * 0.12, y + r * 0.35);
        ctx.lineTo(x + r * 0.15, y + r);
        ctx.lineTo(x - r * 0.15, y + r);
        ctx.closePath();
      }
    };

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
        const sx = catmullRom(p0.x, p1.x, p2.x, p3.x, t);
        const sy = catmullRom(p0.y, p1.y, p2.y, p3.y, t);
        const w = p1.width + (p2.width - p1.width) * t;
        const sr = Math.max(0.5, w / 2);
        stampShape(sx, sy, sr);
      }
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (window.scrollY > 100) return;
      if (!isDrawingEnabled.current) return;

      const now = performance.now();
      const dt = now - lastTime;
      lastTime = now;

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const dist = Math.hypot(x - lastX, y - lastY);
      const instantVelocity = dt > 0 ? dist / dt : 0;

      const alpha = 2 / (VELOCITY_SMOOTH_FRAMES + 1);
      smoothVelocity =
        smoothVelocity * (1 - alpha) + instantVelocity * alpha;

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
        ctx.shadowColor = GLOW_COLOR;
        ctx.shadowBlur = GLOW_BLUR;
        ctx.fillStyle = COLOR;
        ctx.beginPath();
        stampShape(x, y, Math.max(0.5, width / 2));
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }

      if (points.length > 50) {
        points = points.slice(-30);
      }
    };

    const onMouseMove = (e: MouseEvent) =>
      handleMove(e.clientX, e.clientY);

    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 100) return;
      if (!isDrawingEnabled.current) return;
      if (e.touches.length !== 1) return;

      const rect = canvas.getBoundingClientRect();
      lastX = e.touches[0].clientX - rect.left;
      lastY = e.touches[0].clientY - rect.top;
      lastTime = performance.now();
      smoothVelocity = 0;
      currentWidth = configRef.current.maxWidth;
      widthVelocity = 0;
      points = [];
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleClearAll = () => {
      if (window.scrollY > 100) return;
      if (!isDrawingEnabled.current) return;

      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      points = [];
      currentWidth = configRef.current.maxWidth;
      widthVelocity = 0;
      smoothVelocity = 0;
      hasDrawn = false;
    };

    const handleEraseAndStamp = (x: number, y: number) => {
      if (window.scrollY > 100) return;
      if (!isDrawingEnabled.current) return;

      const eraseRadius = 150;
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, eraseRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.shadowColor = GLOW_COLOR;
      ctx.shadowBlur = GLOW_BLUR;
      ctx.fillStyle = COLOR;
      ctx.beginPath();
      stampShape(x, y, Math.max(0.5, configRef.current.maxWidth / 2));
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      points = [];
      currentWidth = configRef.current.maxWidth;
      widthVelocity = 0;
      smoothVelocity = 0;
      hasDrawn = true;
    };

    const onRightClick = (e: MouseEvent) => {
      e.preventDefault();
      handleClearAll();
    };

    const onLeftClick = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      handleEraseAndStamp(x, y);
    };

    let lastTapTime = 0;
    const onTouchEnd = (e: TouchEvent) => {
      const now = performance.now();
      if (now - lastTapTime < 350 && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        handleEraseAndStamp(x, y);
      }
      lastTapTime = now;
    };

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

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onLeftClick);
    window.addEventListener("contextmenu", onRightClick);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onLeftClick);
      window.removeEventListener("contextmenu", onRightClick);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("mundus-entered", handleEnter);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
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

      {/* ── Floating Control Panel ─────────────────────────── */}
      <div
        className={`sketch-panel-wrapper ${panelVisible ? "sketch-panel-in-view" : ""}`}
      >
        <button
          onClick={() => setPanelOpen((o) => !o)}
          aria-label={
            panelOpen ? t("sketch.toggleCollapse") : t("sketch.toggleExpand")
          }
          className="sketch-panel-toggle"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{
              transform: panelOpen ? "rotate(0deg)" : "rotate(180deg)",
              transition: "transform 0.3s ease",
            }}
          >
            <path
              d="M10 3L5 8L10 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Panel body — overflow is visible when open so nothing clips */}
        <div
          className="sketch-panel"
          style={{
            width: panelOpen ? "min(360px, calc(100vw - 56px))" : 0,
            opacity: panelOpen ? 1 : 0,
            padding: panelOpen ? "16px 20px" : "16px 0",
            overflow: panelOpen ? "visible" : "hidden",
            pointerEvents: panelOpen ? "auto" : "none",
          }}
        >
          <h3 className="sketch-panel-title">{t("sketch.panelTitle")}</h3>

          {SLIDER_DEFS.map(({ key, labelKey, min, max, step, tooltipKey }) => (
            <div key={key} className="sketch-slider-row">
              <label
                htmlFor={`sketch-${key}`}
                className="sketch-slider-label"
              >
                <span className="sketch-slider-label-text">{t(labelKey)}</span>
                <SliderTooltip
                  text={t(tooltipKey)}
                  describedById={`sketch-tip-${key}`}
                  triggerAriaLabel={t("sketch.tooltip.paramInfo")}
                />
              </label>
              <input
                id={`sketch-${key}`}
                type="range"
                min={min}
                max={max}
                step={step}
                value={config[key]}
                onChange={(e) =>
                  handleConfigChange(key, Number(e.target.value))
                }
                className="sketch-slider-input"
                aria-describedby={`sketch-tip-${key}`}
              />
              <span className="sketch-slider-value">{config[key]}</span>
            </div>
          ))}

          {/* ── Shape Selector (card suits) ──────────────── */}
          <div className="sketch-shape-section">
            <span className="sketch-shape-label">{t("sketch.shape")}</span>
            <div className="sketch-shape-group">
              {(["diamond", "heart", "spade", "club"] as ShapeMode[]).map(
                (s) => (
                  <ShapeIcon
                    key={s}
                    shape={s}
                    active={shapeMode === s}
                    onClick={() => setShapeMode(s)}
                    ariaLabel={`${t(SHAPE_LABEL_KEYS[s])} ${t("sketch.shape.brushShape")}`}
                  />
                )
              )}
            </div>
          </div>

          <button
            onClick={() => {
              setConfig(DEFAULT_CONFIG);
              setShapeMode("diamond");
            }}
            className="sketch-panel-reset"
          >
            {t("sketch.reset")}
          </button>
        </div>
      </div>
    </>
  );
};

export default SketchReveal;
