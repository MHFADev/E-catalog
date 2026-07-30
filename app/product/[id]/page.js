import { notFound } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/common/Icon";
import { generateWhatsAppLink } from "@/lib/generateWhatsAppLink";
import { WHATSAPP_PREFILL } from "@/lib/constants";
import products from "@/data/products.json";
import sellers from "@/data/sellers.json";
import categories from "@/data/categories.json";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  const seller = product
    ? sellers.find((s) => s.id === product.sellerId)
    : null;
  const category = product
    ? categories.find((c) => c.id === product.categoryId)
    : null;

  if (!product) notFound();

  const waLink = generateWhatsAppLink(
    seller.whatsapp,
    WHATSAPP_PREFILL(seller.name, product.name),
  );

  return (
    <div className="bg-cotton min-h-screen">
      <div className="relative h-[30vh] md:h-[40vh] min-h-[200px] md:min-h-[300px] overflow-hidden bg-gradient-to-br from-maroon to-cherry-deep flex items-center justify-center text-cotton">
        <Icon name="image" size={48} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative -mt-12 md:-mt-16 z-10 pb-12 md:pb-16">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1 px-3 md:px-4 py-1.5 md:py-2 mb-3 md:mb-4 bg-white/70 backdrop-blur-md border border-white/30 rounded-full text-xs md:text-sm font-medium text-noir-soft hover:bg-white hover:-translate-x-1 transition-all"
          >
            ← Kembali
          </Link>

          <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-10 shadow-sm">
            <div className="font-mono text-[10px] md:text-xs uppercase tracking-wider text-cherry mb-1.5 md:mb-2">
              {category?.name}
            </div>
            <div className="flex gap-1.5 mb-2 md:mb-3">
              <span className="w-[49px] h-[49px] rounded-md overflow-hidden bg-cotton-warm flex items-center justify-center">
                <img
                  src="/assets/badges/halal.png"
                  alt="Halal"
                  className="w-full h-full object-contain"
                />
              </span>
              <span className="w-[49px] h-[49px] rounded-md overflow-hidden bg-cotton-warm flex items-center justify-center">
                <img
                  src="/assets/badges/cinta-indonesia.png"
                  alt="Cinta Indonesia"
                  className="w-full h-full object-contain"
                />
              </span>
            </div>
            <h1 className="text-xl md:text-3xl lg:text-4xl font-bold tracking-tight text-noir mb-1 md:mb-2">
              {product.name}
            </h1>
            <div className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-cherry bg-cherry/5 rounded-full px-3 py-1 w-fit mb-3 md:mb-4">
              <Icon name="whatsapp" size={12} /> Hubungi penjual untuk informasi harga & pembayaran
            </div>
            <p className="text-sm md:text-base leading-relaxed text-cool-gray mb-4 md:mb-6">
              {product.description}
            </p>

            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4 md:mb-6">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[10px] md:text-xs px-2 md:px-2.5 py-1 bg-cherry/10 text-cherry rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-3 p-3 md:p-4 bg-cotton-warm rounded-xl md:rounded-2xl mb-4 md:mb-6">
              <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-cherry/10 flex items-center justify-center shrink-0 text-cherry">
                <Icon name="store" size={18} />
              </span>
              <div className="min-w-0">
                <div className="font-semibold text-sm md:text-base truncate">
                  {seller.name}
                </div>
                {seller.owner && (
                  <div className="text-xs md:text-sm text-warm-gray truncate">
                    Pemilik: {seller.owner}
                  </div>
                )}
                <div className="text-xs md:text-sm text-warm-gray line-clamp-2">
                  {seller.address}
                </div>
              </div>
            </div>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block no-underline"
            >
              <button className="btn-primary w-full text-sm md:text-base py-2.5 md:py-3 mb-1.5 md:mb-2">
                <Icon name="whatsapp" size={16} /> Hubungi Penjual via WhatsApp
              </button>
            </a>

            {seller.whatsappAlt && (
              <a
                href={generateWhatsAppLink(
                  seller.whatsappAlt,
                  WHATSAPP_PREFILL(seller.name, product.name),
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="block no-underline"
              >
                <button className="btn-secondary w-full text-sm md:text-base py-2.5 md:py-3">
                  Kontak Alternatif
                </button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
