"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SearchBar from "@/components/common/SearchBar";
import { SkeletonGrid } from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";
import CategoryChip from "@/components/category/CategoryChip";
import ProductGrid from "@/components/product/ProductGrid";
import FilterDrawer from "@/components/common/FilterDrawer";
import Icon from "@/components/common/Icon";
import { useDebounce } from "@/lib/useDebounce";
import { useProductFilter } from "@/lib/useProductFilter";

export default function CatalogContent({ categories, productsData, sellersData }) {
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || null,
  );
  const [sellerId, setSellerId] = useState("all");
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  // [LIHAT LEBIH BANYAK] Jumlah produk awal yang ditampilkan (sampai produk ke-18).
  const [visibleCount, setVisibleCount] = useState(18);
  const catScrollRef = useRef(null);

  // [LIHAT LEBIH SEDIKIT] Setiap reload/reset halaman, kembalikan tampilan ke
  // jumlah awal (18) sehingga tombol "Lihat Lebih Banyak" muncul lagi.
  useEffect(() => {
    setVisibleCount(18);
  }, []);

  const scrollCat = (dir) => {
    if (catScrollRef.current) {
      catScrollRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' })
    }
  }

  const debouncedSearch = useDebounce(searchInput, 200);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) => {
        return (
          productsData.filter((p) => p.categoryId === b.id).length -
          productsData.filter((p) => p.categoryId === a.id).length
        );
      }),
    [categories, productsData],
  );

  const visibleCategories = sortedCategories.slice(0, 3);
  const hasActiveFilter = selectedCategory || sellerId !== "all";

  const enriched = useMemo(
    () =>
      productsData
        .map((p) => ({
          ...p,
          sellerName: sellersData.find((s) => s.id === p.sellerId)?.name || "",
        }))
        .sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return 0;
        }),
    [productsData, sellersData],
  );

  const filtered = useProductFilter(enriched, sellersData, {
    search: debouncedSearch,
    categoryIds: selectedCategory ? [selectedCategory] : [],
    sellerId,
  });

  // [LIHAT LEBIH BANYAK] Potong daftar sesuai jumlah yang tampil saat ini.
  const visibleProducts = filtered.slice(0, visibleCount);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
      <div className="mb-5 md:mb-8">
        <h1 className="text-xl md:text-3xl lg:text-4xl font-bold tracking-tight">
          Katalog <span className="text-forest">Produk</span>
        </h1>
      </div>

      <div className="mb-4 md:mb-8">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Cari produk atau UMKM..."
        />
      </div>

      {/* [MOBILE FILTER] Scroll horizontal untuk kategori + tombol filter */}
      <div className="md:hidden flex items-center gap-2 mb-4">
        <button onClick={() => scrollCat(-1)} className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-cream-warm shadow-sm shrink-0 text-noir-soft hover:text-forest transition-all">
          <Icon name="chevronLeft" size={16} />
        </button>
        <div ref={catScrollRef} className="flex-1 flex gap-2 overflow-x-auto scrollbar-thin py-1 scroll-smooth">
          {sortedCategories.map((cat) => (
            <CategoryChip
              key={cat.id}
              category={cat}
              active={selectedCategory === cat.id}
              onClick={setSelectedCategory}
            />
          ))}
          <button
            onClick={() => setFilterOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border transition-all shrink-0 ${
              hasActiveFilter
                ? "bg-forest text-white border-forest shadow-sm"
                : "bg-cream-pure text-noir-soft border-cream-warm"
            }`}
          >
            <Icon name="filter" size={14} />
            Filter
            {hasActiveFilter && (
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </button>
        </div>
        <button onClick={() => scrollCat(1)} className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-cream-warm shadow-sm shrink-0 text-noir-soft hover:text-forest transition-all">
          <Icon name="chevronRight" size={16} />
        </button>
      </div>

      <div className="hidden md:block">
        <div className="flex flex-wrap gap-3 mb-8">
          {sortedCategories.map((cat) => (
            <CategoryChip
              key={cat.id}
              category={cat}
              active={selectedCategory === cat.id}
              onClick={setSelectedCategory}
            />
          ))}
        </div>
      </div>

      <div className="hidden md:block bg-white rounded-3xl p-8 mb-8 shadow-sm border border-cream-warm">
        <div className="flex flex-wrap gap-12 items-start">
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-bold text-noir-soft">
              <span className="w-0.5 h-3.5 bg-forest rounded-sm" /> Toko
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${
                  sellerId === "all"
                    ? "bg-gradient-to-br from-forest to-forest-deep border-forest-deep text-white shadow-md"
                    : "bg-cream-pure border-cream-warm text-noir-soft hover:border-forest hover:text-forest hover:bg-forest/5 hover:-translate-y-0.5"
                }`}
                onClick={() => setSellerId("all")}
              >
                Semua Toko
              </button>
              {sellersData.map((s) => (
                <button
                  key={s.id}
                  className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${
                    sellerId === s.id
                      ? "bg-gradient-to-br from-forest to-forest-deep border-forest-deep text-white shadow-md"
                      : "bg-cream-pure border-cream-warm text-noir-soft hover:border-forest hover:text-forest hover:bg-forest/5 hover:-translate-y-0.5"
                  }`}
                  onClick={() => setSellerId(sellerId === s.id ? "all" : s.id)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="font-mono text-[10px] md:text-xs text-warm-gray tracking-wider mb-4 md:mb-6">
        {loading ? "Memuat..." : `${filtered.length} produk ditemukan`}
      </p>

      {loading ? (
        <SkeletonGrid count={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Produk tidak ditemukan"
          description="Coba ubah kata kunci pencarian, pilih kategori lain, atau atur ulang filter."
        />
      ) : (
        <ProductGrid products={visibleProducts} categories={categories} />
      )}

      {/* [LIHAT LEBIH BANYAK] Tombol muncul bila masih ada produk tersembunyi */}
      {!loading && filtered.length > visibleCount && (
        <div className="flex justify-center mt-8 md:mt-12">
          <button
            onClick={() => setVisibleCount(filtered.length)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-cotton-warm text-sm font-semibold text-noir-soft hover:border-cherry hover:text-cherry hover:-translate-y-0.5 transition-all"
          >
            Lihat Lebih Banyak ({filtered.length - visibleCount} produk lagi)
          </button>
        </div>
      )}

      {/* [LIHAT LEBIH SEDIKIT] Tombol muncul saat semua produk sudah tampil,
          untuk menutup kembali ke jumlah awal (18). */}
      {!loading && filtered.length > 18 && visibleCount >= filtered.length && (
        <div className="flex justify-center mt-8 md:mt-12">
          <button
            onClick={() => setVisibleCount(18)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-cotton-warm text-sm font-semibold text-noir-soft hover:border-cherry hover:text-cherry hover:-translate-y-0.5 transition-all"
          >
            Lihat Lebih Sedikit
          </button>
        </div>
      )}

      {/* Scrollbar style untuk mobile filter */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar { height: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: #F3EDDF; border-radius: 2px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #1E7A3D; border-radius: 2px; }
      `}</style>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        categories={sortedCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        sellerId={sellerId}
        onSellerId={setSellerId}
        sellers={sellersData}
      />
    </div>
  );
}
