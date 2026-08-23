"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/common/Icon";
import PhoneInput from "@/components/common/PhoneInput";
import { createWhatsAppOrder } from "@/app/product/[id]/checkout/actions";

const inputClass =
  "w-full bg-cream-pure border border-cream-warm rounded-xl px-3 py-2.5 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all";

const countries = [
  "Indonesia",
  "Malaysia",
  "Singapura",
  "Brunei Darussalam",
  "Thailand",
  "Filipina",
  "Australia",
  "Amerika Serikat",
  "Inggris Raya",
  "Negara lainnya",
];

function formatPrice(value) {
  return value == null
    ? "Harga dikonfirmasi via WhatsApp"
    : `Rp${Number(value).toLocaleString("id-ID")} (IDR)`;
}

export default function WhatsAppOrderForm({
  product,
  seller,
  defaultBuyerName = "",
  defaultBuyerPhone = "",
}) {
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  const showPrice = product.showPrice !== false && product.price != null;
  const unitPrice = showPrice ? Number(product.price) : null;
  const total = unitPrice != null ? unitPrice * quantity : null;

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const result = await createWhatsAppOrder(new FormData(event.currentTarget));
      setDone(result);
    } catch (exception) {
      setError(exception.message || "Pesanan belum dapat disimpan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <section className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 border border-cream-warm text-center max-w-xl mx-auto">
        <span className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <Icon name="check" size={26} />
        </span>
        <h2 className="text-lg md:text-xl font-bold text-noir mb-2">Pesanan sudah dicatat</h2>
        <p className="text-sm text-warm-gray leading-relaxed mb-2">
          Nomor pesanan Anda adalah{" "}
          <strong className="font-mono text-forest">{done.orderNumber}</strong>.
        </p>
        <p className="text-xs md:text-sm text-warm-gray leading-relaxed mb-5">
          Langkah berikutnya adalah mengirim pesan yang sudah disiapkan kepada {seller.name}.
          Penjual akan mengonfirmasi ketersediaan, ongkir, dan pembayaran lewat WhatsApp.
        </p>
        <a
          href={done.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-wa w-full text-sm md:text-base py-3"
        >
          <Icon name="whatsapp" size={18} /> Buka WhatsApp dan Kirim Pesan
        </a>
        <Link
          href={`/product/${product.id}`}
          className="inline-flex mt-4 text-xs md:text-sm font-semibold text-forest hover:underline"
        >
          Kembali ke detail produk
        </Link>
      </section>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-7 border border-cream-warm"
    >
      <input type="hidden" name="productId" value={product.id} />

      <div className="rounded-2xl bg-forest/5 border border-forest/15 p-3 md:p-4 mb-5">
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 shrink-0 rounded-xl bg-white text-forest border border-forest/15 flex items-center justify-center">
            <Icon name="whatsapp" size={18} />
          </span>
          <div>
            <h2 className="text-sm md:text-base font-bold text-noir">Pesan aman lewat WhatsApp</h2>
            <p className="text-xs text-warm-gray leading-relaxed mt-0.5">
              Data pesanan dicatat terlebih dahulu agar penjual dan admin dapat membantu Anda dengan jelas. Harga menggunakan Rupiah Indonesia (IDR).
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-b border-cream-warm pb-4 mb-5">
        <img
          src={product.images?.[0] || "/icon.png"}
          alt={product.name}
          className="w-14 h-14 rounded-xl object-cover border border-cream-warm shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-noir truncate">{product.name}</div>
          <div className="text-xs text-warm-gray truncate">{seller.name}</div>
          <div className="text-sm font-bold text-forest mt-0.5">{formatPrice(unitPrice)}</div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <label>
          <span className="block text-xs font-semibold text-noir mb-1">Jumlah *</span>
          <input
            name="quantity"
            type="number"
            min="1"
            max="999"
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
            required
            className={inputClass}
          />
        </label>
        <div className="rounded-xl border border-cream-warm bg-cream-pure px-3 py-2.5">
          <div className="text-[10px] uppercase tracking-wider text-warm-gray">Perkiraan total</div>
          <div className="text-base font-bold text-forest mt-0.5">{formatPrice(total)}</div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <label>
          <span className="block text-xs font-semibold text-noir mb-1">Nama pemesan *</span>
          <input
            name="buyerName"
            placeholder="Nama lengkap"
            defaultValue={defaultBuyerName}
            minLength={2}
            maxLength={120}
            required
            className={inputClass}
          />
        </label>
        <label>
          <span className="block text-xs font-semibold text-noir mb-1">Negara tujuan *</span>
          <input
            name="buyerCountry"
            list="shipping-countries"
            required
            defaultValue="Indonesia"
            placeholder="Pilih atau ketik negara"
            className={inputClass}
          />
          <datalist id="shipping-countries">
            {countries.map((country) => (
              <option key={country} value={country} />
            ))}
          </datalist>
        </label>
        <div className="sm:col-span-2">
          <span className="block text-xs font-semibold text-noir mb-1">Nomor WhatsApp *</span>
          <PhoneInput
            name="buyerPhone"
            defaultValue={defaultBuyerPhone}
            placeholder="Nomor tanpa 0 di depan"
            required
          />
          <p className="text-[11px] text-warm-gray mt-1">
            Pilih kode negara lalu isi nomor WhatsApp aktif Anda.
          </p>
        </div>
        <label className="sm:col-span-2">
          <span className="block text-xs font-semibold text-noir mb-1">Alamat pengiriman *</span>
          <textarea
            name="buyerAddress"
            rows={3}
            minLength={8}
            maxLength={600}
            placeholder="Tulis alamat lengkap, kota, kode pos, dan negara bila di luar Indonesia"
            required
            className={`${inputClass} resize-y`}
          />
        </label>
        <label className="sm:col-span-2">
          <span className="block text-xs font-semibold text-noir mb-1">Catatan untuk penjual <span className="font-normal text-warm-gray">(opsional)</span></span>
          <textarea
            name="notes"
            rows={2}
            maxLength={800}
            placeholder="Contoh: warna, ukuran, waktu pengiriman, atau pertanyaan khusus"
            className={`${inputClass} resize-y`}
          />
        </label>
      </div>

      {error && (
        <p className="mb-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn-wa w-full text-sm md:text-base py-3 disabled:opacity-50">
        <Icon name="whatsapp" size={18} />
        {busy ? "Mencatat pesanan..." : "Catat Pesanan & Lanjutkan ke WhatsApp"}
      </button>
      <p className="text-[11px] text-warm-gray text-center leading-relaxed mt-2.5">
        Dengan melanjutkan, Anda menyetujui data kontak dan pesanan ini dibagikan kepada penjual terkait serta admin E-CATALOG untuk membantu proses pesanan.
      </p>
    </form>
  );
}
