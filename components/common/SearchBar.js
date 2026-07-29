'use client'
import Icon from './Icon'

export default function SearchBar({ value, onChange, placeholder = 'Cari...' }) {
  return (
    <div className="relative w-full">
      <span className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-warm-gray pointer-events-none">
        <Icon name="search" size={16} />
      </span>
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 md:pl-11 pr-3.5 md:pr-4 py-2.5 md:py-3 bg-cotton-pure border-2 border-transparent rounded-full text-sm md:text-base text-noir-soft placeholder:text-warm-gray outline-none transition-all focus:bg-white focus:border-cherry/20 focus:shadow-[0_0_0_4px_var(--color-glass-cherry)]"
      />
    </div>
  )
}