"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Icon from "@/components/common/Icon";

const slideImages = [
  "/image-header/1.webp",
  "/image-header/2.webp",
  "/image-header/3.webp",
  "/image-header/4.webp",
];

export default function HeroCarousel() {
  const extendedSlides = [...slideImages, slideImages[0]];
  const TOTAL_SLIDES = slideImages.length;

  const [displayIndex, setDisplayIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const trackRef = useRef(null);
  const displayIndexRef = useRef(0);

  useEffect(() => {
    displayIndexRef.current = displayIndex;
  }, [displayIndex]);

  const goNext = useCallback(() => {
    setDisplayIndex((prev) => prev + 1);
  }, []);

  const goPrev = useCallback(() => {
    setDisplayIndex((prev) => (prev === 0 ? TOTAL_SLIDES - 1 : prev - 1));
  }, [TOTAL_SLIDES]);

  useEffect(() => {
    const timer = setInterval(goNext, 3800);
    return () => clearInterval(timer);
  }, [goNext]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onEnd = () => {
      if (displayIndexRef.current >= TOTAL_SLIDES) {
        track.style.transition = "none";
        setDisplayIndex(0);
        track.style.transform = "translateX(0%)";
        track.offsetHeight;
        track.style.transition = "";
      }
    };

    track.addEventListener("transitionend", onEnd);
    return () => track.removeEventListener("transitionend", onEnd);
  }, [TOTAL_SLIDES]);

  const hideTimerRef = useRef(null);
  const revealControls = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setShowControls(true);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 2000);
  }, []);

  const touchStartX = useCallback((e) => {
    e.currentTarget.dataset.touchStart = e.touches[0].clientX;
  }, []);
  const touchEndX = useCallback(
    (e) => {
      const startX = parseFloat(e.currentTarget.dataset.touchStart);
      if (!startX) return;
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (diff > 50) {
        goNext();
      } else if (diff < -50) {
        goPrev();
      }
    },
    [goNext, goPrev],
  );

  return (
    <div
      className="relative order-first md:order-last select-none"
      onMouseEnter={() => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        setShowControls(true);
      }}
      onMouseLeave={() => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => setShowControls(false), 2000);
      }}
      onFocus={() => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        setShowControls(true);
      }}
      onBlur={() => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => setShowControls(false), 2000);
      }}
    >
      <div
        className="rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl relative"
        onTouchStart={touchStartX}
        onTouchEnd={touchEndX}
      >
        <div
          ref={trackRef}
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${displayIndex * 100}%)` }}
        >
          {extendedSlides.map((src, i) => (
            <div key={i} className="w-full flex-shrink-0">
              <img
                src={src}
                alt={`Slide ${i + 1}`}
                className="w-full aspect-[4/3] object-cover"
                draggable={false}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            revealControls();
            goPrev();
          }}
          className={`absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-all duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-label="Slide sebelumnya"
        >
          <Icon name="chevronLeft" size={20} />
        </button>
        <button
          onClick={() => {
            revealControls();
            goNext();
          }}
          className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-all duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-label="Slide berikutnya"
        >
          <Icon name="chevronRight" size={20} />
        </button>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {slideImages.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                revealControls();
                setDisplayIndex(i);
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === displayIndex
                  ? "bg-white scale-110 shadow-md"
                  : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
