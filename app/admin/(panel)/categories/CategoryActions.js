"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCategory } from "../actions";
import ActionConfirmDialog from "@/components/common/ActionConfirmDialog";

export default function CategoryActions({ categoryId }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      setError("");
      const formData = new FormData();
      formData.set("id", categoryId);

      try {
        await deleteCategory(formData);
        setDeleteOpen(false);
        router.refresh();
      } catch (deleteError) {
        setError(deleteError?.message || "Kategori gagal dihapus.");
      }
    });
  };

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        <Link
          href={`/admin/categories/${categoryId}`}
          className="px-3 py-1.5 text-xs font-semibold rounded-full bg-cream-warm text-noir-soft hover:bg-cream transition-all"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          disabled={isPending}
          className="px-3 py-1.5 text-xs font-semibold rounded-full bg-red-50 text-red-700 hover:bg-red-100 transition-all disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Menghapus..." : "Hapus"}
        </button>
      </div>
      {error && <p className="mt-2 text-[11px] leading-relaxed text-red-700" role="alert">{error}</p>}
      <ActionConfirmDialog
        open={deleteOpen}
        title="Hapus kategori ini?"
        description="Kategori akan dihapus bila sudah tidak dipakai oleh produk. Pindahkan atau hapus produk terkait terlebih dahulu bila sistem menolaknya."
        confirmLabel="Ya, hapus kategori"
        icon="trashFilled"
        tone="danger"
        busy={isPending}
        onCancel={() => !isPending && setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
