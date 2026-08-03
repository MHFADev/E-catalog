import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SellerForm from "../SellerForm";

export default async function AdminEditSellerPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: seller } = await supabase
    .from("sellers")
    .select("*")
    .eq("id", id)
    .single();

  if (!seller) notFound();

  return (
    <div>
      <Link
        href="/admin/sellers"
        className="text-xs md:text-sm text-warm-gray hover:text-forest mb-4 inline-block"
      >
        â† Kembali ke daftar toko
      </Link>
      <h2 className="text-sm md:text-base font-bold text-noir mb-4">
        Edit Toko: {seller.name}
      </h2>
      <div className="bg-white rounded-2xl border border-cream-warm p-4 md:p-5">
        <SellerForm initial={seller} />
      </div>
    </div>
  );
}
