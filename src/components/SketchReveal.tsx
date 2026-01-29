"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface Point {
  x: number;
  y: number;
}

const SketchReveal = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingEnabled = useRef(false);
  const lastWidth = useRef<number>(0);
  
  const config = {
    minWidth: 1, 
    maxWidth: 40,
    velocityFactor: 2.0,
    color: "#d4af37", 
    smoothing: 0.3, // Controls how quickly the line width changes (0-1)
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Initialize lastWidth
    lastWidth.current = config.maxWidth;

    if (typeof window !== "undefined" && sessionStorage.getItem("mundus-age-verified") === "true") {
      isDrawingEnabled.current = true;
    }

    const handleEnter = () => {
      isDrawingEnabled.current = true;
    };
    window.addEventListener("mundus-entered", handleEnter);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener("resize", resize);
    resize();

    let points: Point[] = [];
    let lastTime = 0;
    
    const getLineWidth = (velocity: number) => {
      const width = config.maxWidth - (velocity * config.velocityFactor);
      return Math.max(config.minWidth, Math.min(config.maxWidth, width));
    };

    const draw = (e: MouseEvent) => {
      if (window.scrollY > 100) return;
      if (!isDrawingEnabled.current) return;

      const currentTime = performance.now();
      const timeDelta = currentTime - lastTime;
      lastTime = currentTime;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const currentPoint = { x, y };
      points.push(currentPoint);

      // Need at least 3 points to draw a smooth curve segment
      if (points.length < 3) return;

      const lastPoint = points[points.length - 2];
      const prevPoint = points[points.length - 3];

      // Calculate velocity based on the latest segment
      // Use the distance between current and last point for velocity
      const distance = Math.hypot(currentPoint.x - lastPoint.x, currentPoint.y - lastPoint.y);
      const velocity = timeDelta > 0 ? distance / timeDelta : 0;
      
      const targetWidth = getLineWidth(velocity);
      
      // Smooth the width transition to avoid blocky segments
      // newWidth = current * (1 - smooth) + target * smooth
      // Higher smoothing factor = faster adaptation
      const newWidth = lastWidth.current * (1 - config.smoothing) + targetWidth * config.smoothing;
      lastWidth.current = newWidth;

      ctx.beginPath();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = config.color;
      ctx.lineWidth = newWidth;

      // Draw smooth curve using midpoints
      // Start from the midpoint between (prev, last)
      // curve through 'last' to midpoint between (last, current)
      
      const mid1 = {
        x: (prevPoint.x + lastPoint.x) / 2,
        y: (prevPoint.y + lastPoint.y) / 2
      };
      
      const mid2 = {
        x: (lastPoint.x + currentPoint.x) / 2,
        y: (lastPoint.y + currentPoint.y) / 2
      };

      ctx.moveTo(mid1.x, mid1.y);
      ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, mid2.x, mid2.y);
      
      ctx.stroke();
      
      if (points.length > 20) points.shift();
    };

    window.addEventListener("mousemove", draw);
    
    const handleClick = (e: MouseEvent) => {
      if (window.scrollY > 100) return;
      if (!isDrawingEnabled.current) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      points = [];
      // Reset width to max so next stroke starts thick
      lastWidth.current = config.maxWidth; 
    };

    window.addEventListener("mousedown", handleClick);

    const handleScroll = () => {
      if (!canvas) return;
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      const progress = Math.min(scrollY / viewportHeight, 1);
      
      const scale = 1 + progress; 
      const blur = progress * 6;
      const hueRotate = progress * 180;
      
      gsap.to(canvas, {
        scale: scale,
        filter: `blur(${blur}px) hue-rotate(${hueRotate}deg)`,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto"
      });
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", draw);
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mundus-entered", handleEnter);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div 
      ref={containerRef} 
      className="fixed top-0 left-0 w-full h-screen z-20 pointer-events-none mix-blend-screen"
      style={{ isolation: "isolate" }}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block"
      />
    </div>
  );
};

export default SketchReveal;
