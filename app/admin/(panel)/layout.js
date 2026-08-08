import { redirect } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/common/Icon";
import { isAdmin } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

// Panel admin butuh session cookie + akses DB via service role (runtime),
// jadi jangan pernah di-prerender saat build (force dynamic + non-stale).
export const dynamic = "force-dynamic";

const links = [
  { href: "/admin", label: "Dashboard", icon: "grid" },
  { href: "/admin/products", label: "Produk", icon: "package" },
  { href: "/admin/sellers", label: "Toko / UMKM", icon: "store" },
  { href: "/admin/banners", label: "Banner", icon: "image" },
  { href: "/admin/categories", label: "Kategori", icon: "tag" },
  { href: "/admin/articles", label: "Artikel", icon: "file" },
  { href: "/admin/accounts", label: "Akun Penjual", icon: "users" },
  { href: "/admin/reviews", label: "Komentar", icon: "star" },
  { href: "/admin/messages", label: "Pesan", icon: "send" },
  { href: "/admin/join", label: "Permintaan Gabung", icon: "whatsapp" },
];

export default async function AdminLayout({ children }) {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Panel <span className="text-forest">Admin</span>
            </h1>
            <p className="text-xs md:text-sm text-warm-gray">
              Kelola katalog UMKM Kemayoran
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs md:text-sm text-warm-gray hover:text-forest px-3 py-2"
            >
              <Icon name="externalLink" size={14} /> Lihat Situs
            </Link>
            <LogoutButton />
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold rounded-full bg-white border border-cream-warm text-noir-soft hover:border-forest hover:text-forest transition-all"
            >
              <Icon name={l.icon} size={14} className="text-forest" />
              {l.label}
            </Link>
          ))}
        </nav>

        {/* [PENTING] Peringatan global bila akses DB admin belum siap */}
        {!process.env.SUPABASE_SERVICE_ROLE_KEY && (
          <div className="mb-5 text-xs bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 leading-relaxed text-amber-800">
            <strong>Panel admin belum dapat mengakses database.</strong> Semua
            menu admin (termasuk Permintaan Gabung) butuh kunci server: setel{" "}
            <span className="font-mono">SUPABASE_SERVICE_ROLE_KEY</span> di
            Vercel (Project → Settings → Environment Variables) dan di{" "}
            <span className="font-mono">.env.local</span>, lalu redeploy.
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
