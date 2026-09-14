'use client'
import { useEffect, useRef, useState } from 'react'

// Leaflet CSS & JS dimuat secara dinamis hanya saat komponen ini dipakai,
// sehingga tidak memblokir render halaman lain.
function loadLeaflet() {
  return new Promise((resolve, reject) => {
    // Jika sudah dimuat sebelumnya, langsung resolve
    if (window.L) { resolve(window.L); return; }

    // Inject CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // Inject JS
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.async = true
    script.onload = () => resolve(window.L)
    script.onerror = reject
    document.body.appendChild(script)
  })
}

export default function MultiPinMap({ markers, center, zoom = 13 }) {
  const el = useRef(null)
  const mapRef = useRef(null)
  const [visible, setVisible] = useState(false)

  // IntersectionObserver: muat peta hanya saat elemen masuk viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }, // mulai load 200px sebelum masuk viewport
    )
    if (el.current) observer.observe(el.current)
    return () => observer.disconnect()
  }, [])

  // Inisialisasi Leaflet setelah elemen terlihat
  useEffect(() => {
    if (!visible || !el.current || mapRef.current) return
    let map

    loadLeaflet().then((L) => {
      if (!el.current) return
      map = L.map(el.current, { zoomControl: false }).setView(center, zoom)
      mapRef.current = map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OSM</a>',
        maxZoom: 19,
      }).addTo(map)
      markers.forEach((m) => {
        L.marker([m.lat, m.lng]).addTo(map).bindPopup(m.name)
      })
    }).catch(console.error)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [visible, center, zoom, markers])

  return (
    <div
      ref={el}
      className="w-full h-full rounded-xl md:rounded-2xl z-0 bg-cream-warm"
      aria-label="Peta lokasi UMKM Kemayoran"
    />
  )
}
