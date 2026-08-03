"use client";
import { useState } from "react";
import { compressImage } from "@/lib/compressImage";
import { uploadImage } from "@/lib/github";

// Upload gambar -> kompres webp -> simpan di GitHub (raw URL disimpan di DB).
// Output berupa <textarea name={name}> berisi 1+ URL (pisahkan koma).
export default function ImageUploader({
  name,
  label,
  defaultValue = "",
  placeholder = "Tempel URL gambar (bisa beberapa, pisahkan koma)",
  disabled = false,
}) {
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      const dataUrl = await compressImage(file);
      const base = file.name.replace(/\.[^.]+$/, "").slice(0, 40);
      const { url } = await uploadImage({ base64: dataUrl, name: base });
      setValue((prev) => (prev.trim() ? `${prev.trim()}, ${url}` : url));
    } catch (ex) {
      setErr(ex.message || "Gagal mengunggah gambar.");
    }
    setBusy(false);
    e.target.value = "";
  };

  const preview = value.split(",")[0]?.trim();

  return (
    <div>
      {label && (
        <div className="text-xs font-semibold text-noir mb-1.5">{label}</div>
      )}
      <label
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
          busy
            ? "bg-cream-warm text-warm-gray cursor-wait"
            : "bg-cream-warm text-noir-soft hover:bg-cream"
        }`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={onFile}
          disabled={busy || disabled}
          className="hidden"
        />
        {busy ? "Mengunggah & mengompres..." : "Upload Gambar (auto-kompres)"}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={2}
        disabled={disabled}
        className="w-full mt-2 bg-cream-pure border border-cream-warm rounded-xl px-3 py-2 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all resize-none"
      />
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="mt-2 h-24 w-24 object-cover rounded-xl border border-cream-warm"
        />
      )}
      {err && <p className="text-xs text-forest mt-1.5">{err}</p>}
    </div>
  );
}
