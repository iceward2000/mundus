"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SparklingFrames() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !sectionRef.current) return;

    const frameCount = 145;
    const currentFrame = (index: number) =>
      `/sparkling%20frame%203/${index}.png`;

    const images: HTMLImageElement[] = [];
    const frameState = { frame: 1 };

    const bgColorRef = { value: "rgb(10, 10, 10)" };

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
      if (images[frameState.frame - 1]?.complete) {
        context!.fillStyle = bgColorRef.value;
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
    }

    // Use the tall section as trigger — no pin needed since we use CSS sticky
    // The section is 500vh tall, the sticky canvas sticks for 400vh of scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.15,
      },
    });

    tl.to(frameState, {
      frame: frameCount,
      snap: "frame",
      ease: "none",
      duration: frameCount - 1,
      onUpdate: render,
    }, 0);

    const colorProxy = { progress: 0 };
    tl.to(colorProxy, {
      progress: 1,
      ease: "none",
      duration: 34,
      onUpdate: () => {
        const p = colorProxy.progress;
        const r = Math.round(10 + 245 * p);
        const g = Math.round(10 + 245 * p);
        const b = Math.round(10 + 245 * p);

        const tr = Math.round(237 - 237 * p);
        const tg = Math.round(237 - 237 * p);
        const tb = Math.round(237 - 237 * p);

        bgColorRef.value = `rgb(${r}, ${g}, ${b})`;

        const root = document.documentElement;
        root.style.setProperty("--background", `rgb(${r}, ${g}, ${b})`);
        root.style.setProperty("--foreground", `rgb(${tr}, ${tg}, ${tb})`);
        root.style.setProperty("--contact-text", `rgb(${tr}, ${tg}, ${tb})`);
        root.style.setProperty("--contact-text-dim", `rgba(${tr}, ${tg}, ${tb}, 0.6)`);
        root.style.setProperty("--contact-text-muted", `rgba(${tr}, ${tg}, ${tb}, 0.5)`);
        root.style.setProperty("--contact-border", `rgba(${tr}, ${tg}, ${tb}, 0.2)`);
        root.style.setProperty("--contact-footer", `rgba(${tr}, ${tg}, ${tb}, 0.3)`);
      },
    }, 0);

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
      id="sparkling-frames"
      className="relative z-10 w-full"
      style={{ height: "500vh" }}
    >
      <div className="sticky top-0 w-full h-screen">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
    </section>
  );
}
