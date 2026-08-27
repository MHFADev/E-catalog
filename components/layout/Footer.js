"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/common/Icon";
import PartnerLogos from "@/components/common/PartnerLogos";
import { motion, AnimatePresence } from "framer-motion";
import {
  ADMIN_WHATSAPP,
  ADMIN_WHATSAPP_DISPLAY,
  WHATSAPP_JOIN_MESSAGE,
} from "@/lib/constants";
import { generateWhatsAppLink } from "@/lib/generateWhatsAppLink";

function FooterHeading({ children }) {
  return (
    <h4 className="text-xs md:text-sm font-bold tracking-[0.14em] uppercase text-white mb-5 flex items-center gap-2">
      <span className="w-1 h-4 bg-[#d9f0bf] rounded-sm" />
      {children}
    </h4>
  );
}

function FooterLink({ href, children }) {
  return (
    <Link
      href={href}
      className="text-sm text-white/70 hover:text-[#d9f0bf] transition-colors flex items-center gap-1.5 w-fit"
    >
      <span className="text-[#d9f0bf]/70">›</span>
      {children}
    </Link>
  );
}

function MobileAccordionItem({ title, open, onToggle, children }) {
  return (
    <div className="border-b border-white/10">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`footer-${title.toLowerCase()}`}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="flex items-center gap-2">
          <span className="w-1 h-4 bg-[#d9f0bf] rounded-sm" />
          <span className="text-xs font-bold tracking-[0.14em] uppercase text-white">
            {title}
          </span>
        </span>
        <Icon
          name={open ? "chevronUp" : "chevronDown"}
          size={16}
          className="text-warm-gray"
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`footer-${title.toLowerCase()}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-4 flex flex-col gap-2.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Footer() {
  const [openSection, setOpenSection] = useState(null);
  const waLink = generateWhatsAppLink(ADMIN_WHATSAPP, WHATSAPP_JOIN_MESSAGE);

  const toggle = (key) => setOpenSection((prev) => (prev === key ? null : key));

  return (
    <footer className="bg-hutan border-t border-forest-light/25 mt-16 overflow-hidden">
      {/* Aksen hias atas */}
      <div className="h-1.5 bg-gradient-to-r from-laut via-[#8dcceb] to-[#d9f0bf] w-full" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-12 md:pt-16 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 pb-10 lg:pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/icon.png"
                alt="UMKM Kemayoran"
                className="h-9 md:h-10 w-auto"
              />
              <div>
                <div className="font-extrabold text-base md:text-lg text-white leading-tight">
                  UMKM Kemayoran
                </div>
                <div className="text-[10px] md:text-[11px] text-white/55 uppercase tracking-wider">
                  E-Catalog Lokal
                </div>
              </div>
            </Link>
            <p className="mt-4 text-sm text-white/72 leading-relaxed max-w-sm">
              Katalog digital untuk mendukung pertumbuhan UMKM Kemayoran —
              belanja langsung, transparan, dan dekat dengan warga sekitar.
            </p>

            {/* Contact ringkas (tanpa form) */}
            <div className="mt-6 space-y-2.5 text-sm">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white font-semibold hover:text-[#d9f0bf] hover:underline no-underline"
              >
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Icon name="whatsapp" size={15} />
                </span>
                {ADMIN_WHATSAPP_DISPLAY}
              </a>
              <a
                href="mailto:hallo@umkm-kemayoran.id"
                className="flex items-center gap-2 text-white/70 hover:text-[#d9f0bf] transition-colors no-underline"
              >
                <span className="w-8 h-8 rounded-full bg-forest/10 text-forest flex items-center justify-center shrink-0">
                  <Icon name="send" size={14} />
                </span>
                hallo@umkm-kemayoran.id
              </a>
              <div className="flex items-center gap-2 text-white/70">
                <span className="w-8 h-8 rounded-full bg-clay/10 text-clay-deep flex items-center justify-center shrink-0">
                  <Icon name="mapPin" size={14} />
                </span>
                Jl. Kemayoran, Jakarta Pusat
              </div>
            </div>

            {/* [OPSI 3b] Mitra Pendukung di samping info kontak */}
            <div className="mt-7 pt-5 border-t border-white/10">
              <div className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-white/55 font-semibold mb-3">
                Mitra Pendukung
              </div>
              <PartnerLogos variant="footer" />
            </div>
          </div>

          {/* Navigasi (desktop) */}
          <div className="hidden lg:block lg:col-span-2">
            <FooterHeading>Navigasi</FooterHeading>
            <div className="flex flex-col gap-2.5">
              <FooterLink href="/">Beranda</FooterLink>
              <FooterLink href="/catalog">Katalog Produk</FooterLink>
              <FooterLink href="/artikel">Artikel &amp; Event</FooterLink>
              <FooterLink href="/about">Tentang Kami</FooterLink>
              <FooterLink href="/#peta">Peta Lokasi</FooterLink>
            </div>
          </div>

          {/* Untuk UMKM (desktop) */}
          <div className="hidden lg:block lg:col-span-3">
            <FooterHeading>Untuk UMKM</FooterHeading>
            <div className="flex flex-col gap-2.5">
              <FooterLink href="/gabung">Gabung Katalog</FooterLink>
              <FooterLink href="/seller">Area Penjual</FooterLink>
              <FooterLink href="/seller/products">Kelola Produk</FooterLink>
              <FooterLink href="/admin/login">Panel Admin</FooterLink>
            </div>

            <div className="mt-6 bg-white/10 border border-white/15 rounded-2xl px-4 py-3.5">
              <div className="text-[11px] md:text-xs font-bold text-white mb-1">
                Punya usaha di Kemayoran?
              </div>
              <div className="text-[11px] md:text-xs text-white/65 leading-relaxed">
                Daftar gratis dan tampilkan produk Anda di katalog digital ini.{" "}
                <Link
                  href="/gabung"
                  className="text-[#d9f0bf] font-semibold hover:underline"
                >
                  Mulai di sini.
                </Link>
              </div>
            </div>
          </div>

          {/* Layanan / Kontak (desktop) */}
          <div className="hidden lg:block lg:col-span-3">
            <FooterHeading>Bantuan</FooterHeading>
            <div className="flex flex-col gap-2.5">
              <FooterLink href="/about">FAQ &amp; Bantuan</FooterLink>
              <FooterLink href="/gabung">Cara Menjadi Mitra</FooterLink>
              <FooterLink href="/catalog">Cara Belanja</FooterLink>
              <FooterLink href="/artikel">Panduan &amp; Berita</FooterLink>
            </div>
          </div>
        </div>

        {/* Akordeon mobile */}
        <div className="lg:hidden border-b border-cream-warm">
          <MobileAccordionItem
            title="Navigasi"
            open={openSection === "navigasi"}
            onToggle={() => toggle("navigasi")}
          >
            <FooterLink href="/">Beranda</FooterLink>
            <FooterLink href="/catalog">Katalog Produk</FooterLink>
            <FooterLink href="/artikel">Artikel &amp; Event</FooterLink>
            <FooterLink href="/about">Tentang Kami</FooterLink>
            <FooterLink href="/#peta">Peta Lokasi</FooterLink>
          </MobileAccordionItem>

          <MobileAccordionItem
            title="Untuk UMKM"
            open={openSection === "umkm"}
            onToggle={() => toggle("umkm")}
          >
            <FooterLink href="/gabung">Gabung Katalog</FooterLink>
            <FooterLink href="/seller">Area Penjual</FooterLink>
            <FooterLink href="/seller/products">Kelola Produk</FooterLink>
            <FooterLink href="/admin/login">Panel Admin</FooterLink>
            <div className="mt-2 bg-cream-pure border border-cream-warm rounded-2xl px-4 py-3.5">
              <div className="text-[11px] font-bold text-noir mb-1">
                Punya usaha di Kemayoran?
              </div>
              <div className="text-[11px] text-warm-gray leading-relaxed">
                Daftar gratis dan tampilkan produk Anda di katalog digital ini.{" "}
                <Link
                  href="/gabung"
                  className="text-[#d9f0bf] font-semibold hover:underline"
                >
                  Mulai di sini.
                </Link>
              </div>
            </div>
          </MobileAccordionItem>

          <MobileAccordionItem
            title="Bantuan"
            open={openSection === "bantuan"}
            onToggle={() => toggle("bantuan")}
          >
            <FooterLink href="/about">FAQ &amp; Bantuan</FooterLink>
            <FooterLink href="/gabung">Cara Menjadi Mitra</FooterLink>
            <FooterLink href="/catalog">Cara Belanja</FooterLink>
            <FooterLink href="/artikel">Panduan &amp; Berita</FooterLink>
          </MobileAccordionItem>
        </div>

        {/* Bar bawah */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6">
          <p className="text-xs text-white/55 text-center sm:text-left">
            &copy; {new Date().getFullYear()} E-Catalog UMKM Kemayoran. Semua hak
            dilindungi.
          </p>
          <div className="flex items-center gap-3 text-[11px] text-white/55">
            <span>Dibuat untuk pelaku UMKM lokal</span>
            <span className="w-1 h-1 rounded-full bg-clay/40" />
            <span>Dari Kemayoran, untuk Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}