'use client'
import Link from 'next/link'
import ProductGrid from '@/components/product/ProductGrid'
import Icon from '@/components/common/Icon'
import productsData from '@/data/products.json'
import sellersData from '@/data/sellers.json'
import categories from '@/data/categories.json'

const galleryItems = [
  { src: '/images/gallery-1.svg', title: 'Kuliner Khas', desc: 'Aneka makanan tradisional' },
  { src: '/images/gallery-2.svg', title: 'Kerajinan Tangan', desc: 'Produk handmade kreatif' },
  { src: '/images/gallery-3.svg', title: 'Fashion Lokal', desc: 'Busana khas Ciangsana' },
  { src: '/images/gallery-4.svg', title: 'Minuman Segar', desc: 'Minuman tradisional & modern' },
  { src: '/images/gallery-5.svg', title: 'Sembako', desc: 'Kebutuhan pokok sehari-hari' },
]

export default function HomePage() {
  const enriched = productsData.map(p => ({ ...p, sellerName: sellersData.find(s => s.id === p.sellerId)?.name || '' }))
  const featured = enriched.filter(p => p.isFeatured)

  return (
    <>
      <section className="py-10 md:py-20 bg-cotton">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-6 md:gap-16 items-center">
            <div className="flex flex-col gap-3 md:gap-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 w-fit bg-cherry/10 text-cherry font-mono text-[10px] md:text-xs uppercase tracking-wider rounded-full font-semibold">UMKM Ciangsana</span>
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-none tracking-tighter text-noir">
                Temukan <span className="text-cherry">Produk Lokal</span><br />Ciangsana
              </h1>
              <p className="text-sm md:text-lg text-warm-gray leading-relaxed max-w-md">Jelajahi produk UMKM lokal dari Ciangsana dan sekitarnya</p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-1 md:mt-2">
                <Link href="/catalog" className="btn-primary text-sm md:text-base py-2.5 md:py-3">Jelajahi Katalog <Icon name="arrowRight" size={14} /></Link>
                <Link href="/about" className="btn-secondary text-sm md:text-base py-2.5 md:py-3 text-center">Tentang Inisiatif</Link>
              </div>
            </div>
            <div className="relative order-first md:order-last">
              <div className="rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl">
                <img src="/images/hero-1.svg" alt="" className="w-full aspect-[4/3] object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-3 md:py-4 bg-white border-y border-cotton-warm">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {[
              { icon: 'star', label: 'Produk Terbaru' },
              { icon: 'gem', label: 'Best Seller' },
              { icon: 'gift', label: 'Koleksi Baru' },
              { icon: 'truck', label: 'Pengiriman Cepat' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 md:gap-3 text-noir-soft text-[11px] md:text-sm font-medium">
                <Icon name={item.icon} size={16} className="text-cherry shrink-0" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-5 md:mb-8">
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight">Produk <span className="text-cherry">Unggulan</span></h2>
            <Link href="/catalog" className="flex items-center gap-1 text-xs md:text-sm font-medium text-warm-gray hover:text-cherry transition-all">
              Lihat Semua <Icon name="arrowRight" size={12} />
            </Link>
          </div>
          <ProductGrid products={featured} categories={categories} />
          <div className="text-center mt-6 md:mt-8">
            <Link href="/catalog" className="btn-primary text-sm md:text-base">Lihat Semua Produk <Icon name="arrowRight" size={14} /></Link>
          </div>
        </div>
      </section>

      <section className="pb-10 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-3 md:gap-4">
            <div className="rounded-2xl md:rounded-3xl overflow-hidden flex items-center min-h-[180px] md:min-h-[220px]" style={{ background: 'linear-gradient(135deg, #751515, #991B1B)' }}>
              <div className="p-6 md:p-8">
                <span className="inline-block px-2 py-0.5 md:py-1 mb-3 md:mb-4 bg-white/15 text-cotton font-mono text-[10px] md:text-xs uppercase tracking-wider rounded-full">Penawaran</span>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-white mb-1 md:mb-2">Produk Lokal<br/>Ciangsana</h3>
                <p className="text-xs md:text-sm text-white/70 mb-3 md:mb-4">Dukung UMKM tetangga kita sendiri</p>
                <Link href="/catalog" className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-cotton hover:gap-2 transition-all">Jelajahi <Icon name="arrowRight" size={12} /></Link>
              </div>
            </div>
            <div className="rounded-2xl md:rounded-3xl overflow-hidden flex items-center min-h-[180px] md:min-h-[220px] bg-cotton-warm">
              <div className="p-6 md:p-8">
                <span className="inline-block px-2 py-0.5 md:py-1 mb-3 md:mb-4 bg-cherry/10 text-cherry font-mono text-[10px] md:text-xs uppercase tracking-wider rounded-full">Kemudahan</span>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-noir mb-1 md:mb-2">Pesan Langsung<br/>via WhatsApp</h3>
                <p className="text-xs md:text-sm text-warm-gray mb-3 md:mb-4">Hubungi penjual tanpa perantara</p>
                <Link href="/catalog" className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-cherry hover:gap-2 transition-all">Mulai <Icon name="arrowRight" size={12} /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-10 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-5 md:mb-8">
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight">Jelajahi <span className="text-cherry">Koleksi</span></h2>
            <Link href="/catalog" className="flex items-center gap-1 text-xs md:text-sm font-medium text-warm-gray hover:text-cherry transition-all">
              Lihat Semua <Icon name="arrowRight" size={12} />
            </Link>
          </div>
          <div className="flex overflow-x-auto pb-4 pr-16 snap-x snap-mandatory gallery-track" style={{ gap: 0 }}>
            {galleryItems.map((item, i) => (
              <div key={i} className="snap-start shrink-0 gallery-card-wrap"
                style={{
                  flex: '0 0 240px', marginLeft: i === 0 ? 0 : '-40px',
                  zIndex: galleryItems.length - i,
                  animation: `cardEntrance 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s backwards`,
                }}>
                <div className="group rounded-xl md:rounded-2xl overflow-hidden transition-all duration-300 hover:!z-50 hover:-translate-y-2 hover:scale-[1.02] relative">
                  <div className="aspect-[16/9] overflow-hidden bg-cotton-warm rounded-xl md:rounded-2xl shadow-lg">
                    <img src={item.src} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="pt-2">
                    <h3 className="text-sm md:text-base font-semibold tracking-tight">{item.title}</h3>
                    <p className="text-xs md:text-sm text-warm-gray">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-4 md:py-6 bg-white border-t border-cotton-warm">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 md:items-center">
            {[
              { icon: 'lock', label: 'Transaksi Aman' },
              { icon: 'headset', label: 'Dukungan 24/7' },
              { icon: 'star', label: 'Kualitas Lokal' },
              { icon: 'refresh', label: 'Mudah & Cepat' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 md:gap-3 text-noir-soft text-[11px] md:text-sm font-medium md:justify-center">
                <Icon name={item.icon} size={16} className="text-cherry shrink-0" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .gallery-card-wrap { position: relative; }
        .gallery-card-wrap:hover { z-index: 999 !important; }
        .scrollbar-thin::-webkit-scrollbar { height: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: #F5F0E8; border-radius: 2px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #B91C1C; border-radius: 2px; }
        @media (max-width: 640px) {
          .gallery-card-wrap { flex: 0 0 200px !important; }
          .gallery-card-wrap + .gallery-card-wrap { margin-left: -30px !important; }
        }
      `}</style>
    </>
  )
}