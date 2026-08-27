"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/common/Icon";
import PhotoUploader from "@/components/common/PhotoUploader";
import ImageUploader from "@/components/common/ImageUploader";
import { updateAccountAvatar, updatePaymentMethods, updateSellerStore } from "./actions";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full bg-cream-pure border border-cream-warm rounded-xl px-3 py-2.5 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all";

const bankOptions = [
  { value: "bca", label: "BCA" },
  { value: "mandiri", label: "Mandiri" },
  { value: "bri", label: "BRI" },
  { value: "bni", label: "BNI" },
  { value: "cimb", label: "CIMB Niaga" },
  { value: "permata", label: "Permata" },
  { value: "btn", label: "BTN" },
  { value: "danamon", label: "Danamon" },
];

const ewalletOptions = [
  { value: "dana", label: "DANA" },
  { value: "ovo", label: "OVO" },
  { value: "gopay", label: "GoPay" },
  { value: "shopeepay", label: "ShopeePay" },
  { value: "linkaja", label: "LinkAja" },
];

export default function SettingsForm({ user, seller }) {
  const router = useRouter();

  // --- Profile avatar ---
  const saveAvatar = async (url) => {
    await updateAccountAvatar(url);
    router.refresh();
  };

  // --- 1. NOTIFIKASI PESANAN ---
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(false);
  const saveNotifications = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("seller_accounts")
      .update({ notify_email: notifyEmail, notify_push: notifyPush })
      .eq("user_id", user.id);
    router.refresh();
  };

  // --- 2. MODE LIBUR (Vacation Mode) ---
  const [vacationMode, setVacationMode] = useState(false);
  const [vacationMsg, setVacationMsg] = useState("Toko sedang libur, akan buka kembali segera.");
  const saveVacationMode = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("seller_accounts")
      .update({ vacation_mode: vacationMode, vacation_message: vacationMsg })
      .eq("user_id", user.id);
    router.refresh();
  };

  // --- 3. EKSPOR DATA PESANAN (CSV) ---
  const [exportBusy, setExportBusy] = useState(false);
  const exportOrders = async () => {
    if (!seller) return;
    setExportBusy(true);
    const supabase = createClient();
    const { data: orders } = await supabase
      .from("orders")
      .select("*, products(name), payment_methods(provider, method_type)")
      .eq("seller_id", seller.id)
      .order("created_at", { ascending: false });
    if (!orders?.length) {
      alert("Tidak ada data pesanan.");
      setExportBusy(false);
      return;
    }
    const headers = ["Nomor Pesanan","Tanggal","Produk","Jumlah","Total","Status","Pembayaran","Pembeli","Telepon","Alamat"];
    const rows = orders.map(o => [
      o.order_number,
      new Date(o.created_at).toLocaleDateString("id-ID"),
      o.products?.name || "-",
      o.quantity,
      o.total || 0,
      o.status,
      o.payment_methods?.provider ? `${o.payment_methods.method_type}: ${o.payment_methods.provider}` : "-",
      o.buyer_name,
      o.buyer_phone || "-",
      o.buyer_address || "-",
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `pesanan-${seller.name}-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    setExportBusy(false);
  };

  // --- 4. TEMA GELAP/TERANG (Dark Mode) ---
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) setDarkMode(saved === "true");
    else setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  // --- 5. PESAN AUTO-BALAS ---
  const [autoReply, setAutoReply] = useState(false);
  const [autoReplyMsg, setAutoReplyMsg] = useState("Terima kasih sudah menghubungi kami! Kami akan membalas segera.");
  const saveAutoReply = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("seller_accounts")
      .update({ auto_reply: autoReply, auto_reply_message: autoReplyMsg })
      .eq("user_id", user.id);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 py-10 md:py-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-forest/10 text-forest">
            <Icon name="settings" size={20} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-noir">
              Pengaturan
            </h1>
            <p className="text-xs text-muted">
              Kelola profil akun, notifikasi, dan preferensi toko.
            </p>
          </div>
        </div>

        {/* ===== 1. PROFIL AKUN ===== */}
        <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-7 border border-cream-warm shadow-sm mb-4">
          <div className="text-sm font-bold text-noir mb-1">Profil Akun</div>
          <p className="text-xs text-muted mb-4">
            Ini adalah akun login Anda di situs ini. Foto profil yang Anda
            panggang otomatis dikompres lalu disimpan ke GitHub.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <PhotoUploader
              value={user.avatarUrl}
              round
              label="Foto Profil Akun"
              buttonLabel="Ubah Foto Profil"
              onUploaded={saveAvatar}
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-noir truncate">
                {user.fullName ?? user.email}
              </div>
              <div className="text-xs text-muted truncate">{user.email}</div>
            </div>
          </div>
        </div>

        {/* ===== 2. NOTIFIKASI PESANAN ===== */}
        <div className="bg-white rounded-2xl md:rounded-3xl border border-cream-warm shadow-sm mb-4">
          <div className="flex items-center gap-2 px-5 md:px-7 pt-5 md:pt-7 pb-1 border-b border-cream-warm">
            <Icon name="bell" size={18} className="text-forest" />
            <h2 className="text-base font-bold text-noir">Notifikasi Pesanan</h2>
          </div>
          <div className="p-5 md:p-7 space-y-4">
            <p className="text-xs text-muted">Pilih notifikasi yang ingin Anda terima saat ada pesanan baru.</p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 px-3 py-3 bg-cream-pure border border-cream-warm rounded-xl cursor-pointer hover:border-forest/40 transition-all">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="w-5 h-5 text-forest border-cream-warm rounded focus:ring-forest"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-noir">Notifikasi Email</div>
                  <div className="text-xs text-muted">Kirim email ke alamat akun saat ada pesanan baru</div>
                </div>
              </label>
              <label className="flex items-center gap-3 px-3 py-3 bg-cream-pure border border-cream-warm rounded-xl cursor-pointer hover:border-forest/40 transition-all">
                <input
                  type="checkbox"
                  checked={notifyPush}
                  onChange={(e) => setNotifyPush(e.target.checked)}
                  className="w-5 h-5 text-forest border-cream-warm rounded focus:ring-forest"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-noir">Notifikasi Push (Browser)</div>
                  <div className="text-xs text-muted">Tampilkan notifikasi browser saat ada pesanan baru (perlu izin)</div>
                </div>
              </label>
            </div>
            <button
              onClick={saveNotifications}
              className="flex items-center gap-2 px-5 h-11 text-sm font-bold text-white bg-forest hover:bg-forest-deep rounded-2xl transition-colors"
            >
              <Icon name="check" size={15} /> Simpan Preferensi Notifikasi
            </button>
          </div>
        </div>

        {/* ===== 3. MODE LIBUR ===== */}
        {seller && (
          <div className="bg-white rounded-2xl md:rounded-3xl border border-cream-warm shadow-sm mb-4">
            <div className="flex items-center gap-2 px-5 md:px-7 pt-5 md:pt-7 pb-1 border-b border-cream-warm">
              <Icon name="moon" size={18} className="text-forest" />
              <h2 className="text-base font-bold text-noir">Mode Libur (Vacation Mode)</h2>
            </div>
            <div className="p-5 md:p-7 space-y-4">
              <p className="text-xs text-muted">Sembunyikan produk dari katalog sementara saat toko libur.</p>
              <label className="flex items-center gap-3 px-3 py-3 bg-cream-pure border border-cream-warm rounded-xl cursor-pointer hover:border-forest/40 transition-all">
                <input
                  type="checkbox"
                  checked={vacationMode}
                  onChange={(e) => setVacationMode(e.target.checked)}
                  className="w-5 h-5 text-forest border-cream-warm rounded focus:ring-forest"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-noir">Aktifkan Mode Libur</div>
                  <div className="text-xs text-muted">Produk toko tidak akan tampil di katalog publik</div>
                </div>
              </label>
              {vacationMode && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-noir-soft">Pesan yang ditampilkan ke pembeli</label>
                  <textarea
                    value={vacationMsg}
                    onChange={(e) => setVacationMsg(e.target.value)}
                    rows={3}
                    className={inputClass}
                    placeholder="cth: Toko sedang libur hingga 1 Januari. Terima kasih."
                  />
                </div>
              )}
              <button
                onClick={saveVacationMode}
                className="flex items-center gap-2 px-5 h-11 text-sm font-bold text-white bg-forest hover:bg-forest-deep rounded-2xl transition-colors"
              >
                <Icon name="check" size={15} /> {vacationMode ? "Aktifkan Mode Libur" : "Simpan Pengaturan"}
              </button>
            </div>
          </div>
        )}

        {/* ===== 4. EKSPOR DATA PESANAN ===== */}
        {seller && (
          <div className="bg-white rounded-2xl md:rounded-3xl border border-cream-warm shadow-sm mb-4">
            <div className="flex items-center gap-2 px-5 md:px-7 pt-5 md:pt-7 pb-1 border-b border-cream-warm">
              <Icon name="download" size={18} className="text-forest" />
              <h2 className="text-base font-bold text-noir">Ekspor Data Pesanan (CSV)</h2>
            </div>
            <div className="p-5 md:p-7 space-y-4">
              <p className="text-xs text-muted">Unduh semua data pesanan toko Anda dalam format CSV untuk analisis atau laporan.</p>
              <button
                onClick={exportOrders}
                disabled={exportBusy}
                className="flex items-center gap-2 px-5 h-11 text-sm font-bold text-white bg-forest hover:bg-forest-deep disabled:opacity-60 rounded-2xl transition-colors"
              >
                {exportBusy ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Menyiapkan CSV...
                  </>
                ) : (
                  <>
                    <Icon name="download" size={15} /> Unduh CSV Pesanan
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ===== 5. TEMA GELAP/TERANG ===== */}
        <div className="bg-white rounded-2xl md:rounded-3xl border border-cream-warm shadow-sm mb-4">
          <div className="flex items-center gap-2 px-5 md:px-7 pt-5 md:pt-7 pb-1 border-b border-cream-warm">
            <Icon name="sun" size={18} className="text-forest" />
            <h2 className="text-base font-bold text-noir">Tema Tampilan</h2>
          </div>
          <div className="p-5 md:p-7 space-y-4">
            <p className="text-xs text-muted">Pilih tema tampilan situs untuk akun Anda.</p>
            <div className="flex gap-4">
              <label className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${darkMode ? "border-cream-warm" : "border-forest bg-forest/5"}`} onClick={() => setDarkMode(false)}>
                <Icon name="sun" size={28} className={darkMode ? "text-muted" : "text-forest"} />
                <span className={`font-medium ${darkMode ? "text-muted" : "text-forest"}`}>Terang</span>
                <span className="text-xs text-muted">Tema default</span>
              </label>
              <label className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${darkMode ? "border-forest bg-forest/5" : "border-cream-warm"}`} onClick={() => setDarkMode(true)}>
                <Icon name="moon" size={28} className={darkMode ? "text-forest" : "text-muted"} />
                <span className={`font-medium ${darkMode ? "text-forest" : "text-muted"}`}>Gelap</span>
                <span className="text-xs text-muted">Mata lebih nyaman</span>
              </label>
            </div>
            <p className="text-xs text-muted">Preferensi disimpan di browser Anda (localStorage).</p>
          </div>
        </div>

        {/* ===== 6. PESAN AUTO-BALAS ===== */}
        {seller && (
          <div className="bg-white rounded-2xl md:rounded-3xl border border-cream-warm shadow-sm mb-4">
            <div className="flex items-center gap-2 px-5 md:px-7 pt-5 md:pt-7 pb-1 border-b border-cream-warm">
              <Icon name="messageSquare" size={18} className="text-forest" />
              <h2 className="text-base font-bold text-noir">Pesan Auto-Balas</h2>
            </div>
            <div className="p-5 md:p-7 space-y-4">
              <p className="text-xs text-muted">Kirim balasan otomatis ke pembeli saat mereka menghubungi via WhatsApp/chat.</p>
              <label className="flex items-center gap-3 px-3 py-3 bg-cream-pure border border-cream-warm rounded-xl cursor-pointer hover:border-forest/40 transition-all">
                <input
                  type="checkbox"
                  checked={autoReply}
                  onChange={(e) => setAutoReply(e.target.checked)}
                  className="w-5 h-5 text-forest border-cream-warm rounded focus:ring-forest"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-noir">Aktifkan Auto-Balas</div>
                  <div className="text-xs text-muted">Kirim pesan otomatis saat pembeli mengirim pesan pertama</div>
                </div>
              </label>
              {autoReply && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-noir-soft">Isi Pesan Auto-Balas</label>
                  <textarea
                    value={autoReplyMsg}
                    onChange={(e) => setAutoReplyMsg(e.target.value)}
                    rows={3}
                    className={inputClass}
                    placeholder="cth: Terima kasih sudah menghubungi! Kami akan membalas dalam 1x24 jam."
                  />
                </div>
              )}
              <button
                onClick={saveAutoReply}
                className="flex items-center gap-2 px-5 h-11 text-sm font-bold text-white bg-forest hover:bg-forest-deep rounded-2xl transition-colors"
              >
                <Icon name="check" size={15} /> Simpan Auto-Balas
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}