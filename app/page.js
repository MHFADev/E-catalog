import Link from "next/link";
import FeaturedProducts from "@/components/product/FeaturedProducts";
import Icon from "@/components/common/Icon";
import CategoryVisualIcon from "@/components/category/CategoryVisualIcon";

import MultiPinMap from "@/components/common/MultiPinMap";
import PartnerLogos from "@/components/common/PartnerLogos";
import { getProducts, getSellers, getCategories } from "@/lib/catalog";
import { getBanners } from "@/lib/banners";



const events = [
  {
    day: "12",
    month: "AGU",
    title: "Bazar UMKM Kemayoran",
    desc: "Pameran dan penjualan produk unggulan UMKM lokal.",
    place: "Lapangan Kemayoran",
    time: "09.00 - 16.00 WIB",
  },
  {
    day: "25",
    month: "AGU",
    title: "Workshop Digital Marketing",
    desc: "Pelatihan gratis cara memasarkan produk secara online.",
    place: "Balai Warga RW 05",
    time: "13.00 - 16.00 WIB",
  },
  {
    day: "08",
    month: "SEP",
    title: "Kelas Produksi & Kemasan",
    desc: "Belajar kemasan produk yang menarik dan food grade.",
    place: "Aula Kelurahan",
    time: "09.00 - 12.00 WIB",
  },
];

const testimonials = [
  {
    name: "Siti Nurhaliza",
    role: "Pemilik Aneka Cemilan 39",
    avatar: "SN",
    quote:
      "Sejak bergabung, produk saya semakin dikenal. Banyak pelanggan baru yang datang lewat katalog ini.",
  },
  {
    name: "Ahmad Rizki",
    role: "Pembeli",
    avatar: "AR",
    quote:
      "Gampang banget cari oleh-oleh khas Kemayoran. Tinggal klik langsung chat WA penjualnya.",
  },
  {
    name: "Dewi Lestari",
    role: "Pemilik Smart Shop RW 010",
    avatar: "DL",
    quote:
      "Platform ini sangat membantu UMKM kecil seperti saya buat promosi tanpa biaya.",
  },
];

/* Kartu testimoni tunggal, dipakai di marquee (mobile) & grid (desktop) */
function TestimonialCard({ item }) {
  return (
    <div className="bg-cream-pure rounded-2xl md:rounded-3xl p-5 md:p-7 border border-cream-warm h-full">
      <div className="flex items-center gap-3 mb-3 md:mb-4">
        <span className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-forest/10 text-forest flex items-center justify-center font-bold text-sm md:text-base">
          {item.avatar}
        </span>
        <div>
          <div className="text-sm md:text-base font-bold text-noir">
            {item.name}
          </div>
          <div className="text-xs md:text-sm text-warm-gray">{item.role}</div>
        </div>
      </div>
      <div className="flex gap-0.5 mb-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <Icon
            key={s}
            name="starFilled"
            size={12}
            className="text-yellow-500"
          />
        ))}
      </div>
      <p className="text-xs md:text-sm text-cool-gray leading-relaxed italic">
        &ldquo;{item.quote}&rdquo;
      </p>
    </div>
  );
}

