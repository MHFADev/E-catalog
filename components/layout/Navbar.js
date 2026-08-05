"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Icon from "@/components/common/Icon";
import JoinModal from "@/components/common/JoinModal";
import { useUser } from "@/lib/useUser";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [term, setTerm] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const inputRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
    // [POP UP DAFTAR UMKM] Tutup modal gabung saat pindah halaman,
    // agar pop up tidak ikut tampil di halaman yang dituju
    setJoinOpen(false);
  }, [pathname]);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = term.trim();
    if (!q) {
      router.push("/catalog");
      return;
    }
    router.push(`/catalog?search=${encodeURIComponent(q)}`);
  };

  const links = [
    { href: "/", label: "Beranda", icon: "store" },
    { href: "/catalog", label: "Katalog", icon: "search" },
    { href: "/artikel", label: "Artikel", icon: "file" },
    { href: "/about", label: "Tentang", icon: "info" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-cream-warm shadow-navbar">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="h-14 md:h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/icon.png"
              alt="UMKM Kemayoran"
              className="h-8 md:h-9 w-auto"
            />
            <span className="font-bold text-sm md:text-base text-noir hidden sm:block">
              UMKM Kemayoran
            </span>
          </Link>

          {/* Search bar (desktop) */}
          <form
            onSubmit={submitSearch}
            className="hidden lg:flex flex-1 max-w-xl items-center gap-2 pl-4 pr-1.5 h-11 bg-cream border border-cream-warm rounded-full focus-within:border-forest/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-forest/10 transition-all"
          >
            <Icon name="search" size={16} className="text-muted" />
            <input
              ref={inputRef}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Cari produk UMKM Kemayoran…"
              className="flex-1 bg-transparent text-sm text-noir outline-none placeholder:text-muted"
              aria-label="Cari produk"
            />
            <button
              type="submit"
              className="shrink-0 flex items-center gap-1 px-4 h-8 text-sm font-bold text-white bg-forest hover:bg-forest-deep rounded-full transition-colors"
            >
              <Icon name="search" size={13} /> Cari
            </button>
          </form>

          <nav className="hidden md:flex items-center gap-0.5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2 text-sm font-medium rounded-full transition-colors ${
                  pathname === l.href
                    ? "text-forest bg-forest/10"
                    : "text-cool-gray hover:text-noir hover:bg-cream"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {/* [NAVBAR GUEST/LOGIN] Tombol Daftar UMKM (bergambar whatsapp) hanya
                muncul untuk pengguna yang SUDAH LOGIN, ditempatkan setelah "Tentang".
                Guest (belum login) tidak melihat tombol ini sama sekali. */}
            {user && (
              <button
                onClick={() => setJoinOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 ml-1 text-sm font-bold text-white bg-forest rounded-full hover:bg-forest-deep shadow-card transition-all hover:shadow-card-hover"
              >
                <Icon name="whatsapp" size={15} /> Daftar UMKM
              </button>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            {user ? (
              <Link
                href="/seller"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-noir-soft hover:bg-cream rounded-full transition-colors"
              >
                <Icon name="store" size={15} /> Toko Saya
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-noir-soft hover:bg-cream rounded-full transition-colors"
              >
                <Icon name="user" size={15} /> Masuk
              </Link>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-cream transition-colors"
            aria-label="Menu"
          >
            {menuOpen ? (
              <Icon name="close" size={22} />
            ) : (
              <Icon name="menu" size={22} />
            )}
          </button>
        </div>

        {/* Search bar (mobile) */}
        <form
          onSubmit={submitSearch}
          className="lg:hidden flex items-center gap-2 pl-4 pr-1.5 h-11 mb-3 bg-cream border border-cream-warm rounded-full focus-within:border-forest/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-forest/10 transition-all"
        >
          <Icon name="search" size={16} className="text-muted" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Cari produk UMKM Kemayoran…"
            className="flex-1 bg-transparent text-sm text-noir outline-none placeholder:text-muted"
            aria-label="Cari produk"
          />
          <button
            type="submit"
            className="shrink-0 flex items-center gap-1 px-4 h-8 text-sm font-bold text-white bg-forest hover:bg-forest-deep rounded-full transition-colors"
          >
            <Icon name="search" size={13} /> Cari
          </button>
        </form>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-cream-warm bg-white">
          <div className="px-4 py-3 space-y-1">
            {links.map((l) => {
              const isActive = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive
                      ? "bg-forest/10 text-forest"
                      : "text-noir-soft hover:bg-cream"
                  }`}
                >
                  <span className={isActive ? "text-forest" : "text-cool-gray"}>
                    <Icon name={l.icon} size={20} />
                  </span>
                  {l.label}
                </Link>
              );
            })}
            <div className="pt-1 space-y-2">
              {user ? (
                <Link
                  href="/seller"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-forest bg-forest/5"
                >
                  <Icon name="store" size={20} /> Toko Saya
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-noir-soft hover:bg-cream"
                >
                  <Icon name="user" size={20} /> Masuk
                </Link>
              )}
              {/* [NAVBAR GUEST/LOGIN] Di menu mobile pun, tombol Daftar UMKM
                  hanya tampil untuk pengguna yang sudah login */}
              {user && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setJoinOpen(true);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-white bg-forest w-full text-left"
                >
                  <Icon name="whatsapp" size={20} /> Daftar UMKM
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <JoinModal open={joinOpen} onClose={() => setJoinOpen(false)} />
    </header>
  );
}