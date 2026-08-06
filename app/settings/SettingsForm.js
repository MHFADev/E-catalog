"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/common/Icon";
import { updateSellerStore } from "./actions";

const inputClass =
  "w-full bg-cream-pure border border-cream-warm rounded-xl px-3 py-2.5 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all";

export default function SettingsForm({ user, seller }) {
  const router = useRouter();
  const [name, setName] = useState(seller?.name || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    const fd = new FormData();
    fd.set("name", name.trim());
    try {
      const res = await updateSellerStore(fd);
      if (res?.ok) {
        setSuccess("Nama toko berhasil diperbarui.");
        router.refresh();
      }
    } catch (ex) {
      setError(ex.message || "Gagal memperbarui nama toko.");
    }
    setBusy(false);
  };

  const initial = (user.fullName || "?").slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 py-10 md:py-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-forest/10 text-forest">
            <Icon name="sunFilled" size={20} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-noir">
              Pengaturan
            </h1>
            <p className="text-xs text-muted">
              Kelola profil akun dan data toko Anda.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-7 border border-cream-warm shadow-sm mb-4">
          <div className="text-sm font-bold text-noir mb-1">Profil Akun</div>
          <p className="text-xs text-muted mb-4">
            Ini adalah akun login Anda di situs ini.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-forest/95 to-forest text-white text-lg font-extrabold">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-noir truncate">
                {user.fullName ?? user.email}
              </div>
              <div className="text-xs text-muted truncate">{user.email}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl border border-cream/100 shadow-sm">
          <div className="flex items-center gap-2 px-5 md:px-7 pt-5 md:pt-7 pb-1">
            <Icon name="store" size={18} className="text-forest" />
            <h2 className="text-base font-bold text-noir">Data Toko</h2>
          </div>

          {seller ? (
            <form onSubmit={onSubmit} className="p-5 md:p-7 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-noir-soft">
                  Nama Toko / Usaha UMKM
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={inputClass}
                />
                <p className="text-[11px] text-warm-gray">
                  Nama ini yang tampil pada katalog publik untuk toko Anda.
                </p>
              </div>

              <div className="text-xs text-muted">
                WhatsApp toko:{" "}
                <span className="font-semibold text-noir-soft">
                  {seller.whatsapp || "—"}
                </span>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="flex items-center gap-2 px-5 h-11 text-sm font-bold text-white bg-forest hover:bg-forest-deep disabled:opacity-60 rounded-2xl transition-colors"
              >
                <Icon name="check" size={15} />
                {busy ? "Menyimpan..." : "Simpan Nama Toko"}
              </button>

              {success && (
                <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  {success}
                </p>
              )}
              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </form>
          ) : (
            <div className="p-5 md:p-7 text-sm text-muted">
              Anda belum memiliki toko yang disetujui. Nama toko bisa diubah
              setelah profil UMKM Anda disetujui admin melalui{" "}
              <span className="font-mono">/seller</span>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}