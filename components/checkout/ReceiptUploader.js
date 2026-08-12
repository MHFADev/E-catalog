"use client";
import { useState } from "react";
import Icon from "@/components/common/Icon";
import { compressImage } from "@/lib/compressImage";
import {
  BUCKET_RECEIPTS,
  dataUrlToBlob,
  sanitizeFileName,
  uploadToStorage,
} from "@/lib/storage";

// ============================================================
// Upload "Bukti Transfer / Pembayaran" pembeli.
// File dikompres webp -> di-upload ke bucket PRIVAT order-receipts
// (path receipts/<userId>/...). Hanya path yang disimpan (receiptPath),
// gambar dilihat penjual lewat route /api/orders/[id]/receipt.
// ============================================================

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_LABEL = ".jpg, .jpeg, .png, .webp";

export default function ReceiptUploader({ userId, value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErr(`Format tidak didukung. Gunakan ${ALLOWED_LABEL}.`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErr("Ukuran maksimal 10MB.");
      return;
    }

    setBusy(true);
    setErr("");
    try {
      const dataUrl = await compressImage(file, 1600, 0.8);
      const blob = dataUrlToBlob(dataUrl);
      const fileName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ""), "bukti-transfer");
      const path = await uploadToStorage({
        bucket: BUCKET_RECEIPTS,
        folder: userId ? `receipts/${userId}` : "receipts",
        file: new File([blob], fileName, { type: blob.type }),
      });
      if (typeof onChange === "function") onChange(path);
    } catch (ex) {
      setErr(ex.message || "Gagal mengunggah bukti.");
    }
    setBusy(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <label
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
            busy
              ? "bg-cream-warm text-warm-gray cursor-wait"
              : "bg-forest/10 text-forest border-forest/30 hover:bg-forest/15"
          }`}
        >
          <input
            type="file"
            accept={`${ALLOWED_TYPES.join(",")},${ALLOWED_LABEL}`}
            onChange={onFile}
            disabled={busy}
            className="hidden"
          />
          {busy ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
              Mengunggah...
            </>
          ) : (
            <>
              <Icon name="image" size={14} />
              {value ? "Ganti Bukti Transfer" : "Upload Bukti Transfer / Pembayaran"}
            </>
          )}
        </label>
        {value && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
            <Icon name="check" size={12} /> Terunggah
          </span>
        )}
      </div>
      <span className="block text-[10px] text-warm-gray mt-1">
        Foto struk / bukti transfer dari aplikasi bank atau e-wallet Anda.
        Format: {ALLOWED_LABEL}.
      </span>
      {err && <p className="text-xs text-forest mt-1.5">{err}</p>}
    </div>
  );
}
