"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Icon from "@/components/common/Icon";

const IMAGES = [
  "/image-header/1.webp",
  "/image-header/2.webp",
  "/image-header/3.webp",
  "/image-header/4.webp",
];

// ================================================================
// 3D Focus Carousel / Coverflow Slider
// - Max 3 card terlihat: kiri, tengah, kanan (yang lain tersembunyi).
// - Tengah: besar, tajam, opacity 1, drop-shadow, z paling tinggi.
// - Sisi: mengecil (scale .86/.88), blur(4px), opacity .55, z lebih rendah.
// - Autoplay kanan→kiri tiap 4.2s, PAUSE saat hover/touch.
// ================================================================
export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const timerRef = useRef(null);
  const total = IMAGES.length;

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setActive((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (paused) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(next, 4500);
    return () => clearInterval(timerRef.current);
  }, [next, paused]);

  /* offset: -1 = kiri, 0 = tengah, 1 = kanan (loop aman). */
  const offset = (i) => {
    let d = i - active;
    if (d > total / 2) d -= total;
    if (d < -total / 2) d += total;
    return d;
  };

  /* Deteksi jumlah kartu tampil per breakpoint (3 desktop, 1 mobile) */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const apply = () => setVisibleCount(mq.matches ? 3 : 1);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const showCard = (pos) => {
    if (visibleCount === 1) {
      return pos === 0;
    }
    return Math.abs(pos) <= 1;
  };

  return (
    <div
      className="relative w-full aspect-[21/10] md:aspect-[21/9] overflow-hidden rounded-2xl md:rounded-3xl select-none bg-noir/10 coverbox"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Kartu-kartu — diposisikan horizontal & sejajar tengah */}
      {IMAGES.map((src, i) => {
        const pos = offset(i);
        if (!showCard(pos)) return null;

        const isCenter = pos === 0;
        const isLeft = pos === -1;
        const isRight = pos === 1;

        return (
          <div
            key={i}
            data-pos={isCenter ? "0" : isLeft ? "-1" : "1"}
            data-center={isCenter ? "true" : "false"}
            className="covercard"
            onClick={() => setActive(i)}
            style={{
              opacity: isCenter ? 1 : 0.55,
              zIndex: isCenter ? 10 : 5,
              filter: isCenter ? "blur(0px)" : "blur(4px)",
              transition:
                "transform .55s cubic-bezier(.16,1,.3,1), width .55s cubic-bezier(.16,1,.3,1), filter .45s ease-in-out, opacity .45s ease-in-out, box-shadow .55s ease",
              boxShadow: isCenter
                ? "0 24px 60px -12px rgba(0,0,0,.45)"
                : "0 10px 24px -8px rgba(0,0,0,.25)",
            }}
          >
            <img
              src={src}
              alt={`Banner ${i + 1}`}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        );
      })}

      {/* Gradient bawah supaya dots terbaca */}
      <div className="absolute inset-x-0 bottom-0 h-20 md:h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-[8]" />

      {/* Dots */}
      <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Slide ${i + 1}`}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === active ? "bg-white scale-125 shadow" : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      {/* Navigasi */}
      <button
        onClick={prev}
        aria-label="Sebelumnya"
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/55 transition-all"
      >
        <Icon name="chevronLeft" size={18} />
      </button>
      <button
        onClick={next}
        aria-label="Berikutnya"
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/55 transition-all"
      >
        <Icon name="chevronRight" size={18} />
      </button>

      {/* CSS kustom coverflow: posisi/ukuran responsif per status kartu */}
      <style>{`
        .covercard {
          position: absolute;
          top: 50%;
          cursor: pointer;
          overflow: hidden;
          border-radius: 1rem;
        }
        /* Mobile: hanya kartu tengah yang tampil (pisahkan dari sidebar) */
        .coverbox [data-pos="0"] {
          left: 50%;
          width: 92%;
          transform: translate(-50%, -50%) scale(1);
        }
        .coverbox [data-pos="-1"],
        .coverbox [data-pos="1"] {
          display: none;
        }
        @media (min-width: 640px) {
          .coverbox [data-pos="0"] {
            left: 50%;
            width: 56%;
            transform: translate(-50%, -50%) scale(1.08);
          }
          .coverbox [data-pos="-1"] {
            left: 3%;
            display: block;
            width: 34%;
            transform: translate(0, -50%) scale(0.85);
          }
          .coverbox [data-pos="1"] {
            left: auto;
            right: 3%;
            display: block;
            width: 34%;
            transform: translate(0, -50%) scale(0.85);
          }
        }
      `}</style>
    </div>
  );
}