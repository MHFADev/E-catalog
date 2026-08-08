"use client";
import { useState } from "react";
import { saveProduct } from "../actions";
import ImageUploader from "@/components/common/ImageUploader";

const inputClass =
  "w-full bg-cream-pure border border-cream-warm rounded-xl px-3 py-2 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all";

export default function ProductForm({ categories, sellers, initial = null }) {
  const [message, setMessage] = useState("");
  // Naikkan resetKey usai sukses menyimpan supaya ImageUploader dibersihkan
  // (URL gambar yang sudah terpakai tidak tertinggal untuk input berikutnya).
  const [resetKey, setResetKey] = useState(0);

  return (
    <form
      action={async (formData) => {
        try {
          await saveProduct(formData);
          setMessage("Produk disimpan.");
          setResetKey((k) => k + 1);
        } catch (e) {
          setMessage(e.message || "Gagal menyimpan.");
        }
      }}
      className="space-y-3"
    >
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <input
            name="name"
            defaultValue={initial?.name}
            placeholder="Nama produk *"
            required
            className={inputClass}
          />
        </div>
        <select name="categoryId" defaultValue={initial?.categoryId} required className={inputClass}>
          <option value="" disabled>Kategori *</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select name="sellerId" defaultValue={initial?.sellerId} required className={inputClass}>
          <option value="" disabled>Toko / UMKM *</option>
          {sellers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <input
          name="price"
          type="number"
          step="1"
          min="0"
          defaultValue={initial?.price ?? ""}
          placeholder="Harga (angka, kosongkan jika hubungi penjual)"
          className={inputClass}
        />
        <input
          name="priceUnit"
          defaultValue={initial?.priceUnit ?? ""}
          placeholder="Satuan harga (cth. per porsi, Rp12.000 – Rp42.000)"
          className={inputClass}
        />
        <div className="sm:col-span-2">
          <ImageUploader
            name="images"
            label="Gambar Produk"
            defaultValue={initial?.images?.join(", ") ?? ""}
            resetSignal={resetKey}
          />
        </div>
        <div className="sm:col-span-2">
          <input
            name="tags"
            defaultValue={initial?.tags?.join(", ") ?? ""}
            placeholder="Tag, pisahkan koma (cth. kerupuk, pedas)"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <textarea
            name="description"
            defaultValue={initial?.description ?? ""}
            placeholder="Deskripsi produk"
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-noir-soft">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isFeatured" defaultChecked={initial?.isFeatured ?? false} />
          Unggulan
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isAvailable" defaultChecked={initial?.isAvailable ?? true} />
          Tersedia
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="showPrice" defaultChecked={initial?.showPrice !== false} />
          Tampilkan harga
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isPreOrder" defaultChecked={initial?.isPreOrder ?? false} />
          Pre-Order (PO)
          <span className="text-[11px] text-warm-gray">(produk dibuat setelah pesanan)</span>
        </label>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-noir-soft">Status Halal</label>
        <select
          name="halalStatus"
          defaultValue={initial?.halalStatus ?? ""}
          className={inputClass}
        >
          <option value="">Umum / belum dikategorikan</option>
          <option value="halal">Halal</option>
          <option value="non_halal">Non-Halal</option>
        </select>
      </div>

      <button type="submit" className="btn-primary text-sm py-2.5 px-5">
        {initial ? "Simpan Perubahan" : "Tambah Produk"}
      </button>

      {message && (
        <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          {message}
        </p>
      )}
    </form>
  );
}
