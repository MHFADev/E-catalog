import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "./ProductForm";
import { toggleProduct, deleteProduct } from "../actions";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const [{ data: products }, { data: categories }, { data: sellers }] =
    await Promise.all([
      supabase.from("products").select("*, sellers(name)").order("name"),
      supabase.from("categories").select("id, name").order("name"),
      supabase.from("sellers").select("id, name").order("name"),
    ]);

  const catName = (id) => categories?.find((c) => c.id === id)?.name || id;

  return (
    <div>
      <h2 className="text-sm md:text-base font-bold text-noir mb-4">
        Kelola Produk ({products?.length ?? 0})
      </h2>

      <details className="bg-white rounded-2xl border border-cotton-warm mb-6 overflow-hidden">
        <summary className="px-4 py-3 text-sm font-semibold text-cherry cursor-pointer hover:bg-cotton-warm/50 transition-colors">
          + Tambah Produk Baru
        </summary>
        <div className="p-4 md:p-5 border-t border-cotton-warm">
          <ProductForm categories={categories ?? []} sellers={sellers ?? []} />
        </div>
      </details>

      <div className="space-y-3">
        {products?.length === 0 && (
          <p className="text-sm text-warm-gray bg-white rounded-2xl border border-cotton-warm p-6 text-center">
            Belum ada produk.
          </p>
        )}

        {products?.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl p-4 border border-cotton-warm flex flex-wrap items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-cotton-warm shrink-0">
              {p.images?.[0] && (
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-noir truncate">
                {p.name}
              </div>
              <div className="text-[11px] md:text-xs text-warm-gray truncate">
                {p.sellers?.name} • {catName(p.category_id)}
              </div>
              <div className="text-[11px] md:text-xs text-warm-gray">
                {p.price != null ? `Rp${Number(p.price).toLocaleString("id-ID")}` : p.price_unit || "Hubungi penjual"}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <form action={toggleProduct}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="field" value="is_featured" />
                <input type="hidden" name="value" value={String(!p.is_featured)} />
                <button className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${p.is_featured ? "bg-amber-100 text-amber-700" : "bg-cotton-warm text-noir-soft hover:bg-cotton"}`}>
                  {p.is_featured ? "★ Unggulan" : "Jadikan Unggulan"}
                </button>
              </form>
              <form action={toggleProduct}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="field" value="is_available" />
                <input type="hidden" name="value" value={String(!p.is_available)} />
                <button className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${p.is_available ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-500"}`}>
                  {p.is_available ? "Tersedia" : "Nonaktif"}
                </button>
              </form>
              <Link
                href={`/admin/products/${p.id}`}
                className="px-3 py-1.5 text-xs font-semibold rounded-full bg-cotton-warm text-noir-soft hover:bg-cotton transition-all"
              >
                Edit
              </Link>
              <form action={deleteProduct}>
                <input type="hidden" name="id" value={p.id} />
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
