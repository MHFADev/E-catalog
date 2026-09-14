"use client";

import { useEffect, useMemo, useState } from "react";
import Icon from "./Icon";
import { hasFunctionalConsent } from "@/lib/cookieConsent";

const STORAGE_KEY = "umkm-kemayoran:recent-searches";
const MAX_HISTORY = 10;

const POPULAR_SEARCHES = [
  "Kuliner",
  "Kue Kering",
  "Batik Betawi",
  "Kopi",
  "Kerajinan",
  "Nasi Uduk",
  "Sambal",
];

export function readRecentSearches() {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim()) : [];
  } catch {
    return [];
  }
}

export function persistRecentSearches(history) {
  if (typeof window === "undefined") return;
  if (!hasFunctionalConsent()) return; // Hormati pilihan privasi pengguna
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Abaikan jika storage dinonaktifkan
  }
}

export function rememberRecentSearch(query) {
  const normalized = query.trim().replace(/\s+/g, " ");
  if (!normalized || typeof window === "undefined") return;
  if (!hasFunctionalConsent()) return;

  const history = readRecentSearches();
  const next = [
    normalized,
    ...history.filter((item) => item.toLowerCase() !== normalized.toLowerCase()),
  ].slice(0, MAX_HISTORY);

  persistRecentSearches(next);
}

export default function RecentSearches({
  query = "",
  open,
  onSelect,
  className = "",
}) {
  const [history, setHistory] = useState([]);

  const reloadHistory = () => {
    setHistory(readRecentSearches());
  };

  useEffect(() => {
    if (open) {
      reloadHistory();
    }
  }, [open]);

  // Dengarkan juga jika ada perubahan cookie consent
  useEffect(() => {
    const onConsentChanged = () => {
      reloadHistory();
    };
    window.addEventListener("cookie-consent-changed", onConsentChanged);
    return () => window.removeEventListener("cookie-consent-changed", onConsentChanged);
  }, []);

  const visibleHistory = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized
      ? history.filter((item) => item.toLowerCase().includes(normalized))
      : history;
  }, [history, query]);

  const removeSingleItem = (itemToRemove, e) => {
    e.stopPropagation();
    const updated = history.filter(
      (item) => item.toLowerCase() !== itemToRemove.toLowerCase(),
    );
    setHistory(updated);
    persistRecentSearches(updated);
  };

  const clearAllHistory = (e) => {
    e.stopPropagation();
    setHistory([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Abaikan jika error
    }
  };

  if (!open) return null;

  const hasHistory = visibleHistory.length > 0;

  return (
    <div
      className={`absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[70] overflow-hidden rounded-2xl border border-cream-warm bg-white/98 p-2.5 shadow-[0_20px_45px_rgba(15,54,82,0.18)] backdrop-blur-md animate-fade-up ${className}`}
      role="region"
      aria-label="Riwayat dan rekomendasi pencarian"
    >
      {hasHistory ? (
        <>
          <div className="flex items-center justify-between px-2 pb-2 pt-1 border-b border-cream-warm/70 mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-noir">
              <Icon name="history" size={13} className="text-forest" />
              <span>Riwayat Pencarian</span>
            </div>
            <button
              type="button"
              onClick={clearAllHistory}
              className="rounded-lg px-2 py-0.5 text-[11px] font-semibold text-warm-gray transition-colors hover:bg-red-50 hover:text-red-600"
            >
              Hapus semua
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto overscroll-contain pr-0.5 [scrollbar-width:thin]">
            {visibleHistory.map((item) => (
              <div
                key={item}
                onClick={() => onSelect(item)}
                className="group flex h-9.5 w-full items-center justify-between gap-2 rounded-xl px-2.5 text-left text-xs sm:text-sm text-noir transition-colors hover:bg-cream-pure cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cream-warm/60 text-warm-gray group-hover:text-forest group-hover:bg-forest/10 transition-colors">
                    <Icon name="history" size={11} />
                  </span>
                  <span className="truncate">{item}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => removeSingleItem(item, e)}
                  title={`Hapus "${item}" dari riwayat`}
                  aria-label={`Hapus ${item}`}
                  className="p-1 text-warm-gray/60 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Icon name="close" size={11} />
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Jika belum ada riwayat atau riwayat kosong, tampilkan rekomendasi populer */
        <div className="py-2 px-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-noir mb-2">
            <Icon name="starFilled" size={12} className="text-amber-500" />
            <span>Pencarian Populer</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {POPULAR_SEARCHES.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSelect(tag)}
                className="inline-flex items-center gap-1 rounded-xl border border-cream-warm bg-cream-pure px-2.5 py-1 text-xs font-medium text-noir-soft transition-colors hover:border-forest/30 hover:bg-forest/5 hover:text-forest"
              >
                <Icon name="search" size={10} className="text-warm-gray" />
                <span>{tag}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
