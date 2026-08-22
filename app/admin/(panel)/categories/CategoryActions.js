"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCategory } from "../actions";

export default function CategoryActions({ categoryId }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleDelete = () => {
    if (!window.confirm("Hapus kategori ini? Kategori yang masih dipakai produk tidak dapat dihapus.")) {
      return;
    }

    startTransition(async () => {
      setError("");
      const formData = new FormData();
      formData.set("id", categoryId);

      try {
        await deleteCategory(formData);
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
          onClick={handleDelete}
          disabled={isPending}
          className="px-3 py-1.5 text-xs font-semibold rounded-full bg-red-50 text-red-700 hover:bg-red-100 transition-all disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Menghapus..." : "Hapus"}
        </button>
      </div>
      {error && <p className="mt-2 text-[11px] leading-relaxed text-red-700">{error}</p>}
    </div>
  );
}
