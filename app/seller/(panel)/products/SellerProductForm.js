"use client";
import { useState } from "react";
import { saveSellerProduct } from "../../actions";
import ImageUploader from "@/components/common/ImageUploader";

const inputClass =
  "w-full bg-cotton-pure border border-cotton-warm rounded-xl px-3 py-2 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-cherry/50 focus:ring-2 focus:ring-cherry/10 transition-all";

export default function SellerProductForm({ categories, initial = null }) {
  const [message, setMessage] = useState("");

  return (
    <form
      action={async (formData) => {
        try {
          await saveSellerProduct(formData);
          setMessage("Produk disimpan.");
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
        <input
          name="tags"
          defaultValue={initial?.tags?.join(", ") ?? ""}
          placeholder="Tag, pisahkan koma (cth. kerupuk, pedas)"
          className={inputClass}
        />
        <div className="sm:col-span-2">
          <ImageUploader
            name="images"
            label="Gambar Produk"
            defaultValue={initial?.images?.join(", ") ?? ""}
          />
        </div>
        <div className="sm:col-span-2">
          <textarea
            name="description"
            defaultValue={initial?.description ?? ""}
            placeholder="Deskripsi produk"
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-noir-soft">
        <input type="checkbox" name="isAvailable" defaultChecked={initial?.isAvailable ?? true} />
        Tersedia / stok ada
      </label>

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
