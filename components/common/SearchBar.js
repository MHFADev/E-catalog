"use client";

import { useState, useRef, useEffect } from "react";
import Icon from "./Icon";
import RecentSearches, { rememberRecentSearch } from "./RecentSearches";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Cari produk, toko, atau kategori...",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (selected) => {
    onChange(selected);
    rememberRecentSearch(selected);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const q = value?.trim();
      if (q) {
        rememberRecentSearch(q);
      }
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <span className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-warm-gray pointer-events-none z-10">
        <Icon name="search" size={16} />
      </span>

      <input
        type="search"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Cari produk di katalog"
        className="w-full pl-9 md:pl-11 pr-9 md:pr-10 py-2.5 md:py-3 bg-cream-pure border-2 border-transparent rounded-full text-sm md:text-base text-noir placeholder:text-warm-gray outline-none transition-all focus:bg-white focus:border-forest/30 focus:shadow-[0_0_0_4px_var(--color-glass-forest)]"
      />

      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            setOpen(false);
          }}
          aria-label="Hapus teks pencarian"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-warm-gray hover:text-noir rounded-full hover:bg-cream-warm transition-colors z-10"
        >
          <Icon name="close" size={12} />
        </button>
      )}

      {/* Riwayat Pencarian Dropdown */}
      <RecentSearches
        query={value}
        open={open}
        onSelect={handleSelect}
      />
    </div>
  );
}