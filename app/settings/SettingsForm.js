"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/common/Icon";
import PhotoUploader from "@/components/common/PhotoUploader";
import {
  updateAccountAvatar,
  updateAccountProfile,
  changeUserPassword,
  updateSellerStore,
  updateStorePhoto,
  updateUserPreferences,
} from "./actions";
import { createClient } from "@/lib/supabase/client";
import VideoEmbed from "@/components/common/VideoEmbed";

const inputClass =
  "w-full bg-cream-pure border border-cream-warm rounded-xl px-3.5 py-2.5 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all";

export default function SettingsForm({ user, seller }) {
  const router = useRouter();

  // Active tab state
  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "security" | "store" | "notifications"

  // Status message (banner alert)
  const [statusMsg, setStatusMsg] = useState(null); // { type: "success" | "error", text: string }

  // 1. Profil state
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [fullName, setFullName] = useState(user.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
  const [profileSaving, setProfileSaving] = useState(false);

  // 2. Keamanan & Sandi state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // 3. Toko state (jika penjual)
  const [storeLogo, setStoreLogo] = useState(seller?.logo || "");
  const [storeName, setStoreName] = useState(seller?.name || "");
  const [storeWhatsapp, setStoreWhatsapp] = useState(seller?.whatsapp || "");
  const [storeWhatsappAlt, setStoreWhatsappAlt] = useState(seller?.whatsapp_alt || "");
  const [storeAddress, setStoreAddress] = useState(seller?.address || "");
  const [storeDescription, setStoreDescription] = useState(seller?.description || "");
  const [storeVideoUrl, setStoreVideoUrl] = useState(seller?.video_url || "");
  const [storeSaving, setStoreSaving] = useState(false);

  // 4. Preferensi & Notifikasi state
  const userPrefs = user.preferences || {};
  const [notifyEmail, setNotifyEmail] = useState(userPrefs.notify_email !== false);
  const [notifyWa, setNotifyWa] = useState(userPrefs.notify_wa !== false);
  const [notifySound, setNotifySound] = useState(userPrefs.notify_sound || false);
  const [prefsSaving, setPrefsSaving] = useState(false);

  // Browser Push Notification state
  const [browserPermission, setBrowserPermission] = useState("default");
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const requestBrowserNotification = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setStatusMsg({
        type: "error",
        text: "Browser Anda tidak mendukung notifikasi sistem.",
      });
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setBrowserPermission(perm);
      if (perm === "granted") {
        new Notification("Katalog UMKM Kemayoran", {
          body: "Notifikasi browser berhasil diaktifkan!",
          icon: "/favicon.svg",
        });
        setStatusMsg({
          type: "success",
          text: "Izin notifikasi browser berhasil diberikan.",
        });
      } else if (perm === "denied") {
        setStatusMsg({
          type: "error",
          text: "Izin notifikasi diblokir oleh browser. Anda dapat membukanya di pengaturan situs browser.",
        });
      }
    } catch {
      setStatusMsg({
        type: "error",
        text: "Gagal meminta izin notifikasi browser.",
      });
    }
  };

  // 5. Ekspor Pesanan CSV state
  const [exportBusy, setExportBusy] = useState(false);

  // Handle Save Avatar
  const handleAvatarUploaded = async (url) => {
    try {
      setAvatarUrl(url);
      await updateAccountAvatar(url);
      setStatusMsg({ type: "success", text: "Foto profil berhasil diperbarui." });
      router.refresh();
    } catch (err) {
      setStatusMsg({ type: "error", text: err.message || "Gagal menyimpan foto profil." });
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setStatusMsg(null);
    try {
      await updateAccountProfile({ fullName, phoneNumber });
      setStatusMsg({ type: "success", text: "Informasi profil akun berhasil disimpan." });
      router.refresh();
    } catch (err) {
      setStatusMsg({ type: "error", text: err.message || "Gagal menyimpan profil." });
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setStatusMsg(null);
    if (!newPassword || newPassword.length < 6) {
      setStatusMsg({ type: "error", text: "Kata sandi minimal harus 6 karakter." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: "error", text: "Konfirmasi kata sandi tidak cocok." });
      return;
    }

    setPasswordSaving(true);
    try {
      await changeUserPassword(newPassword);
      setNewPassword("");
      setConfirmPassword("");
      setStatusMsg({
        type: "success",
        text: "Kata sandi berhasil diperbarui! Silakan gunakan kata sandi baru untuk login berikutnya.",
      });
    } catch (err) {
      setStatusMsg({ type: "error", text: err.message || "Gagal memperbarui kata sandi." });
    } finally {
      setPasswordSaving(false);
    }
  };

  // Handle Store Logo Upload
  const handleStoreLogoUploaded = async (url) => {
    try {
      setStoreLogo(url);
      await updateStorePhoto(url);
      setStatusMsg({ type: "success", text: "Foto/logo toko berhasil diperbarui." });
      router.refresh();
    } catch (err) {
      setStatusMsg({ type: "error", text: err.message || "Gagal menyimpan foto toko." });
    }
  };

  // Handle Save Store Info
  const handleSaveStore = async (e) => {
    e.preventDefault();
    setStoreSaving(true);
    setStatusMsg(null);
    try {
      const formData = new FormData();
      formData.set("name", storeName);
      formData.set("whatsapp", storeWhatsapp);
      formData.set("whatsapp_alt", storeWhatsappAlt);
      formData.set("address", storeAddress);
      formData.set("description", storeDescription);
      formData.set("video_url", storeVideoUrl);

      await updateSellerStore(formData);
      setStatusMsg({ type: "success", text: "Informasi toko berhasil diperbarui." });
      router.refresh();
    } catch (err) {
      setStatusMsg({ type: "error", text: err.message || "Gagal menyimpan data toko." });
    } finally {
      setStoreSaving(false);
    }
  };

  // Handle Save Preferences
  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setPrefsSaving(true);
    setStatusMsg(null);
    try {
      await updateUserPreferences({
        notify_email: notifyEmail,
        notify_wa: notifyWa,
        notify_sound: notifySound,
      });
      setStatusMsg({ type: "success", text: "Preferensi notifikasi berhasil disimpan." });
    } catch (err) {
      setStatusMsg({ type: "error", text: err.message || "Gagal menyimpan preferensi." });
    } finally {
      setPrefsSaving(false);
    }
  };

  // Handle Export Orders CSV
  const handleExportOrders = async () => {
    if (!seller?.id) return;
    setExportBusy(true);
    setStatusMsg(null);
    try {
      const supabase = createClient();
      const { data: orders, error } = await supabase
        .from("orders")
        .select("order_number, created_at, product_id, quantity, unit_price, total, status, buyer_name, buyer_phone, buyer_address, notes")
        .eq("seller_id", seller.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!orders || orders.length === 0) {
        setStatusMsg({
          type: "error",
          text: "Belum ada riwayat transaksi pesanan untuk toko Anda.",
        });
        setExportBusy(false);
        return;
      }

      const headers = [
        "Nomor Pesanan",
        "Tanggal",
        "ID Produk",
        "Jumlah",
        "Harga Satuan",
        "Total (Rp)",
        "Status",
        "Nama Pembeli",
        "No Telepon",
        "Alamat",
        "Catatan",
      ];

      const rows = orders.map((o) => [
        o.order_number || "-",
        new Date(o.created_at).toLocaleString("id-ID"),
        o.product_id || "-",
        o.quantity || 1,
        o.unit_price || 0,
        o.total || 0,
        o.status || "-",
        o.buyer_name || "-",
        o.buyer_phone || "-",
        o.buyer_address || "-",
        o.notes || "-",
      ]);

      const csvContent = [headers, ...rows]
        .map((row) =>
          row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pesanan-${(seller.name || "umkm").toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMsg({
        type: "success",
        text: `Berhasil mengunduh ${orders.length} data transaksi pesanan.`,
      });
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: err.message || "Gagal mengekspor data pesanan.",
      });
    } finally {
      setExportBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream pb-16">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        {/* Header Title */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-forest/10 text-forest shadow-sm">
            <Icon name="settings" size={22} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-noir">
              Pengaturan Akun &amp; Toko
            </h1>
            <p className="text-xs md:text-sm text-warm-gray">
              Kelola informasi profil akun, keamanan, toko UMKM, dan preferensi aplikasi.
            </p>
          </div>
        </div>

        {/* Status Alert Banner */}
        {statusMsg && (
          <div
            className={`mb-6 flex items-start justify-between gap-3 rounded-2xl p-4 text-sm font-medium transition-all ${
              statusMsg.type === "success"
                ? "border border-forest/20 bg-forest/10 text-forest"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Icon
                name={statusMsg.type === "success" ? "check" : "info"}
                size={17}
                className="shrink-0"
              />
              <span>{statusMsg.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMsg(null)}
              className="text-xs font-bold hover:underline"
              aria-label="Tutup pesan"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 border-b border-cream-warm pb-3 mb-6 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "profile"
                ? "bg-forest text-white shadow-sm"
                : "bg-white text-noir-soft hover:bg-cream-warm/60 border border-cream-warm"
            }`}
          >
            <Icon name="user" size={14} />
            <span>Profil Akun</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "security"
                ? "bg-forest text-white shadow-sm"
                : "bg-white text-noir-soft hover:bg-cream-warm/60 border border-cream-warm"
            }`}
          >
            <Icon name="lock" size={14} />
            <span>Keamanan &amp; Sandi</span>
          </button>

          {seller && (
            <button
              type="button"
              onClick={() => setActiveTab("store")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === "store"
                  ? "bg-forest text-white shadow-sm"
                  : "bg-white text-noir-soft hover:bg-cream-warm/60 border border-cream-warm"
              }`}
            >
              <Icon name="store" size={14} />
              <span>Profil Toko UMKM</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "notifications"
                ? "bg-forest text-white shadow-sm"
                : "bg-white text-noir-soft hover:bg-cream-warm/60 border border-cream-warm"
            }`}
          >
            <Icon name="bell" size={14} />
            <span>Preferensi &amp; Ekspor</span>
          </button>
        </div>

        {/* TAB 1: PROFIL AKUN */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            {/* Foto Profil */}
            <div className="rounded-2xl border border-cream-warm bg-white p-5 md:p-6 shadow-sm">
              <h2 className="text-sm md:text-base font-bold text-noir mb-1">
                Foto Profil
              </h2>
              <p className="text-xs text-warm-gray mb-4">
                Foto profil akun Anda yang akan tampil di ulasan dan identitas akun.
              </p>
              <PhotoUploader
                value={avatarUrl}
                round
                label=""
                buttonLabel="Ubah Foto Profil"
                onUploaded={handleAvatarUploaded}
              />
            </div>

            {/* Informasi Identitas */}
            <form
              onSubmit={handleSaveProfile}
              className="rounded-2xl border border-cream-warm bg-white p-5 md:p-6 shadow-sm space-y-4"
            >
              <h2 className="text-sm md:text-base font-bold text-noir mb-1">
                Informasi Pengguna
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-noir-soft">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama lengkap Anda"
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-noir-soft">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className={inputClass}
                />
                <p className="text-[11px] text-warm-gray">
                  Digunakan untuk kontak konfirmasi pesanan atau notifikasi penting.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-noir-soft">
                    Alamat Email (Login)
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full rounded-xl border border-cream-warm bg-cream-warm/40 px-3.5 py-2.5 text-sm text-warm-gray cursor-not-allowed"
                  />
                  <p className="text-[11px] text-warm-gray">Email utama akun tidak dapat diubah.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-noir-soft">
                    Username
                  </label>
                  <div className="flex items-center justify-between rounded-xl border border-cream-warm bg-cream-warm/40 px-3.5 py-2.5 text-sm text-noir">
                    <span className="font-mono">@{user.username || "belum-diatur"}</span>
                    <Link
                      href="/profile"
                      className="text-xs font-bold text-forest hover:underline"
                    >
                      Ubah di Profil &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-forest px-6 text-sm font-bold text-white transition-all hover:bg-forest-deep disabled:opacity-50"
                >
                  {profileSaving ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="check" size={14} />
                      <span>Simpan Perubahan Profil</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: KEAMANAN & KATA SANDI */}
        {activeTab === "security" && (
          <form
            onSubmit={handleChangePassword}
            className="rounded-2xl border border-cream-warm bg-white p-5 md:p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-cream-warm">
              <Icon name="lock" size={18} className="text-forest" />
              <div>
                <h2 className="text-sm md:text-base font-bold text-noir">
                  Ubah Kata Sandi
                </h2>
                <p className="text-xs text-warm-gray">
                  Pastikan kata sandi baru Anda kuat dan tidak mudah ditebak.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-noir-soft">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className={inputClass}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-warm-gray hover:text-noir"
                  aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                >
                  <Icon name={showPassword ? "eyeOff" : "eye"} size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-noir-soft">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang kata sandi baru"
                className={inputClass}
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordSaving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-forest px-6 text-sm font-bold text-white transition-all hover:bg-forest-deep disabled:opacity-50"
              >
                {passwordSaving ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Memperbarui Sandi...</span>
                  </>
                ) : (
                  <>
                    <Icon name="key" size={14} />
                    <span>Perbarui Kata Sandi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: PROFIL TOKO UMKM (SELLER ONLY) */}
        {activeTab === "store" && seller && (
          <div className="space-y-6">
            {/* Foto / Logo Toko */}
            <div className="rounded-2xl border border-cream-warm bg-white p-5 md:p-6 shadow-sm">
              <h2 className="text-sm md:text-base font-bold text-noir mb-1">
                Foto / Logo Toko
              </h2>
              <p className="text-xs text-warm-gray mb-4">
                Foto ini akan tampil di profil toko dan kartu katalog produk Anda.
              </p>
              <PhotoUploader
                value={storeLogo}
                label=""
                buttonLabel="Ubah Foto Toko"
                onUploaded={handleStoreLogoUploaded}
              />
            </div>

            {/* Informasi Toko */}
            <form
              onSubmit={handleSaveStore}
              className="rounded-2xl border border-cream-warm bg-white p-5 md:p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-cream-warm">
                <div>
                  <h2 className="text-sm md:text-base font-bold text-noir">
                    Detail Usaha / Toko
                  </h2>
                  <p className="text-xs text-warm-gray">
                    Informasi publik yang dilihat oleh pengunjung dan calon pembeli.
                  </p>
                </div>
                <Link
                  href="/seller"
                  className="text-xs font-bold text-forest hover:underline"
                >
                  Lihat Toko Saya &rarr;
                </Link>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-noir-soft">
                  Nama Toko / Usaha <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Nama toko UMKM Anda"
                  className={inputClass}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-noir-soft">
                    WhatsApp Utama (Pemesanan) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={storeWhatsapp}
                    onChange={(e) => setStoreWhatsapp(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className={inputClass}
                    required
                  />
                  <p className="text-[11px] text-warm-gray">
                    Nomor WhatsApp aktif untuk menerima chat pesanan dari katalog.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-noir-soft">
                    WhatsApp Cadangan (Opsional)
                  </label>
                  <input
                    type="tel"
                    value={storeWhatsappAlt}
                    onChange={(e) => setStoreWhatsappAlt(e.target.value)}
                    placeholder="Nomor alternatif bila ada"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-noir-soft">
                  Alamat Usaha / Lokasi Toko
                </label>
                <input
                  type="text"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  placeholder="Jalan, RT/RW, Kelurahan di Kemayoran"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-noir-soft">
                  Deskripsi Singkat Usaha
                </label>
                <textarea
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  rows={3}
                  placeholder="Jelaskan produk unggulan, jam operasional, atau kelebihan toko Anda..."
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-noir-soft">
                    Video Profil / Suasana Toko (YouTube / TikTok / Instagram / MP4)
                  </label>
                  {storeVideoUrl && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                      Autoplay aktif
                    </span>
                  )}
                </div>
                <input
                  type="url"
                  value={storeVideoUrl}
                  onChange={(e) => setStoreVideoUrl(e.target.value)}
                  placeholder="Contoh: https://www.youtube.com/watch?v=... atau tautan TikTok / Instagram Reel"
                  className={inputClass}
                />
                <p className="text-[11px] text-warm-gray">
                  Mendukung tautan YouTube (termasuk Shorts), TikTok, Instagram Reels, Facebook Video, Vimeo, atau link file video langsung (.mp4). Video akan otomatis diputar (autoplay &amp; loop) di etalase produk Anda.
                </p>

                {storeVideoUrl && (
                  <div className="mt-3 p-3 bg-cream-pure border border-cream-warm rounded-xl">
                    <div className="text-[11px] font-bold text-noir-soft mb-2 flex items-center gap-1.5">
                      <Icon name="eye" size={12} className="text-forest" />
                      <span>Pratinjau Video (Autoplay):</span>
                    </div>
                    <div className="max-w-md mx-auto">
                      <VideoEmbed url={storeVideoUrl} title="Pratinjau Video Toko" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-cream-warm">
                <button
                  type="submit"
                  disabled={storeSaving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-forest px-6 text-sm font-bold text-white transition-all hover:bg-forest-deep disabled:opacity-50"
                >
                  {storeSaving ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Menyimpan Toko...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="check" size={14} />
                      <span>Simpan Data Toko</span>
                    </>
                  )}
                </button>

                <Link
                  href="/seller/payment"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline"
                >
                  <Icon name="settings" size={13} />
                  <span>Pengaturan Rekening &amp; QRIS &rarr;</span>
                </Link>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: PREFERENSI & EKSPOR */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            {/* Preferensi Notifikasi */}
            <form
              onSubmit={handleSavePreferences}
              className="rounded-2xl border border-cream-warm bg-white p-5 md:p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-cream-warm">
                <Icon name="bell" size={18} className="text-forest" />
                <div>
                  <h2 className="text-sm md:text-base font-bold text-noir">
                    Preferensi Notifikasi
                  </h2>
                  <p className="text-xs text-warm-gray">
                    Atur bagaimana Anda ingin menerima kabar terkait pesanan dan akun.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 rounded-xl border border-cream-warm bg-cream-pure p-3.5 cursor-pointer hover:border-forest/40 transition-all">
                  <input
                    type="checkbox"
                    checked={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.checked)}
                    className="mt-0.5 size-4 text-forest rounded border-cream-warm focus:ring-forest"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-noir">Notifikasi Email</div>
                    <div className="text-warm-gray">
                      Terima rangkuman pesanan dan pembaruan sistem melalui email akun ({user.email}).
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-xl border border-cream-warm bg-cream-pure p-3.5 cursor-pointer hover:border-forest/40 transition-all">
                  <input
                    type="checkbox"
                    checked={notifyWa}
                    onChange={(e) => setNotifyWa(e.target.checked)}
                    className="mt-0.5 size-4 text-forest rounded border-cream-warm focus:ring-forest"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-noir">Direct WhatsApp Shortcut</div>
                    <div className="text-warm-gray">
                      Tampilkan tombol buka WhatsApp instan setelah pembeli membuat pesanan.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-xl border border-cream-warm bg-cream-pure p-3.5 cursor-pointer hover:border-forest/40 transition-all">
                  <input
                    type="checkbox"
                    checked={notifySound}
                    onChange={(e) => setNotifySound(e.target.checked)}
                    className="mt-0.5 size-4 text-forest rounded border-cream-warm focus:ring-forest"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-noir">Bunyi Suara Notifikasi</div>
                    <div className="text-warm-gray">
                      Putar bunyi lonceng halus saat pesanan baru berhasil masuk di halaman toko.
                    </div>
                  </div>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={prefsSaving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-forest px-6 text-sm font-bold text-white transition-all hover:bg-forest-deep disabled:opacity-50"
                >
                  {prefsSaving ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="check" size={14} />
                      <span>Simpan Preferensi</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Notifikasi Browser (Web Push) */}
            <div className="rounded-2xl border border-cream-warm bg-white p-5 md:p-6 shadow-sm space-y-3">
              <h2 className="text-sm md:text-base font-bold text-noir">
                Notifikasi Browser (Desktop &amp; Ponsel)
              </h2>
              <p className="text-xs text-warm-gray leading-relaxed">
                Aktifkan notifikasi browser agar Anda dapat menerima pemberitahuan langsung saat ada pembeli yang memesan produk.
              </p>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-cream-warm bg-cream/60 p-3.5">
                <div className="text-xs">
                  <span className="font-semibold text-noir">Status Izin: </span>
                  <span
                    className={`font-bold ${
                      browserPermission === "granted"
                        ? "text-forest"
                        : browserPermission === "denied"
                        ? "text-red-600"
                        : "text-amber-600"
                    }`}
                  >
                    {browserPermission === "granted"
                      ? "Aktif (Diizinkan)"
                      : browserPermission === "denied"
                      ? "Diblokir Browser"
                      : "Belum Diaktifkan"}
                  </span>
                </div>

                {browserPermission !== "granted" && (
                  <button
                    type="button"
                    onClick={requestBrowserNotification}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-forest px-4 text-xs font-bold text-white hover:bg-forest-deep transition-all"
                  >
                    <Icon name="bell" size={12} />
                    <span>Minta Izin</span>
                  </button>
                )}
              </div>
            </div>

            {/* Ekspor Data Pesanan (Seller Only) */}
            {seller && (
              <div className="rounded-2xl border border-cream-warm bg-white p-5 md:p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Icon name="download" size={18} className="text-forest" />
                  <h2 className="text-sm md:text-base font-bold text-noir">
                    Ekspor Data Riwayat Transaksi (CSV)
                  </h2>
                </div>
                <p className="text-xs text-warm-gray leading-relaxed">
                  Unduh seluruh riwayat pesanan toko Anda ke dalam format berkas CSV untuk kebutuhan pembukuan, Excel, atau laporan bulanan.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleExportOrders}
                    disabled={exportBusy}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-forest px-6 text-sm font-bold text-white transition-all hover:bg-forest-deep disabled:opacity-50"
                  >
                    {exportBusy ? (
                      <>
                        <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Menyiapkan File CSV...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="download" size={14} />
                        <span>Unduh Laporan CSV Pesanan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}