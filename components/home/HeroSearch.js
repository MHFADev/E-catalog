"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/common/Icon";
import RecentSearches, { rememberRecentSearch } from "@/components/common/RecentSearches";

export default function HeroSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (term) => {
    const target = (term !== undefined ? term : query).trim().replace(/\s+/g, " ");
    setIsOpen(false);
    if (!target) {
      router.push("/catalog");
      return;
    }
    rememberRecentSearch(target);
    setQuery(target);
    router.push(`/catalog?search=${encodeURIComponent(target)}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div ref={containerRef} className="relative mt-6 max-w-xl">
      <form
        onSubmit={handleSubmit}
        className="flex items-center rounded-2xl border border-hutan/15 bg-white p-1.5 shadow-[0_8px_25px_rgba(18,63,43,0.06)] transition-all focus-within:border-forest focus-within:ring-4 focus-within:ring-forest/10"
      >
        <span className="ml-3 shrink-0 text-warm-gray" aria-hidden="true">
          <Icon name="search" size={18} />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Cari nasi uduk, kue kering, baju, souvenir..."
          aria-label="Cari produk UMKM lokal"
          className="min-w-0 flex-1 bg-transparent px-2.5 py-2.5 text-sm text-noir outline-none placeholder:text-warm-gray sm:text-base"
        />
        <button
          type="submit"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-forest px-5 text-sm font-bold text-white transition-all hover:bg-forest-deep active:scale-[0.98]"
        >
          <span>Cari</span>
          <Icon name="arrowRight" size={14} />
        </button>
      </form>

      {/* Riwayat & Rekomendasi Pencarian Dropdown */}
      <RecentSearches
        query={query}
        open={isOpen}
        onSelect={(selected) => handleSearch(selected)}
      />
    </div>
  );
}
