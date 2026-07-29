import Link from 'next/link'
import Icon from '@/components/common/Icon'

export default function Footer() {
  return (
    <footer className="bg-noir text-cotton-warm py-12 mt-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-noir-soft">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <img src="/icon.png" alt="UMKM Ciangsana" className="h-8 md:h-9 w-auto" />
              <span className="font-bold text-base text-cotton-pure">UMKM Ciangsana</span>
            </Link>
            <p className="mt-3 text-sm text-warm-gray max-w-xs leading-relaxed">
              Mendukung pertumbuhan UMKM lokal Ciangsana melalui digitalisasi.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-cotton-pure uppercase tracking-wider mb-3">Navigasi</h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-warm-gray hover:text-cotton-pure transition-colors">Beranda</Link>
              <Link href="/catalog" className="text-sm text-warm-gray hover:text-cotton-pure transition-colors">Katalog</Link>
              <Link href="/about" className="text-sm text-warm-gray hover:text-cotton-pure transition-colors">Tentang</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-cotton-pure uppercase tracking-wider mb-3">Kontak</h4>
            <a href="mailto:admin@ciangsana-umkm.id" className="text-sm text-warm-gray hover:text-cotton-pure transition-colors flex items-center gap-1">
              <Icon name="externalLink" size={14} /> admin@ciangsana-umkm.id
            </a>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-2 pt-6 text-xs text-cool-gray">
          <p>&copy; {new Date().getFullYear()} E-Catalog UMKM Ciangsana. Semua hak dilindungi.</p>
        </div>
      </div>
    </footer>
  )
}