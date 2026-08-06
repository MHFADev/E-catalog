import Link from "next/link";
import Icon from "@/components/common/Icon";
import ContactForm from "@/components/common/ContactForm";

// [FOOTER] Terang/netral mengikuti palet marketplace, copyright rata tengah
export default function Footer() {
  return (
    <footer className="bg-white border-t border-cream-warm mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 pb-8 border-b border-cream-warm">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/icon.png"
                alt="UMKM Kemayoran"
                className="h-8 md:h-9 w-auto"
              />
              <span className="font-bold text-base text-noir">
                UMKM Kemayoran
              </span>
            </Link>
            <p className="mt-3 text-sm text-cool-gray max-w-xs leading-relaxed">
              Mendukung pertumbuhan UMKM lokal Kemayoran melalui digitalisasi.
            </p>
            <div className="mt-4 text-xs text-warm-gray">
              Jl. Kemayoran, Jakarta Pusat
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-noir uppercase tracking-wider mb-4">
              Navigasi
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link
                href="/"
                className="text-sm text-cool-gray hover:text-forest transition-colors"
              >
                Beranda
              </Link>
              <Link
                href="/catalog"
                className="text-sm text-cool-gray hover:text-forest transition-colors"
              >
                Katalog
              </Link>
              <Link
                href="/artikel"
                className="text-sm text-cool-gray hover:text-forest transition-colors"
              >
                Artikel
              </Link>
              <Link
                href="/about"
                className="text-sm text-cool-gray hover:text-forest transition-colors"
              >
                Tentang
              </Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-noir uppercase tracking-wider mb-4">
              Kontak
            </h4>
            <a
              href="mailto:admin@Kemayoran-umkm.id"
              className="text-sm text-cool-gray hover:text-forest transition-colors flex items-center gap-1 mb-4"
            >
              <Icon name="externalLink" size={14} /> admin@Kemayoran-umkm.id
            </a>
            <ContactForm />
          </div>
        </div>
        {/* [FOOTER] Copyright di tengah */}
        <div className="flex flex-wrap justify-center gap-2 pt-6 text-xs text-warm-gray">
          <p>
            &copy; {new Date().getFullYear()} E-Catalog UMKM Kemayoran. Semua
            hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
