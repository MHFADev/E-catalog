"use client";

import { useEffect } from "react";
import Icon from "@/components/common/Icon";

const tones = {
  danger: {
    icon: "bg-red-100 text-red-700",
    button: "bg-red-600 hover:bg-red-700 focus-visible:ring-red-300",
  },
  warning: {
    icon: "bg-amber-100 text-amber-700",
    button: "bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-300",
  },
  success: {
    icon: "bg-emerald-100 text-emerald-700",
    button: "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-300",
  },
};

export default function ActionConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Ya, lanjutkan",
  cancelLabel = "Batal",
  icon = "info",
  tone = "danger",
  busy = false,
  onConfirm,
  onCancel,
  children,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !busy) onCancel?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, busy, onCancel]);

  if (!open) return null;

  const style = tones[tone] || tones.danger;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        aria-label="Tutup dialog"
        disabled={busy}
        onClick={onCancel}
        className="absolute inset-0 w-full h-full cursor-default bg-noir/55 backdrop-blur-sm"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl"
      >
        <div className="h-1.5 bg-gradient-to-r from-[#0A3A78] via-[#1686C8] to-[#F58220]" />
        <div className="p-5 md:p-6">
          <div className="flex items-start gap-3.5">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${style.icon}`}>
              <Icon name={icon} size={20} />
            </span>
            <div className="min-w-0">
              <h2 id="confirm-dialog-title" className="text-base font-bold text-noir leading-snug">
                {title}
              </h2>
              <p className="mt-1 text-xs md:text-sm leading-relaxed text-warm-gray">{description}</p>
            </div>
          </div>

          {children && <div className="mt-4">{children}</div>}

          <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={busy}
              onClick={onCancel}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-cream-warm bg-white px-4 py-2.5 text-xs font-bold text-noir-soft transition-all hover:bg-cream-pure focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon name="close" size={13} /> {cancelLabel}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onConfirm}
              className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-bold text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${style.button}`}
            >
              {busy ? (
                <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/50 border-t-white" /> Memproses...</>
              ) : (
                <><Icon name={icon} size={13} /> {confirmLabel}</>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
