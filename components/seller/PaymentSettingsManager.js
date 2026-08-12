"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/common/Icon";
import PaymentLogo from "@/components/common/PaymentLogo";
import { compressImage } from "@/lib/compressImage";
import { savePaymentMethod, togglePaymentMethod, deletePaymentMethod } from "@/app/seller/(panel)/payment/actions";
import {
  BUCKET_PRODUCTS,
  dataUrlToBlob,
  publicImageUrl,
  sanitizeFileName,
  uploadToStorage,
} from "@/lib/storage";

// ============================================================
// Pengaturan Metode Pembayaran UMKM (manual, gratis, tanpa gateway).
// Penjual menambah metode secara dinamis: Bank / E-Wallet / QRIS,
// lengkap dengan nomor, nama pemilik, dan upload gambar QRIS.
// Disimpan ke tabel payment_methods dan dipakai pembeli saat checkout.
// ============================================================

const inputClass =
  "w-full bg-cream-pure border border-cream-warm rounded-xl px-3 py-2 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all";

const bankProviders = [
  { value: "bca", label: "BCA" },
  { value: "mandiri", label: "Mandiri" },
  { value: "bri", label: "BRI" },
  { value: "bni", label: "BNI" },
  { value: "cimb", label: "CIMB Niaga" },
  { value: "permata", label: "Permata" },
  { value: "btn", label: "BTN" },
  { value: "danamon", label: "Danamon" },
  { value: "lainnya", label: "Lainnya" },
];

const ewalletProviders = [
  { value: "dana", label: "DANA" },
  { value: "ovo", label: "OVO" },
  { value: "gopay", label: "GoPay" },
  { value: "shopeepay", label: "ShopeePay" },
  { value: "linkaja", label: "LinkAja" },
];

const typeMeta = {
  bank: { icon: "bank", title: "Transfer Bank" },
  ewallet: { icon: "mobile", title: "E-Wallet" },
  qris: { icon: "qrcode", title: "QRIS" },
};

