import Link from "next/link";
import Icon from "@/components/common/Icon";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import ProductForm from "../ProductForm";

export default async function AdminEditProductPage({ params }) {
  const { id } = await params;
  const supabase = await createAdminClient();
  const [{ data: product }, { data: categories }, { data: sellers }] =
    await Promise.all([
      supabase.from("products").select("*").eq("id", id).single(),
      supabase.from("categories").select("id, name").order("name"),
      supabase.from("sellers").select("id, name").order("name"),
    ]);

    if (!product) notFound();

  const initialProduct = {
    ...product,
    categoryId: product.category_id,
    sellerId: product.seller_id,
    priceUnit: product.price_unit,
    isFeatured: product.is_featured,
    isAvailable: product.is_available,
    showPrice: product.show_price,
    isPreOrder: product.is_pre_order,
    halalStatus: product.halal_status,
    images: Array.isArray(product.images) ? product.images : [],
    tags: Array.isArray(product.tags) ? product.tags : [],
  };

  return (

    <div>
      <Link
        href="/admin/products"
        className="flex items-center gap-1.5 text-xs md:text-sm text-warm-gray hover:text-forest mb-4 inline-block"
      >
        <Icon name="chevronLeft" size={14} /> Kembali ke daftar produk
      </Link>
      <h2 className="text-sm md:text-base font-bold text-noir mb-4">
        Edit Produk: {product.name}
      </h2>
      <div className="bg-white rounded-2xl border border-cream-warm p-4 md:p-5">
        <ProductForm
          categories={categories ?? []}
          sellers={sellers ?? []}
                    initial={initialProduct}

        />
      </div>
    </div>
  );
}
