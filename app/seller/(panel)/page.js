import Link from "next/link";
import { getSellerAccount } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function SellerDashboardPage() {
  const account = await getSellerAccount();
  const seller = account?.sellers;
  const supabase = await createClient();
  const { count } = seller
    ? await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", seller.id)
    : { count: 0 };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-7 border border-cotton-warm">
        <div className="text-sm font-semibold text-noir mb-1">
          {seller?.name}
        </div>
        {seller?.description && (
          <p className="text-xs md:text-sm text-cool-gray leading-relaxed mb-2">
            {seller.description}
          </p>
        )}
        <div className="text-xs md:text-sm text-warm-gray">
          {seller?.whatsapp && <>WhatsApp: {seller.whatsapp}</>}
          {seller?.address && <> • {seller.address}</>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-cotton-warm">
          <div className="text-3xl font-bold text-cherry">{count ?? 0}</div>
          <div className="text-xs text-warm-gray mt-1">Produk Anda di katalog</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-cotton-warm flex flex-col justify-center">
          <Link
            href="/seller/products"
            className="btn-primary text-sm py-2.5 text-center"
          >
            Kelola Produk Saya
          </Link>
        </div>
      </div>

      <div className="bg-cherry/5 border border-cherry/20 rounded-2xl p-4 md:p-5">
        <p className="text-xs md:text-sm text-noir-soft leading-relaxed">
          <strong>Cara:</strong> buka menu <strong>Produk Saya</strong> untuk
          menambah atau mengubah produk. Gambar otomatis dikompres lalu
          disimpan di repository GitHub situs. Perubahan langsung tampil di
          katalog publik.
        </p>
      </div>
    </div>
  );
}
