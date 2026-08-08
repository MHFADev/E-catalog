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
import { filterProducts } from "@/lib/useProductFilter";

function SidebarSection({ title, children }) {
  return (
    <div className="pb-5 mb-5 border-b border-cream-warm last:border-0 last:mb-0 last:pb-0">
      <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider font-bold text-noir-soft mb-3">
        <span className="w-0.5 h-3.5 bg-forest rounded-sm" /> {title}
      </label>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function SidebarOption({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-sm transition-all ${
        active
          ? "bg-forest text-white font-semibold shadow-sm"
          : "bg-cream-pure text-noir-soft hover:bg-forest/5 hover:text-forest"
      }`}
    >
      <span className="truncate">{label}</span>
      <span
        className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${
          active ? "bg-white/20 text-white" : "bg-white text-warm-gray border border-cream-warm"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

export default function CatalogContent({ categories, productsData, sellersData }) {
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || null,
  );
  const [sellerId, setSellerId] = useState("all");
  const [preOrder, setPreOrder] = useState("all");
  const [halal, setHalal] = useState("all");
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  // [LIHAT LEBIH BANYAK] Jumlah produk awal yang ditampilkan (sampai produk ke-18).
  const INITIAL_VISIBLE = 18;
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  // [LIHAT LEBIH BANYAK] Jumlah kolom grid mengikuti breakpoint layar:
  // 2 kolom di mobile, 3 di tablet (md), 4 di desktop (lg) — lihat ProductGrid.
  const [columns, setColumns] = useState(2);
  const catScrollRef = useRef(null);
  const productsRef = useRef(null);

  useEffect(() => {
    const mqTablet = window.matchMedia("(min-width: 768px)");
    const mqDesktop = window.matchMedia("(min-width: 1024px)");
    const updateColumns = () => {
      if (mqDesktop.matches) setColumns(4);
      else if (mqTablet.matches) setColumns(3);
      else setColumns(2);
    };
    updateColumns();
    mqTablet.addEventListener("change", updateColumns);
    mqDesktop.addEventListener("change", updateColumns);
    return () => {
      mqTablet.removeEventListener("change", updateColumns);
      mqDesktop.removeEventListener("change", updateColumns);
    };
  }, []);

  // Sinkronkan pencarian dari URL (mis. navbar search) ke state lokal.
  useEffect(() => {
    setSearchInput(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || null);
  }, [searchParams]);

  const scrollCat = (dir) => {
    if (catScrollRef.current) {
      catScrollRef.current.scrollBy({ left: dir * 200, behavior: "smooth" });
    }
  };

  const debouncedSearch = useDebounce(searchInput, 200);

  // [LIHAT LEBIH BANYAK] Saat filter/pencarian berubah, kembalikan ke jumlah awal.
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [debouncedSearch, selectedCategory, sellerId, preOrder, halal]);

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

  const hasActiveFilter =
    selectedCategory || sellerId !== "all" || preOrder !== "all" || halal !== "all";

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

  const baseOpts = useMemo(
    () => ({
      search: debouncedSearch,
      categoryIds: selectedCategory ? [selectedCategory] : [],
      sellerId,
      preOrder,
      halal,
    }),
    [debouncedSearch, selectedCategory, sellerId, preOrder, halal],
  );

  const filtered = useMemo(
    () => filterProducts(enriched, sellersData, baseOpts),
    [enriched, sellersData, baseOpts],
  );

  // ==== Hitungan produk per opsi filter (untuk sidebar) ====
  const counts = useMemo(() => {
    const when = (patch) => filterProducts(enriched, sellersData, { ...baseOpts, ...patch }).length;
    const categories = {};
    for (const c of sortedCategories) categories[c.id] = when({ categoryIds: [c.id] });

    const sellers = {};
    for (const s of sellersData) sellers[s.id] = when({ sellerId: s.id });

    return {
      categories,
      sellers,
      po: when({ preOrder: "po" }),
      ready: when({ preOrder: "ready" }),
      halal: when({ halal: "halal" }),
      nonHalal: when({ halal: "non_halal" }),
    };
  }, [enriched, sellersData, baseOpts, sortedCategories]);

  const visibleProducts = filtered.slice(0, visibleCount);

  const ROWS_PER_CLICK = 2;
  const stepPerClick = columns * ROWS_PER_CLICK;

  const showMore = () => {
    setVisibleCount((prev) => Math.min(prev + stepPerClick, filtered.length));
  };

  const showLess = () => {
    setVisibleCount(INITIAL_VISIBLE);
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetFilters = () => {
    setSelectedCategory(null);
    setSellerId("all");
    setPreOrder("all");
    setHalal("all");
  };

  const filterOptions = {
    po: [
      { value: "all", label: "Semua" },
      { value: "po", label: "Pre-Order (PO)", count: counts.po },
      { value: "ready", label: "Ready Stock", count: counts.ready },
    ],
    halal: [
      { value: "all", label: "Semua" },
      { value: "halal", label: "Halal", count: counts.halal },
      { value: "non_halal", label: "Non-Halal", count: counts.nonHalal },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 pb-28 md:pb-0">
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

      {/* [MOBILE FILTER] Scroll horizontal kategori saja — tombol filter di bottom bar */}
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
        </div>
        <button onClick={() => scrollCat(1)} className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-cream-warm shadow-sm shrink-0 text-noir-soft hover:text-forest transition-all">
          <Icon name="chevronRight" size={16} />
        </button>
      </div>

      {/* ===== Layout: sidebar filter kiri (desktop) + daftar produk ===== */}
      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:items-start">
        {/* Sidebar (hidden on mobile; pakai FilterDrawer di mobile) */}
        <aside className="hidden lg:block lg:sticky lg:top-24">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-cream-warm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm md:text-base font-bold tracking-tight">
                Filter Produk
              </h2>
              {hasActiveFilter && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] md:text-xs font-semibold text-forest hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            <SidebarSection title="Kategori">
              <SidebarOption
                label="Semua Kategori"
                count={enriched.length}
                active={!selectedCategory}
                onClick={() => setSelectedCategory(null)}
              />
              {sortedCategories.map((cat) => (
                <SidebarOption
                  key={cat.id}
                  label={cat.name}
                  count={counts.categories[cat.id] ?? 0}
                  active={selectedCategory === cat.id}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
                  }
                />
              ))}
            </SidebarSection>

            <SidebarSection title="Status Produk">
              {filterOptions.po.map((opt) => (
                <SidebarOption
                  key={opt.value}
                  label={opt.label}
                  count={opt.count}
                  active={preOrder === opt.value}
                  onClick={() => setPreOrder(opt.value)}
                />
              ))}
            </SidebarSection>

            <SidebarSection title="Kehalalan">
              {filterOptions.halal.map((opt) => (
                <SidebarOption
                  key={opt.value}
                  label={opt.label}
                  count={opt.count}
                  active={halal === opt.value}
                  onClick={() => setHalal(opt.value)}
                />
              ))}
            </SidebarSection>

            {sellersData.length > 0 && (
              <SidebarSection title="Toko">
                <SidebarOption
                  label="Semua Toko"
                  count={enriched.length}
                  active={sellerId === "all"}
                  onClick={() => setSellerId("all")}
                />
                {sellersData.map((s) => (
                  <SidebarOption
                    key={s.id}
                    label={s.name}
                    count={counts.sellers[s.id] ?? 0}
                    active={sellerId === s.id}
                    onClick={() => setSellerId(sellerId === s.id ? "all" : s.id)}
                  />
                ))}
              </SidebarSection>
            )}
          </div>
        </aside>

        {/* Daftar produk */}
        <div className="min-w-0">
          <div ref={productsRef} className="scroll-mt-24">
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
          </div>

          {!loading && filtered.length > visibleCount && (
            <div className="flex justify-center mt-8 md:mt-12">
              <button
                onClick={showMore}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-cream-warm text-sm font-semibold text-noir-soft hover:border-forest hover:text-forest hover:-translate-y-0.5 transition-all"
              >
                Lihat Lebih Banyak ({filtered.length - visibleCount})
                <Icon name="chevronDown" size={16} />
              </button>
            </div>
          )}

          {!loading && filtered.length > INITIAL_VISIBLE && visibleCount >= filtered.length && (
            <div className="flex justify-center mt-8 md:mt-12">
              <button
                onClick={showLess}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-cream-warm text-sm font-semibold text-noir-soft hover:border-forest hover:text-forest hover:-translate-y-0.5 transition-all"
              >
                <Icon name="chevronUp" size={16} />
                Lihat Lebih Sedikit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scrollbar style untuk mobile filter */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar { height: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: #F3EDDF; border-radius: 2px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #1E7A3D; border-radius: 2px; }
      `}</style>

      {/* [MOBILE] Bottom bar filter — tetap terlihat tanpa scroll */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-cream-warm px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <button
          onClick={() => setFilterOpen(true)}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-all shadow-lg ${
            hasActiveFilter
              ? "bg-forest text-white shadow-forest/25"
              : "bg-forest text-white shadow-forest/25"
          }`}
        >
          <Icon name="filter" size={16} />
          Filter
          {hasActiveFilter && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-white/25 rounded-full">
              {(() => {
                let n = 0;
                if (selectedCategory) n++;
                if (sellerId !== "all") n++;
                if (preOrder !== "all") n++;
                if (halal !== "all") n++;
                return n;
              })()}
            </span>
          )}
        </button>
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        categories={sortedCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        sellerId={sellerId}
        onSellerId={setSellerId}
        sellers={sellersData}
        preOrder={preOrder}
        onPreOrder={setPreOrder}
        halal={halal}
        onHalal={setHalal}
        counts={counts}
        totalProducts={enriched.length}
      />
    </div>
  );
}