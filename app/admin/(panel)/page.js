import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

async function count(query, filter) {
  const { count } = await query.count({ count: "exact", head: true });
  return count ?? 0;
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [products, sellers, categories, pendingReviews, unreadMessages, pendingJoins] =
    await Promise.all([
      count(supabase.from("products").select()),
      count(supabase.from("sellers").select()),
      count(supabase.from("categories").select()),
      count(supabase.from("reviews").select().eq("status", "pending")),
      count(supabase.from("messages").select().eq("is_read", false)),
      count(supabase.from("join_requests").select().eq("status", "pending")),
    ]);

  const stats = [
    { label: "Produk", value: products, href: "/admin/products", highlight: false },
    { label: "Toko / UMKM", value: sellers, href: "/admin/sellers", highlight: false },
    { label: "Kategori", value: categories, href: "/admin/products", highlight: false },
    { label: "Komentar menunggu", value: pendingReviews, href: "/admin/reviews", highlight: true },
    { label: "Pesan belum dibaca", value: unreadMessages, href: "/admin/messages", highlight: true },
    { label: "Permintaan gabung", value: pendingJoins, href: "/admin/join", highlight: true },
  ];

  return (
    <div>
      <h2 className="text-sm md:text-base font-bold text-noir mb-4">
        Ringkasan
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`bg-white rounded-2xl p-4 md:p-5 border shadow-sm hover:shadow-md transition-all ${
              s.highlight && s.value > 0 ? "border-cherry/40" : "border-cotton-warm"
            }`}
          >
            <div className={`text-2xl md:text-3xl font-bold ${s.highlight && s.value > 0 ? "text-cherry" : "text-noir"}`}>
              {s.value}
            </div>
            <div className="text-[11px] md:text-xs text-warm-gray mt-1">
              {s.label}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 bg-cherry/5 border border-cherry/20 rounded-2xl p-4 md:p-5">
        <p className="text-xs md:text-sm text-noir-soft leading-relaxed">
          <strong>Tips:</strong> kelola produk, moderasi komentar, dan baca pesan
          dari pengunjung lewat menu di atas. Perubahan langsung tampil di situs
          publik.
        </p>
      </div>
    </div>
  );
}
