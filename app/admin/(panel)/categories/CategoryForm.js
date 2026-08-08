"use client";
import { useState } from "react";
import { saveCategory } from "../actions";
import ImageUploader from "@/components/common/ImageUploader";

const inputClass =
  "w-full bg-cream-pure border border-cream-warm rounded-xl px-3 py-2 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all";

export default function CategoryForm({ initial = null }) {
  const [message, setMessage] = useState("");
  // Naikkan resetKey usai sukses menyimpan supaya ImageUploader dibersihkan
  // (URL gambar yang sudah terpakai tidak tertinggal untuk input berikutnya).
  const [resetKey, setResetKey] = useState(0);

  return (
    <form
      action={async (formData) => {
        try {
          await saveCategory(formData);
          setMessage("Kategori disimpan.");
          setResetKey((k) => k + 1);
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
          placeholder="Nama kategori *"
          required
          className={inputClass}
        />
        <input
          name="icon"
          defaultValue={initial?.icon ?? ""}
          placeholder="Ikon (utensils, soup, gem, package, grid, gift, shopping-basket)"
          className={inputClass}
        />
        <div className="sm:col-span-2">
          <ImageUploader
            name="image"
            label="Gambar Kategori"
            defaultValue={initial?.image ?? ""}
            resetSignal={resetKey}
          />
        </div>
        <div className="sm:col-span-2">
          <textarea
            name="description"
            defaultValue={initial?.description ?? ""}
            placeholder="Deskripsi kategori"
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <button type="submit" className="btn-primary text-sm py-2.5 px-5">
        {initial ? "Simpan Perubahan" : "Tambah Kategori"}
      </button>

      {message && (
        <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          {message}
        </p>
      )}
    </form>
  );
}
