'use client'
import { useState, useEffect } from 'react'

export default function ImageSlider({ images, className, overlay }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % images.length), 4000)
    return () => clearInterval(t)
  }, [images.length])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {images.map((src, i) => (
        <img key={i} src={src} alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      {overlay}
      <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all ${i === idx ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/60'}`}
          />
        ))}
      </div>
    </div>
  )
}
