"use client";
import Link from "next/link";
import Icon from "@/components/common/Icon";
import JoinForm from "@/components/common/JoinForm";
import { generateWhatsAppLink } from "@/lib/generateWhatsAppLink";
import { ADMIN_WHATSAPP, WHATSAPP_JOIN_MESSAGE } from "@/lib/constants";

const steps = [
  {
    icon: "user",
    title: "1. Login / Daftar Akun",
    desc: "Pakai akun yang sama untuk kelola usaha nanti.",
    color: "bg-laut/10 text-laut",
  },
  {
    icon: "send",
    title: "2. Kirim Data Usaha",
    desc: "Isi nama usaha & WhatsApp. Masuk antrian admin.",
    color: "bg-forest/10 text-forest",
  },
  {
    icon: "badgeCheck",
    title: "3. Disetujui Admin",
    desc: "Admin hubungkan akunmu ke toko UMKM di panel.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: "store",
    title: "4. Kelola Produk",
    desc: "Tambah produk + lokasi, tampil di peta katalog.",
    color: "bg-clay/10 text-clay-deep",
  },
];

export default function GabungPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-16">
      <div className="text-center mb-8 md:mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-forest/10 text-forest font-mono text-[10px] md:text-xs uppercase tracking-wider rounded-full font-semibold mb-3">
          <Icon name="store" size={12} /> UMKM Kemayoran
        </span>
        <h1 className="text-2xl md:text-4xl font-bold tracking-tighter mb-2">
          Gabung <span className="text-forest">Katalog</span>
        </h1>
        <p className="text-sm md:text-base text-warm-gray leading-relaxed max-w-lg mx-auto">
          Daftarkan usaha Anda secara gratis. Butuh login dulu agar admin bisa
          menghubungkan akun Anda ke toko UMKM — lalu kelola produk sendiri.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 md:gap-4 mb-8">
        {steps.map((s) => (
          <div
            key={s.title}
            className="bg-white rounded-2xl p-4 border border-cream-warm flex items-start gap-3"
          >
            <span
              className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${s.color}`}
            >
              <Icon name={s.icon} size={18} />
            </span>
            <div>
              <div className="text-xs md:text-sm font-bold text-noir">
                {s.title}
              </div>
              <p className="text-[11px] md:text-xs text-warm-gray leading-relaxed mt-0.5">
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm border border-cream-warm">
        <JoinForm />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
        <Link
          href="/"
          className="text-xs md:text-sm text-warm-gray hover:text-forest"
        >
          <Icon name="chevronLeft" size={12} /> Kembali ke Beranda
        </Link>
        <a
          href={generateWhatsAppLink(ADMIN_WHATSAPP, WHATSAPP_JOIN_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-forest hover:underline"
        >
          <Icon name="whatsapp" size={14} /> Lebih suka chat WhatsApp?
        </a>
      </div>
    </div>
  );
}
