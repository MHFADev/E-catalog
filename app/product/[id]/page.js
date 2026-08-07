import { notFound } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/common/Icon";
import ProductGallery from "@/components/product/ProductGallery";
import ProductGrid from "@/components/product/ProductGrid";
import ReviewSection from "@/components/product/ReviewSection";
import { generateWhatsAppLink } from "@/lib/generateWhatsAppLink";
import { WHATSAPP_PREFILL } from "@/lib/constants";
import {
  getProducts,
  getSellers,
  getCategories,
  getReviews,
} from "@/lib/catalog";

// ===== Harga produk: data pakai format campuran, rapikan di sini =====
// - priceUnit sudah "Rp..." / "Harga..." / "Hubungi..." -> pakai apa adanya
// - priceUnit cuma satuan ("/ ikat", "per porsi") -> gabung dengan price
function priceLabel(product) {
  return /^(Rp|Harga|Hubungi)/.test(product.priceUnit)
    ? product.priceUnit
    : `Rp${product.price.toLocaleString("id-ID")} ${product.priceUnit}`;
}

// ===== Rata-rata rating dari daftar komentar =====
function avgRating(list) {
  return list.length
    ? list.reduce((s, r) => s + r.rating, 0) / list.length
    : 0;
}

// ===== Ubah link YouTube biasa -> URL embed =====
function embedUrl(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const [products, sellers, categories, reviews] = await Promise.all([
    getProducts(),
    getSellers(),
    getCategories(),
    getReviews(id),
  ]);
  const product = products.find((p) => p.id === id);
  const seller = product
    ? sellers.find((s) => s.id === product.sellerId)
    : null;
  const category = product
    ? categories.find((c) => c.id === product.categoryId)
    : null;

  if (!product) notFound();

  // Link WA utama + alternatif (kalau penjual punya nomor kedua)
  const waLink = generateWhatsAppLink(
    seller.whatsapp,
    WHATSAPP_PREFILL(seller.name, product.name),
  );
  const waLinkAlt = seller.whatsappAlt
    ? generateWhatsAppLink(
        seller.whatsappAlt,
        WHATSAPP_PREFILL(seller.name, product.name),
      )
    : null;

  const showPrice = product.showPrice !== false && product.price != null;
  const price = showPrice ? priceLabel(product) : "Hubungi penjual untuk harga";

  // ===== Komentar produk ini =====
  const productReviews = reviews.filter((r) => r.productId === product.id);
  const rating = avgRating(productReviews);

  // ===== Statistik toko: jumlah produk + rating rata-rata semua produk toko =====
  const sellerProducts = products.filter((p) => p.sellerId === seller.id);
  const sellerRating = avgRating(
    reviews.filter((r) =>
      sellerProducts.some((p) => p.id === r.productId),
    ),
  );

  // ===== Produk serupa: kategori sama dulu, sisanya isi produk unggulan =====
  const sameCat = products.filter(
    (p) => p.categoryId === product.categoryId && p.id !== product.id,
  );
  let related = sameCat.slice(0, 4);
  if (related.length < 4) {
    const others = products
      .filter((p) => !sameCat.includes(p) && p.id !== product.id)
      .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    related = [...related, ...others].slice(0, 4);
  }
  const relatedEnriched = related.map((p) => ({
    ...p,
    sellerName: sellers.find((s) => s.id === p.sellerId)?.name || "",
  }));

  return (
    <div className="bg-cream min-h-screen pb-24 md:pb-0">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-8">
        {/* ===== Breadcrumb: Beranda / Katalog / Kategori ===== */}
        <nav className="flex items-center gap-1.5 text-xs md:text-sm text-warm-gray mb-4 md:mb-6 whitespace-nowrap overflow-x-auto">
          <Link href="/" className="hover:text-forest transition-colors shrink-0">
            Beranda
          </Link>
          <span className="shrink-0">/</span>
          <Link
            href="/catalog"
            className="hover:text-forest transition-colors shrink-0"
          >
            Katalog
          </Link>
          {category && (
            <>
              <span className="shrink-0">/</span>
              <span className="text-noir-soft truncate">{category.name}</span>
            </>
          )}
        </nav>

        {/* ===== Layout utama: galeri kiri, info kanan ===== */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-8 items-start">
          {/* Galeri foto — lengket saat scroll di desktop */}
          <div className="md:sticky md:top-24 self-start">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          <div className="flex flex-col gap-4 md:gap-5">
            {/* ===== Kartu info produk ===== */}
            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-7 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-2 md:mb-3">
                <span className="font-mono text-[10px] md:text-xs uppercase tracking-wider text-forest pt-1">
                  {category?.name}
                </span>
                <div className="flex gap-1.5 shrink-0">
                  <span className="w-[42px] h-[42px] md:w-[49px] md:h-[49px] rounded-md overflow-hidden bg-cream-warm flex items-center justify-center">
                    <img
                      src="/assets/badges/halal.png"
                      alt="Halal"
                      className="w-full h-full object-contain"
                    />
                  </span>
                  <span className="w-[42px] h-[42px] md:w-[49px] md:h-[49px] rounded-md overflow-hidden bg-cream-warm flex items-center justify-center">
                    <img
                      src="/assets/badges/cinta-indonesia.png"
                      alt="Cinta Indonesia"
                      className="w-full h-full object-contain"
                    />
                  </span>
                </div>
              </div>

              <h1 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight text-noir mb-2 md:mb-3">
                {product.name}
              </h1>

              {/* Harga besar ala marketplace */}
              <div className={`font-bold mb-1.5 ${showPrice ? "text-2xl md:text-3xl lg:text-4xl text-forest" : "text-base md:text-lg text-warm-gray"}`}>
                {price}
              </div>
              <div className="flex items-center gap-1.5 text-xs md:text-sm text-warm-gray mb-3 md:mb-4">
                <Icon
                  name="whatsapp"
                  size={14}
                  className="text-forest shrink-0"
                />
                Hubungi penjual untuk informasi harga &amp; pembayaran
              </div>

              {/* Rating + lokasi toko */}
              {productReviews.length > 0 && (
                <div className="flex items-center gap-3 text-xs md:text-sm text-warm-gray mb-3 md:mb-4">
                  <span className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Icon name="starFilled" size={12} /> {rating.toFixed(1)}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-muted shrink-0" />
                  <span>{productReviews.length} komentar</span>
                  <span className="w-1 h-1 rounded-full bg-muted shrink-0" />
                  <span className="flex items-center gap-1 truncate">
                    <Icon name="mapPin" size={14} className="shrink-0" />
                    <span className="truncate">{seller.address}</span>
                  </span>
                </div>
              )}

              {/* Trust chips - penguat jaminan pembeli */}
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {[
                  { icon: "lock", label: "Transaksi Aman" },
                  { icon: "star", label: "Kualitas Lokal" },
                  { icon: "refresh", label: "Stok Terbaru" },
                ].map((c) => (
                  <span
                    key={c.label}
                    className="inline-flex items-center gap-1 px-2 py-1 md:px-2.5 md:py-1.5 bg-cream-pure border border-cream-warm rounded-full text-[9px] md:text-xs font-medium text-cool-gray"
                  >
                    <Icon name={c.icon} size={11} className="text-forest" />
                    {c.label}
                  </span>
                ))}
              </div>
            </div>

            {/* ===== Kartu deskripsi + tags ===== */}
            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-7 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm md:text-base font-bold text-noir mb-2 md:mb-3">
                <span className="w-0.5 h-4 bg-forest rounded-sm" />
                Deskripsi Produk
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-cool-gray mb-3 md:mb-4">
                {product.description}
              </p>
              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[10px] md:text-xs px-2 md:px-2.5 py-1 bg-forest/10 text-forest rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ===== Kartu toko + statistik penjual ===== */}
            <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm">
              {seller.isBlocked && (
                <div className="flex items-center gap-2 bg-amber-100 text-amber-800 border border-amber-300 rounded-xl px-3 py-2.5 mb-4">
                  <Icon name="ban" size={16} className="shrink-0" />
                  <span className="text-xs md:text-sm font-semibold">
                    Akun {seller.name} telah diblokir
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden bg-cream-warm flex items-center justify-center shrink-0">
                  {seller.logo ? (
                    <img
                      src={seller.logo}
                      alt={seller.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon name="store" size={20} className="text-forest" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm md:text-base text-noir truncate">
                    {seller.name}
                  </div>
                  {seller.owner && (
                    <div className="text-xs md:text-sm text-warm-gray truncate">
                      Pemilik: {seller.owner}
                    </div>
                  )}
                  <div className="text-xs md:text-sm text-warm-gray line-clamp-2">
                    {seller.address}
                  </div>
                </div>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full border border-forest/30 text-forest text-xs md:text-sm font-semibold hover:bg-forest/5 transition-all no-underline"
                >
                  <Icon name="whatsapp" size={14} /> Chat
                </a>
              </div>

              {/* Statistik toko: jumlah produk + rating */}
              <div className="grid grid-cols-2 gap-2 mt-3 border-t border-cream-warm pt-3">
                <div className="flex items-center gap-2 text-xs md:text-sm text-cool-gray">
                  <Icon name="grid" size={14} className="text-forest" />
                  <span>{sellerProducts.length} produk</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-cool-gray">
                  <Icon name="starFilled" size={14} className="text-forest" />
                  <span>{sellerRating ? `${sellerRating.toFixed(1)} rating toko` : "UMKM Lokal"}</span>
                </div>
              </div>

              {seller.description && (
                <p className="text-xs md:text-sm text-cool-gray leading-relaxed mt-3 border-t border-cream-warm pt-3">
                  {seller.description}
                </p>
              )}

              {seller.videoUrl && (
                <div className="mt-3 border-t border-cream-warm pt-3">
                  <div className="aspect-video rounded-xl overflow-hidden bg-cream-warm">
                    <iframe
                      src={embedUrl(seller.videoUrl)}
                      title={`Video ${seller.name}`}
                      className="w-full h-full"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ===== CTA WhatsApp (desktop) ===== */}
            <div className="hidden md:flex flex-col gap-2.5">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline"
              >
                <button className="btn-wa w-full text-sm md:text-base py-3 md:py-3.5">
                  <Icon name="whatsapp" size={18} />
                  Hubungi Penjual via WhatsApp
                </button>
              </a>
              {waLinkAlt && (
                <a
                  href={waLinkAlt}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline"
                >
                  <button className="btn-secondary w-full text-sm md:text-base py-3 md:py-3.5">
                    <Icon name="phone" size={16} />
                    Kontak Alternatif
                  </button>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ===== Komentar & penilaian (full width) ===== */}
        <div className="mt-8 md:mt-12">
          <ReviewSection initial={productReviews} productId={product.id} />
        </div>

        {/* ===== Produk serupa ===== */}
        {relatedEnriched.length > 0 && (
          <div className="mt-8 md:mt-12">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="flex items-center gap-2 text-base md:text-xl font-bold tracking-tight text-noir">
                <span className="w-1 h-5 md:w-1 md:h-6 bg-forest rounded-sm" />
                Produk Serupa
              </h2>
              <Link
                href="/catalog"
                className="flex items-center gap-1 text-xs md:text-sm font-medium text-warm-gray hover:text-forest transition-all"
              >
                Lihat Semua <Icon name="arrowRight" size={12} />
              </Link>
            </div>
            <ProductGrid
              products={relatedEnriched}
              categories={categories}
            />
          </div>
        )}
      </div>

      {/* ===== Sticky bar bawah (mobile): harga + tombol WA ===== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-cream-warm px-4 py-3 flex items-center gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-wider text-warm-gray mb-0.5">
            Harga
          </div>
          <div className="text-sm md:text-base font-bold text-forest truncate">
            {price}
          </div>
        </div>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline flex-1 shrink-0"
        >
          <button className="btn-wa w-full text-sm py-3">
            <Icon name="whatsapp" size={16} />
            Hubungi Penjual
          </button>
        </a>
      </div>
    </div>
  );
}
