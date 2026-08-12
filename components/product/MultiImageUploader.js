"use client";
import { useEffect, useState } from "react";
import Icon from "@/components/common/Icon";
import { compressImage } from "@/lib/compressImage";
import {
  BUCKET_PRODUCTS,
  dataUrlToBlob,
  publicImageUrl,
  sanitizeFileName,
  uploadToStorage,
  removeFromStorage,
} from "@/lib/storage";

// ============================================================
// Upload foto produk MULTIPLE ala marketplace (Tokopedia-like):
// pilih beberapa file -> kompres webp -> upload ke Supabase Storage
// (bucket catalog-images/products/<sellerId>/) -> preview grid
// dengan tombol hapus per foto. URL hasil ditulis sebagai hidden
// input <name={name}> (beberapa), dibaca server action via formData.getAll.
// ============================================================

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_LABEL = ".jpg, .jpeg, .png, .webp";
const MAX_FILES = 8;

// Extrak path storage dari public URL bucket catalog-images.
function pathFromPublicUrl(url) {
  const marker = `/object/public/${BUCKET_PRODUCTS}/`;
  const idx = url.indexOf(marker);
  return idx >= 0 ? url.slice(idx + marker.length) : null;
}

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

  const removeImage = async (url) => {
    const path = pathFromPublicUrl(url);
    setImages((prev) => prev.filter((u) => u !== url));
    if (path) {
      try {
        await removeFromStorage(BUCKET_PRODUCTS, path);
      } catch {
        // Gagal hapus dari storage tidak memblokir; DB sudah tanpa URL tsb.
      }
    }
  };

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    if (images.length + files.length > max) {
      setErr(`Maksimal ${max} foto per produk.`);
      return;
    }
    const bad = files.find((f) => !ALLOWED_TYPES.includes(f.type));
    if (bad) {
      setErr(`Format tidak didukung. Gunakan ${ALLOWED_LABEL}.`);
      return;
    }

    setBusy(true);
    setErr("");
    const uploaded = [];
    try {
      for (const file of files) {
        const dataUrl = await compressImage(file);
        const blob = dataUrlToBlob(dataUrl);
        const fileName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ""));
        const path = await uploadToStorage({
          bucket: BUCKET_PRODUCTS,
          folder: sellerId ? `products/${sellerId}` : "products",
          file: new File([blob], fileName, { type: blob.type }),
        });
        uploaded.push(publicImageUrl(path));
      }
      addImages(uploaded);
    } catch (ex) {
      setErr(ex.message || "Gagal mengunggah foto.");
    }
    setBusy(false);
  };

  return (
    <div>
      {label && (
        <div className="text-xs font-semibold text-noir mb-1.5">{label}</div>
      )}

      {/* Grid foto + tombol hapus per foto */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-3">
          {images.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative aspect-square rounded-xl overflow-hidden border border-cream-warm bg-cream-warm group"
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                aria-label="Hapus foto"
                className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-600 transition-all"
              >
                <Icon name="close" size={12} />
              </button>
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/50 text-white text-[9px] font-semibold">
                {i + 1}
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

      {/* Hidden inputs: dibaca server action via formData.getAll(name) */}
      {images.map((url, i) => (
        <input key={`${url}-${i}`} type="hidden" name={name} value={url} />
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
        webp &amp; disimpan di Supabase Storage.
      </span>

      {err && <p className="text-xs text-forest mt-1.5">{err}</p>}
    </div>
  );
}
