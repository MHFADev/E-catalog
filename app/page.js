"use client";
import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import Icon from "@/components/common/Icon";
import ImageSlider from "@/components/common/ImageSlider";
import productsData from "@/data/products.json";
import sellersData from "@/data/sellers.json";
import categories from "@/data/categories.json";

const galleryItems = [
  {
    src: "/images/camilan-ciangsana.jpeg",
    title: "Kuliner Khas",
    desc: "Aneka camilan tradisional UMKM Ciangsana",
  },
  {
    src: "/images/galeri-umkm-etam.jpg",
    title: "Kerajinan Tangan",
    desc: "Produk handmade kreatif IKM Cileungsi",
  },
  {
    src: "/images/umkm-lancar-barokah.jpg",
    title: "Kerupuk Premium",
    desc: "Kerupuk rambak kulit sapi asli Ciangsana",
  },
  {
    src: "/images/foodcourt-nusadaya-1.jpg",
    title: "Foodcourt UMKM",
    desc: "Pusat kuliner binaan Dompet Dhuafa",
  },
  {
    src: "/images/jajanan-jatisari.jpeg",
    title: "Jajanan Lokal",
    desc: "Aneka jajanan khas Jatisari & Ciangsana",
  },
];

export default function HomePage() {
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
            <div className="relative order-first md:order-last">
              <ImageSlider
                images={["/images/foodcourt-nusadaya-1.jpg", "/images/camilan-ciangsana.jpeg", "/images/umkm-lancar-barokah.jpg"]}
                className="rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl aspect-[4/3]"
              />
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

      <section className="py-10 md:py-16 bg-cotton">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight text-center mb-8 md:mb-12">
            Mengapa Pilih <span className="text-cherry">Kami</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: "store", title: "Produk Lokal Asli", desc: "Setiap produk berasal dari UMKM nyata di sekitar Ciangsana" },
              { icon: "whatsapp", title: "Pesan Langsung", desc: "Hubungi penjual via WhatsApp tanpa perantara" },
              { icon: "heart", title: "Dukung UMKM", desc: "Setiap pembelian membantu ekonomi warga lokal" },
              { icon: "refresh", title: "Terus Bertambah", desc: "Katalog produk selalu diperbarui secara berkala" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-7 text-center border border-cotton-warm hover:border-cherry/20 hover:shadow-lg transition-all">
                <span className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-cherry/10 text-cherry mb-3 md:mb-4">
                  <Icon name={item.icon} size={20} />
                </span>
                <h3 className="text-sm md:text-base font-bold text-noir mb-1">{item.title}</h3>
                <p className="text-xs md:text-sm text-warm-gray leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight text-center mb-8 md:mb-12">
            Kata <span className="text-cherry">Mereka</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
              { name: "Siti Nurhaliza", role: "Pemilik Aneka Cemilan 39", avatar: "SN", quote: "Sejak bergabung, produk saya semakin dikenal. Banyak pelanggan baru yang datang lewat katalog ini." },
              { name: "Ahmad Rizki", role: "Pembeli", avatar: "AR", quote: "Gampang banget cari oleh-oleh khas Ciangsana. Tinggal klik langsung chat WA penjualnya." },
              { name: "Dewi Lestari", role: "Pemilik Smart Shop RW 010", avatar: "DL", quote: "Platform ini sangat membantu UMKM kecil seperti saya buat promosi tanpa biaya." },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-7 border border-cotton-warm">
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <span className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-cherry/10 text-cherry flex items-center justify-center font-bold text-sm md:text-base">{item.avatar}</span>
                  <div>
                    <div className="text-sm md:text-base font-bold text-noir">{item.name}</div>
                    <div className="text-xs md:text-sm text-warm-gray">{item.role}</div>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[1,2,3,4,5].map(s => <span key={s} className="text-yellow-500 text-xs md:text-sm">★</span>)}
                </div>
                <p className="text-xs md:text-sm text-cool-gray leading-relaxed italic">&ldquo;{item.quote}&rdquo;</p>
              </div>
            ))}
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
