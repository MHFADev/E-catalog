"use client";

import { useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/common/Icon";

// Error boundary root (App Router): menangkap error Server/Client Component
// agar pengunjung tidak melihat white screen, tapi kartu pesan yang ramah.
export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("Application error:", error);
    }
  }, [error]);

  return (
    <div className="min-h-[60vh] bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm text-center">
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-forest/10 text-forest mb-5">
          <Icon name="info" size={28} />
        </span>
        <h1 className="text-lg md:text-xl font-extrabold text-noir mb-2">
          Terjadi Kesalahan
        </h1>
        <p className="text-xs md:text-sm text-warm-gray leading-relaxed mb-6">
          Maaf, halaman ini tidak bisa ditampilkan saat ini. Silakan coba lagi
          sebentar atau kembali ke beranda.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            onClick={reset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-forest text-white text-sm font-bold hover:bg-forest-deep transition-all"
          >
            <Icon name="refresh" size={15} /> Coba Lagi
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-cream-warm text-sm font-semibold text-noir-soft hover:border-forest hover:text-forest transition-all"
          >
            <Icon name="homeFilled" size={15} /> Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}