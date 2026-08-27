"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/common/Icon";

const AUTO_ADVANCE_MS = 6500;
const SWIPE_THRESHOLD = 44;

export default function HeroCampaignCarousel({ banners = [] }) {
  const items = useMemo(() => banners.slice(0, 5), [banners]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [isInteractionPaused, setIsInteractionPaused] = useState(false);
  const touchStartX = useRef(null);
  const hasSwiped = useRef(false);
  const total = items.length;
  const active = items[activeIndex] || null;
  const isPaused = isUserPaused || isInteractionPaused;

  useEffect(() => {
    if (activeIndex >= total) setActiveIndex(0);
  }, [activeIndex, total]);

  useEffect(() => {
    if (total < 2 || isPaused) return undefined;
    const timer = window.setInterval(
      () => setActiveIndex((current) => (current + 1) % total),
      AUTO_ADVANCE_MS,
    );
    return () => window.clearInterval(timer);
  }, [isPaused, total]);

  if (!active) return null;

  const previous = () => setActiveIndex((current) => (current - 1 + total) % total);
  const next = () => setActiveIndex((current) => (current + 1) % total);
  const onTouchStart = (event) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    setIsInteractionPaused(true);
  };
  const onTouchEnd = (event) => {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartX.current = null;
    setIsInteractionPaused(false);

    if (startX == null || endX == null) return;
    const distance = endX - startX;
    if (Math.abs(distance) < SWIPE_THRESHOLD) return;
    hasSwiped.current = true;
    if (distance > 0) previous();
    else next();
  };
  const preventSwipeNavigation = (event) => {
    if (!hasSwiped.current) return;
    event.preventDefault();
    hasSwiped.current = false;
  };

  const picture = (
    <div key={active.id} className="absolute inset-0 overflow-hidden bg-[#EEF0E5]">
      <img
        src={active.imageUrl}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-20 blur-2xl saturate-75"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-[#123F4A]/10" />
      <img
        src={active.imageUrl}
        alt={active.title || "Kampanye pilihan UMKM Kemayoran"}
        className="relative z-[1] h-full w-full object-contain motion-safe:animate-[heroCampaignIn_520ms_var(--ease-out-expo)_both]"
        loading="eager"
      />
    </div>
  );

  return (
    <aside
      aria-label="Kampanye pilihan"
      className="hero-campaign relative overflow-hidden rounded-[1.5rem] border border-[#123F4A]/10 bg-[#FBFAF2]/95 p-2.5 shadow-[0_18px_42px_rgba(18,63,74,0.14)] ring-1 ring-white/70 motion-safe:animate-[fadeInUp_0.7s_var(--ease-out-expo)_120ms_both] sm:rounded-[2rem] sm:p-3 lg:col-span-4 lg:flex lg:h-full lg:aspect-auto lg:flex-col"
      onMouseEnter={() => setIsInteractionPaused(true)}
      onMouseLeave={() => setIsInteractionPaused(false)}
      onFocusCapture={() => setIsInteractionPaused(true)}
      onBlurCapture={() => setIsInteractionPaused(false)}
    >
      <div className="flex items-center justify-between gap-3 px-1.5 pb-2.5 pt-0.5 sm:px-2 lg:pb-3">
        <span className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#1D6E4D]">
          <span className="h-2 w-2 rounded-full bg-[#C87055]" />
          Pilihan minggu ini
        </span>
        {total > 1 && (
          <button
            type="button"
            aria-label={isUserPaused ? "Putar carousel banner" : "Jeda carousel banner"}
            aria-pressed={isUserPaused}
            onClick={() => setIsUserPaused((value) => !value)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#1D6E4D] transition-colors hover:bg-[#1D6E4D]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B9AA1]"
          >
            <Icon name={isUserPaused ? "play" : "pause"} size={12} />
          </button>
        )}
      </div>

      <div
        className="group relative aspect-video min-h-0 overflow-hidden rounded-[1.1rem] border border-[#123F4A]/10 bg-[#EEF0E5] sm:rounded-[1.5rem] lg:flex-1 lg:aspect-auto"
        role="region"
        aria-roledescription="carousel"
        aria-label={`Banner ${activeIndex + 1} dari ${total}`}
        aria-live="polite"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {active.link ? (
          <Link href={active.link} onClick={preventSwipeNavigation} className="absolute inset-0 block focus:outline-none focus-visible:ring-4 focus-visible:ring-[#3B9AA1] focus-visible:ring-inset">
            {picture}
          </Link>
        ) : (
          picture
        )}
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/40" />

        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Banner sebelumnya"
              onClick={previous}
              className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/65 bg-[#123F4A]/68 text-white opacity-0 shadow-lg backdrop-blur-sm transition-all hover:bg-[#123F4A]/90 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white group-hover:opacity-100 lg:flex"
            >
              <Icon name="chevronLeft" size={16} />
            </button>
            <button
              type="button"
              aria-label="Banner berikutnya"
              onClick={next}
              className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/65 bg-[#123F4A]/68 text-white opacity-0 shadow-lg backdrop-blur-sm transition-all hover:bg-[#123F4A]/90 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white group-hover:opacity-100 lg:flex"
            >
              <Icon name="chevronRight" size={16} />
            </button>
          </>
        )}
      </div>

      <div className="flex items-end justify-between gap-4 px-1.5 pb-0.5 pt-3 sm:px-2 sm:pt-3.5">
        <p className="line-clamp-2 max-w-[18rem] text-[15px] font-extrabold leading-[1.2] tracking-tight text-[#123F4A] sm:text-base lg:text-lg">
          {active.title || "Pilihan spesial UMKM Kemayoran"}
        </p>
        {active.link && (
          <Link
            href={active.link}
            aria-label={`Buka ${active.title || "kampanye pilihan"}`}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1D6E4D] text-white shadow-[0_8px_18px_rgba(29,110,77,0.22)] transition-transform hover:-translate-y-0.5 hover:bg-[#10482E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B9AA1] focus-visible:ring-offset-2"
          >
            <Icon name="arrowRight" size={15} />
          </Link>
        )}
      </div>

      {total > 1 && (
        <div className="flex min-h-10 items-center gap-1 px-1.5 pb-0.5 pt-2 sm:px-2" aria-label="Pilih banner">
          {items.map((item, index) => (
            <button
              type="button"
              key={item.id}
              aria-label={`Tampilkan banner ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => setActiveIndex(index)}
              className={`h-10 flex-1 rounded-full px-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B9AA1] focus-visible:ring-offset-2 ${
                index === activeIndex ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <span className={`block h-1.5 rounded-full transition-all ${index === activeIndex ? "bg-[#1D6E4D]" : "bg-[#123F4A]/15 hover:bg-[#123F4A]/32"}`} />
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
