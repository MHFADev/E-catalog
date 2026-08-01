"use client";
import { useState } from "react";
import Icon from "@/components/common/Icon";

export default function ProductGallery({ images, name }) {
  // Fallback ke gambar default kalau produk tidak punya foto
  const imgs = images?.length ? images : ["/images/camilan-ciangsana.jpeg"];
  const [idx, setIdx] = useState(0);
  const [err, setErr] = useState(false); // kalau gambar error, pakai gambar default
  const src = err ? "/images/camilan-ciangsana.jpeg" : imgs[idx];
  const showThumbs = imgs.length > 1; // thumbnail cuma muncul kalau foto lebih dari satu

  return (
    <div>
      <div className="relative aspect-square bg-cotton-warm rounded-2xl md:rounded-3xl overflow-hidden">
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setErr(true)}
        />
        {showThumbs && (
          <>
            <button
              onClick={() => setIdx((idx - 1 + imgs.length) % imgs.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-noir-soft hover:bg-white transition-all"
              aria-label="Foto sebelumnya"
            >
              <Icon name="chevronLeft" size={16} />
            </button>
            <button
              onClick={() => setIdx((idx + 1) % imgs.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-noir-soft hover:bg-white transition-all"
              aria-label="Foto berikutnya"
            >
              <Icon name="chevronRight" size={16} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {imgs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === idx ? "bg-white scale-110" : "bg-white/50"
                  }`}
                  aria-label={`Foto ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {showThumbs && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          {imgs.map((img, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 transition-all ${
                i === idx
                  ? "border-cherry shadow-sm"
                  : "border-transparent hover:border-cherry/30"
              }`}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover bg-cotton-warm"
                onError={(e) => {
                  e.currentTarget.src = "/images/camilan-ciangsana.jpeg";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
