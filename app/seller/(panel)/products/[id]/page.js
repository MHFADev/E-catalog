import Link from "next/link";
import { notFound } from "next/navigation";
import { getSellerAccount } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import SellerProductForm from "../SellerProductForm";

export default async function SellerEditProductPage({ params }) {
  const { id } = await params;
  const account = await getSellerAccount();
  const supabase = await createClient();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("categories").select("id, name").order("name"),
  ]);

  if (!product || product.seller_id !== account?.seller_id) notFound();

  return (
    <div>
      <Link
        href="/seller/products"
        className="text-xs md:text-sm text-warm-gray hover:text-cherry mb-4 inline-block"
      >
        ← Kembali ke produk saya
      </Link>
      <h2 className="text-sm md:text-base font-bold text-noir mb-4">
        Edit Produk: {product.name}
      </h2>
      <div className="bg-white rounded-2xl border border-cotton-warm p-4 md:p-5">
        <SellerProductForm categories={categories ?? []} initial={product} />
      </div>
    </div>
  );
}
