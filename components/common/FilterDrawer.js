"use client";
import { useEffect } from "react";
import Icon from "@/components/common/Icon";
import CategoryChip from "@/components/category/CategoryChip";

export default function FilterDrawer({
  open,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
  sellerId,
  onSellerId,
  sellers,
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
      <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] bg-cotton rounded-t-3xl overflow-y-auto animate-slideUp">
        <div className="sticky top-0 bg-cotton z-10 flex items-center justify-between px-5 pt-5 pb-3 border-b border-cotton-warm">
          <h2 className="text-base font-bold tracking-tight">Filter</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-cotton-warm flex items-center justify-center text-noir-soft"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div>
            <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider font-bold text-noir-soft mb-3">
              <span className="w-0.5 h-3 bg-cherry rounded-sm" /> Kategori
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <CategoryChip
                  key={cat.id}
                  category={cat}
                  active={selectedCategory === cat.id}
                  onClick={onSelectCategory}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider font-bold text-noir-soft mb-3">
              <span className="w-0.5 h-3 bg-cherry rounded-sm" /> Toko
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${
                  sellerId === "all"
                    ? "bg-gradient-to-br from-cherry to-cherry-deep border-cherry-deep text-white shadow-md"
                    : "bg-white border-cotton-warm text-noir-soft hover:border-cherry hover:text-cherry"
                }`}
                onClick={() => onSellerId("all")}
              >
                Semua Toko
              </button>
              {sellers.map((s) => (
                <button
                  key={s.id}
                  className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${
                    sellerId === s.id
                      ? "bg-gradient-to-br from-cherry to-cherry-deep border-cherry-deep text-white shadow-md"
                      : "bg-white border-cotton-warm text-noir-soft hover:border-cherry hover:text-cherry"
                  }`}
                  onClick={() => onSellerId(sellerId === s.id ? "all" : s.id)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-cotton border-t border-cotton-warm p-5">
          <button
            onClick={onClose}
            className="w-full py-3 bg-cherry text-white font-semibold rounded-full text-sm shadow-md"
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
