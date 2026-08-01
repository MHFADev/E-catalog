import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "../ProductForm";

export default async function AdminEditProductPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: product }, { data: categories }, { data: sellers }] =
    await Promise.all([
      supabase.from("products").select("*").eq("id", id).single(),
      supabase.from("categories").select("id, name").order("name"),
      supabase.from("sellers").select("id, name").order("name"),
    ]);

  if (!product) notFound();

  return (
    <div>
      <Link
        href="/admin/products"
        className="text-xs md:text-sm text-warm-gray hover:text-cherry mb-4 inline-block"
      >
        ← Kembali ke daftar produk
      </Link>
      <h2 className="text-sm md:text-base font-bold text-noir mb-4">
        Edit Produk: {product.name}
      </h2>
      <div className="bg-white rounded-2xl border border-cotton-warm p-4 md:p-5">
        <ProductForm
          categories={categories ?? []}
          sellers={sellers ?? []}
          initial={product}
        />
      </div>
    </div>
  );
}
