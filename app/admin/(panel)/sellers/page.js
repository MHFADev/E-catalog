import Link from "next/link";
import Icon from "@/components/common/Icon";
import DeleteConfirmButton from "@/components/common/DeleteConfirmButton";
import AdminSearchInput from "@/components/common/AdminSearchInput";
import { createAdminClient } from "@/lib/supabase/admin";
import SellerForm from "./SellerForm";
import { deleteSeller } from "../actions";

// Halaman ini adalah Server Component — searchParams diterima sebagai prop
// dari Next.js App Router berdasarkan query string ?q=...
export default async function AdminSellersPage({ searchParams }) {
  const supabase = await createAdminClient();
  const { data: sellers } = await supabase
    .from("sellers")
    .select("*, products(id)")
    .order("name");

  // Ambil query pencarian dari URL (?q=...) — case-insensitive
  const { q: query } = await searchParams;
  const search = (query || "").trim();

  // Filter toko berdasarkan query pencarian (nama toko atau nama pemilik)
  const filteredSellers = search
    ? sellers?.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          (s.owner || "").toLowerCase().includes(search.toLowerCase())
      )
    : sellers;

  return (
    <div>
      <h2 className="text-sm md:text-base font-bold text-noir mb-4">
        Kelola Toko / UMKM ({filteredSellers?.length ?? 0})
      </h2>

      {/* Input pencarian — client component, update URL ?q=... */}
      <AdminSearchInput placeholder="Cari nama toko atau pemilik..." />

      <details className="bg-white rounded-2xl border border-cream-warm mb-6 overflow-hidden">
        <summary className="flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-forest cursor-pointer hover:bg-cream-warm/50 transition-colors">
          <Icon name="plus" size={14} /> Tambah Toko Baru
        </summary>
        <div className="p-4 md:p-5 border-t border-cream-warm">
          <SellerForm />
        </div>
      </details>

      <div className="space-y-3">
        {filteredSellers?.length === 0 && (
          <p className="text-sm text-warm-gray bg-white rounded-2xl border border-cream-warm p-6 text-center">
            {search ? `Tidak ada toko yang cocok dengan "${search}".` : "Belum ada toko."}
          </p>
        )}

        {filteredSellers?.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl p-4 border border-cream-warm flex flex-wrap items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-cream-warm shrink-0">
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
                className="px-3 py-1.5 text-xs font-semibold rounded-full bg-laut/10 text-laut hover:bg-laut/20 transition-all"
              >
                Edit
              </Link>
              <DeleteConfirmButton
                action={deleteSeller}
                id={s.id}
                entityLabel={`toko “${s.name}”`}
                description={`Toko “${s.name}” akan dihapus dari katalog. Produk yang masih terhubung harus ditangani terlebih dahulu agar data tidak hilang tanpa sengaja.`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
