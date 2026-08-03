"use client";
import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/common/Icon";
import { registerSellerAccount } from "@/app/seller/actions";
import { useUser } from "@/lib/useUser";
import { generateWhatsAppLink } from "@/lib/generateWhatsAppLink";
import { ADMIN_WHATSAPP } from "@/lib/constants";

const WA_TEMPLATE = (d) =>
  [
    "Halo Admin E-Catalog UMKM Kemayoran",
    "",
    "Ada permintaan gabung sebagai mitra UMKM:",
    `- Nama usaha: ${d.businessName}`,
    `- WhatsApp: ${d.whatsapp}`,
    `- Akun login: ${d.email}`,
    "",
    "Mohon diverifikasi dan dihubungkan ke toko di panel admin ya. Terima kasih!",
  ].join("\n");

const inputClass =
  "w-full bg-cream-pure border border-cream-warm rounded-xl px-3 py-2.5 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all";

export default function JoinForm() {
  const { user, loading } = useUser();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-warm-gray text-sm">
        <span className="w-8 h-8 rounded-full border-2 border-cream-warm border-t-forest animate-spin mb-3" />
        Memuat...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-6 md:py-8">
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-laut/10 text-laut mb-4">
          <Icon name="lock" size={24} />
        </span>
        <h3 className="text-base md:text-lg font-bold text-noir mb-2">
          Login Dulu untuk Mendaftar
        </h3>
        <p className="text-xs md:text-sm text-warm-gray leading-relaxed max-w-sm mx-auto mb-5">
          Daftar sebagai mitra UMKM butuh akun. Setelah login, data usaha
          langsung masuk ke panel admin untuk disetujui — lalu akunmu jadi
          penjual dan kamu bisa kelola produk sendiri.
        </p>
        <Link href="/login?next=/gabung" className="btn-primary text-sm md:text-base">
          Masuk / Daftar Akun <Icon name="arrowRight" size={14} />
        </Link>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("sending");
    const fd = new FormData(e.target);
    try {
      await registerSellerAccount(fd);
      window.open(
        generateWhatsAppLink(
          ADMIN_WHATSAPP,
          WA_TEMPLATE({
            businessName: (fd.get("businessName") || "").toString().trim(),
            whatsapp: (fd.get("whatsapp") || "").toString().trim(),
            email: user.email,
          }),
        ),
        "_blank",
      );
      setStatus("sent");
    } catch (err) {
      setError(err.message || "Gagal menyimpan");
      setStatus("");
    }
  };

  if (status === "sent") {
    return (
      <div className="text-center py-6 md:py-8">
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mb-4">
          <Icon name="check" size={24} />
        </span>
        <h3 className="text-base md:text-lg font-bold text-noir mb-2">
          Permintaan Terkirim!
        </h3>
        <p className="text-xs md:text-sm text-warm-gray leading-relaxed max-w-sm mx-auto mb-5">
          Akunmu terdaftar sebagai calon mitra dan sedang menunggu persetujuan
          admin. Setelah disetujui, kamu bisa kelola produk di{" "}
          <Link href="/seller" className="text-forest font-semibold hover:underline">
            Area Penjual
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        name="businessName"
        type="text"
        placeholder="Nama usaha *"
        required
        className={inputClass}
      />
      <input
        name="whatsapp"
        type="tel"
        placeholder="No. WhatsApp *"
        required
        className={inputClass}
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-primary w-full text-sm py-3 disabled:opacity-60"
      >
        <Icon name="send" size={14} />
        {status === "sending" ? "Mengirim..." : "Kirim Permintaan Gabung"}
      </button>

      {error && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <p className="text-[10px] md:text-xs text-warm-gray text-center leading-relaxed">
        Terdaftar sebagai <span className="text-noir-soft">{user.email}</span>.
        Admin akan menyetujui permintaanmu di panel admin.
      </p>
    </form>
  );
}
