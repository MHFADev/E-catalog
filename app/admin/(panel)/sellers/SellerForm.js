"use client";
import { useState } from "react";
import { saveSeller } from "../actions";
import ImageUploader from "@/components/common/ImageUploader";

const inputClass =
  "w-full bg-cotton-pure border border-cotton-warm rounded-xl px-3 py-2 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-cherry/50 focus:ring-2 focus:ring-cherry/10 transition-all";

export default function SellerForm({ initial = null }) {
  const [message, setMessage] = useState("");

  return (
    <form
      action={async (formData) => {
        try {
          await saveSeller(formData);
          setMessage("Toko disimpan.");
        } catch (e) {
          setMessage(e.message || "Gagal menyimpan.");
        }
      }}
      className="space-y-3"
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

      <button type="submit" className="btn-primary text-sm py-2.5 px-5">
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
