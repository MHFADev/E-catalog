import Link from "next/link";
import Icon from "@/components/common/Icon";
import { createClient } from "@/lib/supabase/server";

async function count(client, table, filters = {}) {
  const { count } = await client
    .from(table)
    .select("*", { count: "exact", head: true })
    .match(filters);
  return count ?? 0;
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [products, sellers, categories, pendingReviews, unreadMessages, pendingJoins] =
    await Promise.all([
      count(supabase, "products"),
      count(supabase, "sellers"),
      count(supabase, "categories"),
      count(supabase, "reviews", { status: "pending" }),
      count(supabase, "messages", { is_read: false }),
      count(supabase, "join_requests", { status: "pending" }),
    ]);

  const stats = [
    { label: "Produk", value: products, href: "/admin/products", icon: "package", highlight: false },
    { label: "Toko / UMKM", value: sellers, href: "/admin/sellers", icon: "store", highlight: false },
    { label: "Kategori", value: categories, href: "/admin/products", icon: "tag", highlight: false },
    { label: "Komentar menunggu", value: pendingReviews, href: "/admin/reviews", icon: "star", highlight: true },
    { label: "Pesan belum dibaca", value: unreadMessages, href: "/admin/messages", icon: "send", highlight: true },
    { label: "Permintaan gabung", value: pendingJoins, href: "/admin/join", icon: "whatsapp", highlight: true },
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
              s.highlight && s.value > 0 ? "border-forest/40" : "border-cream-warm"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className={`text-2xl md:text-3xl font-bold ${s.highlight && s.value > 0 ? "text-forest" : "text-noir"}`}>
                {s.value}
              </div>
              <span className={`flex items-center justify-center w-9 h-9 rounded-full ${s.highlight && s.value > 0 ? "bg-forest/10 text-forest" : "bg-cream text-warm-gray"}`}>
                <Icon name={s.icon} size={16} />
              </span>
            </div>
            <div className="text-[11px] md:text-xs text-warm-gray mt-1">
              {s.label}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 bg-forest/5 border border-forest/20 rounded-2xl p-4 md:p-5">
        <p className="text-xs md:text-sm text-noir-soft leading-relaxed">
          <strong>Tips:</strong> kelola produk, moderasi komentar, dan baca pesan
          dari pengunjung lewat menu di atas. Perubahan langsung tampil di situs
          publik.
        </p>
      </div>
    </div>
  );
}
