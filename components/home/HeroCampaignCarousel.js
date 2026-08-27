"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@/components/common/Icon";

const AUTO_ADVANCE_MS = 6500;

export default function HeroCampaignCarousel({ banners = [] }) {
  const items = useMemo(() => banners.slice(0, 5), [banners]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = items.length;
  const active = items[activeIndex] || null;

  useEffect(() => {
    if (activeIndex >= total) setActiveIndex(0);
  }, [activeIndex, total]);

  useEffect(() => {
    if (total < 2 || paused) return undefined;
    const timer = window.setInterval(
      () => setActiveIndex((current) => (current + 1) % total),
      AUTO_ADVANCE_MS,
    );
    return () => window.clearInterval(timer);
  }, [paused, total]);

  if (!active) return null;

  const previous = () => setActiveIndex((current) => (current - 1 + total) % total);
  const next = () => setActiveIndex((current) => (current + 1) % total);
  const picture = (
    <img
      key={active.id}
      src={active.imageUrl}
      alt={active.title || "Kampanye pilihan UMKM Kemayoran"}
      className="absolute inset-0 h-full w-full object-cover motion-safe:animate-[heroCampaignIn_600ms_var(--ease-out-expo)_both]"
      loading="eager"
    />
  );

  return (
    <aside
      aria-label="Kampanye pilihan"
      className="hero-campaign relative overflow-hidden rounded-[1.5rem] border border-[#123F4A]/10 bg-[#FFF7E8] p-2.5 shadow-[0_18px_42px_rgba(18,63,74,0.15)] sm:rounded-[2rem] sm:p-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="mb-2 flex items-center justify-between gap-3 px-1 sm:mb-3 sm:px-1.5">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#123F4A] sm:text-[11px]">
          <span className="h-2 w-2 rounded-full bg-[#C87055] ring-4 ring-[#C87055]/15" />
          Pilihan minggu ini
        </span>
        {total > 1 && (
          <span className="font-mono text-[10px] font-bold tabular-nums text-[#1D6E4D]/65 sm:text-[11px]">
            {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        )}
      </div>

      <div
        className="group relative aspect-[3/2] overflow-hidden rounded-[1.1rem] bg-[#123F4A] sm:rounded-[1.45rem]"
        role="region"
        aria-roledescription="carousel"
        aria-label={`Banner ${activeIndex + 1} dari ${total}`}
      >
        {active.link ? (
          <Link href={active.link} className="absolute inset-0 block focus:outline-none focus-visible:ring-4 focus-visible:ring-[#3B9AA1] focus-visible:ring-inset">
            {picture}
          </Link>
        ) : (
          picture
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#123F4A]/80 via-[#123F4A]/8 to-transparent" />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 sm:p-4">
          <div className="min-w-0">
            <span className="mb-1 inline-flex rounded-full border border-white/30 bg-[#123F4A]/40 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm">
              Kampanye UMKM
            </span>
            {active.title && (
              <p className="line-clamp-2 text-sm font-extrabold leading-tight text-white drop-shadow-sm sm:text-base">
                {active.title}
              </p>
            )}
          </div>
          {active.link && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/15 text-white backdrop-blur-sm sm:h-9 sm:w-9">
              <Icon name="externalLink" size={14} />
            </span>
          )}
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Banner sebelumnya"
              onClick={previous}
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-[#123F4A]/55 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-[#123F4A]/80 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white group-hover:opacity-100 sm:left-3 sm:h-9 sm:w-9"
            >
              <Icon name="chevronLeft" size={17} />
            </button>
            <button
              type="button"
              aria-label="Banner berikutnya"
              onClick={next}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-[#123F4A]/55 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-[#123F4A]/80 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white group-hover:opacity-100 sm:right-3 sm:h-9 sm:w-9"
            >
              <Icon name="chevronRight" size={17} />
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="mt-2.5 flex items-center justify-between gap-3 px-1 sm:mt-3 sm:px-1.5">
          <div className="flex items-center gap-1.5" aria-label="Pilih banner">
            {items.map((item, index) => (
              <button
                type="button"
                key={item.id}
                aria-label={`Tampilkan banner ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B9AA1] focus-visible:ring-offset-2 ${
                  index === activeIndex
                    ? "w-7 bg-[#1D6E4D]"
                    : "w-1.5 bg-[#123F4A]/18 hover:bg-[#123F4A]/40"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1D6E4D] transition-colors hover:text-[#123F4A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B9AA1] focus-visible:ring-offset-2"
          >
            <span aria-hidden="true" className="text-[11px] leading-none">{paused ? "▶" : "Ⅱ"}</span>
            {paused ? "Putar" : "Jeda"}
          </button>
        </div>
      )}
    </aside>
  );
}
