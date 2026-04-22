"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import clsx from "clsx";

type VideoAudioToggleProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  audioSrc: string;
  sourceId: string;
  className?: string;
  hidden?: boolean;
  autoplay?: boolean;
};

export default function VideoAudioToggle({
  videoRef,
  audioSrc,
  sourceId,
  className,
  hidden = false,
  autoplay = false,
}: VideoAudioToggleProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const hasUserToggledRef = useRef(false);
  const hasAutoplayedRef = useRef(false);

  const syncToVideo = useCallback(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio || !Number.isFinite(audio.duration) || audio.duration <= 0) {
      return;
    }
    const targetTime = video.currentTime % audio.duration;
    const drift = Math.abs(audio.currentTime - targetTime);
    if (drift > 0.2) {
      audio.currentTime = targetTime;
    }
  }, [videoRef]);

  const stopAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const startAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    window.dispatchEvent(
      new CustomEvent("mundus-video-audio-activate", { detail: { sourceId } })
    );

    syncToVideo();
    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [sourceId, syncToVideo]);

  const toggleAudio = useCallback(() => {
    hasUserToggledRef.current = true;
    if (isPlaying) {
      stopAudio();
      return;
    }
    startAudio();
  }, [isPlaying, startAudio, stopAudio]);

  useEffect(() => {
    const onGlobalAudioActivate = () => stopAudio();
    const onOtherVideoAudioActivate = (event: Event) => {
      const custom = event as CustomEvent<{ sourceId?: string }>;
      if (custom.detail?.sourceId !== sourceId) {
        stopAudio();
      }
    };

    window.addEventListener("mundus-global-audio-activate", onGlobalAudioActivate);
    window.addEventListener("mundus-video-audio-activate", onOtherVideoAudioActivate);
    return () => {
      window.removeEventListener("mundus-global-audio-activate", onGlobalAudioActivate);
      window.removeEventListener("mundus-video-audio-activate", onOtherVideoAudioActivate);
    };
  }, [sourceId, stopAudio]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const syncOnVideoUpdate = () => {
      if (!isPlaying) return;
      syncToVideo();
    };

    video.addEventListener("timeupdate", syncOnVideoUpdate);
    video.addEventListener("seeking", syncOnVideoUpdate);
    video.addEventListener("seeked", syncOnVideoUpdate);
    video.addEventListener("ratechange", syncOnVideoUpdate);
    video.addEventListener("loadedmetadata", syncOnVideoUpdate);

    return () => {
      video.removeEventListener("timeupdate", syncOnVideoUpdate);
      video.removeEventListener("seeking", syncOnVideoUpdate);
      video.removeEventListener("seeked", syncOnVideoUpdate);
      video.removeEventListener("ratechange", syncOnVideoUpdate);
      video.removeEventListener("loadedmetadata", syncOnVideoUpdate);
    };
  }, [isPlaying, syncToVideo, videoRef]);

  useEffect(() => {
    if (!autoplay || hidden || hasAutoplayedRef.current || hasUserToggledRef.current) return;

    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.5;

    const tryAutoplay = () => {
      if (hasAutoplayedRef.current || hasUserToggledRef.current) return;
      window.dispatchEvent(
        new CustomEvent("mundus-video-audio-activate", { detail: { sourceId } })
      );
      syncToVideo();
      audio
        .play()
        .then(() => {
          hasAutoplayedRef.current = true;
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    };

    tryAutoplay();
    window.addEventListener("pointerdown", tryAutoplay, { passive: true });
    window.addEventListener("keydown", tryAutoplay);
    window.addEventListener("touchstart", tryAutoplay, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", tryAutoplay);
      window.removeEventListener("keydown", tryAutoplay);
      window.removeEventListener("touchstart", tryAutoplay);
    };
  }, [autoplay, hidden, sourceId, syncToVideo]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} src={audioSrc} loop preload="none" />

      <button
        type="button"
        onClick={toggleAudio}
        aria-label={isPlaying ? "Video sesini kapat" : "Video sesini aç"}
        className={clsx(
          "absolute bottom-5 right-5 sm:bottom-8 sm:right-8 z-40",
          "overflow-hidden w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full",
          "bg-black/35 backdrop-blur-md border border-white/20 text-white/80",
          "hover:bg-black/50 hover:text-white transition-all duration-300",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
          "active:scale-95",
          hidden && "opacity-0 pointer-events-none",
          className
        )}
      >
        {isPlaying ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M11 5L6 9H3v6h3l5 4V5z" />
            <path d="M15.5 8.5a5 5 0 010 7" />
            <path d="M18 6a8.5 8.5 0 010 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M11 5L6 9H3v6h3l5 4V5z" />
            <path d="M15.5 8.5a5 5 0 010 7" />
            <path d="M18 6a8.5 8.5 0 010 12" />
          </svg>
        )}
        {!isPlaying && (
          <>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute h-[4px] w-7 sm:w-8 rounded-full bg-black/90 rotate-45"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute h-[2.5px] w-7 sm:w-8 rounded-full bg-primary shadow-[0_0_12px_rgba(212,175,55,0.75)] rotate-45"
            />
          </>
        )}
      </button>
    </>
  );
}
