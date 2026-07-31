'use client'
import { useEffect, useRef } from 'react'

export default function MultiPinMap({ markers, center, zoom = 13 }) {
  const el = useRef(null)

  useEffect(() => {
    const L = window.L
    if (L) {
      const map = L.map(el.current, { zoomControl: false }).setView(center, zoom)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OSM</a>',
        maxZoom: 19,
      }).addTo(map)
      markers.forEach(m => {
        L.marker([m.lat, m.lng]).addTo(map).bindPopup(m.name)
      })
      return () => map.remove()
    }
  }, [])

  return <div ref={el} className="w-full h-full rounded-xl md:rounded-2xl z-0" />
}
