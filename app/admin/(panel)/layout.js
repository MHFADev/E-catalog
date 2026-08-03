import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Produk" },
  { href: "/admin/sellers", label: "Toko / UMKM" },
  { href: "/admin/categories", label: "Kategori" },
  { href: "/admin/articles", label: "Artikel" },
  { href: "/admin/accounts", label: "Akun Penjual" },
  { href: "/admin/reviews", label: "Komentar" },
  { href: "/admin/messages", label: "Pesan" },
  { href: "/admin/join", label: "Permintaan Gabung" },
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
              className="text-xs md:text-sm text-warm-gray hover:text-forest px-3 py-2"
            >
              Lihat Situs â†’
            </Link>
            <LogoutButton />
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="shrink-0 px-4 py-2 text-xs md:text-sm font-semibold rounded-full bg-white border border-cream-warm text-noir-soft hover:border-forest hover:text-forest transition-all"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {children}
      </div>
    </div>
  );
}
