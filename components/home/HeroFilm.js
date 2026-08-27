"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/common/Icon";

export default function HeroFilm({ children, className = "" }) {
  const videoRef = useRef(null);
  const userPausedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const syncPlayback = () => setIsPlaying(!video.paused);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.pause();
          return;
        }

        if (!userPausedRef.current) {
          video.play().catch(() => setIsPlaying(false));
        }
      },
      { threshold: 0.14 },
    );

    video.addEventListener("play", syncPlayback);
    video.addEventListener("pause", syncPlayback);
    observer.observe(video);

    return () => {
      observer.disconnect();
      video.removeEventListener("play", syncPlayback);
      video.removeEventListener("pause", syncPlayback);
    };
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      userPausedRef.current = false;
      video.play().catch(() => setIsPlaying(false));
    } else {
      userPausedRef.current = true;
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  return (
    <div className={`hero-film relative aspect-[4/5] min-w-0 overflow-hidden rounded-[1.5rem] bg-hutan ring-1 ring-forest/20 shadow-[0_24px_52px_rgba(18,63,74,0.20)] motion-safe:animate-[fadeInUp_0.7s_var(--ease-out-expo)_both] min-[420px]:aspect-[4/3] sm:aspect-[16/10] sm:rounded-[2rem] md:rounded-[2.5rem] lg:aspect-[16/11] ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        poster="/image-header/1.webp"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B3442]/90 via-[#123F4A]/24 to-[#123F4A]/10" />

      <div className="absolute right-3 top-3 z-10 flex items-center gap-2 sm:right-5 sm:top-5">
        <button
          type="button"
          aria-label={isMuted ? "Nyalakan suara video" : "Matikan suara video"}
          aria-pressed={!isMuted}
          onClick={toggleMute}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-[#123F4A]/50 text-white backdrop-blur-md transition-colors hover:bg-[#123F4A]/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Icon name={isMuted ? "volumeMute" : "volumeHigh"} size={15} />
        </button>
        <button
          type="button"
          aria-label={isPlaying ? "Jeda video" : "Putar video"}
          aria-pressed={!isPlaying}
          onClick={togglePlayback}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-[#123F4A]/50 text-white backdrop-blur-md transition-colors hover:bg-[#123F4A]/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Icon name={isPlaying ? "pause" : "play"} size={14} />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-[1] flex flex-col items-start p-5 text-left text-white sm:p-7 md:p-9 lg:p-10">
        {children}
      </div>
    </div>
  );
}
