"use client";
import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/common/Icon";
import PaymentMethodPicker from "@/components/checkout/PaymentMethodPicker";
import ReceiptUploader from "@/components/checkout/ReceiptUploader";
import { createOrder } from "@/app/product/[id]/checkout/actions";

const inputClass =
  "w-full bg-cream-pure border border-cream-warm rounded-xl px-3 py-2.5 text-sm text-noir placeholder:text-muted focus:outline-none focus:border-forest/50 focus:ring-2 focus:ring-forest/10 transition-all";

export default function CheckoutForm({ product, seller, paymentMethods, userId }) {
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [receiptPath, setReceiptPath] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  const showPrice = product.showPrice !== false && product.price != null;
  const unitPrice = showPrice ? Number(product.price) : null;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await createOrder(fd);
      setDone(res);
    } catch (ex) {
      setError(ex.message || "Gagal membuat pesanan.");
    }
    setBusy(false);
  };

  if (done) {
    return (
      <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 border border-cream-warm text-center max-w-lg mx-auto">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <Icon name="check" size={26} />
        </div>
        <h2 className="text-lg font-bold text-noir mb-1">Pesanan Terkirim!</h2>
        <p className="text-sm text-warm-gray mb-2">
          Nomor pesanan:{" "}
          <span className="font-mono font-bold text-forest">{done.orderNumber}</span>
        </p>
        <p className="text-xs text-warm-gray leading-relaxed mb-5">
          Status pesanan: <strong>Menunggu Verifikasi</strong>. Penjual akan
          memeriksa bukti transfer Anda lalu memproses pesanan. Pantau lewat
          penjual (WhatsApp) atau hubungi toko untuk info lanjut.
        </p>
        <Link href={`/product/${product.id}`} className="btn-primary text-sm py-2.5 px-6">
          Kembali ke Produk
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-7 border border-cream-warm"
    >
      <input type="hidden" name="productId" value={product.id} />

      {/* Ringkasan produk */}
      <div className="flex items-center gap-3 border-b border-cream-warm pb-4 mb-5">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="w-14 h-14 rounded-xl object-cover border border-cream-warm shrink-0"
        />
        <div className="min-w-0">
          <div className="text-sm font-bold text-noir truncate">{product.name}</div>
          <div className="text-xs text-warm-gray truncate">{seller.name}</div>
          <div className="text-sm font-bold text-forest mt-0.5">
            {unitPrice != null ? `Rp${unitPrice.toLocaleString("id-ID")}` : "Hubungi penjual"}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-semibold text-noir mb-1">
            Jumlah *
          </label>
          <input
            name="quantity"
            type="number"
            min="1"
            max="999"
            defaultValue="1"
            required
            className={inputClass}
          />
        </div>
        <div className="sm:flex sm:items-end">
          <div className="sm:ml-auto sm:text-right w-full">
            <div className="text-[10px] uppercase tracking-wider text-warm-gray">
              Total
            </div>
            <div className="text-lg font-bold text-forest">
              {unitPrice != null
                ? `Rp${unitPrice.toLocaleString("id-ID")}`
                : "Hubungi penjual"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <input name="buyerName" placeholder="Nama pemesan *" required className={inputClass} />
        <input
          name="buyerPhone"
          type="tel"
          placeholder="No. WhatsApp (cth. 813xxxxxxx)"
          className={inputClass}
        />
        <div className="sm:col-span-2">
          <textarea
            name="buyerAddress"
            placeholder="Alamat pengiriman / alamat pemesan"
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </div>
        <div className="sm:col-span-2">
          <textarea
            name="notes"
            placeholder="Catatan untuk penjual (opsional)"
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      {/* Pilih metode pembayaran UMKM */}
      <div className="border-t border-cream-warm pt-4 mb-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-noir mb-3">
          <Icon name="money" size={16} className="text-forest" />
          Pilih Metode Pembayaran (UMKM ini)
        </h3>
        <PaymentMethodPicker
          methods={paymentMethods}
          value={paymentMethodId}
          onChange={setPaymentMethodId}
        />
        <input type="hidden" name="paymentMethodId" value={paymentMethodId} />
      </div>

      {/* Upload bukti transfer */}
      <div className="border-t border-cream-warm pt-4 mb-5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-noir mb-3">
          <Icon name="image" size={16} className="text-forest" />
          Bukti Transfer / Pembayaran *
        </h3>
        <ReceiptUploader userId={userId} value={receiptPath} onChange={setReceiptPath} />
        <input type="hidden" name="receiptPath" value={receiptPath} />
      </div>

      {error && (
        <p className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || !paymentMethodId || !receiptPath}
        className="btn-primary w-full text-sm md:text-base py-3 disabled:opacity-50"
      >
        {busy
          ? "Mengirim pesanan..."
          : "Buat Pesanan — Menunggu Verifikasi Penjual"}
      </button>
      <p className="text-[10px] text-warm-gray text-center mt-2">
        Pesanan hanya diproses penjual setelah bukti transfer Anda terverifikasi.
      </p>
    </form>
  );
}
