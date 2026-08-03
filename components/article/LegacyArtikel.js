import Link from "next/link";
import Icon from "@/components/common/Icon";
import ImageSlider from "@/components/common/ImageSlider";

// [FIX] Path gambar diperbarui dari /images/*.jpg/.jpeg ke /images/webp-2/*.webp
// sesuai dengan direktori & format terbaru (gambar lama sudah dipindah).
const heroSlides = [
  "/images/webp-2/foodcourt-nusadaya-2.webp",
  "/images/webp-2/umkm-lancar-barokah.webp",
  "/images/webp-2/foodcourt-nusadaya-1.webp",
  "/images/webp-2/camilan-ciangsana.webp",
  "/images/webp-2/galeri-umkm-etam.webp",
];

const sections = [
  {
<<<<<<< HEAD
    title: "Aneka Cemilan 39 — Camilan Tradisional Kemasan Modern",
    // [FIX] Path gambar baru di /images/webp-2/ sesuai format webp
    image: "/images/webp-2/camilan-ciangsana.webp",
=======
    title: "Aneka Cemilan 39 â€” Camilan Tradisional Kemasan Modern",
    image: "/images/camilan-ciangsana.jpeg",
>>>>>>> 45429b8dd94bed447c4b34b5f8ca3d97678fd0e1
    caption:
      "Produksi keripik pisang rumahan Aneka Cemilan 39, dikemas modern untuk menjangkau pasar yang lebih luas.",
    details: [
      { label: "Lokasi", value: "Kidul, Jalan Cagak Raya, Kemayoran" },
      { label: "Kontak", value: "0878-6771-1181" },
      {
        label: "Produk",
        value:
          "Kue Jintan, Keripik Pisang, Rengginang, Makaroni Pedas, Fish Skin",
      },
    ],
    body: "Berawal dari dapur rumah, Aneka Cemilan 39 kini memproduksi berbagai camilan tradisional dengan kemasan modern. Kue jintan manis dan asin, keripik pisang renyah, rengginang gurih, makaroni pedas, hingga fish skin menjadi produk andalan yang dipasarkan ke berbagai daerah.",
  },
  {
<<<<<<< HEAD
    title: "Kerupuk Rambak Djawa — Kulit Sapi Asli Premium",
    // [FIX] Path gambar baru di /images/webp-2/ sesuai format webp
    image: "/images/webp-2/umkm-lancar-barokah.webp",
=======
    title: "Kerupuk Rambak Djawa â€” Kulit Sapi Asli Premium",
    image: "/images/umkm-lancar-barokah.jpg",
>>>>>>> 45429b8dd94bed447c4b34b5f8ca3d97678fd0e1
    caption:
      "Kerupuk rambak kulit sapi asli produksi Lancar Barokah, telah menembus pasar nasional hingga kalangan pejabat dan TNI.",
    details: [
      { label: "Pemilik", value: "Ibu Yatini" },
      { label: "Kontak", value: "0813-8040-5190" },
      { label: "Platform", value: "Tokopedia, Shopee, Blibli, Instagram" },
    ],
    body: "Kerupuk Rambak Djawa (Lancar Barokah) memproduksi kerupuk kulit sapi 100% asli dengan kualitas premium. Tersedia dalam varian stick 250g, kerupuk rambak sapi, dan kerupuk kulit Barokah Jabar 220g. Produk ini telah merambah pasar hingga kalangan pejabat dan TNI.",
  },
  {
<<<<<<< HEAD
    title: "Foodcourt Nusadaya Pasir Angin — Pusat Kuliner Pemberdayaan UMKM",
    // [FIX] Path gambar baru di /images/webp-2/ sesuai format webp
    image: "/images/webp-2/foodcourt-nusadaya-1.webp",
=======
    title: "Foodcourt Nusadaya Pasir Angin â€” Pusat Kuliner Pemberdayaan UMKM",
    image: "/images/foodcourt-nusadaya-1.jpg",
>>>>>>> 45429b8dd94bed447c4b34b5f8ca3d97678fd0e1
    caption:
      "Selat Solo, salah satu menu unggulan di Foodcourt Nusadaya yang memberdayakan 10 pengusaha UMKM lokal.",
    details: [
      {
        label: "Lokasi",
        value: "Griya Alam Sentosa, Cileungsi (perbatasan Kemayoran)",
      },
      { label: "Jam Buka", value: "10.00 - 23.00" },
      {
        label: "Menu",
        value:
          "Selat Solo, Nasi Liwet, Pecel, Ayam Goreng, Minuman Tradisional",
      },
    ],
    body: "Binaan Dompet Dhuafa dan OK OCE, Foodcourt Nusadaya Pasir Angin menjadi pusat kuliner yang memberdayakan ekonomi warga lokal. Dengan konsep harga terjangkau, pengunjung dapat menikmati Selat Solo, Nasi Liwet, Pecel, Ayam Goreng, dan aneka jajanan ringan.",
  },
  {
<<<<<<< HEAD
    title: "Galeri UMKM — IKM Cileungsi: Kerajinan & Inovasi Pangan",
    // [FIX] Path gambar baru di /images/webp-2/ sesuai format webp
    image: "/images/webp-2/galeri-umkm-etam.webp",
=======
    title: "Galeri UMKM â€” IKM Cileungsi: Kerajinan & Inovasi Pangan",
    image: "/images/galeri-umkm-etam.jpg",
>>>>>>> 45429b8dd94bed447c4b34b5f8ca3d97678fd0e1
    caption:
      "Tas anyaman handmade karya perajin IKM Cileungsi, kombinasi seni tradisional dan desain modern.",
    details: [
      { label: "Kontak", value: "0812-1844-9728" },
      {
        label: "Aksesoris",
        value: "Anting, Gelang, Kalung Manik Rp10rb-Rp150rb",
      },
      { label: "Tas", value: "Kerajinan anyaman Rp25rb-Rp350rb" },
      { label: "Frozen Food", value: "Nugget Jamur Tiram Rp15rb-Rp35rb" },
    ],
    body: "Galeri UMKM & IKM Cileungsi menjadi showcase produk unggulan wilayah Cileungsi dan sekitarnya. Mulai dari aksesoris manik handmade, tas kerajinan anyaman, hingga nugget jamur tiram sebagai inovasi pangan sehat.",
  },
  {
<<<<<<< HEAD
    title: "Smart Shop UMKM RW 010 — Inisiatif Warga Jatisari",
    // [FIX] Path gambar baru di /images/webp-2/ sesuai format webp
    image: "/images/webp-2/jajanan-jatisari.webp",
=======
    title: "Smart Shop UMKM RW 010 â€” Inisiatif Warga Jatisari",
    image: "/images/jajanan-jatisari.jpeg",
>>>>>>> 45429b8dd94bed447c4b34b5f8ca3d97678fd0e1
    caption:
      "Smart Shop UMKM RW 010 menyediakan sembako dan produk kreatif warga dengan harga bersaing.",
    details: [
      { label: "Lokasi", value: "Jatisari (dekat Kemayoran)" },
      { label: "Kontak", value: "0823-1000-3879" },
      {
        label: "Produk",
        value: "Sembako, Sempol, Jasuke, Souvenir, Hampers, Pouch Custom",
      },
    ],
    body: "Smart Shop UMKM RW 010 adalah inisiatif warga untuk memasarkan produk kreatif dan kebutuhan rumah tangga. Menawarkan sempol, jasuke, souvenir hampers, pouch custom, serta sembako dengan harga kompetitif.",
  },
];

