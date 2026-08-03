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

export default function ProductCard({ product, category }) {
  const [imgError, setImgError] = useState(false)
  // [FIX] Fallback gambar lama dipindah: kini /images/webp-2/camilan-ciangsana.webp
  // [PRODUK CONTOH] Jika produk tak punya foto, pakai ikon kategori sebagai gambar kartu.
  const fallbackImg = CATEGORY_FALLBACK_IMAGES[product.categoryId] || '/images/webp-2/camilan-ciangsana.webp';
  const productImg = imgError ? fallbackImg : (product.images?.[0] || fallbackImg)
  return (
    <Link href={`/product/${product.id}`} className="group flex flex-col bg-white border border-cream-warm rounded-xl md:rounded-2xl overflow-hidden transition-all duration-300 hover:border-forest/30 hover:shadow-xl hover:-translate-y-1">
      <div className="relative aspect-[4/3] bg-cream-warm overflow-hidden">
        <img src={productImg} alt={product.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        {product.isFeatured && (
          <span className="absolute top-2 left-2 md:top-3 md:left-3 flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 text-[9px] md:text-xs font-bold text-white uppercase tracking-wider rounded-full"
            style={{ background: 'linear-gradient(135deg, #D4A017, #C9A227)' }}>
            <Icon name="star" size={10} /> Unggulan
          </span>
        )}
      </div>
      <div className="p-2.5 md:p-4 flex flex-col gap-1 md:gap-1.5">
        <span className="text-[9px] md:text-xs font-semibold text-forest uppercase tracking-wider">{category?.name}</span>
        <h3 className="text-xs md:text-base font-semibold text-noir leading-tight line-clamp-2">{product.name}</h3>
        <span className="text-[10px] md:text-sm text-warm-gray truncate">{product.sellerName}</span>
      </div>
    </Link>
  )
}