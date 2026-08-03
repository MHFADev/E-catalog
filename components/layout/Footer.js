import Link from "next/link";
import Icon from "@/components/common/Icon";
import ContactForm from "@/components/common/ContactForm";

// [FOOTER] Copyright rata tengah sesuai permintaan
export default function Footer() {
  return (
    <footer className="bg-hutan text-white/70 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-white/10">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/icon.png"
                alt="UMKM Kemayoran"
                className="h-8 md:h-9 w-auto"
              />
              <span className="font-bold text-base text-cream-pure">
                UMKM Kemayoran
              </span>
            </Link>
            <p className="mt-3 text-sm text-white/60 max-w-xs leading-relaxed">
              Mendukung pertumbuhan UMKM lokal Kemayoran melalui digitalisasi.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-cream-pure uppercase tracking-wider mb-3">
              Navigasi
            </h4>
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Beranda
              </Link>
              <Link
                href="/catalog"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Katalog
              </Link>
              <Link
                href="/about"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Tentang
              </Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-cream-pure uppercase tracking-wider mb-3">
              Kontak
            </h4>
            <a
              href="mailto:admin@Kemayoran-umkm.id"
              className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1 mb-3"
            >
              <Icon name="externalLink" size={14} /> admin@Kemayoran-umkm.id
            </a>
            <ContactForm />
          </div>
        </div>
        {/* [FOOTER] Copyright di tengah */}
        <div className="flex flex-wrap justify-center gap-2 pt-6 text-xs text-white/40">
          <p>
            &copy; {new Date().getFullYear()} E-Catalog UMKM Kemayoran. Semua
            hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
