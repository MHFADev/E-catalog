"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveProduct } from "../actions";
import ImageUploader from "@/components/common/ImageUploader";

const inputClass =
  "w-full bg-cream-pure border border-cream-warm rounded-xl px-3 py-2 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all disabled:cursor-not-allowed disabled:opacity-60";

export default function ProductForm({ categories, sellers, initial = null }) {
  const router = useRouter();
  const formRef = useRef(null);
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const handleSubmit = async (formData) => {
    setSaving(true);
    setFeedback(null);

    try {
      await saveProduct(formData);
      setFeedback({
        type: "success",
        message: initial ? "Perubahan produk berhasil disimpan." : "Produk baru berhasil dibuat.",
      });

      if (!initial) {
        formRef.current?.reset();
        setResetKey((key) => key + 1);
      }

      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error?.message || "Produk gagal disimpan. Coba lagi.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="product-name" className="mb-1.5 block text-xs font-semibold text-noir-soft">
            Nama produk <span className="text-clay">*</span>
          </label>
          <input
            id="product-name"
            name="name"
            defaultValue={initial?.name ?? ""}
            placeholder="Nama produk *"
            required
            disabled={saving}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="product-category" className="mb-1.5 block text-xs font-semibold text-noir-soft">
            Kategori <span className="text-clay">*</span>
          </label>
          <select
            id="product-category"
            name="categoryId"
            defaultValue={initial?.categoryId ?? ""}
            required
            disabled={saving}
            className={inputClass}
          >
            <option value="" disabled>Kategori *</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="product-seller" className="mb-1.5 block text-xs font-semibold text-noir-soft">
            Toko / UMKM <span className="text-clay">*</span>
          </label>
          <select
            id="product-seller"
            name="sellerId"
            defaultValue={initial?.sellerId ?? ""}
            required
            disabled={saving}
            className={inputClass}
          >
            <option value="" disabled>Toko / UMKM *</option>
            {sellers.map((seller) => (
              <option key={seller.id} value={seller.id}>{seller.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="product-price" className="mb-1.5 block text-xs font-semibold text-noir-soft">Harga</label>
          <input
            id="product-price"
            name="price"
            type="number"
            step="1"
            min="0"
            defaultValue={initial?.price ?? ""}
            placeholder="Kosongkan jika hubungi penjual"
            disabled={saving}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="product-price-unit" className="mb-1.5 block text-xs font-semibold text-noir-soft">Satuan harga</label>
          <input
            id="product-price-unit"
            name="priceUnit"
            defaultValue={initial?.priceUnit ?? ""}
            placeholder="Contoh: per porsi"
            disabled={saving}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <ImageUploader
            name="images"
            label="Gambar produk"
            defaultValue={initial?.images?.join(", ") ?? ""}
            resetSignal={resetKey}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="product-tags" className="mb-1.5 block text-xs font-semibold text-noir-soft">Tag produk</label>
          <input
            id="product-tags"
            name="tags"
            defaultValue={initial?.tags?.join(", ") ?? ""}
            placeholder="Pisahkan dengan koma, misalnya kerupuk, pedas"
            disabled={saving}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="product-description" className="mb-1.5 block text-xs font-semibold text-noir-soft">Deskripsi</label>
          <textarea
            id="product-description"
            name="description"
            defaultValue={initial?.description ?? ""}
            placeholder="Deskripsi produk"
            rows={3}
            disabled={saving}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-noir-soft">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isFeatured" defaultChecked={initial?.isFeatured ?? false} disabled={saving} />
          Unggulan
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isAvailable" defaultChecked={initial?.isAvailable ?? true} disabled={saving} />
          Tersedia
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="showPrice" defaultChecked={initial?.showPrice !== false} disabled={saving} />
          Tampilkan harga
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isPreOrder" defaultChecked={initial?.isPreOrder ?? false} disabled={saving} />
          Pre-Order (PO)
        </label>
      </div>

      <div>
        <label htmlFor="product-halal-status" className="mb-1.5 block text-xs font-semibold text-noir-soft">Status halal</label>
        <select
          id="product-halal-status"
          name="halalStatus"
          defaultValue={initial?.halalStatus ?? ""}
          disabled={saving}
          className={inputClass}
        >
          <option value="">Umum / belum dikategorikan</option>
          <option value="halal">Halal</option>
          <option value="non_halal">Non-Halal</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={saving} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-60">
          {saving ? "Menyimpan..." : initial ? "Simpan Perubahan" : "Tambah Produk"}
        </button>
        {!initial && <span className="text-[11px] text-warm-gray">Minimal satu gambar produk diperlukan.</span>}
      </div>

      {feedback && (
        <p
          role="status"
          className={`rounded-lg border px-3 py-2 text-xs ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </p>
      )}
    </form>
  );
}
