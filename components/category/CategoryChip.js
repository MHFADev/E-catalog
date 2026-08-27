"use client";

import { useState } from "react";
import CategoryVisualIcon from "@/components/category/CategoryVisualIcon";

// Tombol kategori mempertahankan ukuran ikon yang konsisten tanpa kotak latar agar ilustrasi outline tampil utuh.
export default function CategoryChip({ category, active, onClick }) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onClick(active ? null : category.id)}
      aria-pressed={active}
      className={`relative inline-flex min-h-[52px] items-center gap-2.5 px-3 py-2 rounded-2xl text-sm font-semibold overflow-hidden transition-all duration-300 border shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 ${
        active
          ? "border-forest-deep text-white shadow-lg shadow-forest/20 -translate-y-0.5"
          : "border-cream-warm bg-cream-pure text-noir-soft md:hover:border-forest-deep md:hover:text-forest-deep md:hover:-translate-y-0.5 md:hover:shadow-md"
      }`}
    >
      {active && (
        <span className="absolute inset-0 z-0 transition-opacity duration-300">
          {!imgError ? (
            <img
              src={category.image}
              alt=""
              className="w-full h-full object-cover blur-sm scale-110 brightness-[0.56] saturate-[0.8]"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="absolute inset-0 bg-gradient-to-br from-forest to-forest-deep" />
          )}
          <span className="absolute inset-0 bg-forest-deep/35" />
        </span>
      )}

      <span className="relative z-10 flex min-w-0 items-center gap-2.5">
        <span
          className={`category-icon-frame flex h-10 w-10 shrink-0 items-center justify-center overflow-visible p-0 transition-transform duration-300 ${
            active ? "scale-105" : "md:group-hover:scale-[1.06]"
          }`}
        >
          <CategoryVisualIcon
            category={category}
            className="category-icon-art block h-full w-full"
            fallbackSize={20}
          />
        </span>
        <span className="leading-tight">{category.name}</span>
      </span>
    </button>
  );
}
