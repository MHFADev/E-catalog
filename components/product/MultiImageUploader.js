"use client";
import { useEffect, useState } from "react";
import Icon from "@/components/common/Icon";
import { compressImage } from "@/lib/compressImage";
import { uploadPublicImage } from "@/lib/publicImageUpload";

// ============================================================
// Upload foto produk multiple. File dikompres menjadi WebP di browser,
// lalu dikirim ke Server Action yang menyimpan aset publik di GitHub.
// Database hanya menyimpan URL gambar, bukan berkas gambar.
// ============================================================

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_LABEL = ".jpg, .jpeg, .png, .webp";
const MAX_FILES = 8;

export default function MultiImageUploader({
  name,
  label = "Foto Produk",
  sellerId,
  defaultImages = [],
  resetSignal = 0,
  max = MAX_FILES,
}) {
  const [images, setImages] = useState(defaultImages || []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setImages(defaultImages || []);
    setErr("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  const addImages = (urls) => setImages((prev) => [...prev, ...urls].slice(0, max));

  const removeImage = (url) => {
    // File publik di GitHub dibiarkan sebagai arsip aset. Menghapusnya di sini
    // hanya menghapus relasi gambar dari produk agar perubahan form tetap aman.
    setImages((prev) => prev.filter((item) => item !== url));
  };

  const onFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    if (images.length + files.length > max) {
      setErr(`Maksimal ${max} foto per produk.`);
      return;
    }
    const invalidFile = files.find((file) => !ALLOWED_TYPES.includes(file.type));
    if (invalidFile) {
      setErr(`Format tidak didukung. Gunakan ${ALLOWED_LABEL}.`);
      return;
    }

    setBusy(true);
    setErr("");
    const uploaded = [];
    try {
      for (const file of files) {
        const base64 = await compressImage(file);
        const prefix = sellerId ? `produk-${sellerId}` : "produk";
        const { url } = await uploadPublicImage(
          base64,
          `${prefix}-${file.name.replace(/\.[^.]+$/, "")}`,
        );
        if (!url) throw new Error("URL foto dari GitHub tidak tersedia.");
        uploaded.push(url);
      }
      addImages(uploaded);
    } catch (exception) {
      if (uploaded.length) addImages(uploaded);
      const prefix = uploaded.length
        ? `${uploaded.length} foto berhasil diunggah. `
        : "";
      setErr(`${prefix}${exception.message || "Gagal mengunggah foto."}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {label && (
        <div className="text-xs font-semibold text-noir mb-1.5">{label}</div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-3">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative aspect-square rounded-xl overflow-hidden border border-cream-warm bg-cream-warm group"
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                aria-label="Hapus foto dari produk"
                className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-600 transition-all"
              >
                <Icon name="close" size={12} />
              </button>
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/50 text-white text-[9px] font-semibold">
                {index + 1}
              </span>
            </div>
          ))}
          {busy && (
            <div className="aspect-square rounded-xl border border-dashed border-cream-warm flex items-center justify-center text-warm-gray">
              <span className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
            </div>
          )}
        </div>
      )}

      {images.map((url, index) => (
        <input key={`${url}-${index}`} type="hidden" name={name} value={url} />
      ))}

      <label
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
          busy
            ? "bg-cream-warm text-warm-gray cursor-wait"
            : "bg-cream-warm text-noir-soft hover:bg-cream"
        }`}
      >
        <input
          type="file"
          accept={`${ALLOWED_TYPES.join(",")},${ALLOWED_LABEL}`}
          onChange={onFiles}
          multiple
          disabled={busy || images.length >= max}
          className="hidden"
        />
        {busy ? (
          <>
            <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
            Mengunggah & mengompres...
          </>
        ) : (
          <>
            <Icon name="plus" size={14} /> Tambah Foto ({images.length}/{max})
          </>
        )}
      </label>
      <span className="block text-[10px] text-warm-gray mt-1">
        Bisa pilih banyak sekaligus. Format: {ALLOWED_LABEL} — foto diubah ke
        WebP dan disimpan di repository GitHub.
      </span>

      {err && <p className="text-xs text-red-700 mt-1.5" role="alert">{err}</p>}
    </div>
  );
}
