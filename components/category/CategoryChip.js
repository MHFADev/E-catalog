'use client'
import { useState } from 'react'
import Icon from '@/components/common/Icon'

// [HOVER] Desktop: teks berubah #991B1B saat hover (md:)
export default function CategoryChip({ category, active, onClick }) {
  const [imgError, setImgError] = useState(false)

  return (
    <button onClick={() => onClick(active ? null : category.id)}
      className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium overflow-hidden transition-all duration-300 border ${
        active
          ? 'border-cherry-deep text-white shadow-md'
          : 'border-cotton-warm bg-cotton-pure text-noir-soft md:hover:border-cherry-deep md:hover:text-cherry-deep'
      }`}
    >
      <span className="absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: active ? 1 : 0,
          background: active && imgError ? 'linear-gradient(135deg, #B91C1C, #991B1B)' : 'none',
        }}
      >
        {!imgError && (
          <img src={`/images/categories/${category.id}.svg`} alt=""
            className="w-full h-full object-cover blur-sm"
            onError={() => setImgError(true)}
          />
        )}
      </span>
      <span className="relative z-10 flex items-center gap-2">
        <Icon name={category.icon} size={16} />
        <span>{category.name}</span>
      </span>
    </button>
  )
}