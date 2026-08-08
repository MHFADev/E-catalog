import PartnerLogo from "./PartnerLogo";

// Daftar mitra — simpan file logo di public/images/logos/.
// Nama file mengikuti aturan: logo-ssr.png & logo-as-works.png (atau .svg).
export const PARTNERS = [
  {
    src: "/images/logos/logo-ssr.png",
    name: "Politeknik Sains Seni Rekakreasi (SSR)",
    initials: "SSR",
  },
  {
    src: "/images/logos/logo-as-works.png",
    name: "AS Works",
    initials: "AS",
  },
];

// ================================================================
// Komponen logo mitra — modular untuk beberapa penempatan:
//   variant "navbar"  → di samping logo utama (hanya desktop, kecil)
//   variant "hero"    → di bawah CTA hero (chip glass agar terbaca di video)
//   variant "section" → section mitra terpisah (di atas statistik)
//   variant "footer"  → di footer (kecil, samping deskripsi)
// ================================================================
export default function PartnerLogos({
  variant = "hero",
  label,
  className = "",
}) {
  const styles = {
    navbar: {
      wrap: "hidden md:flex items-center gap-3",
      tile: "h-8 w-auto shrink-0",
      img: "h-full max-h-[34px]",
    },
    hero: {
      wrap: "flex flex-wrap items-center gap-3 md:gap-5",
      tile: "h-14 md:h-16 px-3 py-1.5 inline-flex items-center rounded-xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 opacity-90 hover:opacity-100 transition-opacity",
      img: "h-10 md:h-12 max-h-[48px]",
    },
    section: {
      wrap: "flex flex-wrap items-center justify-center gap-8 md:gap-12",
      tile: "h-14 md:h-[68px] w-auto opacity-80 hover:opacity-100 transition-opacity grayscale hover:grayscale-0",
      img: "h-full max-h-[68px]",
    },
    footer: {
      wrap: "flex items-center gap-5",
      tile: "h-9 md:h-10 w-auto opacity-90 hover:opacity-100 transition-opacity",
      img: "h-full max-h-[38px]",
    },
  }[variant] || { wrap: "flex items-center gap-4", tile: "h-9 w-auto", img: "h-full" };

  return (
    <div className={`${styles.wrap} ${className}`}>
      {PARTNERS.map((logo) => (
        <PartnerLogo
          key={logo.src}
          logo={logo}
          tileClassName={styles.tile}
          imgClassName={styles.img}
        />
      ))}
    </div>
  );
}