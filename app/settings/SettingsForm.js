"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/common/Icon";
import PhotoUploader from "@/components/common/PhotoUploader";
import ImageUploader from "@/components/common/ImageUploader";
import { updateAccountAvatar, updatePaymentMethods } from "./actions";

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

  // Payment methods state
  const [enabledMethods, setEnabledMethods] = useState(seller?.enabledPaymentMethods || []);
  const [bankName, setBankName] = useState(seller?.bankName || "");
  const [bankAccountNumber, setBankAccountNumber] = useState(seller?.bankAccountNumber || "");
  const [bankAccountName, setBankAccountName] = useState(seller?.bankAccountName || "");
  const [ewalletType, setEwalletType] = useState(seller?.ewalletType || "");
  const [ewalletNumber, setEwalletNumber] = useState(seller?.ewalletNumber || "");
  const [qrisImage, setQrisImage] = useState(seller?.qrisImageUrl || "");
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");
  const [paymentBusy, setPaymentBusy] = useState(false);

  const saveAvatar = async (url) => {
    await updateAccountAvatar(url);
    router.refresh();
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentError("");
    setPaymentSuccess("");
    setPaymentBusy(true);
    const fd = new FormData();
    enabledMethods.forEach((m) => fd.append("enabledPaymentMethods", m));
    fd.set("bankName", bankName);
    fd.set("bankAccountNumber", bankAccountNumber);
    fd.set("bankAccountName", bankAccountName);
    fd.set("ewalletType", ewalletType);
    fd.set("ewalletNumber", ewalletNumber);
    fd.set("qrisImage", qrisImage);
    try {
      const res = await updatePaymentMethods(fd);
      if (res?.ok) {
        setPaymentSuccess("Metode pembayaran berhasil diperbarui.");
        router.refresh();
      }
    } catch (ex) {
      setPaymentError(ex.message || "Gagal memperbarui metode pembayaran.");
    }
    setPaymentBusy(false);
  };

  const toggleMethod = (method) => {
    setEnabledMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

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
              Kelola profil akun dan metode pembayaran toko.
            </p>
          </div>
        </div>

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

        {/* ===== METODE PEMBAYARAN ===== */}
        {seller && (
          <div className="bg-white rounded-2xl md:rounded-3xl border border-cream-warm shadow-sm">
            <div className="flex items-center gap-2 px-5 md:px-7 pt-5 md:pt-7 pb-1 border-b border-cream-warm">
              <Icon name="money" size={18} className="text-forest" />
              <h2 className="text-base font-bold text-noir">Metode Pembayaran (Gratis)</h2>
            </div>
            <form onSubmit={handlePaymentSubmit} className="p-5 md:p-7 space-y-4">
              <div className="flex flex-wrap gap-3">
                <label className="inline-flex items-center gap-2 px-3 py-2 bg-cream-pure border border-cream-warm rounded-xl cursor-pointer hover:border-forest/40 transition-all">
                  <input
                    type="checkbox"
                    checked={enabledMethods.includes("bank")}
                    onChange={() => toggleMethod("bank")}
                    className="w-4 h-4 text-forest border-cream-warm rounded focus:ring-forest"
                  />
                  <span className="text-xs font-medium text-noir">Transfer Bank</span>
                </label>
                <label className="inline-flex items-center gap-2 px-3 py-2 bg-cream-pure border border-cream-warm rounded-xl cursor-pointer hover:border-forest/40 transition-all">
                  <input
                    type="checkbox"
                    checked={enabledMethods.includes("ewallet")}
                    onChange={() => toggleMethod("ewallet")}
                    className="w-4 h-4 text-forest border-cream-warm rounded focus:ring-forest"
                  />
                  <span className="text-xs font-medium text-noir">E-Wallet</span>
                </label>
                <label className="inline-flex items-center gap-2 px-3 py-2 bg-cream-pure border border-cream-warm rounded-xl cursor-pointer hover:border-forest/40 transition-all">
                  <input
                    type="checkbox"
                    checked={enabledMethods.includes("qris")}
                    onChange={() => toggleMethod("qris")}
                    className="w-4 h-4 text-forest border-cream-warm rounded focus:ring-forest"
                  />
                  <span className="text-xs font-medium text-noir">QRIS</span>
                </label>
              </div>

              {enabledMethods.includes("bank") && (
                <div className="grid sm:grid-cols-2 gap-3 border-t border-cream-warm pt-4">
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Pilih Bank</option>
                    <option value="bca">BCA</option>
                    <option value="mandiri">Mandiri</option>
                    <option value="bri">BRI</option>
                    <option value="bni">BNI</option>
                    <option value="cimb">CIMB Niaga</option>
                    <option value="permata">Permata</option>
                    <option value="btn">BTN</option>
                    <option value="danamon">Danamon</option>
                  </select>
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="Nomor Rekening"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    placeholder="Nama Pemilik Rekening"
                    className={inputClass}
                  />
                </div>
              )}

              {enabledMethods.includes("ewallet") && (
                <div className="grid sm:grid-cols-2 gap-3 border-t border-cream-warm pt-4">
                  <select
                    value={ewalletType}
                    onChange={(e) => setEwalletType(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Pilih E-Wallet</option>
                    <option value="dana">DANA</option>
                    <option value="ovo">OVO</option>
                    <option value="gopay">GoPay</option>
                    <option value="shopeepay">ShopeePay</option>
                    <option value="linkaja">LinkAja</option>
                  </select>
                  <input
                    type="tel"
                    value={ewalletNumber}
                    onChange={(e) => setEwalletNumber(e.target.value)}
                    placeholder="Nomor Telepon / ID E-Wallet"
                    className={inputClass}
                  />
                </div>
              )}

              {enabledMethods.includes("qris") && (
                <div className="border-t border-cream-warm pt-4">
                  <ImageUploader
                    name="qrisImage"
                    label="Gambar QRIS"
                    defaultValue={qrisImage}
                    onChange={(e) => setQrisImage(e.target.value)}
                    hint="Upload gambar QRIS Anda (akan dikompres otomatis)."
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={paymentBusy}
                className="flex items-center gap-2 px-5 h-11 text-sm font-bold text-white bg-forest hover:bg-forest-deep disabled:opacity-60 rounded-2xl transition-colors"
              >
                <Icon name="check" size={15} />
                {paymentBusy ? "Menyimpan..." : "Simpan Metode Pembayaran"}
              </button>

              {paymentSuccess && (
                <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  {paymentSuccess}
                </p>
              )}
              {paymentError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {paymentError}
                </p>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}