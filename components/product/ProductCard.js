import Link from 'next/link'
import { useState } from 'react'
import Icon from '@/components/common/Icon'

export default function ProductCard({ product, category }) {
  const [imgError, setImgError] = useState(false)
  const productImg = imgError ? '/images/keripik-pisang.jpeg' : (product.images?.[0] || '/images/keripik-pisang.jpeg')
  return (
    <Link href={`/product/${product.id}`} className="group flex flex-col bg-white border border-cotton-warm rounded-xl md:rounded-2xl overflow-hidden transition-all duration-300 hover:border-cherry/30 hover:shadow-xl hover:-translate-y-1">
      <div className="relative aspect-[4/3] bg-cotton-warm overflow-hidden">
        <img src={productImg} alt={product.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        {product.isFeatured && (
          <span className="absolute top-2 left-2 md:top-3 md:left-3 flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 text-[9px] md:text-xs font-bold text-white uppercase tracking-wider rounded-full"
            style={{ background: 'linear-gradient(135deg, #D4A017, #C9A227)' }}>
            <Icon name="star" size={10} /> Unggulan
          </span>
        )}
      </div>
      <div className="p-2.5 md:p-4 flex flex-col gap-1 md:gap-1.5">
        <span className="text-[9px] md:text-xs font-semibold text-cherry uppercase tracking-wider">{category?.name}</span>
        <h3 className="text-xs md:text-base font-semibold text-noir leading-tight line-clamp-2">{product.name}</h3>
        <span className="text-[10px] md:text-sm text-warm-gray truncate">{product.sellerName}</span>
        <span className={`text-[11px] md:text-sm font-semibold ${product.price !== null ? 'text-cherry' : 'text-warm-gray font-mono'}`}>
          {product.price ? `Rp ${product.price.toLocaleString('id-ID')}` : product.priceUnit}
        </span>
      </div>
    </Link>
  )
}