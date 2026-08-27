"use client";
import PaymentLogo from "@/components/common/PaymentLogo";
import { publicImageUrl } from "@/lib/storage";

// ============================================================
// Pemilih metode pembayaran UMKM saat checkout.
// Menampilkan LOGO RESMI provider + nomor rekening/e-wallet atau
// gambar QRIS milik toko, lalu mengembalikan id metode terpilih
// via <input hidden name="paymentMethodId">.
// ============================================================

const typeLabel = {
  bank: "Transfer Bank",
  ewallet: "E-Wallet",
  qris: "QRIS",
};

export default function PaymentMethodPicker({ methods = [], value, onChange }) {
  if (!methods.length) {
    return (
      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        Toko ini belum menambahkan metode pembayaran. Hubungi penjual via
        WhatsApp untuk bertransaksi.
      </div>
    );
  }

  const selected = methods.find((m) => m.id === value) || null;

  return (
    <div className="space-y-2">
      <div className="grid sm:grid-cols-2 gap-2">
        {methods.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            aria-pressed={m.id === value}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${
              m.id === value
                ? "border-forest bg-forest/5 ring-2 ring-forest/20"
                : "border-cream-warm bg-white hover:border-forest/40"
            }`}
          >
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <PaymentLogo
                  methodName={m.label || m.provider}
                  methodType={m.methodType}
                  imgClassName="h-5 w-auto object-contain shrink-0"
                  iconSize={16}
                />
                <span className="text-xs font-semibold text-noir truncate">
                  {m.label || typeLabel[m.methodType] || m.methodType}
                </span>
              </span>
              <span className="block text-[10px] text-warm-gray truncate mt-0.5">
                {m.methodType === "qris" ? "Scan QRIS" : m.accountNumber}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Detail metode terpilih: logo besar + nomor rekening / e-wallet atau QRIS */}
      {selected && (
        <div className="bg-white border border-forest/20 rounded-2xl p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <PaymentLogo
              methodName={selected.label || selected.provider}
              methodType={selected.methodType}
              imgClassName="h-9 w-auto object-contain shrink-0"
              iconSize={24}
            />
            <div>
              <div className="text-sm font-bold text-noir">
                {selected.label || typeLabel[selected.methodType]}
              </div>
              <div className="text-[10px] text-warm-gray">
                Metode pembayaran {typeLabel[selected.methodType]?.toLowerCase()}
              </div>
            </div>
          </div>

          {selected.methodType === "qris" ? (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {selected.qrisImageUrl && (
                <img
                  src={publicImageUrl(selected.qrisImageUrl)}
                  alt="QRIS"
                  className="w-36 h-36 aspect-square object-cover rounded-xl border border-cream-warm bg-white"
                />
              )}
              <div className="text-center sm:text-left">
                <p className="text-xs text-warm-gray mt-1 leading-relaxed">
                  Scan kode QR di samping menggunakan aplikasi e-wallet / m-banking.
                  Setelah bayar, <strong>upload bukti transfer</strong> di bawah.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="text-base font-bold font-mono text-forest mt-1">
                  {selected.accountNumber}
                </div>
                {selected.accountName && (
                  <div className="text-[11px] text-warm-gray mt-0.5">
                    a.n. {selected.accountName}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(selected.accountNumber || "")}
                className="text-[11px] font-semibold text-forest bg-forest/10 hover:bg-forest/15 rounded-full px-3 py-1.5 transition-all"
              >
                Salin Nomor
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
