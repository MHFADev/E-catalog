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
  const changeSlide = (index) => setActiveIndex(index);
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
    <div key={active.id} className="absolute inset-0 overflow-hidden bg-[#E7EFE5]">
      <img
        src={active.imageUrl}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl saturate-75"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-white/55 via-transparent to-[#123F4A]/15" />
      <img
        src={active.imageUrl}
        alt={active.title || "Kampanye pilihan UMKM Kemayoran"}
        className="relative z-[1] h-full w-full object-contain motion-safe:animate-[heroCampaignIn_600ms_var(--ease-out-expo)_both]"
        loading="eager"
      />
    </div>
  );

  return (
    <aside
      aria-label="Kampanye pilihan"
      className="hero-campaign relative overflow-hidden rounded-[1.45rem] border border-[#123F4A]/10 bg-white/95 p-2.5 shadow-[0_20px_48px_rgba(18,63,74,0.16)] ring-1 ring-white/70 motion-safe:animate-[fadeInUp_0.75s_var(--ease-out-expo)_100ms_both] sm:rounded-[2rem] sm:p-3.5 lg:col-span-4 lg:flex lg:aspect-[16/11] lg:flex-col"
      onMouseEnter={() => setIsInteractionPaused(true)}
      onMouseLeave={() => setIsInteractionPaused(false)}
      onFocusCapture={() => setIsInteractionPaused(true)}
      onBlurCapture={() => setIsInteractionPaused(false)}
    >
      <div className="flex items-center justify-between gap-3 px-1.5 pb-2.5 pt-0.5 sm:pb-3 lg:pb-3.5">
        <span className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#123F4A]">
          <span className="h-2 w-2 rounded-full bg-[#C87055] ring-4 ring-[#C87055]/15" />
          Promo & agenda pilihan
        </span>
        <span className="font-mono text-[10px] font-bold tabular-nums text-[#1D6E4D]/65">
          {String(activeIndex + 1).padStart(2, "0")} — {String(total).padStart(2, "0")}
        </span>
      </div>

      <div
        className="group relative aspect-[16/10] min-h-0 overflow-hidden rounded-[1.05rem] border border-[#123F4A]/10 bg-[#E7EFE5] sm:rounded-[1.45rem] lg:flex-1 lg:aspect-auto"
        role="region"
        aria-roledescription="carousel"
        aria-label={`Banner ${activeIndex + 1} dari ${total}`}
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
              className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-[#123F4A]/65 text-white opacity-0 shadow-lg backdrop-blur-sm transition-all hover:bg-[#123F4A]/90 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white group-hover:opacity-100 sm:flex"
            >
              <Icon name="chevronLeft" size={17} />
            </button>
            <button
              type="button"
              aria-label="Banner berikutnya"
              onClick={next}
              className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-[#123F4A]/65 text-white opacity-0 shadow-lg backdrop-blur-sm transition-all hover:bg-[#123F4A]/90 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white group-hover:opacity-100 sm:flex"
            >
              <Icon name="chevronRight" size={17} />
            </button>
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 px-1.5 pb-0.5 pt-3 sm:px-2 sm:pt-3.5">
        <div className="min-w-0">
          <span className="mb-1 inline-flex border-l-2 border-[#C87055] pl-2 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#1D6E4D]/75">
            Pilihan UMKM
          </span>
          <p className="line-clamp-2 text-[15px] font-extrabold leading-[1.18] tracking-tight text-[#123F4A] sm:text-base lg:text-lg">
            {active.title || "Pilihan spesial UMKM Kemayoran"}
          </p>
        </div>
        {active.link && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1D6E4D] text-white shadow-[0_8px_18px_rgba(29,110,77,0.24)] transition-transform group-hover:translate-x-0.5 sm:h-10 sm:w-10">
            <Icon name="arrowRight" size={15} />
          </span>
        )}
      </div>

      {total > 1 && (
        <div className="flex items-center justify-between gap-3 px-1.5 pb-0.5 pt-3 sm:px-2">
          <div className="flex items-center gap-1.5" aria-label="Pilih banner">
            {items.map((item, index) => (
              <button
                type="button"
                key={item.id}
                aria-label={`Tampilkan banner ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => changeSlide(index)}
                className={`h-1.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B9AA1] focus-visible:ring-offset-2 ${
                  index === activeIndex
                    ? "w-8 bg-[#1D6E4D]"
                    : "w-1.5 bg-[#123F4A]/20 hover:bg-[#123F4A]/45"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] font-bold tabular-nums text-[#1D6E4D]/65 sm:hidden">
              {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <button
              type="button"
              aria-pressed={isUserPaused}
              onClick={() => setIsUserPaused((value) => !value)}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1D6E4D] transition-colors hover:text-[#123F4A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B9AA1] focus-visible:ring-offset-2"
            >
              <span aria-hidden="true" className="text-[11px] leading-none">{isUserPaused ? "▶" : "Ⅱ"}</span>
              <span className="hidden sm:inline">{isUserPaused ? "Putar" : "Jeda"}</span>
              <span className="sm:hidden sr-only">{isUserPaused ? "Putar" : "Jeda"} carousel</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
