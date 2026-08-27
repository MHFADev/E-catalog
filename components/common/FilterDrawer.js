"use client";
import { useEffect } from "react";
import Icon from "@/components/common/Icon";
import CategoryVisualIcon from "@/components/category/CategoryVisualIcon";

function DrawerOption({ label, count, active, onClick, category }) {

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
        active
          ? "bg-forest text-white font-semibold shadow-sm"
          : "bg-white text-noir-soft hover:bg-forest/5 hover:text-forest"
      }`}
    >
            <span className="flex min-w-0 items-center gap-2.5">
        {category && (
                      <span className={`category-icon-frame flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl p-1 ${active ? "bg-white/95 shadow-sm" : "bg-[#FFF8EC] border border-cream-warm/70"}`}>
              <CategoryVisualIcon
                category={category}
                className="category-icon-art block h-full w-full drop-shadow-[0_1px_1px_rgba(80,44,18,0.16)]"
                fallbackSize={18}
              />
            </span>

        )}
        <span className="truncate">{label}</span>
      </span>

      <span
        className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${
          active ? "bg-white/20 text-white" : "bg-cream-pure text-warm-gray"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function DrawerSection({ title, children }) {
  return (
    <div>
      <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider font-bold text-noir-soft mb-3">
        <span className="w-0.5 h-3 bg-forest rounded-sm" /> {title}
      </label>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

export default function FilterDrawer({
  open,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
  sellerId,
  onSellerId,
  sellers,
  preOrder = "all",
  onPreOrder,
  halal = "all",
  onHalal,
  counts = {},
  totalProducts = 0,
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] bg-cream rounded-t-3xl overflow-y-auto animate-slideUp">
        <div className="sticky top-0 bg-cream z-10 flex items-center justify-between px-5 pt-5 pb-3 border-b border-cream-warm">
          <h2 className="text-base font-bold tracking-tight">Filter</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-cream-warm flex items-center justify-center text-noir-soft"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <DrawerSection title="Kategori">
            <DrawerOption
              label="Semua Kategori"
              count={totalProducts}
              active={!selectedCategory}
              onClick={() => onSelectCategory(null)}
            />
            {categories.map((cat) => (
              <DrawerOption
                key={cat.id}
                label={cat.name}
                count={counts.categories?.[cat.id] ?? 0}
                                active={selectedCategory === cat.id}
                category={cat}
                onClick={() => onSelectCategory(selectedCategory === cat.id ? null : cat.id)}

              />
            ))}
          </DrawerSection>

          <DrawerSection title="Status Produk">
            <DrawerOption
              label="Semua"
              count={totalProducts}
              active={preOrder === "all"}
              onClick={() => onPreOrder("all")}
            />
            <DrawerOption
              label="Pre-Order (PO)"
              count={counts.po ?? 0}
              active={preOrder === "po"}
              onClick={() => onPreOrder("po")}
            />
            <DrawerOption
              label="Ready Stock"
              count={counts.ready ?? 0}
              active={preOrder === "ready"}
              onClick={() => onPreOrder("ready")}
            />
          </DrawerSection>

          <DrawerSection title="Kehalalan">
            <DrawerOption
              label="Semua"
              count={totalProducts}
              active={halal === "all"}
              onClick={() => onHalal("all")}
            />
            <DrawerOption
              label="Halal"
              count={counts.halal ?? 0}
              active={halal === "halal"}
              onClick={() => onHalal("halal")}
            />
            <DrawerOption
              label="Non-Halal"
              count={counts.nonHalal ?? 0}
              active={halal === "non_halal"}
              onClick={() => onHalal("non_halal")}
            />
          </DrawerSection>

          <DrawerSection title="Toko">
            <DrawerOption
              label="Semua Toko"
              count={totalProducts}
              active={sellerId === "all"}
              onClick={() => onSellerId("all")}
            />
            {sellers.map((s) => (
              <DrawerOption
                key={s.id}
                label={s.name}
                count={counts.sellers?.[s.id] ?? 0}
                active={sellerId === s.id}
                onClick={() => onSellerId(sellerId === s.id ? "all" : s.id)}
              />
            ))}
          </DrawerSection>
        </div>

        <div className="sticky bottom-0 bg-cream border-t border-cream-warm p-5">
          <button
            onClick={onClose}
            className="w-full py-3 bg-forest text-white font-semibold rounded-full text-sm shadow-md"
          >
            Lihat Hasil
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}