export default async function HomePage() {
  const [productsData, sellersData, categories, banners] = await Promise.all([
    getProducts(),
    getSellers(),
    getCategories(),
    getBanners(),
  ]);

  const enriched = productsData.map((p) => ({
    ...p,
    sellerName: sellersData.find((s) => s.id === p.sellerId)?.name || "",
  }));
  // Maksimal 8 produk unggulan yang ditampilkan di beranda
  const featured = enriched.filter((p) => p.isFeatured).slice(0, 8);

  const stats = [
    { value: `${sellersData.length}+`, label: "Total UMKM Terverifikasi" },
    { value: `${productsData.length}+`, label: "Produk Tersedia" },
    { value: "28.700+", label: "Pengunjung Bulan Ini" },
    { value: "85+", label: "Mitra & Kolaborasi Aktif" },
  ];

  return (
    <>
      {/* ===== HERO + BANNER (video kiri, 2 banner statis kanan) ===== */}
      <section className="relative overflow-clip bg-gradient-to-b from-cream-pure via-cream-pure to-cream">
        <div aria-hidden="true" className="absolute -top-24 -right-24 w-72 h-72 md:w-96 md:h-96 rounded-full bg-forest/10 blur-3xl ambient-float" />
        <div aria-hidden="true" className="absolute -bottom-20 left-1/3 w-64 h-64 rounded-full bg-langit/20 blur-3xl ambient-float" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-7 sm:py-10 md:py-16 lg:py-20">
          <div
            className={`grid gap-3 sm:gap-4 md:gap-6 items-stretch ${
              banners?.length
                ? "grid-cols-1 md:grid-cols-[1fr_220px] lg:grid-cols-[1fr_400px]"
                : "grid-cols-1"
            }`}
          >
            {/* Card video (full-width 16/9 di mobile, kiri 16/10 di tablet/desktop) */}
            <div className="relative aspect-video md:aspect-[16/10] min-w-0 min-h-0 max-h-full rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_20px_45px_rgba(10,37,64,0.22)] ring-1 ring-forest/15 bg-hutan animate-[fadeInUp_0.7s_var(--ease-out-expo)_both]">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                poster="/image-header/1.webp"
              >
                <source src="/hero-video.mp4" type="video/mp4" />
              </video>
              {/* Gradasi bawah agar teks terbaca (video tetap tajam, tanpa frosted glass) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

              <div className="absolute inset-0 flex flex-col items-center justify-end text-center p-4 sm:p-6 md:p-8 lg:p-10 text-white">
                <p className="mb-2 inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm">Pasar digital UMKM lokal</p>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.05] tracking-tight drop-shadow-md">
                  Bangga Produk{" "}
                  <span className="text-white underline decoration-langit decoration-[3px] sm:decoration-4 underline-offset-4">
                    Lokal Kemayoran
                  </span>
                </h1>
                <p className="hidden sm:block mt-2 md:mt-3 text-sm md:text-base text-white/90 leading-relaxed max-w-xl">
                  Jelajahi aneka produk UMKM unggulan dari Kemayoran dan
                  sekitarnya. Dukung ekonomi lokal dengan belanja langsung dari
                  para pengrajin dan pelaku usaha terbaik.
                </p>
                <div className="mt-3 md:mt-5 flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
                  <Link
                    href="/catalog"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-forest text-white text-xs sm:text-sm font-bold hover:bg-forest-deep shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5"
                  >
                    Jelajahi Produk <Icon name="arrowRight" size={14} />
                  </Link>
                  <Link
                    href="/gabung"
                    className="hidden sm:inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/40 text-white text-xs sm:text-sm font-semibold hover:bg-white/25 transition-all"
                  >
                    Daftar Sebagai UMKM
                  </Link>
                </div>
              </div>
            </div>

            {/* Banner foto: carousel geser horizontal di mobile, rail atas-bawah di tablet/desktop */}
            {banners?.length > 0 && (
              <div
                className={`flex gap-3 sm:gap-4 md:gap-6 md:h-full min-h-0 min-w-0 overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch] ${
                  banners.length >= 2
                    ? "overflow-x-auto snap-x snap-mandatory scrollbar-none md:grid md:grid-cols-1 md:grid-rows-2"
                    : ""
                }`}
              >
                {banners.slice(0, 2).map((b) => {
                  const imgEl = (
                    <img
                      src={b.imageUrl}
                      alt={b.title || "Banner promosi"}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  );
                  return (
                    <div
                      key={b.id}
                      className="relative w-[82%] shrink-0 snap-center aspect-[2/1] overflow-hidden rounded-xl sm:rounded-[1.5rem] md:rounded-[2rem] shadow-lg ring-1 ring-forest/10 group md:w-full md:h-full md:aspect-auto"
                    >
                      {b.link ? (
                        <Link href={b.link} className="block absolute inset-0">
                          {imgEl}
                        </Link>
                      ) : (
                        imgEl
                      )}
                      {b.title && (
                        <span className="hidden sm:inline-flex absolute left-3 bottom-3 md:left-4 md:bottom-4 px-3 py-1.5 text-[11px] md:text-xs font-bold text-white glass rounded-full shadow-sm items-center gap-1.5">
                          <Icon name="info" size={12} /> {b.title}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ===== SEARCH BAR ===== */}
          <form
            action="/catalog"
            method="get"
            className="relative mt-8 md:mt-12 glass rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-xl hidden lg:grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 md:gap-4 items-center"
          >
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray pointer-events-none">
                <Icon name="search" size={18} />
              </span>
              <input
                name="search"
                type="text"
                placeholder="Cari produk atau UMKM..."
                className="w-full pl-11 pr-4 py-3 bg-white/70 border border-cream-warm rounded-full text-sm md:text-base text-noir-soft placeholder:text-warm-gray outline-none transition-all focus:bg-white focus:border-forest/40 focus:shadow-[0_0_0_4px_var(--color-glass-forest)]"
              />
            </div>
            <div className="relative">
              <Icon
                name="chevronDown"
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-gray pointer-events-none"
              />
              <select
                name="category"
                defaultValue=""
                className="w-full appearance-none pl-4 pr-10 py-3 bg-white/70 border border-cream-warm rounded-full text-sm md:text-base text-noir-soft outline-none transition-all focus:bg-white focus:border-forest/40 focus:shadow-[0_0_0_4px_var(--color-glass-forest)]"
              >
                <option value="">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 rounded-full bg-forest text-white text-sm md:text-base font-bold hover:bg-forest-deep shadow-card transition-all hover:shadow-card-hover"
            >
              <Icon name="search" size={16} /> Cari
            </button>
          </form>
        </div>
      </section>

      {/* ===== KATEGORI POPULER ===== */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-6 md:mb-10">
            <div>
              <span className="section-kicker">Mulai dari kebutuhanmu</span>
              <h2 className="mt-2 text-xl md:text-3xl lg:text-4xl font-bold tracking-tight">
                Kategori <span className="text-forest">Populer</span>
              </h2>
              <p className="text-xs md:text-sm text-warm-gray mt-1">
                Temukan produk favoritmu berdasarkan kategori
              </p>
            </div>
            <Link
              href="/catalog"
              className="hidden md:flex items-center gap-1 text-xs md:text-sm font-medium text-warm-gray hover:text-forest transition-all"
            >
              Lihat Semua <Icon name="arrowRight" size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
            {categories.map((cat, i) => {
              const count = productsData.filter(
                (p) => p.categoryId === cat.id,
              ).length;
              return (
                <Link
                  key={cat.id}
                  href={`/catalog?category=${cat.id}`}
                  className="group flex flex-col items-center gap-2.5 md:gap-3 text-center"
                >
                  <span className="relative flex items-center justify-center w-16 h-16 md:w-24 md:h-24 rounded-[22px] md:rounded-[28px] bg-[#FFF9EF] border border-cream-warm/80 shadow-[0_7px_18px_rgba(91,57,31,0.11)] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:rotate-2 group-hover:shadow-[0_14px_24px_rgba(91,57,31,0.18)]">
                    <span className="absolute inset-1.5 rounded-[17px] md:rounded-[22px] bg-gradient-to-br from-white to-[#F7E8D0] opacity-80" />
                    <CategoryVisualIcon
                      category={cat}
                      className="relative z-10 w-12 h-12 md:w-[4.5rem] md:h-[4.5rem] drop-shadow-[0_4px_2px_rgba(80,44,18,0.18)] transition-transform duration-300 group-hover:scale-110"
                      fallbackSize={30}
                    />
                  </span>
                  <span className="text-xs md:text-sm font-semibold text-noir-soft group-hover:text-forest transition-colors leading-tight">
                    {cat.name}
                  </span>
                  <span className="text-[10px] md:text-xs text-warm-gray -mt-1">
                    {count}+ Produk
                  </span>
                </Link>
              );
            })}
            <Link
              href="/catalog"
              className="group flex flex-col items-center justify-center gap-2 md:gap-3 text-center"
            >
              <span className="flex items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded-full border-2 border-dashed border-cream-warm text-warm-gray transition-all duration-300 group-hover:border-forest group-hover:text-forest">
                <Icon name="arrowRight" size={22} />
              </span>
              <span className="text-xs md:text-sm font-semibold text-warm-gray group-hover:text-forest">
                Semua
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== PRODUK UNGGULAN ===== */}
      <section className="py-10 md:py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-6 md:mb-10">
            <div>
              <h2 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight">
                UMKM <span className="text-forest">Unggulan</span>
              </h2>
              <p className="hidden md:block text-xs md:text-sm text-warm-gray mt-1">
                Produk pilihan dari para pelaku UMKM terbaik Kemayoran
              </p>
            </div>
            {/* Tautan ke katalog hanya di sm+; di mobile digantikan tombol
                "Lihat Semua" di bawah grid (lihat komponen FeaturedProducts) */}
            <Link
              href="/catalog"
              className="hidden sm:flex items-center gap-1 text-xs md:text-sm font-medium text-warm-gray hover:text-forest transition-all"
            >
              Lihat Semua <Icon name="arrowRight" size={12} />
            </Link>
          </div>
          {/* Di mobile: tampil 4 produk dulu, tombol "Lihat Semua" menampilkan
              sisa 4 produk (maksimal 8) dengan animasi. Di desktop: 8 sekaligus. */}
          <FeaturedProducts products={featured} categories={categories} />
        </div>
      </section>

      {/* ===== [OPSI 3a] MITRA AKADEMIS & PENGEMBANG EKOSISTEM ===== */}
      <section className="py-8 md:py-10 bg-cream-pure border-y border-cream-warm">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-center text-xs md:text-sm uppercase tracking-[0.2em] text-warm-gray font-semibold mb-6">
            Mitra Akademis &amp; Pengembang Ekosistem
          </h2>
          <PartnerLogos variant="section" />
        </div>
      </section>

      {/* ===== STATISTIK =====
          Section hijau dipersempit (tidak full-width): diberi margin
          horizontal + sudut membulat agar tampak seperti kartu. */}
      <section className="relative overflow-hidden bg-hutan rounded-[1.75rem] md:rounded-[2.5rem] mx-3 md:mx-5 lg:mx-8 py-11 md:py-16 shadow-[0_22px_46px_rgba(10,37,64,0.18)]">
        <div className="absolute inset-0 opacity-[0.04]" />
        {/* Konten dipersempit (max-w-4xl) dan jarak antar lingkaran dikurangi
            (gap-2 mobile, gap-6 md+) agar ke-4 lingkaran tampak lebih dekat */}
        <div className="relative max-w-4xl mx-auto px-4 md:px-6">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight text-center text-white mb-8 md:mb-12">
            UMKM Kemayoran <span className="text-langit">Dalam Angka</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6">
            {stats.map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center text-center bg-white/[0.07] border border-white/15 rounded-[1.5rem] md:rounded-[2rem] aspect-square w-full max-w-[132px] md:max-w-[190px] lg:max-w-none mx-auto p-2.5 md:p-5 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="text-xl md:text-4xl font-bold text-white leading-none">
                  {s.value}
                </div>
                <div className="mt-1.5 md:mt-3 text-[9px] md:text-sm text-white/70 leading-tight">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MENGAPA MEMILIH ===== */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight text-center mb-8 md:mb-12">
            Mengapa Memilih <span className="text-forest">Kami</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                icon: "star",
                title: "Produk Berkualitas",
                desc: "Setiap produk dipilih dan diverifikasi dari UMKM nyata",
              },
              {
                icon: "store",
                title: "UMKM Terverifikasi",
                desc: "Semua pelaku usaha sudah melalui proses pendataan",
              },
              {
                icon: "whatsapp",
                title: "Pesan Langsung",
                desc: "Transaksi langsung via WhatsApp tanpa perantara",
              },
              {
                icon: "heart",
                title: "Mendukung Ekonomi Lokal",
                desc: "Setiap pembelian membantu perekonomian warga",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-cream-pure rounded-2xl md:rounded-3xl p-5 md:p-7 text-center border border-cream-warm hover:border-forest/30 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <span className="inline-flex items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-2xl bg-forest/10 text-forest mb-3 md:mb-4">
                  <Icon name={item.icon} size={22} />
                </span>
                <h3 className="text-sm md:text-base font-bold text-noir mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs md:text-sm text-warm-gray leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== EVENT & KEGIATAN ===== */}
      <section className="py-10 md:py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-6 md:mb-10">
            <div>
              <h2 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight">
                Event &amp;{" "}
                <span className="text-forest">Kegiatan Terbaru</span>
              </h2>
              <p className="hidden md:block text-xs md:text-sm text-warm-gray mt-1">
                Ikuti acara dan program pendampingan UMKM Kemayoran
              </p>
            </div>
            <Link
              href="/artikel"
              className="flex items-center gap-1 text-xs md:text-sm font-medium text-warm-gray hover:text-forest transition-all"
            >
              Lihat Semua <Icon name="arrowRight" size={12} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {events.map((e, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-cream-warm hover:border-forest/30 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="flex">
                  <div className="flex flex-col items-center justify-center w-20 md:w-24 shrink-0 bg-forest text-white p-4 text-center">
                    <span className="text-2xl md:text-3xl font-bold leading-none">
                      {e.day}
                    </span>
                    <span className="text-[10px] md:text-xs font-semibold tracking-widest mt-1">
                      {e.month}
                    </span>
                  </div>
                  <div className="p-4 md:p-5 flex flex-col gap-1.5">
                    <h3 className="text-sm md:text-base font-bold text-noir leading-snug group-hover:text-forest transition-colors">
                      {e.title}
                    </h3>
                    <p className="text-xs md:text-sm text-warm-gray leading-relaxed">
                      {e.desc}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-cool-gray mt-auto pt-1">
                      <Icon name="mapPin" size={12} /> {e.place}
                      <span className="mx-1">·</span>
                      <Icon name="calendar" size={12} /> {e.time}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONI ===== */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight text-center mb-8 md:mb-12">
            Apa Kata <span className="text-forest">Mereka</span>
          </h2>
          {/* MARQUEE — hanya tampil di mobile (<640px).
              Kartu digandakan 2x agar animasi loop mulus, bergerak dari
              KIRI ke KANAN dengan kecepatan lambat (45s/putaran) supaya
              mudah dibaca. Kecepatan diatur di .marquee-ltr (globals.css). */}
          <div className="overflow-hidden -mx-4 sm:hidden">
            <div className="flex w-max gap-4 px-4 py-1 marquee-ltr">
              {[...testimonials, ...testimonials].map((item, i) => (
                <div key={i} className="w-[78vw] shrink-0">
                  <TestimonialCard item={item} />
                </div>
              ))}
            </div>
          </div>

          {/* GRID — tampil di tablet ke atas (sm+) */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {testimonials.map((item, i) => (
              <TestimonialCard key={i} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== PETA LOKASI ===== */}
      <section
        id="peta"
        className="py-10 md:py-16 bg-gradient-to-b from-cream-pure to-langit/5"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight text-center mb-2 md:mb-3">
            Peta <span className="text-forest">Lokasi UMKM</span>
          </h2>
          <p className="text-xs md:text-sm text-warm-gray text-center mb-8 md:mb-12 max-w-md mx-auto">
            Semua toko UMKM Kemayoran terpasang di peta. Klik pin untuk melihat
            nama toko, lalu kunjungi detailnya.
          </p>
          <div className="rounded-2xl md:rounded-3xl overflow-hidden border border-cream-warm shadow-lg h-[300px] md:h-[450px]">
            <MultiPinMap
              center={[-6.4, 106.93]}
              zoom={12}
              markers={sellersData
                .filter((s) => s.location)
                .map((s) => ({
                  lat: s.location.lat,
                  lng: s.location.lng,
                  name: s.name,
                }))}
            />
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="rounded-[1.75rem] md:rounded-[2.5rem] overflow-hidden bg-hutan relative px-6 md:px-14 py-10 md:py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_18px_42px_rgba(10,37,64,0.16)]">
            <div className="relative z-10">
              <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                Punya Usaha di Kemayoran?
                <br />
                <span className="text-forest-bright">Bergabung Sekarang!</span>
              </h2>
              <p className="text-xs md:text-sm text-white/70 mt-2 max-w-lg">
                Gratis, mudah, dan bantu usahamu lebih dikenal warga serta
                wisatawan. Daftar sebagai UMKM di katalog digital Kemayoran.
              </p>
            </div>
            <Link
              href="/gabung"
              className="relative z-10 inline-flex items-center gap-2 px-6 md:px-8 py-3.5 rounded-full bg-forest text-white text-sm md:text-base font-bold hover:bg-forest-deep shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5 shrink-0"
            >
              Daftar Sekarang <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
