"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/common/Icon";
import VideoEmbed from "@/components/common/VideoEmbed";

const AUTO_SLIDE_INTERVAL = 5500;
const SWIPE_THRESHOLD = 40;

const DEFAULT_SLIDES = [
  { id: "default-1", imageUrl: "/image-header/1.webp", title: "Katalog resmi produk dan kuliner UMKM Kemayoran", subtitle: "Pilihan warga minggu ini", link: "/catalog" },
  { id: "default-2", imageUrl: "/image-header/2.webp", title: "Temukan karya lokal, dukung usaha sekitar", subtitle: "Transaksi langsung via WhatsApp", link: "/catalog" },
];

export default function HeroShowcase({ banners = [], sellerVideos = [] }) {
  const slides = useMemo(() => banners?.length
    ? banners.map((banner, index) => ({
        id: banner.id || `banner-${index}`,
        imageUrl: banner.imageUrl,
        title: banner.title || "Promo dan agenda UMKM Kemayoran",
        subtitle: "Pilihan minggu ini",
        link: banner.link || null,
      }))
    : DEFAULT_SLIDES, [banners]);

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

  const moveSlide = (direction) => setCurrentIndex((index) => (index + direction + total) % total);
  const handleTouchStart = (event) => { setTouchStart(event.touches[0].clientX); setIsPaused(true); };
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
    if (video.paused) { video.play(); setIsVideoPlaying(true); }
    else { video.pause(); setIsVideoPlaying(false); }
  };

  const toggleVideoMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsVideoMuted(video.muted);
  };

  return (
    <div
      className="hero-showcase-container relative overflow-hidden rounded-2xl border border-hutan/15 bg-hutan shadow-[0_18px_45px_rgba(18,63,43,0.16)] sm:rounded-3xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative z-20 flex items-center justify-between border-b border-white/15 bg-hutan px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-forest-bright" aria-hidden="true" />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 sm:text-[11px]">
            {mode === "banner" ? "Info & promo" : "Video UMKM"}
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-white/10 p-1">
          <button type="button" onClick={() => setMode("banner")} aria-pressed={mode === "banner"} className={`rounded-md px-3 py-1.5 text-[10px] font-bold transition-colors ${mode === "banner" ? "bg-white text-hutan" : "text-white/65 hover:text-white"}`}>
            Banner
          </button>
          <button type="button" onClick={() => setMode("video")} aria-pressed={mode === "video"} className={`rounded-md px-3 py-1.5 text-[10px] font-bold transition-colors ${mode === "video" ? "bg-forest-bright text-hutan-dark" : "text-white/65 hover:text-white"}`}>
            Video
          </button>
        </div>
      </div>

      <div className="relative aspect-[4/3] min-h-[360px] w-full overflow-hidden sm:aspect-[16/11] sm:min-h-[410px]" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {mode === "banner" ? (
          <div className="absolute inset-0">
            {slides.map((slide, index) => (
              <div key={slide.id} className={`absolute inset-0 transition-opacity duration-500 ${index === currentIndex ? "z-10 opacity-100" : "pointer-events-none opacity-0"}`}>
                <Image src={slide.imageUrl} alt={slide.title} fill priority={index === 0} sizes="(max-width: 1024px) 100vw, 50vw" className="hero-cinematic-image object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-hutan-dark/90 via-hutan-dark/15 to-hutan-dark/10" />
              </div>
            ))}

            <div className="absolute inset-x-4 bottom-5 z-20 max-w-[31rem] sm:inset-x-6 sm:bottom-6">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-forest-bright">{currentSlide.subtitle}</p>
              <h2 className="max-w-xl text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">{currentSlide.title}</h2>
              {currentSlide.link && (
                <Link href={currentSlide.link} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2.5 text-xs font-bold text-hutan transition-transform hover:-translate-y-0.5">
                  Lihat katalog <Icon name="arrowRight" size={13} />
                </Link>
              )}
            </div>

            {total > 1 && (
              <div className="absolute bottom-6 right-5 z-20 flex items-center gap-2 sm:right-6">
                <button type="button" onClick={() => moveSlide(-1)} aria-label="Banner sebelumnya" className="grid size-8 place-items-center rounded-full border border-white/30 bg-hutan-dark/50 text-white backdrop-blur-sm hover:bg-white hover:text-hutan"><Icon name="chevronLeft" size={13} /></button>
                <span className="text-[10px] font-bold tracking-widest text-white/80">{currentIndex + 1}/{total}</span>
                <button type="button" onClick={() => moveSlide(1)} aria-label="Banner berikutnya" className="grid size-8 place-items-center rounded-full border border-white/30 bg-hutan-dark/50 text-white backdrop-blur-sm hover:bg-white hover:text-hutan"><Icon name="chevronRight" size={13} /></button>
              </div>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 bg-hutan-dark">
            {featuredVideo ? (
              <VideoEmbed url={featuredVideo} title="Video profil UMKM Kemayoran" className="h-full w-full rounded-none border-0 [&>iframe]:h-full [&>iframe]:object-cover" />
            ) : (
              <video ref={videoRef} autoPlay muted={isVideoMuted} loop playsInline preload="none" poster="/image-header/1.webp" className="absolute inset-0 h-full w-full object-cover" aria-label="Video profil UMKM Kemayoran"><source src="/hero-video.mp4" type="video/mp4" /></video>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-hutan-dark/90 via-transparent to-hutan-dark/10" />
            <div className="absolute inset-x-4 bottom-5 z-20 flex items-end justify-between sm:inset-x-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-forest-bright">Profil usaha lokal</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Geliat warga Kemayoran</h2>
              </div>
              {!featuredVideo && <div className="flex gap-2"><button type="button" onClick={toggleVideoPlay} aria-label={isVideoPlaying ? "Jeda video" : "Putar video"} className="grid size-9 place-items-center rounded-full border border-white/30 bg-hutan-dark/50 text-white backdrop-blur-sm hover:bg-white hover:text-hutan"><Icon name={isVideoPlaying ? "pause" : "play"} size={13} /></button><button type="button" onClick={toggleVideoMute} aria-label={isVideoMuted ? "Aktifkan suara" : "Matikan suara"} className="grid size-9 place-items-center rounded-full border border-white/30 bg-hutan-dark/50 text-white backdrop-blur-sm hover:bg-white hover:text-hutan"><Icon name={isVideoMuted ? "volumeOff" : "volumeOn"} size={14} /></button></div>}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 bg-hutan px-4 py-3 text-[10px] font-semibold text-white/60 sm:px-5">
        <span>{mode === "banner" ? "Temukan pilihan warga" : "Autoplay tanpa suara"}</span>
        <span className="flex items-center gap-1.5 text-forest-bright"><Icon name="check" size={11} /> Terverifikasi lokal</span>
      </div>
    </div>
  );
}
