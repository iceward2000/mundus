"use client";

import { useRef } from "react";
import CocktailReveal from "@/components/CocktailReveal";
import VideoAudioToggle from "@/components/VideoAudioToggle";

export default function CocktailDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section
      id="cocktail-demo"
      className="relative z-10 w-full overflow-hidden bg-black min-h-[78svh] md:min-h-screen"
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="pointer-events-none absolute inset-0 w-full h-full object-cover object-center"
      >
        <source src="/videos/cocktail-compressed.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 z-10 bg-black/30" />

      <div className="absolute inset-0 z-20">
        <CocktailReveal />
      </div>

      <VideoAudioToggle
        videoRef={videoRef}
        audioSrc="/audio/mundus-cocktail-audio.wav"
        sourceId="cocktail"
      />
    </section>
  );
}
