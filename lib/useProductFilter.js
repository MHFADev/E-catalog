"use client";
import { useMemo } from "react";

export function useProductFilter(
  products,
  sellers,
  { search, categoryIds, priceRange, sellerId },
) {
  const priceRanges = {
    under25: [0, 25000],
    mid: [25000, 50000],
    over50: [50000, Infinity],
  };
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
    if (priceRange && priceRange !== "all") {
      const [min, max] = priceRanges[priceRange];
      filtered = filtered.filter(
        (p) => p.price !== null && p.price >= min && p.price <= max,
      );
    }
    if (sellerId && sellerId !== "all")
      filtered = filtered.filter((p) => p.sellerId === sellerId);
    return filtered;
  }, [products, sellers, search, categoryIds, priceRange, sellerId]);
}
