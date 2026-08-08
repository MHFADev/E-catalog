"use client";
import { useMemo } from "react";

// Logika filter murni (tanpa hook) — dipakai oleh hook AND untuk menghitung
// jumlah produk per opsi pada sidebar filter.
export function filterProducts(products, sellers, { search, categoryIds, sellerId, preOrder, halal } = {}) {
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
  if (preOrder === "po") filtered = filtered.filter((p) => p.isPreOrder === true);
  if (preOrder === "ready") filtered = filtered.filter((p) => p.isPreOrder !== true);

  // [HALAL] 'halal' / 'non_halal'
  if (halal === "halal") filtered = filtered.filter((p) => p.halalStatus === "halal");
  if (halal === "non_halal") filtered = filtered.filter((p) => p.halalStatus === "non_halal");

  return filtered;
}

export function useProductFilter(products, sellers, opts = {}) {
  const { search, categoryIds, sellerId, preOrder, halal } = opts;
  return useMemo(
    () => filterProducts(products, sellers, { search, categoryIds, sellerId, preOrder, halal }),
    [products, sellers, search, categoryIds, sellerId, preOrder, halal],
  );
}