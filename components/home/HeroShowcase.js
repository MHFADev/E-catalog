"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/common/Icon";
import VideoEmbed from "@/components/common/VideoEmbed";

const AUTO_SLIDE_INTERVAL = 5500;
const SWIPE_THRESHOLD = 40;

const DEFAULT_SLIDES = [
  {
    id: "default-1",
    imageUrl: "/image-header/1.webp",
    title: "Katalog Resmi Produk & Kuliner UMKM Kemayoran",
    subtitle: "Pilihan Terbaik Warga",
    link: "/catalog",
  },
  {
    id: "default-2",
    imageUrl: "/image-header/2.webp",
    title: "Dukung Usaha Lokal — Transaksi Langsung via WhatsApp",
    subtitle: "Tanpa Perantara",
    link: "/catalog",
  },
];

export default function HeroShowcase({ banners = [], sellerVideos = [] }) {
  // Gunakan banners dari database jika ada, jika tidak pakai slide default kurasi
  const slides = useMemo(() => {
    if (banners && banners.length > 0) {
      return banners.map((b, idx) => ({
        id: b.id || `banner-${idx}`,
        imageUrl: b.imageUrl,
        title: b.title || "Promo & Agenda Khusus UMKM Kemayoran",
        subtitle: "Pilihan Minggu Ini",
        link: b.link || null,
      }));
    }
    return DEFAULT_SLIDES;
  }, [banners]);

  const [mode, setMode] = useState("banner"); // "banner" | "video"
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  // Video state
  const videoRef = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  const total = slides.length;
  const currentSlide = slides[currentIndex] || slides[0];
  const featuredVideo = sellerVideos.find((seller) => seller.videoUrl)?.videoUrl || "";

  // Auto-advance banner carousel
  useEffect(() => {
    if (mode !== "banner" || total <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [mode, total, isPaused]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
    setIsPaused(true);
  };

  const handleTouchEnd = (e) => {
    setIsPaused(false);
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        // swipe left -> next
        setCurrentIndex((prev) => (prev + 1) % total);
      } else {
        // swipe right -> prev
        setCurrentIndex((prev) => (prev - 1 + total) % total);
      }
    }
    setTouchStart(null);
  };

  // Video controls
  const toggleVideoPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsVideoPlaying(true);
    } else {
      video.pause();
      setIsVideoPlaying(false);
    }
  };

  const toggleVideoMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsVideoMuted(video.muted);
  };

  return (
    <div
      className="hero-showcase-container relative flex flex-col overflow-hidden rounded-2xl border border-hutan/12 bg-white shadow-[0_14px_38px_rgba(18,63,43,0.08)] sm:rounded-3xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Bar: Label & Mode Switcher */}
      <div className="flex items-center justify-between border-b border-hutan/8 bg-cream/70 px-3.5 py-2.5 sm:px-5 sm:py-3">
        {/* Left: Indicator */}
        <div className="flex items-center gap-2">
          <span className="flex size-2 rounded-full bg-forest" />
          <span className="text-xs font-bold uppercase tracking-wider text-hutan">
            {mode === "banner" ? "Info & Promo Pilihan" : "Suasana UMKM Kemayoran"}
          </span>
        </div>

        {/* Right: Tab switch between Banner & Video */}
        <div className="flex items-center gap-1 rounded-xl bg-hutan/[0.07] p-0.5">
          <button
            type="button"
            onClick={() => setMode("banner")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              mode === "banner"
                ? "bg-white text-hutan shadow-sm"
                : "text-warm-gray hover:text-hutan"
            }`}
            aria-label="Tampilkan Banner Promo"
          >
            <Icon name="tag" size={11} />
            <span>Banner</span>
            {total > 1 && (
              <span className="ml-0.5 text-[10px] text-warm-gray">
                ({currentIndex + 1}/{total})
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMode("video")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              mode === "video"
                ? "bg-white text-forest shadow-sm"
                : "text-warm-gray hover:text-hutan"
            }`}
            aria-label="Tonton Video Suasana"
          >
            <Icon name="play" size={10} />
            <span>Video</span>
          </button>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="relative aspect-[16/10] w-full min-h-[220px] sm:min-h-[300px] lg:min-h-[350px] overflow-hidden bg-cream-warm/30">
        {mode === "banner" ? (
          /* BANNER CAROUSEL */
          <div
            className="group relative h-full w-full"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Banner Image with smooth transition */}
            {slides.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-500 ease-out ${
                    isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title || "Banner UMKM Kemayoran"}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority={idx === 0}
                    loading={idx === 0 ? "eager" : "lazy"}
                    className="object-cover object-center"
                  />
                  {/* Subtle gradient vignette for text readability */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-hutan-dark/90 via-hutan-dark/30 to-transparent" />

                  {/* Banner Content Caption */}
                  <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end p-4 text-white sm:p-6">
                    <span className="mb-1 text-[11px] font-bold uppercase tracking-wider text-forest-bright">
                      {slide.subtitle || "Pilihan UMKM"}
                    </span>
                    <h3 className="line-clamp-2 text-base font-bold leading-snug sm:text-lg lg:text-xl drop-shadow-sm">
                      {slide.title}
                    </h3>

                    {slide.link && (
                      <div className="mt-2.5">
                        <Link
                          href={slide.link}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-hutan backdrop-blur-sm transition-all hover:bg-white hover:shadow-md"
                        >
                          <span>Buka Info</span>
                          <Icon name="arrowRight" size={11} />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Navigation Arrows (Desktop hover / Mobile accessible) */}
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => (prev - 1 + total) % total)}
                  aria-label="Banner sebelumnya"
                  className="absolute left-2.5 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/65 sm:left-4 sm:p-2.5"
                >
                  <Icon name="chevronLeft" size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % total)}
                  aria-label="Banner berikutnya"
                  className="absolute right-2.5 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/65 sm:right-4 sm:p-2.5"
                >
                  <Icon name="chevronRight" size={14} />
                </button>
              </>
            )}

            {/* Bottom Indicator Dots / Pills */}
            {total > 1 && (
              <div className="absolute bottom-3 right-4 z-20 hidden items-center gap-1.5 sm:flex">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Pindah ke banner ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? "w-6 bg-white"
                        : "w-1.5 bg-white/45 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* VIDEO SHOWCASE */
          <div className="relative h-full w-full bg-hutan">
            {featuredVideo ? (
              <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-hutan">
                <VideoEmbed
                  url={featuredVideo}
                  title="Video profil UMKM Kemayoran"
                  className="h-full w-full rounded-none border-0"
                />
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                muted={isVideoMuted}
                loop
                playsInline
                preload="none"
                poster="/image-header/1.webp"
                className="absolute inset-0 h-full w-full object-cover object-center"
                aria-label="Video profil UMKM Kemayoran"
              >
                <source src="/hero-video.mp4" type="video/mp4" />
              </video>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-hutan-dark/70 via-transparent to-black/10" />

            {/* Video Controls overlay */}
            <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 sm:bottom-4 sm:right-4">
              {!featuredVideo && (
                <>
                  <button
                    type="button"
                    onClick={toggleVideoPlay}
                    aria-label={isVideoPlaying ? "Jeda video" : "Putar video"}
                    className="grid size-9 sm:size-10 place-items-center rounded-full border border-white/30 bg-hutan-dark/75 text-white shadow-md backdrop-blur-sm transition-colors hover:bg-hutan-dark"
                  >
                    <Icon name={isVideoPlaying ? "pause" : "play"} size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={toggleVideoMute}
                    aria-label={isVideoMuted ? "Aktifkan suara video" : "Matikan suara video"}
                    className="grid size-9 sm:size-10 place-items-center rounded-full border border-white/30 bg-hutan-dark/75 text-white shadow-md backdrop-blur-sm transition-colors hover:bg-hutan-dark"
                  >
                    <Icon name={isVideoMuted ? "volumeOff" : "volumeOn"} size={14} />
                  </button>
                </>
              )}
            </div>

            {/* Video caption */}
            <div className="pointer-events-none absolute bottom-3 left-4 z-10 text-xs text-white/85 sm:bottom-4 sm:left-5">
              <span className="font-semibold text-white">Profil UMKM Kemayoran</span>
              <span className="hidden sm:inline"> — Geliat usaha &amp; ekonomi warga</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar on Mobile: indicators */}
      {mode === "banner" && total > 1 && (
        <div className="flex items-center justify-center gap-1.5 border-t border-hutan/8 bg-cream/50 py-2 sm:hidden">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Banner ${idx + 1}`}
              className={`h-1 rounded-full transition-all ${
                idx === currentIndex ? "w-5 bg-forest" : "w-1.5 bg-warm-gray/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
