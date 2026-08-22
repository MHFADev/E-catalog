"use client";

import { useEffect, useMemo, useState } from "react";
import Icon from "./Icon";

const STORAGE_KEY = "umkm-kemayoran:recent-searches";
const MAX_HISTORY = 12;

function readHistory() {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function persistHistory(history) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Riwayat hanyalah peningkatan pengalaman; pencarian tetap berfungsi saat storage tidak tersedia.
  }
}

export function rememberRecentSearch(query) {
  const normalized = query.trim().replace(/\s+/g, " ");
  if (!normalized || typeof window === "undefined") return;

  const history = readHistory();
  const next = [normalized, ...history.filter((item) => item.toLowerCase() !== normalized.toLowerCase())].slice(0, MAX_HISTORY);
  persistHistory(next);
}

export default function RecentSearches({ query = "", open, onSelect }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (open) setHistory(readHistory());
  }, [open]);

  const visibleHistory = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? history.filter((item) => item.toLowerCase().includes(normalized)) : history;
  }, [history, query]);

  const clearHistory = () => {
    setHistory([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Tidak ada tindakan tambahan yang dibutuhkan bila browser menolak akses storage.
    }
  };

  if (!open || !visibleHistory.length) return null;

  return (
    <div
      className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-[60] overflow-hidden rounded-2xl border border-cream-warm bg-white p-2 shadow-[0_18px_44px_rgba(15,54,82,0.16)] animate-fade-up"
      role="region"
      aria-label="Riwayat pencarian"
    >
      <div className="flex items-center justify-between px-2.5 pb-2 pt-1">
        <span className="text-xs font-bold text-noir">Riwayat pencarian</span>
        <button
          type="button"
          onClick={clearHistory}
          className="rounded-md px-1.5 py-1 text-[11px] font-semibold text-forest transition-colors hover:bg-forest/10 hover:text-forest-deep"
        >
          Hapus semua
        </button>
      </div>

        <div className="max-h-[7.5rem] overflow-y-auto overscroll-contain pr-0.5 [scrollbar-width:thin]">
        {visibleHistory.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className="flex h-10 w-full items-center gap-2.5 rounded-xl px-2.5 text-left text-sm text-noir-soft transition-colors hover:bg-cream focus:bg-cream focus:outline-none"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream text-muted">
              <Icon name="search" size={14} />
            </span>
            <span className="truncate">{item}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
