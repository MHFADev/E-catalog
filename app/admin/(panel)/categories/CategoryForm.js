"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveCategory } from "../actions";
import ImageUploader from "@/components/common/ImageUploader";

const inputClass =
  "w-full bg-cream-pure border border-cream-warm rounded-xl px-3 py-2 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all";

export default function CategoryForm({ initial = null }) {
  const router = useRouter();
  const formRef = useRef(null);
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const handleSubmit = async (formData) => {
    setSaving(true);
    setFeedback(null);

    try {
      await saveCategory(formData);
      setFeedback({
        type: "success",
        message: initial ? "Perubahan kategori berhasil disimpan." : "Kategori baru berhasil dibuat.",
      });

      if (!initial) {
        formRef.current?.reset();
        setResetKey((key) => key + 1);
      }

      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error?.message || "Kategori gagal disimpan. Coba lagi.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="category-name" className="mb-1.5 block text-xs font-semibold text-noir-soft">
            Nama kategori <span className="text-clay">*</span>
          </label>
          <input
            id="category-name"
            name="name"
            defaultValue={initial?.name}
            placeholder="Contoh: Produk Segar"
            maxLength={80}
            required
            disabled={saving}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="category-icon" className="mb-1.5 block text-xs font-semibold text-noir-soft">
            Ikon
          </label>
          <input
            id="category-icon"
            name="icon"
            defaultValue={initial?.icon ?? ""}
            placeholder="Contoh: utensils, soup, gift"
            disabled={saving}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <ImageUploader
            name="image"
            label="Gambar kategori"
            defaultValue={initial?.image ?? ""}
            resetSignal={resetKey}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="category-description" className="mb-1.5 block text-xs font-semibold text-noir-soft">
            Deskripsi
          </label>
          <textarea
            id="category-description"
            name="description"
            defaultValue={initial?.description ?? ""}
            placeholder="Keterangan singkat agar mudah dikenali pengunjung"
            rows={3}
            maxLength={300}
            disabled={saving}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary text-sm py-2.5 px-5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Menyimpan..." : initial ? "Simpan Perubahan" : "Tambah Kategori"}
        </button>
        {!initial && <span className="text-[11px] text-warm-gray">ID kategori dibuat otomatis dari nama.</span>}
      </div>

      {feedback && (
        <p
          role="status"
          className={`text-xs rounded-lg px-3 py-2 border ${
            feedback.type === "success"
              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
              : "text-red-700 bg-red-50 border-red-200"
          }`}
        >
          {feedback.message}
        </p>
      )}
    </form>
  );
}
