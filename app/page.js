import Link from "next/link";
import FeaturedProducts from "@/components/product/FeaturedProducts";
import Icon from "@/components/common/Icon";
import EmptyState from "@/components/common/EmptyState";
import CategoryVisualIcon from "@/components/category/CategoryVisualIcon";
import HeroPromoGrid from "@/components/home/HeroPromoGrid";
import HeroShowcaseVideo from "@/components/home/HeroShowcaseVideo";
import ScrollRevealObserver from "@/components/home/ScrollRevealObserver";

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
      <ScrollRevealObserver />
      {/* ===== HERO: catalog discovery hub ===== */}
      <section className="home-hero border-y border-hutan/10">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:py-9 md:px-6 md:py-11 lg:py-14">
          <div className="grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:grid-rows-[1fr_auto] lg:items-stretch xl:gap-x-12">
            <div className="flex min-w-0 flex-col justify-end lg:col-start-1 lg:row-start-1">
              <p className="section-kicker text-[0.75rem] sm:text-[0.8rem]">UMKM Kemayoran</p>
              <h1 className="mt-4 max-w-[12ch] text-[clamp(2.4rem,10vw,3.15rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-hutan lg:text-[clamp(3.5rem,5vw,4.5rem)]">
                Bangga Produk{" "}
                <span className="ink-outline text-[#1D6E4D] decoration-langit">
                  Lokal Kemayoran
                </span>
                .
              </h1>
              <p className="mt-5 max-w-[36rem] text-base leading-relaxed text-cool-gray lg:max-w-[31rem]">
                Jelajahi aneka produk UMKM unggulan dari Kemayoran dan sekitarnya. Dukung ekonomi lokal dengan belanja langsung dari para pengrajin dan pelaku usaha terbaik.
              </p>
              <div className="mt-6 grid gap-3 min-[390px]:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:max-w-[26rem]">
                <Link
                  href="/catalog"
                  className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(31,107,69,0.2)] transition-[background-color,box-shadow] duration-200 hover:bg-forest-deep hover:shadow-[0_10px_24px_rgba(31,107,69,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
                >
                  Jelajahi Katalog
                  <Icon name="arrowRight" size={14} className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-hutan/20 bg-white px-5 py-3 text-sm font-bold text-hutan transition-[border-color,background-color] duration-200 hover:border-forest/40 hover:bg-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
                >
                  Tentang Kami
                </Link>
              </div>
            </div>

            <div className="aspect-[4/3] min-w-0 min-[480px]:aspect-[16/10] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:aspect-auto lg:min-h-[31rem]">
              <HeroShowcaseVideo />
            </div>

            <div className="grid grid-cols-3 border-y border-hutan/15 py-4 lg:col-start-1 lg:row-start-2 lg:self-end">
              {[
                { icon: "badgeCheck", label: "Produk berkualitas" },
                { icon: "heart", label: "Dukung UMKM lokal" },
                { icon: "lock", label: "Aman & terpercaya" },
              ].map((benefit, index) => (
                <div
                  key={benefit.label}
                  className={`flex min-w-0 flex-col items-center gap-2 px-2 text-center sm:flex-row sm:justify-center sm:text-left lg:flex-col lg:text-center xl:flex-row xl:text-left ${
                    index > 0 ? "border-l border-hutan/15" : ""
                  }`}
                >
                  <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-lg bg-forest/10 text-forest">
                    <Icon name={benefit.icon} size={14} />
                  </span>
                  <span className="text-[0.78rem] font-semibold leading-tight text-hutan sm:text-sm">
                    {benefit.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ===== SEARCH BAR ===== */}
          <form
            action="/catalog"
            method="get"
            className="market-search relative mt-6 hidden grid-cols-[1fr_auto_auto] items-center gap-3 rounded-2xl p-3 lg:grid"
          >
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-gray pointer-events-none">
                <Icon name="search" size={18} />
              </span>
              <input
                name="search"
                type="text"
                placeholder="Cari produk atau UMKM..."
                className="w-full rounded-xl border border-cream-warm bg-white/70 py-3 pl-11 pr-4 text-sm text-noir-soft outline-none transition-all placeholder:text-warm-gray focus:border-forest/40 focus:bg-white focus:shadow-[0_0_0_4px_var(--color-glass-forest)]"
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
                className="w-full appearance-none rounded-xl border border-cream-warm bg-white/70 py-3 pl-4 pr-10 text-sm text-noir-soft outline-none transition-all focus:border-forest/40 focus:bg-white focus:shadow-[0_0_0_4px_var(--color-glass-forest)]"
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
              className="flex items-center justify-center gap-2 rounded-xl bg-laut px-7 py-3 text-sm font-bold text-white shadow-card transition-all hover:bg-laut-deep hover:shadow-card-hover"
            >
              <Icon name="search" size={16} /> Cari
            </button>
          </form>

          <HeroPromoGrid banners={banners} />
        </div>
      </section>

      {/* ===== KATEGORI POPULER ===== */}
      <section className="market-frame py-12 md:py-20 bg-white">
        <img src="/images/decor/market-leafy-sprig.png" alt="" aria-hidden="true" className="decor-asset -right-5 -top-6 hidden w-56 rotate-[8deg] opacity-25 lg:block" />
        <img src="/images/decor/market-flower-divider.png" alt="" aria-hidden="true" className="decor-asset -left-10 bottom-3 hidden w-64 opacity-55 lg:block" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 scroll-reveal">
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
                  <span className="relative flex h-20 w-20 items-center justify-center transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-2 md:h-28 md:w-28">
                    <CategoryVisualIcon
                      category={cat}
                      className="h-20 w-20 object-contain drop-shadow-[0_4px_2px_rgba(10,37,64,0.16)] transition-transform duration-300 group-hover:scale-[1.07] md:h-28 md:w-28"
                      fallbackSize={34}
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
        <div className="max-w-7xl mx-auto px-4 md:px-6 scroll-reveal">
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
          {featured.length > 0 ? (
            <FeaturedProducts products={featured} categories={categories} />
          ) : (
            <EmptyState
              title="Belum ada produk unggulan"
              description="Produk yang ditambahkan oleh UMKM akan tampil di sini setelah tersedia di database."
            />
          )}
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
      <section className="market-frame relative overflow-hidden bg-hutan rounded-[1.75rem] md:rounded-[2.5rem] mx-3 md:mx-5 lg:mx-8 py-11 md:py-16 shadow-[0_22px_46px_rgba(10,37,64,0.18)]">
        <img src="/images/decor/market-sparkles.svg" alt="" aria-hidden="true" className="decor-asset decor-sparkles right-[5%] bottom-[10%] opacity-30" />
        <div className="absolute inset-0 opacity-[0.04]" />
        {/* Konten dipersempit (max-w-4xl) dan jarak antar lingkaran dikurangi
            (gap-2 mobile, gap-6 md+) agar ke-4 lingkaran tampak lebih dekat */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 scroll-reveal scroll-reveal--slow">
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
        <div className="max-w-7xl mx-auto px-4 md:px-6 scroll-reveal">
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
        <div className="max-w-7xl mx-auto px-4 md:px-6 scroll-reveal">
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
        <div className="max-w-7xl mx-auto px-4 md:px-6 scroll-reveal">
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
        <div className="max-w-7xl mx-auto px-4 md:px-6 scroll-reveal scroll-reveal--slow">
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
        <div className="max-w-7xl mx-auto px-4 md:px-6 scroll-reveal">
          <div className="market-frame relative flex flex-col items-start justify-between gap-7 overflow-hidden rounded-[1.75rem] bg-hutan px-6 py-9 shadow-[0_18px_42px_rgba(10,37,64,0.16)] md:flex-row md:items-center md:gap-6 md:rounded-[2.5rem] md:px-14 md:py-14">
            <img src="/images/decor/market-gift-basket.png" alt="" aria-hidden="true" className="decor-asset right-[-4rem] -bottom-24 hidden w-64 rotate-[5deg] opacity-35 md:block md:w-80" />
            <img src="/images/decor/market-flower-wave.png" alt="" aria-hidden="true" className="decor-asset right-[27%] top-5 hidden w-52 opacity-35 md:block" />
            <div className="relative z-10 max-w-lg">
              <span className="mb-3 inline-flex border-l-2 border-forest-bright pl-2 text-[10px] font-bold uppercase tracking-[0.14em] text-forest-bright">Untuk pelaku usaha</span>
              <h2 className="max-w-[16rem] text-[1.65rem] font-bold leading-[1.12] tracking-tight text-white sm:max-w-none md:text-3xl lg:text-4xl">
                Punya Usaha di Kemayoran?
                <br />
                <span className="text-forest-bright">Bergabung Sekarang!</span>
              </h2>
              <p className="mt-3 max-w-[29rem] text-sm leading-5 text-white/75 md:text-sm md:leading-relaxed">
                Gratis, mudah, dan bantu usahamu lebih dikenal warga serta wisatawan. Daftar sebagai UMKM di katalog digital Kemayoran.
              </p>
            </div>
            <Link
              href="/gabung"
              className="relative z-10 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-laut px-6 py-3.5 text-sm font-bold text-white shadow-card transition-all hover:-translate-y-0.5 hover:bg-laut-deep hover:shadow-card-hover sm:w-auto md:px-8 md:text-base"
            >
              Daftar Sekarang <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
