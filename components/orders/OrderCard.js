"use client";
import { useState } from "react";
import Icon from "@/components/common/Icon";
import { processOrder, rejectOrder, completeOrder } from "@/app/seller/(panel)/orders/actions";

// ============================================================
// Kartu pesanan untuk penjual. Saat status 'Menunggu Verifikasi',
// menampilkan PERINGATAN KEAMANAN yang mencolok + bukti transfer
// pembeli + dua tombol: "Verifikasi & Proses" / "Tolak (Dana Tidak Masuk)".
// ============================================================

export const ORDER_STATUS = {
  menunggu_verifikasi: { label: "Menunggu Verifikasi", cls: "bg-amber-100 text-amber-700" },
  diproses: { label: "Diproses", cls: "bg-sky-100 text-sky-700" },
  selesai: { label: "Selesai", cls: "bg-emerald-100 text-emerald-700" },
  ditolak: { label: "Ditolak", cls: "bg-red-100 text-red-700" },
  dibatalkan: { label: "Dibatalkan", cls: "bg-gray-100 text-gray-600" },
};

const WARNING_TEXT =
  "⚠️ PERINGATAN KEAMANAN: Jangan langsung memproses pesanan. Selalu cek mutasi rekening atau aplikasi e-wallet Anda untuk memastikan dana BENAR-BENAR sudah masuk. Waspada bukti transfer palsu atau editan!";

function fmtDate(iso) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(n) {
  return n != null ? `Rp${Number(n).toLocaleString("id-ID")}` : "Hubungi penjual";
}

export default function OrderCard({ order }) {
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [showReject, setShowReject] = useState(false);

  const status = ORDER_STATUS[order.status] || ORDER_STATUS.dibatalkan;
  const pending = order.status === "menunggu_verifikasi";
  const processing = order.status === "diproses";
  const pay = order.payment_methods;
  const product = order.products;

  return (
    <div className="bg-white rounded-2xl border border-cream-warm overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 md:px-5 py-3 border-b border-cream-warm bg-cream-pure/60">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-xs md:text-sm font-bold text-noir truncate">
            {order.order_number}
          </span>
          <span className="text-[10px] md:text-xs text-warm-gray shrink-0">
            {fmtDate(order.created_at)}
          </span>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold ${
            status.cls
          }`}
        >
          {status.label}
        </span>
      </div>

      <div className="grid md:grid-cols-[1fr_auto] gap-4 md:gap-6 p-4 md:p-5">
        {/* Info pesanan & pembeli */}
        <div className="min-w-0 space-y-2 text-xs md:text-sm">
          <div className="flex items-start gap-3">
            {product?.images?.[0] && (
              <img
                src={product.images[0]}
                alt={product?.name || "Produk"}
                className="w-12 h-12 rounded-xl object-cover border border-cream-warm shrink-0"
              />
            )}
            <div className="min-w-0">
              <div className="font-semibold text-noir truncate">
                {product?.name || "Produk"}
              </div>
              <div className="text-warm-gray">
                {order.quantity} pcs • {formatMoney(order.total)}
              </div>
            </div>
          </div>

          <div className="border-t border-cream-warm pt-2 text-warm-gray leading-relaxed">
            <div>
              <span className="font-semibold text-noir">Pemesan:</span>{" "}
              {order.buyer_name}
            </div>
            {order.buyer_phone && <div>📱 {order.buyer_phone}</div>}
            {order.buyer_address && <div>📍 {order.buyer_address}</div>}
            {order.notes && (
              <div className="italic">“{order.notes}”</div>
            )}
            {pay && (
              <div className="mt-1">
                <span className="font-semibold text-noir">Bayar via:</span>{" "}
                {pay.label || pay.method_type}
                {pay.account_number ? ` (${pay.account_number})` : ""}
              </div>
            )}
            {order.status === "ditolak" && order.rejection_reason && (
              <div className="mt-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                Alasan tolak: {order.rejection_reason}
              </div>
            )}
          </div>
        </div>

        {/* Bukti transfer + aksi (khusus menunggu verifikasi) */}
        {pending && (
          <div className="md:w-[320px] space-y-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-noir mb-2">
                <Icon name="image" size={14} className="text-forest" />
                Bukti Transfer Pembeli
              </div>
              {order.receipt_path ? (
                <img
                  src={`/api/orders/${order.id}/receipt`}
                  alt="Bukti transfer pembeli"
                  className="w-full max-w-[280px] aspect-[3/4] object-contain bg-cream-warm rounded-xl border border-cream-warm"
                />
              ) : (
                <div className="text-[11px] text-warm-gray bg-cream-warm rounded-xl px-3 py-4 text-center">
                  Tidak ada bukti transfer diunggah.
                </div>
              )}
            </div>

            {/* Peringatan keamanan anti-fraud (WAJIB tampil) */}
            <div className="bg-red-600 text-white rounded-xl p-3 md:p-4 text-[11px] md:text-xs font-semibold leading-relaxed shadow-lg ring-2 ring-red-600 ring-offset-2">
              {WARNING_TEXT}
            </div>

            {/* Aksi verifikasi */}
            <div className="space-y-2">
              <form
                action={async (fd) => {
                  setBusy("process");
                  setErr("");
                  try {
                    await processOrder(fd);
                  } catch (e) {
                    setErr(e.message || "Gagal memproses.");
                  }
                  setBusy("");
                }}
              >
                <input type="hidden" name="id" value={order.id} />
                <button
                  type="submit"
                  disabled={busy === "process"}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold transition-all"
                >
                  {busy === "process" ? (
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <Icon name="check" size={16} />
                  )}
                  Verifikasi &amp; Proses
                </button>
              </form>

              {showReject ? (
                <form
                  action={async (fd) => {
                    setBusy("reject");
                    setErr("");
                    try {
                      await rejectOrder(fd);
                    } catch (e) {
                      setErr(e.message || "Gagal menolak.");
                    }
                    setBusy("");
                  }}
                  className="space-y-2"
                >
                  <input type="hidden" name="id" value={order.id} />
                  <input
                    name="reason"
                    placeholder="Alasan penolakan (opsional, mis. dana belum masuk)"
                    className="w-full bg-cream-pure border border-cream-warm rounded-xl px-3 py-2 text-xs text-noir placeholder:text-muted focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={busy === "reject"}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-bold transition-all"
                    >
                      {busy === "reject" ? "Menolak..." : "Konfirmasi Tolak"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReject(false)}
                      className="px-3 py-2.5 rounded-xl bg-cream-warm text-noir-soft text-xs font-semibold"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowReject(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all"
                >
                  <Icon name="ban" size={16} />
                  Tolak (Dana Tidak Masuk)
                </button>
              )}
            </div>
          </div>
        )}

        {/* Aksi selesai */}
        {processing && (
          <div className="md:w-[220px] flex flex-col justify-center">
            <form
              action={async (fd) => {
                setBusy("complete");
                setErr("");
                try {
                  await completeOrder(fd);
                } catch (e) {
                  setErr(e.message || "Gagal.");
                }
                setBusy("");
              }}
            >
              <input type="hidden" name="id" value={order.id} />
              <button
                type="submit"
                disabled={busy === "complete"}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-forest hover:bg-forest-deep disabled:opacity-60 text-white text-sm font-bold transition-all"
              >
                Tandai Selesai
              </button>
            </form>
          </div>
        )}
      </div>

      {err && (
        <p className="px-4 pb-3 text-xs text-red-600">{err}</p>
      )}
    </div>
  );
}