"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerSellerAccount } from "./actions";

const inputClass =
  "w-full bg-cotton-pure border border-cotton-warm rounded-xl px-3 py-2.5 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-cherry/50 focus:ring-2 focus:ring-cherry/10 transition-all";

export default function PendingProfile() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!businessName.trim()) return;
    setBusy(true);
    setError("");
    setMessage("");
    const fd = new FormData();
    fd.set("businessName", businessName);
    fd.set("whatsapp", whatsapp);
    try {
      await registerSellerAccount(fd);
      setMessage("Profil terkirim ke admin. Menunggu persetujuan.");
      router.refresh();
    } catch (ex) {
      setError(ex.message || "Gagal menyimpan.");
    }
    setBusy(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm border border-cotton-warm">
        <h1 className="text-lg font-bold text-noir mb-1">
          Lengkapi Profil <span className="text-cherry">UMKM</span>
        </h1>
        <p className="text-xs text-warm-gray mb-4 leading-relaxed">
          Beri tahu kami usaha Anda. Admin akan menghubungkan akun ke toko UMKM
          di katalog sebelum Anda bisa kelola produk.
        </p>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Nama usaha UMKM *"
            required
            className={inputClass}
          />
          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="No. WhatsApp usaha (cth. 628...)"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={busy}
            className="btn-primary w-full text-sm py-2.5 disabled:opacity-60"
          >
            {busy ? "Mengirim..." : "Kirim Profil ke Admin"}
          </button>
        </form>
        {message && (
          <p className="mt-3 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-3 text-xs text-cherry bg-cherry/5 border border-cherry/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
