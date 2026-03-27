"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import clsx from "clsx";

type VideoAudioToggleProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  audioSrc: string;
  sourceId: string;
  className?: string;
  hidden?: boolean;
};

export default function VideoAudioToggle({
  videoRef,
  audioSrc,
  sourceId,
  className,
  hidden = false,
}: VideoAudioToggleProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} src={audioSrc} loop preload="auto" />

      <button
        type="button"
        onClick={toggleAudio}
        aria-label={isPlaying ? "Video sesini kapat" : "Video sesini aç"}
        className={clsx(
          "absolute bottom-5 right-5 sm:bottom-8 sm:right-8 z-40",
          "w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full",
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
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 translate-x-[1px]"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    </>
  );
}
