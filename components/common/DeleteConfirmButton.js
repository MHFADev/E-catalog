"use client";

import { useState, useTransition } from "react";
import Icon from "@/components/common/Icon";
import ActionConfirmDialog from "@/components/common/ActionConfirmDialog";

export default function DeleteConfirmButton({
  action,
  id,
  entityLabel = "data ini",
  description,
  className = "",
  label = "Hapus",
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function confirmDelete() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", id);
      setError("");
      try {
        await action(formData);
        setOpen(false);
      } catch (exception) {
        setError(exception.message || "Data belum dapat dihapus. Coba lagi.");
      }
    });
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
        className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-700 ring-1 ring-inset ring-red-200 transition-all hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        <Icon name="trashFilled" size={12} /> {isPending ? "Menghapus..." : label}
      </button>
      {error && <span className="max-w-48 text-right text-[10px] text-red-700" role="alert">{error}</span>}
      <ActionConfirmDialog
        open={open}
        title={`Hapus ${entityLabel}?`}
        description={description || `${entityLabel} akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel={`Ya, hapus ${entityLabel}`}
        icon="trashFilled"
        tone="danger"
        busy={isPending}
        onCancel={() => !isPending && setOpen(false)}
        onConfirm={confirmDelete}
      />
    </span>
  );
}
