import Link from 'next/link'
import { useState } from 'react'
import Icon from '@/components/common/Icon'

// [PRODUK CONTOH] Peta id kategori -> ikon kategori di /images/categories.
// Dipakai sebagai gambar kartu untuk produk yang tidak punya foto (images kosong),
// misal produk contoh 1-15. Di halaman detail (/product/[id]) gambar tetap kosong.
const CATEGORY_FALLBACK_IMAGES = {
  kuliner: "/images/category-icons/kuliner.png",
  "fasion-aksesoris": "/images/category-icons/fasion-aksesoris.png",
  "camilan-minuman": "/images/category-icons/camilan-minuman.png",
  "frozen-food": "/images/category-icons/frozen-food.png",
  "masakan-siap-saji": "/images/category-icons/masakan-siap-saji.png",
  "makanan-hampers": "/images/category-icons/makanan-hampers.png",
  "sembako-rumah-tangga": "/images/category-icons/sembako-rumah-tangga.png",
};

// Harga produk: data pakai format campuran, rapikan di sini.
// - priceUnit sudah "Rp..." / "Harga..." / "Hubungi..." -> pakai apa adanya
// - priceUnit cuma satuan ("/ ikat", "per porsi") -> gabung dengan price
function priceParts(product) {
  if (product.price == null || product.price === "") return null;
  if (/^(Rp|Harga|Hubungi)/.test(product.priceUnit || "")) {
    const m = String(product.priceUnit).match(/^(Rp\s*[\d.,]+)/);
    if (m) {
      return {
        main: m[1],
        suffix: String(product.priceUnit).slice(m[0].length).trim(),
      };
    }
    return { main: product.priceUnit, suffix: "" };
  }
  return {
    main: `Rp${Number(product.price).toLocaleString("id-ID")}`,
    suffix: product.priceUnit || "",
  };
}

export default function ProductCard({ product, category }) {
  const [imgError, setImgError] = useState(false)
  // [FIX] Fallback gambar lama dipindah: kini /images/webp-2/camilan-ciangsana.webp
  // [PRODUK CONTOH] Jika produk tak punya foto, pakai ikon kategori sebagai gambar kartu.
  const fallbackImg = CATEGORY_FALLBACK_IMAGES[product.categoryId] || "/images/webp-2/camilan-ciangsana.webp";
  const hasProductImage = Boolean(product.images?.[0]) && !imgError;
  const productImg = hasProductImage ? product.images[0] : fallbackImg;
  const price = priceParts(product)
  return (
    <Link href={`/product/${product.id}`} className="product-card group relative flex h-full flex-col overflow-hidden rounded-[1.35rem] md:rounded-[1.75rem] bg-white transition-all duration-300 hover:-translate-y-1.5 focus-visible:outline-none">
      <div className="product-card__media relative aspect-square overflow-hidden">
        <img src={productImg} alt={product.name} className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${hasProductImage ? "object-cover" : "object-contain p-4 md:p-6"}`} onError={() => setImgError(true)} />
        {category?.name && (
          <span className="product-card__label absolute top-2 left-2 md:top-3 md:left-3 px-2.5 py-1 text-[9px] md:text-[11px] font-bold rounded-lg uppercase tracking-wide shadow-sm">
            {category.name}
          </span>
        )}
        {product.isFeatured && (
          <span className="absolute top-2 right-2 md:top-3 md:right-3 flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 text-[9px] md:text-xs font-bold text-white uppercase tracking-wider rounded-full shadow-sm"
            style={{ background: 'linear-gradient(135deg, #D4A017, #C9A227)' }}>
            <Icon name="star" size={10} /> Unggulan
          </span>
        )}
        <span className="product-card__action absolute inset-x-2 bottom-2 md:inset-x-3 md:bottom-3 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs md:text-sm font-bold text-white opacity-100 translate-y-0 transition-all duration-300 backdrop-blur-sm md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0">
          <Icon name="shoppingBasket" size={14} /> Lihat Produk
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5 md:p-4.5">
        {/* [PO & HALAL] Badge status produk & kehalalan */}
        {(product.isPreOrder || (product.halalStatus === "halal" || product.halalStatus === "non_halal")) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {product.isPreOrder && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wide rounded-md bg-amber-100 text-amber-700">
                <Icon name="package" size={10} /> Pre-Order
              </span>
            )}
            {product.halalStatus === "halal" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wide rounded-md bg-emerald-100 text-emerald-700">
                <Icon name="badgeCheck" size={10} /> Halal
              </span>
            )}
            {product.halalStatus === "non_halal" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wide rounded-md bg-gray-100 text-gray-600">
                <Icon name="info" size={10} /> Non-Halal
              </span>
            )}
          </div>
        )}
        <h3 className="text-sm md:text-base font-bold text-noir leading-snug line-clamp-2 transition-colors group-hover:text-forest-deep">{product.name}</h3>
        {product.showPrice !== false && price ? (
          <span className="mt-0.5 text-base md:text-lg font-extrabold text-forest leading-tight">
            {price.main}
            {price.suffix && <span className="text-[10px] md:text-xs font-medium text-warm-gray ml-1">{price.suffix}</span>}
          </span>
        ) : (
          <span className="text-[11px] md:text-sm font-semibold text-warm-gray">Hubungi penjual untuk harga</span>
        )}
        {/* [RATING PRODUK] Rata-rata rating tampil di bawah harga (bintang + angka,
            mis. "4.7"), hanya muncul jika produk punya rating > 0 */}
        {product.rating > 0 && (
          <span className="flex items-center gap-1 text-[10px] md:text-sm text-warm-gray">
            <Icon name="starFilled" size={12} className="text-amber-500" />
            <span className="font-semibold text-noir">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-muted/60">rating</span>
          </span>
        )}
        {product.sellerName && (
          <span className="flex items-center gap-1 text-[10px] md:text-sm text-warm-gray truncate">
            <Icon name="store" size={12} className="shrink-0 text-forest" />
            {product.sellerName}
          </span>
        )}
      </div>
    </Link>
  )
}
