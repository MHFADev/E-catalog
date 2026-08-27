import { Suspense } from "react";
import CatalogContent from "./CatalogContent";
import { SkeletonGrid } from "@/components/common/Loader";
import { getProducts, getSellers, getCategories } from "@/lib/catalog";

export const metadata = {
  title: "Katalog Produk UMKM Lokal",
  description:
    "Jelajahi katalog produk UMKM Kemayoran, dari kuliner dan camilan hingga hampers serta kebutuhan rumah tangga.",
  openGraph: {
    title: "Katalog Produk UMKM Kemayoran",
    description:
      "Temukan produk lokal dan hubungi pelaku UMKM langsung dari katalog digital Kemayoran.",
  },
};



export default async function CatalogPage() {
  const [productsData, sellersData, categories] = await Promise.all([
    getProducts(),
    getSellers(),
    getCategories(),
  ]);

  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12"><SkeletonGrid count={8} /></div>}>
      <CatalogContent
        categories={categories}
        productsData={productsData}
        sellersData={sellersData}
      />
    </Suspense>
  );
}
