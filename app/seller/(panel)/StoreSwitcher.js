"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/common/Icon";
import { selectActiveSellerStore } from "./store-actions";

export default function StoreSwitcher({ stores = [], activeSellerId }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (stores.length < 2) return null;

  const selectStore = async (event) => {
    const sellerId = event.target.value;
    if (!sellerId || sellerId === activeSellerId) return;
    setBusy(true);
    setError("");
    try {
      await selectActiveSellerStore(sellerId);
      router.refresh();
    } catch (exception) {
      setError(exception.message || "Toko belum dapat dipilih.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-w-0">
      <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide font-bold text-warm-gray mb-1">
        <Icon name="store" size={13} /> Toko aktif
      </label>
      <select
        value={activeSellerId || ""}
        onChange={selectStore}
        disabled={busy}
        className="max-w-[220px] bg-white border border-cream-warm rounded-xl px-3 py-2 text-xs font-semibold text-noir focus:outline-none focus:ring-2 focus:ring-forest/15 disabled:opacity-60"
        aria-label="Pilih toko aktif"
      >
        {stores.map((store) => (
          <option key={store.id} value={store.id}>{store.name}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-[10px] text-red-700" role="alert">{error}</p>}
    </div>
  );
}
