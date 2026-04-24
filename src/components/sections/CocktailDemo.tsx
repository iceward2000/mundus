"use client";

import { useEffect, useRef, useState } from "react";
import CocktailReveal from "@/components/CocktailReveal";
import VideoAudioToggle from "@/components/VideoAudioToggle";

export default function CocktailDemo() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: "500px 0px" }
    );

    observer.observe(sectionRef.current);
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

    return () => {
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("loadedmetadata", tryPlay);
    };
  }, [shouldLoadVideo]);

  return (
    <section
      ref={sectionRef}
      id="cocktail-demo"
      className="relative z-10 w-full overflow-hidden bg-black min-h-[78svh] md:min-h-screen"
    >
      <video
        ref={videoRef}
        autoPlay={shouldLoadVideo}
        loop
        muted
        playsInline
        preload="none"
        className="pointer-events-none absolute inset-0 w-full h-full object-cover object-center"
      >
        <source src="/videos/cocktail-compressed.webm" type="video/webm" />
        <source src="/videos/cocktail-compressed.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 z-10 bg-black/30" />

      <div className="absolute inset-0 z-20">
        <CocktailReveal />
      </div>

      <VideoAudioToggle
        videoRef={videoRef}
        audioSrc="/audio/mundus-cocktail-audio.mp3"
        sourceId="cocktail"
      />
    </section>
  );
}
