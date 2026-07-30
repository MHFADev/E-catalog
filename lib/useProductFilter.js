"use client";
import { useMemo } from "react";

export function useProductFilter(
  products,
  sellers,
  { search, categoryIds, sellerId },
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
    return filtered;
  }, [products, sellers, search, categoryIds, sellerId]);
}
