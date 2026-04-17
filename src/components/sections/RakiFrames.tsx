"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function RakiFrames() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [isActivated, setIsActivated] = useState(false);

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
    if (!isActivated) return;

    gsap.registerPlugin(ScrollTrigger);

    const canvasElement = canvasRef.current;
    const triggerEl = sectionRef.current;
    const sticky = stickyRef.current;
    const canvasContext = canvasElement?.getContext("2d");
    if (!canvasElement || !canvasContext || !triggerEl || !sticky) return;
    const canvas = canvasElement;
    const context = canvasContext;

    const frameCount = 56;
    const currentFrame = (index: number) =>
      `/videos/raki-frames-1080p/frame-${String(index).padStart(4, "0")}.jpg`;

    const images: HTMLImageElement[] = [];
    const frameState = { frame: 1 };

    let loadedCount = 0;
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === 1) render();
      };
      images.push(img);
    }

    const setCanvasSize = () => {
      // Keep sequence stable on mobile where browser chrome affects viewport height.
      canvas.width = sticky.clientWidth;
      canvas.height = sticky.clientHeight;
      render();
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

    function render() {
      const img = images[frameState.frame - 1];
      if (!img?.complete || !img.width || !img.height) return;

      context.fillStyle = "rgb(10, 10, 10)";
      context.fillRect(0, 0, canvas.width, canvas.height);

      const scale = Math.max(
        canvas.width / img.width,
        canvas.height / img.height
      );
      const x = canvas.width / 2 - (img.width / 2) * scale;
      const y = canvas.height / 2 - (img.height / 2) * scale;
      context.drawImage(img, x, y, img.width * scale, img.height * scale);
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerEl,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.15,
        invalidateOnRefresh: true,
      },
    });

    tl.to(
      frameState,
      {
        frame: frameCount,
        snap: "frame",
        ease: "none",
        duration: frameCount - 1,
        onUpdate: render,
      },
      0
    );

    return () => {
      if (resizeRafId !== null) window.cancelAnimationFrame(resizeRafId);
      window.removeEventListener("resize", scheduleCanvasResize);
      window.removeEventListener("orientationchange", scheduleCanvasResize);
      tl.kill();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.vars.trigger === triggerEl) t.kill();
      });
    };
  }, [isActivated]);

  return (
    <section
      ref={sectionRef}
      id="raki-frames"
      className="relative z-10 w-full"
      style={{ height: "320svh" }}
    >
      <div ref={stickyRef} className="sticky top-0 h-[100svh] w-full">
        <canvas ref={canvasRef} className="absolute left-0 h-full w-full" />
      </div>
    </section>
  );
}
