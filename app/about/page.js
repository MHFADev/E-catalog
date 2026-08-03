import Link from "next/link";
import Icon from "@/components/common/Icon";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
          Tentang <span className="text-forest">Inisiatif</span>
        </h1>
        <p className="text-lg text-warm-gray max-w-xl mx-auto leading-relaxed">
          Menghubungkan pelaku UMKM Kemayoran dengan calon pembeli melalui
          platform katalog digital yang modern dan mudah digunakan.
        </p>
      </div>

      <div className="max-w-2xl mx-auto flex flex-col gap-12">
        <section>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            Latar Belakang
          </h2>
          <div className="text-base leading-relaxed text-cool-gray space-y-4">
            <p>
              Kemayoran â€” wilayah administratif Kecamatan Gunung Putri,
              Kabupaten Bogor â€” memiliki banyak pelaku UMKM yang produknya belum
              terpusat dalam satu platform digital yang mudah diakses calon
              pembeli.
            </p>
            <p>
              <strong>E-Catalog UMKM Kemayoran</strong> hadir sebagai solusi
              etalase digital yang menampilkan seluruh produk UMKM secara
              terstruktur, mudah dicari berdasarkan kategori, dan memungkinkan
              calon pembeli langsung menghubungi penjual melalui WhatsApp hanya
              dengan satu klik.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            Cara Kerja
          </h2>
          <ol className="pl-5 flex flex-col gap-4 text-base leading-relaxed text-cool-gray list-decimal">
            <li>
              <strong>Jelajahi</strong> produk berdasarkan kategori atau gunakan
              fitur pencarian.
            </li>
            <li>
              <strong>Klik</strong> produk yang menarik untuk melihat detail
              lengkap.
            </li>
            <li>
              <strong>Hubungi</strong> penjual langsung via WhatsApp dengan satu
              klik.
            </li>
            <li>
              <strong>Transaksi</strong> dilakukan langsung antara pembeli dan
              penjual di luar platform.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">
            Untuk UMKM
          </h2>
          <p className="text-base leading-relaxed text-cool-gray">
            Ingin produk UMKM Anda tampil di katalog ini? Cukup klik tombol <strong>Gabung</strong> di pojok kanan atas untuk mendaftarkan produk Anda. Syarat: memiliki nomor WhatsApp aktif dan produk fisik yang siap dipasarkan.
          </p>
        </section>
      </div>
    </div>
  );
}
