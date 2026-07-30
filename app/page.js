"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import Icon from "@/components/common/Icon";
import productsData from "@/data/products.json";
import sellersData from "@/data/sellers.json";
import categories from "@/data/categories.json";

const galleryItems = [
  {
    src: "/images/koleksi/kuliner-khas.webp",
    title: "Kuliner Khas",
    desc: "Aneka makanan tradisional",
  },
  {
    src: "/images/koleksi/kerajinan-tangan.webp",
    title: "Kerajinan Tangan",
    desc: "Produk handmade kreatif",
  },
  {
    src: "/images/koleksi/fasion-lokal.webp",
    title: "Fashion Lokal",
    desc: "Busana khas Ciangsana",
  },
  {
    src: "/images/koleksi/minuman-segar.webp",
    title: "Minuman Segar",
    desc: "Minuman tradisional & modern",
  },
  {
    src: "/images/koleksi/sembako.webp",
    title: "Sembako",
    desc: "Kebutuhan pokok sehari-hari",
  },
];

export default function HomePage() {
  // ===== CAROUSEL STATE =====
  const slideImages = [
    "/image-header/1.webp",
    "/image-header/2.webp",
    "/image-header/3.webp",
    "/image-header/4.webp",
  ];
  // Clone slide pertama di akhir agar loop 4→1 tetap animasi ke kanan
  const extendedSlides = [...slideImages, slideImages[0]];
  const TOTAL_SLIDES = slideImages.length;

  const [displayIndex, setDisplayIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const trackRef = useRef(null);
  const displayIndexRef = useRef(0); // ref biar event listener lihat nilai terbaru

  // Sinkronkan ref dengan state
  useEffect(() => {
    displayIndexRef.current = displayIndex;
  }, [displayIndex]);

  // Fungsi pindah slide — maju ke kanan (tanpa wrap, extendedSlides yang handle loop)
  const goNext = useCallback(() => {
    setDisplayIndex((prev) => prev + 1);
  }, []);

  // Fungsi pindah slide — mundur ke kiri
  const goPrev = useCallback(() => {
    setDisplayIndex((prev) => (prev === 0 ? TOTAL_SLIDES - 1 : prev - 1));
  }, [TOTAL_SLIDES]);

  // Auto-slide setiap 3.5 detik
  useEffect(() => {
    const timer = setInterval(goNext, 3800);
    return () => clearInterval(timer);
  }, [goNext]);

  // Saat transisi selesai — jika di clone (index = TOTAL_SLIDES),
  // loncat ke index 0 tanpa animasi (loop 4→1 tetap ke kanan)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onEnd = () => {
      if (displayIndexRef.current >= TOTAL_SLIDES) {
        track.style.transition = "none"; // matikan transisi
        setDisplayIndex(0);
        track.style.transform = "translateX(0%)"; // loncat ke slide 0
        track.offsetHeight; // paksa reflow
        track.style.transition = ""; // hidupkan transisi lagi
      }
    };

    track.addEventListener("transitionend", onEnd);
    return () => track.removeEventListener("transitionend", onEnd);
  }, [TOTAL_SLIDES]);

  // Tampilkan navbar 2 detik setelah interaksi, lalu sembunyi lagi
  const hideTimerRef = useRef(null); // pakai ref agar timer bisa dibersihkan kapan saja
  const revealControls = useCallback(() => {
    // Bersihkan timer sebelumnya agar tidak bertumpuk
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setShowControls(true);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 2000);
  }, []);

  // Touch/Swipe untuk mobile — deteksi geser kiri/kanan
  const touchStartX = useCallback((e) => {
    e.currentTarget.dataset.touchStart = e.touches[0].clientX;
  }, []);
  const touchEndX = useCallback(
    (e) => {
      const startX = parseFloat(e.currentTarget.dataset.touchStart);
      if (!startX) return;
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (diff > 50) {
        goNext();
      } else if (diff < -50) {
        goPrev();
      }
    },
    [goNext, goPrev],
  );

  const enriched = productsData.map((p) => ({
    ...p,
    sellerName: sellersData.find((s) => s.id === p.sellerId)?.name || "",
  }));
  const featured = enriched.filter((p) => p.isFeatured);

  return (
    <>
      <section className="py-10 md:py-20 bg-cotton">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-6 md:gap-16 items-center">
            <div className="flex flex-col gap-3 md:gap-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 w-fit bg-cherry/10 text-cherry font-mono text-[10px] md:text-xs uppercase tracking-wider rounded-full font-semibold">
                UMKM Ciangsana
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-none tracking-tighter text-noir">
                Temukan <span className="text-cherry">Produk Lokal</span>
                <br />
                Ciangsana
              </h1>
              <p className="text-sm md:text-lg text-warm-gray leading-relaxed max-w-md">
                Jelajahi produk UMKM lokal dari Ciangsana dan sekitarnya
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-1 md:mt-2">
                <Link
                  href="/catalog"
                  className="btn-primary text-sm md:text-base py-2.5 md:py-3"
                >
                  Jelajahi Katalog <Icon name="arrowRight" size={14} />
                </Link>
                <Link
                  href="/about"
                  className="btn-secondary text-sm md:text-base py-2.5 md:py-3 text-center"
                >
                  Tentang Inisiatif
                </Link>
              </div>
            </div>
            {/* ===== CAROUSEL: 4 slide geser + swipe + infinite kanan ===== */}
            <div
              className="relative order-first md:order-last select-none"
              onMouseEnter={() => {
                if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
                setShowControls(true);
              }}
              onMouseLeave={() => {
                if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
                hideTimerRef.current = setTimeout(
                  () => setShowControls(false),
                  2000,
                );
              }}
              onFocus={() => {
                if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
                setShowControls(true);
              }}
              onBlur={() => {
                if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
                hideTimerRef.current = setTimeout(
                  () => setShowControls(false),
                  2000,
                );
              }}
            >
              <div
                className="rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl relative"
                onTouchStart={touchStartX}
                onTouchEnd={touchEndX}
              >
                {/* ===== TRACK: semua slide + clone di akhir (animasi geser) ===== */}
                <div
                  ref={trackRef}
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${displayIndex * 100}%)` }}
                >
                  {extendedSlides.map((src, i) => (
                    <div key={i} className="w-full flex-shrink-0">
                      <img
                        src={src}
                        alt={`Slide ${i + 1}`}
                        className="w-full aspect-[4/3] object-cover"
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>

                {/* Tombol prev/next — muncul 2 detik setelah interaksi */}
                <button
                  onClick={() => {
                    revealControls();
                    goPrev();
                  }}
                  className={`absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-all duration-300 ${
                    showControls
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  }`}
                  aria-label="Slide sebelumnya"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    revealControls();
                    goNext();
                  }}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-all duration-300 ${
                    showControls
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  }`}
                  aria-label="Slide berikutnya"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Indikator titik-titik di bawah (hanya 4 titik, bukan 5) */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {slideImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        revealControls();
                        setDisplayIndex(i);
                      }}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        i === displayIndex
                          ? "bg-white scale-110 shadow-md"
                          : "bg-white/50 hover:bg-white/70"
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-3 md:py-4 bg-white border-y border-cotton-warm">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {[
              { icon: "star", label: "Produk Terbaru" },
              { icon: "gem", label: "Best Seller" },
              { icon: "gift", label: "Koleksi Baru" },
              { icon: "truck", label: "Pengiriman Cepat" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 md:gap-3 text-noir-soft text-[11px] md:text-sm font-medium"
              >
                <Icon
                  name={item.icon}
                  size={16}
                  className="text-cherry shrink-0"
                />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-5 md:mb-8">
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight">
              Produk <span className="text-cherry">Unggulan</span>
            </h2>
            <Link
              href="/catalog"
              className="flex items-center gap-1 text-xs md:text-sm font-medium text-warm-gray hover:text-cherry transition-all"
            >
              Lihat Semua <Icon name="arrowRight" size={12} />
            </Link>
          </div>
          <ProductGrid products={featured} categories={categories} />
          <div className="text-center mt-6 md:mt-8">
            <Link href="/catalog" className="btn-primary text-sm md:text-base">
              Lihat Semua Produk <Icon name="arrowRight" size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-10 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-3 md:gap-4">
            <div
              className="rounded-2xl md:rounded-3xl overflow-hidden flex items-center min-h-[180px] md:min-h-[220px]"
              style={{
                background: "linear-gradient(135deg, #751515, #991B1B)",
              }}
            >
              <div className="p-6 md:p-8">
                <span className="inline-block px-2 py-0.5 md:py-1 mb-3 md:mb-4 bg-white/15 text-cotton font-mono text-[10px] md:text-xs uppercase tracking-wider rounded-full">
                  Penawaran
                </span>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-white mb-1 md:mb-2">
                  Produk Lokal
                  <br />
                  Ciangsana
                </h3>
                <p className="text-xs md:text-sm text-white/70 mb-3 md:mb-4">
                  Dukung UMKM tetangga kita sendiri
                </p>
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-cotton hover:gap-2 transition-all"
                >
                  Jelajahi <Icon name="arrowRight" size={12} />
                </Link>
              </div>
            </div>
            <div className="rounded-2xl md:rounded-3xl overflow-hidden flex items-center min-h-[180px] md:min-h-[220px] bg-cotton-warm">
              <div className="p-6 md:p-8">
                <span className="inline-block px-2 py-0.5 md:py-1 mb-3 md:mb-4 bg-cherry/10 text-cherry font-mono text-[10px] md:text-xs uppercase tracking-wider rounded-full">
                  Kemudahan
                </span>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-noir mb-1 md:mb-2">
                  Pesan Langsung
                  <br />
                  via WhatsApp
                </h3>
                <p className="text-xs md:text-sm text-warm-gray mb-3 md:mb-4">
                  Hubungi penjual tanpa perantara
                </p>
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-cherry hover:gap-2 transition-all"
                >
                  Mulai <Icon name="arrowRight" size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-10 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-5 md:mb-8">
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight">
              Jelajahi <span className="text-cherry">Koleksi</span>
            </h2>
            <Link
              href="/catalog"
              className="flex items-center gap-1 text-xs md:text-sm font-medium text-warm-gray hover:text-cherry transition-all"
            >
              Lihat Semua <Icon name="arrowRight" size={12} />
            </Link>
          </div>
          {/* [SCROLL] Jelajahi Koleksi - horizontal scroll tanpa overlap */}
          <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory scrollbar-thin">
            {galleryItems.map((item, i) => (
              <div
                key={i}
                className="snap-start shrink-0"
                style={{
                  flex: "0 0 260px",
                }}
              >
                <div className="group rounded-xl md:rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]">
                  <div className="aspect-[16/9] overflow-hidden bg-cotton-warm rounded-xl md:rounded-2xl shadow-lg">
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="pt-2">
                    <h3 className="text-sm md:text-base font-semibold tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs md:text-sm text-warm-gray">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-4 md:py-6 bg-white border-t border-cotton-warm">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 md:items-center">
            {[
              { icon: "lock", label: "Transaksi Aman" },
              { icon: "headset", label: "Dukungan 24/7" },
              { icon: "star", label: "Kualitas Lokal" },
              { icon: "refresh", label: "Mudah & Cepat" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 md:gap-3 text-noir-soft text-[11px] md:text-sm font-medium md:justify-center"
              >
                <Icon
                  name={item.icon}
                  size={16}
                  className="text-cherry shrink-0"
                />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* [SCROLL] Scrollbar tipis untuk Jelajahi Koleksi */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar { height: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: #F5F0E8; border-radius: 2px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #B91C1C; border-radius: 2px; }
      `}</style>
    </>
  );
}
