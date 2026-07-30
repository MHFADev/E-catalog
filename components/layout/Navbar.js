"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/common/Icon";
import { generateWhatsAppLink } from "@/lib/generateWhatsAppLink";
import { ADMIN_WHATSAPP, WHATSAPP_JOIN_MESSAGE } from "@/lib/constants";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const links = [
    { href: "/", label: "Beranda", icon: "store" },
    { href: "/catalog", label: "Katalog", icon: "search" },
    { href: "/artikel", label: "Artikel", icon: "file" },
    { href: "/about", label: "Tentang", icon: "info" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? "bg-white/95 backdrop-blur-xl border-b border-cotton-warm shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img
            src="/icon.png"
            alt="UMKM Ciangsana"
            className="h-8 md:h-9 w-auto"
          />
          <span className="font-bold text-sm md:text-base text-noir hidden sm:block">
            UMKM Kemayoran
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                pathname === l.href
                  ? "bg-cherry text-white"
                  : "text-cool-gray hover:bg-cotton-warm hover:text-noir-soft"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <a
            href={generateWhatsAppLink(ADMIN_WHATSAPP, WHATSAPP_JOIN_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-cherry rounded-full hover:bg-cherry-deep transition-all no-underline"
          >
            <Icon name="whatsapp" size={16} /> Gabung
          </a>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-cotton-warm transition-colors"
          aria-label="Menu"
        >
          {menuOpen ? (
            <Icon name="close" size={22} />
          ) : (
            <Icon name="menu" size={22} />
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-cotton-warm bg-white/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {links.map((l) => {
              const isActive = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium transition-all ${
                    isActive
                      ? "bg-cherry/10 text-cherry"
                      : "text-noir-soft hover:bg-cotton-warm"
                  }`}
                >
                  <span
                    className={`${isActive ? "text-cherry" : "text-cool-gray"}`}
                  >
                    <Icon name={l.icon} size={20} />
                  </span>
                  {l.label}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cherry" />
                  )}
                </Link>
              );
            })}
            <a
              href={generateWhatsAppLink(ADMIN_WHATSAPP, WHATSAPP_JOIN_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-bold text-white bg-cherry no-underline"
            >
              <Icon name="whatsapp" size={20} /> Gabung Mitra
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
