import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import Icon from "@/components/common/Icon";
import HeroCarousel from "@/components/common/HeroCarousel";
import MultiPinMap from "@/components/common/MultiPinMap";
import { getProducts, getSellers, getCategories } from "@/lib/catalog";

const catColors = [
  "bg-clay/15 text-clay-deep",
  "bg-forest/15 text-forest",
  "bg-langit/15 text-laut",
  "bg-amber-400/25 text-amber-600",
  "bg-sky-500/15 text-sky-600",
  "bg-rose-500/15 text-rose-500",
  "bg-violet-500/15 text-violet-600",
  "bg-emerald-500/15 text-emerald-600",
];

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

export default async function HomePage() {
  const [productsData, sellersData, categories] = await Promise.all([
    getProducts(),
    getSellers(),
    getCategories(),
  ]);

  const enriched = productsData.map((p) => ({
    ...p,
    sellerName: sellersData.find((s) => s.id === p.sellerId)?.name || "",
  }));
  const featured = enriched.filter((p) => p.isFeatured);

  const stats = [
    { value: `${sellersData.length}+`, label: "Total UMKM Terverifikasi" },
    { value: `${productsData.length}+`, label: "Produk Tersedia" },
    { value: "28.700+", label: "Pengunjung Bulan Ini" },
    { value: "85+", label: "Mitra & Kolaborasi Aktif" },
  ];

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative py-12 md:py-24 bg-gradient-to-b from-cream-pure to-cream overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 md:w-96 md:h-96 rounded-full bg-forest/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-clay/5 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="flex flex-col gap-4 md:gap-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 w-fit bg-forest/10 text-forest font-mono text-[10px] md:text-xs uppercase tracking-wider rounded-full font-semibold">
                <Icon name="store" size={12} /> Dari Kemayoran, Untuk Indonesia
              </span>
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-noir">
                Bangga Produk{" "}
                <span className="text-forest">Lokal Kemayoran</span>
              </h1>
              <p className="text-sm md:text-lg text-warm-gray leading-relaxed max-w-lg">
                Jelajahi aneka produk UMKM unggulan dari Kemayoran dan
                sekitarnya. Dukung ekonomi lokal dengan belanja langsung dari
                para pengrajin dan pelaku usaha terbaik.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-1 md:mt-2">
                <Link
                  href="/catalog"
                  className="btn-primary text-sm md:text-base py-3"
                >
                  Jelajahi Produk <Icon name="arrowRight" size={15} />
                </Link>
                <Link
                  href="/gabung"
                  className="btn-secondary text-sm md:text-base py-3 text-center"
                >
                  Daftar Sebagai UMKM
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-3 md:-inset-4 rounded-[2rem] bg-gradient-to-br from-forest/10 via-transparent to-clay/10" />
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-forest/10">
                <HeroCarousel />
              </div>
            </div>
          </div>

          {/* ===== SEARCH BAR ===== */}
          <form
            action="/catalog"
            method="get"
            className="relative mt-10 md:mt-14 glass rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-xl grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 md:gap-4 items-center"
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
      <section className="py-10 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-6 md:mb-10">
            <div>
              <h2 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight">
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
                  <span
                    className={`flex items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded-full transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg ${catColors[i % catColors.length]}`}
                  >
                    <Icon name={cat.icon} size={24} className="md:w-8 md:h-8" />
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
            <Link
              href="/catalog"
              className="flex items-center gap-1 text-xs md:text-sm font-medium text-warm-gray hover:text-forest transition-all"
            >
              Lihat Semua <Icon name="arrowRight" size={12} />
            </Link>
          </div>
          <ProductGrid products={featured} categories={categories} />
        </div>
      </section>

      {/* ===== STATISTIK ===== */}
      <section className="py-12 md:py-20 bg-hutan relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight text-center text-white mb-8 md:mb-14">
            UMKM Kemayoran <span className="text-emerald">Dalam Angka</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
            {stats.map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center text-center bg-white/5 border border-white/10 rounded-full aspect-square p-4 md:p-6"
              >
                <div className="text-3xl md:text-5xl font-bold text-white leading-none">
                  {s.value}
                </div>
                <div className="mt-2 md:mt-3 text-[10px] md:text-sm text-white/70 leading-tight">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MENGAPA MEMILIH ===== */}
      <section className="py-10 md:py-16 bg-white">
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
      <section className="py-10 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight text-center mb-8 md:mb-12">
            Apa Kata <span className="text-forest">Mereka</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
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
            ].map((item, i) => (
              <div
                key={i}
                className="bg-cream-pure rounded-2xl md:rounded-3xl p-5 md:p-7 border border-cream-warm"
              >
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <span className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-forest/10 text-forest flex items-center justify-center font-bold text-sm md:text-base">
                    {item.avatar}
                  </span>
                  <div>
                    <div className="text-sm md:text-base font-bold text-noir">
                      {item.name}
                    </div>
                    <div className="text-xs md:text-sm text-warm-gray">
                      {item.role}
                    </div>
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
      <section className="py-10 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="rounded-2xl md:rounded-3xl overflow-hidden bg-hutan relative px-6 md:px-14 py-10 md:py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
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
              className="relative z-10 inline-flex items-center gap-2 px-6 md:px-8 py-3.5 rounded-full bg-clay text-white text-sm md:text-base font-bold hover:bg-clay-deep shadow-card transition-all hover:shadow-card-hover shrink-0"
            >
              Daftar Sekarang <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
