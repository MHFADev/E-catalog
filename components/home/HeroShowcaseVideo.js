"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/common/Icon";

export default function HeroShowcaseVideo() {
  const videoRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!prefersReducedMotion.matches) return;

    videoRef.current?.pause();
    setIsPaused(true);
  }, []);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      await video.play();
      setIsPaused(false);
    } else {
      video.pause();
      setIsPaused(true);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <div className="hero-showcase relative h-full min-h-0 overflow-hidden rounded-[1.35rem] bg-hutan shadow-[0_18px_42px_rgba(18,63,74,0.16)] ring-1 ring-hutan/15 sm:rounded-[1.75rem] lg:rounded-[2rem]">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/image-header/1.webp"
        className="absolute inset-0 h-full w-full object-cover object-center"
        aria-label="Showcase produk dan pelaku UMKM Kemayoran"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-hutan-dark/35 via-transparent to-black/5" />

      <div className="absolute bottom-3 right-3 flex gap-2 sm:bottom-4 sm:right-4">
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={isPaused ? "Putar video" : "Jeda video"}
          className="grid size-11 place-items-center rounded-xl border border-white/35 bg-hutan-dark/70 text-white shadow-md backdrop-blur-sm transition-colors duration-200 hover:bg-hutan-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-hutan-dark"
        >
          <Icon name={isPaused ? "play" : "pause"} size={15} />
        </button>
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? "Aktifkan suara video" : "Matikan suara video"}
          className="grid size-11 place-items-center rounded-xl border border-white/35 bg-hutan-dark/70 text-white shadow-md backdrop-blur-sm transition-colors duration-200 hover:bg-hutan-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-hutan-dark"
        >
          <Icon name={isMuted ? "volumeOff" : "volumeOn"} size={16} />
        </button>
      </div>
    </div>
  );
}
