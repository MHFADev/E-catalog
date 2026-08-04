import Link from 'next/link'
import { useState } from 'react'
import Icon from '@/components/common/Icon'

// [PRODUK CONTOH] Peta id kategori -> ikon kategori di /images/categories.
// Dipakai sebagai gambar kartu untuk produk yang tidak punya foto (images kosong),
// misal produk contoh 1-15. Di halaman detail (/product/[id]) gambar tetap kosong.
const CATEGORY_FALLBACK_IMAGES = {
  kuliner: "/images/categories/kuliner.svg",
  "fasion-aksesoris": "/images/categories/aksesoris-fashion.svg",
  "camilan-minuman": "/images/categories/frozen-minuman.svg",
  "frozen-food": "/images/categories/frozen-minuman.svg",
  "masakan-siap-saji": "/images/categories/masakan-siap-saji.svg",
  "makanan-hampers": "/images/categories/jajanan-hampers.svg",
  "sembako-rumah-tangga": "/images/categories/sembako-rumah-tangga.svg",
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
  const fallbackImg = CATEGORY_FALLBACK_IMAGES[product.categoryId] || '/images/webp-2/camilan-ciangsana.webp';
  const productImg = imgError ? fallbackImg : (product.images?.[0] || fallbackImg)
  const price = priceParts(product)
  return (
    <Link href={`/product/${product.id}`} className="group flex flex-col bg-white border border-cream-warm rounded-xl md:rounded-2xl overflow-hidden transition-all duration-300 hover:border-forest/30 hover:shadow-xl hover:-translate-y-1">
      <div className="relative aspect-square bg-cream-warm overflow-hidden">
        <img src={productImg} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={() => setImgError(true)} />
        {category?.name && (
          <span className="absolute top-2 left-2 md:top-3 md:left-3 px-2 md:px-2.5 py-0.5 md:py-1 text-[9px] md:text-[11px] font-semibold text-white bg-forest/90 uppercase tracking-wide rounded-full backdrop-blur-sm">
            {category.name}
          </span>
        )}
        {product.isFeatured && (
          <span className="absolute top-2 right-2 md:top-3 md:right-3 flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 text-[9px] md:text-xs font-bold text-white uppercase tracking-wider rounded-full"
            style={{ background: 'linear-gradient(135deg, #D4A017, #C9A227)' }}>
            <Icon name="star" size={10} /> Unggulan
          </span>
        )}
      </div>
      <div className="p-2.5 md:p-4 flex flex-col gap-1 md:gap-1.5">
        <h3 className="text-xs md:text-base font-semibold text-noir leading-tight line-clamp-2">{product.name}</h3>
        {price ? (
          <span className="text-sm md:text-lg font-bold text-forest leading-tight">
            {price.main}
            {price.suffix && <span className="text-[10px] md:text-xs font-medium text-warm-gray ml-1">{price.suffix}</span>}
          </span>
        ) : (
          <span className="text-[11px] md:text-sm font-semibold text-warm-gray">Hubungi via WhatsApp</span>
        )}
        {product.sellerName && (
          <span className="text-[10px] md:text-sm text-warm-gray truncate">{product.sellerName}</span>
        )}
      </div>
    </Link>
  )
}
