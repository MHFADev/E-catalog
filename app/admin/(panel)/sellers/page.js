import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SellerForm from "./SellerForm";
import { deleteSeller } from "../actions";

export default async function AdminSellersPage() {
  const supabase = await createClient();
  const { data: sellers } = await supabase
    .from("sellers")
    .select("*, products(id)")
    .order("name");

  return (
    <div>
      <h2 className="text-sm md:text-base font-bold text-noir mb-4">
        Kelola Toko / UMKM ({sellers?.length ?? 0})
      </h2>

      <details className="bg-white rounded-2xl border border-cotton-warm mb-6 overflow-hidden">
        <summary className="px-4 py-3 text-sm font-semibold text-cherry cursor-pointer hover:bg-cotton-warm/50 transition-colors">
          + Tambah Toko Baru
        </summary>
        <div className="p-4 md:p-5 border-t border-cotton-warm">
          <SellerForm />
        </div>
      </details>

      <div className="space-y-3">
        {sellers?.length === 0 && (
          <p className="text-sm text-warm-gray bg-white rounded-2xl border border-cotton-warm p-6 text-center">
            Belum ada toko.
          </p>
        )}

        {sellers?.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl p-4 border border-cotton-warm flex flex-wrap items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-cotton-warm shrink-0">
              {s.logo && (
                <img
                  src={s.logo}
                  alt={s.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-noir truncate">
                {s.name}
              </div>
              <div className="text-[11px] md:text-xs text-warm-gray truncate">
                {s.owner ? `Pemilik: ${s.owner} • ` : ""}
                {s.address || ""}
              </div>
              <div className="text-[11px] md:text-xs text-warm-gray">
                {s.whatsapp} • {s.products?.length ?? 0} produk
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/admin/sellers/${s.id}`}
                className="px-3 py-1.5 text-xs font-semibold rounded-full bg-cotton-warm text-noir-soft hover:bg-cotton transition-all"
              >
                Edit
              </Link>
              <form action={deleteSeller}>
                <input type="hidden" name="id" value={s.id} />
                <button className="px-3 py-1.5 text-xs font-semibold rounded-full bg-cherry/10 text-cherry hover:bg-cherry/20 transition-all">
                  Hapus
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
