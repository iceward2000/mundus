"use client";

import { useState, useRef, useEffect } from "react";
import clsx from "clsx";

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Placeholder audio
  const audioSrc = "https://cdn.pixabay.com/audio/2022/02/07/audio_1808fbf07a.mp3"; 

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.warn("Audio playback failed:", err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="pointer-events-auto flex items-center">
      <audio ref={audioRef} src={audioSrc} loop />
      
      <button
        onClick={togglePlay}
        className="group relative flex items-center justify-center w-12 h-6 focus:outline-none cursor-pointer"
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        {/* Container for the lines */}
        <div className="relative w-full h-full flex items-center overflow-hidden">
          {/* Static Line (visible when paused) */}
          <div
            className={clsx(
              "absolute left-0 right-0 h-[1px] bg-primary transition-all duration-300 ease-out",
              isPlaying ? "opacity-0 scale-x-50" : "opacity-80 scale-x-100"
            )}
          />

          {/* Animated Wave (visible when playing) */}
          <div
            className={clsx(
              "absolute inset-0 flex items-center transition-opacity duration-300 ease-out",
              isPlaying ? "opacity-100" : "opacity-0"
            )}
          >
            {/* 
                Structure:
                - Outer wrapper handles the "Audio Wave" amplitude animation (up/down scaling)
                - Inner wrapper handles the "Scroll Left" movement
            */}
            <div className={clsx("w-full h-full flex items-center", isPlaying && "animate-audio-wave")}>
              <div className="w-[200%] flex animate-scroll-left will-change-transform">
                 {/* Two identical SVGs for seamless looping. 
                     Adjusted path for fewer waves (lower frequency). 
                     Using preserveAspectRatio="none" to stretch filling the width.
                 */}
                 {[0, 1].map((i) => (
                  <svg
                    key={i}
                    width="50%"
                    height="24"
                    viewBox="0 0 100 24"
                    preserveAspectRatio="none"
                    className="stroke-primary fill-none opacity-80 flex-shrink-0"
                    style={{ display: "block" }} 
                  >
                    {/* 
                       New Path: Single Sine Wave cycle per SVG
                       Start: (0, 12) -> Peak: (25, 2) -> Cross: (50, 12) -> Trough: (75, 22) -> End: (100, 12)
                       M0 12 Q 25 2, 50 12 T 100 12
                    */}
                    <path
                      d="M0 12 Q 25 2, 50 12 T 100 12"
                      strokeWidth="1.5"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