export default function LegacyArtikel() {
  return (
    <article className="bg-cream">
      <div className="relative">
        <ImageSlider
          images={heroSlides}
          className="h-[40vh] md:h-[55vh] min-h-[280px] md:min-h-[400px]"
          overlay={
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          }
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-4xl mx-auto z-10">
          <span className="inline-block px-3 py-1 mb-3 bg-forest text-white text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full">
            UMKM Kemayoran
          </span>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Potensi UMKM Kemayoran: Dari Camilan Rumahan hingga Kerajinan Tangan
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-8 md:-mt-12 relative z-10 pb-12 md:pb-16">
        <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-warm-gray mb-6 pb-6 border-b border-cream-warm">
            <span className="flex items-center gap-1">
              <Icon name="calendar" size={14} /> 28 Juli 2026
            </span>
            <span className="flex items-center gap-1">
              <Icon name="user" size={14} /> Tim Pengelola
            </span>
            <span className="flex items-center gap-1">
              <Icon name="eye" size={14} /> 5 menit baca
            </span>
          </div>

          <p className="text-base md:text-lg font-medium text-noir leading-relaxed mb-10">
            Kemayoran, wilayah di Kecamatan Gunung Putri, Kabupaten Bogor,
            menyimpan potensi besar dalam sektor UMKM. Beragam produk mulai dari
            camilan tradisional hingga kerajinan tangan berkualitas telah
            diproduksi oleh warga setempat dan siap menjangkau pasar yang lebih
            luas.
          </p>

          <div className="space-y-10 md:space-y-14">
            {sections.map((section, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row gap-6 md:gap-8 items-start"
              >
                <div className="w-full md:w-1/2">
                  <div className="rounded-xl md:rounded-2xl overflow-hidden bg-cream-warm">
                    <img
                      src={section.image}
                      alt={section.caption}
                      className="w-full aspect-[4/3] object-cover"
                    />
                  </div>
                  <p className="text-[11px] md:text-xs text-warm-gray mt-2 leading-relaxed italic border-l-2 border-forest/30 pl-3">
                    {section.caption}
                  </p>
                </div>
                <div className="w-full md:w-1/2">
                  <h2 className="text-base md:text-lg font-bold text-noir mb-3 leading-snug">
                    {section.title}
                  </h2>
                  <p className="text-sm md:text-base text-cool-gray leading-relaxed mb-4">
                    {section.body}
                  </p>
                  <div className="space-y-1.5">
                    {section.details.map((d, j) => (
                      <div key={j} className="flex text-xs md:text-sm">
                        <span className="font-semibold text-noir shrink-0 w-20 md:w-24">
                          {d.label}
                        </span>
                        <span className="text-warm-gray">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mt-10 pt-6 border-t border-cream-warm">
            {[
              {
                icon: "store",
                label: "25+ Produk",
                desc: "Bermacam produk UMKM siap dipesan",
              },
              {
                icon: "whatsapp",
                label: "Pesan via WA",
                desc: "Langsung hubungi penjual",
              },
              {
                icon: "users",
                label: "5 UMKM Aktif",
                desc: "Terus bertambah setiap bulan",
              },
              {
                icon: "mapPin",
                label: "Kemayoran",
                desc: "Gunung Putri, Kabupaten Bogor",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 md:p-4 bg-cream rounded-xl"
              >
                <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-forest/10 text-forest flex items-center justify-center shrink-0">
                  <Icon name={item.icon} size={16} />
                </span>
                <div>
                  <div className="text-sm md:text-base font-bold text-noir">
                    {item.label}
                  </div>
                  <div className="text-xs md:text-sm text-warm-gray">
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-cream-warm text-center">
            <p className="text-sm text-warm-gray mb-4">
              Tertarik menjelajahi produk UMKM Kemayoran?
            </p>
            <Link href="/catalog" className="btn-primary text-sm md:text-base">
              Jelajahi Katalog <Icon name="arrowRight" size={14} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
