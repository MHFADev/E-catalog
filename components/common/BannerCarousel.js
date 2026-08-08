"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Icon from "@/components/common/Icon";

// Carousel banner dashboard. Dipakai ketika ada banner aktif dari admin;
// jika kosong, halaman memakai fallback HeroCarousel (gambar bawaan).
export default function BannerCarousel({ banners }) {
  const [index, setIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const hideTimerRef = useRef(null);
  const count = banners?.length || 0;

  const goNext = useCallback(() => {
    setIndex((prev) => (prev + 1) % count);
  }, [count]);

  const goPrev = useCallback(() => {
    setIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(goNext, 4200);
    return () => clearInterval(timer);
  }, [goNext, count]);

  const revealControls = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setShowControls(true);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 2000);
  }, []);

  if (count === 0) return null;

  return (
    <div
      className="relative w-full overflow-hidden rounded-[2rem] shadow-xl md:shadow-2xl ring-1 ring-forest/10 group"
      onMouseEnter={() => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        setShowControls(true);
      }}
      onMouseLeave={() => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => setShowControls(false), 2000);
      }}
    >
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((b) => (
          <div key={b.id} className="w-full flex-shrink-0 relative">
            {b.link ? (
              <Link href={b.link}>
                <img
                  src={b.imageUrl}
                  alt={b.title || "Banner"}
                  className="w-full aspect-[21/9] md:aspect-[21/9] object-cover"
                  draggable={false}
                />
              </Link>
            ) : (
              <img
                src={b.imageUrl}
                alt={b.title || "Banner"}
                className="w-full aspect-[21/9] object-cover"
                draggable={false}
              />
            )}
            {b.title && (
              <div className="absolute left-4 bottom-4 md:left-6 md:bottom-6">
                <span className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-base font-bold text-noir glass rounded-full shadow-sm inline-flex items-center gap-2">
                  <Icon name="info" size={14} className="text-forest" />
                  {b.title}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            onClick={() => {
              revealControls();
              goPrev();
            }}
            aria-label="Banner sebelumnya"
            className={`absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-all duration-300 ${
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <Icon name="chevronLeft" size={18} />
          </button>
          <button
            onClick={() => {
              revealControls();
              goNext();
            }}
            aria-label="Banner berikutnya"
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-all duration-300 ${
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <Icon name="chevronRight" size={18} />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((b, i) => (
              <button
                key={b.id}
                onClick={() => {
                  revealControls();
                  setIndex(i);
                }}
                aria-label={`Banner ${i + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === index
                    ? "bg-white scale-110 shadow-md"
                    : "bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}