import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/common/Icon";

function PromoContent({ banner, priority }) {
  const hasMeta = Boolean(banner.title || banner.link);

  return (
    <>
      <div className="relative min-h-[9.5rem] overflow-hidden bg-cream-warm sm:min-h-[11rem] lg:min-h-[12rem]">
        <Image
          src={banner.imageUrl}
          alt={banner.title || "Promo UMKM Kemayoran"}
          fill
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          sizes="(max-width: 767px) 100vw, 50vw"
          className="object-cover object-center transition-transform duration-200 group-hover:scale-[1.015] motion-reduce:transition-none"
        />
      </div>
      {hasMeta && (
        <div className="flex min-w-0 items-center justify-between gap-4 border-t border-hutan/10 bg-white px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-forest">
              Pilihan UMKM
            </p>
            {banner.title && (
              <h2 className="line-clamp-2 text-base font-bold leading-snug text-hutan sm:text-lg">
                {banner.title}
              </h2>
            )}
          </div>
          {banner.link && (
            <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-forest/20 text-forest transition-colors duration-200 group-hover:border-forest group-hover:bg-forest group-hover:text-white">
              <Icon name="arrowRight" size={15} />
            </span>
          )}
        </div>
      )}
    </>
  );
}

export default function HeroPromoGrid({ banners = [] }) {
  const items = banners.slice(0, 2);
  if (!items.length) return null;

  return (
    <div className="mt-5 grid gap-4 border-t border-hutan/10 pt-5 sm:grid-cols-2 sm:gap-5 sm:pt-6 lg:mt-6">
      {items.map((banner, index) => {
        const className =
          "group overflow-hidden rounded-[1.25rem] border border-hutan/10 bg-white shadow-[0_8px_24px_rgba(18,63,74,0.08)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-forest/25 hover:shadow-[0_12px_28px_rgba(18,63,74,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none sm:rounded-[1.5rem]";

        return banner.link ? (
          <Link
            key={banner.id}
            href={banner.link}
            className={className}
            aria-label={banner.title ? `Buka ${banner.title}` : `Buka promo ${index + 1}`}
          >
            <PromoContent banner={banner} priority={index === 0} />
          </Link>
        ) : (
          <article key={banner.id} className={className}>
            <PromoContent banner={banner} priority={index === 0} />
          </article>
        );
      })}
    </div>
  );
}
