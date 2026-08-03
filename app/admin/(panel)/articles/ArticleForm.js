"use client";
import { useState } from "react";
import { saveArticle } from "../actions";
import ImageUploader from "@/components/common/ImageUploader";

const inputClass =
  "w-full bg-cream-pure border border-cream-warm rounded-xl px-3 py-2 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all";

export default function ArticleForm({ initial = null }) {
  const [message, setMessage] = useState("");

  return (
    <form
      action={async (formData) => {
        try {
          await saveArticle(formData);
          setMessage("Artikel disimpan.");
        } catch (e) {
          setMessage(e.message || "Gagal menyimpan.");
        }
      }}
      className="space-y-3"
    >
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <input
        name="title"
        defaultValue={initial?.title}
        placeholder="Judul artikel *"
        required
        className={inputClass}
      />
      <div className="grid sm:grid-cols-3 gap-3">
        <input
          name="slug"
          defaultValue={initial?.slug ?? ""}
          placeholder="Slug (kosongkan = otomatis)"
          className={inputClass}
        />
        <input
          name="author"
          defaultValue={initial?.author ?? "Tim Pengelola"}
          placeholder="Penulis"
          className={inputClass}
        />
        <input
          name="publishedAt"
          type="date"
          defaultValue={initial?.published_at ?? ""}
          className={inputClass}
        />
      </div>
      <ImageUploader
        name="image"
        label="Gambar Artikel"
        defaultValue={initial?.image ?? ""}
      />
      <textarea
        name="excerpt"
        defaultValue={initial?.excerpt ?? ""}
        placeholder="Ringkasan (opsional)"
        rows={2}
        className={`${inputClass} resize-none`}
      />
      <textarea
        name="content"
        defaultValue={initial?.content}
        placeholder="Isi artikel * (paragraf dipisah baris kosong)"
        required
        rows={10}
        className={`${inputClass} resize-y leading-relaxed`}
      />
      <label className="flex items-center gap-2 text-sm text-noir-soft">
        <input type="checkbox" name="published" defaultChecked={initial?.published ?? false} />
        Publikasikan di situs
      </label>

      <button type="submit" className="btn-primary text-sm py-2.5 px-5">
        {initial ? "Simpan Perubahan" : "Tambah Artikel"}
      </button>

      {message && (
        <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          {message}
        </p>
      )}
    </form>
  );
}
