"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";
import {
  getCookieConsent,
  setCookieConsent,
} from "@/lib/cookieConsent";

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Preference switches in modal
  const [functional, setFunctional] = useState(true);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    setMounted(true);
    const existing = getCookieConsent();
    if (!existing) {
      // Tampilkan banner setelah jeda halus
      const timer = setTimeout(() => setShowBanner(true), 800);
      return () => clearTimeout(timer);
    } else {
      setFunctional(Boolean(existing.functional));
      setAnalytics(Boolean(existing.analytics));
    }
  }, []);

  // Dengarkan event untuk membuka kembali pengaturan cookie dari footer atau menu
  useEffect(() => {
    const handleOpenSettings = () => {
      const existing = getCookieConsent();
      if (existing) {
        setFunctional(Boolean(existing.functional));
        setAnalytics(Boolean(existing.analytics));
      }
      setShowModal(true);
    };

    window.addEventListener("open-cookie-settings", handleOpenSettings);
    return () => window.removeEventListener("open-cookie-settings", handleOpenSettings);
  }, []);

  const handleAcceptAll = () => {
    setCookieConsent({ status: "accepted", functional: true, analytics: true });
    setShowBanner(false);
    setShowModal(false);
  };

  const handleEssentialOnly = () => {
    setCookieConsent({ status: "declined", functional: false, analytics: false });
    setShowBanner(false);
    setShowModal(false);
  };

  const handleSaveCustom = () => {
    setCookieConsent({
      status: "custom",
      functional,
      analytics,
    });
    setShowBanner(false);
    setShowModal(false);
  };

  if (!mounted) return null;

  return (
    <>
      {/* ===== FLOATING COOKIE BANNER ===== */}
      {showBanner && !showModal && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Pemberitahuan Izin Cookie"
          className="fixed bottom-4 left-4 right-4 z-[999] mx-auto max-w-2xl animate-fade-up sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-lg"
        >
          <div className="overflow-hidden rounded-3xl border border-forest/15 bg-white/95 p-5 sm:p-6 shadow-[0_20px_60px_rgba(18,63,43,0.22)] backdrop-blur-xl ring-1 ring-black/5">
            <div className="flex items-start gap-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-forest/10 text-forest">
                <Icon name="cookie" size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-noir sm:text-base">
                  Izin Penggunaan Cookie &amp; Data Lokal
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-cool-gray">
                  Kami menggunakan cookie dan penyimpanan lokal untuk mengingat preferensi, menyimpan{" "}
                  <strong className="text-noir font-semibold">riwayat pencarian produk</strong>, dan mengoptimalkan pengalaman belanja Anda di Katalog UMKM Kemayoran.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-cream-warm pt-4">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-warm-gray hover:text-forest transition-colors py-1.5"
              >
                <Icon name="sliders" size={12} />
                <span>Atur Preferensi</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleEssentialOnly}
                  className="flex-1 sm:flex-initial rounded-xl border border-cream-warm bg-cream-pure px-3.5 py-2 text-xs font-semibold text-noir transition-colors hover:bg-cream-warm"
                >
                  Hanya Esensial
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-initial rounded-xl bg-forest px-4 py-2 text-xs font-bold text-white transition-all hover:bg-forest-deep shadow-sm"
                >
                  Terima Semua
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== DETAILED PREFERENCES MODAL ===== */}
      {showModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
        >
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-cream-warm bg-white p-5 sm:p-7 shadow-2xl animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cream-warm pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-forest/10 text-forest">
                  <Icon name="sliders" size={17} />
                </div>
                <div>
                  <h2 id="cookie-modal-title" className="text-base font-bold text-noir sm:text-lg">
                    Pengaturan Privasi &amp; Cookie
                  </h2>
                  <p className="text-xs text-warm-gray">
                    Kelola preferensi data yang disimpan di peramban Anda.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl p-2 text-warm-gray hover:bg-cream-warm hover:text-noir transition-colors"
                aria-label="Tutup pengaturan cookie"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            {/* Cookie Categories List */}
            <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* 1. Essential (Required) */}
              <div className="rounded-2xl border border-cream-warm bg-cream-pure/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-noir">
                        Cookie Esensial
                      </span>
                      <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-bold text-forest">
                        Selalu Aktif
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-cool-gray leading-relaxed">
                      Dibutuhkan agar situs web berfungsi dengan benar, seperti autentikasi login, sesi belanja, dan keamanan CSRF.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Functional & Search History */}
              <div className="rounded-2xl border border-cream-warm bg-white p-4 transition-colors hover:border-forest/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-bold text-noir">
                      Fungsional &amp; Riwayat Pencarian
                    </span>
                    <p className="mt-1 text-xs text-cool-gray leading-relaxed">
                      Menyimpan riwayat pencarian produk terakhir Anda, filter katalog yang dipilih, dan preferensi tampilan agar tidak perlu mengetik ulang.
                    </p>
                  </div>

                  <label className="relative inline-flex cursor-pointer items-center shrink-0">
                    <input
                      type="checkbox"
                      checked={functional}
                      onChange={(e) => setFunctional(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="h-6 w-11 rounded-full bg-cream-warm peer-checked:bg-forest transition-colors after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
                  </label>
                </div>
              </div>

              {/* 3. Analytics & Performance */}
              <div className="rounded-2xl border border-cream-warm bg-white p-4 transition-colors hover:border-forest/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-bold text-noir">
                      Analitik &amp; Peningkatan Layanan
                    </span>
                    <p className="mt-1 text-xs text-cool-gray leading-relaxed">
                      Membantu kami memahami pola kunjungan secara anonim untuk terus meningkatkan kecepatan dan kenyamanan katalog bagi warga.
                    </p>
                  </div>

                  <label className="relative inline-flex cursor-pointer items-center shrink-0">
                    <input
                      type="checkbox"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="h-6 w-11 rounded-full bg-cream-warm peer-checked:bg-forest transition-colors after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end border-t border-cream-warm pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-cream-warm bg-white px-4 py-2.5 text-xs font-semibold text-cool-gray transition-colors hover:bg-cream-warm"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveCustom}
                className="rounded-xl bg-forest px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-forest-deep shadow-sm"
              >
                Simpan Pengaturan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