function MethodRow({ method }) {
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const meta = typeMeta[method.method_type] || typeMeta.bank;

  return (
    <div className="bg-cream-pure border border-cream-warm rounded-xl p-3 md:p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <PaymentLogo
              methodName={method.label || method.provider}
              methodType={method.method_type}
              imgClassName="h-5 w-auto object-contain shrink-0"
              iconSize={16}
            />
            <span className="text-sm font-bold text-noir">
              {method.label || meta.title}
            </span>
            {!method.is_active && (
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold">
                Nonaktif
              </span>
            )}
          </div>
          <div className="text-[11px] md:text-xs text-warm-gray mt-0.5 leading-relaxed">
            {method.method_type === "qris" ? (
              "Scan QRIS untuk pembayaran"
            ) : (
              <>
                {method.account_number && (
                  <span className="font-mono font-semibold text-noir-soft">
                    {method.account_number}
                  </span>
                )}
                {method.account_name && ` a.n. ${method.account_name}`}
              </>
            )}
          </div>
          {method.method_type === "qris" && method.qris_image_url && (
            <img
              src={publicImageUrl(method.qris_image_url)}
              alt="QRIS"
              className="mt-2 w-24 h-24 aspect-square object-cover rounded-lg border border-cream-warm bg-white"
            />
          )}
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          <form
            action={async (fd) => {
              setBusy("toggle");
              setErr("");
              try {
                await togglePaymentMethod(fd);
              } catch (e) {
                setErr(e.message || "Gagal.");
              }
              setBusy("");
            }}
          >
            <input type="hidden" name="id" value={method.id} />
            <input
              type="hidden"
              name="active"
              value={String(!method.is_active)}
            />
            <button
              type="submit"
              disabled={busy === "toggle"}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all disabled:opacity-50 ${
                method.is_active
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  : "bg-cream-warm text-warm-gray border-cream-warm hover:bg-cream"
              }`}
            >
              {method.is_active ? "Aktif" : "Nonaktif"}
            </button>
          </form>
          <form
            action={async (fd) => {
              setBusy("del");
              setErr("");
              try {
                await deletePaymentMethod(fd);
              } catch (e) {
                setErr(e.message || "Gagal.");
              }
              setBusy("");
            }}
          >
            <input type="hidden" name="id" value={method.id} />
            <button
              type="submit"
              disabled={busy === "del"}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all disabled:opacity-50"
            >
              Hapus
            </button>
          </form>
        </div>
      </div>
      {err && <p className="text-[11px] text-red-600 mt-1.5">{err}</p>}
    </div>
  );
}

export default function PaymentSettingsManager({ sellerId, methods = [] }) {
  const router = useRouter();
  const [type, setType] = useState("bank");
  const [provider, setProvider] = useState("");
  const [qrisUrl, setQrisUrl] = useState("");
  const [qrisBusy, setQrisBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");

  const onQrisUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErr("Format QRIS harus .jpg, .png, atau .webp.");
      return;
    }
    setQrisBusy(true);
    setErr("");
    try {
      const dataUrl = await compressImage(file, 1000, 0.82);
      const blob = dataUrlToBlob(dataUrl);
      const fileName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ""), "qris");
      const path = await uploadToStorage({
        bucket: BUCKET_PRODUCTS,
        folder: sellerId ? `qris/${sellerId}` : "qris",
        file: new File([blob], fileName, { type: blob.type }),
      });
      setQrisUrl(publicImageUrl(path));
    } catch (ex) {
      setErr(ex.message || "Gagal mengunggah QRIS.");
    }
    setQrisBusy(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErr("");
    try {
      await savePaymentMethod(new FormData(e.currentTarget));
      setMessage("Metode pembayaran ditambahkan.");
      e.currentTarget.reset();
      setProvider("");
      setQrisUrl("");
      // Refresh data server supaya metode baru langsung muncul di daftar,
      // dan penjual bebas menambah metode lain berikutnya.
      router.refresh();
    } catch (ex) {
      setErr(ex.message || "Gagal menyimpan.");
    }
  };

  const providers = type === "ewallet" ? ewalletProviders : bankProviders;

  return (
    <div className="space-y-5">
      {/* Daftar metode saat ini */}
      {methods.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-warm-gray">
            Metode Aktif ({methods.filter((m) => m.is_active).length})
          </h3>
          {methods.map((m) => (
            <MethodRow key={m.id} method={m} />
          ))}
        </div>
      )}

      {/* Form tambah metode */}
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl border border-cream-warm p-4 md:p-5"
      >
        <h3 className="flex items-center gap-2 text-sm font-bold text-noir mb-3">
          <Icon name="plus" size={15} className="text-forest" />
          Tambah Metode Pembayaran
        </h3>

        <div className="grid sm:grid-cols-2 gap-3">
          <select
            name="methodType"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setProvider("");
            }}
            className={inputClass}
          >
            <option value="bank">Transfer Bank</option>
            <option value="ewallet">E-Wallet</option>
            <option value="qris">QRIS</option>
          </select>

          {type !== "qris" && (
            <select
              name="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className={inputClass}
            >
              <option value="">Pilih {type === "bank" ? "Bank" : "E-Wallet"} (opsional)</option>
              {providers.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          )}

          <input
            name="label"
            placeholder={type === "bank" ? "Label (cth. Bank BCA)" : type === "ewallet" ? "Label (cth. DANA)" : "Label QRIS (cth. QRIS)"}
            className={inputClass}
          />

          {type !== "qris" ? (
            <>
              <input
                name="accountNumber"
                placeholder={type === "bank" ? "Nomor rekening *" : "Nomor / ID e-wallet *"}
                className={inputClass}
              />
              {type === "bank" && (
                <input
                  name="accountName"
                  placeholder="Nama pemilik rekening"
                  className={inputClass}
                />
              )}
            </>
          ) : (
            <div>
              <div className="flex items-center gap-3">
                {qrisUrl && (
                  <img
                    src={qrisUrl}
                    alt="QRIS"
                    className="w-16 h-16 aspect-square object-cover rounded-lg border border-cream-warm bg-white"
                  />
                )}
                <label
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                    qrisBusy
                      ? "bg-cream-warm text-warm-gray cursor-wait"
                      : "bg-forest/10 text-forest border-forest/30 hover:bg-forest/15"
                  }`}
                >
                  <input type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={onQrisUpload} disabled={qrisBusy} className="hidden" />
                  {qrisBusy ? "Mengunggah..." : qrisUrl ? "Ganti QRIS" : "Upload Gambar QRIS *"}
                </label>
              </div>
              <input type="hidden" name="qrisImageUrl" value={qrisUrl} />
              <span className="block text-[10px] text-warm-gray mt-1">
                Disimpan di Supabase Storage.
              </span>
            </div>
          )}
        </div>

        {/* Pratinjau logo resmi provider yang sedang dipilih */}
        <div className="mt-3 flex items-center gap-3 bg-cream-pure border border-cream-warm rounded-xl px-4 py-3">
          <span className="flex items-center justify-center bg-white rounded-lg border border-cream-warm px-2 py-1.5 shrink-0">
            <PaymentLogo
              methodName={type === "qris" ? "qris" : provider}
              methodType={type}
              imgClassName="h-8 w-auto object-contain"
              iconSize={20}
            />
          </span>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-noir">Pratinjau Logo</div>
            <div className="text-[10px] text-warm-gray">
              Logo resmi {type === "bank" ? "bank" : type === "ewallet" ? "e-wallet" : "QRIS"} akan
              tampil kepada pembeli saat checkout.
            </div>
          </div>
        </div>

        {message && (
          <p className="mt-3 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            {message}
          </p>
        )}
        {err && (
          <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {err}
          </p>
        )}

        <button type="submit" className="btn-primary text-sm py-2.5 px-5 mt-4">
          Simpan Metode Pembayaran
        </button>
      </form>

      <p className="text-[11px] text-warm-gray leading-relaxed">
        Kamu bisa menambahkan <strong>banyak metode pembayaran</strong> (mis.
        beberapa bank, e-wallet, dan QRIS sekaligus). Metode yang{" "}
        <strong>Aktif</strong> akan tampil kepada pembeli saat checkout. Semua
        transaksi manual tanpa biaya platform.
      </p>
    </div>
  );
}
