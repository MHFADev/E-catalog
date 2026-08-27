"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/common/Icon";
import LogoutButton from "./LogoutButton";
import { updateUsername, updateAccountAvatar, updateStorePhoto, updateSellerStore } from "./actions";
import PhotoUploader from "@/components/common/PhotoUploader";
import { useRouter } from "next/navigation";

const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;

function cooldownLabel(ts) {
  const rem = ts - Date.now();
  if (rem <= 0) return null;
  const days = Math.ceil(rem / 86400000);
  if (days >= 365) {
    const y = Math.floor(days / 365);
    const d = days % 365;
    return d ? `${y} tahun ${d} hari` : `${y} tahun`;
  }
  if (days >= 30) {
    const m = Math.floor(days / 30);
    const d = days % 30;
    return d ? `${m} bulan ${d} hari` : `${m} bulan`;
  }
  return `${days} hari`;
}

export default function ProfileForm({
  user,
  profile,
  canRename,
  approvedSeller,
  sellerLogo,
  seller,
}) {
  const router = useRouter();
  const [username, setUsername] = useState(profile?.username || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);



  const current = profile?.username || "";
  const cooldown = profile?.username_updated_at
    ? cooldownLabel(
        new Date(profile.username_updated_at).getTime() + TWO_YEARS_MS
      )
    : null;

  const initial = (user.fullName || "?").slice(0, 1).toUpperCase();
  const shortName = user.fullName;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    const fd = new FormData();
    fd.set("username", username.trim().toLowerCase());
    try {
      const res = await updateUsername(fd);
      if (res?.ok) {
        setSuccess("Username berhasil diperbarui.");
        setUsername("");
      }
    } catch (ex) {
      setError(ex.message || "Gagal memperbarui username.");
    } finally {
      setBusy(false);
    }
  };

  const saveAvatar = async (url) => {
    try {
      await updateAccountAvatar(url);
      router.refresh();
      setSuccess("Foto profil berhasil diperbarui.");
    } catch (ex) {
      setError(ex.message || "Gagal memperbarui foto profil.");
    }
  };

  const saveStorePhoto = async (url) => {
    try {
      await updateStorePhoto(url);
      router.refresh();
      setSuccess("Foto toko berhasil diperbarui.");
    } catch (ex) {
      setError(ex.message || "Gagal memperbarui foto toko.");
    }
  };

  const handleStoreNameSubmit = async (e) => {
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
    } finally {
      setBusy(false);
    }
  };



  const [name, setName] = useState(seller?.name || "");

  return (
    <div className="relative min-h-screen bg-cream overflow-hidden">
      {/* dekorasi background */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-forest/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-[#F59E0B]/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 w-72 h-72 bg-[#438BC4]/10 rounded-full blur-3xl" />

      <div className="relative max-w-3xl mx-auto px-4 py-10 md:py-16">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-noir">
            Profil Saya
          </h1>
          <p className="mt-1 text-sm text-muted">
            Kelola username dan akses toko Anda.
          </p>
        </div>

        <div className=" bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl shadow-card overflow-hidden">
          {/* kartu identitas */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-6 bg-gradient-to-br from-forest/95 to-forest text-white">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur ring-2 ring-white/40 relative">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={shortName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-extrabold">{initial}</span>
              )}
            </div>
            <div className="text-center sm:text-left">
              <div className="text-lg font-bold">{shortName}</div>
              <div className="text-sm text-white/80">{user.email}</div>
              {current && (
                <div className="mt-1 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-white/20 rounded-full">
                  <Icon name="user" size={12} /> @{current}
                </div>
              )}
            </div>
          </div>

          {/* foto profil akun - untuk semua user */}
          <section className="p-6 space-y-3 border-b border-cream-warm">
            <div className="flex items-center gap-2">
              <Icon name="user" size={18} className="text-forest" />
              <h2 className="text-base font-bold text-noir">Foto Profil Akun</h2>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Foto ini akan tampil di komentar dan ulasan Anda.
            </p>
            <PhotoUploader
              value={profile?.avatar_url}
              round
              label="Foto Profil"
              buttonLabel="Ubah Foto Profil"
              hint="Foto akan dikompres otomatis. Maksimal 1200px."
              onUploaded={saveAvatar}
            />
          </section>

          {/* form rename username */}
          <div className="p-6 space-y-6">
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon name="user" size={18} className="text-forest" />
                <h2 className="text-base font-bold text-noir">Username</h2>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                Username Anda saat ini:{" "}
                <span className="font-semibold text-noir">@{current}</span>.
                username bisa diubah{" "}
                <span className="font-semibold text-noir">
                  1 kali setiap 2 tahun
                </span>{" "}
                dan bersifat unik di seluruh pengguna.
              </p>

              {canRename ? (
                <form
                  onSubmit={onSubmit}
                  className="mt-1 flex flex-col sm:flex-row gap-3"
                >
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                      @
                    </span>
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username baru"
                      minLength={3}
                      maxLength={20}
                      pattern="[a-z0-9_]+"
                      required
                      className="w-full pl-9 pr-4 h-12 bg-cream border border-cream-warm rounded-2xl text-sm text-noir outline-none focus:border-forest/50 focus:ring-4 focus:ring-forest/10 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="flex items-center justify-center gap-2 px-5 h-12 text-sm font-bold text-white bg-forest hover:bg-forest-deep disabled:bg-muted/50 rounded-2xl transition-colors"
                  >
                    <Icon name="check" size={15} /> Ganti Username
                  </button>
                </form>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-cream/70 border border-cream-warm rounded-2xl text-sm">
                  <Icon
                    name="lock"
                    size={18}
                    className="text-forest mt-0.5 shrink-0"
                  />
                  <p className="text-muted">
                    Anda sudah mengubah username. Periode tunggu masih berlaku
                    hingga{" "}
                    <span className="font-semibold text-noir">{cooldown}</span>{" "}
                    lagi sebelum bisa mengubah kembali.
                  </p>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm">
                  <Icon
                    name="cancelFilled"
                    size={17}
                    className="mt-0.5 shrink-0"
                  />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-start gap-2 p-3 bg-[#F0FDF4] text-forest border border-[#BBF7D0] rounded-2xl text-sm">
                  <Icon name="check" size={17} className="mt-0.5 shrink-0" />
                  <span>{success}</span>
                </div>
              )}
            </section>

            <hr className="border-cream-warm" />

            {/* kartu toko / masukan */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon name="shopFilled" size={18} className="text-forest" />
                <h2 className="text-base font-bold text-noir">Toko Saya</h2>
              </div>

              {approvedSeller ? (
                <>
                  {/* Foto toko - untuk penjual terverifikasi */}
                  <section className="p-4 bg-forest/5 border border-forest/15 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon name="image" size={18} className="text-forest" />
                      <h3 className="text-sm font-semibold text-noir">Foto Toko / Logo UMKM</h3>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">
                      Tampil sebagai logo toko Anda di katalog publik dan halaman produk.
                    </p>
                    <PhotoUploader
                      value={sellerLogo}
                      label="Foto Toko / Logo"
                      buttonLabel="Ubah Foto Toko"
                      hint="Foto akan dikompres otomatis. Maksimal 1200px."
                      onUploaded={saveStorePhoto}
                    />
                  </section>

                  {/* Nama Toko */}
                  <section className="p-4 bg-forest/5 border border-forest/15 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon name="edit" size={18} className="text-forest" />
                      <h3 className="text-sm font-semibold text-noir">Nama Toko / Usaha UMKM</h3>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">
                      Nama ini yang tampil pada katalog publik untuk toko Anda.
                    </p>
                    <form onSubmit={handleStoreNameSubmit} className="space-y-3">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full bg-cream-pure border border-cream-warm rounded-xl px-3 py-2.5 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all"
                      />
                      <button
                        type="submit"
                        disabled={busy}
                        className="flex items-center gap-2 px-5 h-11 text-sm font-bold text-white bg-forest hover:bg-forest-deep disabled:opacity-60 rounded-2xl transition-colors"
                      >
                        <Icon name="check" size={15} />
                        {busy ? "Menyimpan..." : "Simpan Nama Toko"}
                      </button>
                      {error && (
                        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                          {error}
                        </p>
                      )}
                      {success && (
                        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                          {success}
                        </p>
                      )}
                    </form>
                  </section>

                  {/* Metode Pembayaran kini dikelola di Area Penjual */}
                  <section className="flex flex-col gap-3 rounded-2xl border border-forest/15 bg-forest/5 p-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Icon name="money" size={18} className="text-forest" />
                        <h3 className="text-sm font-semibold text-noir">Metode Pembayaran</h3>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted">
                        Tambahkan beberapa rekening bank, e-wallet, atau QRIS dari Area Penjual.
                      </p>
                    </div>
                    <Link
                      href="/seller/payment"
                      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-forest px-4 text-xs font-bold text-white transition-colors hover:bg-forest-deep"
                    >
                      Kelola Pembayaran <Icon name="arrowRight" size={14} />
                    </Link>
                  </section>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-forest/5 border border-forest/15 rounded-2xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm font-semibold text-noir">
                        <Icon
                          name="badgeCheck"
                          size={16}
                          className="text-forest"
                        />
                        Status: Penjual Terverifikasi
                      </div>
                      <p className="mt-0.5 text-sm text-muted">
                        Kelola toko, produk, dan pesanan Anda.
                      </p>
                    </div>
                    <Link
                      href="/seller"
                      className="inline-flex items-center justify-center gap-2 px-5 h-11 text-sm font-bold text-white bg-forest hover:bg-forest-deep rounded-2xl transition-colors"
                    >
                      <Icon name="store" size={15} /> Buka Toko
                    </Link>
                  </div>
                </>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-cream/70 border border-cream-warm rounded-2xl">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-noir">
                      Belum punya toko
                    </div>
                    <p className="mt-0.5 text-sm text-muted">
                      Daftarkan usaha UMKM Anda ke situs kami.
                    </p>
                  </div>
                  <Link
                    href="/seller"
                    className="inline-flex items-center justify-center gap-2 px-5 h-11 text-sm font-semibold text-noir-soft hover:bg-white border border-create rounded-2xl transition-colors"
                  >
                    <Icon name="arrowRight" size={15} /> Daftar UMKM
                  </Link>
                </div>
              )}
            </section>

            <hr className="border-cream-warm" />

            {/* [LOGOUT] Tombol keluar dari akun, ditempatkan di bagian bawah halaman profil */}
            <section className="flex justify-end">
              <LogoutButton />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}