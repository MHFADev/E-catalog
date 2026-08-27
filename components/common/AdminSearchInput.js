"use client";

/**
 * Komponen input pencarian untuk halaman admin.
 * Menggunakan URL search params (?q=...) agar hasil pencarian bisa di-share
 * dan tetap persisten saat navigasi balik. Didesain untuk dipakai bersama
 * Server Component — data filtering dilakukan di sisi server berdasarkan param `q`.
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export default function AdminSearchInput({ placeholder = "Cari nama..." }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }

    // Gunakan startTransition agar navigasi tidak memblokir input
    startTransition(() => {
      router.replace(`?${params.toString()}`);
    });
  };

  return (
    <div className="relative mb-4">
      {/* Ikon pencarian */}
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        defaultValue={searchParams.get("q") ?? ""}
        onChange={handleChange}
        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-cream-warm bg-white text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all"
      />
      {/* Indikator loading saat navigasi search */}
      {isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-forest/30 border-t-forest rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
