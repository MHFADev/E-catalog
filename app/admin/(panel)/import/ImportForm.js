"use client";

import { useMemo, useState } from "react";
import { importUmkmImageBatch, importUmkmManifest } from "./actions";

export default function ImportForm() {
  const [manifestText, setManifestText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [imageProgress, setImageProgress] = useState(null);
  const [imageFailures, setImageFailures] = useState([]);

  const summary = useMemo(() => {
    try {
      const parsed = manifestText ? JSON.parse(manifestText) : null;
      const stores = Array.isArray(parsed?.stores) ? parsed.stores : [];
      const products = stores.reduce((total, store) => total + (Array.isArray(store.products) ? store.products.length : 0), 0);
      const images = stores.reduce((total, store) => total + (Array.isArray(store.products) ? store.products.reduce((subtotal, product) => subtotal + (Array.isArray(product.sourceImages) ? product.sourceImages.length : 0), 0) : 0), 0);
      return stores.length ? { stores: stores.length, products, images } : null;
    } catch {
      return { invalid: true };
    }
  }, [manifestText]);

  const chooseFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1_500_000) {
      setError("Manifest terlalu besar. Batas impor adalah 1,5 MB.");
      return;
    }
    setError("");
    setResult(null);
    setManifestText(await file.text());
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);
    if (!manifestText) {
      setError("Pilih berkas manifest UMKM terlebih dahulu.");
      return;
    }
    setBusy(true);
    try {
      const imported = await importUmkmManifest(manifestText);
      setResult(imported);
      setImageProgress(null);
      setImageFailures([]);
    } catch (exception) {
      setError(exception.message || "Impor data UMKM belum berhasil.");
    } finally {
      setBusy(false);
    }
  };

  const importImages = async () => {
    const queue = result?.imageQueue || [];
    if (!queue.length) return;
    setImageBusy(true);
    setError("");
    setImageFailures([]);
    let completed = 0;
    let importedPhotos = 0;
    const failures = [];
    for (let index = 0; index < queue.length; index += 3) {
      const batch = queue.slice(index, index + 3);
      try {
        const response = await importUmkmImageBatch(batch);
        importedPhotos += response.imported.reduce((total, item) => total + item.count, 0);
        failures.push(...response.failures);
      } catch (exception) {
        failures.push({ reason: exception.message || "Batch foto belum dapat diproses." });
      }
      completed += batch.length;
      setImageProgress({ completed, total: queue.length, importedPhotos });
    }
    setImageFailures(failures);
    setImageBusy(false);
  };

  return (
    <div className="bg-white border border-cream-warm rounded-2xl md:rounded-3xl p-5 md:p-7 shadow-sm">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm font-bold text-noir">Manifest UMKM privat</label>
          <p className="mt-1 text-xs text-warm-gray leading-relaxed">
            Pilih berkas JSON yang dibuat dari spreadsheet. Data pemilik dan nomor kontak tidak disimpan ke repository.
          </p>
          <input
            type="file"
            accept="application/json,.json"
            onChange={chooseFile}
            className="mt-3 block w-full text-xs text-warm-gray file:mr-3 file:rounded-xl file:border-0 file:bg-sky-soft file:px-3 file:py-2 file:text-xs file:font-semibold file:text-ocean hover:file:bg-sky-soft/70"
          />
        </div>

        {summary && !summary.invalid && (
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-cream-pure border border-cream-warm p-3 text-center">
            <div><p className="text-lg font-bold text-noir">{summary.stores}</p><p className="text-[10px] uppercase tracking-wide text-warm-gray">UMKM</p></div>
            <div><p className="text-lg font-bold text-noir">{summary.products}</p><p className="text-[10px] uppercase tracking-wide text-warm-gray">Produk</p></div>
            <div><p className="text-lg font-bold text-noir">{summary.images}</p><p className="text-[10px] uppercase tracking-wide text-warm-gray">Foto antrean</p></div>
          </div>
        )}
        {summary?.invalid && <p className="text-xs text-red-700" role="alert">Format manifest tidak valid.</p>}

        <button type="submit" disabled={busy || summary?.invalid} className="btn-primary text-sm px-4 py-2.5 disabled:opacity-60">
          {busy ? "Membuat akun dan katalog..." : "Impor akun, toko, dan produk"}
        </button>
      </form>

      {error && <p className="mt-4 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5" role="alert">{error}</p>}
      {result && (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-bold">Data inti UMKM berhasil diimpor.</p>
          <p className="mt-1 text-xs leading-relaxed">
            {result.accounts.created} akun baru, {result.accounts.existing} akun yang sudah ada, {result.storesImported} toko, dan {result.productsImported} produk telah diproses. {result.imagesQueued} foto siap dipindahkan ke GitHub pada tahap berikutnya.
          </p>
          {result.invalidContacts?.length > 0 && (
            <p className="mt-2 text-xs leading-relaxed">Nomor tidak valid dan belum dibuatkan akun: {result.invalidContacts.join(", ")}.</p>
          )}
          {result.imageQueue?.length > 0 && (
            <div className="mt-4 border-t border-emerald-200 pt-4">
              <p className="text-xs leading-relaxed">Foto produk belum tersimpan di database; foto akan diunduh dari Drive lalu ditulis ke repository GitHub.</p>
              <button type="button" onClick={importImages} disabled={imageBusy} className="mt-3 rounded-xl bg-ocean px-3 py-2 text-xs font-bold text-white hover:bg-noir disabled:opacity-60">
                {imageBusy
                  ? `Memindahkan foto ${imageProgress?.completed || 0}/${imageProgress?.total || result.imageQueue.length}...`
                  : `Pindahkan ${result.imagesQueued} foto ke GitHub`}
              </button>
              {imageProgress && !imageBusy && <p className="mt-2 text-xs">Selesai memproses {imageProgress.completed}/{imageProgress.total} produk; {imageProgress.importedPhotos} foto berhasil ditambahkan.</p>}
              {imageFailures.length > 0 && <p className="mt-2 text-xs text-amber-800">{imageFailures.length} foto/produk perlu ditinjau ulang karena tautan Drive atau proses unggahnya gagal.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
