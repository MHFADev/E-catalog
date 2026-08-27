"use client";
import { useState } from "react";
import Icon from "@/components/common/Icon";
import { saveSellerLocation } from "@/app/seller/actions";

const inputClass =
  "w-full bg-cream-pure border border-cream-warm rounded-xl px-3 py-2.5 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all";

export default function SellerLocationForm({ seller }) {
  // Terima format DB (location_lat/lng) maupun format objek (location.lat/lng)
  const latInit = seller?.location?.lat ?? seller?.location_lat;
  const lngInit = seller?.location?.lng ?? seller?.location_lng;
  const [lat, setLat] = useState(latInit != null ? String(latInit) : "");
  const [lng, setLng] = useState(lngInit != null ? String(lngInit) : "");
  const [address, setAddress] = useState(seller.address || "");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [locating, setLocating] = useState(false);

  const locate = () => {
    setError("");
    if (!navigator.geolocation) {
      setError("Browser tidak mendukung geolokasi. Isi koordinat manual.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError("Gagal mengambil lokasi. Pastikan izin lokasi diaktifkan.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("saving");
    try {
      const fd = new FormData(e.target);
      await saveSellerLocation(fd);
      setStatus("saved");
      setTimeout(() => setStatus(""), 4000);
    } catch (err) {
      setStatus("");
      setError(
        err.message ||
          "Gagal menyimpan lokasi. Pastikan kolom location_lat & location_lng sudah ada di tabel sellers (lihat panduan).",
      );
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] md:text-xs font-semibold text-noir mb-1">
            Latitude
          </label>
          <input
            name="lat"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="-6.4038"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-[10px] md:text-xs font-semibold text-noir mb-1">
            Longitude
          </label>
          <input
            name="lng"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="106.8680"
            required
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="block text-[10px] md:text-xs font-semibold text-noir mb-1">
          Alamat Lengkap
        </label>
        <input
          name="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Jl. ... RT/RW ... Kemayoran"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <button
          type="button"
          onClick={locate}
          disabled={locating}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-laut/10 text-laut text-xs md:text-sm font-semibold hover:bg-laut/20 transition-all disabled:opacity-60"
        >
          <Icon name="navigation" size={15} />
          {locating ? "Mencari lokasi..." : "Ambil Lokasi Saya"}
        </button>
        <button
          type="submit"
          disabled={status === "saving"}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest text-white text-xs md:text-sm font-bold hover:bg-forest-deep transition-all disabled:opacity-60"
        >
          <Icon name="check" size={15} />
          {status === "saving" ? "Menyimpan..." : "Simpan Lokasi"}
        </button>
      </div>

      {status === "saved" && (
        <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          Lokasi tersimpan! Pin toko Anda kini tampil di peta katalog.
        </p>
      )}
      {error && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </form>
  );
}
