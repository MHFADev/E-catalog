import Link from "next/link";
import Icon from "@/components/common/Icon";
import DeleteConfirmButton from "@/components/common/DeleteConfirmButton";
import AdminSearchInput from "@/components/common/AdminSearchInput";
import { createAdminClient } from "@/lib/supabase/admin";
import ProductForm from "./ProductForm";
import { toggleProduct, deleteProduct } from "../actions";

// Halaman ini adalah Server Component — searchParams diterima sebagai prop
// dari Next.js App Router berdasarkan query string ?q=...
export default async function AdminProductsPage({ searchParams }) {
  const supabase = await createAdminClient();
  const [{ data: products }, { data: categories }, { data: sellers }] =
    await Promise.all([
      supabase.from("products").select("*, sellers(name)").order("name"),
      supabase.from("categories").select("id, name").order("name"),
      supabase.from("sellers").select("id, name").order("name"),
    ]);

  // Ambil query pencarian dari URL (?q=...) —붕어빵 lowercase untuk case-insensitive
  const { q: query } = await searchParams;
  const search = (query || "").trim();

  const catName = (id) => categories?.find((c) => c.id === id)?.name || id;

  // Filter produk berdasarkan query pencarian (nama produk saja)
  const filteredProducts = search
    ? products?.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  return (
    <div>
      <h2 className="text-sm md:text-base font-bold text-noir mb-4">
        Kelola Produk ({filteredProducts?.length ?? 0})
      </h2>

      {/* Input pencarian — client component, update URL ?q=... */}
      <AdminSearchInput placeholder="Cari nama produk..." />

      <details className="bg-white rounded-2xl border border-cream-warm mb-6 overflow-hidden">
        <summary className="flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-forest cursor-pointer hover:bg-cream-warm/50 transition-colors">
          <Icon name="plus" size={14} /> Tambah Produk Baru
        </summary>
        <div className="p-4 md:p-5 border-t border-cream-warm">
          <ProductForm categories={categories ?? []} sellers={sellers ?? []} />
        </div>
      </details>

      <div className="space-y-3">
        {filteredProducts?.length === 0 && (
          <p className="text-sm text-warm-gray bg-white rounded-2xl border border-cream-warm p-6 text-center">
            {search ? `Tidak ada produk yang cocok dengan "${search}".` : "Belum ada produk."}
          </p>
        )}

        {filteredProducts?.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl p-4 border border-cream-warm flex flex-wrap items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-cream-warm shrink-0">
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
                <button className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${p.is_featured ? "bg-amber-100 text-amber-700" : "bg-cream-warm text-noir-soft hover:bg-cream"}`}>
                  <Icon name="starFilled" size={12} />
                  {p.is_featured ? "Unggulan" : "Jadikan Unggulan"}
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
                className="px-3 py-1.5 text-xs font-semibold rounded-full bg-cream-warm text-noir-soft hover:bg-cream transition-all"
              >
                Edit
              </Link>
              <DeleteConfirmButton
                action={deleteProduct}
                id={p.id}
                entityLabel={`produk “${p.name}”`}
                description={`Produk “${p.name}” akan dihapus dari katalog. Foto dan data produk terkait tidak dapat dipulihkan.`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
