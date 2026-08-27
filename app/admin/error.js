"use client";

import { useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/common/Icon";

export default function AdminError({ error, reset }) {
  useEffect(() => {
    console.error("Admin route render failed", error);
  }, [error]);

  return (
    <main className="min-h-[70vh] bg-cream px-4 py-16 sm:py-24">
      <section className="mx-auto max-w-md rounded-3xl border border-cream-warm bg-white p-7 text-center shadow-card sm:p-9">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-forest/10 text-forest">
          <Icon name="info" size={24} />
        </span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-forest">Panel Admin</p>
        <h1 className="mt-2 text-xl font-extrabold text-noir">Halaman admin belum dapat dimuat</h1>
        <p className="mt-3 text-sm leading-6 text-cool-gray">
          Sesi atau layanan data sedang diperbarui. Coba muat ulang halaman terlebih dahulu.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button type="button" onClick={reset} className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm">
            <Icon name="refresh" size={15} /> Coba lagi
          </button>
          <Link href="/admin/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-cream-warm px-5 py-2.5 text-sm font-semibold text-noir-soft transition-colors hover:bg-cream">
            <Icon name="user" size={15} /> Masuk ulang
          </Link>
        </div>
      </section>
    </main>
  );
}
