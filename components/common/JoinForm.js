"use client";
import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/common/Icon";
import ImageUploader from "@/components/common/ImageUploader";
import { submitJoinRequest } from "@/app/join/actions";
import { useUser } from "@/lib/useUser";

const inputClass =
  "w-full bg-cream-pure border border-cream-warm rounded-xl px-3 py-2.5 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all";

export default function JoinForm({ onClose }) {
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
        <Link
          href="/login?next=/gabung"
          onClick={onClose}
          className="btn-primary text-sm md:text-base"
        >
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
      const res = await submitJoinRequest(fd);
      if (res?.ok) setStatus("sent");
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
          Data usaha kamu sudah masuk ke panel admin beserta foto produknya.
          Setelah disetujui, semua data langsung terisi di akun penjualmu — kamu
          bisa kelola produk di{" "}
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
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          name="businessName"
          type="text"
          placeholder="Nama usaha / toko *"
          required
          className={inputClass}
        />
        <input
          name="ownerName"
          type="text"
          placeholder="Nama pemilik"
          className={inputClass}
        />
        <input
          name="whatsapp"
          type="tel"
          placeholder="No. WhatsApp usaha * (cth. 628...)"
          required
          className={inputClass}
        />
        <input
          name="categoryProduct"
          type="text"
          placeholder="Jenis produk (cth. makanan, kerajinan)"
          className={inputClass}
        />
        <div className="sm:col-span-2">
          <input
            name="address"
            type="text"
            placeholder="Alamat usaha"
            className={inputClass}
          />
        </div>
      </div>

      <div className="sm:col-span-2">
        <textarea
          name="description"
          placeholder="Deskripsi singkat usaha & produk andalan"
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </div>

      <ImageUploader
        name="productImage"
        label="Foto Produk Andalan (otomatis dikompres)"
        placeholder="URL foto produk"
      />

      <input
        name="notes"
        type="text"
        placeholder="Catatan tambahan (opsional)"
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
        Admin akan menyetujui permintaanmu di panel admin — data usaha langsung
        terisi di akun penjualmu.
      </p>
    </form>
  );
}