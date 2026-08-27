import { notFound } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/common/Icon";
import ProductGallery from "@/components/product/ProductGallery";
import ProductGrid from "@/components/product/ProductGrid";
import ReviewSection from "@/components/product/ReviewSection";
import PaymentMethods from "@/components/product/PaymentMethods";
import ProductShare from "@/components/product/ProductShare";
import { generateWhatsAppLink } from "@/lib/generateWhatsAppLink";
import { WHATSAPP_PREFILL } from "@/lib/constants";
import { getSellerPaymentMethods } from "@/lib/paymentMethods";
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

export async function generateMetadata({ params }) {
  const { id } = await params;
  const products = await getProducts();
  const product = products.find((item) => item.id === id);

  if (!product) {
    return {
      title: "Produk tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const description = product.description
    ? product.description.slice(0, 155)
    : `Temukan ${product.name} dari UMKM Kemayoran dan hubungi toko langsung untuk informasi pemesanan.`;
  const configuredOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "https://e-catalog-gamma.vercel.app";
  const siteUrl = configuredOrigin.startsWith("http")
    ? configuredOrigin.replace(/\/$/, "")
    : `https://${configuredOrigin.replace(/\/$/, "")}`;
  const productUrl = `${siteUrl}/product/${id}`;
  const storedImage = product.images?.[0];
  const primaryImage = storedImage
    ? new URL(storedImage, siteUrl).toString()
    : `${siteUrl}/icon.png`;
  const imageType = primaryImage.toLowerCase().includes(".webp")
    ? "image/webp"
    : primaryImage.toLowerCase().includes(".png")
      ? "image/png"
      : "image/jpeg";
  const image = {
    url: primaryImage,
    secureUrl: primaryImage,
    type: imageType,
    alt: `Foto produk ${product.name}`,
  };

  return {
    title: product.name,
    description,
    alternates: { canonical: productUrl },
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: "UMKM Kemayoran",
      title: `${product.name} | UMKM Kemayoran`,
      description,
      url: productUrl,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | UMKM Kemayoran`,
      description,
      images: [image],
    },
  };
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

  const sellerPaymentMethods = await getSellerPaymentMethods(seller?.id);

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
    <div className="min-h-screen bg-[var(--carrom-white)] pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 md:py-10">
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
        {/* [FIX RESPONSIVE] min-w-0 pada kedua kolom penting: tanpa ini, kolom
            galeri memaksa lebarnya mengikuti lebar asli foto (min-content),
            sehingga halaman meluap ke kanan di mobile. min-w-0 mengizinkan
            kolom mengecil mengikuti lebar layar. */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-8 items-start">
          {/* Galeri foto — lengket saat scroll di desktop */}
          <div className="md:sticky md:top-24 self-start min-w-0">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          <div className="flex flex-col gap-4 md:gap-5 min-w-0">
            {/* ===== Kartu info produk ===== */}
            <div className="surface-raised rounded-[1.65rem] md:rounded-[2.25rem] p-5 md:p-7">
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

              <h1 className="market-panel-title text-xl md:text-3xl lg:text-4xl font-bold tracking-tight text-noir mb-2 md:mb-3">
                {product.name}
              </h1>

              {/* [PO & HALAL] Badge status di detail produk */}
              {(product.isPreOrder || product.halalStatus) && (
                <div className="flex flex-wrap gap-1.5 mb-2 md:mb-3">
                  {product.isPreOrder && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wide rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                      <Icon name="package" size={12} /> Pre-Order (PO) — dibuat setelah pesanan
                    </span>
                  )}
                  {product.halalStatus === "halal" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wide rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                      <Icon name="badgeCheck" size={12} /> Halal
                    </span>
                  )}
                  {product.halalStatus === "non_halal" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wide rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                      <Icon name="info" size={12} /> Non-Halal
                    </span>
                  )}
                </div>
              )}

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

              <ProductShare productName={product.name} sellerName={seller.name} />
            </div>

            {/* ===== Kartu deskripsi + tags ===== */}
            <div className="surface-raised rounded-[1.65rem] md:rounded-[2.25rem] p-5 md:p-7">
              <h2 className="market-panel-title flex items-center gap-2 text-base md:text-lg font-bold text-noir mb-2 md:mb-3">
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
            <div className="surface-raised rounded-[1.65rem] md:rounded-[2.25rem] p-5 md:p-6">
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

              {/* ===== Metode Pembayaran ===== */}
              <PaymentMethods seller={seller} methods={sellerPaymentMethods} />
            </div>

            {/* ===== CTA Checkout + WhatsApp (desktop) ===== */}
            <div className="hidden md:flex flex-col gap-2.5">
              {showPrice && (
                <Link href={`/product/${product.id}/checkout`} className="btn-primary w-full py-3 text-sm md:py-3.5 md:text-base">
                  <Icon name="shoppingBagFilled" size={17} />
                  Beli Sekarang — Bayar Manual
                </Link>
              )}
              <Link href={`/product/${product.id}/checkout?mode=whatsapp`} className="btn-wa w-full py-3 text-sm md:py-3.5 md:text-base">
                <Icon name="whatsapp" size={18} />
                Pesan via WhatsApp
              </Link>
              {waLinkAlt && (
                <a href={waLinkAlt} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full py-3 text-sm md:py-3.5 md:text-base">
                  <Icon name="phone" size={16} />
                  Kontak Alternatif
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
              <h2 className="market-panel-title flex items-center gap-2 text-lg md:text-2xl font-bold tracking-tight text-noir">
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

      {/* ===== Sticky bar bawah (mobile): harga + tombol Beli & WA ===== */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-forest/10 bg-[var(--carrom-white)]/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(16,72,46,0.1)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-md items-stretch gap-2.5">
          <div className="flex min-w-0 flex-1 flex-col justify-center rounded-2xl border border-cream-warm bg-cream-pure px-3.5 py-2.5">
            <div className="mb-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-warm-gray">Harga</div>
            <div className="truncate text-sm font-bold leading-tight text-forest">{price}</div>
          </div>
          <div className="flex min-w-0 flex-1 items-stretch gap-2">
            {showPrice && (
              <Link href={`/product/${product.id}/checkout`} className="btn-primary min-w-0 flex-1 px-3 text-sm">
                <Icon name="shoppingBagFilled" size={16} />
                <span>Beli</span>
              </Link>
            )}
            <Link
              href={`/product/${product.id}/checkout?mode=whatsapp`}
              className={`btn-wa shrink-0 px-0 ${showPrice ? "w-12" : "flex-1 px-3.5"}`}
              aria-label="Pesan via WhatsApp"
            >
              <Icon name="whatsapp" size={18} />
              {!showPrice && <span>Pesan</span>}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
