"use client";
import { useState } from "react";
import Icon from "@/components/common/Icon";
import ImageUploader from "@/components/common/ImageUploader";
import { saveBanner } from "../actions";

const inputClass =
  "w-full bg-cream-pure border border-cream-warm rounded-xl px-3 py-2 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all";

export default function BannerForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  // Naikkan resetKey usai sukses menyimpan supaya ImageUploader dibersihkan
  // (URL gambar yang sudah terpakai tidak tertinggal untuk input berikutnya).
  const [resetKey, setResetKey] = useState(0);

  return (
    <form
      action={async (formData) => {
        setError("");
        setMessage("");
        try {
          await saveBanner(formData);
          setMessage("Banner berhasil disimpan.");
          setResetKey((k) => k + 1);
        } catch (e) {
          setError(e.message || "Gagal menyimpan banner.");
        }
      }}
      className="space-y-3"
    >
      <ImageUploader
        name="imageUrl"
        label="Gambar Banner (wajib, otomatis dikompres)"
        placeholder="Upload atau tempel URL gambar"
        resetSignal={resetKey}
      />
      <input
        name="title"
        type="text"
        placeholder="Judul banner (opsional, cth. Bazar UMKM Kemayoran)"
        className={inputClass}
      />
      <input
        name="link"
        type="text"
        placeholder="Tautan (opsional, cth. /artikel/... atau URL lain)"
        className={inputClass}
      />
      <input
        name="sortOrder"
        type="number"
        defaultValue={0}
        placeholder="Urutan tampil (0 = pertama)"
        className={inputClass}
      />
      <button type="submit" className="btn-primary text-sm py-2.5 px-5">
        <Icon name="plus" size={14} /> Tambah Banner
      </button>
      {message && (
        <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          {message}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </form>
  );
}