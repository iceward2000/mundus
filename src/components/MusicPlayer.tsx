"use client";

import { useState, useRef, useEffect } from "react";
import clsx from "clsx";

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Use a reliable audio source. 
  // Using local file moved to public/audio/loop.mp3
  const audioSrc = "/audio/loop.mp3"; 

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Explicitly set volume to ensure it's audible
      audioRef.current.volume = 0.5;
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Audio playback failed:", error);
          // Optional: Show UI error state here
        });
      }
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // SVG Data URI for the wave pattern
  // Single cycle sine wave: M0 12 Q 25 2, 50 12 T 100 12
  // ViewBox 0 0 100 24
  // We use this as a mask
  const waveSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 24' fill='none' stroke='black' stroke-width='3'%3E%3Cpath d='M0 12 Q 25 2, 50 12 T 100 12' vector-effect='non-scaling-stroke' /%3E%3C/svg%3E`;

  return (
    <div className="pointer-events-auto flex items-center">
      <audio 
        ref={audioRef} 
        src={audioSrc} 
        loop 
        onError={(e) => console.error("Audio error:", e)}
      />
      
      <button
        onClick={togglePlay}
        className="group relative flex items-center justify-center w-12 h-6 focus:outline-none cursor-pointer"
        aria-label={isPlaying ? "Müziği Durdur" : "Müziği Oynat"}
      >
        {/* Container for the visualizer */}
        <div className="relative w-full h-full flex items-center overflow-hidden">
          
          {/* Static Line (visible when paused) */}
          <div
            className={clsx(
              "absolute left-0 right-0 h-[1px] bg-primary transition-all duration-300 ease-out",
              isPlaying ? "opacity-0 scale-x-50" : "opacity-80 scale-x-100"
            )}
          />

          {/* Animated Wave (visible when playing) */}
          {/* Using Mask Image technique for seamless looping without layout glitches */}
          <div
            className={clsx(
              "absolute inset-0 bg-primary transition-opacity duration-300 ease-out",
              isPlaying ? "opacity-80" : "opacity-0",
              isPlaying && "animate-audio-wave animate-mask-scroll" // Vertical heartbeat + Horizontal scroll
            )}
            style={{
              maskImage: `url("${waveSvg}")`,
              WebkitMaskImage: `url("${waveSvg}")`,
              maskRepeat: "repeat-x",
              WebkitMaskRepeat: "repeat-x",
              maskSize: "50px 100%", 
              WebkitMaskSize: "50px 100%",
            }}
          />
        </div>
      </button>
    </div>
  );
}
