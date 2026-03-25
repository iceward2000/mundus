"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function RakiFrames() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasLayerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !sectionRef.current) return;

    const frameCount = 59;
    const currentFrame = (index: number) => {
      const fileNumber = frameCount - index + 1;
      return `/${encodeURI("rakı frame 2")}/${fileNumber}.png`;
    };

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
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render();
    };
    window.addEventListener("resize", setCanvasSize);
    setCanvasSize();

    function render() {
      if (!images[frameState.frame - 1]?.complete) return;

      // Keep a stable background in this section (no dynamic color tween)
      context!.fillStyle = "rgb(10, 10, 10)";
      context!.fillRect(0, 0, canvas!.width, canvas!.height);

      const img = images[frameState.frame - 1];

      const scale = Math.max(
        canvas!.width / img.width,
        canvas!.height / img.height
      );

      const x = (canvas!.width / 2) - (img.width / 2) * scale;
      const y = (canvas!.height / 2) - (img.height / 2) * scale;

      context!.drawImage(img, x, y, img.width * scale, img.height * scale);
    }

    // Use the tall section as trigger — no pin needed since we use CSS sticky.
    // Extra scroll space provides hold + circular handoff into the globe section.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.15,
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

    if (canvasLayerRef.current) {
      // Keep a short hold at the last frame so fast scrolling does not skip the handoff.
      tl.to({}, { duration: 8 }, frameCount + 2);

      // Circle video-style transition:
      // the rakı layer exits via clip-path + vertical movement (no opacity fade).
      tl.to(
        canvasLayerRef.current,
        {
          clipPath: "circle(0% at 50% 50%)",
          webkitClipPath: "circle(0% at 50% 50%)",
          yPercent: -14,
          scale: 0.72,
          ease: "power3.inOut",
          duration: 14,
        },
        frameCount + 10
      );
    }

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      ScrollTrigger.getAll().forEach((t) => {
        if (t.vars.trigger === sectionRef.current) t.kill();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="raki-frames"
      className="relative z-10 w-full bg-[rgb(10,10,10)]"
      style={{ height: "700vh" }}
    >
      <div
        ref={canvasLayerRef}
        className="sticky top-0 z-10 w-full h-screen overflow-hidden will-change-transform"
        style={{
          clipPath: "circle(150% at 50% 50%)",
          WebkitClipPath: "circle(150% at 50% 50%)",
          transformOrigin: "50% 50%",
        }}
      >
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
      </div>
    </section>
  );
}
