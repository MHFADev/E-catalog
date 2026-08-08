"use client";
import { useMemo } from "react";

export function useProductFilter(
  products,
  sellers,
  { search, categoryIds, sellerId, preOrder, halal },
) {
  return useMemo(() => {
    let filtered = [...products];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((p) => {
        const seller = sellers.find((s) => s.id === p.sellerId);
        return (
          p.name.toLowerCase().includes(q) ||
          seller?.name.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
        );
      });
    }
    if (categoryIds?.length > 0)
      filtered = filtered.filter((p) => categoryIds.includes(p.categoryId));
    if (sellerId && sellerId !== "all")
      filtered = filtered.filter((p) => p.sellerId === sellerId);

    // [PRE-ORDER] 'po' = hanya produk PO | 'ready' = hanya bukan PO
    if (preOrder === "po")
      filtered = filtered.filter((p) => p.isPreOrder === true);
    if (preOrder === "ready")
      filtered = filtered.filter((p) => p.isPreOrder !== true);

    // [HALAL] 'halal' / 'non_halal'
    if (halal === "halal")
      filtered = filtered.filter((p) => p.halalStatus === "halal");
    if (halal === "non_halal")
      filtered = filtered.filter((p) => p.halalStatus === "non_halal");

    return filtered;
  }, [products, sellers, search, categoryIds, sellerId, preOrder, halal]);
}
