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
  allowAutoplayWhenHidden?: boolean;
  autoplayRetryIgnoreSelector?: string;
};

export default function VideoAudioToggle({
  videoRef,
  audioSrc,
  sourceId,
  className,
  hidden = false,
  autoplay = false,
  allowAutoplayWhenHidden = false,
  autoplayRetryIgnoreSelector,
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
    // Correct only when significantly out of sync to avoid audible seeking artifacts.
    if (drift > 0.45) {
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

    audio.muted = false;
    audio.volume = 0.5;
    window.dispatchEvent(
      new CustomEvent("mundus-video-audio-activate", { detail: { sourceId } })
    );

    syncToVideo();
    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => {
          hasAutoplayedRef.current = true;
          setIsPlaying(true);
        })
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

    const syncOnVideoStateChange = () => {
      if (!isPlaying) return;
      syncToVideo();
    };

    video.addEventListener("seeking", syncOnVideoStateChange);
    video.addEventListener("seeked", syncOnVideoStateChange);
    video.addEventListener("ratechange", syncOnVideoStateChange);
    video.addEventListener("loadedmetadata", syncOnVideoStateChange);
    video.addEventListener("play", syncOnVideoStateChange);

    return () => {
      video.removeEventListener("seeking", syncOnVideoStateChange);
      video.removeEventListener("seeked", syncOnVideoStateChange);
      video.removeEventListener("ratechange", syncOnVideoStateChange);
      video.removeEventListener("loadedmetadata", syncOnVideoStateChange);
      video.removeEventListener("play", syncOnVideoStateChange);
    };
  }, [isPlaying, syncToVideo, videoRef]);

  useEffect(() => {
    if (!autoplay || hasAutoplayedRef.current || hasUserToggledRef.current) return;
    if (hidden && !allowAutoplayWhenHidden) return;

    const audio = audioRef.current;
    if (!audio) return;
    const restoreAudibleState = () => {
      if (hasUserToggledRef.current) return;
      audio.muted = false;
      audio.volume = 0.5;
    };

    const tryMutedAutoplay = () => {
      const previousMuted = audio.muted;
      const previousVolume = audio.volume;
      audio.muted = true;
      audio.volume = 0;
      return audio.play().then(
        () => {
          hasAutoplayedRef.current = true;
          setIsPlaying(true);
          window.setTimeout(restoreAudibleState, 0);
        },
        () => {
          audio.muted = previousMuted;
          audio.volume = previousVolume;
          setIsPlaying(false);
        }
      );
    };

    const tryAutoplay = (event?: Event) => {
      if (hasAutoplayedRef.current || hasUserToggledRef.current) return;
      if (
        autoplayRetryIgnoreSelector &&
        event?.target instanceof Element &&
        event.target.closest(autoplayRetryIgnoreSelector)
      ) {
        return;
      }
      window.dispatchEvent(
        new CustomEvent("mundus-video-audio-activate", { detail: { sourceId } })
      );
      syncToVideo();
      // First try audible autoplay; some browsers allow it and this avoids silent starts.
      audio.muted = false;
      audio.volume = 0.5;
      audio
        .play()
        .then(() => {
          hasAutoplayedRef.current = true;
          setIsPlaying(true);
        })
        .catch(() => {
          // Fallback for strict policies: start muted, then attempt to restore audible output.
          void tryMutedAutoplay();
        });
    };

    const tryAutoplayWhenReady = () => {
      if (hasAutoplayedRef.current || hasUserToggledRef.current) return;
      tryAutoplay();
    };

    // Ensure the browser begins fetching the media immediately.
    audio.load();
    tryAutoplay();
    audio.addEventListener("loadedmetadata", tryAutoplayWhenReady);
    audio.addEventListener("canplay", tryAutoplayWhenReady);
    audio.addEventListener("canplaythrough", tryAutoplayWhenReady);
    const retryInterval = window.setInterval(tryAutoplayWhenReady, 1200);
    window.addEventListener("pointerdown", tryAutoplay, { passive: true });
    window.addEventListener("keydown", tryAutoplay);
    window.addEventListener("touchstart", tryAutoplay, { passive: true });

    return () => {
      window.clearInterval(retryInterval);
      audio.removeEventListener("loadedmetadata", tryAutoplayWhenReady);
      audio.removeEventListener("canplay", tryAutoplayWhenReady);
      audio.removeEventListener("canplaythrough", tryAutoplayWhenReady);
      window.removeEventListener("pointerdown", tryAutoplay);
      window.removeEventListener("keydown", tryAutoplay);
      window.removeEventListener("touchstart", tryAutoplay);
    };
  }, [
    allowAutoplayWhenHidden,
    autoplay,
    autoplayRetryIgnoreSelector,
    hidden,
    sourceId,
    syncToVideo,
  ]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} src={audioSrc} loop preload="metadata" />

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
              className="pointer-events-none absolute h-[4px] w-7 sm:w-8 rounded-full bg-white rotate-45"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute h-[2.5px] w-7 sm:w-8 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.65)] rotate-45"
            />
          </>
        )}
      </button>
    </>
  );
}
