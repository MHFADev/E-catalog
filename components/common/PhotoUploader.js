"use client";
import { useState, useRef } from "react";
import Icon from "@/components/common/Icon";
import { compressImage } from "@/lib/compressImage";
import { uploadPublicImage } from "@/lib/publicImageUpload";

// Upload satu foto (profil / logo) -> kompres webp di browser -> simpan di
// GitHub -> kembalikan raw URL lewat onUploaded(). Persist ke DB dikerjakan
// oleh parent (server action).
export default function PhotoUploader({
  value,
  onUploaded,
  round = false,
  label = "Foto",
  buttonLabel = "Ubah Foto",
  hint,
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const inputRef = useRef(null);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      const dataUrl = await compressImage(file, 1200, 0.78);
      const base = file.name.replace(/\.[^.]+$/, "").slice(0, 40);
      const { url } = await uploadPublicImage(dataUrl, base);
      await onUploaded(url);
    } catch (ex) {
      setErr(ex.message || "Gagal mengunggah foto.");
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const shape = round ? "rounded-full" : "rounded-2xl";

  return (
    <div>
      {label && (
        <div className="text-xs font-semibold text-noir mb-1.5">{label}</div>
      )}
      <div className="flex items-center gap-3">
        <div
          className={`w-16 h-16 md:w-20 md:h-20 shrink-0 overflow-hidden bg-cream-warm flex items-center justify-center text-warm-gray ${shape}`}
        >
          {value ? (
            <img
              src={value}
              alt="Foto"
              className="w-full h-full object-cover"
            />
          ) : (
            <Icon name="camera" size={22} />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border cursor-pointer bg-cream-warm text-noir-soft hover:bg-cream transition-all w-fit">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              onChange={onFile}
              disabled={busy}
              className="hidden"
            />
            {busy ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Mengompres & unggah...
              </>
            ) : (
              <>
                <Icon name="camera" size={14} /> {buttonLabel}
              </>
            )}
          </label>
          <span className="text-[10px] text-warm-gray">JPG, PNG, atau WebP • maks. 10 MB{hint ? ` • ${hint}` : ""}</span>
          {err && <span className="text-[11px] text-red-700" role="alert">{err}</span>}
        </div>
      </div>
    </div>
  );
}