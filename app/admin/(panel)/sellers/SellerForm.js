"use client";
import { useState } from "react";
import { saveSeller } from "../actions";
import ImageUploader from "@/components/common/ImageUploader";
import Icon from "@/components/common/Icon";

const inputClass =
  "w-full bg-cream-pure border border-cream-warm rounded-xl px-3 py-2 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all";

const bankOptions = [
  { value: "bca", label: "BCA" },
  { value: "mandiri", label: "Mandiri" },
  { value: "bri", label: "BRI" },
  { value: "bni", label: "BNI" },
  { value: "cimb", label: "CIMB Niaga" },
  { value: "permata", label: "Permata" },
  { value: "btn", label: "BTN" },
  { value: "danamon", label: "Danamon" },
  { value: "", label: "Lainnya" },
];

const ewalletOptions = [
  { value: "dana", label: "DANA" },
  { value: "ovo", label: "OVO" },
  { value: "gopay", label: "GoPay" },
  { value: "shopeepay", label: "ShopeePay" },
  { value: "linkaja", label: "LinkAja" },
];

export default function SellerForm({ initial = null }) {
  const [message, setMessage] = useState("");
  // Naikkan resetKey usai sukses menyimpan supaya ImageUploader dibersihkan
  // (URL gambar yang sudah terpakai tidak tertinggal untuk input berikutnya).
  const [resetKey, setResetKey] = useState(0);

  return (
    <form
      action={async (formData) => {
        try {
          await saveSeller(formData);
          setMessage("Toko disimpan.");
          setResetKey((k) => k + 1);
        } catch (e) {
          setMessage(e.message || "Gagal menyimpan.");
        }
      }}
      className="space-y-4"
    >
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <div className="grid sm:grid-cols-2 gap-3">
        <input
          name="name"
          defaultValue={initial?.name}
          placeholder="Nama toko / usaha *"
          required
          className={inputClass}
        />
        <input
          name="owner"
          defaultValue={initial?.owner ?? ""}
          placeholder="Nama pemilik"
          className={inputClass}
        />
        <input
          name="whatsapp"
          defaultValue={initial?.whatsapp}
          placeholder="No. WhatsApp * (cth. 628xxxxxxxxxx)"
          required
          className={inputClass}
        />
        <input
          name="whatsappAlt"
          defaultValue={initial?.whatsapp_alt ?? ""}
          placeholder="WhatsApp alternatif"
          className={inputClass}
        />
        <div className="sm:col-span-2">
          <input
            name="address"
            defaultValue={initial?.address ?? ""}
            placeholder="Alamat"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <ImageUploader
            name="logo"
            label="Logo Toko"
            defaultValue={initial?.logo ?? ""}
            resetSignal={resetKey}
          />
        </div>
        <div className="sm:col-span-2">
          <input
            name="videoUrl"
            defaultValue={initial?.video_url ?? ""}
            placeholder="URL video (cth. link YouTube https://www.youtube.com/watch?v=...)"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <textarea
            name="description"
            defaultValue={initial?.description ?? ""}
            placeholder="Deskripsi toko"
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      {/* ===== METODE PEMBAYARAN ===== */}
      <div className="border-t border-cream-warm pt-4">
        <h4 className="flex items-center gap-2 text-sm font-bold text-noir mb-3">
          <Icon name="money" size={16} className="text-forest" />
          Metode Pembayaran (Gratis)
        </h4>

        {/* Enabled payment methods checkboxes */}
        <div className="flex flex-wrap gap-3 mb-4">
          <label className="inline-flex items-center gap-2 px-3 py-2 bg-cream-pure border border-cream-warm rounded-xl cursor-pointer hover:border-forest/40 transition-all">
            <input
              type="checkbox"
              name="enabledPaymentMethods"
              value="bank"
              defaultChecked={initial?.enabled_payment_methods?.includes("bank")}
              className="w-4 h-4 text-forest border-cream-warm rounded focus:ring-forest"
            />
            <span className="text-xs font-medium text-noir">Transfer Bank</span>
          </label>
          <label className="inline-flex items-center gap-2 px-3 py-2 bg-cream-pure border border-cream-warm rounded-xl cursor-pointer hover:border-forest/40 transition-all">
            <input
              type="checkbox"
              name="enabledPaymentMethods"
              value="ewallet"
              defaultChecked={initial?.enabled_payment_methods?.includes("ewallet")}
              className="w-4 h-4 text-forest border-cream-warm rounded focus:ring-forest"
            />
            <span className="text-xs font-medium text-noir">E-Wallet</span>
          </label>
          <label className="inline-flex items-center gap-2 px-3 py-2 bg-cream-pure border border-cream-warm rounded-xl cursor-pointer hover:border-forest/40 transition-all">
            <input
              type="checkbox"
              name="enabledPaymentMethods"
              value="qris"
              defaultChecked={initial?.enabled_payment_methods?.includes("qris")}
              className="w-4 h-4 text-forest border-cream-warm rounded focus:ring-forest"
            />
            <span className="text-xs font-medium text-noir">QRIS</span>
          </label>
        </div>

        {/* Bank Transfer Fields */}
        <div className="grid sm:grid-cols-2 gap-3 mb-4" id="bankFields">
          <div className="sm:col-span-2">
            {/* defaultValue pada <select> menentukan opsi yang terpilih saat form
                pertama dirender, bukan defaultSelected pada tiap <option>. */}
            <select name="bankName" className={inputClass} defaultValue={initial?.bank_name ?? ""}>
              <option value="">Pilih Bank</option>
              {bankOptions.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
          <input
            name="bankAccountNumber"
            type="text"
            defaultValue={initial?.bank_account_number ?? ""}
            placeholder="Nomor Rekening"
            className={inputClass}
          />
          <input
            name="bankAccountName"
            type="text"
            defaultValue={initial?.bank_account_name ?? ""}
            placeholder="Nama Pemilik Rekening"
            className={inputClass}
          />
        </div>

        {/* E-Wallet Fields */}
        <div className="grid sm:grid-cols-2 gap-3 mb-4" id="ewalletFields">
          <select name="ewalletType" className={inputClass} defaultValue={initial?.ewallet_type ?? ""}>
            <option value="">Pilih E-Wallet</option>
            {ewalletOptions.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
          <input
            name="ewalletNumber"
            type="tel"
            defaultValue={initial?.ewallet_number ?? ""}
            placeholder="Nomor Telepon / ID E-Wallet"
            className={inputClass}
          />
        </div>

        {/* QRIS Image */}
        <div className="mb-4" id="qrisFields">
          <ImageUploader
            name="qrisImage"
            label="Gambar QRIS"
            defaultValue={initial?.qris_image_url ?? ""}
            resetSignal={resetKey}
          />
        </div>
      </div>

      <button type="submit" className="btn-primary text-sm py-2.5 px-5 w-full sm:w-auto">
        {initial ? "Simpan Perubahan" : "Tambah Toko"}
      </button>

      {message && (
        <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          {message}
        </p>
      )}
    </form>
  );
}
