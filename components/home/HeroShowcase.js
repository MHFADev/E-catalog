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
    title: "Katalog resmi produk dan kuliner UMKM Kemayoran",
    subtitle: "Pilihan warga minggu ini",
    link: "/catalog",
  },
  {
    id: "default-2",
    imageUrl: "/image-header/2.webp",
    title: "Temukan karya lokal, dukung usaha sekitar",
    subtitle: "Transaksi langsung via WhatsApp",
    link: "/catalog",
  },
];

const TICKER_ITEMS = ["Kuliner", "Kerajinan", "Fesyen", "Kopi lokal", "Cerita warga"];

export default function HeroShowcase({ banners = [], sellerVideos = [] }) {
  const slides = useMemo(() => {
    if (banners?.length) {
      return banners.map((banner, index) => ({
        id: banner.id || `banner-${index}`,
        imageUrl: banner.imageUrl,
        title: banner.title || "Promo dan agenda UMKM Kemayoran",
        subtitle: "Pilihan minggu ini",
        link: banner.link || null,
      }));
    }
    return DEFAULT_SLIDES;
  }, [banners]);

  const [mode, setMode] = useState("banner");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const videoRef = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  const total = slides.length;
  const currentSlide = slides[currentIndex] || slides[0];
  const featuredVideo = sellerVideos.find((seller) => seller.videoUrl)?.videoUrl || "";

  useEffect(() => {
    if (mode !== "banner" || total <= 1 || isPaused) return undefined;
    const timer = setInterval(() => setCurrentIndex((index) => (index + 1) % total), AUTO_SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [mode, total, isPaused]);

  const moveSlide = (direction) => {
    setCurrentIndex((index) => (index + direction + total) % total);
  };

  const handleTouchStart = (event) => {
    setTouchStart(event.touches[0].clientX);
    setIsPaused(true);
  };

  const handleTouchEnd = (event) => {
    setIsPaused(false);
    if (touchStart === null) return;
    const difference = touchStart - event.changedTouches[0].clientX;
    if (Math.abs(difference) > SWIPE_THRESHOLD) moveSlide(difference > 0 ? 1 : -1);
    setTouchStart(null);
  };

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
      className="hero-cinematic relative overflow-hidden rounded-[1.65rem] bg-[#191918] text-white shadow-[0_28px_70px_rgba(20,45,34,0.2)] sm:rounded-[2rem]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between border-b border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="hero-live-dot" aria-hidden="true" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/75 sm:text-[11px]">
            {mode === "banner" ? "Etalase pilihan" : "Cerita UMKM"}
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-white/15 bg-black/20 p-1">
          <button
            type="button"
            onClick={() => setMode("banner")}
            aria-pressed={mode === "banner"}
            className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-500 ${mode === "banner" ? "bg-[#fdfbf7] text-[#1a1a19]" : "text-white/60 hover:text-white"}`}
          >
            Banner
          </button>
          <button
            type="button"
            onClick={() => setMode("video")}
            aria-pressed={mode === "video"}
            className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-500 ${mode === "video" ? "bg-[#ea580c] text-white" : "text-white/60 hover:text-white"}`}
          >
            Video
          </button>
        </div>
      </div>

      <div
        className="relative aspect-[4/3] min-h-[390px] w-full overflow-hidden sm:aspect-[16/11] sm:min-h-[430px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {mode === "banner" ? (
          <div className="absolute inset-0">
            {slides.map((slide, index) => {
              const active = index === currentIndex;
              return (
                <div key={slide.id} className={`absolute inset-0 transition-opacity duration-700 ease-out ${active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"}`}>
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="hero-cinematic-image object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,16,13,0.3)_0%,transparent_34%,rgba(10,12,10,0.92)_100%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(234,88,12,0.2),transparent_28%)]" />
                </div>
              );
            })}

            <div className="absolute inset-x-4 bottom-16 z-20 max-w-[34rem] sm:inset-x-6 sm:bottom-[4.7rem]">
              <div className="hero-glass-panel relative overflow-hidden rounded-2xl p-4 sm:p-5">
                <div className="hero-scan-line" aria-hidden="true" />
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#ffb18e]">{currentSlide.subtitle}</p>
                <h2 className="max-w-lg text-2xl font-extrabold leading-[1.05] tracking-[-0.045em] text-[#fdfbf7] sm:text-3xl lg:text-[2.65rem]">{currentSlide.title}</h2>
                {currentSlide.link && (
                  <Link href={currentSlide.link} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#fdfbf7] px-4 py-2.5 text-xs font-bold text-[#1a1a19] transition-transform duration-500 hover:scale-105">
                    Jelajahi katalog <Icon name="arrowRight" size={13} />
                  </Link>
                )}
              </div>
            </div>

            {total > 1 && (
              <div className="absolute bottom-5 right-5 z-20 flex items-center gap-2 sm:right-6">
                <button type="button" onClick={() => moveSlide(-1)} aria-label="Banner sebelumnya" className="grid size-8 place-items-center rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-[#1a1a19]"><Icon name="chevronLeft" size={13} /></button>
                <span className="min-w-12 text-center text-[10px] font-bold tracking-[0.18em] text-white/75">{String(currentIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
                <button type="button" onClick={() => moveSlide(1)} aria-label="Banner berikutnya" className="grid size-8 place-items-center rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-[#1a1a19]"><Icon name="chevronRight" size={13} /></button>
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 bg-[#111]">
            {featuredVideo ? (
              <VideoEmbed url={featuredVideo} title="Video profil UMKM Kemayoran" className="h-full w-full rounded-none border-0 [&>iframe]:h-full [&>iframe]:object-cover" />
            ) : (
              <video ref={videoRef} autoPlay muted={isVideoMuted} loop playsInline preload="none" poster="/image-header/1.webp" className="absolute inset-0 h-full w-full object-cover" aria-label="Video profil UMKM Kemayoran">
                <source src="/hero-video.mp4" type="video/mp4" />
              </video>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/20" />
            <div className="absolute inset-x-4 bottom-5 z-20 flex items-end justify-between sm:inset-x-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#ffb18e]">Profil usaha lokal</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Geliat warga Kemayoran</h2>
              </div>
              {!featuredVideo && (
                <div className="flex gap-2">
                  <button type="button" onClick={toggleVideoPlay} aria-label={isVideoPlaying ? "Jeda video" : "Putar video"} className="grid size-9 place-items-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-md hover:bg-white hover:text-black"><Icon name={isVideoPlaying ? "pause" : "play"} size={13} /></button>
                  <button type="button" onClick={toggleVideoMute} aria-label={isVideoMuted ? "Aktifkan suara" : "Matikan suara"} className="grid size-9 place-items-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-md hover:bg-white hover:text-black"><Icon name={isVideoMuted ? "volumeOff" : "volumeOn"} size={14} /></button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="hero-ticker relative z-20 flex overflow-hidden border-t border-white/10 bg-[#1a1a19] py-3" aria-label="Kategori unggulan">
        <div className="hero-ticker-track flex min-w-max items-center gap-5 px-5">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, index) => (
            <span key={`${item}-${index}`} className="flex items-center gap-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
              {item}<span className="text-[#ea580c]">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
