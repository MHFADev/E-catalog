"use client";
import { useState } from "react";
import ProductCard from "./ProductCard";
import Icon from "@/components/common/Icon";

// Ambil data kategori berdasarkan id (sama seperti ProductGrid)
function getCat(categories, id) {
  return categories.find((c) => c.id === id);
}

export default function FeaturedProducts({ products, categories }) {
  // expanded = tombol "Lihat Semua" (mobile) sudah ditekan atau belum
  const [expanded, setExpanded] = useState(false);

  // Di mobile, hanya 4 produk pertama yang tampil saat kondisi "dilipat".
  // Produk sisanya (ke-5 s/d ke-8) baru muncul setelah "Lihat Semua".
  const MOBILE_VISIBLE = 4;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((p, i) => {
          // Produk "tambahan" = mulai index ke-4 (produk ke-5 dst)
          const isExtra = i >= MOBILE_VISIBLE;
          // Di mobile: produk tambahan disembunyikan (hidden) sampai diperluas.
          // Di desktop (md+): semua produk selalu tampil (md:block).
          const collapsedMobile = isExtra && !expanded;
          return (
            <div
              key={p.id}
              className={collapsedMobile ? "hidden md:block" : "block"}
              style={
                isExtra && expanded
                  ? // delay bertahap agar kartu muncul beruntun satu per satu
                    { animationDelay: `${(i - MOBILE_VISIBLE) * 90}ms` }
                  : undefined
              }
            >
              {/* Saat diperluas, kartu tambahan diberi animasi fade-in-up */}
              <div
                className={
                  isExtra && expanded ? "fade-in-up h-full" : "h-full"
                }
              >
                <ProductCard
                  product={p}
                  category={getCat(categories, p.categoryId)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tombol toggle hanya muncul di mobile (<sm) dan hanya jika memang
          ada produk tambahan. Saat diperluas berubah jadi
          "Lihat Lebih Sedikit" dengan panah ke atas. */}
      {products.length > MOBILE_VISIBLE && (
        <div className="mt-6 flex justify-center sm:hidden">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-forest text-xs font-bold border border-forest/30 shadow-card hover:bg-forest hover:text-white transition-all duration-300 active:scale-95"
          >
            {expanded ? (
              <>
                Lihat Lebih Sedikit <Icon name="chevronUp" size={14} />
              </>
            ) : (
              <>
                Lihat Semua <Icon name="chevronDown" size={14} />
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}
