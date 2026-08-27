"use client";

import { useRef, useState } from "react";
import Icon from "@/components/common/Icon";

const FALLBACK_IMAGE = "/images/webp-2/camilan-ciangsana.webp";

export default function ProductGallery({ images, name }) {
  const imgs = images?.length ? images : [FALLBACK_IMAGE];
  const [idx, setIdx] = useState(0);
  const [err, setErr] = useState(false);
  const touchStartX = useRef(null);
  const src = err ? FALLBACK_IMAGE : imgs[idx];
  const showThumbs = imgs.length > 1;

  const moveTo = (nextIndex) => {
    setErr(false);
    setIdx((nextIndex + imgs.length) % imgs.length);
  };

  const previous = () => moveTo(idx - 1);
  const next = () => moveTo(idx + 1);

  const onTouchEnd = (event) => {
    if (touchStartX.current == null) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(distance) < 42) return;
    if (distance > 0) previous();
    else next();
  };

  return (
    <div className="min-w-0">
      <div
        className="surface-raised relative aspect-square overflow-hidden rounded-[1.65rem] md:rounded-[2.25rem] lg:aspect-auto lg:h-[55vh] lg:min-h-[430px]"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500"
          onError={() => setErr(true)}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-hutan/30 to-transparent" />

        {showThumbs && (
          <>
            <button
              type="button"
              onClick={previous}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-white/82 text-noir-soft shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-white focus-visible:outline-none md:left-4 md:h-11 md:w-11"
              aria-label="Foto sebelumnya"
            >
              <Icon name="chevronLeft" size={18} />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-white/82 text-noir-soft shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-white focus-visible:outline-none md:right-4 md:h-11 md:w-11"
              aria-label="Foto berikutnya"
            >
              <Icon name="chevronRight" size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-hutan/35 px-2.5 py-1.5 backdrop-blur-md md:bottom-4">
              {imgs.map((_, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => moveTo(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === idx ? "w-5 bg-white" : "w-1.5 bg-white/55 hover:bg-white/80"
                  }`}
                  aria-label={`Tampilkan foto ${index + 1}`}
                  aria-current={index === idx ? "true" : undefined}
                />
              ))}
            </div>
          </>
        )}

        <span className="absolute right-3 top-3 rounded-full border border-white/20 bg-hutan/40 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md md:right-4 md:top-4">
          {idx + 1} / {imgs.length}
        </span>
      </div>

      {showThumbs && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {imgs.map((img, index) => (
            <button
              type="button"
              key={index}
              onClick={() => moveTo(index)}
              className={`group relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all md:h-[4.5rem] md:w-[4.5rem] ${
                index === idx
                  ? "border-forest shadow-[0_6px_14px_rgba(0,85,160,0.18)]"
                  : "border-transparent opacity-70 hover:border-forest/30 hover:opacity-100"
              }`}
              aria-label={`Pilih foto ${index + 1}`}
              aria-current={index === idx ? "true" : undefined}
            >
              <img
                src={img}
                alt=""
                className="h-full w-full object-cover bg-cream-warm transition-transform duration-300 group-hover:scale-105"
                onError={(event) => {
                  event.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
