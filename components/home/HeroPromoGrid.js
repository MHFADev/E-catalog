import Link from "next/link";
import Icon from "@/components/common/Icon";

export default function HeroPromoGrid({ banners = [] }) {
  const items = banners.slice(0, 2);

  if (!items.length) return null;

  return (
    <div className="hero-promo-grid mt-6 grid grid-cols-1 gap-4 sm:mt-7 sm:grid-cols-2 lg:mt-8 lg:col-span-12 lg:gap-6">
      {items.map((banner, index) => {
        const content = (
          <div className="hero-promo relative min-h-[13.5rem] overflow-hidden rounded-[1.35rem] border border-forest/15 bg-white shadow-[0_16px_30px_rgba(16,72,46,0.08)] transition duration-300 ease-out sm:min-h-[15.5rem] sm:rounded-[1.75rem] hover:-translate-y-1 hover:shadow-[0_22px_38px_rgba(16,72,46,0.14)]">
            <img
              src={banner.imageUrl}
              alt={banner.title || `Pilihan UMKM Kemayoran ${index + 1}`}
              className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
              loading={index === 0 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B3442]/90 via-[#123F4A]/58 to-transparent sm:from-[#0B3442]/84 sm:via-[#123F4A]/38 sm:to-transparent" />
            <div className="relative z-[1] flex h-full max-w-[19rem] flex-col items-start justify-end p-5 text-white sm:p-7">
              <span className="mb-2 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#D9F0BF]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F1C37A]" />
                {index === 0 ? "Produk lokal" : "Bersama kita maju"}
              </span>
              <h2 className="line-clamp-2 text-xl font-extrabold leading-[1.08] tracking-tight sm:text-2xl">
                {banner.title || "Cerita pilihan UMKM Kemayoran"}
              </h2>
              <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-white/90 transition-colors group-hover:text-[#D9F0BF]">
                {banner.link ? "Lihat pilihan" : "Pilihan minggu ini"}
                {banner.link && <Icon name="arrowRight" size={13} />}
              </span>
            </div>
          </div>
        );

        return banner.link ? (
          <Link
            key={banner.id}
            href={banner.link}
            className="group block min-w-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-soft focus-visible:ring-offset-4 focus-visible:ring-offset-cream"
          >
            {content}
          </Link>
        ) : (
          <div key={banner.id} className="group min-w-0">
            {content}
          </div>
        );
      })}
    </div>
  );
}
